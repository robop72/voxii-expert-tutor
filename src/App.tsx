import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import Sidebar from './components/Sidebar';
import ParentPin from './components/ParentPin';
import ParentDashboard from './components/ParentDashboard';
import IntakeForm from './components/IntakeForm';
import { useTheme } from './hooks/useTheme';
import { useChat } from './hooks/useChat';
import { useStudentProfile } from './hooks/useStudentProfile';
import { YearLevel, Subject, ALLOWED_YEAR_LEVELS, ALLOWED_SUBJECTS } from './lib/curriculumConfig';

type View = 'chat' | 'parent-pin' | 'parent-dashboard' | 'intake';

export default function App() {
  const { dark, toggle } = useTheme();
  // Start open on desktop, closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );
  const [yearLevel, setYearLevel] = useState<YearLevel>(9);
  const [subject, setSubject] = useState<Subject>('Maths');
  const [isNaplanMode, setIsNaplanMode] = useState(false);
  const [view, setView] = useState<View>('chat');
  const { profile, saveProfile, clearProfile } = useStudentProfile();

  useEffect(() => {
    if (view === 'parent-pin' && sessionStorage.getItem('voxii-parent-auth') === 'true') {
      setView('parent-dashboard');
    }
  }, [view]);

  useEffect(() => {
    if (profile) {
      setYearLevel(profile.year_level as YearLevel);
      const first = profile.selected_subjects[0] as Subject | undefined;
      if (first) setSubject(first);
    }
  }, [profile]);

  const {
    sessions, currentId, messages, isLoading, isAtTurnLimit,
    sendMessage, startNewChat, loadSession, deleteSession,
    togglePin, renameSession, cancelMessage,
  } = useChat({ yearLevel, subject, isNaplanMode, studentProfile: profile });

  // Close sidebar on mobile after selecting a session
  function handleLoadSession(id: string) {
    loadSession(id);
    if (window.innerWidth < 768) setSidebarOpen(false);
  }

  function handleNewChat() {
    startNewChat();
    if (window.innerWidth < 768) setSidebarOpen(false);
  }

  if (view === 'parent-pin') return <ParentPin onSuccess={() => setView('parent-dashboard')} onBack={() => setView('chat')} />;
  if (view === 'parent-dashboard') return <ParentDashboard onBack={() => setView('chat')} />;
  if (view === 'intake') return (
    <IntakeForm
      onComplete={p => { saveProfile(p); setView('chat'); }}
      onBack={() => setView('chat')}
      onClear={() => { clearProfile(); setView('chat'); }}
      initialProfile={profile}
    />
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Mobile backdrop */}
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
        hasProfile={profile !== null}
      />

      <div className="flex flex-col flex-1 min-w-0">
        {/* Top bar */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex-shrink-0">
          {/* Mobile hamburger */}
          <button
            className="md:hidden p-1.5 text-gray-400 hover:text-gray-200 flex-shrink-0 transition-colors"
            onClick={() => setSidebarOpen(o => !o)}
            aria-label="Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Scrollable controls */}
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

        </div>

        <div className="flex-1 min-h-0">
          <ChatInterface
            yearLevel={yearLevel}
            subject={subject}
            isNaplanMode={isNaplanMode}
            messages={messages}
            isLoading={isLoading}
            isAtTurnLimit={isAtTurnLimit}
            sendMessage={sendMessage}
            cancelMessage={cancelMessage}
            onNewChat={handleNewChat}
            studentName={profile?.student_name || undefined}
          />
        </div>
      </div>
    </div>
  );
}
