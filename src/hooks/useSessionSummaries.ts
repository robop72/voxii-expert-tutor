import { useCallback } from 'react';

export interface SessionSummary {
  sessionId: string;
  date: string; // YYYY-MM-DD
  subject: string;
  summary: string;
}

const MAX_TOTAL = 15;

function storageKey(profileId: string | null) {
  return profileId ? `voxii-summaries-${profileId}` : 'voxii-summaries';
}

function loadAll(profileId: string | null): SessionSummary[] {
  try {
    const raw = localStorage.getItem(storageKey(profileId));
    return raw ? (JSON.parse(raw) as SessionSummary[]) : [];
  } catch {
    return [];
  }
}

export function useSessionSummaries(profileId: string | null) {
  const getRecentForSubject = useCallback(
    (subject: string, limit = 2): string[] => {
      return loadAll(profileId)
        .filter(s => s.subject.toLowerCase() === subject.toLowerCase())
        .slice(0, limit)
        .map(s => `[${s.date}] ${s.summary}`);
    },
    [profileId],
  );

  const addSummary = useCallback(
    (sessionId: string, subject: string, summary: string) => {
      try {
        const existing = loadAll(profileId).filter(s => s.sessionId !== sessionId);
        const entry: SessionSummary = {
          sessionId,
          date: new Date().toLocaleDateString('en-CA'),
          subject,
          summary,
        };
        const updated = [entry, ...existing].slice(0, MAX_TOTAL);
        localStorage.setItem(storageKey(profileId), JSON.stringify(updated));
      } catch {}
    },
    [profileId],
  );

  return { getRecentForSubject, addSummary };
}
