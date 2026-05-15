import { useState, useEffect, useCallback, useRef } from 'react';
import { StudentProfile } from '../lib/studentProfile';
import { v4 as uuidv4 } from 'uuid';

export type Role = 'user' | 'tutor';

export interface Message {
  id: string;
  role: Role;
  text: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  pinned?: boolean;
}

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function sessionsKey(profileId: string | null) {
  return profileId ? `voxii-sessions-${profileId}` : 'voxii-sessions';
}

function makeSession(): ChatSession {
  return { id: uuidv4(), title: 'New Chat', messages: [], createdAt: Date.now() };
}

export function useChat({ yearLevel, subject, isNaplanMode = false, studentProfile = null, accessToken, profileId = null, recentSummaries = [], onSessionComplete, onUnauthorized }: {
  yearLevel: number;
  subject: string;
  isNaplanMode?: boolean;
  studentProfile?: StudentProfile | null;
  accessToken?: string;
  profileId?: string | null;
  recentSummaries?: string[];
  onSessionComplete?: (sessionId: string, messages: Message[], subject: string) => void;
  onUnauthorized?: () => void;
}) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentId, setCurrentId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiSessionId, setApiSessionId] = useState(() => uuidv4());

  const currentIdRef = useRef('');
  const isLoadingRef = useRef(false);
  const apiSessionRef = useRef(apiSessionId);
  const abortRef = useRef<AbortController | null>(null);
  const accessTokenRef = useRef(accessToken);
  const yearLevelRef = useRef(yearLevel);
  const subjectRef = useRef(subject);
  const isNaplanModeRef = useRef(isNaplanMode);
  const studentProfileRef = useRef(studentProfile);
  const initialised = useRef(false);
  const profileIdRef = useRef(profileId);
  const sessionsRef = useRef<ChatSession[]>([]);
  const recentSummariesRef = useRef(recentSummaries);
  const onSessionCompleteRef = useRef(onSessionComplete);
  const onUnauthorizedRef = useRef(onUnauthorized);

  useEffect(() => { accessTokenRef.current = accessToken; }, [accessToken]);
  useEffect(() => { onUnauthorizedRef.current = onUnauthorized; }, [onUnauthorized]);
  useEffect(() => { yearLevelRef.current = yearLevel; }, [yearLevel]);
  useEffect(() => { subjectRef.current = subject; }, [subject]);
  useEffect(() => { isNaplanModeRef.current = isNaplanMode; }, [isNaplanMode]);
  useEffect(() => { studentProfileRef.current = studentProfile; }, [studentProfile]);
  useEffect(() => { currentIdRef.current = currentId; }, [currentId]);
  useEffect(() => { sessionsRef.current = sessions; }, [sessions]);
  useEffect(() => { recentSummariesRef.current = recentSummaries; }, [recentSummaries]);
  useEffect(() => { onSessionCompleteRef.current = onSessionComplete; }, [onSessionComplete]);

  useEffect(() => {
    if (!initialised.current) return;
    const toSave = sessions.filter(s => s.messages.length > 0);
    localStorage.setItem(sessionsKey(profileIdRef.current), JSON.stringify(toSave));
  }, [sessions]);

  function loadSessionsForProfile(pid: string | null): ChatSession[] {
    try {
      const raw = localStorage.getItem(sessionsKey(pid));
      if (!raw) return [];
      const all = JSON.parse(raw) as ChatSession[];
      const cutoff = Date.now() - SESSION_TTL_MS;
      return all.filter(s =>
        s.messages.length > 0 &&
        typeof s.createdAt === 'number' &&
        s.createdAt > cutoff
      );
    } catch { return []; }
  }

  // Initial load
  useEffect(() => {
    const history = loadSessionsForProfile(profileId);
    const fresh = makeSession();
    initialised.current = true;
    profileIdRef.current = profileId;
    setSessions([fresh, ...history]);
    setCurrentId(fresh.id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Reload when active profile switches
  useEffect(() => {
    if (!initialised.current) return;
    profileIdRef.current = profileId;
    const history = loadSessionsForProfile(profileId);
    const fresh = makeSession();
    const newApiId = uuidv4();
    apiSessionRef.current = newApiId;
    setApiSessionId(newApiId);
    setSessions([fresh, ...history]);
    setCurrentId(fresh.id);
  }, [profileId]); // eslint-disable-line react-hooks/exhaustive-deps

  const startNewChat = useCallback(() => {
    // Fire summary callback for the outgoing session if it had meaningful content
    const outgoing = sessionsRef.current.find(s => s.id === currentIdRef.current);
    if (outgoing && outgoing.messages.length >= 3 && onSessionCompleteRef.current) {
      onSessionCompleteRef.current(outgoing.id, outgoing.messages, subjectRef.current);
    }
    const s = makeSession();
    const newApiId = uuidv4();
    apiSessionRef.current = newApiId;
    setApiSessionId(newApiId);
    setSessions(prev => [s, ...prev.filter(p => p.messages.length > 0)]);
    setCurrentId(s.id);
  }, []);

  const loadSession = useCallback((id: string) => setCurrentId(id), []);

  const deleteSession = useCallback((id: string) => {
    setSessions(prev => {
      const remaining = prev.filter(s => s.id !== id);
      if (currentIdRef.current === id) {
        const next = remaining.find(s => s.messages.length > 0);
        if (next) { setCurrentId(next.id); return remaining; }
        const fresh = makeSession();
        apiSessionRef.current = uuidv4();
        setCurrentId(fresh.id);
        return [fresh];
      }
      return remaining;
    });
  }, []);

  const togglePin = useCallback((id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, pinned: !s.pinned } : s));
  }, []);

  const renameSession = useCallback((id: string, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setSessions(prev => prev.map(s => s.id === id ? { ...s, title: trimmed } : s));
  }, []);

  const cancelMessage = useCallback(() => {
    if (!isLoadingRef.current) return;
    abortRef.current?.abort();
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoadingRef.current) return;
    const sid = currentIdRef.current;
    const userMsg: Message = { id: uuidv4(), role: 'user', text: text.trim() };

    setSessions(prev => prev.map(s => {
      if (s.id !== sid) return s;
      return { ...s, title: s.messages.length === 0 ? text.slice(0, 55) : s.title, messages: [...s.messages, userMsg] };
    }));

    isLoadingRef.current = true;
    setIsLoading(true);
    const controller = new AbortController();
    abortRef.current = controller;

    const chatPayload = JSON.stringify({
      session_id: apiSessionRef.current,
      message: text.trim(),
      year_level: `Year ${yearLevelRef.current}`,
      subject: subjectRef.current,
      is_naplan_mode: isNaplanModeRef.current,
      student_profile: studentProfileRef.current ?? undefined,
      session_context: recentSummariesRef.current.length > 0 ? recentSummariesRef.current : undefined,
      profile_id: profileIdRef.current ?? undefined,
    });

    const doFetch = async () => {
      const chatHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
      if (accessTokenRef.current) chatHeaders['Authorization'] = `Bearer ${accessTokenRef.current}`;
      return fetch('/api/chat', { method: 'POST', headers: chatHeaders, body: chatPayload, signal: controller.signal });
    };

    try {
      let res = await doFetch();
      // Transparent retry once on cold-start timeout (5xx or network error)
      if (!res.ok && res.status !== 401) {
        await new Promise(r => setTimeout(r, 3000));
        if (!controller.signal.aborted) res = await doFetch();
      }
      if (res.status === 401) { onUnauthorizedRef.current?.(); return; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const tutorMsg: Message = { id: uuidv4(), role: 'tutor', text: data.response };
      setSessions(prev => prev.map(s => s.id !== sid ? s : { ...s, messages: [...s.messages, tutorMsg] }));
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setSessions(prev => prev.map(s => s.id !== sid ? s : {
          ...s,
          title: s.messages.length === 1 ? 'New Chat' : s.title,
          messages: s.messages.filter(m => m.id !== userMsg.id),
        }));
      } else {
        setSessions(prev => prev.map(s => s.id !== sid ? s : {
          ...s,
          messages: [...s.messages, { id: uuidv4(), role: 'tutor' as Role, text: "Sorry, I couldn't reach the server. Please try again." }],
        }));
      }
    } finally {
      abortRef.current = null;
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  const messages = sessions.find(s => s.id === currentId)?.messages ?? [];
  return { sessions, currentId, messages, isLoading, apiSessionId, sendMessage, startNewChat, loadSession, deleteSession, togglePin, renameSession, cancelMessage };
}
