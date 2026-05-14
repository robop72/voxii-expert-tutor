import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

type Stage = 'enter-email' | 'check-email';

interface Props {
  initialError?: string;
}

export default function AuthScreen({ initialError = '' }: Props) {
  const [email, setEmail] = useState('');
  const [stage, setStage] = useState<Stage>('enter-email');
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!supabase) return;
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setStage('check-email');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img src="/voxii-logo.png" alt="Voxii AI" className="h-10 object-contain" />
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 sm:p-8">
          {stage === 'enter-email' ? (
            <>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Parent sign in</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Enter your email address and we&apos;ll send you a secure sign-in link. No password needed.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="you@example.com"
                    autoFocus
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm outline-none focus:border-blue-400 transition-colors"
                  />
                  {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
                </div>

                <button
                  onClick={handleSend}
                  disabled={loading || !email.trim()}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Sending…
                    </>
                  ) : (
                    'Send sign-in link'
                  )}
                </button>
              </div>

              <div className="mt-6 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-snug">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">New here?</span>{' '}
                  Enter your email — if you don&apos;t have an account yet, one will be created automatically when you click the link in your email.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center text-center py-4">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Check your email</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  We sent a sign-in link to
                </p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">{email}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed max-w-xs">
                  Click the link in the email to sign in. The link expires in 1 hour. Check your spam folder if you don&apos;t see it.
                </p>
                <button
                  onClick={() => { setStage('enter-email'); setEmail(''); }}
                  className="mt-6 text-sm text-blue-500 hover:text-blue-600 transition-colors"
                >
                  Use a different email
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-4">
          Voxii AI · For parents managing a student account
        </p>
      </div>
    </div>
  );
}
