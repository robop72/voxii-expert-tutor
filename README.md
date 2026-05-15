# Voxii AI Expert Tutor — Backend + Frontend (Production)

AI-powered tutoring platform for Australian students in Years 7–10 covering Maths, English, and Science. This is the **production environment**. Dev/testing is at [`llm-math-education`](https://github.com/robop72/llm-math-education).

**Live URL:** https://voxii-expert-tutor.vercel.app  
**Backend:** https://voxii-tutor-backend-919882895306.australia-southeast1.run.app

---

## Architecture

```
Frontend (Vite + React + TypeScript + Tailwind)
    └── Vercel (auto-deploy on push to main)
         └── /api/* Edge Functions → Cloud Run Backend
                                          └── FastAPI + LangChain + ChromaDB
                                               └── Supabase (auth + student_concepts)
```

| Layer | Tech |
|---|---|
| Frontend | Vite + React + TypeScript + Tailwind CSS |
| Auth | Supabase magic link + TOTP MFA |
| Backend | FastAPI on Google Cloud Run (`australia-southeast1`) |
| LLM | GPT-4o-mini (`gpt-4o-mini`, temperature 0.2) |
| Vector DB | ChromaDB (`vcaa_json_index/`, 2,666 docs — VIC/NSW/ACARA) |
| Maths solver | SymPy via OpenAI function calling |
| TTS | Google TTS REST API (`en-AU-Standard-A`) |
| Session memory | In-memory LRU (falls back from Redis if `REDIS_URL` not set) |
| Student knowledge | Supabase `student_concepts` table, ELO mastery scoring |

---

## Key Backend Files

| File | Purpose |
|---|---|
| `main.py` | FastAPI app — all endpoints, auth, RAG, safety, moderation |
| `math_solver.py` | SymPy tools + OpenAI function schemas for exact maths computation |
| `knowledge_graph.py` | Concept extraction + mastery upsert to Supabase after each chat turn |
| `build_prompt.py` | State-aware system prompt factory |
| `personalized_prompt.py` | 5-layer personalised prompt with mastery context injection |
| `intake_classifier.py` | Derives tutor profile from intake questionnaire |
| `curriculum_authorities.py` | State → DB tag + authority name mapping |
| `Dockerfile` | Multi-stage build — reuses existing vector DB image to avoid re-indexing |

## Key Frontend Files (`src/`)

| File | Purpose |
|---|---|
| `App.tsx` | View state, MFA gate, curriculum badge |
| `components/ChatInterface.tsx` | Chat UI, TTS toggle, microphone |
| `components/IntakeForm.tsx` | 5-step onboarding form |
| `components/QuizView.tsx` | AI-generated MCQ practice quiz |
| `components/MasteryPanel.tsx` | Knowledge Map — per-concept mastery bars |
| `components/ParentDashboard.tsx` | Analytics, MFA management, data deletion |
| `hooks/useChat.ts` | Chat state, JWT auth, 401 → sign out, transparent retry |
| `api/chat.ts` | Edge function — forwards JWT to Cloud Run |
| `api/tts.ts` | Edge function — Google TTS (en-AU-Standard-A) |
| `api/quiz.ts` | Edge function — generates MCQs via OpenAI |

---

## Environment Variables

### Vercel (frontend)
| Variable | Notes |
|---|---|
| `VITE_SUPABASE_URL` | `https://kizrtirljclpqjifrlwh.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Legacy `eyJ...` JWT format |
| `VITE_BACKEND_URL` | Cloud Run URL |
| `GOOGLE_TTS_API_KEY` | Google TTS REST API key |

> ⚠️ `VITE_*` vars are baked at build time — redeploy required after changes.

### Cloud Run (backend)
| Variable | Notes |
|---|---|
| `OPENAI_API_KEY` | GPT-4o-mini + embeddings + moderation |
| `SUPABASE_JWKS` | EC public key JSON for ES256 JWT validation |
| `SUPABASE_SERVICE_KEY` | Service role key — bypasses RLS for knowledge graph writes |
| `API_SECRET` | 64-char hex — dev bypass for auth (stored in `.env`) |
| `MAX_TURNS` | Max exchanges per session (currently `30`) |
| `REDIS_URL` | Optional — falls back to in-memory LRU if not set |

---

## Curriculum Coverage

State curriculum routing selects the correct ChromaDB partition per student:

| State | DB Tag | Authority |
|---|---|---|
| VIC | `VIC` | VCAA (Victorian Curriculum 2.0) |
| NSW | `NSW` | NESA |
| QLD, WA, SA, ACT, TAS, NT | `ACARA` | QCAA / SCSA / SACE Board |

3-tier RAG fallback: `state+year+subject` → `state+subject` → `year+subject`

---

## Features

- Magic link auth + TOTP MFA (Supabase)
- 5-step parental consent + intake form
- Multi-student profiles (localStorage)
- State curriculum routing (all 8 states/territories)
- SymPy maths solver — exact computation via OpenAI function calling
- Adaptive knowledge graph — ELO mastery scoring per concept, injected into system prompt
- NAPLAN mode (Years 7 & 9, Maths/English)
- Practice Quiz — AI-generated MCQs with per-question feedback
- TTS read-aloud (Google TTS en-AU)
- Microphone input (Web Speech API, en-AU)
- Keyword highlighting (`==term==` → indigo highlight)
- Starter cards — 3 random topic cards from pool of 12 per subject/year
- Session summaries for cross-session continuity
- Parent Dashboard — analytics, safety reports, PIN reset, data deletion
- OpenAI content moderation on input + output
- Crisis response with AU helplines (Kids Helpline, Lifeline, Beyond Blue)
- Dark mode
- Transparent retry on cold-start (retries once after 3s on 5xx)

---

## Deployment

### Frontend
```bash
git push  # Vercel auto-deploys
```

### Backend (Cloud Run)
```bash
git push  # GitHub Actions builds Docker image and deploys to Cloud Run
```

> ⚠️ `gcloud run deploy --source .` is broken (Cloud Build SA missing). Use GitHub Actions only.  
> ⚠️ GCP Console "Edit & Deploy New Revision" does NOT rebuild code — only use it for env var / SA changes.  
> Always select SA: `voxii-cloudrun@voxii-backend-2026.iam.gserviceaccount.com`  
> Always keep: Min instances = 1 (prevents cold-start timeouts)

### Dev → Prod Sync
1. Test changes in this repo (`llm-math-education`)
2. `cp` changed files to `voxii-expert-tutor/` — always include `src/hooks/` if frontend changed
3. Push prod repo — Vercel and Cloud Run auto-deploy

---

## Local Development

```bash
# Frontend
npm install
npm run dev  # http://localhost:5173

# Backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8080
```

Set `API_SECRET` in `.env` to use the dev auth bypass instead of Supabase JWT.

---

## GCP Project
- **Project:** `voxii-backend-2026`
- **Region:** `australia-southeast1`
- **Service:** `voxii-tutor-backend`
- **Artifact Registry:** `australia-southeast1-docker.pkg.dev/voxii-backend-2026/cloud-run-source-deploy`

## Supabase Project
- **Project ID:** `kizrtirljclpqjifrlwh`
- **Region:** Sydney
- **Tables:** `student_concepts`
- **RPC:** `update_mastery` (ELO scoring)
