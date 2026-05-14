import React from 'react';
import { StreakData } from '../hooks/useStreak';

interface Props {
  data: StreakData;
}

export default function StreakDisplay({ data }: Props) {
  const { current_streak, dailyGoalMet, streakFreezeCount } = data;

  return (
    <div className="flex items-center gap-1 flex-shrink-0 select-none" title={`${current_streak} day streak`}>
      <span
        className="text-lg leading-none transition-all duration-300"
        style={{ filter: dailyGoalMet ? 'none' : 'grayscale(1) opacity(0.7)' }}
      >
        🔥
      </span>
      <span
        className={`text-sm font-semibold tabular-nums transition-colors duration-300 ${
          dailyGoalMet
            ? 'text-orange-500 dark:text-orange-400'
            : 'text-gray-400 dark:text-gray-300'
        }`}
      >
        {current_streak}
      </span>
      {streakFreezeCount > 0 && (
        <span className="text-base leading-none" title={`${streakFreezeCount} streak freeze${streakFreezeCount > 1 ? 's' : ''} available`}>
          🛡️
        </span>
      )}
    </div>
  );
}
