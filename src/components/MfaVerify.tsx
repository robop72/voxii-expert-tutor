import React, { useState, useRef, useEffect } from 'react';
import { MfaFactor } from '../hooks/useMfa';

interface Props {
  factor: MfaFactor;
  onVerify: (factorId: string, code: string) => Promise<void>;
  onSignOut: () => void;
}

export default function MfaVerify({ factor, onVerify, onSignOut }: Props) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  async function handleInput(val: string) {
    const digits = val.replace(/\D/g, '').slice(0, 6);
    setCode(digits);
    setError('');
    if (digits.length === 6) {
      setLoading(true);
      try {
        await onVerify(factor.id, digits);
      } catch {
        setError('Incorrect code. Try again.');
        setCode('');
        setTimeout(() => inputRef.current?.focus(), 50);
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <img src="/voxii-logo.png" alt="Voxii AI" className="h-9 object-contain" />
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white mb-1">Two-factor verification</h1>
            <p className="text-sm text-gray-400">
              Open your authenticator app and enter the 6-digit code.
            </p>
          </div>

          {/* Code dots */}
          <div className="flex gap-2 justify-center mb-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`w-10 h-12 rounded-xl border-2 flex items-center justify-center text-lg font-bold transition-all ${
                  i < code.length
                    ? 'border-blue-500 bg-blue-500/10 text-white'
                    : i === code.length
                    ? 'border-blue-400 bg-transparent text-transparent animate-pulse'
                    : 'border-gray-700 bg-transparent text-transparent'
                }`}
              >
                {code[i] ?? ''}
              </div>
            ))}
          </div>

          {/* Hidden input */}
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={code}
            onChange={e => handleInput(e.target.value)}
            className="sr-only"
            aria-label="Enter verification code"
            autoComplete="one-time-code"
          />

          <p className="text-xs text-gray-500 text-center mb-2">
            Tap anywhere to focus, then type your code
          </p>

          {/* Tap-to-focus overlay */}
          <button
            onClick={() => inputRef.current?.focus()}
            className="w-full py-2.5 rounded-xl border border-dashed border-gray-700 text-sm text-gray-500 hover:border-gray-600 hover:text-gray-400 transition-colors mb-4"
          >
            Tap to type code
          </button>

          {error && (
            <p className="text-sm text-red-400 text-center mb-4">{error}</p>
          )}

          {loading && (
            <div className="flex justify-center mb-4">
              <svg className="w-5 h-5 animate-spin text-blue-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            </div>
          )}
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 mb-2">Lost access to your authenticator app?</p>
          <button
            onClick={onSignOut}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Sign out and use a different account
          </button>
        </div>
      </div>
    </div>
  );
}
