"""
Adaptive Knowledge Graph — per-student concept mastery tracking.
Writes to Supabase via REST API (service role key bypasses RLS).
"""

import os
import json
import asyncio
import logging
from typing import Optional

import httpx

logger = logging.getLogger(__name__)

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://kizrtirljclpqjifrlwh.supabase.co")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")

_EXTRACT_PROMPT = (
    "You are analysing a tutoring session exchange to classify learning signals.\n\n"
    "Subject: {subject} | Year: {year_level}\n"
    "Student message: {user_msg}\n"
    "Tutor response (first 400 chars): {ai_snippet}\n\n"
    "Identify up to 3 specific curriculum concepts that were substantively discussed.\n"
    "For each, assess the student's signal:\n"
    '  "mastered"    — student showed clear understanding or solved it correctly\n'
    '  "progressing" — student is engaging and making progress but not yet solid\n'
    '  "struggling"  — student is confused, made errors, or explicitly asked for help\n\n'
    "Return a JSON array only (no other text):\n"
    '[{"key": "snake_case_concept_name", "label": "Human Readable Label", "signal": "mastered|progressing|struggling"}]\n\n'
    "If the exchange was a greeting, off-topic, or too brief to classify, return: []"
)


def _headers() -> dict:
    return {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json",
    }


async def extract_and_update(
    student_id: str,
    subject: str,
    year_level: str,
    user_message: str,
    ai_response: str,
    llm,
) -> None:
    """Fire-and-forget: extract concepts from the exchange and upsert mastery scores."""
    if not SUPABASE_SERVICE_KEY or student_id in ("dev", ""):
        return

    try:
        from langchain_core.messages import HumanMessage

        prompt = _EXTRACT_PROMPT.format(
            subject=subject,
            year_level=year_level,
            user_msg=user_message[:300],
            ai_snippet=ai_response[:400],
        )
        result = await asyncio.to_thread(llm.invoke, [HumanMessage(content=prompt)])
        raw = result.content.strip()

        if raw.startswith("```"):
            parts = raw.split("```")
            raw = parts[1].lstrip("json").strip() if len(parts) > 1 else raw

        concepts = json.loads(raw)
        if not isinstance(concepts, list) or not concepts:
            return

        year_int = int("".join(filter(str.isdigit, year_level))) if year_level else 0

        async with httpx.AsyncClient(timeout=10.0) as client:
            for concept in concepts[:3]:
                key = str(concept.get("key", "")).strip().lower().replace(" ", "_")
                label = str(concept.get("label", "")).strip()
                signal = concept.get("signal", "progressing")

                if not key or not label or signal not in ("mastered", "progressing", "struggling"):
                    continue

                await client.post(
                    f"{SUPABASE_URL}/rest/v1/rpc/update_mastery",
                    headers=_headers(),
                    json={
                        "p_student_id": student_id,
                        "p_concept_key": key,
                        "p_concept_label": label,
                        "p_subject": subject,
                        "p_year_level": year_int,
                        "p_signal": signal,
                    },
                )
    except Exception as exc:
        logger.warning(f"[knowledge_graph] extract_and_update failed: {exc}")


async def get_mastery_context(
    student_id: str,
    subject: str,
    year_level: str,
) -> str:
    """Returns a mastery context block for the system prompt, or '' if unavailable."""
    if not SUPABASE_SERVICE_KEY or student_id in ("dev", ""):
        return ""

    try:
        year_int = int("".join(filter(str.isdigit, year_level))) if year_level else 0

        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(
                f"{SUPABASE_URL}/rest/v1/student_concepts",
                headers=_headers(),
                params={
                    "student_id": f"eq.{student_id}",
                    "subject": f"eq.{subject}",
                    "year_level": f"eq.{year_int}",
                    "order": "mastery_score.asc",
                    "limit": "20",
                },
            )
            if resp.status_code != 200:
                return ""
            concepts = resp.json()

        if not concepts:
            return ""

        struggling = [c for c in concepts if c["mastery_score"] < 0.45][:5]
        needs_work = [c for c in concepts if 0.45 <= c["mastery_score"] < 0.70][:3]
        mastered = [c for c in sorted(concepts, key=lambda x: x["mastery_score"], reverse=True) if c["mastery_score"] >= 0.75][:3]

        if not struggling and not mastered:
            return ""

        lines = ["STUDENT KNOWLEDGE MAP (internal — never reveal to student, apply invisibly):"]
        if struggling:
            labels = ", ".join(c["concept_label"] for c in struggling)
            lines.append(
                f"Needs more support: {labels}. Prioritise these concepts. "
                "Use extra scaffolding, revisit foundations, offer more worked examples."
            )
        if needs_work:
            labels = ", ".join(c["concept_label"] for c in needs_work)
            lines.append(
                f"Still developing: {labels}. Check for understanding; don't assume mastery."
            )
        if mastered:
            labels = ", ".join(c["concept_label"] for c in mastered)
            lines.append(
                f"Solid understanding: {labels}. Build on these as foundations; don't over-explain them."
            )
        lines.append(
            "Adjust difficulty, depth, and pacing based on this map without mentioning it to the student."
        )

        return "\n".join(lines)

    except Exception as exc:
        logger.warning(f"[knowledge_graph] get_mastery_context failed: {exc}")
        return ""


async def get_all_concepts(student_id: str) -> list:
    """Fetch all concept records for a student (used by the /knowledge-graph endpoint)."""
    if not SUPABASE_SERVICE_KEY or student_id in ("dev", ""):
        return []

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(
                f"{SUPABASE_URL}/rest/v1/student_concepts",
                headers=_headers(),
                params={
                    "student_id": f"eq.{student_id}",
                    "order": "subject.asc,mastery_score.desc",
                },
            )
            if resp.status_code != 200:
                return []
            return resp.json()
    except Exception as exc:
        logger.warning(f"[knowledge_graph] get_all_concepts failed: {exc}")
        return []
