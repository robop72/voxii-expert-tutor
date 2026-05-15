from typing import Literal

SubjectLevel = Literal["Beginner", "Intermediate", "Advanced"]

BEGINNER_GRADES = {"D", "E", "D/E"}
ADVANCED_GRADES = {"A", "A+", "A/A+"}


def classify_subject_level(
    grade: str | None,
    struggles_significantly: bool,
    low_confidence: bool,
    receives_extension: bool,
    highly_motivated: bool,
) -> SubjectLevel:
    """
    Beginner signals take precedence over Advanced — if a parent flags
    struggle or low confidence, scaffold up regardless of grade.
    """
    grade_clean = (grade or "").strip()

    is_beginner = (
        grade_clean in BEGINNER_GRADES
        or struggles_significantly
        or low_confidence
    )
    if is_beginner:
        return "Beginner"

    is_advanced = (
        grade_clean in ADVANCED_GRADES
        or receives_extension
        or highly_motivated
    )
    if is_advanced:
        return "Advanced"

    return "Intermediate"


def derive_profile_from_questionnaire(q: dict) -> dict:
    """
    Takes the raw intake questionnaire dict and returns a complete
    StudentProfile dict ready to be stored in the frontend and sent
    with each chat request.
    """
    subject_levels: dict[str, SubjectLevel] = {}

    for subject, perf in q.get("subject_performance", {}).items():
        subject_levels[subject] = classify_subject_level(
            grade=perf.get("grade"),
            struggles_significantly=perf.get("struggles_significantly", False),
            low_confidence=perf.get("low_confidence", False),
            receives_extension=perf.get("receives_extension", False),
            highly_motivated=perf.get("highly_motivated", False),
        )

    return {
        "student_name": q.get("student_name", ""),
        "year_level": q.get("year_level", 9),
        "state_curriculum": q.get("state_curriculum", "VIC"),
        "primary_goals": q.get("primary_goals", []),
        "selected_subjects": q.get("selected_subjects", []),
        "subject_levels": subject_levels,
        "guidance_preference": q.get("guidance_preference", "Mixed"),
        "engagement_tone": q.get("engagement_tone", "Warm"),
        "focus_limit_minutes": q.get("focus_limit_minutes", 20),
    }
