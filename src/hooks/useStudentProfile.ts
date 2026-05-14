import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { StudentProfile } from '../lib/studentProfile';

export type StoredProfile = StudentProfile & { id: string };

const PROFILES_KEY = 'voxii-student-profiles';
const ACTIVE_KEY   = 'voxii-active-profile-id';
const LEGACY_KEY   = 'voxii-student-profile';

function loadProfiles(): StoredProfile[] {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (raw) return JSON.parse(raw) as StoredProfile[];

    // Migrate from old single-profile key
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const p = JSON.parse(legacy) as StudentProfile;
      const migrated: StoredProfile = { ...p, id: uuidv4() };
      // Migrate sessions and streak to per-profile keys
      const sessions = localStorage.getItem('voxii-sessions');
      const streak   = localStorage.getItem('voxii-streak');
      if (sessions) localStorage.setItem(`voxii-sessions-${migrated.id}`, sessions);
      if (streak)   localStorage.setItem(`voxii-streak-${migrated.id}`, streak);
      localStorage.setItem(PROFILES_KEY, JSON.stringify([migrated]));
      return [migrated];
    }
    return [];
  } catch {
    return [];
  }
}

function saveProfiles(ps: StoredProfile[]) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(ps));
}

export function useStudentProfile() {
  const [profiles, setProfiles] = useState<StoredProfile[]>(loadProfiles);

  const [activeProfileId, setActiveProfileIdState] = useState<string | null>(() => {
    const stored = localStorage.getItem(ACTIVE_KEY);
    if (stored) return stored;
    // Auto-select first profile if only one exists
    const ps = loadProfiles();
    return ps.length === 1 ? ps[0].id : null;
  });

  const activeProfile = profiles.find(p => p.id === activeProfileId) ?? null;

  const setActiveProfile = useCallback((id: string | null) => {
    if (id) localStorage.setItem(ACTIVE_KEY, id);
    else localStorage.removeItem(ACTIVE_KEY);
    setActiveProfileIdState(id);
  }, []);

  const saveProfile = useCallback((p: StudentProfile) => {
    const withId: StoredProfile = { ...p, id: p.id ?? uuidv4() };
    setProfiles(prev => {
      const exists = prev.some(x => x.id === withId.id);
      const next = exists
        ? prev.map(x => x.id === withId.id ? withId : x)
        : [...prev, withId];
      saveProfiles(next);
      return next;
    });
    setActiveProfile(withId.id);
  }, [setActiveProfile]);

  const deleteProfile = useCallback((id: string) => {
    setProfiles(prev => {
      const next = prev.filter(p => p.id !== id);
      saveProfiles(next);
      return next;
    });
    // Clean up profile-specific data
    localStorage.removeItem(`voxii-sessions-${id}`);
    localStorage.removeItem(`voxii-streak-${id}`);
    setActiveProfileIdState(prev => {
      if (prev !== id) return prev;
      const remaining = loadProfiles().filter(p => p.id !== id);
      const next = remaining[0]?.id ?? null;
      if (next) localStorage.setItem(ACTIVE_KEY, next);
      else localStorage.removeItem(ACTIVE_KEY);
      return next;
    });
  }, []);

  const clearProfile = useCallback(() => {
    localStorage.removeItem(PROFILES_KEY);
    localStorage.removeItem(ACTIVE_KEY);
    localStorage.removeItem(LEGACY_KEY);
    setProfiles([]);
    setActiveProfileIdState(null);
  }, []);

  const restoreProfiles = useCallback((ps: StoredProfile[]) => {
    saveProfiles(ps);
    setProfiles(ps);
    const firstId = ps[0]?.id ?? null;
    if (firstId) localStorage.setItem(ACTIVE_KEY, firstId);
    setActiveProfileIdState(firstId);
  }, []);

  return {
    profile: activeProfile,
    profiles,
    activeProfileId,
    setActiveProfile,
    saveProfile,
    deleteProfile,
    clearProfile,
    restoreProfiles,
  };
}
