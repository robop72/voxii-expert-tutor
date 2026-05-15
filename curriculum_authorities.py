"""
Shared config: maps student-facing state codes to vector DB tags and curriculum authority info.
Imported by main.py, build_prompt.py, personalized_prompt.py, and all ingestion scripts.
"""

# Maps state code → DB tag stored in vector DB metadata
# VIC and NSW have their own distinct content; all other states follow ACARA v9
STATE_TO_DB: dict[str, str] = {
    "VIC": "VIC",
    "NSW": "NSW",
    "QLD": "ACARA",
    "WA":  "ACARA",
    "SA":  "ACARA",
    "ACT": "ACARA",
    "TAS": "ACARA",
    "NT":  "ACARA",
}

# Full curriculum metadata per state
CURRICULUM_INFO: dict[str, dict] = {
    "VIC": {
        "db_state":   "VIC",
        "authority":  "VCAA",
        "full_name":  "Victorian Curriculum 2.0",
        "senior_pathway": "VCE (Victorian Certificate of Education)",
        "year9_redirect":  "That's edging into Year 10 or VCE territory.",
        "year10_redirect": "That's a VCE-level concept.",
        "stage_note":  "",
    },
    "NSW": {
        "db_state":   "NSW",
        "authority":  "NESA",
        "full_name":  "NSW Curriculum (NESA)",
        "senior_pathway": "HSC (Higher School Certificate)",
        "year9_redirect":  "That's edging into Stage 5 or HSC territory.",
        "year10_redirect": "That's an HSC-level concept.",
        "stage_note":  "Year 7–8 = Stage 4 | Year 9–10 = Stage 5",
    },
    "QLD": {
        "db_state":   "ACARA",
        "authority":  "QCAA",
        "full_name":  "Australian Curriculum v9.0 (Queensland)",
        "senior_pathway": "QCE (Queensland Certificate of Education)",
        "year9_redirect":  "That's edging into Year 10 or QCE territory.",
        "year10_redirect": "That's a QCE-level concept.",
        "stage_note":  "",
    },
    "WA": {
        "db_state":   "ACARA",
        "authority":  "SCSA",
        "full_name":  "Western Australian Curriculum (Australian Curriculum v9.0)",
        "senior_pathway": "WACE (Western Australian Certificate of Education)",
        "year9_redirect":  "That's edging into Year 10 or WACE territory.",
        "year10_redirect": "That's a WACE-level concept.",
        "stage_note":  "",
    },
    "SA": {
        "db_state":   "ACARA",
        "authority":  "SACE Board",
        "full_name":  "South Australian Curriculum (Australian Curriculum v9.0)",
        "senior_pathway": "SACE (South Australian Certificate of Education)",
        "year9_redirect":  "That's edging into Year 10 or SACE territory.",
        "year10_redirect": "That's a SACE-level concept.",
        "stage_note":  "",
    },
    "ACT": {
        "db_state":   "ACARA",
        "authority":  "ACARA",
        "full_name":  "Australian Curriculum v9.0 (ACT)",
        "senior_pathway": "ACT Senior Secondary Certificate",
        "year9_redirect":  "That's edging into Year 10 or senior secondary territory.",
        "year10_redirect": "That's a senior secondary concept.",
        "stage_note":  "",
    },
    "TAS": {
        "db_state":   "ACARA",
        "authority":  "TASC",
        "full_name":  "Australian Curriculum v9.0 (Tasmania)",
        "senior_pathway": "TCE (Tasmanian Certificate of Education)",
        "year9_redirect":  "That's edging into Year 10 or TCE territory.",
        "year10_redirect": "That's a TCE-level concept.",
        "stage_note":  "",
    },
    "NT": {
        "db_state":   "ACARA",
        "authority":  "NTBOS",
        "full_name":  "Australian Curriculum v9.0 (Northern Territory)",
        "senior_pathway": "NTCE (Northern Territory Certificate of Education)",
        "year9_redirect":  "That's edging into Year 10 or NTCE territory.",
        "year10_redirect": "That's an NTCE-level concept.",
        "stage_note":  "",
    },
}


def get_db_state(state_code: str) -> str:
    """Return the DB state tag for a student's state code."""
    return STATE_TO_DB.get(state_code, "ACARA")


def get_info(state_code: str) -> dict:
    """Return full curriculum info for a state code. Falls back to ACARA/QLD profile."""
    return CURRICULUM_INFO.get(state_code, CURRICULUM_INFO["QLD"])
