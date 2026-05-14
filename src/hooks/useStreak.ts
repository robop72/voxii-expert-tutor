import { useState, useCallback, useEffect } from 'react';

export interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string; // YYYY-MM-DD
  streakFreezeCount: number;
  dailyGoalMet: boolean;
  messagesCompletedToday: number;
  totalXP: number;
}

function streakKey(profileId: string | null) {
  return profileId ? `voxii-streak-${profileId}` : 'voxii-streak';
}
const DAILY_GOAL = 5;
const MILESTONES = [7, 30, 100];

function today(): string {
  return new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local timezone
}

function defaultData(): StreakData {
  return {
    current_streak: 0,
    longest_streak: 0,
    last_activity_date: '',
    streakFreezeCount: 0,
    dailyGoalMet: false,
    messagesCompletedToday: 0,
    totalXP: 0,
  };
}

function load(profileId: string | null): StreakData {
  try {
    const raw = localStorage.getItem(streakKey(profileId));
    if (!raw) return defaultData();
    return { ...defaultData(), ...JSON.parse(raw) };
  } catch {
    return defaultData();
  }
}

function save(data: StreakData, profileId: string | null) {
  localStorage.setItem(streakKey(profileId), JSON.stringify(data));
}

function dateDiffDays(a: string, b: string): number {
  const msPerDay = 86400000;
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPerDay);
}

export function useStreak(profileId: string | null = null) {
  const [data, setData] = useState<StreakData>(() => load(profileId));
  const [milestone, setMilestone] = useState<number | null>(null);

  // Reload when active profile changes
  useEffect(() => {
    setData(load(profileId));
    setMilestone(null);
  }, [profileId]);

  const recordMessage = useCallback(() => {
    setData(prev => {
      const t = today();
      let updated = { ...prev };

      if (prev.last_activity_date !== t) {
        // New day — reset daily counters
        updated.messagesCompletedToday = 0;
        updated.dailyGoalMet = false;

        if (prev.last_activity_date === '') {
          // First ever session
          updated.current_streak = 0;
        } else {
          const diff = dateDiffDays(prev.last_activity_date, t);
          if (diff === 1) {
            // Consecutive day — streak continues
          } else if (diff > 1) {
            // Missed days — use freeze or reset
            if (prev.streakFreezeCount > 0) {
              updated.streakFreezeCount = prev.streakFreezeCount - 1;
            } else {
              updated.current_streak = 0;
            }
          }
        }
        updated.last_activity_date = t;
      }

      // Count this message
      updated.messagesCompletedToday += 1;
      updated.totalXP += 10;

      // Check if daily goal just met
      if (!updated.dailyGoalMet && updated.messagesCompletedToday >= DAILY_GOAL) {
        updated.dailyGoalMet = true;
        updated.current_streak += 1;
        if (updated.current_streak > updated.longest_streak) {
          updated.longest_streak = updated.current_streak;
        }

        // Check milestone — find the highest milestone just crossed
        const hit = MILESTONES.filter(m => updated.current_streak === m).at(-1) ?? null;
        if (hit !== null) {
          // Trigger milestone outside of setState via a microtask
          setTimeout(() => setMilestone(hit), 0);
        }
      }

      save(updated, profileId);
      return updated;
    });
  }, [profileId]);

  const dismissMilestone = useCallback(() => setMilestone(null), []);

  const addFreeze = useCallback(() => {
    setData(prev => {
      const updated = { ...prev, streakFreezeCount: prev.streakFreezeCount + 1 };
      save(updated, profileId);
      return updated;
    });
  }, [profileId]);

  return { data, milestone, recordMessage, dismissMilestone, addFreeze };
}
