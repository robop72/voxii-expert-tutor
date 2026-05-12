import React, { useState } from 'react';
import {
  StudentProfile, IntakeQuestionnaire, SubjectPerformance,
  EngagementTone, GuidancePreference, deriveProfileClientSide,
} from '../lib/studentProfile';
import { ALLOWED_SUBJECTS } from '../lib/curriculumConfig';

const API_URL = import.meta.env.VITE_API_URL || 'https://voxii-tutor-backend-919882895306.australia-southeast1.run.app';

const STATES = ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'];
const GOALS = ['Build confidence', 'Improve grades', 'Exam preparation', 'NAPLAN preparation', 'Extension & enrichment', 'Homework help', 'Catch up on missed work'];
const GRADES = ['A/A+', 'B', 'C', 'D/E'];
const FOCUS_OPTIONS = [10, 15, 20, 30, 45];
const TONES: EngagementTone[] = ['Warm', 'Balanced', 'Formal'];
const GUIDANCE: GuidancePreference[] = ['Socratic', 'Mixed', 'Full Explanations'];

const TONE_DESC = {
  Warm: 'Encouraging and nurturing — celebrates every effort',
  Balanced: 'Friendly but focused — approachable and purposeful',
  Formal: 'Professional and precise — minimal small talk',
};
const GUIDANCE_DESC = {
  Socratic: 'Guiding questions only — student discovers answers',
  Mixed: 'Questions first, worked examples when stuck',
  'Full Explanations': 'Clear step-by-step explanations and worked examples',
};

const EMPTY_PERF = (): SubjectPerformance => ({
  grade: 'C',
  struggles_significantly: false,
  low_confidence: false,
  receives_extension: false,
  highly_motivated: false,
});

const DEFAULT_DRAFT: IntakeQuestionnaire = {
  student_name: '',
  year_level: 9,
  state_curriculum: 'VIC',
  primary_goals: [],
  selected_subjects: [],
  subject_performance: {},
  guidance_preference: 'Mixed',
  engagement_tone: 'Warm',
  focus_limit_minutes: 20,
};

interface Props {
  onComplete: (profile: StudentProfile) => void;
  onBack: () => void;
  onClear?: () => void;
  initialProfile?: StudentProfile | null;
}

// ── Shared UI primitives ──────────────────────────────────────────────────────

function ToggleChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
        active
          ? 'bg-blue-500 border-blue-500 text-white'
          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-400'
      }`}
    >
      {children}
    </button>
  );
}

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex items-center justify-between w-full py-2 text-sm text-gray-700 dark:text-gray-300"
    >
      <span>{label}</span>
      <span className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-4' : 'translate-x-0'}`} />
      </span>
    </button>
  );
}

// ── Step 1: Student details ───────────────────────────────────────────────────

