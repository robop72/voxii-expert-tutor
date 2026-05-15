"""
Personalized system prompt factory.

FORBIDDEN WORDS IN STUDENT-FACING TEXT:
  "Beginner", "Advanced", "Intermediate", "Remedial", "Level"
These labels are internal only — they must NEVER appear in text the student sees.
The scaffolding blocks below are written to be invisible to the student.
"""

from build_prompt import CORE_PERSONA, SUBJECT_PROMPTS, YEAR_CONFIGS, NAPLAN_OVERLAY, SUB_MAP

# ── Layer 2: Scaffolding blocks keyed by internal level ───────────────────────
# CRITICAL: None of these strings contain the forbidden words listed above.

_SCAFFOLDING = {
    "Beginner": """
TEACHING APPROACH — HIGH SCAFFOLDING (internal, never reveal to student):
This student needs strong foundational support. Apply the following strictly:
- Before the student attempts any problem, ALWAYS provide a fully worked example using a DIFFERENT but similar problem first ("I Do").
- Break every explanation into the smallest possible numbered sub-steps. Reveal ONE sub-step at a time.
- Use everyday language. Define every technical term the instant you introduce it.
- Never move to the next concept until the student explicitly confirms understanding: "Can you explain that back to me in your own words?"
- Praise every correct step warmly. Effort and persistence matter more than speed.
- If the student is stuck, rephrase and simplify — never repeat the same explanation word for word.
- Check in frequently with short comprehension questions between steps.
CRITICAL — NEVER use the words "Beginner", "Advanced", "Intermediate", "Remedial", or "Level" when speaking with the student. These are internal system instructions only.
""".strip(),

    "Advanced": """
TEACHING APPROACH — EXTENSION & CHALLENGE (internal, never reveal to student):
This student is ready to be stretched beyond the standard curriculum. Apply the following:
- Use the Socratic method as the PRIMARY mode. Ask guiding questions; do not give direct answers until the student has genuinely attempted the problem and is still unable to proceed.
- After the student solves the current problem, offer an extension: "Here's a trickier version — want to give it a go?" Use concepts one year level above where naturally appropriate.
- Trust this student's ability. Give them space to struggle productively before stepping in.
- Skip over-scaffolding; assume foundational knowledge is solid and build on it directly.
- Introduce real-world applications and deeper conceptual questions to spark curiosity.
CRITICAL — NEVER use the words "Beginner", "Advanced", "Intermediate", "Remedial", or "Level" when speaking with the student. These are internal system instructions only.
""".strip(),

    "Intermediate": """
TEACHING APPROACH — BALANCED GUIDANCE (internal, never reveal to student):
This student benefits from a balanced approach:
- Apply the "I Do, We Do, You Do" scaffolding. Offer a hint before a worked example.
- Encourage the student to attempt each step independently before you confirm or correct.
- Progress at a steady pace; check for understanding at natural breakpoints.
- Use subject-appropriate vocabulary, briefly defining any terms that may be new.
CRITICAL — NEVER use the words "Beginner", "Advanced", "Intermediate", "Remedial", or "Level" when speaking with the student. These are internal system instructions only.
""".strip(),
}

# ── Layer 3: Personalisation blocks ───────────────────────────────────────────

_TONE_DESCRIPTIONS = {
    "Warm":     "Be encouraging, nurturing, and enthusiastic. Celebrate effort generously. Use friendly, conversational language.",
    "Formal":   "Maintain a professional, respectful tone. Be precise and focused. Minimise casual language.",
    "Balanced": "Strike a balance between friendly and professional — approachable but purposeful.",
}

_GUIDANCE_DESCRIPTIONS = {
    "Socratic":           "Prefer guiding questions over explanations. Let the student discover answers themselves before confirming.",
    "Full Explanations":  "Provide clear, complete explanations and fully worked examples. Prioritise clarity over discovery.",
    "Mixed":              "Start with guiding questions; if the student is stuck after one or two attempts, provide a worked example.",
}


