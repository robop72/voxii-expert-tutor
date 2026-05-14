import React, { useState, useRef, useEffect } from 'react';
import { StoredProfile } from '../hooks/useStudentProfile';
import { getAvatar } from '../lib/avatars';

interface Props {
  profiles: StoredProfile[];
  onSelect: (id: string) => void;
  onAddStudent: () => void;
  onEdit: (id: string) => void;
}

function PinModal({ profile, onSuccess, onCancel }: {
  profile: StoredProfile;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [pin, setPin] = useState('');
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const avatar = getAvatar(profile.avatar);
  const maxLen = profile.student_pin?.length ?? 4;

  useEffect(() => { inputRef.current?.focus(); }, []);

  function handleInput(val: string) {
    const digits = val.replace(/\D/g, '').slice(0, maxLen);
    setPin(digits);
    if (digits.length === maxLen) {
      if (digits === profile.student_pin) {
        onSuccess();
      } else {
        setShake(true);
        setTimeout(() => { setShake(false); setPin(''); inputRef.current?.focus(); }, 600);
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-950/90 z-50 flex items-center justify-center px-4" onClick={() => inputRef.current?.focus()}>
      <div className="w-full max-w-xs bg-gray-900 rounded-2xl border border-gray-800 p-8 flex flex-col items-center gap-6">
        {/* Avatar */}
        <div className={`w-20 h-20 rounded-full ${avatar.bg} flex items-center justify-center text-4xl shadow-lg`}>
          {avatar.emoji}
        </div>
        <div className="text-center">
          <p className="text-white font-semibold text-lg">{profile.student_name || 'Student'}</p>
          <p className="text-sm text-gray-400 mt-1">Enter your PIN</p>
        </div>

        {/* PIN dots */}
        <div className={`flex gap-3 ${shake ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}>
          {Array.from({ length: maxLen }).map((_, i) => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                i < pin.length
                  ? `${avatar.bg} border-transparent`
                  : 'border-gray-600 bg-transparent'
              }`}
            />
          ))}
        </div>

        {/* Keyboard input — visible field so browsers accept keyboard focus */}
        <input
          ref={inputRef}
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={e => handleInput(e.target.value)}
          onClick={() => inputRef.current?.focus()}
          placeholder="Type your PIN"
          className="w-full text-center px-3 py-2 rounded-xl border border-gray-700 bg-gray-800 text-white text-sm outline-none focus:border-blue-500 transition-colors placeholder-gray-600"
          aria-label="Enter PIN"
        />

        <p className="text-xs text-gray-500 -mt-3">Type on keyboard or use the pad below</p>

        {/* Number pad for touch */}
        <div className="grid grid-cols-3 gap-2 w-full">
          {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((k, i) => (
            <button
              key={i}
              onClick={() => {
                if (k === '') return;
                if (k === '⌫') { handleInput(pin.slice(0, -1)); return; }
                handleInput(pin + k);
              }}
              disabled={k === ''}
              className={`h-12 rounded-xl text-lg font-semibold transition-colors ${
                k === ''
                  ? ''
                  : k === '⌫'
                  ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  : 'bg-gray-800 text-white hover:bg-gray-700 active:bg-gray-600'
              }`}
            >
              {k}
            </button>
          ))}
        </div>

        <button onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          Cancel
        </button>
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-8px); }
          40%       { transform: translateX(8px); }
          60%       { transform: translateX(-6px); }
          80%       { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}

export default function ProfilePicker({ profiles, onSelect, onAddStudent, onEdit }: Props) {
  const [pendingProfile, setPendingProfile] = useState<StoredProfile | null>(null);

  function handleCardClick(p: StoredProfile) {
    if (p.student_pin) {
      setPendingProfile(p);
    } else {
      onSelect(p.id);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 py-12">
      {pendingProfile && (
        <PinModal
          profile={pendingProfile}
          onSuccess={() => { setPendingProfile(null); onSelect(pendingProfile.id); }}
          onCancel={() => setPendingProfile(null)}
        />
      )}

      <div className="w-full max-w-2xl">
        <div className="flex justify-center mb-10">
          <img src="/voxii-logo.png" alt="Voxii AI" className="h-9 object-contain" />
        </div>

        <h1 className="text-2xl font-bold text-white text-center mb-2">Who's learning today?</h1>
        <p className="text-sm text-gray-400 text-center mb-10">Each student has their own private session history and progress.</p>

        <div className={`grid gap-4 ${profiles.length <= 2 ? 'grid-cols-2' : 'grid-cols-3'} max-w-lg mx-auto`}>
          {profiles.map(p => {
            const av = getAvatar(p.avatar);
            return (
              <div key={p.id} className="relative group">
                <button
                  onClick={() => handleCardClick(p)}
                  className="w-full flex flex-col items-center gap-3 p-6 rounded-2xl bg-gray-900 border border-gray-800 group-hover:border-blue-500 group-hover:bg-gray-800 transition-all"
                >
                  <div className={`w-16 h-16 rounded-full ${av.bg} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform`}>
                    {av.emoji}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-white truncate max-w-[120px]">
                      {p.student_name || 'Student'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">Year {p.year_level}</p>
                    {p.selected_subjects.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1 truncate max-w-[120px]">
                        {p.selected_subjects.join(' · ')}
                      </p>
                    )}
                    {p.student_pin && (
                      <p className="text-xs text-gray-600 mt-1.5 flex items-center justify-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                        </svg>
                        PIN protected
                      </p>
                    )}
                  </div>
                </button>
                {/* Edit pencil */}
                <button
                  onClick={e => { e.stopPropagation(); onEdit(p.id); }}
                  title="Edit profile"
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-gray-800 text-gray-500 opacity-0 group-hover:opacity-100 hover:text-white hover:bg-gray-700 transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6.364-6.364a2 2 0 012.828 2.828L11.828 13.828A2 2 0 0110 14.414V16h1.586a2 2 0 001.414-.586l.172-.172" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18" />
                  </svg>
                </button>
              </div>
            );
          })}

          {/* Add student card — hidden when at 3-profile limit */}
          {profiles.length < 3 && (
            <button
              onClick={onAddStudent}
              className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-gray-900 border border-dashed border-gray-700 hover:border-blue-500 hover:bg-gray-800 transition-all"
            >
              <div className="w-16 h-16 rounded-full bg-gray-800 group-hover:bg-gray-700 flex items-center justify-center transition-colors">
                <svg className="w-7 h-7 text-gray-400 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-400 group-hover:text-blue-400 transition-colors">Add student</p>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
