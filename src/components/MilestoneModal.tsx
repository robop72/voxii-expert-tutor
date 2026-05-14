import React, { useEffect } from 'react';

interface Props {
  days: number;
  onDismiss: () => void;
}

const MILESTONE_CONFIG: Record<number, { emoji: string; label: string; color: string }> = {
  7:   { emoji: '🔥', label: 'One Week Streak!',    color: 'from-orange-400 to-red-500' },
  30:  { emoji: '⚡', label: 'One Month Streak!',   color: 'from-yellow-400 to-orange-500' },
  100: { emoji: '💎', label: '100 Day Legend!',     color: 'from-purple-500 to-blue-500' },
};

export default function MilestoneModal({ days, onDismiss }: Props) {
  const config = MILESTONE_CONFIG[days] ?? { emoji: '🎉', label: `${days} Day Streak!`, color: 'from-blue-400 to-purple-500' };

  useEffect(() => {
    const t = setTimeout(onDismiss, 6000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onDismiss}
    >
      <div
        className="milestone-pop bg-white dark:bg-gray-900 rounded-2xl shadow-2xl px-10 py-8 flex flex-col items-center gap-3 max-w-xs w-full mx-4"
        onClick={e => e.stopPropagation()}
        style={{ border: '2px solid transparent', backgroundClip: 'padding-box' }}
      >
        <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center text-4xl shadow-lg`}>
          {config.emoji}
        </div>
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">Achievement Unlocked</p>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{config.label}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            You've studied for <span className="font-semibold text-gray-700 dark:text-gray-300">{days} days in a row</span>. Keep it up!
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="mt-2 px-6 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Keep Going 💪
        </button>
      </div>
    </div>
  );
}
