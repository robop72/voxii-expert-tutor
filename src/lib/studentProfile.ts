export type SubjectLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type GuidancePreference = 'Socratic' | 'Mixed' | 'Full Explanations';
export type EngagementTone = 'Warm' | 'Balanced' | 'Formal';

export interface SubjectPerformance {
  grade: string;
  struggles_significantly: boolean;
  low_confidence: boolean;
  receives_extension: boolean;
  highly_motivated: boolean;
}

export interface StudentProfile {
  student_name: string;
  year_level: number;
  state_curriculum: string;
  primary_goals: string[];
  selected_subjects: string[];
  subject_levels: Partial<Record<string, SubjectLevel>>;
  guidance_preference: GuidancePreference;
  engagement_tone: EngagementTone;
  focus_limit_minutes: number;
}

export interface IntakeQuestionnaire {
  student_name: string;
  year_level: number;
  state_curriculum: string;
  primary_goals: string[];
  selected_subjects: string[];
  subject_performance: Record<string, SubjectPerformance>;
  guidance_preference: GuidancePreference;
  engagement_tone: EngagementTone;
  focus_limit_minutes: number;
}

// Client-side classification mirrors intake_classifier.py
const BEGINNER_GRADES = new Set(['D', 'E', 'D/E']);
const ADVANCED_GRADES = new Set(['A', 'A+', 'A/A+']);

export function classifySubjectLevel(perf: SubjectPerformance): SubjectLevel {
  if (BEGINNER_GRADES.has(perf.grade) || perf.struggles_significantly || perf.low_confidence) {
    return 'Beginner';
  }
  if (ADVANCED_GRADES.has(perf.grade) || perf.receives_extension || perf.highly_motivated) {
    return 'Advanced';
  }
  return 'Intermediate';
}

export function deriveProfileClientSide(q: IntakeQuestionnaire): StudentProfile {
  const subject_levels: Partial<Record<string, SubjectLevel>> = {};
  for (const [subject, perf] of Object.entries(q.subject_performance)) {
    subject_levels[subject] = classifySubjectLevel(perf);
  }
  return {
    student_name: q.student_name,
    year_level: q.year_level,
    state_curriculum: q.state_curriculum,
    primary_goals: q.primary_goals,
    selected_subjects: q.selected_subjects,
    subject_levels,
    guidance_preference: q.guidance_preference,
    engagement_tone: q.engagement_tone,
    focus_limit_minutes: q.focus_limit_minutes,
  };
}