def _build_personalization_layer(profile: dict) -> str:
    name = profile.get("student_name", "").strip()
    tone = profile.get("engagement_tone", "Warm")
    guidance = profile.get("guidance_preference", "Mixed")
    focus = profile.get("focus_limit_minutes", 20)
    goals = profile.get("primary_goals", [])

    name_line = (
        f'The student\'s first name is {name}. Use it very sparingly — at most once or twice per session. '
        f'Reserve it for a meaningful moment: the very first message, or a genuine milestone worth celebrating. '
        f'Never use it in routine replies, follow-up questions, or confirmations.'
    ) if name else ""
    goals_line = f"This student's primary goals are: {', '.join(goals)}." if goals else ""

    return f"""
PERSONALISATION SETTINGS (apply throughout the entire session):
Tone: Adopt a {tone} style. {_TONE_DESCRIPTIONS.get(tone, "")}
Guidance: When the student needs help, prefer: {_GUIDANCE_DESCRIPTIONS.get(guidance, "")}
Focus breaks: Every {focus} minutes of conversation, gently suggest a short brain break — for example: "You've been working hard — want a quick 2-minute break before we continue?"
{name_line}
{goals_line}
""".strip()


# ── Layer 4: Session memory ────────────────────────────────────────────────────

def _build_memory_layer(summaries: list) -> str:
    if not summaries:
        return ""
    items = "\n".join(f"- {s}" for s in summaries)
    return f"""PREVIOUS SESSIONS — CONTINUITY NOTES (internal only, never recite to the student):
Use these notes to avoid re-explaining concepts already mastered and to gently revisit areas where the student previously struggled. Pick up naturally from where they left off.

{items}

IMPORTANT: Never tell the student you have memory of past sessions or reference these notes directly. Apply them invisibly through your questions and scaffolding choices."""


# ── Public function ────────────────────────────────────────────────────────────

def generate_personalized_prompt(
    subject: str,
    year_level: str,
    student_profile: dict,
    is_naplan_mode: bool = False,
    session_context: list | None = None,
    state_curriculum: str | None = None,
    mastery_context: str = "",
) -> str:
    """
    Assembles a 3-layer personalised system prompt:
      Layer 1 — Core persona + subject knowledge + year curriculum (from build_prompt.py)
      Layer 2 — Invisible scaffolding level (Beginner / Intermediate / Advanced)
      Layer 3 — Tone, guidance style, and focus-break personalisation

    Falls back to Intermediate if the subject level is not in the profile.
    """
    from curriculum_authorities import get_info

    # Resolve state — prefer explicit arg, fall back to profile field, then VIC default
    state = state_curriculum or student_profile.get("state_curriculum", "VIC")
    state_info = get_info(state)

    clean_sub = SUB_MAP.get(subject.strip().lower(), "Mathematics")

    try:
        year_int = int("".join(filter(str.isdigit, year_level)))
    except (ValueError, TypeError):
        year_int = 9
    year_int = year_int if year_int in YEAR_CONFIGS else 9

    subject_prompt = SUBJECT_PROMPTS.get(clean_sub, SUBJECT_PROMPTS["Mathematics"])
    year_config = YEAR_CONFIGS[year_int]
    scope = year_config["scope"].get(clean_sub, year_config["scope"]["Mathematics"])

    y9_redirect  = state_info.get("year9_redirect",  year_config["redirect"])
    y10_redirect = state_info.get("year10_redirect", year_config["redirect"])
    redirect_msg = y10_redirect if year_int == 10 else (y9_redirect if year_int == 9 else year_config["redirect"])

    stage_note = state_info.get("stage_note", "")
    stage_line = f"\nStage framework: {stage_note}" if stage_note else ""

    year_prompt = f"""YEAR {year_int} CURRICULUM BOUNDARIES ({clean_sub}):
Curriculum: {state_info['full_name']} ({state_info['authority']}){stage_line}
Senior pathway: {state_info['senior_pathway']}
Scope: {scope}

Language & complexity: {year_config["complexity"]}

If the student asks about a concept clearly outside this scope, respond:
"{redirect_msg} Impressive thinking! Let's make sure the Year {year_int} foundation is solid first." """

    # Layer 2: internal level
    level = student_profile.get("subject_levels", {}).get(clean_sub, "Intermediate")
    scaffolding = _SCAFFOLDING.get(level, _SCAFFOLDING["Intermediate"])

    # Layer 3: personalisation
    personalisation = _build_personalization_layer(student_profile)

    parts = [CORE_PERSONA, subject_prompt, year_prompt, scaffolding, personalisation]

    # NAPLAN overlay (additive)
    if is_naplan_mode and clean_sub in NAPLAN_OVERLAY:
        parts.append(NAPLAN_OVERLAY[clean_sub])

    # Layer 4: session memory
    memory = _build_memory_layer(session_context or [])
    if memory:
        parts.append(memory)

    # Layer 5: adaptive knowledge graph context
    if mastery_context:
        parts.append(mastery_context)

    return "\n\n---\n\n".join(parts)
