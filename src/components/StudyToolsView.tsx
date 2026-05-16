import React, { useState, useRef } from 'react';
import { Subject, YearLevel } from '../lib/curriculumConfig';
import { StoredProfile } from '../hooks/useStudentProfile';
import FlashcardDeck, { Flashcard } from './FlashcardDeck';

interface ProcessedContent {
  file_type: 'image' | 'audio' | 'pdf';
  filename: string;
  extracted_text: string;
  word_count: number;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: string;
  topic: string;
}

interface Props {
  subject: Subject;
  yearLevel: YearLevel;
  profile: StoredProfile | null;
  accessToken?: string;
  onBack: () => void;
}

type PageStage = 'upload' | 'processing' | 'ready';
type QuizStage = 'setup' | 'generating' | 'taking' | 'results';
type FcStage = 'setup' | 'generating' | 'deck' | 'done';
type PodcastStage = 'setup' | 'generating' | 'ready' | 'playing';

const FILE_TYPE_ICONS: Record<string, string> = {
  pdf: '📄',
  image: '🖼️',
  audio: '🎙️',
};

function splitIntoChunks(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > maxLen) {
    let cut = remaining.lastIndexOf('. ', maxLen);
    if (cut === -1) cut = remaining.lastIndexOf(' ', maxLen);
    if (cut === -1) cut = maxLen;
    chunks.push(remaining.slice(0, cut + 1).trim());
    remaining = remaining.slice(cut + 1).trim();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}

