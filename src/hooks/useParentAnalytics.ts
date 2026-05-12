import { useState, useEffect } from 'react';
import { ChatSession } from './useChat';
import { detectStrand, STRANDS } from '../utils/strands';

const MINS_PER_EXCHANGE = 2.5;

export interface StrandStat {
  id: string;
  emoji: string;
  count: number;
  badgeBg: string;
  badgeText: string;
}

export interface RecentSession {
  id: string;
  title: string;
  date: Date;
  strand: string | null;
  strandEmoji: string | null;
  messageCount: number;
}

export function useParentAnalytics() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [studentName, setStudentName] = useState('Student');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('voxii-sessions');
      if (raw) setSessions(JSON.parse(raw));
    } catch { /* ignore */ }
    const name = localStorage.getItem('voxii-student-name');
    if (name) setStudentName(name);
  }, []);

  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  const sessionsThisWeek = sessions.filter(s => s.createdAt >= monday.getTime());
  const exchangesThisWeek = sessionsThisWeek.reduce((acc, s) => acc + Math.floor(s.messages.length / 2), 0);
  const estimatedMinutes = Math.round(exchangesThisWeek * MINS_PER_EXCHANGE);

  const strandCounts: Record<string, number> = {};
  for (const session of sessions) {
    for (const msg of session.messages) {
      if (msg.role === 'user') {
        const strand = detectStrand(msg.text);
        if (strand) strandCounts[strand] = (strandCounts[strand] || 0) + 1;
      }
    }
  }

  const strandCoverage: StrandStat[] = STRANDS.map(s => ({
    id: s.id,
    emoji: s.emoji,
    count: strandCounts[s.id] || 0,
    badgeBg: s.badgeBg,
    badgeText: s.badgeText,
  })).sort((a, b) => b.count - a.count);

  const maxStrandCount = Math.max(...strandCoverage.map(s => s.count), 1);
  const topStrand = strandCoverage[0]?.count > 0 ? strandCoverage[0] : null;

  const recentSessions: RecentSession[] = [...sessions]
    .filter(s => s.messages.length > 0)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 6)
    .map(s => {
      const firstUser = s.messages.find(m => m.role === 'user');
      const strand = firstUser ? detectStrand(firstUser.text) : null;
      const strandInfo = strand ? STRANDS.find(st => st.id === strand) : null;
      return {
        id: s.id,
        title: s.title === 'New Chat' && firstUser ? firstUser.text.slice(0, 50) : s.title,
        date: new Date(s.createdAt),
        strand,
        strandEmoji: strandInfo?.emoji ?? null,
        messageCount: s.messages.filter(m => m.role === 'user').length,
      };
    });

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const activityByDay = DAYS.map((day, i) => ({
    day,
    count: sessions.filter(s => ((new Date(s.createdAt).getDay() + 6) % 7) === i).length,
  }));
  const maxDayCount = Math.max(...activityByDay.map(d => d.count), 1);

  const totalMessages = sessions.reduce((acc, s) => acc + s.messages.filter(m => m.role === 'user').length, 0);
  const totalSessions = sessions.filter(s => s.messages.length > 0).length;

  return {
    studentName,
    sessionsThisWeek: sessionsThisWeek.filter(s => s.messages.length > 0).length,
    estimatedMinutes,
    weeklyGoal: 60,
    totalSessions,
    totalMessages,
    strandCoverage,
    maxStrandCount,
    topStrand,
    recentSessions,
    activityByDay,
    maxDayCount,
  };
}
