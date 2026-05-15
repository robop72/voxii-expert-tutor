import React, { useEffect, useState } from 'react';

interface Concept {
  concept_key: string;
  concept_label: string;
  subject: string;
  year_level: number;
  mastery_score: number;
  attempts: number;
  last_seen: string;
}

interface Props {
  profileId: string | null;
  accessToken?: string;
  studentName?: string;
  onBack: () => void;
}

function MasteryBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color =
    score < 0.45
      ? 'bg-red-500'
      : score < 0.70
      ? 'bg-amber-400'
      : 'bg-emerald-500';
  return (
    <div className="flex items-center gap-3 flex-1">
      <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400 w-8 text-right tabular-nums">
        {pct}%
      </span>
    </div>
  );
}

function MasteryBadge({ score }: { score: number }) {
  if (score >= 0.75)
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex-shrink-0">
        Mastered
      </span>
    );
  if (score >= 0.45)
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex-shrink-0">
        Developing
      </span>
    );
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 flex-shrink-0">
      Needs work
    </span>
  );
}

const SUBJECT_COLOURS: Record<string, string> = {
  Mathematics: 'text-indigo-600 dark:text-indigo-400',
  English: 'text-emerald-600 dark:text-emerald-400',
  Science: 'text-blue-600 dark:text-blue-400',
};

export default function MasteryPanel({ profileId, accessToken, studentName, onBack }: Props) {
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!profileId) {
      setLoading(false);
      return;
    }
    const headers: Record<string, string> = {};
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
    fetch(`/api/knowledge-graph?profile_id=${encodeURIComponent(profileId)}`, { headers })
      .then(r => r.json())
      .then(data => setConcepts(data.concepts ?? []))
      .catch(() => setError('Could not load knowledge map.'))
      .finally(() => setLoading(false));
  }, [profileId, accessToken]);

  const bySubject: Record<string, Concept[]> = {};
  for (const c of concepts) {
    (bySubject[c.subject] ??= []).push(c);
  }

  const struggling = concepts.filter(c => c.mastery_score < 0.45).length;
  const developing = concepts.filter(c => c.mastery_score >= 0.45 && c.mastery_score < 0.75).length;
  const mastered = concepts.filter(c => c.mastery_score >= 0.75).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Back"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <svg className="w-5 h-5 text-violet-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Knowledge Map{studentName ? ` — ${studentName}` : ''}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto w-full space-y-4">

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <svg className="animate-spin w-5 h-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Loading knowledge map…
            </div>
          )}

          {/* Error */}
          {error && <p className="text-red-500 text-sm text-center py-8">{error}</p>}

          {/* Empty state */}
          {!loading && !error && concepts.length === 0 && (
            <div className="text-center py-16">
              <svg className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400 font-medium">No concepts tracked yet</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                Start chatting with Voxii to build your knowledge map.
              </p>
            </div>
          )}

          {/* Summary pills */}
          {!loading && concepts.length > 0 && (
            <div className="flex gap-3 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">{mastered} mastered</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-xs font-medium text-amber-700 dark:text-amber-400">{developing} developing</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs font-medium text-red-700 dark:text-red-400">{struggling} need work</span>
              </div>
            </div>
          )}

          {/* Concept groups by subject */}
          {!loading &&
            Object.entries(bySubject).map(([subject, items]) => (
              <div key={subject}>
                <h2 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${SUBJECT_COLOURS[subject] ?? 'text-gray-500 dark:text-gray-400'}`}>
                  {subject}
                </h2>
                <div className="space-y-1.5">
                  {items.map(c => (
                    <div
                      key={c.concept_key}
                      className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-xl px-4 py-3 border border-gray-100 dark:border-gray-800"
                    >
                      <span
                        className="text-sm text-gray-800 dark:text-gray-200 w-44 truncate flex-shrink-0"
                        title={c.concept_label}
                      >
                        {c.concept_label}
                      </span>
                      <MasteryBar score={c.mastery_score} />
                      <MasteryBadge score={c.mastery_score} />
                    </div>
                  ))}
                </div>
              </div>
            ))}

          {/* Legend */}
          {!loading && concepts.length > 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center pb-4">
              Scores update automatically after each tutoring session.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
