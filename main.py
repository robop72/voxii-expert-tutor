__import__('pysqlite3')
import sys
sys.modules['sqlite3'] = sys.modules.pop('pysqlite3')

import os
import re
import json
import hashlib
import datetime
import asyncio
import logging
from collections import OrderedDict
from dotenv import load_dotenv

load_dotenv()  # loads .env for local dev; Cloud Run injects env vars directly

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    stream=sys.stdout,
)

from fastapi import FastAPI, HTTPException, Request, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt as jose_jwt
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from google.cloud import texttospeech
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_chroma import Chroma
from langchain_community.chat_message_histories import ChatMessageHistory, RedisChatMessageHistory
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage as _LCHuman, AIMessage as _LCAi
from build_prompt import build_system_prompt
from intake_classifier import derive_profile_from_questionnaire
from personalized_prompt import generate_personalized_prompt
from curriculum_authorities import get_db_state, get_info as get_curriculum_info
import knowledge_graph
import math_solver
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import tiktoken
from openai import OpenAI as OpenAIClient

# ── Rate limiter ───────────────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)

# ── FastAPI app ────────────────────────────────────────────────────────────────
app = FastAPI(title="Voxii Master Expert Tutor")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://llm-math-education.vercel.app",
        "https://voxii-expert-tutor.vercel.app",
        "https://voxxi-yr9-maths-tutor.vercel.app",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:5173",
    ],
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type", "Authorization"],
)

# ── Auth — Supabase JWT (ES256, production) or API_SECRET bearer (local dev) ───
_security = HTTPBearer()
_API_SECRET = os.environ.get("API_SECRET", "")

# Parse SUPABASE_JWKS env var (JSON string containing the public key set).
# The public key is safe to store in env — only the private key is sensitive.
_SUPABASE_JWK: dict | None = None
_jwks_raw = os.environ.get("SUPABASE_JWKS", "")
if _jwks_raw:
    try:
        _parsed = json.loads(_jwks_raw)
        _SUPABASE_JWK = _parsed["keys"][0] if "keys" in _parsed else _parsed
    except Exception as _e:
        print(f"[auth] Failed to parse SUPABASE_JWKS: {_e}")


async def verify_auth(creds: HTTPAuthorizationCredentials = Depends(_security)):
    token = creds.credentials
    # API_SECRET check first — allows dev/test bypass even when JWKS is configured
    if _API_SECRET and token == _API_SECRET:
        return {"sub": "dev"}
    if _SUPABASE_JWK:
        try:
            payload = jose_jwt.decode(
                token,
                _SUPABASE_JWK,
                algorithms=["ES256"],
                audience="authenticated",
            )
            return payload
        except JWTError as exc:
            raise HTTPException(status_code=401, detail=f"Invalid token: {exc}")
    raise HTTPException(status_code=500, detail="Server misconfiguration: no auth secret set.")


# ── ChromaDB + LLM ─────────────────────────────────────────────────────────────
vector_db = Chroma(
    persist_directory="./vcaa_json_index",
    embedding_function=OpenAIEmbeddings(),
    # TODO: upgrade embedding model to text-embedding-3-small on next re-index.
    # Requires rebuilding vcaa_json_index — do NOT change the model mid-index
    # as the query and stored embeddings must use the same model.
)

llm = ChatOpenAI(model_name="gpt-4o-mini", temperature=0.2, max_tokens=800)
llm_query_gen = ChatOpenAI(model_name="gpt-4o-mini", temperature=0.2, max_tokens=150)

# ── OpenAI client for Moderation API ──────────────────────────────────────────
_openai_client = OpenAIClient()

# ── Session history store ──────────────────────────────────────────────────────
# Uses Redis when REDIS_URL is set (production / staging), falls back to an
# in-memory LRU-capped OrderedDict for local dev without Redis configured.
MAX_SESSIONS = 500
MAX_TURNS = int(os.environ.get("MAX_TURNS", "30"))
SESSION_TTL_SECONDS = 30 * 24 * 60 * 60  # 30 days, matches frontend localStorage TTL

_REDIS_URL = os.environ.get("REDIS_URL", "")
history_store: OrderedDict = OrderedDict()  # used only when Redis is unavailable


def get_session_history(session_id: str) -> ChatMessageHistory:
    if _REDIS_URL:
        return RedisChatMessageHistory(
            session_id=session_id,
            url=_REDIS_URL,
            ttl=SESSION_TTL_SECONDS,
        )
    # In-memory fallback: LRU-evict oldest session when cap is reached
    if session_id in history_store:
        history_store.move_to_end(session_id)
        return history_store[session_id]
    history = ChatMessageHistory()
    history_store[session_id] = history
    if len(history_store) > MAX_SESSIONS:
        history_store.popitem(last=False)
    return history


