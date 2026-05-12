import React, { useRef, useEffect, useState } from 'react';
import { Mic, Send } from 'lucide-react';
import ExpertMessage from './ExpertMessage';
import StarterCards from './StarterCards';
import { Message } from '../hooks/useChat';
import { YearLevel, Subject } from '../lib/curriculumConfig';

interface Props {
  yearLevel: YearLevel;
  subject: Subject;
  isNaplanMode?: boolean;
  messages: Message[];
  isLoading: boolean;
  isAtTurnLimit?: boolean;
  sendMessage: (text: string) => void;
  cancelMessage: () => void;
  onNewChat?: () => void;
  studentName?: string;
}

const THINKING_PHRASES = [
  'Voxii is thinking…',
  'Voxii is compiling a response…',
  'Voxii is finding the right approach…',
  'Voxii is working through this…',
  'Voxii is checking the curriculum…',
  'Voxii is crafting an explanation…',
];

function ThinkingBubble() {
  const [phraseIdx, setPhraseIdx] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => setPhraseIdx(i => (i + 1) % THINKING_PHRASES.length), 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-3 py-3 px-1">
      <img
        src="/voxii-favicon.png"
        alt=""
        className="w-7 h-7 object-contain"
        style={{ animation: 'voxii-spin 2s linear infinite' }}
      />
      <span className="text-sm text-gray-500 dark:text-gray-400" style={{ animation: 'voxii-fade 2.2s ease-in-out infinite' }}>
        {THINKING_PHRASES[phraseIdx]}
      </span>
      <style>{`
        @keyframes voxii-spin {
          0%   { transform: rotate(0deg) scale(1); }
          25%  { transform: rotate(90deg) scale(1.08); }
          50%  { transform: rotate(180deg) scale(1); }
          75%  { transform: rotate(270deg) scale(1.08); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes voxii-fade {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default function ChatInterface({
  yearLevel, subject, isNaplanMode = false,
  messages, isLoading, isAtTurnLimit = false,
  sendMessage, cancelMessage, onNewChat, studentName,
}: Props) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [input]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    sendMessage(text);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  const hasMessages = messages.length > 0;
  const greeting = studentName ? `Hi ${studentName}!` : 'Hello!';

  const inputBar = isAtTurnLimit ? (
    <div className="flex flex-col items-center gap-2 py-3">
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
        Session limit reached. Start a new chat to keep going.
      </p>
      {onNewChat && (
        <button
          onClick={onNewChat}
          className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-colors"
        >
          Start new chat
        </button>
      )}
    </div>
  ) : (
    <div className="flex items-end gap-2 bg-gray-100/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 rounded-3xl px-4 py-3 focus-within:border-gray-400 dark:focus-within:border-gray-600 transition-colors">
      <button className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
        </svg>
        Read Aloud
      </button>

      <textarea
        ref={textareaRef}
        rows={1}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKey}
        placeholder={`Ask Voxii a ${subject} question…`}
        className="flex-1 bg-transparent outline-none resize-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 scrollbar-none"
        style={{ scrollbarWidth: 'none', overflowY: 'auto' }}
        disabled={isLoading}
      />

      <div className="flex items-center gap-2 flex-shrink-0">
        <button className="p-1.5 text-gray-500 hover:text-gray-300 transition-colors" title="Voice input">
          <Mic size={18} />
        </button>
        <button
          onClick={isLoading ? cancelMessage : handleSend}
          disabled={!isLoading && !input.trim()}
          className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={14} className="text-gray-900" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
      {hasMessages ? (
        <>
          {/* Scrollable message list */}
          <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col scrollbar-none">
            {messages.map((msg: Message) => (
              <div key={msg.id} className={msg.role === 'user' ? 'voxii-bubble-user' : 'voxii-bubble-tutor'}>
                {msg.role === 'tutor'
                  ? <ExpertMessage text={msg.text} />
                  : <p className="whitespace-pre-wrap text-sm">{msg.text}</p>}
              </div>
            ))}
            {isLoading && <ThinkingBubble />}
          </div>

          {/* Fixed input bar when chatting */}
          <div className="px-3 sm:px-6 pb-3 sm:pb-4 pt-2 bg-gray-50 dark:bg-gray-950 flex-shrink-0">
            <div className="max-w-2xl mx-auto">
              {inputBar}
              <p className="text-[10px] text-gray-400 dark:text-gray-600 text-center mt-1.5">Enter to send · Shift+Enter for new line</p>
            </div>
          </div>
        </>
      ) : (
        /* Welcome screen — input sits directly under the cards */
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none">
          <div className="flex flex-col items-center px-4 sm:px-6 pt-4 pb-6 max-w-2xl mx-auto w-full">
            <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg mb-0.5 mt-4 sm:mt-8">{greeting}</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 text-center">
              I'm your {subject} study friend
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mb-5 text-center">
              Secondary School · Year {yearLevel} · Victorian Curriculum 2.0
            </p>

            <StarterCards yearLevel={yearLevel} subject={subject} onSelect={sendMessage} />

            {/* Input directly under cards */}
            <div className="w-full mt-4">
              {inputBar}
            </div>

            <div className="w-full flex items-start gap-2 px-3 py-2 rounded-xl border border-blue-300 dark:border-blue-700/50 bg-blue-50 dark:bg-blue-900/20 mt-2">
              <span className="text-blue-500 dark:text-blue-400 text-xs mt-0.5 flex-shrink-0">🔒</span>
              <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-snug">
                <span className="font-semibold text-gray-800 dark:text-gray-200">Stay safe:</span> Don't share your name, school, or contact details. Voxii is here to help you learn.
              </p>
            </div>

            <p className="text-[10px] text-gray-400 dark:text-gray-600 text-center mt-2">Enter to send · Shift+Enter for new line</p>
          </div>
        </div>
      )}
    </div>
  );
}
