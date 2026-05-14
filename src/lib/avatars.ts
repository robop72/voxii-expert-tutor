export interface Avatar {
  id: string;
  emoji: string;
  bg: string;   // tailwind bg class
  ring: string; // tailwind ring class
}

export const AVATARS: Avatar[] = [
  { id: 'fox',       emoji: '🦊', bg: 'bg-orange-400',  ring: 'ring-orange-400' },
  { id: 'panda',     emoji: '🐼', bg: 'bg-slate-500',   ring: 'ring-slate-400' },
  { id: 'lion',      emoji: '🦁', bg: 'bg-yellow-400',  ring: 'ring-yellow-400' },
  { id: 'rabbit',    emoji: '🐰', bg: 'bg-pink-400',    ring: 'ring-pink-400' },
  { id: 'dragon',    emoji: '🐲', bg: 'bg-emerald-500', ring: 'ring-emerald-400' },
  { id: 'owl',       emoji: '🦉', bg: 'bg-violet-500',  ring: 'ring-violet-400' },
  { id: 'shark',     emoji: '🦈', bg: 'bg-cyan-500',    ring: 'ring-cyan-400' },
  { id: 'turtle',    emoji: '🐢', bg: 'bg-green-500',   ring: 'ring-green-400' },
  { id: 'unicorn',   emoji: '🦄', bg: 'bg-fuchsia-400', ring: 'ring-fuchsia-400' },
  { id: 'rocket',    emoji: '🚀', bg: 'bg-blue-500',    ring: 'ring-blue-400' },
  { id: 'tiger',     emoji: '🐯', bg: 'bg-amber-500',   ring: 'ring-amber-400' },
  { id: 'butterfly', emoji: '🦋', bg: 'bg-purple-500',  ring: 'ring-purple-400' },
];

export function getAvatar(id: string | undefined): Avatar {
  return AVATARS.find(a => a.id === id) ?? AVATARS[9]; // rocket as fallback
}