# ── RAG settings ───────────────────────────────────────────────────────────────
_encoder = tiktoken.get_encoding("cl100k_base")
RAG_TOKEN_BUDGET = 3000
RAG_RELEVANCE_THRESHOLD = 0.70

# ── Server-side safety patterns — mirrors src/utils/safety.ts ─────────────────
_SERIOUS_RE = re.compile(
    r'\b(kill|hurt|harm)\s*(my|him|her|them)?self\b'
    r'|suicid(e|al)\b'
    r'|self[- ]?harm\b'
    r'|want to die\b'
    r'|wish I (was|were) dead\b'
    r'|cut (myself|my wrists?)\b'
    r'|\b(sexually|rape|molest)\b'
    r'|\bgrooming\b',
    re.IGNORECASE,
)
_CRISIS_RE = re.compile(
    r'\b(nobody|no[- ]?one) cares?\b'
    r'|hate my(self| life)\b'
    r"|I('m| am) being (bullied|abused|hurt)\b"
    r'|I feel (hopeless|worthless|alone|scared)\b'
    r"|\b(can't|cannot) (cope|go on|take it)\b",
    re.IGNORECASE,
)

_SERIOUS_RESPONSE = (
    "I can see you're going through something very difficult right now. "
    "Please reach out for help immediately:\n\n"
    "🆘 **If you are in immediate danger, call 000**\n\n"
    "- **Kids Helpline**: 1800 55 1800 (free, 24/7)\n"
    "- **Lifeline**: 13 11 14 (free, 24/7)\n"
    "- **Beyond Blue**: 1300 22 4636\n\n"
    "Please talk to a trusted adult — a parent, teacher, or school counsellor — as soon as you can. "
    "You deserve real support. 💙"
)
_CRISIS_RESPONSE = (
    "It sounds like things might be tough right now, and I want you to know that matters.\n\n"
    "Please talk to someone who can really help:\n"
    "- **Kids Helpline**: 1800 55 1800 (free, 24/7, for people under 25)\n"
    "- **Lifeline**: 13 11 14 (free, 24/7)\n"
    "- **Beyond Blue**: 1300 22 4636\n\n"
    "You can also talk to a parent, teacher, school counsellor, or another trusted adult. 💙"
)

# ── Profile validation / prompt-injection defence ──────────────────────────────
_VALID_TONES = {"Warm", "Balanced", "Formal"}
_VALID_GUIDANCE = {"Socratic", "Mixed", "Full Explanations"}
_NAME_RE = re.compile(r"^[A-Za-z\s'\-]{1,50}$")


def sanitise_profile(profile: dict) -> dict:
    """Validate and sanitise student_profile fields before prompt interpolation."""
    profile = dict(profile)
    name = str(profile.get("student_name", "")).strip()
    profile["student_name"] = name[:50] if name and _NAME_RE.match(name) else "Student"
    if profile.get("engagement_tone") not in _VALID_TONES:
        raise HTTPException(status_code=400, detail="Invalid engagement_tone value.")
    if profile.get("guidance_preference") not in _VALID_GUIDANCE:
        raise HTTPException(status_code=400, detail="Invalid guidance_preference value.")
    return profile


# ── Dev logging helpers (will move to Supabase CONTENT_FLAGS / consents tables) ─
_FLAG_LOG = "flagged_responses.jsonl"
_CONSENT_LOG = "consents.jsonl"
_TTS_LOG = "tts_usage.jsonl"


def _append_log(path: str, entry: dict) -> None:
    try:
        with open(path, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry) + "\n")
    except Exception as exc:
        print(f"[log] failed to write {path}: {exc}")


def log_flagged(session_id: str, categories: dict) -> None:
    # Note: flagged message content is NOT logged — only metadata.
    _append_log(_FLAG_LOG, {
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "session_id": session_id,
        "categories": categories,
    })


def log_consent(
    parent_email: str,
    ip: str,
    consent_version: str = "1.0",
    parent_name: Optional[str] = None,
    parent_mobile: Optional[str] = None,
) -> None:
    # Raw PII is never stored — only SHA-256 hashes for auditability.
    entry: dict = {
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "consent_version": consent_version,
        "ip": ip,
        "parent_email_sha256": hashlib.sha256(parent_email.lower().strip().encode()).hexdigest(),
    }
    if parent_name:
        entry["parent_name_sha256"] = hashlib.sha256(parent_name.lower().strip().encode()).hexdigest()
    if parent_mobile:
        entry["parent_mobile_sha256"] = hashlib.sha256(parent_mobile.strip().encode()).hexdigest()
    _append_log(_CONSENT_LOG, entry)


