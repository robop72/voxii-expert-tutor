import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Mic, MicOff, Send, Square, Volume2, VolumeX, X } from 'lucide-react';


function stripForTTS(text: string): string {
  return text
    .replace(/\[Graph:[^\]]*\]/gi, 'a graph')
    .replace(/\[Diagram:[^\]]*\]/gi, 'a diagram')
    .replace(/\[Image of [^\]]*\]/gi, 'an image')
    .replace(/\$\$[\s\S]+?\$\$/g, 'a mathematical formula')
    .replace(/\$[^$\n]+\$/g, 'a formula')
    .replace(/```[\s\S]+?```/g, 'a code example')
    .replace(/[*_#`]/g, '')
    .replace(/\n+/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();
}
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
  sendMessage: (text: string) => void;
  cancelMessage: () => void;
  studentName?: string;
  ttsEnabled?: boolean;
  apiSessionId?: string;
  accessToken?: string;
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
  messages, isLoading, sendMessage, cancelMessage, studentName,
  ttsEnabled = true, apiSessionId, accessToken,
}: Props) {
  const [input, setInput] = useState('');
  const [ttsActive, setTtsActive] = useState(ttsEnabled);
  const [isReading, setIsReading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const messagesRef = useRef(messages);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

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
    setInterimText('');
    sendMessage(text);
  }

  const handleReadAloud = useCallback(async () => {
    if (isReading) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsReading(false);
      return;
    }
    const tutorMsgs = messagesRef.current.filter(m => m.role === 'tutor');
    const lastTutor = tutorMsgs[tutorMsgs.length - 1];
    if (!lastTutor) return;
    const cleanText = stripForTTS(lastTutor.text).slice(0, 4000);

    setIsReading(true);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText }),
      });
      if (!res.ok) throw new Error('TTS failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setIsReading(false); URL.revokeObjectURL(url); audioRef.current = null; };
      audio.onerror = () => { setIsReading(false); URL.revokeObjectURL(url); audioRef.current = null; };
      audio.play();
    } catch {
      setIsReading(false);
    }
  }, [isReading]);

  const startRecognition = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = 'en-AU';
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    recognitionRef.current = rec;

    rec.onresult = (e: any) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) {
          const phrase = result[0].transcript.trim();
          if (phrase) setInput(prev => prev ? `${prev} ${phrase}` : phrase);
        } else {
          interim += result[0].transcript;
        }
      }
      setInterimText(interim);
    };

    rec.onerror = (e: any) => {
      // 'no-speech' is normal — auto-restart; other errors stop listening
      if (e.error !== 'no-speech') {
        isListeningRef.current = false;
        setIsListening(false);
        setInterimText('');
      }
    };

    // Auto-restart when browser times out (Chrome stops after ~60s silence)
    rec.onend = () => {
      setInterimText('');
      if (isListeningRef.current) {
        try { rec.start(); } catch {}
      } else {
        setIsListening(false);
      }
    };

    rec.start();
  }, []);

  const handleMic = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    if (isListening) {
      isListeningRef.current = false;
      recognitionRef.current?.stop();
      setIsListening(false);
      setInterimText('');
      return;
    }
    isListeningRef.current = true;
    setIsListening(true);
    startRecognition();
  }, [isListening, startRecognition]);

  const hasMicSupport = typeof window !== 'undefined' &&
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  const hasLastTutorMsg = messages.some(m => m.role === 'tutor');

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  const hasMessages = messages.length > 0;
  const greeting = studentName ? `Hi ${studentName}!` : 'Hello!';

  const inputBar = (
    <div className="flex items-end gap-2 bg-gray-100/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 rounded-3xl px-4 py-3 focus-within:border-gray-400 dark:focus-within:border-gray-600 transition-colors">
      {isReading ? (
        <button
          onClick={handleReadAloud}
          title="Stop reading"
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
        >
          <Square size={12} />
          Stop
        </button>
      ) : ttsActive ? (
        <div className="flex-shrink-0 flex items-center rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <button
            onClick={handleReadAloud}
            disabled={!hasLastTutorMsg}
            title="Read last response aloud"
            className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Volume2 size={12} />
            Read Aloud
          </button>
          <button
            onClick={() => setTtsActive(false)}
            title="Turn off read aloud"
            className="pr-2 py-1.5 pl-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={11} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setTtsActive(true)}
          title="Enable read aloud"
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
        >
          <VolumeX size={12} className="opacity-60" />
          Read Aloud
        </button>
      )}

      <div className="flex-1 min-w-0">
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={isListening && !input ? 'Listening…' : `Ask Voxii a ${subject} question…`}
          className="w-full bg-transparent outline-none resize-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 scrollbar-none"
          style={{ scrollbarWidth: 'none', overflowY: 'auto' }}
          disabled={isLoading}
        />
        {interimText && (
          <p className="text-sm text-gray-400 dark:text-gray-500 italic truncate mt-0.5">{interimText}</p>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {hasMicSupport && (
          <button
            onClick={handleMic}
            title={isListening ? 'Stop listening' : 'Speak your question'}
            className={`p-1.5 transition-colors rounded-full ${
              isListening
                ? 'text-red-500 animate-pulse'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        )}
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
