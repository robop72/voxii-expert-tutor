import { useState, useCallback } from 'react';
import { StudentProfile } from '../lib/studentProfile';

const PROFILE_KEY = 'voxii-student-profile';

export function useStudentProfile() {
  const [profile, setProfile] = useState<StudentProfile | null>(() => {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      return raw ? (JSON.parse(raw) as StudentProfile) : null;
    } catch {
      return null;
    }
  });

  const saveProfile = useCallback((p: StudentProfile) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
    setProfile(p);
  }, []);

  const clearProfile = useCallback(() => {
    localStorage.removeItem(PROFILE_KEY);
    setProfile(null);
  }, []);

  return { profile, saveProfile, clearProfile };
}