def log_tts(session_id: Optional[str], char_count: int) -> None:
    # Text content is NOT logged — only character count for cost tracking.
    _append_log(_TTS_LOG, {
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "session_id": session_id or "unknown",
        "char_count": char_count,
    })


# ── Data models ────────────────────────────────────────────────────────────────
class SubjectPerformance(BaseModel):
    grade: Optional[str] = None
    struggles_significantly: bool = False
    low_confidence: bool = False
    receives_extension: bool = False
    highly_motivated: bool = False


class IntakeRequest(BaseModel):
    student_name: str = ""
    year_level: int
    state_curriculum: str
    primary_goals: List[str] = []
    selected_subjects: List[str] = []
    subject_performance: Dict[str, SubjectPerformance] = {}
    guidance_preference: str = "Mixed"
    engagement_tone: str = "Warm"
    focus_limit_minutes: int = 20
    tts_enabled: bool = True
    parent_name: Optional[str] = None
    parent_email: Optional[str] = None
    parent_mobile: Optional[str] = None
    consent_given: bool = False


class ChatRequest(BaseModel):
    session_id: str
    message: str
    year_level: str
    subject: str
    is_naplan_mode: bool = False
    student_profile: Optional[Dict[str, Any]] = None
    session_context: Optional[List[str]] = None  # recent session summaries for continuity
    profile_id: Optional[str] = None  # stable per-student UUID for knowledge graph


class SummariseRequest(BaseModel):
    session_id: str
    messages: List[Dict[str, str]]  # [{role: "user"|"tutor", text: "..."}]
    subject: str
    year_level: str


class TTSRequest(BaseModel):
    text: str
    session_id: Optional[str] = None


# ── Endpoints ──────────────────────────────────────────────────────────────────

@app.post("/intake")
@limiter.limit("10/minute")
async def intake(request: Request, body: IntakeRequest, _=Depends(verify_auth)):
    if not body.consent_given:
        raise HTTPException(status_code=400, detail="Parental consent is required.")
    if body.parent_email:
        client_ip = request.client.host if request.client else "unknown"
        log_consent(
            body.parent_email,
            client_ip,
            parent_name=body.parent_name,
            parent_mobile=body.parent_mobile,
        )
    raw = body.model_dump()
    raw["subject_performance"] = {
        subj: perf.model_dump() for subj, perf in body.subject_performance.items()
    }
    profile = derive_profile_from_questionnaire(raw)
    return profile


@app.get("/")
async def root():
    return {
        "status": "Voxii Master Expert Backend Online",
        "tier": "Master (Multi-Query + CoT + Strict LaTeX + Imagery)",
        "database_synced": os.path.exists("./vcaa_json_index"),
    }


_TTS_STRIP = re.compile(
    r'\[Graph:[^\]]*\]|\[Diagram:[^\]]*\]|\[Image of [^\]]*\]'
    r'|\$\$[\s\S]+?\$\$|\$[^$\n]+\$'
    r'|```[\s\S]+?```'
    r'|[*_#`]',
    re.IGNORECASE,
)


@app.post("/tts")
@limiter.limit("10/minute")
async def tts(request: Request, body: TTSRequest, _=Depends(verify_auth)):
    clean = _TTS_STRIP.sub(' ', body.text)
    clean = re.sub(r'\s+', ' ', clean).strip()[:4000]
    log_tts(body.session_id, len(clean))
    tts_client = texttospeech.TextToSpeechClient()
    synthesis_input = texttospeech.SynthesisInput(text=clean)
    voice = texttospeech.VoiceSelectionParams(language_code="en-AU", name="en-AU-Standard-A")
    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3,
        speaking_rate=0.95,
    )
    tts_response = tts_client.synthesize_speech(
        input=synthesis_input, voice=voice, audio_config=audio_config
    )
    return Response(content=tts_response.audio_content, media_type="audio/mpeg")


