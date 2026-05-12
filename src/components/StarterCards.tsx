import React from 'react';
import { YearLevel, Subject, starterCardsConfig, isYearLevel } from '../lib/curriculumConfig';

interface Props {
  yearLevel: YearLevel;
  subject: Subject;
  onSelect: (prompt: string) => void;
}

export default function StarterCards({ yearLevel, subject, onSelect }: Props) {
  if (!isYearLevel(yearLevel)) return null;
  const cards = starterCardsConfig[subject]?.[yearLevel];
  if (!cards) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 w-full">
      {cards.map(card => (
        <button
          key={card.title}
          onClick={() => onSelect(card.prompt)}
          className="group text-left p-3 sm:p-4 rounded-2xl bg-white/80 dark:bg-gray-800/60 hover:bg-gray-100/80 dark:hover:bg-gray-700/70 border border-gray-200/80 dark:border-gray-700/50 hover:border-blue-400/60 dark:hover:border-blue-500/40 hover:shadow-[0_0_18px_rgba(59,130,246,0.12)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.99] sm:flex-col flex items-center sm:items-start gap-3 sm:gap-0"
        >
          <div className="text-2xl sm:mb-2 flex-shrink-0">{card.emoji}</div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white sm:mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
              {card.title}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed hidden sm:block">{card.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
