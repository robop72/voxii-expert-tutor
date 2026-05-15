import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';
import GraphWidget from '../widgets/GraphWidget';
import DiagramWidget from '../widgets/DiagramWidget';
import { WidgetRegistry } from '../widgets/registry';

interface Props {
  text: string;
}

type Part =
  | { type: 'text';    content: string }
  | { type: 'graph';   expressions: string[]; raw: string }
  | { type: 'diagram'; id: string }
  | { type: 'image';   content: string };

function buildParts(text: string): Part[] {
  // Combined regex processes [Graph:], [Diagram:], and [Image of] in document order
  const COMBINED = /\[Graph:\s*([^\]]+)\]|\[Diagram:\s*([^\]]+)\]|\[Image of ([^\]]+)\]/gi;
  const parts: Part[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = COMBINED.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    if (match[1] !== undefined) {
      const expressions = match[1].split(';').flatMap(e => e.split(',')).map(e => e.trim()).filter(Boolean);
      parts.push({ type: 'graph', expressions, raw: match[1].trim() });
    } else if (match[2] !== undefined) {
      parts.push({ type: 'diagram', id: match[2].trim() });
    } else {
      parts.push({ type: 'image', content: match[3] });
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) });
  }
  return parts;
}

function processHighlights(text: string): string {
  return text.replace(/==([^=\n]+)==/g, '<mark>$1</mark>');
}

function HighlightMark({ children }: { children?: React.ReactNode }) {
  return (
    <mark className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200 px-0.5 rounded font-medium not-italic" style={{ background: 'inherit' }}>
      {children}
    </mark>
  );
}

function WidgetInterceptor({ className, children }: { className?: string; children?: React.ReactNode }) {
  const language = /language-(\w+)/.exec(className || '')?.[1];

  if (language === 'json') {
    try {
      const parsed = JSON.parse(String(children).trim());
      // Handle legacy GraphWidget JSON — convert to new props shape
      if (parsed.widget === 'GraphWidget' && parsed.data) {
        const eq = parsed.data.equation ?? parsed.data.expressions?.[0] ?? '';
        const exprs = Array.isArray(parsed.data.expressions)
          ? parsed.data.expressions
          : [eq];
        return <GraphWidget expressions={exprs} label={parsed.data.label} />;
      }
      const Component = parsed.widget ? WidgetRegistry[parsed.widget] : null;
      if (Component && parsed.data) return <Component {...parsed.data} />;
    } catch { /* fall through */ }
  }

  return <code className={className}>{children}</code>;
}

export default function ExpertMessage({ text }: Props) {
  const parts = buildParts(text);

  return (
    <div className="space-y-3">
      {parts.map((part, i) => {
        if (part.type === 'graph') {
          return <GraphWidget key={i} expressions={part.expressions} label={part.raw} />;
        }
        if (part.type === 'diagram') {
          return <DiagramWidget key={i} id={part.id} />;
        }
        if (part.type === 'image') {
          return (
            <div key={i} className="my-4 text-center">
              <img
                src={`https://source.unsplash.com/featured/?${encodeURIComponent(part.content)},diagram,mathematics`}
                alt={part.content}
                className="max-w-full h-auto rounded-xl shadow-lg border border-gray-300 dark:border-gray-700 mx-auto"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">{part.content}</p>
            </div>
          );
        }
        return (
          <div key={i} className="prose dark:prose-invert prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex, rehypeRaw]}
              components={{ code: WidgetInterceptor, mark: HighlightMark }}
            >
              {processHighlights(part.content)}
            </ReactMarkdown>
          </div>
        );
      })}
    </div>
  );
}
