import React, { useEffect, useState } from 'react';
import { useParentAnalytics } from '../hooks/useParentAnalytics';
import { getReports, SafetyReport } from '../utils/safety';
import { StrandStat, RecentSession } from '../hooks/useParentAnalytics';
import { StoredProfile } from '../hooks/useStudentProfile';
import { useMfa } from '../hooks/useMfa';
import MfaSetup from './MfaSetup';

function ActivityRing({ minutes, goal }: { minutes: number; goal: number }) {
  const R = 52, C = 2 * Math.PI * R;
  const dash = Math.min(minutes / goal, 1) * C;
  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={R} fill="none" strokeWidth="10" stroke="#374151" />
        <circle cx="60" cy="60" r={R} fill="none" strokeWidth="10" stroke="url(#ringGrad)"
          strokeLinecap="round" strokeDasharray={`${dash} ${C}`} className="transition-all duration-700" />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="text-center">
        <p className="text-2xl font-bold text-white">{minutes}</p>
        <p className="text-xs text-gray-400">/ {goal} min</p>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon }: { label: string; value: string | number; sub?: string; icon: string }) {
  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
      <div className="text-xl mb-1">{icon}</div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs font-medium text-gray-400 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function StrandBar({ emoji, id, count, max, badgeBg, badgeText }: StrandStat & { max: number }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-lg w-6 text-center">{emoji}</span>
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-300">{id}</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeBg} ${badgeText}`}>
            {count} {count === 1 ? 'question' : 'questions'}
          </span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${pct === 0 ? 'bg-gray-600' : 'bg-gradient-to-r from-indigo-400 to-violet-500'}`}
            style={{ width: `${Math.max(pct, count > 0 ? 4 : 0)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function DayBar({ day, count, max }: { day: string; count: number; max: number }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <div className="w-full h-20 flex items-end">
        <div className="w-full rounded-t-md bg-indigo-500 transition-all duration-700"
          style={{ height: `${Math.max(pct, count > 0 ? 8 : 0)}%` }} />
      </div>
      <span className="text-xs text-gray-500">{day}</span>
      {count > 0 && <span className="text-xs font-medium text-indigo-400">{count}</span>}
    </div>
  );
}

function SessionRow({ title, date, strandEmoji, strand, messageCount }: RecentSession) {
  const dateStr = date.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-700 last:border-0">
      <div className="w-8 h-8 rounded-full bg-indigo-900/40 flex items-center justify-center text-sm flex-shrink-0">
        {strandEmoji ?? '📚'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{title}</p>
        <p className="text-xs text-gray-400">
          {dateStr} · {messageCount} {messageCount === 1 ? 'question' : 'questions'}
          {strand ? ` · ${strand}` : ''}
        </p>
      </div>
    </div>
  );
}

function ComingSoonCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 relative overflow-hidden opacity-80">
      <div className="absolute top-3 right-3">
        <span className="text-xs font-semibold bg-amber-900/40 text-amber-400 px-2 py-0.5 rounded-full">Coming soon</span>
      </div>
      <div className="text-2xl mb-2">{icon}</div>
      <h3 className="font-semibold text-white text-sm mb-1">{title}</h3>
      <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}

interface Props {
  onBack: () => void;
  onSignOut?: () => void;
  profiles?: StoredProfile[];
  activeProfileId?: string | null;
  onSwitchProfile?: (id: string) => void;
}

export default function ParentDashboard({ onBack, onSignOut, profiles = [], activeProfileId, onSwitchProfile }: Props) {
  const analytics = useParentAnalytics();
  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [showPinReset, setShowPinReset] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSaved, setPinSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const { enrolledFactor, unenroll } = useMfa(true);
  const [mfaUnenrolling, setMfaUnenrolling] = useState(false);

  useEffect(() => {
    setReports(getReports());
  }, []);

  function handleDeleteData() {
    if (deleteConfirmText !== 'DELETE') {
      setDeleteError('Type DELETE (in capitals) to confirm.');
      return;
    }
    const keysToRemove = Object.keys(localStorage).filter(k => k.startsWith('voxii-'));
    keysToRemove.forEach(k => localStorage.removeItem(k));
    sessionStorage.removeItem('voxii-parent-auth');
    onBack();
  }

  function handlePinReset() {
    if (!/^\d{4,6}$/.test(newPin)) {
      setPinError('PIN must be 4–6 digits.');
      return;
    }
    localStorage.setItem('voxii-parent-pin', newPin);
    setNewPin('');
    setPinError('');
    setPinSaved(true);
    setTimeout(() => { setPinSaved(false); setShowPinReset(false); }, 1500);
  }

  const {
    studentName, sessionsThisWeek, estimatedMinutes, weeklyGoal,
    totalSessions, totalMessages, strandCoverage, maxStrandCount,
    topStrand, recentSessions, activityByDay, maxDayCount,
  } = analytics;

  const topicsCount = strandCoverage.filter(s => s.count > 0).length;

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="sticky top-0 z-10 bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/voxii-logo.png" alt="Voxii AI" className="h-7 object-contain" />
          <span className="text-sm text-gray-500">Parent Portal</span>
        </div>
        <button
          onClick={async () => {
            sessionStorage.removeItem('voxii-parent-auth');
            if (onSignOut) await onSignOut();
            onBack();
          }}
          className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
        >
          Sign out
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-white">{studentName}&apos;s Progress</h1>
            {profiles.length > 1 && onSwitchProfile && (
              <select
                value={activeProfileId ?? ''}
                onChange={e => onSwitchProfile(e.target.value)}
                className="text-sm bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-1.5 outline-none cursor-pointer hover:border-gray-600 transition-colors"
              >
                {profiles.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.student_name || 'Student'} — Year {p.year_level}
                  </option>
                ))}
              </select>
            )}
          </div>
          <p className="text-sm text-gray-400 mt-0.5">
            Week of {new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <section className="bg-gray-800 rounded-2xl border border-gray-700 p-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">This Week's Activity</h2>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <ActivityRing minutes={estimatedMinutes} goal={weeklyGoal} />
              <p className="text-xs text-gray-400 text-center">
                {estimatedMinutes >= weeklyGoal ? 'Weekly goal reached! 🎉' : `${weeklyGoal - estimatedMinutes} min to weekly goal`}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 flex-1 w-full">
              <StatCard icon="💬" label="Sessions this week" value={sessionsThisWeek} />
              <StatCard icon="❓" label="Questions asked" value={totalMessages} sub="all time" />
              <StatCard icon="📚" label="Topics covered" value={`${topicsCount}/6`} sub="curriculum strands" />
              <StatCard icon={topStrand?.emoji ?? '🌟'} label="Top strand"
                value={topStrand?.id ?? 'None'} sub={topStrand ? `${topStrand.count} questions` : 'No data yet'} />
            </div>
          </div>
        </section>

        <section className="bg-gray-800 rounded-2xl border border-gray-700 p-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Sessions by Day</h2>
          <div className="flex gap-2 items-end h-28">
            {activityByDay.map(d => <DayBar key={d.day} day={d.day} count={d.count} max={maxDayCount} />)}
          </div>
          <p className="text-xs text-gray-500 mt-2">{totalSessions} total sessions all time</p>
        </section>

        <section className="bg-gray-800 rounded-2xl border border-gray-700 p-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Curriculum Strand Coverage</h2>
          {totalMessages === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              No activity yet. Strand coverage will appear once {studentName} starts asking questions.
            </p>
          ) : (
            <div className="space-y-4">
              {strandCoverage.map(s => <StrandBar key={s.id} {...s} max={maxStrandCount} />)}
            </div>
          )}
        </section>

        <section className="bg-gray-800 rounded-2xl border border-gray-700 p-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Recent Sessions</h2>
          {recentSessions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No sessions yet.</p>
          ) : (
            recentSessions.map(s => <SessionRow key={s.id} {...s} />)
          )}
        </section>

        {reports.length > 0 && (
          <section className="bg-gray-800 rounded-2xl border border-red-900/40 p-5">
            <h2 className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6H12.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
              Flagged Responses ({reports.length})
            </h2>
            <p className="text-xs text-gray-400 mb-3">Responses your student marked as wrong or inappropriate.</p>
            <div className="space-y-3">
              {reports.map(r => (
                <div key={r.id} className="rounded-xl bg-red-900/20 border border-red-800 p-3">
                  <p className="text-xs text-red-400 font-medium mb-1">
                    {new Date(r.reportedAt).toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                  <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">{r.messageText}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="bg-gray-800 rounded-2xl border border-gray-700 p-5 space-y-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Account</h2>

          {/* PIN reset */}
          {!showPinReset ? (
            <button
              onClick={() => { setShowPinReset(true); setPinSaved(false); setShowDeleteConfirm(false); }}
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Reset parent portal PIN
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-300">Enter a new PIN (4–6 digits):</p>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={newPin}
                onChange={e => { setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6)); setPinError(''); }}
                placeholder="New PIN"
                className="w-full px-3 py-2 rounded-xl border border-gray-600 bg-gray-900 text-white text-sm outline-none focus:border-blue-500 transition-colors"
              />
              {pinError && <p className="text-xs text-red-400">{pinError}</p>}
              {pinSaved && <p className="text-xs text-green-400">PIN updated successfully.</p>}
              <div className="flex gap-2">
                <button
                  onClick={handlePinReset}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-colors"
                >
                  Save new PIN
                </button>
                <button
                  onClick={() => { setShowPinReset(false); setNewPin(''); setPinError(''); }}
                  className="flex-1 py-2 rounded-xl text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* 2-step verification */}
          <div className="border-t border-gray-700 pt-4">
            {showMfaSetup ? (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-white mb-3">Set up 2-step verification</p>
                <MfaSetup sessionReady={true} onDone={() => setShowMfaSetup(false)} />
              </div>
            ) : enrolledFactor ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <div>
                    <p className="text-sm text-white font-medium">2-step verification enabled</p>
                    <p className="text-xs text-gray-400">Your account is protected with an authenticator app.</p>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    setMfaUnenrolling(true);
                    try { await unenroll(enrolledFactor.id); } catch {}
                    setMfaUnenrolling(false);
                  }}
                  disabled={mfaUnenrolling}
                  className="text-xs text-gray-500 hover:text-red-400 transition-colors disabled:opacity-50 flex-shrink-0"
                >
                  {mfaUnenrolling ? 'Removing…' : 'Remove'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setShowMfaSetup(true); setShowPinReset(false); setShowDeleteConfirm(false); }}
                className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Enable 2-step verification
              </button>
            )}
          </div>

          {/* Right to deletion */}
          <div className="border-t border-gray-700 pt-4">
            {!showDeleteConfirm ? (
              <button
                onClick={() => { setShowDeleteConfirm(true); setShowPinReset(false); setDeleteConfirmText(''); setDeleteError(''); }}
                className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete all student data from this device
              </button>
            ) : (
              <div className="space-y-3 rounded-xl border border-red-800 bg-red-900/20 p-4">
                <p className="text-sm font-semibold text-red-400">Delete all data?</p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  This will permanently erase the student profile, all chat history, and your parent PIN from this device. This cannot be undone.
                </p>
                <p className="text-xs text-gray-300">Type <span className="font-mono font-bold text-red-400">DELETE</span> to confirm:</p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={e => { setDeleteConfirmText(e.target.value); setDeleteError(''); }}
                  placeholder="DELETE"
                  className="w-full px-3 py-2 rounded-xl border border-red-700 bg-gray-900 text-white text-sm outline-none focus:border-red-500 transition-colors"
                />
                {deleteError && <p className="text-xs text-red-400">{deleteError}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={handleDeleteData}
                    className="flex-1 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
                  >
                    Delete all data
                  </button>
                  <button
                    onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); setDeleteError(''); }}
                    className="flex-1 py-2 rounded-xl text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">More Features Coming Soon</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ComingSoonCard icon="🌳" title="Curriculum Mastery Tree"
              description="Visual map of every topic. See what's been mastered and what still needs work." />
            <ComingSoonCard icon="🔍" title="Struggle & Success Insights"
              description="AI-powered analysis of where your student gets stuck and where they shine." />
            <ComingSoonCard icon="📧" title="Weekly Progress Email"
              description="Receive a summary of your child's learning activity every Sunday evening." />
            <ComingSoonCard icon="⚙️" title="Account & Subscription"
              description="Manage your plan, update your PIN, and control tutor settings." />
          </div>
        </section>

        <div className="pb-6 text-center">
          <button onClick={onBack} className="text-sm text-gray-400 hover:text-gray-200 transition-colors">
            ← Back to tutor
          </button>
        </div>
      </main>
    </div>
  );
}
