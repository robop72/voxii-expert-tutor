import React, { useState } from 'react';

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  topic: string;
}

interface Results {
  easy: number;
  good: number;
  hard: number;
  again: number;
}

interface Props {
  cards: Flashcard[];
  onDone: (results: Results) => void;
}

type Rating = 'again' | 'hard' | 'good' | 'easy';

export default function FlashcardDeck({ cards, onDone }: Props) {
  const [queue, setQueue] = useState<number[]>(() => cards.map((_, i) => i));
  const [mastered, setMastered] = useState<Set<number>>(new Set());
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState<Results>({ easy: 0, good: 0, hard: 0, again: 0 });
  const [done, setDone] = useState(false);

  const currentIdx = queue[0];
  const currentCard = currentIdx !== undefined ? cards[currentIdx] : null;
  const masteredCount = mastered.size;

  function rate(rating: Rating) {
    const newResults: Results = { ...results, [rating]: results[rating] + 1 };
    setResults(newResults);

    const newQueue = [...queue];
    const cardIdx = newQueue.shift()!;

    if (rating === 'again') {
      newQueue.push(cardIdx);
    } else if (rating === 'hard') {
      newQueue.splice(Math.min(2, newQueue.length), 0, cardIdx);
    } else {
      const newMastered = new Set(mastered);
      newMastered.add(cardIdx);
      setMastered(newMastered);
      if (newQueue.length === 0) {
        setDone(true);
        onDone(newResults);
        return;
      }
    }

    setQueue(newQueue);
    setFlipped(false);
  }

  if (done || !currentCard) {
    return (
      <div className="text-center py-10">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Deck Complete!</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          You reviewed {cards.length} flashcard{cards.length !== 1 ? 's' : ''}.
        </p>
        <div className="flex justify-center flex-wrap gap-3 text-sm">
          <span className="px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
            {results.easy + results.good} mastered
          </span>
          <span className="px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
            {results.hard} hard
          </span>
          <span className="px-3 py-1.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
            {results.again} missed
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Progress bar */}
      <div className="w-full max-w-lg">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
          <span>{masteredCount} mastered</span>
          <span>{cards.length - masteredCount} remaining</span>
        </div>
        <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <div
            className="h-full rounded-full bg-green-500 transition-all duration-500"
            style={{ width: `${(masteredCount / cards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div
        onClick={() => !flipped && setFlipped(true)}
        className={`w-full max-w-lg min-h-[200px] rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center p-8 text-center select-none ${
          flipped
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md'
        }`}
      >
        <p className="text-[10px] uppercase tracking-widest font-semibold text-gray-400 dark:text-gray-500 mb-3">
          {flipped ? 'Answer' : 'Question'} · {currentCard.topic}
        </p>
        <p className="text-base font-medium text-gray-900 dark:text-white leading-relaxed">
          {flipped ? currentCard.answer : currentCard.question}
        </p>
        {!flipped && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">Click to reveal answer</p>
        )}
      </div>

      {/* Rating / reveal controls */}
      {flipped ? (
        <div className="flex flex-wrap gap-2.5 justify-center">
          <button
            onClick={() => rate('again')}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
          >
            Again
          </button>
          <button
            onClick={() => rate('hard')}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
          >
            Hard
          </button>
          <button
            onClick={() => rate('good')}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
          >
            Good
          </button>
          <button
            onClick={() => rate('easy')}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
          >
            Easy
          </button>
        </div>
      ) : (
        <button
          onClick={() => setFlipped(true)}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-colors"
        >
          Show Answer
        </button>
      )}

      {/* End review shortcut */}
      <button
        onClick={() => { setDone(true); onDone(results); }}
        className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        End review early
      </button>
    </div>
  );
}