@app.post("/summarise")
@limiter.limit("30/minute")
async def summarise_session(request: Request, body: SummariseRequest, _=Depends(verify_auth)):
    if not body.messages:
        return {"summary": ""}

    convo = "\n".join(
        f'{"Student" if m.get("role") == "user" else "Tutor"}: {m.get("text", "")}'
        for m in body.messages[-20:]
    )

    from langchain_core.messages import HumanMessage as _HumanMessage
    prompt = (
        f"You are reviewing a {body.year_level} {body.subject} tutoring session. "
        f"Write a 2-3 sentence internal note for the AI tutor to read before the NEXT session with this student. "
        f"Cover: (1) what topics/problems were worked on, (2) what the student understood well or made progress on, "
        f"(3) any specific concepts or steps the student found difficult — be precise (e.g. 'expanding double brackets' not just 'algebra'). "
        f"Write in third person. Do not include the student's name. Keep it under 80 words.\n\n"
        f"Session transcript:\n{convo}\n\nInternal note:"
    )
    result = llm.invoke([_HumanMessage(content=prompt)])
    return {"summary": result.content.strip()}


@app.post("/chat")
@limiter.limit("20/minute")
async def chat(request: Request, body: ChatRequest, background_tasks: BackgroundTasks, auth: dict = Depends(verify_auth)):
    # ── Server-side safety gate (authoritative — cannot be bypassed by clients) ──
    if _SERIOUS_RE.search(body.message):
        return {"response": _SERIOUS_RESPONSE}
    if _CRISIS_RE.search(body.message):
        return {"response": _CRISIS_RESPONSE}

    # ── Knowledge graph: derive stable per-student ID ──────────────────────────
    sub = auth.get("sub", "")
    profile_id = body.profile_id or ""
    student_id = f"{sub}__{profile_id}" if sub and sub != "dev" and profile_id else sub

    history = get_session_history(body.session_id)

    # ── Backend MAX_TURNS enforcement ──────────────────────────────────────────
    if len(history.messages) >= MAX_TURNS * 2:
        return {"response": "We've reached the end of our session — well done! Please start a new chat to keep going. 😊"}

    # ── Subject & year normalisation ───────────────────────────────────────────
    sub_map = {
        "maths": "Mathematics", "mathematics": "Mathematics",
        "science": "Science", "english": "English",
    }
    clean_sub = sub_map.get(body.subject.strip().lower(), body.subject.strip().capitalize())
    clean_year = body.year_level.strip().title()

    # ── State-aware curriculum context ─────────────────────────────────────────
    state_code = (body.student_profile or {}).get("state_curriculum", "VIC")
    db_state = get_db_state(state_code)
    curriculum_info = get_curriculum_info(state_code)
    curriculum_label = f"{curriculum_info['full_name']} ({curriculum_info['authority']})"

    # ── Multi-query retrieval — message wrapped in delimiters to reduce prompt injection ──
    search_gen_prompt = (
        f"Convert the student query below into 3 distinct, technical search terms "
        f"for a {curriculum_label} curriculum database.\nStudent query: ###\n"
        f"{body.message[:500]}\n###\nReturn only the search terms, one per line."
    )
    queries_response = llm_query_gen.invoke(search_gen_prompt)
    search_queries = [q.strip() for q in queries_response.content.split("\n") if q.strip()]

    all_docs: list = []
    for q in search_queries:
        # Try: exact state + year + subject
        try:
            scored = vector_db.similarity_search_with_relevance_scores(
                q, k=3,
                filter={"$and": [{"state": db_state}, {"year_level": clean_year}, {"subject": clean_sub}]},
            )
        except Exception:
            scored = []

        # Fallback 1: state + subject (any year)
        if not scored:
            try:
                scored = vector_db.similarity_search_with_relevance_scores(
                    q, k=3,
                    filter={"$and": [{"state": db_state}, {"subject": clean_sub}]},
                )
            except Exception:
                scored = []

        # Fallback 2: year + subject only (pre-migration docs without state)
        if not scored:
            try:
                scored = vector_db.similarity_search_with_relevance_scores(
                    q, k=3,
                    filter={"$and": [{"year_level": clean_year}, {"subject": clean_sub}]},
                )
            except Exception:
                scored = vector_db.similarity_search_with_relevance_scores(q, k=3)

        all_docs.extend((doc, score) for doc, score in scored if score >= RAG_RELEVANCE_THRESHOLD)

    # ── Dedup by content + enforce token budget ────────────────────────────────
    seen: set = set()
    budget = RAG_TOKEN_BUDGET
    chunks: list = []
    for doc, _score in sorted(all_docs, key=lambda x: x[1], reverse=True):
        if doc.page_content in seen:
            continue
        seen.add(doc.page_content)
        n_tokens = len(_encoder.encode(doc.page_content))
        if budget - n_tokens < 0:
            break
        chunks.append(doc.page_content)
        budget -= n_tokens
    context_text = "\n\n".join(chunks)

    # ── Knowledge graph: fetch mastery context for this subject ───────────────
    mastery_ctx = await knowledge_graph.get_mastery_context(student_id, clean_sub, clean_year)

    # ── System prompt assembly ─────────────────────────────────────────────────
    if body.student_profile:
        safe_profile = sanitise_profile(body.student_profile)
        system_prompt = generate_personalized_prompt(
            body.subject, body.year_level, safe_profile,
            is_naplan_mode=body.is_naplan_mode,
            session_context=body.session_context or [],
            state_curriculum=state_code,
            mastery_context=mastery_ctx,
        )
    else:
        system_prompt = build_system_prompt(
            body.subject, body.year_level, body.is_naplan_mode, state_code
        )
        if mastery_ctx:
            system_prompt += f"\n\n---\n\n{mastery_ctx}"

    if context_text:
        system_prompt += f"\n\nEXPERT CURRICULUM GUIDE ({curriculum_label} content for this session):\n{context_text}"

    if clean_sub == "Mathematics":
        # ── SymPy agent: verify all calculations before responding ────────────
        agent_prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            MessagesPlaceholder("chat_history"),
            ("human", "{input}"),
            MessagesPlaceholder("agent_scratchpad"),
        ])
        agent = create_tool_calling_agent(llm, math_solver.MATH_TOOLS, agent_prompt)
        executor = AgentExecutor(
            agent=agent,
            tools=math_solver.MATH_TOOLS,
            max_iterations=5,
            handle_parsing_errors=True,
        )
        chat_history = [
            _LCAi(content=m.content) if m.type == "ai" else _LCHuman(content=m.content)
            for m in history.messages
        ]
        agent_result = await asyncio.to_thread(
            executor.invoke,
            {"input": body.message, "chat_history": chat_history},
        )
        response = agent_result["output"]
    else:
        messages_payload = [{"role": "system", "content": system_prompt}]
        for msg in history.messages:
            messages_payload.append({
                "role": "assistant" if msg.type == "ai" else "user",
                "content": msg.content,
            })
        messages_payload.append({"role": "user", "content": body.message})
        result = llm.invoke(messages_payload)
        response = result.content

    # ── Output moderation ──────────────────────────────────────────────────────
    try:
        mod = _openai_client.moderations.create(input=response)
        if mod.results[0].flagged:
            categories = {k: v for k, v in mod.results[0].categories.model_dump().items() if v}
            log_flagged(body.session_id, categories)
            return {
                "response": (
                    "I wasn't able to give a great response to that — let's try a different angle. "
                    "What else can I help you with?"
                )
            }
    except Exception as exc:
        print(f"[moderation] API call failed: {exc} — allowing response through")

    history.add_user_message(body.message)
    history.add_ai_message(response)

    background_tasks.add_task(
        knowledge_graph.extract_and_update,
        student_id, clean_sub, clean_year,
        body.message, response, llm_query_gen,
    )

    return {"response": response}


