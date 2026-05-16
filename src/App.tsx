import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabase';
import ChatInterface from './components/ChatInterface';
import Sidebar from './components/Sidebar';
import ParentPin from './components/ParentPin';
import ParentDashboard from './components/ParentDashboard';
import IntakeForm from './components/IntakeForm';
import AuthScreen from './components/AuthScreen';
import ProfilePicker from './components/ProfilePicker';
import StreakDisplay from './components/StreakDisplay';
import MilestoneModal from './components/MilestoneModal';
import QuizView from './components/QuizView';
import MfaVerify from './components/MfaVerify';
import MasteryPanel from './components/MasteryPanel';
import StudyToolsView from './components/StudyToolsView';
import { useTheme } from './hooks/useTheme';
import { useChat } from './hooks/useChat';
import { useStudentProfile } from './hooks/useStudentProfile';
import { useStreak } from './hooks/useStreak';
import { useAuth } from './hooks/useAuth';
import { useMfa } from './hooks/useMfa';
import { useSessionSummaries } from './hooks/useSessionSummaries';
import type { Message } from './hooks/useChat';
import { YearLevel, Subject, ALLOWED_YEAR_LEVELS, ALLOWED_SUBJECTS } from './lib/curriculumConfig';
import { getCurriculumAuthority, getCurriculumFullName } from './lib/studentProfile';

type View = 'chat' | 'parent-pin' | 'parent-dashboard' | 'intake' | 'intake-new' | 'profile-picker' | 'quiz' | 'knowledge-map' | 'study-tools';

