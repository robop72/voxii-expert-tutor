import { useState, useEffect } from 'react';

export function useTheme() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('voxii-theme');
    const isDark = stored !== 'light';
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem('voxii-theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', next);
  };

  return { dark, toggle };
}