export default function StudyToolsView({ subject, yearLevel, profile, accessToken, onBack }: Props) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://voxii-tutor-backend-919882895306.australia-southeast1.run.app';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const podcastPlayingRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [pageStage, setPageStage] = useState<PageStage>('upload');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [content, setContent] = useState<ProcessedContent | null>(null);
  const [activeTab, setActiveTab] = useState<'quiz' | 'flashcards' | 'podcast'>('quiz');

  // Quiz
  const [quizStage, setQuizStage] = useState<QuizStage>('setup');
  const [quizCount, setQuizCount] = useState(5);
  const [quiz, setQuiz] = useState<{ title: string; questions: QuizQuestion[] } | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [quizError, setQuizError] = useState<string | null>(null);

  // Flashcards
  const [fcStage, setFcStage] = useState<FcStage>('setup');
  const [fcCount, setFcCount] = useState(10);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [fcResults, setFcResults] = useState<{ easy: number; good: number; hard: number; again: number } | null>(null);
  const [fcError, setFcError] = useState<string | null>(null);

  // Podcast
  const [podcastStage, setPodcastStage] = useState<PodcastStage>('setup');
  const [podcastScript, setPodcastScript] = useState('');
  const [podcastError, setPodcastError] = useState<string | null>(null);

  // ── File upload ──────────────────────────────────────────────────────────────

  async function uploadFile(file: File) {
    if (file.size > 20 * 1024 * 1024) {
      setUploadError('File too large. Maximum 20 MB.');
      return;
    }
    const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp3', 'wav', 'm4a', 'ogg', 'webm', 'pdf'];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!allowedExts.includes(ext)) {
      setUploadError('Unsupported file type. Upload a PDF, image (JPG/PNG/WEBP), or audio (MP3/WAV/M4A).');
      return;
    }

    setUploadError(null);
    setPageStage('processing');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${backendUrl}/process-upload`, {
        method: 'POST',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        body: formData,
      });
      if (!res.ok) {
        let detail = `Server error ${res.status}`;
        try {
          const err = await res.json();
          detail = typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail);
        } catch {
          const text = await res.text().catch(() => '');
          if (text) detail = text.slice(0, 200);
        }
        throw new Error(detail);
      }
      const data: ProcessedContent = await res.json();
      setContent(data);
      // Reset all study aid stages on new upload
      setQuizStage('setup'); setFcStage('setup'); setPodcastStage('setup');
      setQuiz(null); setFlashcards([]); setFcResults(null); setPodcastScript('');
      setPageStage('ready');
    } catch (e: any) {
      setUploadError(e.message || 'Failed to process file. Please try again.');
      setPageStage('upload');
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  // ── Quiz generation ──────────────────────────────────────────────────────────

  async function generateQuiz() {
    if (!content) return;
    setQuizStage('generating');
    setQuizError(null);
    try {
      const res = await fetch('/api/generate-study-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extracted_text: content.extracted_text, subject, year_level: yearLevel, question_count: quizCount }),
      });
      if (!res.ok) throw new Error('Generation failed');
      const data = await res.json();
      setQuiz(data);
      setQuizAnswers({});
      setCurrentQ(0);
      setQuizStage('taking');
    } catch {
      setQuizError('Failed to generate quiz. Please try again.');
      setQuizStage('setup');
    }
  }

  // ── Flashcard generation ─────────────────────────────────────────────────────

  async function generateFlashcards() {
    if (!content) return;
    setFcStage('generating');
    setFcError(null);
    try {
      const res = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extracted_text: content.extracted_text, subject, year_level: yearLevel, count: fcCount }),
      });
      if (!res.ok) throw new Error('Generation failed');
      const data = await res.json();
      setFlashcards(data.flashcards || []);
      setFcResults(null);
      setFcStage('deck');
    } catch {
      setFcError('Failed to generate flashcards. Please try again.');
      setFcStage('setup');
    }
  }

  // ── Podcast generation + playback ────────────────────────────────────────────

  async function generatePodcast() {
    if (!content) return;
    setPodcastStage('generating');
    setPodcastError(null);
    try {
      const res = await fetch('/api/generate-podcast-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extracted_text: content.extracted_text, subject, year_level: yearLevel, student_name: profile?.student_name }),
      });
      if (!res.ok) throw new Error('Generation failed');
      const data = await res.json();
      setPodcastScript(data.script || '');
      setPodcastStage('ready');
    } catch {
      setPodcastError('Failed to generate podcast. Please try again.');
      setPodcastStage('setup');
    }
  }

  async function playPodcast() {
    setPodcastStage('playing');
    podcastPlayingRef.current = true;
    const chunks = splitIntoChunks(podcastScript, 3500);
    for (const chunk of chunks) {
      if (!podcastPlayingRef.current) break;
      try {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: chunk }),
        });
        if (!res.ok) continue;
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        await new Promise<void>(resolve => {
          const audio = new Audio(url);
          audioRef.current = audio;
          audio.onended = resolve;
          audio.onerror = resolve;
          audio.play().catch(resolve);
        });
        URL.revokeObjectURL(url);
      } catch {}
    }
    podcastPlayingRef.current = false;
    audioRef.current = null;
    setPodcastStage('ready');
  }

  function stopPodcast() {
    podcastPlayingRef.current = false;
    audioRef.current?.pause();
    audioRef.current = null;
    setPodcastStage('ready');
  }

  // ── Render helpers ───────────────────────────────────────────────────────────

  function Spinner() {
    return (
      <svg className="w-6 h-6 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
    );
  }

  function renderQuizTab() {
    if (quizStage === 'setup') return (
      <div className="flex flex-col items-center gap-5 py-6">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Generate an Active Recall quiz based on your uploaded content.
          </p>
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-sm text-gray-600 dark:text-gray-400">Questions:</span>
            {[5, 10].map(n => (
              <button
                key={n}
                onClick={() => setQuizCount(n)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  quizCount === n
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          {quizError && <p className="text-sm text-red-500 mb-3">{quizError}</p>}
          <button
            onClick={generateQuiz}
            className="px-6 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 transition-colors"
          >
            Generate Quiz
          </button>
        </div>
      </div>
    );

    if (quizStage === 'generating') return (
      <div className="flex flex-col items-center gap-3 py-10">
        <Spinner />
        <p className="text-sm text-gray-500 dark:text-gray-400">Generating {quizCount} questions…</p>
      </div>
    );

    if (quizStage === 'taking' && quiz) {
      const q = quiz.questions[currentQ];
      const selected = quizAnswers[q.id];
      const isLast = currentQ === quiz.questions.length - 1;
      return (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{quiz.title}</span>
            <span>{currentQ + 1} / {quiz.questions.length}</span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${((currentQ + 1) / quiz.questions.length) * 100}%` }} />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-4 leading-relaxed">{q.question}</p>
            <div className="flex flex-col gap-2">
              {q.options.map((opt, i) => {
                const letter = 'ABCD'[i];
                const isSelected = selected === letter;
                return (
                  <button
                    key={letter}
                    onClick={() => !selected && setQuizAnswers(a => ({ ...a, [q.id]: letter }))}
                    className={`text-left px-4 py-3 rounded-xl text-sm border-2 transition-all ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-400 dark:border-indigo-500 text-indigo-700 dark:text-indigo-300 font-medium'
                        : 'bg-gray-50 dark:bg-gray-700/50 border-transparent hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                    } ${selected && !isSelected ? 'opacity-50' : ''}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
          {selected && (
            <button
              onClick={() => {
                if (isLast) setQuizStage('results');
                else { setCurrentQ(q => q + 1); }
              }}
              className="self-end px-5 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 transition-colors"
            >
              {isLast ? 'See Results' : 'Next Question'}
            </button>
          )}
        </div>
      );
    }

    if (quizStage === 'results' && quiz) {
      const score = quiz.questions.filter(q => quizAnswers[q.id] === q.correct).length;
      const pct = Math.round((score / quiz.questions.length) * 100);
      return (
        <div className="flex flex-col gap-4">
          <div className="text-center py-4">
            <div className={`text-4xl font-bold mb-1 ${pct >= 70 ? 'text-green-500' : pct >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
              {score}/{quiz.questions.length}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{pct}% correct</p>
          </div>
          <div className="flex flex-col gap-2">
            {quiz.questions.map((q, i) => {
              const userAns = quizAnswers[q.id];
              const correct = userAns === q.correct;
              return (
                <div key={q.id} className={`rounded-xl p-3.5 border text-sm ${correct ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
                  <p className="font-medium text-gray-900 dark:text-white mb-1">{i + 1}. {q.question}</p>
                  {!correct && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Your answer: <span className="text-red-600 dark:text-red-400 font-medium">{q.options['ABCD'.indexOf(userAns)] || '—'}</span>
                      {' · '}Correct: <span className="text-green-600 dark:text-green-400 font-medium">{q.options['ABCD'.indexOf(q.correct)]}</span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <button
            onClick={() => { setQuizStage('setup'); setQuiz(null); }}
            className="self-center px-5 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 transition-colors"
          >
            Take Another Quiz
          </button>
        </div>
      );
    }
    return null;
  }

  function renderFlashcardsTab() {
    if (fcStage === 'setup') return (
      <div className="flex flex-col items-center gap-5 py-6">
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          Generate Spaced Repetition flashcards from your content.
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Cards:</span>
          {[5, 10, 15].map(n => (
            <button
              key={n}
              onClick={() => setFcCount(n)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                fcCount === n
                  ? 'bg-violet-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        {fcError && <p className="text-sm text-red-500">{fcError}</p>}
        <button
          onClick={generateFlashcards}
          className="px-6 py-2.5 rounded-xl bg-violet-500 text-white text-sm font-semibold hover:bg-violet-600 transition-colors"
        >
          Generate Flashcards
        </button>
      </div>
    );

    if (fcStage === 'generating') return (
      <div className="flex flex-col items-center gap-3 py-10">
        <Spinner />
        <p className="text-sm text-gray-500 dark:text-gray-400">Creating {fcCount} flashcards…</p>
      </div>
    );

    if (fcStage === 'deck') return (
      <FlashcardDeck
        cards={flashcards}
        onDone={results => { setFcResults(results); setFcStage('done'); }}
      />
    );

    if (fcStage === 'done' && fcResults) {
      const mastered = fcResults.easy + fcResults.good;
      return (
        <div className="flex flex-col items-center gap-5 py-6">
          <div className="text-5xl">🎉</div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {mastered}/{flashcards.length} cards mastered
          </p>
          <div className="flex flex-wrap gap-3 justify-center text-sm">
            <span className="px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">{fcResults.easy} easy</span>
            <span className="px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">{fcResults.good} good</span>
            <span className="px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">{fcResults.hard} hard</span>
            <span className="px-3 py-1.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">{fcResults.again} missed</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setFcStage('deck'); setFcResults(null); }}
              className="px-5 py-2.5 rounded-xl bg-violet-500 text-white text-sm font-semibold hover:bg-violet-600 transition-colors"
            >
              Study Again
            </button>
            <button
              onClick={() => setFcStage('setup')}
              className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              New Set
            </button>
          </div>
        </div>
      );
    }
    return null;
  }

  function renderPodcastTab() {
    if (podcastStage === 'setup') return (
      <div className="flex flex-col items-center gap-4 py-6">
        <div className="text-4xl">🎧</div>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-sm">
          Transform your content into a conversational audio study guide you can listen to anywhere.
        </p>
        {podcastError && <p className="text-sm text-red-500">{podcastError}</p>}
        <button
          onClick={generatePodcast}
          className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors"
        >
          Generate Podcast
        </button>
      </div>
    );

    if (podcastStage === 'generating') return (
      <div className="flex flex-col items-center gap-3 py-10">
        <Spinner />
        <p className="text-sm text-gray-500 dark:text-gray-400">Writing your study podcast…</p>
      </div>
    );

    if (podcastStage === 'ready' || podcastStage === 'playing') return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Study Podcast Script</p>
          <div className="flex gap-2">
            {podcastStage === 'playing' ? (
              <button
                onClick={stopPodcast}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm font-semibold hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="1" />
                </svg>
                Stop
              </button>
            ) : (
              <button
                onClick={playPodcast}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Play
              </button>
            )}
            <button
              onClick={() => { setPodcastStage('setup'); setPodcastScript(''); }}
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Regenerate
            </button>
          </div>
        </div>
        {podcastStage === 'playing' && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
            <span className="flex gap-0.5">
              {[0, 1, 2].map(i => (
                <span key={i} className="w-1 bg-emerald-500 rounded-full animate-bounce" style={{ height: '12px', animationDelay: `${i * 0.15}s` }} />
              ))}
            </span>
            <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Playing audio…</span>
          </div>
        )}
        <div className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 max-h-72 overflow-y-auto">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{podcastScript}</p>
        </div>
      </div>
    );

    return null;
  }

  // ── Upload zone ──────────────────────────────────────────────────────────────

  if (pageStage === 'upload') return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex-shrink-0">
        <button onClick={onBack} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-base font-semibold text-gray-900 dark:text-white">Study Tools</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">{subject} · Year {yearLevel}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-xl mx-auto w-full gap-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Upload Your Content</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Drop a photo of a problem, a recorded lecture, or a PDF — Voxii will turn it into quizzes, flashcards, and audio study guides.
          </p>
        </div>

        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }`}
        >
          <div className="text-4xl">📁</div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Drop file here or click to browse</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Max 20 MB</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.mp3,.wav,.m4a,.ogg,.webm"
            onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f); e.target.value = ''; }}
          />
        </div>

        {uploadError && (
          <p className="text-sm text-red-500 dark:text-red-400 text-center">{uploadError}</p>
        )}

        <div className="grid grid-cols-3 gap-3 w-full text-center text-xs text-gray-500 dark:text-gray-400">
          {[
            { icon: '🖼️', label: 'Photo', desc: 'Handwritten problems, whiteboard notes' },
            { icon: '🎙️', label: 'Audio', desc: 'Recorded lectures, MP3, WAV, M4A' },
            { icon: '📄', label: 'PDF', desc: 'Textbooks, notes, past papers' },
          ].map(({ icon, label, desc }) => (
            <div key={label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
              <span className="text-2xl">{icon}</span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">{label}</span>
              <span>{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Processing ───────────────────────────────────────────────────────────────

  if (pageStage === 'processing') return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950 items-center justify-center gap-5">
      <Spinner />
      <div className="text-center">
        <p className="text-base font-semibold text-gray-900 dark:text-white mb-1">Processing your file…</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">This may take a moment for audio and large PDFs.</p>
      </div>
    </div>
  );

  // ── Ready — show study tools ─────────────────────────────────────────────────

  const tabs = [
    { id: 'quiz' as const, label: 'Active Recall Quiz', icon: '🧠', color: 'indigo' },
    { id: 'flashcards' as const, label: 'Flashcards', icon: '📚', color: 'violet' },
    { id: 'podcast' as const, label: 'Audio Podcast', icon: '🎧', color: 'emerald' },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex-shrink-0">
        <button onClick={onBack} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-gray-900 dark:text-white">Study Tools</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">{subject} · Year {yearLevel}</p>
        </div>
        {content && (
          <button
            onClick={() => { setContent(null); setPageStage('upload'); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            New upload
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-5 flex flex-col gap-5">

          {/* Content summary card */}
          {content && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
              <span className="text-3xl flex-shrink-0">{FILE_TYPE_ICONS[content.file_type]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{content.filename}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {content.word_count.toLocaleString()} words extracted · {content.file_type.toUpperCase()}
                </p>
              </div>
              <span className="flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                Ready
              </span>
            </div>
          )}

          {/* Tab navigation */}
          <div className="flex rounded-2xl bg-gray-100 dark:bg-gray-800 p-1 gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                <span className="text-sm">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 min-h-[280px]">
            {activeTab === 'quiz' && renderQuizTab()}
            {activeTab === 'flashcards' && renderFlashcardsTab()}
            {activeTab === 'podcast' && renderPodcastTab()}
          </div>

        </div>
      </div>
    </div>
  );
}