export default function App() {
  // ── All hooks must be called unconditionally before any early returns ──────
  const { session, loading: authLoading, supabaseEnabled, authError, signOut } = useAuth();
  const { enrolledFactor, needsVerification, verifyLogin } = useMfa(supabaseEnabled && !authLoading && !!session);
  const { dark, toggle } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );
  const [yearLevel, setYearLevel] = useState<YearLevel>(9);
  const [subject, setSubject] = useState<Subject>('Maths');
  const [isNaplanMode, setIsNaplanMode] = useState(false);
  const [view, setView] = useState<View>('chat');

  const {
    profile, profiles, activeProfileId,
    setActiveProfile, saveProfile, deleteProfile, clearProfile, restoreProfiles,
  } = useStudentProfile();

  const { data: streakData, milestone, recordMessage, dismissMilestone } = useStreak(activeProfileId);
  const { getRecentForSubject, addSummary } = useSessionSummaries(activeProfileId);

  useEffect(() => {
    if (view === 'parent-pin' && sessionStorage.getItem('voxii-parent-auth') === 'true') {
      setView('parent-dashboard');
    }
  }, [view]);

  // Restore profiles from Supabase when localStorage is empty (new device / cleared storage)
  // Uses getUser() for fresh server data — session.user.user_metadata can be stale JWT data
  useEffect(() => {
    if (!session || !supabaseEnabled || profiles.length > 0) return;
    supabase?.auth.getUser().then(({ data }) => {
      const cloud = data.user?.user_metadata?.voxii_profiles as import('./hooks/useStudentProfile').StoredProfile[] | undefined;
      if (cloud?.length) restoreProfiles(cloud);
    });
  }, [session?.user.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep Supabase metadata in sync whenever profiles change
  useEffect(() => {
    if (!session || !supabaseEnabled || profiles.length === 0) return;
    supabase?.auth.updateUser({ data: { voxii_profiles: profiles } });
  }, [profiles, session?.user.id, supabaseEnabled]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (profile) {
      setYearLevel(profile.year_level as YearLevel);
      const first = profile.selected_subjects[0] as Subject | undefined;
      if (first) setSubject(first);
    }
  }, [profile]);

  const handleSessionComplete = useCallback(async (sessionId: string, msgs: Message[], subj: string) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;
      const res = await fetch('/api/summarise', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          session_id: sessionId,
          messages: msgs.map(m => ({ role: m.role === 'tutor' ? 'tutor' : 'user', text: m.text })),
          subject: subj,
          year_level: `Year ${yearLevel}`,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.summary) addSummary(sessionId, subj, data.summary);
      }
    } catch {}
  }, [session?.access_token, yearLevel, addSummary]);

  const {
    sessions, currentId, messages, isLoading, apiSessionId,
    sendMessage: sendMessageRaw, startNewChat, loadSession, deleteSession,
    togglePin, renameSession, cancelMessage,
  } = useChat({
    yearLevel, subject, isNaplanMode,
    studentProfile: profile,
    accessToken: session?.access_token,
    profileId: activeProfileId,
    recentSummaries: getRecentForSubject(subject),
    onSessionComplete: handleSessionComplete,
    onUnauthorized: supabaseEnabled ? signOut : undefined,
  });

  const sendMessage = useCallback((msg: string) => {
    recordMessage();
    sendMessageRaw(msg);
  }, [sendMessageRaw, recordMessage]);

  // ── Auth gate ─────────────────────────────────────────────────────────────
  if (supabaseEnabled && authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <svg className="w-8 h-8 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }
  if (supabaseEnabled && !session) return <AuthScreen initialError={authError} />;

  // ── MFA gate: enrolled but session not yet elevated to aal2 ───────────────
  if (supabaseEnabled && session && needsVerification && enrolledFactor) {
    return (
      <MfaVerify
        factor={enrolledFactor}
        onVerify={verifyLogin}
        onSignOut={signOut}
      />
    );
  }

  // ── Post-auth routing: no profiles → intake, 2+ profiles → picker ─────────
  if (supabaseEnabled && session && !authLoading && profiles.length === 0 && view === 'chat') {
    // Defer to avoid setState-during-render
  }

  // ── View routing ──────────────────────────────────────────────────────────
  function handleLoadSession(id: string) {
    loadSession(id);
    if (window.innerWidth < 768) setSidebarOpen(false);
  }

  function handleNewChat() {
    startNewChat();
    if (window.innerWidth < 768) setSidebarOpen(false);
  }

  function handleSaveProfile(p: import('./lib/studentProfile').StudentProfile) {
    saveProfile(p);
    setView('chat');
  }

  function handleAddStudent() {
    if (profiles.length >= 3) return;
    setView('intake');
  }

  function handleSelectProfile(id: string) {
    setActiveProfile(id);
    setView('chat');
  }

  if (view === 'parent-pin') return <ParentPin onSuccess={() => setView('parent-dashboard')} onBack={() => setView('chat')} />;
  if (view === 'parent-dashboard') return (
    <ParentDashboard
      profiles={profiles}
      activeProfileId={activeProfileId}
      onSwitchProfile={handleSelectProfile}
      onBack={() => setView('chat')}
      onSignOut={supabaseEnabled ? signOut : undefined}
    />
  );
  if (view === 'intake' || view === 'intake-new') return (
    <IntakeForm
      onComplete={handleSaveProfile}
      onBack={() => setView('chat')}
      onClear={() => { clearProfile(); setView('chat'); }}
      initialProfile={view === 'intake' ? profile : null}
    />
  );
  if (view === 'profile-picker') return (
    <ProfilePicker
      profiles={profiles}
      onSelect={handleSelectProfile}
      onAddStudent={handleAddStudent}
      onEdit={id => { setActiveProfile(id); setView('intake'); }}
    />
  );
  if (view === 'quiz') return (
    <QuizView
      subject={subject}
      yearLevel={yearLevel}
      profile={profile as import('./hooks/useStudentProfile').StoredProfile | null}
      recentSummaries={getRecentForSubject(subject)}
      accessToken={session?.access_token}
      onBack={() => setView('chat')}
    />
  );
  if (view === 'knowledge-map') return (
    <MasteryPanel
      profileId={activeProfileId}
      accessToken={session?.access_token}
      studentName={profile?.student_name}
      onBack={() => setView('chat')}
    />
  );
  if (view === 'study-tools') return (
    <StudyToolsView
      subject={subject}
      yearLevel={yearLevel}
      profile={profile as import('./hooks/useStudentProfile').StoredProfile | null}
      accessToken={session?.access_token}
      onBack={() => setView('chat')}
    />
  );

  // Auto-redirect: no profiles → intake; 2+ profiles with no active → picker
  if (profiles.length === 0) {
    setTimeout(() => setView('intake'), 0);
    return null;
  }
  if (profiles.length > 1 && !activeProfileId) {
    setTimeout(() => setView('profile-picker'), 0);
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {milestone !== null && (
        <MilestoneModal days={milestone} onDismiss={dismissMilestone} />
      )}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        sessions={sessions}
        currentId={currentId}
        onNewChat={handleNewChat}
        onLoadSession={handleLoadSession}
        onDeleteSession={deleteSession}
        onTogglePin={togglePin}
        onRenameSession={renameSession}
        dark={dark}
        onToggleTheme={toggle}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(o => !o)}
        onOpenParentPortal={() => setView('parent-pin')}
        onOpenIntake={() => setView('intake')}
        onAddStudent={profiles.length < 3 ? () => setView('intake-new') : undefined}
        onSwitchStudent={profiles.length > 1 ? () => setView('profile-picker') : undefined}
        activeStudentName={profile?.student_name || undefined}
        hasProfile={profile !== null}
        onSignOut={supabaseEnabled ? signOut : undefined}
        onOpenQuiz={profile ? () => setView('quiz') : undefined}
        onOpenKnowledgeMap={profile ? () => setView('knowledge-map') : undefined}
        onOpenStudyTools={profile ? () => setView('study-tools') : undefined}
      />

      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex-shrink-0">
          <button
            className="md:hidden p-1.5 text-gray-400 hover:text-gray-200 flex-shrink-0 transition-colors"
            onClick={() => setSidebarOpen(o => !o)}
            aria-label="Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none flex-1 min-w-0">
            {profile ? (
              <span className="flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">
                Year {profile.year_level}
              </span>
            ) : (
              <select
                value={yearLevel}
                onChange={e => {
                  const y = Number(e.target.value) as YearLevel;
                  if (y !== yearLevel) { setYearLevel(y); startNewChat(); }
                  if (y !== 7 && y !== 9) setIsNaplanMode(false);
                }}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-300 dark:border-gray-700"
              >
                {ALLOWED_YEAR_LEVELS.map(y => (
                  <option key={y} value={y}>Year {y}</option>
                ))}
              </select>
            )}

            {profile?.state_curriculum && (
              <span
                title={getCurriculumFullName(profile.state_curriculum)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800"
              >
                {getCurriculumAuthority(profile.state_curriculum)}
              </span>
            )}

            <div className="w-px h-5 bg-gray-800 flex-shrink-0" />

            {(profile ? profile.selected_subjects as Subject[] : ALLOWED_SUBJECTS).map(s => (
              <button
                key={s}
                onClick={() => { if (s !== subject) { setSubject(s as Subject); startNewChat(); } if (s === 'Science') setIsNaplanMode(false); }}
                className={`flex-shrink-0 px-3 sm:px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  subject === s
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700'
                }`}
              >
                {s}
              </button>
            ))}

            {subject !== 'Science' && (yearLevel === 7 || yearLevel === 9) && (
              <>
                <div className="w-px h-5 bg-gray-800 flex-shrink-0" />
                <button
                  onClick={() => setIsNaplanMode(m => !m)}
                  className={`flex-shrink-0 px-3 sm:px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    isNaplanMode
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700'
                  }`}
                >
                  NAPLAN
                </button>
              </>
            )}
          </div>

          <div className="flex-shrink-0 pl-2">
            <StreakDisplay data={streakData} />
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <ChatInterface
            yearLevel={yearLevel}
            subject={subject}
            isNaplanMode={isNaplanMode}
            messages={messages}
            isLoading={isLoading}
            sendMessage={sendMessage}
            cancelMessage={cancelMessage}
            studentName={profile?.student_name || undefined}
            ttsEnabled={profile?.tts_enabled !== false}
            apiSessionId={apiSessionId}
            accessToken={session?.access_token}
          />
        </div>
      </div>
    </div>
  );
}
