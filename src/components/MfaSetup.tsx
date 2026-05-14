import React, { useState, useEffect, useRef } from 'react';
import { useMfa } from '../hooks/useMfa';

type Step = 'intro' | 'scan' | 'confirm' | 'done';

interface QrData {
  qrCode: string;
  secret: string;
  factorId: string;
}

interface Props {
  sessionReady: boolean;
  onDone: () => void;
}

export default function MfaSetup({ sessionReady, onDone }: Props) {
  const { enroll, confirmEnrollment, unenroll } = useMfa(sessionReady);
  const [step, setStep] = useState<Step>('intro');
  const [qrData, setQrData] = useState<QrData | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 'confirm') setTimeout(() => inputRef.current?.focus(), 100);
  }, [step]);

  async function handleStartEnroll() {
    setLoading(true);
    setError('');
    try {
      const data = await enroll();
      setQrData(data);
      setStep('scan');
    } catch (e: any) {
      setError(e.message ?? 'Could not start setup. Try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    if (!qrData || code.length !== 6) return;
    setLoading(true);
    setError('');
    try {
      await confirmEnrollment(qrData.factorId, code);
      setStep('done');
    } catch {
      setError('Incorrect code. Make sure your phone clock is synced and try again.');
      setCode('');
      setTimeout(() => inputRef.current?.focus(), 50);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (qrData) {
      try { await unenroll(qrData.factorId); } catch {}
    }
    onDone();
  }

  if (step === 'done') {
    return (
      <div className="flex flex-col items-center text-center py-6">
        <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-white mb-2">2-step verification enabled</h2>
        <p className="text-sm text-gray-400 mb-6">
          Your account is now protected. You'll be asked for a code each time you sign in.
        </p>
        <button
          onClick={onDone}
          className="px-6 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors"
        >
          Done
        </button>
      </div>
    );
  }

  if (step === 'intro') {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-white mb-0.5">Why enable 2-step verification?</p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Adds a second layer of security to your parent account. Even if your email is compromised,
              no one can access your children's data without your authenticator app.
            </p>
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-300">
          <p className="font-medium text-white">You'll need:</p>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">1.</span>
            <span>An authenticator app — <span className="text-blue-400">Google Authenticator</span>, <span className="text-blue-400">Authy</span>, or <span className="text-blue-400">1Password</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">2.</span>
            <span>About 2 minutes to set it up</span>
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-700 text-sm text-gray-400 hover:text-white hover:border-gray-600 transition-colors"
          >
            Maybe later
          </button>
          <button
            onClick={handleStartEnroll}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : 'Set up now'}
          </button>
        </div>
      </div>
    );
  }

  if (step === 'scan') {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-semibold text-white mb-1">Step 1 — Scan with your authenticator app</h3>
          <p className="text-xs text-gray-400">Open your app, tap "Add account" or "+", then scan this QR code.</p>
        </div>

        {qrData && (
          <div className="flex flex-col items-center gap-3">
            <div className="bg-white p-3 rounded-xl">
              <img src={qrData.qrCode} alt="MFA QR code" className="w-40 h-40" />
            </div>

            <button
              onClick={() => setShowSecret(s => !s)}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showSecret ? 'Hide' : 'Can\'t scan? Show'} manual entry key
            </button>

            {showSecret && (
              <div className="w-full bg-gray-800 rounded-xl p-3 border border-gray-700">
                <p className="text-xs text-gray-400 mb-1">Manual entry key:</p>
                <p className="text-sm font-mono text-white tracking-widest break-all">{qrData.secret}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={() => setStep('intro')} className="px-4 py-2.5 rounded-xl border border-gray-700 text-sm text-gray-400 hover:text-white transition-colors">
            Back
          </button>
          <button
            onClick={() => setStep('confirm')}
            className="flex-1 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors"
          >
            I've scanned it
          </button>
        </div>
      </div>
    );
  }

  // confirm step
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-white mb-1">Step 2 — Enter the 6-digit code</h3>
        <p className="text-xs text-gray-400">Type the code shown in your authenticator app to confirm setup.</p>
      </div>

      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={code}
        onChange={e => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
        onKeyDown={e => e.key === 'Enter' && handleConfirm()}
        placeholder="000000"
        className="w-full text-center text-2xl tracking-[0.5em] px-4 py-3 rounded-xl border border-gray-700 bg-gray-800 text-white outline-none focus:border-blue-500 transition-colors placeholder-gray-700 font-mono"
        autoComplete="one-time-code"
      />

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-3">
        <button onClick={() => { setCode(''); setError(''); setStep('scan'); }} className="px-4 py-2.5 rounded-xl border border-gray-700 text-sm text-gray-400 hover:text-white transition-colors">
          Back
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading || code.length !== 6}
          className="flex-1 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : 'Confirm & enable'}
        </button>
      </div>
    </div>
  );
}
