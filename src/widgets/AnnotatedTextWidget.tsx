import React, { useState } from 'react';

export interface Annotation {
  word: string;
  label: string;
  color: string;
}

export interface AnnotatedTextWidgetProps {
  text: string;
  annotations: Annotation[];
  title?: string;
}

const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  blue:   { bg: 'bg-blue-900/40',   text: 'text-blue-300',   border: 'border-blue-500' },
  green:  { bg: 'bg-green-900/40',  text: 'text-green-300',  border: 'border-green-500' },
  yellow: { bg: 'bg-yellow-900/40', text: 'text-yellow-300', border: 'border-yellow-500' },
  pink:   { bg: 'bg-pink-900/40',   text: 'text-pink-300',   border: 'border-pink-500' },
  purple: { bg: 'bg-purple-900/40', text: 'text-purple-300', border: 'border-purple-500' },
  orange: { bg: 'bg-orange-900/40', text: 'text-orange-300', border: 'border-orange-500' },
};

function getColors(color: string) {
  return COLOR_MAP[color.toLowerCase()] ?? COLOR_MAP.blue;
}

function buildSegments(text: string, annotations: Annotation[]) {
  // Sort annotations by position in text (longest first to avoid partial overlaps)
  const sorted = [...annotations].sort((a, b) => b.word.length - a.word.length);
  const segments: { text: string; annotation?: Annotation }[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    let earliest = -1;
    let matched: Annotation | null = null;

    for (const ann of sorted) {
      const idx = remaining.toLowerCase().indexOf(ann.word.toLowerCase());
      if (idx !== -1 && (earliest === -1 || idx < earliest)) {
        earliest = idx;
        matched = ann;
      }
    }

    if (!matched || earliest === -1) {
      segments.push({ text: remaining });
      break;
    }

    if (earliest > 0) segments.push({ text: remaining.slice(0, earliest) });
    segments.push({ text: remaining.slice(earliest, earliest + matched.word.length), annotation: matched });
    remaining = remaining.slice(earliest + matched.word.length);
  }

  return segments;
}

export default function AnnotatedTextWidget({ text, annotations, title }: AnnotatedTextWidgetProps) {
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const segments = buildSegments(text, annotations);
  const uniqueLabels = [...new Set(annotations.map(a => ({ label: a.label, color: a.color })))];

  return (
    <div className="my-4 rounded-xl border border-gray-700 overflow-hidden">
      <div className="px-4 py-2 bg-gray-800/80 border-b border-gray-700 flex items-center gap-2">
        <span className="text-sm">📝</span>
        <span className="text-xs font-medium text-gray-300">{title ?? 'Literary Devices'}</span>
      </div>

      <div className="p-4 bg-gray-900/60">
        {/* Legend */}
        <div className="flex flex-wrap gap-2 mb-4">
          {uniqueLabels.map(({ label, color }) => {
            const c = getColors(color);
            return (
              <button
                key={label}
                onClick={() => setActiveLabel(activeLabel === label ? null : label)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${c.bg} ${c.text} ${c.border} ${activeLabel && activeLabel !== label ? 'opacity-30' : 'opacity-100'}`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Annotated text */}
        <p className="text-sm text-gray-200 leading-relaxed">
          {segments.map((seg, i) => {
            if (!seg.annotation) return <span key={i}>{seg.text}</span>;
            const c = getColors(seg.annotation.color);
            const dimmed = activeLabel && activeLabel !== seg.annotation.label;
            return (
              <span key={i} className="relative group">
                <span className={`${c.bg} ${c.text} px-0.5 rounded border-b-2 ${c.border} cursor-pointer transition-all ${dimmed ? 'opacity-20' : 'opacity-100'}`}>
                  {seg.text}
                </span>
                <span className={`absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10 ${c.bg} ${c.text} border ${c.border}`}>
                  {seg.annotation.label}
                </span>
              </span>
            );
          })}
        </p>
      </div>
    </div>
  );
}
