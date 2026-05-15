import React, { useState } from 'react';
import {
  StudentProfile, IntakeQuestionnaire, SubjectPerformance,
  EngagementTone, GuidancePreference, deriveProfileClientSide,
} from '../lib/studentProfile';
import { ALLOWED_SUBJECTS } from '../lib/curriculumConfig';
import { AVATARS, getAvatar } from '../lib/avatars';


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
  tts_enabled: true,
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

// ── Step 0: Parental consent ──────────────────────────────────────────────────

interface Step0Props {
  parentName: string;
  setParentName: (v: string) => void;
  parentEmail: string;
  setParentEmail: (v: string) => void;
  parentMobile: string;
  setParentMobile: (v: string) => void;
  parentPin: string;
  setParentPin: (v: string) => void;
  consentChecked: boolean;
  setConsentChecked: (v: boolean) => void;
  nameTouched: boolean;
  setNameTouched: (v: boolean) => void;
  emailTouched: boolean;
  setEmailTouched: (v: boolean) => void;
  pinTouched: boolean;
  setPinTouched: (v: boolean) => void;
}

function Step0({
  parentName, setParentName, parentEmail, setParentEmail,
  parentMobile, setParentMobile, parentPin, setParentPin,
  consentChecked, setConsentChecked,
  nameTouched, setNameTouched,
  emailTouched, setEmailTouched, pinTouched, setPinTouched,
}: Step0Props) {
  const nameValid = parentName.trim().length >= 2;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail);
  const pinValid = /^\d{4,6}$/.test(parentPin);

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
        <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">What data is collected</h3>
        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
          <li>Your child's first name (optional), year level, and subjects</li>
          <li>Learning preferences (tone, guidance style, focus time)</li>
          <li>Your name and email — stored as one-way hashes for consent records only</li>
        </ul>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Chat history is stored on this device only and automatically deleted after 30 days.
        </p>
        <a href="#" className="text-xs text-blue-600 dark:text-blue-400 underline mt-1 inline-block">
          Read our full privacy policy
        </a>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Your full name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={parentName}
          onChange={e => setParentName(e.target.value)}
          onBlur={() => setNameTouched(true)}
          placeholder="e.g. Jane Smith"
          className={`w-full px-3 py-2 rounded-xl border text-sm outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
            nameTouched && !nameValid
              ? 'border-red-400 focus:border-red-500'
              : 'border-gray-300 dark:border-gray-600 focus:border-blue-400'
          }`}
        />
        {nameTouched && !nameValid && (
          <p className="text-xs text-red-400 mt-1">Please enter your full name.</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Parent or guardian email <span className="text-red-400">*</span>
        </label>
        <input
          type="email"
          value={parentEmail}
          onChange={e => setParentEmail(e.target.value)}
          onBlur={() => setEmailTouched(true)}
          placeholder="you@example.com"
          className={`w-full px-3 py-2 rounded-xl border text-sm outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
            emailTouched && !emailValid
              ? 'border-red-400 focus:border-red-500'
              : 'border-gray-300 dark:border-gray-600 focus:border-blue-400'
          }`}
        />
        {emailTouched && !emailValid && (
          <p className="text-xs text-red-400 mt-1">Please enter a valid email address.</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Mobile number <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          type="tel"
          value={parentMobile}
          onChange={e => setParentMobile(e.target.value)}
          placeholder="e.g. 0412 345 678"
          className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm outline-none focus:border-blue-400 transition-colors"
        />
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Used only for account recovery. Never shared.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Set a parent portal PIN <span className="text-red-400">*</span>
        </label>
        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={parentPin}
          onChange={e => setParentPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
          onBlur={() => setPinTouched(true)}
          placeholder="4–6 digits"
          className={`w-full px-3 py-2 rounded-xl border text-sm outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
            pinTouched && !pinValid
              ? 'border-red-400 focus:border-red-500'
              : 'border-gray-300 dark:border-gray-600 focus:border-blue-400'
          }`}
        />
        {pinTouched && !pinValid && (
          <p className="text-xs text-red-400 mt-1">PIN must be 4–6 digits.</p>
        )}
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          This PIN protects the parent dashboard on this device.
        </p>
      </div>

      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => setConsentChecked(!consentChecked)}
          className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            consentChecked
              ? 'bg-blue-500 border-blue-500'
              : 'border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-800'
          }`}
        >
          {consentChecked && (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          I am the parent or guardian of the student who will use this app, and I consent to the{' '}
          <a href="#" className="text-blue-600 dark:text-blue-400 underline">privacy policy</a>.
          <span className="text-red-400"> *</span>
        </p>
      </div>
    </div>
  );
}

// ── Step 1: Student details ───────────────────────────────────────────────────

function Step1({ draft, onChange, selectedAvatar, onAvatarChange }: {
  draft: IntakeQuestionnaire;
  onChange: (p: Partial<IntakeQuestionnaire>) => void;
  selectedAvatar: string;
  onAvatarChange: (id: string) => void;
}) {
  return (
    <div className="space-y-5">
      {/* Avatar picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Choose an avatar</label>
        <div className="grid grid-cols-6 gap-2">
          {AVATARS.map(a => (
            <button
              key={a.id}
              type="button"
              onClick={() => onAvatarChange(a.id)}
              className={`flex flex-col items-center gap-1 p-1 rounded-xl transition-all ${
                selectedAvatar === a.id ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 ' + a.ring : 'opacity-70 hover:opacity-100'
              }`}
            >
              <div className={`w-10 h-10 rounded-full ${a.bg} flex items-center justify-center text-xl`}>
                {a.emoji}
              </div>
            </button>
          ))}
        </div>
      </div>

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

function Step4({ draft, onChange, studentPin, onStudentPinChange }: {
  draft: IntakeQuestionnaire;
  onChange: (p: Partial<IntakeQuestionnaire>) => void;
  studentPin: string;
  onStudentPinChange: (v: string) => void;
}) {
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

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <Toggle
          value={draft.tts_enabled}
          onChange={v => onChange({ tts_enabled: v })}
          label="Enable read-aloud (accessibility feature)"
        />
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 pl-0">
          Allows Voxii to read responses aloud using text-to-speech.
        </p>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Student PIN <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={studentPin}
          onChange={e => onStudentPinChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="4–6 digits"
          className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm outline-none focus:border-blue-400 transition-colors"
        />
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Keeps this student's sessions private when sharing the app with siblings. Leave blank for no PIN.
        </p>
      </div>
    </div>
  );
}

// ── Main IntakeForm ───────────────────────────────────────────────────────────

// Steps: 0 = consent, 1 = details, 2 = subjects, 3 = performance, 4 = preferences
// When editing an existing profile, Step 0 is skipped (consent already given).
const STEP_TITLES = ['Parental consent', 'Student details', 'Subjects', 'Performance', 'Preferences'];
const TOTAL_STEPS = 5;

export default function IntakeForm({ onComplete, onBack, onClear, initialProfile }: Props) {
  const isEditing = !!initialProfile;
  const hasPin = !!localStorage.getItem('voxii-parent-pin');
  // Skip consent if parent already set a PIN (consent already given for this account)
  const firstStep = hasPin ? 1 : 0;
  const [step, setStep] = useState<number>(firstStep);

  // Consent fields (Step 0 only, not persisted to profile)
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentMobile, setParentMobile] = useState('');
  const [parentPin, setParentPin] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [pinTouched, setPinTouched] = useState(false);

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
        tts_enabled: initialProfile.tts_enabled ?? true,
      };
    }
    return { ...DEFAULT_DRAFT };
  });
  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    initialProfile?.avatar ?? AVATARS[Math.floor(Math.random() * AVATARS.length)].id
  );
  const [studentPin, setStudentPin] = useState(initialProfile?.student_pin ?? '');
  const [submitting, setSubmitting] = useState(false);

  function patch(p: Partial<IntakeQuestionnaire>) {
    setDraft(prev => ({ ...prev, ...p }));
  }

  function canAdvance(): boolean {
    if (step === 0) {
      const nameValid = parentName.trim().length >= 2;
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail);
      const pinValid = /^\d{4,6}$/.test(parentPin);
      return nameValid && emailValid && pinValid && consentChecked;
    }
    if (step === 2 && draft.selected_subjects.length === 0) return false;
    return true;
  }

  function handleNext() {
    if (step === 0) {
      setNameTouched(true);
      setEmailTouched(true);
      setPinTouched(true);
    }
    if (!canAdvance()) return;
    setStep(s => s + 1);
  }

  function handleBack() {
    if (step === firstStep) {
      onBack();
    } else {
      setStep(s => s - 1);
    }
  }

  async function saveProfile(showSpinner = true) {
    if (showSpinner) setSubmitting(true);
    if (parentPin) localStorage.setItem('voxii-parent-pin', parentPin);
    const extra: Partial<StudentProfile> = {
      id: initialProfile?.id,
      avatar: selectedAvatar,
      student_pin: studentPin.length >= 4 ? studentPin : undefined,
    };
    try {
      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...draft,
          parent_name: parentName.trim() || undefined,
          parent_email: parentEmail || undefined,
          parent_mobile: parentMobile.trim() || undefined,
          consent_given: isEditing ? true : consentChecked,
        }),
      });
      if (!res.ok) throw new Error('API error');
      const profile: StudentProfile = await res.json();
      onComplete({ ...profile, ...extra });
    } catch {
      const profile = deriveProfileClientSide(draft);
      onComplete({ ...profile, ...extra });
    } finally {
      if (showSpinner) setSubmitting(false);
    }
  }

  async function handleSubmit() { await saveProfile(true); }
  async function handleSaveNow() { await saveProfile(true); }

  const isLastStep = step === 4;
  const isFirstStep = step === firstStep;
  const totalDisplaySteps = TOTAL_STEPS - firstStep;
  const displayStep = step - firstStep + 1;
  const progress = ((step - firstStep) / (TOTAL_STEPS - 1 - firstStep)) * 100;

  return (
    <div className="h-[100dvh] bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* ── Fixed header ── */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 pt-4 pb-2 max-w-lg w-full mx-auto">
        <img src="/voxii-logo.png" alt="Voxii AI" className="h-7 object-contain" />
        {initialProfile && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 dark:text-red-400 border border-red-300 dark:border-red-700/60 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear
          </button>
        )}
      </div>

      {/* ── Fixed progress bar ── */}
      <div className="flex-shrink-0 px-4 pb-3 max-w-lg w-full mx-auto">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
          <span className="font-medium text-gray-700 dark:text-gray-300">{STEP_TITLES[step]}</span>
          <span>Step {displayStep} of {totalDisplaySteps}</span>
        </div>
        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* ── Scrollable card content ── */}
      <div className="flex-1 overflow-y-auto px-4 max-w-lg w-full mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
          {step === 0 && (
            <Step0
              parentName={parentName} setParentName={setParentName}
              parentEmail={parentEmail} setParentEmail={setParentEmail}
              parentMobile={parentMobile} setParentMobile={setParentMobile}
              parentPin={parentPin} setParentPin={setParentPin}
              consentChecked={consentChecked} setConsentChecked={setConsentChecked}
              nameTouched={nameTouched} setNameTouched={setNameTouched}
              emailTouched={emailTouched} setEmailTouched={setEmailTouched}
              pinTouched={pinTouched} setPinTouched={setPinTouched}
            />
          )}
          {step === 1 && <Step1 draft={draft} onChange={patch} selectedAvatar={selectedAvatar} onAvatarChange={setSelectedAvatar} />}
          {step === 2 && <Step2 draft={draft} onChange={patch} />}
          {step === 3 && <Step3 draft={draft} onChange={patch} />}
          {step === 4 && <Step4 draft={draft} onChange={patch} studentPin={studentPin} onStudentPinChange={setStudentPin} />}
        </div>
      </div>

      {/* ── Fixed navigation ── */}
      <div className="flex-shrink-0 px-4 pt-3 pb-4 max-w-lg w-full mx-auto space-y-2">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {isFirstStep ? 'Cancel' : 'Back'}
          </button>

          {!isLastStep ? (
            <button
              type="button"
              onClick={handleNext}
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
              ) : 'Save profile'}
            </button>
          )}
        </div>

        {isEditing && !isLastStep && (
          <button
            type="button"
            onClick={handleSaveNow}
            disabled={submitting}
            className="w-full py-2 rounded-xl text-sm font-medium text-green-600 dark:text-green-400 border border-green-300 dark:border-green-700/60 hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
          >
            {submitting ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save and close
              </>
            )}
          </button>
        )}

        <p className="text-[10px] text-gray-400 dark:text-gray-600 text-center">
          Profile stored locally. Personalisation is invisible to the student.
        </p>
      </div>
    </div>
  );
}