function Step1({ draft, onChange }: { draft: IntakeQuestionnaire; onChange: (p: Partial<IntakeQuestionnaire>) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">First name <span className="text-gray-400 font-normal">(optional)</span></label>
        <input
          value={draft.student_name}
          onChange={e => onChange({ student_name: e.target.value })}
          placeholder="e.g. Alex"
          className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm outline-none focus:border-blue-400 transition-colors"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Year level</label>
          <select
            value={draft.year_level}
            onChange={e => onChange({ year_level: Number(e.target.value) })}
            className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm outline-none cursor-pointer"
          >
            {[7, 8, 9, 10].map(y => <option key={y} value={y}>Year {y}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">State / Territory</label>
          <select
            value={draft.state_curriculum}
            onChange={e => onChange({ state_curriculum: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm outline-none cursor-pointer"
          >
            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary goals <span className="text-gray-400 font-normal">(select all that apply)</span></label>
        <div className="flex flex-wrap gap-2">
          {GOALS.map(g => (
            <ToggleChip
              key={g}
              active={draft.primary_goals.includes(g)}
              onClick={() => {
                const next = draft.primary_goals.includes(g)
                  ? draft.primary_goals.filter(x => x !== g)
                  : [...draft.primary_goals, g];
                onChange({ primary_goals: next });
              }}
            >
              {g}
            </ToggleChip>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Step 2: Subject selection ─────────────────────────────────────────────────

function Step2({ draft, onChange }: { draft: IntakeQuestionnaire; onChange: (p: Partial<IntakeQuestionnaire>) => void }) {
  function toggle(s: string) {
    const selected = draft.selected_subjects.includes(s)
      ? draft.selected_subjects.filter(x => x !== s)
      : [...draft.selected_subjects, s];
    // Remove performance data for deselected subjects
    const perf = { ...draft.subject_performance };
    if (!selected.includes(s)) delete perf[s];
    else if (!perf[s]) perf[s] = EMPTY_PERF();
    onChange({ selected_subjects: selected, subject_performance: perf });
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 dark:text-gray-400">Select the subjects you want Voxii to personalise for this student.</p>
      {ALLOWED_SUBJECTS.map(s => {
        const active = draft.selected_subjects.includes(s);
        return (
          <button
            key={s}
            type="button"
            onClick={() => toggle(s)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all ${
              active
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-500'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300'
            }`}
          >
            <span className="text-xl">{s === 'Maths' ? '📐' : s === 'English' ? '📖' : '🔬'}</span>
            <div>
              <p className={`text-sm font-semibold ${active ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'}`}>{s}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {s === 'Maths' ? 'Algebra, geometry, statistics & more'
                  : s === 'English' ? 'Literature, writing, and language analysis'
                  : 'Biology, chemistry, physics & earth science'}
              </p>
            </div>
            <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${active ? 'bg-blue-500 border-blue-500' : 'border-gray-300 dark:border-gray-600'}`}>
              {active && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ── Step 3: Per-subject performance ──────────────────────────────────────────

function Step3({ draft, onChange }: { draft: IntakeQuestionnaire; onChange: (p: Partial<IntakeQuestionnaire>) => void }) {
  function updatePerf(subject: string, patch: Partial<SubjectPerformance>) {
    onChange({
      subject_performance: {
        ...draft.subject_performance,
        [subject]: { ...draft.subject_performance[subject], ...patch },
      },
    });
  }

  if (draft.selected_subjects.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8">No subjects selected. Go back and choose at least one subject.</p>;
  }

  return (
    <div className="space-y-5">
      {draft.selected_subjects.map(subject => {
        const perf = draft.subject_performance[subject] ?? EMPTY_PERF();
        return (
          <div key={subject} className="p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <span>{subject === 'Maths' ? '📐' : subject === 'English' ? '📖' : '🔬'}</span>
              {subject}
            </h3>

            <div className="mb-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Current grade</p>
              <div className="flex gap-2 flex-wrap">
                {GRADES.map(g => (
                  <ToggleChip key={g} active={perf.grade === g} onClick={() => updatePerf(subject, { grade: g })}>
                    {g}
                  </ToggleChip>
                ))}
              </div>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              <Toggle value={perf.struggles_significantly} onChange={v => updatePerf(subject, { struggles_significantly: v })} label="Struggles significantly with this subject" />
              <Toggle value={perf.low_confidence} onChange={v => updatePerf(subject, { low_confidence: v })} label="Low confidence in this subject" />
              <Toggle value={perf.receives_extension} onChange={v => updatePerf(subject, { receives_extension: v })} label="Receives extension or enrichment work" />
              <Toggle value={perf.highly_motivated} onChange={v => updatePerf(subject, { highly_motivated: v })} label="Highly motivated and keen to be challenged" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Step 4: Learning preferences ─────────────────────────────────────────────

function Step4({ draft, onChange }: { draft: IntakeQuestionnaire; onChange: (p: Partial<IntakeQuestionnaire>) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Focus time before a break</label>
        <div className="flex gap-2 flex-wrap">
          {FOCUS_OPTIONS.map(m => (
            <ToggleChip key={m} active={draft.focus_limit_minutes === m} onClick={() => onChange({ focus_limit_minutes: m })}>
              {m} min
            </ToggleChip>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tutor tone</label>
        <div className="space-y-2">
          {TONES.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => onChange({ engagement_tone: t })}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                draft.engagement_tone === t
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-500'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300'
              }`}
            >
              <div className="flex-1">
                <p className={`text-sm font-medium ${draft.engagement_tone === t ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'}`}>{t}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{TONE_DESC[t]}</p>
              </div>
              {draft.engagement_tone === t && (
                <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Guidance style</label>
        <div className="space-y-2">
          {GUIDANCE.map(g => (
            <button
              key={g}
              type="button"
              onClick={() => onChange({ guidance_preference: g })}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                draft.guidance_preference === g
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-500'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300'
              }`}
            >
              <div className="flex-1">
                <p className={`text-sm font-medium ${draft.guidance_preference === g ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'}`}>{g}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{GUIDANCE_DESC[g]}</p>
              </div>
              {draft.guidance_preference === g && (
                <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main IntakeForm ───────────────────────────────────────────────────────────

const STEP_TITLES = ['Student details', 'Subjects', 'Performance', 'Preferences'];

export default function IntakeForm({ onComplete, onBack, onClear, initialProfile }: Props) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [draft, setDraft] = useState<IntakeQuestionnaire>(() => {
    if (initialProfile) {
      return {
        student_name: initialProfile.student_name,
        year_level: initialProfile.year_level,
        state_curriculum: initialProfile.state_curriculum,
        primary_goals: initialProfile.primary_goals,
        selected_subjects: initialProfile.selected_subjects,
        subject_performance: Object.fromEntries(
          initialProfile.selected_subjects.map(s => [s, EMPTY_PERF()])
        ),
        guidance_preference: initialProfile.guidance_preference,
        engagement_tone: initialProfile.engagement_tone,
        focus_limit_minutes: initialProfile.focus_limit_minutes,
      };
    }
    return { ...DEFAULT_DRAFT };
  });
  const [submitting, setSubmitting] = useState(false);

  function patch(p: Partial<IntakeQuestionnaire>) {
    setDraft(prev => ({ ...prev, ...p }));
  }

  function canAdvance() {
    if (step === 2 && draft.selected_subjects.length === 0) return false;
    return true;
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/intake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      if (!res.ok) throw new Error('API error');
      const profile: StudentProfile = await res.json();
      onComplete(profile);
    } catch {
      // Fallback: classify client-side
      const profile = deriveProfileClientSide(draft);
      onComplete(profile);
    } finally {
      setSubmitting(false);
    }
  }

  const progress = (step / 4) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-start px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img src="/voxii-logo.png" alt="Voxii AI" className="h-8 object-contain" />
          </div>
          {initialProfile && onClear && (
            <button
              type="button"
              onClick={onClear}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 dark:text-red-400 border border-red-300 dark:border-red-700/60 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear profile
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
            <span className="font-medium text-gray-700 dark:text-gray-300">{STEP_TITLES[step - 1]}</span>
            <span>Step {step} of 4</span>
          </div>
          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 sm:p-6">
          {step === 1 && <Step1 draft={draft} onChange={patch} />}
          {step === 2 && <Step2 draft={draft} onChange={patch} />}
          {step === 3 && <Step3 draft={draft} onChange={patch} />}
          {step === 4 && <Step4 draft={draft} onChange={patch} />}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-4">
          <button
            type="button"
            onClick={step === 1 ? onBack : () => setStep(s => (s - 1) as 1 | 2 | 3 | 4)}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={() => canAdvance() && setStep(s => (s + 1) as 1 | 2 | 3 | 4)}
              disabled={!canAdvance()}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Saving...
                </>
              ) : (
                'Save profile'
              )}
            </button>
          )}
        </div>

        <p className="text-[10px] text-gray-400 dark:text-gray-600 text-center mt-3">
          Profile stored locally. Personalisation is invisible to the student.
        </p>
      </div>
    </div>
  );
}
