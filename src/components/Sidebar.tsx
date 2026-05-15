import React, { useState, useRef, useEffect } from 'react';
import { ChatSession } from '../hooks/useChat';
import ShareModal from './ShareModal';

interface Props {
  sessions: ChatSession[];
  currentId: string;
  onNewChat: () => void;
  onLoadSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onTogglePin: (id: string) => void;
  onRenameSession: (id: string, title: string) => void;
  dark: boolean;
  onToggleTheme: () => void;
  isOpen: boolean;
  onToggle: () => void;
  onOpenParentPortal: () => void;
  onOpenIntake: () => void;
  onAddStudent?: () => void;
  onSwitchStudent?: () => void;
  activeStudentName?: string;
  hasProfile: boolean;
  onSignOut?: () => void;
  onOpenQuiz?: () => void;
  onOpenKnowledgeMap?: () => void;
}

function timeLabel(ts: number) {
  const diff = Date.now() - ts;
  const day = 86400000;
  if (diff < day) return 'Today';
  if (diff < 2 * day) return 'Yesterday';
  if (diff < 7 * day) return 'This week';
  return 'Earlier';
}

function SessionRow({
  s, currentId,
  onLoadSession, onDeleteSession, onTogglePin, onRenameSession, onShare,
}: {
  s: ChatSession;
  currentId: string;
  onLoadSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onTogglePin: (id: string) => void;
  onRenameSession: (id: string, title: string) => void;
  onShare: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(s.title);
  const menuRef = useRef<HTMLDivElement>(null);
  const renameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  useEffect(() => {
    if (renaming) {
      setRenameValue(s.title);
      setTimeout(() => renameRef.current?.select(), 0);
    }
  }, [renaming, s.title]);

  function commitRename() {
    onRenameSession(s.id, renameValue);
    setRenaming(false);
  }

  if (renaming) {
    return (
      <div className="flex items-center rounded-lg bg-gray-200/60 dark:bg-gray-700/60 px-2 py-1.5">
        <input
          ref={renameRef}
          value={renameValue}
          onChange={e => setRenameValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') commitRename();
            if (e.key === 'Escape') setRenaming(false);
          }}
          onBlur={commitRename}
          className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 outline-none min-w-0"
        />
      </div>
    );
  }

  return (
    <div
      ref={menuRef}
      className={`group relative flex items-center rounded-lg transition-colors cursor-pointer ${
        s.id === currentId ? 'bg-gray-200/60 dark:bg-gray-700/60' : 'hover:bg-gray-100/70 dark:hover:bg-gray-800/60'
      }`}
    >
      {s.pinned && (
        <svg className="w-3 h-3 text-gray-500 ml-2 shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
        </svg>
      )}
      <button onClick={() => onLoadSession(s.id)} className="flex-1 text-left px-3 py-2 text-sm truncate text-gray-700 dark:text-gray-300 min-w-0">
        {s.title}
      </button>
      <button
        onClick={e => { e.stopPropagation(); setMenuOpen(o => !o); }}
        className="opacity-0 group-hover:opacity-100 p-1.5 mr-1 rounded text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300 transition-colors flex-shrink-0"
      >
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
        </svg>
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl py-1.5 min-w-[170px]">
          {/* Share */}
          <button
            onClick={() => { onShare(s.id); setMenuOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share conversation
          </button>

          {/* Pin / Unpin */}
          <button
            onClick={() => { onTogglePin(s.id); setMenuOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            {s.pinned ? 'Unpin' : 'Pin'}
          </button>

          {/* Rename */}
          <button
            onClick={() => { setMenuOpen(false); setRenaming(true); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Rename
          </button>

          <div className="h-px bg-gray-200 dark:bg-gray-700 mx-2 my-1" />

          {/* Delete */}
          <button
            onClick={() => { onDeleteSession(s.id); setMenuOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default function Sidebar({
  sessions, currentId, onNewChat, onLoadSession, onDeleteSession, onTogglePin,
  onRenameSession, dark, onToggleTheme, isOpen, onToggle, onOpenParentPortal,
  onOpenIntake, onAddStudent, onSwitchStudent, activeStudentName, hasProfile, onSignOut, onOpenQuiz,
  onOpenKnowledgeMap,
}: Props) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shareSessionId, setShareSessionId] = useState<string | null>(null);

  const withMessages = sessions.filter(s => s.messages.length > 0);
  const pinned = withMessages.filter(s => s.pinned);
  const unpinned = withMessages.filter(s => !s.pinned);
  const groups: Record<string, ChatSession[]> = {};
  for (const s of unpinned) {
    const label = timeLabel(s.createdAt);
    if (!groups[label]) groups[label] = [];
    groups[label].push(s);
  }
  const groupOrder = ['Today', 'Yesterday', 'This week', 'Earlier'];

  return (
    <>
      <aside className={`
        flex-shrink-0 flex flex-col h-full bg-white dark:bg-[#0f1117] border-r border-gray-200 dark:border-gray-800
        transition-[transform,width] duration-300 ease-in-out
        fixed inset-y-0 left-0 z-40
        md:relative md:z-auto md:translate-x-0
        ${isOpen
          ? 'w-[280px] translate-x-0'
          : 'w-[280px] -translate-x-full md:w-14'
        }
      `}>

        {/* Logo row */}
        <div className={`flex items-center px-4 pt-5 pb-3 ${isOpen ? 'justify-between' : 'justify-center'}`}>
          {isOpen && <img src="/voxii-logo.png" alt="Voxii AI" className="h-7 object-contain" />}
          {!isOpen && <img src="/voxii-favicon.png" alt="Voxii" className="w-7 h-7 object-contain" />}
          <div className="flex items-center gap-1">
            <button onClick={onToggle} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" title={isOpen ? 'Collapse' : 'Expand'}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
              </svg>
            </button>
            {isOpen && (
              <button className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" title="Search">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* New Chat */}
        <div className="px-3 mb-1">
          <button
            onClick={onNewChat}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${!isOpen ? 'justify-center' : ''}`}
            title="New Chat"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {isOpen && <span>New Chat</span>}
          </button>
        </div>

        {/* Practice Quiz */}
        {isOpen && onOpenQuiz && (
          <div className="px-3 mb-1">
            <button
              onClick={onOpenQuiz}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors border border-indigo-200 dark:border-indigo-800/50"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span>Practice Quiz</span>
            </button>
          </div>
        )}

        {/* Knowledge Map */}
        {isOpen && onOpenKnowledgeMap && (
          <div className="px-3 mb-1">
            <button
              onClick={onOpenKnowledgeMap}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors border border-violet-200 dark:border-violet-800/50"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span>Knowledge Map</span>
            </button>
          </div>
        )}

        {/* Student selector */}
        {isOpen && (
          <div className="px-3 mb-3 space-y-1">
            {/* Active student + switch */}
            {onSwitchStudent && activeStudentName && (
              <button
                onClick={onSwitchStudent}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="truncate flex-1 text-left">{activeStudentName}</span>
                <span className="text-[10px] font-semibold bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full flex-shrink-0">Switch</span>
              </button>
            )}
            {/* Edit / Set up profile */}
            <button
              onClick={onOpenIntake}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{hasProfile ? 'Edit profile' : 'Student Profile'}</span>
              {hasProfile
                ? <span className="ml-auto w-2 h-2 rounded-full bg-green-500 flex-shrink-0" title="Profile active" />
                : <span className="ml-auto text-[10px] font-semibold bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">Set up</span>
              }
            </button>
            {/* Add another student */}
            {onAddStudent && (
              <button
                onClick={onAddStudent}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span>Add student</span>
              </button>
            )}
          </div>
        )}

        {/* Chat history */}
        {isOpen && (
          <>
            <div className="px-4 mb-1">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Chat History</p>
            </div>
            <div className="flex-1 overflow-y-auto px-3 space-y-3 scrollbar-none pb-2">
              {pinned.length > 0 && (
                <div>
                  <p className="text-xs text-gray-600 px-2 mb-1">Pinned</p>
                  {pinned.map(s => (
                    <SessionRow
                      key={s.id} s={s} currentId={currentId}
                      onLoadSession={onLoadSession} onDeleteSession={onDeleteSession}
                      onTogglePin={onTogglePin} onRenameSession={onRenameSession}
                      onShare={id => setShareSessionId(id)}
                    />
                  ))}
                </div>
              )}
              {groupOrder.map(label => {
                const group = groups[label];
                if (!group?.length) return null;
                return (
                  <div key={label}>
                    <p className="text-xs text-gray-400 dark:text-gray-600 px-2 mb-1">{label}</p>
                    {group.map(s => (
                      <SessionRow
                        key={s.id} s={s} currentId={currentId}
                        onLoadSession={onLoadSession} onDeleteSession={onDeleteSession}
                        onTogglePin={onTogglePin} onRenameSession={onRenameSession}
                        onShare={id => setShareSessionId(id)}
                      />
                    ))}
                  </div>
                );
              })}
              {withMessages.length === 0 && <p className="text-xs text-gray-400 dark:text-gray-600 px-2 italic">No chats yet</p>}
            </div>
          </>
        )}
        {!isOpen && <div className="flex-1" />}

        {/* Bottom: Parent Portal + Settings */}
        {isOpen && (
          <div className="border-t border-gray-200 dark:border-gray-800 px-3 py-3 space-y-1">
            <button onClick={onOpenParentPortal} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Parent Portal
            </button>
            <button
              onClick={() => setSettingsOpen(o => !o)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </span>
              <svg className={`w-3.5 h-3.5 transition-transform ${settingsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {settingsOpen && (
              <div className="px-3 py-2 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{dark ? 'Dark mode' : 'Light mode'}</span>
                  <button onClick={onToggleTheme} className={`relative w-9 h-5 rounded-full transition-colors ${dark ? 'bg-blue-500' : 'bg-gray-300'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${dark ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>
                {onSignOut && (
                  <>
                    <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
                    <button
                      onClick={onSignOut}
                      className="w-full flex items-center gap-2.5 px-1 py-2 rounded-xl text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign out
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </aside>

      {/* Share modal — rendered outside aside so it's not clipped */}
      {shareSessionId && (
        <ShareModal sessionId={shareSessionId} onClose={() => setShareSessionId(null)} />
      )}
    </>
  );
}