@app.get("/knowledge-graph")
async def get_knowledge_graph(
    profile_id: Optional[str] = None,
    auth: dict = Depends(verify_auth),
):
    sub = auth.get("sub", "")
    if not sub or sub == "dev":
        return {"concepts": []}
    student_id = f"{sub}__{profile_id}" if profile_id else sub
    concepts = await knowledge_graph.get_all_concepts(student_id)
    return {"concepts": concepts}


@app.get("/debug-kg")
async def debug_kg(auth: dict = Depends(verify_auth)):
    """Temporary debug endpoint — tests Supabase write directly."""
    import httpx
    sub = auth.get("sub", "dev")
    svc_key = os.environ.get("SUPABASE_SERVICE_KEY", "")
    supabase_url = os.environ.get("SUPABASE_URL", "https://kizrtirljclpqjifrlwh.supabase.co")

    if not svc_key:
        return {"error": "SUPABASE_SERVICE_KEY not set", "sub": sub}

    headers = {
        "apikey": svc_key,
        "Authorization": f"Bearer {svc_key}",
        "Content-Type": "application/json",
    }
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{supabase_url}/rest/v1/rpc/update_mastery",
                headers=headers,
                json={
                    "p_student_id": f"debug__{sub[:8]}",
                    "p_concept_key": "debug_test",
                    "p_concept_label": "Debug Test",
                    "p_subject": "Mathematics",
                    "p_year_level": 9,
                    "p_signal": "progressing",
                },
            )
        return {
            "status": resp.status_code,
            "body": resp.text,
            "sub": sub[:8],
            "key_set": bool(svc_key),
            "key_prefix": svc_key[:10] + "...",
        }
    except Exception as exc:
        return {"error": str(exc), "sub": sub[:8]}
