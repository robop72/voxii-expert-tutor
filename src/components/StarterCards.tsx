import React, { useMemo } from 'react';
import { YearLevel, Subject, starterCardsConfig, isYearLevel } from '../lib/curriculumConfig';

interface Props {
  yearLevel: YearLevel;
  subject: Subject;
  onSelect: (prompt: string) => void;
}

function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

export default function StarterCards({ yearLevel, subject, onSelect }: Props) {
  if (!isYearLevel(yearLevel)) return null;
  const pool = starterCardsConfig[subject]?.[yearLevel];
  if (!pool) return null;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cards = useMemo(() => pickRandom(pool, 3), [subject, yearLevel]);

  return (
    <div className="grid grid-cols-3 gap-2 w-full">
      {cards.map(card => (
        <button
          key={card.title}
          onClick={() => onSelect(card.prompt)}
          className="group text-left p-2.5 sm:p-3 rounded-xl bg-white/80 dark:bg-gray-800/60 hover:bg-gray-100/80 dark:hover:bg-gray-700/70 border border-gray-200/80 dark:border-gray-700/50 hover:border-blue-400/60 dark:hover:border-blue-500/40 hover:shadow-[0_0_14px_rgba(59,130,246,0.12)] transition-colors duration-200 active:scale-[0.99] flex flex-col gap-1.5"
        >
          <div className="text-lg leading-none">{card.emoji}</div>
          <p className="text-xs font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors leading-snug">
            {card.title}
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug hidden sm:block">{card.description}</p>
        </button>
      ))}
    </div>
  );
}
