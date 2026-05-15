import React, { useState } from 'react';
import type { Subject } from '../lib/curriculumConfig';
import type { StoredProfile } from '../hooks/useStudentProfile';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: string;
  topic: string;
}

interface GeneratedQuiz {
  title: string;
  questions: QuizQuestion[];
}

interface FeedbackItem {
  id: string;
  correct: boolean;
  explanation: string;
}

interface QuizResult {
  score: number;
  max_score: number;
  overall_message: string;
  feedback: FeedbackItem[];
}

type Stage = 'setup' | 'generating' | 'quiz' | 'submitting' | 'results';

interface Props {
  subject: Subject;
  yearLevel: number;
  profile: StoredProfile | null;
  recentSummaries: string[];
  accessToken?: string;
  onBack: () => void;
}

const SUBJECT_EMOJI: Record<string, string> = {
  Maths: '📐',
  English: '📖',
  Science: '🔬',
};

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

function ScoreRing({ score, max }: { score: number; max: number }) {
  const pct = max > 0 ? score / max : 0;
  const r = 40;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;
  const color = pct >= 0.8 ? '#22c55e' : pct >= 0.6 ? '#3b82f6' : pct >= 0.4 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="112" height="112" viewBox="0 0 112 112">
        <circle cx="56" cy="56" r={r} fill="none" stroke="currentColor" strokeWidth="8"
          className="text-gray-200 dark:text-gray-700" />
        <circle cx="56" cy="56" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease' }} />
      </svg>
      <div className="text-center">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{score}</span>
        <span className="text-sm text-gray-400 dark:text-gray-500">/{max}</span>
      </div>
    </div>
  );
}

