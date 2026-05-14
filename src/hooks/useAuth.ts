import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, SUPABASE_ENABLED } from '../lib/supabase';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(SUPABASE_ENABLED);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!supabase) return;

    // Detect error hash from magic link callback (e.g. expired link)
    const hash = window.location.hash;
    if (hash.includes('error=')) {
      const params = new URLSearchParams(hash.slice(1));
      const desc = params.get('error_description') ?? 'Sign-in link is invalid or has expired.';
      setAuthError(desc.replace(/\+/g, ' '));
      // Clear the hash so refreshing doesn't re-trigger the error
      window.history.replaceState(null, '', window.location.pathname);
      setLoading(false);
      return;
    }

    supabase.auth.getSession()
      .then(({ data }) => {
        setSession(data.session);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase?.auth.signOut();
  }

  return { session, loading, supabaseEnabled: SUPABASE_ENABLED, authError, signOut };
}