export default function QuizView({ subject, yearLevel, profile, recentSummaries, accessToken, onBack }: Props) {
  const [stage, setStage] = useState<Stage>('setup');
  const [questionCount, setQuestionCount] = useState<5 | 10>(5);
  const [quiz, setQuiz] = useState<GeneratedQuiz | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState('');

  async function generateQuiz() {
    setStage('generating');
    setError('');
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          subject,
          year_level: yearLevel,
          student_profile: profile,
          recent_summaries: recentSummaries,
          question_count: questionCount,
        }),
      });
      if (!res.ok) throw new Error('Failed to generate quiz');
      const data: GeneratedQuiz = await res.json();
      if (!data.questions?.length) throw new Error('No questions returned');
      setQuiz(data);
      setCurrentQ(0);
      setAnswers({});
      setStage('quiz');
    } catch {
      setError('Could not generate quiz. Please try again.');
      setStage('setup');
    }
  }

  async function submitQuiz() {
    if (!quiz) return;
    setStage('submitting');
    setError('');
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
      const res = await fetch('/api/quiz-feedback', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          quiz,
          answers,
          subject,
          year_level: yearLevel,
          student_name: profile?.student_name || undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to get feedback');
      const data: QuizResult = await res.json();
      setResult(data);
      setStage('results');
    } catch {
      setError('Could not load feedback. Please try again.');
      setStage('quiz');
    }
  }

  function selectAnswer(letter: string) {
    if (!quiz) return;
    const qId = quiz.questions[currentQ].id;
    setAnswers(prev => ({ ...prev, [qId]: letter }));
  }

  function handleNext() {
    if (!quiz) return;
    if (currentQ < quiz.questions.length - 1) {
      setCurrentQ(q => q + 1);
    } else {
      submitQuiz();
    }
  }

  function handleRetry() {
    setQuiz(null);
    setAnswers({});
    setResult(null);
    setCurrentQ(0);
    setStage('setup');
  }

  // ── Setup ────────────────────────────────────────────────────────────────────
  if (stage === 'setup') {
    return (
      <div className="h-[100dvh] bg-gray-50 dark:bg-gray-950 flex flex-col">
        <div className="flex-shrink-0 flex items-center gap-3 px-4 pt-5 pb-4 max-w-lg w-full mx-auto">
          <button onClick={onBack} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <img src="/voxii-logo.png" alt="Voxii AI" className="h-7 object-contain" />
        </div>

        <div className="flex-1 overflow-y-auto px-4 max-w-lg w-full mx-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="text-5xl">{SUBJECT_EMOJI[subject] ?? '📝'}</div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Practice Quiz</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Year {yearLevel} · {subject}
              </p>
              {recentSummaries.length > 0 && (
                <p className="text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg px-3 py-1.5">
                  Questions based on your recent study topics
                </p>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">How many questions?</p>
              <div className="grid grid-cols-2 gap-3">
                {([5, 10] as const).map(n => (
                  <button
                    key={n}
                    onClick={() => setQuestionCount(n)}
                    className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all ${
                      questionCount === n
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300'
                    }`}
                  >
                    <span className={`text-2xl font-bold ${questionCount === n ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'}`}>
                      {n}
                    </span>
                    <span className={`text-xs font-medium ${questionCount === n ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      {n === 5 ? 'Quick Quiz' : 'Full Test'}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">
                      ~{n === 5 ? '3–4' : '6–8'} mins
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 dark:text-red-400 text-center">{error}</p>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 px-4 pt-3 pb-5 max-w-lg w-full mx-auto">
          <button
            onClick={generateQuiz}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 active:scale-[0.98] transition-all shadow-md shadow-blue-200 dark:shadow-blue-900/30"
          >
            Generate Quiz →
          </button>
        </div>
      </div>
    );
  }

  // ── Generating / Submitting ───────────────────────────────────────────────────
  if (stage === 'generating' || stage === 'submitting') {
    return (
      <div className="h-[100dvh] bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center gap-4">
        <svg className="w-10 h-10 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {stage === 'generating' ? 'Generating your quiz…' : 'Marking your answers…'}
        </p>
      </div>
    );
  }

  // ── Quiz ─────────────────────────────────────────────────────────────────────
  if (stage === 'quiz' && quiz) {
    const q = quiz.questions[currentQ];
    const selected = answers[q.id];
    const isLast = currentQ === quiz.questions.length - 1;
    const progress = ((currentQ) / quiz.questions.length) * 100;

    return (
      <div className="h-[100dvh] bg-gray-50 dark:bg-gray-950 flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 px-4 pt-4 pb-2 max-w-lg w-full mx-auto">
          <div className="flex items-center justify-between mb-3">
            <button onClick={onBack} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Question {currentQ + 1} of {quiz.questions.length}
            </span>
            <div className="w-8" />
          </div>
          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="flex-1 overflow-y-auto px-4 max-w-lg w-full mx-auto py-2">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 space-y-5">
            {q.topic && (
              <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                {q.topic}
              </span>
            )}
            <p className="text-base font-medium text-gray-900 dark:text-white leading-snug">
              {q.question}
            </p>
            <div className="space-y-2.5">
              {q.options.map((opt, i) => {
                const letter = OPTION_LETTERS[i];
                const isSelected = selected === letter;
                return (
                  <button
                    key={letter}
                    onClick={() => selectAnswer(letter)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600'
                    }`}
                  >
                    <span className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                    }`}>
                      {letter}
                    </span>
                    <span className={`text-sm ${isSelected ? 'text-blue-700 dark:text-blue-300 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                      {opt.replace(/^[A-D]\)\s*/, '')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-shrink-0 px-4 pt-2 pb-5 max-w-lg w-full mx-auto">
          {error && <p className="text-sm text-red-500 text-center mb-2">{error}</p>}
          <button
            onClick={handleNext}
            disabled={!selected}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
          >
            {isLast ? 'Submit Quiz' : 'Next →'}
          </button>
        </div>
      </div>
    );
  }

  // ── Results ───────────────────────────────────────────────────────────────────
  if (stage === 'results' && result && quiz) {
    const pct = result.max_score > 0 ? result.score / result.max_score : 0;
    const grade = pct >= 0.8 ? 'Excellent!' : pct >= 0.6 ? 'Good work!' : pct >= 0.4 ? 'Keep going!' : 'Keep practising!';

    return (
      <div className="h-[100dvh] bg-gray-50 dark:bg-gray-950 flex flex-col">
        <div className="flex-shrink-0 flex items-center justify-between px-4 pt-5 pb-2 max-w-lg w-full mx-auto">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Quiz Complete!</h2>
          <button onClick={onBack} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 max-w-lg w-full mx-auto space-y-4 pb-4">
          {/* Score card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 flex flex-col items-center gap-3 text-center">
            <ScoreRing score={result.score} max={result.max_score} />
            <p className="text-lg font-bold text-gray-900 dark:text-white">{grade}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-xs">
              {result.overall_message}
            </p>
          </div>

          {/* Per-question breakdown */}
          <div className="space-y-2.5">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest px-1">Question Breakdown</p>
            {quiz.questions.map((q, i) => {
              const fb = result.feedback.find(f => f.id === q.id);
              const correct = fb?.correct ?? false;
              return (
                <div
                  key={q.id}
                  className={`bg-white dark:bg-gray-900 rounded-xl border p-4 space-y-2 ${
                    correct
                      ? 'border-green-200 dark:border-green-800/50'
                      : 'border-red-200 dark:border-red-800/50'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                      correct ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/40 text-red-500 dark:text-red-400'
                    }`}>
                      {correct
                        ? <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        : <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                      }
                    </span>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-snug flex-1">
                      {i + 1}. {q.question}
                    </p>
                  </div>
                  {!correct && answers[q.id] && (
                    <div className="ml-7 flex gap-3 text-xs">
                      <span className="text-red-500 dark:text-red-400">Your answer: {answers[q.id]}</span>
                      <span className="text-green-600 dark:text-green-400">Correct: {q.correct}</span>
                    </div>
                  )}
                  {fb?.explanation && (
                    <p className="ml-7 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      {fb.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 px-4 pt-2 pb-5 max-w-lg w-full mx-auto flex gap-3">
          <button
            onClick={handleRetry}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={onBack}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 active:scale-[0.98] transition-all"
          >
            Back to Chat
          </button>
        </div>
      </div>
    );
  }

  return null;
}
