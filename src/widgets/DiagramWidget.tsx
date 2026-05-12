import React from 'react';

// ── Shared SVG helpers ────────────────────────────────────────────────────────

const T = ({ x, y, size = 11, anchor = 'middle', weight = 'normal', fill = '#e5e7eb', children }: {
  x: number; y: number; size?: number; anchor?: string; weight?: string; fill?: string; children: React.ReactNode;
}) => (
  <text x={x} y={y} fontSize={size} textAnchor={anchor} dominantBaseline="middle" fontWeight={weight} fill={fill} fontFamily="system-ui,sans-serif">
    {children}
  </text>
);

const Arrow = ({ x1, y1, x2, y2, color = '#6b7280' }: { x1: number; y1: number; x2: number; y2: number; color?: string }) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={1.5} markerEnd="url(#arr)" />
);

const arrowDef = (
  <defs>
    <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#6b7280" />
    </marker>
    <marker id="arrb" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#3b82f6" />
    </marker>
    <marker id="arrg" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#10b981" />
    </marker>
  </defs>
);

// ── English Diagrams ──────────────────────────────────────────────────────────

const TeelParagraph = () => (
  <svg viewBox="0 0 600 150" width="100%" style={{ maxHeight: 150 }}>
    {arrowDef}
    {[
      { x: 10,  label: 'T', title: 'Topic Sentence',   sub: 'State your argument',    color: '#3b82f6' },
      { x: 155, label: 'E', title: 'Evidence',         sub: 'Quote or example',       color: '#10b981' },
      { x: 300, label: 'E', title: 'Explanation',      sub: 'How does it support?',   color: '#8b5cf6' },
      { x: 445, label: 'L', title: 'Linking Sentence', sub: 'Connect back to thesis', color: '#f59e0b' },
    ].map(({ x, label, title, sub, color }, i, arr) => (
      <g key={label + i}>
        <rect x={x} y={15} width={130} height={115} rx={8} fill={color} opacity={0.15} stroke={color} strokeWidth={1.5} />
        <T x={x + 65} y={52} size={28} weight="bold" fill={color}>{label}</T>
        <T x={x + 65} y={88} size={10} weight="bold" fill="#e5e7eb">{title}</T>
        <T x={x + 65} y={108} size={9} fill="#9ca3af">{sub}</T>
        {i < arr.length - 1 && <Arrow x1={x + 135} y1={72} x2={x + 150} y2={72} />}
      </g>
    ))}
  </svg>
);

const EssayStructure = () => (
  <svg viewBox="0 0 320 340" width="100%" style={{ maxHeight: 340 }}>
    {arrowDef}
    {[
      { y: 10,  label: 'INTRODUCTION',  sub: 'Hook · Context · Thesis',            color: '#3b82f6', h: 55 },
      { y: 75,  label: 'BODY 1',        sub: 'Topic sentence · TEEL · Link',       color: '#10b981', h: 50 },
      { y: 135, label: 'BODY 2',        sub: 'Topic sentence · TEEL · Link',       color: '#10b981', h: 50 },
      { y: 195, label: 'BODY 3',        sub: 'Topic sentence · TEEL · Link',       color: '#10b981', h: 50 },
      { y: 255, label: 'CONCLUSION',    sub: 'Restate thesis · Summarise · Clinch', color: '#8b5cf6', h: 55 },
    ].map(({ y, label, sub, color, h }, i, arr) => (
      <g key={label}>
        <rect x={20} y={y} width={280} height={h} rx={7} fill={color} opacity={0.15} stroke={color} strokeWidth={1.5} />
        <T x={160} y={y + h / 2 - 8} size={11} weight="bold" fill={color}>{label}</T>
        <T x={160} y={y + h / 2 + 10} size={9} fill="#9ca3af">{sub}</T>
        {i < arr.length - 1 && <Arrow x1={160} y1={y + h + 1} x2={160} y2={y + h + 12} />}
      </g>
    ))}
  </svg>
);

const StoryArc = () => (
  <svg viewBox="0 0 600 220" width="100%" style={{ maxHeight: 220 }}>
    {arrowDef}
    <path d="M 30,190 L 160,80 L 300,30 L 420,90 L 580,190" fill="none" stroke="#8b5cf6" strokeWidth={2.5} strokeLinejoin="round" />
    <circle cx={30}  cy={190} r={5} fill="#8b5cf6" />
    <circle cx={160} cy={80}  r={5} fill="#8b5cf6" />
    <circle cx={300} cy={30}  r={7} fill="#f59e0b" />
    <circle cx={420} cy={90}  r={5} fill="#8b5cf6" />
    <circle cx={580} cy={190} r={5} fill="#8b5cf6" />
    {[
      { x: 30,  y: 190, label: 'Exposition',      sub: 'Characters &\nsetting introduced', anchor: 'start' },
      { x: 155, y: 80,  label: 'Rising Action',   sub: 'Conflict builds,\ntension grows',     anchor: 'middle' },
      { x: 300, y: 30,  label: 'Climax',          sub: 'Peak tension,\nturning point',        anchor: 'middle' },
      { x: 430, y: 90,  label: 'Falling Action',  sub: 'Consequences\nunfold',                anchor: 'middle' },
      { x: 580, y: 190, label: 'Resolution',      sub: 'Conflict resolved,\nnew normal',      anchor: 'end' },
    ].map(({ x, y, label, sub, anchor }) => (
      <g key={label}>
        <T x={x} y={y - 16} size={10} weight="bold" fill="#e5e7eb" anchor={anchor}>{label}</T>
        {sub.split('\n').map((line, i) => (
          <T key={i} x={x} y={y - 4 + (i * 13) + 22} size={9} fill="#9ca3af" anchor={anchor}>{line}</T>
        ))}
      </g>
    ))}
    <line x1={30} y1={195} x2={580} y2={195} stroke="#374151" strokeWidth={1} strokeDasharray="4 3" />
  </svg>
);

const PersuasiveStructure = () => (
  <svg viewBox="0 0 600 140" width="100%" style={{ maxHeight: 140 }}>
    {arrowDef}
    {[
      { x: 10,  label: 'CLAIM',       sub: 'Your position\nor argument',  color: '#3b82f6' },
      { x: 155, label: 'EVIDENCE',    sub: 'Facts, stats,\nexpert quotes', color: '#10b981' },
      { x: 300, label: 'REASONING',   sub: 'Explain HOW\nevidence fits',  color: '#8b5cf6' },
      { x: 445, label: 'REBUTTAL',    sub: 'Address the\nopposing view',  color: '#f59e0b' },
    ].map(({ x, label, sub, color }, i, arr) => (
      <g key={label}>
        <rect x={x} y={10} width={130} height={120} rx={8} fill={color} opacity={0.15} stroke={color} strokeWidth={1.5} />
        <T x={x + 65} y={42} size={10} weight="bold" fill={color}>{label}</T>
        {sub.split('\n').map((line, j) => (
          <T key={j} x={x + 65} y={62 + j * 16} size={9} fill="#9ca3af">{line}</T>
        ))}
        {i < arr.length - 1 && <Arrow x1={x + 135} y1={70} x2={x + 150} y2={70} />}
      </g>
    ))}
  </svg>
);

const ArgumentMap = () => (
  <svg viewBox="0 0 520 260" width="100%" style={{ maxHeight: 260 }}>
    {arrowDef}
    <rect x={170} y={10} width={180} height={50} rx={8} fill="#3b82f6" opacity={0.2} stroke="#3b82f6" strokeWidth={1.5} />
    <T x={260} y={35} size={11} weight="bold" fill="#3b82f6">THESIS / CONTENTION</T>
    {[
      { x: 20,  y: 100, label: 'ARGUMENT 1', sub: '1st reason\nsupporting claim' },
      { x: 190, y: 100, label: 'ARGUMENT 2', sub: '2nd reason\nsupporting claim' },
      { x: 360, y: 100, label: 'ARGUMENT 3', sub: '3rd reason\nsupporting claim' },
    ].map(({ x, y, label, sub }) => (
      <g key={label}>
        <line x1={260} y1={60} x2={x + 80} y2={y} stroke="#6b7280" strokeWidth={1.5} markerEnd="url(#arr)" />
        <rect x={x} y={y} width={140} height={60} rx={7} fill="#10b981" opacity={0.15} stroke="#10b981" strokeWidth={1.5} />
        <T x={x + 70} y={y + 20} size={9} weight="bold" fill="#10b981">{label}</T>
        {sub.split('\n').map((line, i) => <T key={i} x={x + 70} y={y + 36 + i * 14} size={9} fill="#9ca3af">{line}</T>)}
        <rect x={x + 15} y={y + 80} width={110} height={40} rx={5} fill="#374151" />
        <T x={x + 70} y={y + 100} size={8} fill="#9ca3af">Evidence &amp; example</T>
        <line x1={x + 70} y1={y + 60} x2={x + 70} y2={y + 80} stroke="#6b7280" strokeWidth={1} markerEnd="url(#arr)" />
      </g>
    ))}
  </svg>
);

// ── Science Diagrams ──────────────────────────────────────────────────────────

const AnimalCell = () => (
  <svg viewBox="0 0 500 300" width="100%" style={{ maxHeight: 300 }}>
    <ellipse cx={220} cy={155} rx={175} ry={125} fill="#1e3a5f" stroke="#3b82f6" strokeWidth={2} opacity={0.6} />
    <T x={30} y={22} size={9} fill="#60a5fa" anchor="start">Cell membrane</T>
    <line x1={75} y1={32} x2={65} y2={55} stroke="#60a5fa" strokeWidth={1} />
    <ellipse cx={220} cy={145} rx={55} ry={42} fill="#312e81" stroke="#8b5cf6" strokeWidth={2} />
    <T x={220} y={138} size={9} weight="bold" fill="#a78bfa">Nucleus</T>
    <ellipse cx={220} cy={148} rx={18} ry={14} fill="#4c1d95" stroke="#7c3aed" strokeWidth={1.5} />
    <T x={220} y={148} size={7} fill="#c4b5fd">Nucleolus</T>
    {[
      { cx: 130, cy: 200, label: 'Mitochondria', color: '#dc2626' },
      { cx: 330, cy: 195, label: 'Mitochondria', color: '#dc2626' },
    ].map(({ cx, cy, label, color }, i) => (
      <g key={i}>
        <ellipse cx={cx} cy={cy} rx={28} ry={16} fill={color} opacity={0.25} stroke={color} strokeWidth={1.5} />
        <T x={cx} y={cy + 28} size={8} fill="#fca5a5">{label}</T>
        <line x1={cx} y1={cy + 16} x2={cx} y2={cy + 22} stroke="#fca5a5" strokeWidth={1} />
      </g>
    ))}
    {[{ cx: 310, cy: 105 }, { cx: 150, cy: 108 }, { cx: 260, cy: 230 }].map(({ cx, cy }, i) => (
      <circle key={i} cx={cx} cy={cy} r={5} fill="#fbbf24" opacity={0.8} />
    ))}
    <T x={350} y={85} size={8} fill="#fbbf24">Ribosomes</T>
    <line x1={335} y1={88} x2={320} y2={100} stroke="#fbbf24" strokeWidth={1} />
    <T x={220} y={265} size={9} fill="#6b7280">Cytoplasm fills the cell interior</T>
  </svg>
);

const PlantCell = () => (
  <svg viewBox="0 0 500 310" width="100%" style={{ maxHeight: 310 }}>
    <rect x={30} y={20} width={350} height={240} rx={4} fill="#14532d" stroke="#16a34a" strokeWidth={3} opacity={0.5} />
    <rect x={40} y={30} width={330} height={220} rx={2} fill="#1e3a5f" stroke="#3b82f6" strokeWidth={1.5} opacity={0.6} />
    <T x={30} y={14} size={9} fill="#4ade80" anchor="start">Cell wall</T>
    <T x={205} y={42} size={8} fill="#60a5fa">Cell membrane</T>
    <ellipse cx={205} cy={130} rx={48} ry={38} fill="#312e81" stroke="#8b5cf6" strokeWidth={2} />
    <T x={205} y={130} size={9} weight="bold" fill="#a78bfa">Nucleus</T>
    {[
      { x: 290, y: 60,  w: 65, h: 100, label: 'Large Vacuole', color: '#0e7490' },
    ].map(({ x, y, w, h, label, color }) => (
      <g key={label}>
        <rect x={x} y={y} width={w} height={h} rx={8} fill={color} opacity={0.3} stroke={color} strokeWidth={1.5} />
        <T x={x + w / 2} y={y + h / 2} size={8} fill="#67e8f9">{label}</T>
      </g>
    ))}
    {[
      { cx: 80,  cy: 80  },
      { cx: 110, cy: 180 },
      { cx: 260, cy: 190 },
    ].map(({ cx, cy }, i) => (
      <ellipse key={i} cx={cx} cy={cy} rx={18} ry={12} fill="#14532d" stroke="#22c55e" strokeWidth={1.5} opacity={0.9} />
    ))}
    <T x={60} y={55} size={8} fill="#86efac">Chloroplasts</T>
    <line x1={80} y1={62} x2={80} y2={68} stroke="#86efac" strokeWidth={1} />
    {[{ cx: 170, cy: 195 }, { cx: 240, cy: 80 }].map(({ cx, cy }, i) => (
      <ellipse key={i} cx={cx} cy={cy} rx={20} ry={12} fill="#dc2626" opacity={0.25} stroke="#dc2626" strokeWidth={1.5} />
    ))}
    <T x={415} y={130} size={8} fill="#fca5a5" anchor="start">Mito-</T>
    <T x={415} y={142} size={8} fill="#fca5a5" anchor="start">chondria</T>
    <line x1={413} y1={135} x2={260} y2={135} stroke="#fca5a5" strokeWidth={1} strokeDasharray="3 2" />
  </svg>
);

const WaterCycle = () => (
  <svg viewBox="0 0 600 300" width="100%" style={{ maxHeight: 300 }}>
    {arrowDef}
    <defs>
      <marker id="arrg2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L0,6 L8,3 z" fill="#10b981" />
      </marker>
      <marker id="arrb2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L0,6 L8,3 z" fill="#3b82f6" />
      </marker>
    </defs>
    <ellipse cx={300} cy={260} rx={280} ry={25} fill="#1e3a5f" stroke="#3b82f6" strokeWidth={1.5} />
    <T x={300} y={260} size={10} fill="#60a5fa">Ocean / Lake (Collection)</T>
    <path d="M 80,230 Q 40,140 100,80 Q 140,30 200,60 Q 250,20 300,50 Q 340,70 300,110" fill="#1e3a8a" stroke="#4f46e5" strokeWidth={1.5} opacity={0.7} />
    <T x={150} y={155} size={9} fill="#818cf8">Mountains</T>
    <ellipse cx={400} cy={80} rx={80} ry={40} fill="#374151" stroke="#6b7280" strokeWidth={1.5} opacity={0.8} />
    <ellipse cx={440} cy={65} rx={55} ry={32} fill="#4b5563" stroke="#9ca3af" strokeWidth={1} opacity={0.9} />
    <T x={420} y={75} size={10} fill="#e5e7eb">Clouds</T>
    <path d="M 200,240 Q 170,160 180,100" fill="none" stroke="#10b981" strokeWidth={2} markerEnd="url(#arrg2)" strokeDasharray="6 3" />
    <T x={130} y={175} size={9} fill="#34d399">Evaporation</T>
    <path d="M 180,100 Q 270,50 370,70" fill="none" stroke="#9ca3af" strokeWidth={1.5} markerEnd="url(#arr)" />
    <T x={265} y={45} size={9} fill="#d1d5db">Condensation</T>
    {[390, 410, 425, 445, 460].map((x, i) => (
      <path key={i} d={`M ${x},${115 + i * 3} L ${x - 8 + i * 2},${140 + i * 4}`} fill="none" stroke="#3b82f6" strokeWidth={1.5} markerEnd="url(#arrb2)" />
    ))}
    <T x={480} y={140} size={9} fill="#60a5fa">Precipitation</T>
    <path d="M 290,230 Q 250,195 220,165" fill="none" stroke="#6b7280" strokeWidth={1.5} markerEnd="url(#arr)" />
    <T x={310} y={205} size={9} fill="#9ca3af">Runoff</T>
    <path d="M 170,240 Q 140,180 155,100" fill="none" stroke="#f59e0b" strokeWidth={1.5} markerEnd="url(#arr)" strokeDasharray="5 3" />
    <T x={90} y={185} size={9} fill="#fcd34d">Transpiration</T>
    <circle cx={540} cy={60} r={25} fill="#fbbf24" opacity={0.25} stroke="#fbbf24" strokeWidth={2} />
    <T x={540} y={60} size={9} fill="#fbbf24">Sun</T>
  </svg>
);

const FoodChain = () => (
  <svg viewBox="0 0 600 160" width="100%" style={{ maxHeight: 160 }}>
    {arrowDef}
    {[
      { x: 20,  emoji: '☀️',  label: 'Sun',     sub: 'Energy source',    color: '#fbbf24' },
      { x: 135, emoji: '🌿', label: 'Grass',    sub: 'Producer',         color: '#10b981' },
      { x: 255, emoji: '🐇', label: 'Rabbit',   sub: 'Primary Consumer', color: '#60a5fa' },
      { x: 375, emoji: '🦊', label: 'Fox',      sub: '2° Consumer',      color: '#f59e0b' },
      { x: 490, emoji: '🦅', label: 'Eagle',    sub: '3° Consumer',      color: '#a78bfa' },
    ].map(({ x, emoji, label, sub, color }, i, arr) => (
      <g key={label}>
        <rect x={x} y={25} width={95} height={100} rx={8} fill={color} opacity={0.1} stroke={color} strokeWidth={1.5} />
        <T x={x + 47} y={55} size={22}>{emoji}</T>
        <T x={x + 47} y={90} size={10} weight="bold" fill={color}>{label}</T>
        <T x={x + 47} y={108} size={8} fill="#9ca3af">{sub}</T>
        {i < arr.length - 1 && <Arrow x1={x + 98} y1={75} x2={x + 130} y2={75} />}
      </g>
    ))}
    <T x={300} y={148} size={9} fill="#6b7280">Energy flows in the direction of the arrows</T>
  </svg>
);

const AtomBohr = () => (
  <svg viewBox="0 0 380 280" width="100%" style={{ maxHeight: 280 }}>
    <circle cx={190} cy={140} r={28} fill="#1e3a5f" stroke="#3b82f6" strokeWidth={2} />
    <T x={190} y={135} size={9} fill="#93c5fd">Protons (+)</T>
    <T x={190} y={150} size={9} fill="#fca5a5">Neutrons</T>
    {[75, 115, 155].map((r, shell) => (
      <ellipse key={shell} cx={190} cy={140} rx={r} ry={r * 0.5} fill="none" stroke="#374151" strokeWidth={1.5} strokeDasharray="4 3" />
    ))}
    {[
      { angle: 0,   r: 75,  shell: 1 },
      { angle: 180, r: 75,  shell: 1 },
      { angle: 60,  r: 115, shell: 2 },
      { angle: 140, r: 115, shell: 2 },
      { angle: 220, r: 115, shell: 2 },
      { angle: 300, r: 115, shell: 2 },
      { angle: 30,  r: 155, shell: 3 },
      { angle: 90,  r: 155, shell: 3 },
    ].map(({ angle, r, shell }, i) => {
      const rad = (angle * Math.PI) / 180;
      const rx = r; const ry = r * 0.5;
      const ex = 190 + rx * Math.cos(rad);
      const ey = 140 + ry * Math.sin(rad);
      return <circle key={i} cx={ex} cy={ey} r={6} fill="#fbbf24" stroke="#f59e0b" strokeWidth={1} />;
    })}
    <T x={190} y={140 - 75 * 0.5 - 12} size={9} fill="#9ca3af">Shell 1 (2e⁻)</T>
    <T x={190} y={140 - 115 * 0.5 - 12} size={9} fill="#9ca3af">Shell 2 (8e⁻)</T>
    <T x={190} y={140 - 155 * 0.5 - 12} size={9} fill="#9ca3af">Shell 3</T>
    <T x={335} y={140} size={9} fill="#fbbf24" anchor="start">Electron (−)</T>
  </svg>
);

const CircuitSeries = () => (
  <svg viewBox="0 0 500 240" width="100%" style={{ maxHeight: 240 }}>
    <line x1={60} y1={60}  x2={440} y2={60}  stroke="#9ca3af" strokeWidth={2} />
    <line x1={440} y1={60} x2={440} y2={180} stroke="#9ca3af" strokeWidth={2} />
    <line x1={440} y1={180} x2={60} y2={180} stroke="#9ca3af" strokeWidth={2} />
    <line x1={60} y1={180} x2={60} y2={60}   stroke="#9ca3af" strokeWidth={2} />
    <rect x={35} y={100} width={50} height={70} rx={4} fill="#1f2937" stroke="#6b7280" strokeWidth={2} />
    <line x1={60} y1={100} x2={60} y2={95}  stroke="#ef4444" strokeWidth={2} />
    <line x1={60} y1={170} x2={60} y2={175} stroke="#6b7280" strokeWidth={2} />
    <rect x={42} y={108} width={16} height={50} rx={2} fill="#374151" />
    {[{ x: 2 }, { x: 6 }, { x: 10 }, { x: 14 }].map(({ x }, i) => (
      <line key={i} x1={42 + x} y1={115} x2={42 + x + 2} y2={145} stroke="#fbbf24" strokeWidth={1} opacity={0.8} />
    ))}
    <T x={60} y={208} size={9} fill="#9ca3af">Battery</T>
    {[160, 300].map((cx, i) => (
      <g key={i}>
        <circle cx={cx} cy={60}  r={18} fill="#1f2937" stroke="#fbbf24" strokeWidth={2} />
        <line x1={cx - 8} y1={52}  x2={cx + 8} y2={68} stroke="#fbbf24" strokeWidth={2} />
        <line x1={cx + 8} y1={52}  x2={cx - 8} y2={68} stroke="#fbbf24" strokeWidth={2} />
        <T x={cx} y={35} size={9} fill="#fcd34d">Bulb {i + 1}</T>
      </g>
    ))}
    <T x={250} y={208} size={9} fill="#6b7280">Series Circuit — same current through each component</T>
  </svg>
);

const CircuitParallel = () => (
  <svg viewBox="0 0 500 260" width="100%" style={{ maxHeight: 260 }}>
    <line x1={60} y1={50}  x2={440} y2={50}  stroke="#9ca3af" strokeWidth={2} />
    <line x1={440} y1={50} x2={440} y2={210} stroke="#9ca3af" strokeWidth={2} />
    <line x1={440} y1={210} x2={60} y2={210} stroke="#9ca3af" strokeWidth={2} />
    <line x1={60} y1={210} x2={60} y2={50}   stroke="#9ca3af" strokeWidth={2} />
    <line x1={200} y1={50}  x2={200} y2={210} stroke="#374151" strokeWidth={1.5} />
    <line x1={320} y1={50}  x2={320} y2={210} stroke="#374151" strokeWidth={1.5} />
    <rect x={35} y={105} width={50} height={70} rx={4} fill="#1f2937" stroke="#6b7280" strokeWidth={2} />
    <T x={60} y={228} size={9} fill="#9ca3af">Battery</T>
    {[
      { cx: 260, cy: 50,  label: 'Bulb 1' },
      { cx: 260, cy: 210, label: 'Bulb 2' },
    ].map(({ cx, cy, label }, i) => (
      <g key={i}>
        <circle cx={cx} cy={cy} r={18} fill="#1f2937" stroke="#fbbf24" strokeWidth={2} />
        <line x1={cx - 8} y1={cy - 8} x2={cx + 8} y2={cy + 8} stroke="#fbbf24" strokeWidth={2} />
        <line x1={cx + 8} y1={cy - 8} x2={cx - 8} y2={cy + 8} stroke="#fbbf24" strokeWidth={2} />
        <T x={cx} y={cy + (i === 0 ? -28 : 28)} size={9} fill="#fcd34d">{label}</T>
      </g>
    ))}
    <T x={250} y={248} size={9} fill="#6b7280">Parallel Circuit — same voltage across each branch</T>
  </svg>
);

const WaveDiagram = () => (
  <svg viewBox="0 0 600 220" width="100%" style={{ maxHeight: 220 }}>
    {arrowDef}
    <line x1={30} y1={110} x2={580} y2={110} stroke="#374151" strokeWidth={1} strokeDasharray="4 3" />
    <path d="M 40,110 C 80,40 120,40 160,110 C 200,180 240,180 280,110 C 320,40 360,40 400,110 C 440,180 480,180 520,110" fill="none" stroke="#3b82f6" strokeWidth={2.5} />
    <line x1={160} y1={42}  x2={160} y2={108} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="3 2" />
    <line x1={280} y1={112} x2={280} y2={178} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="3 2" />
    <line x1={40}  y1={42}  x2={40}  y2={178} stroke="#6b7280" strokeWidth={1} strokeDasharray="2 2" />
    <line x1={40}  y1={110} x2={160} y2={110} stroke="#fbbf24" strokeWidth={2} />
    <T x={100} y={125} size={10} fill="#fcd34d" weight="bold">Amplitude (A)</T>
    <line x1={160} y1={42}  x2={40}  y2={42}  stroke="#fbbf24" strokeWidth={2} />
    <line x1={40}  y1={178} x2={280} y2={178} stroke="#10b981" strokeWidth={2} />
    <T x={160} y={196} size={10} fill="#34d399" weight="bold">Wavelength (λ)</T>
    <T x={40}  y={42}  size={10} fill="#93c5fd" anchor="start">Crest</T>
    <T x={280} y={196} size={10} fill="#93c5fd" anchor="middle">Trough</T>
    <Arrow x1={540} y1={110} x2={575} y2={110} color="#9ca3af" />
    <T x={555} y={100} size={9} fill="#9ca3af">Direction</T>
    <T x={300} y={20} size={10} fill="#6b7280">Transverse Wave</T>
  </svg>
);

const ParticleStates = () => (
  <svg viewBox="0 0 580 220" width="100%" style={{ maxHeight: 220 }}>
    {[
      { x: 10,  label: 'SOLID',  sub: 'Fixed shape &\nfixed volume', color: '#3b82f6',
        dots: [{cx:65,cy:75},{cx:95,cy:75},{cx:125,cy:75},{cx:155,cy:75},{cx:65,cy:105},{cx:95,cy:105},{cx:125,cy:105},{cx:155,cy:105},{cx:65,cy:135},{cx:95,cy:135},{cx:125,cy:135},{cx:155,cy:135}] },
      { x: 200, label: 'LIQUID', sub: 'No fixed shape,\nfixed volume',  color: '#10b981',
        dots: [{cx:255,cy:80},{cx:290,cy:85},{cx:325,cy:78},{cx:355,cy:83},{cx:265,cy:110},{cx:300,cy:115},{cx:340,cy:108},{cx:260,cy:140},{cx:295,cy:143},{cx:330,cy:138},{cx:360,cy:142}] },
      { x: 390, label: 'GAS',   sub: 'No fixed shape,\nno fixed volume', color: '#f59e0b',
        dots: [{cx:430,cy:70},{cx:490,cy:90},{cx:550,cy:75},{cx:450,cy:120},{cx:520,cy:110},{cx:470,cy:155},{cx:540,cy:145},{cx:435,cy:145}] },
    ].map(({ x, label, sub, color, dots }) => (
      <g key={label}>
        <rect x={x} y={30} width={180} height={145} rx={8} fill={color} opacity={0.08} stroke={color} strokeWidth={1.5} />
        <T x={x + 90} y={18} size={10} weight="bold" fill={color}>{label}</T>
        {dots.map((d, i) => <circle key={i} cx={d.cx} cy={d.cy} r={10} fill={color} opacity={0.5} stroke={color} strokeWidth={1} />)}
        {sub.split('\n').map((line, i) => <T key={i} x={x + 90} y={188 + i * 14} size={9} fill="#9ca3af">{line}</T>)}
      </g>
    ))}
  </svg>
);

const ElectromagneticSpectrum = () => (
  <svg viewBox="0 0 620 200" width="100%" style={{ maxHeight: 200 }}>
    {[
      { x: 10,  w: 80,  label: 'Radio',      sub: 'Longest λ\nLowest f', color: '#7c3aed' },
      { x: 95,  w: 75,  label: 'Microwave',  sub: 'Cooking\nSatellite',  color: '#2563eb' },
      { x: 175, w: 75,  label: 'Infrared',   sub: 'Heat\nRemote ctrl',   color: '#059669' },
      { x: 255, w: 90,  label: 'Visible',    sub: 'Eyes can\ndetect this', color: '#d97706' },
      { x: 350, w: 70,  label: 'Ultraviolet', sub: 'Sunburn\nSterilise', color: '#b45309' },
      { x: 425, w: 70,  label: 'X-ray',      sub: 'Medical\nimaging',    color: '#dc2626' },
      { x: 500, w: 110, label: 'Gamma',      sub: 'Shortest λ\nHighest f', color: '#7f1d1d' },
    ].map(({ x, w, label, sub, color }) => (
      <g key={label}>
        <rect x={x} y={60} width={w} height={55} fill={color} opacity={0.35} />
        <T x={x + w / 2} y={82} size={9} weight="bold" fill="#e5e7eb">{label}</T>
        {sub.split('\n').map((line, i) => <T key={i} x={x + w / 2} y={98 + i * 12} size={8} fill="#9ca3af">{line}</T>)}
      </g>
    ))}
    <rect x={10} y={60} width={600} height={55} fill="none" stroke="#4b5563" strokeWidth={1.5} />
    <defs>
      <linearGradient id="visGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"   stopColor="#7c3aed" />
        <stop offset="16%"  stopColor="#2563eb" />
        <stop offset="33%"  stopColor="#059669" />
        <stop offset="50%"  stopColor="#fbbf24" />
        <stop offset="67%"  stopColor="#f97316" />
        <stop offset="83%"  stopColor="#ef4444" />
        <stop offset="100%" stopColor="#7f1d1d" />
      </linearGradient>
    </defs>
    <rect x={255} y={62} width={88} height={51} fill="url(#visGrad)" opacity={0.7} />
    <T x={10}  y={46} size={9} fill="#9ca3af" anchor="start">Longer wavelength (λ) — Lower frequency (f) — Lower energy</T>
    <T x={610} y={46} size={9} fill="#9ca3af" anchor="end">Shorter λ — Higher f — Higher energy</T>
    <T x={310} y={155} size={9} fill="#6b7280">Electromagnetic Spectrum</T>
  </svg>
);

// ── Additional Science Diagrams ───────────────────────────────────────────────

const HumanBodySystems = () => (
  <svg viewBox="0 0 580 240" width="100%" style={{ maxHeight: 240 }}>
    {[
      { x: 10, color: '#ef4444', title: 'Circulatory', icon: '❤️',
        items: ['Heart pumps blood', 'Arteries carry blood away', 'Veins return blood', 'Capillaries exchange O₂/CO₂'] },
      { x: 205, color: '#10b981', title: 'Digestive', icon: '🫁',
        items: ['Mouth → oesophagus', 'Stomach breaks food down', 'Small intestine absorbs nutrients', 'Large intestine removes water'] },
      { x: 400, color: '#3b82f6', title: 'Respiratory', icon: '🫀',
        items: ['Air enters via nose/mouth', 'Trachea → bronchi → lungs', 'Alveoli: O₂ in, CO₂ out', 'Diaphragm drives breathing'] },
    ].map(({ x, color, title, icon, items }) => (
      <g key={title}>
        <rect x={x} y={10} width={170} height={220} rx={8} fill={color} opacity={0.08} stroke={color} strokeWidth={1.5} />
        <T x={x + 85} y={32} size={11} weight="bold" fill={color}>{icon} {title}</T>
        {items.map((item, i) => (
          <g key={i}>
            <circle cx={x + 16} cy={60 + i * 42} r={3} fill={color} opacity={0.7} />
            <text x={x + 26} y={60 + i * 42} fontSize={8.5} dominantBaseline="middle" fill="#d1d5db" fontFamily="system-ui,sans-serif">{item}</text>
          </g>
        ))}
      </g>
    ))}
  </svg>
);

const DnaStructure = () => (
  <svg viewBox="0 0 400 300" width="100%" style={{ maxHeight: 300 }}>
    {/* Left backbone */}
    <path d="M 100,20 C 80,60 120,100 100,140 C 80,180 120,220 100,260 C 80,300 120,340 100,380" fill="none" stroke="#3b82f6" strokeWidth={3} />
    {/* Right backbone */}
    <path d="M 280,20 C 300,60 260,100 280,140 C 300,180 260,220 280,260 C 300,300 260,340 280,380" fill="none" stroke="#3b82f6" strokeWidth={3} />
    {/* Base pairs — rungs */}
    {[55, 100, 145, 190, 235].map((y, i) => {
      const offset = i % 2 === 0 ? 0 : 8;
      const lx = 100 + (i % 2 === 0 ? -5 : 5);
      const rx = 280 + (i % 2 === 0 ? 5 : -5);
      const pairs = [['#ef4444','#10b981'],['#f59e0b','#8b5cf6'],['#10b981','#ef4444'],['#8b5cf6','#f59e0b'],['#ef4444','#10b981']];
      const [c1, c2] = pairs[i];
      const mid = (lx + rx) / 2;
      return (
        <g key={y}>
          <line x1={lx} y1={y} x2={mid - 5} y2={y} stroke={c1} strokeWidth={4} strokeLinecap="round" />
          <line x1={mid + 5} y1={y} x2={rx} y2={y} stroke={c2} strokeWidth={4} strokeLinecap="round" />
          <circle cx={mid} cy={y} r={5} fill="#374151" stroke="#6b7280" strokeWidth={1} />
        </g>
      );
    })}
    <T x={190} y={280} size={9} fill="#6b7280">Sugar-phosphate backbone</T>
    <T x={190} y={294} size={9} fill="#6b7280">connected by base pairs (A-T, C-G)</T>
    {/* Labels */}
    <T x={55}  y={130} size={9} fill="#60a5fa" anchor="end">5′</T>
    <T x={55}  y={160} size={9} fill="#60a5fa" anchor="end">3′</T>
    <T x={335} y={130} size={9} fill="#60a5fa" anchor="start">3′</T>
    <T x={335} y={160} size={9} fill="#60a5fa" anchor="start">5′</T>
    <T x={190} y={15}  size={10} weight="bold" fill="#e5e7eb">DNA Double Helix</T>
    <rect x={18} y={235} width={10} height={10} rx={2} fill="#ef4444" /><T x={32} y={240} size={8} fill="#fca5a5" anchor="start">Adenine (A)</T>
    <rect x={18} y={252} width={10} height={10} rx={2} fill="#10b981" /><T x={32} y={257} size={8} fill="#6ee7b7" anchor="start">Thymine (T)</T>
    <rect x={120} y={235} width={10} height={10} rx={2} fill="#f59e0b" /><T x={134} y={240} size={8} fill="#fcd34d" anchor="start">Cytosine (C)</T>
    <rect x={120} y={252} width={10} height={10} rx={2} fill="#8b5cf6" /><T x={134} y={257} size={8} fill="#c4b5fd" anchor="start">Guanine (G)</T>
  </svg>
);

const MitosisStages = () => (
  <svg viewBox="0 0 600 200" width="100%" style={{ maxHeight: 200 }}>
    {[
      { x: 15,  label: 'PROPHASE',   sub: 'Chromosomes\ncondense', color: '#3b82f6',
        render: (cx: number) => <>
          <ellipse cx={cx} cy={95} rx={48} ry={40} fill="#1e3a5f" stroke="#3b82f6" strokeWidth={1.5} />
          {[[-12,-10],[0,-15],[12,-10],[-8,5],[8,5]].map(([dx,dy],i)=><ellipse key={i} cx={cx+dx} cy={95+dy} rx={5} ry={9} fill="#8b5cf6" opacity={0.8} transform={`rotate(${dx*3} ${cx+dx} ${95+dy})`}/>)}
        </> },
      { x: 130, label: 'METAPHASE',  sub: 'Chromosomes\nalign at centre', color: '#10b981',
        render: (cx: number) => <>
          <ellipse cx={cx} cy={95} rx={48} ry={40} fill="#052e16" stroke="#10b981" strokeWidth={1.5} />
          <line x1={cx} y1={60} x2={cx} y2={130} stroke="#4ade80" strokeWidth={1} strokeDasharray="3 2" />
          {[-15,0,15].map((dy,i)=><ellipse key={i} cx={cx} cy={95+dy} rx={9} ry={5} fill="#8b5cf6" opacity={0.8}/>)}
        </> },
      { x: 245, label: 'ANAPHASE',   sub: 'Chromosomes\npull apart', color: '#f59e0b',
        render: (cx: number) => <>
          <ellipse cx={cx} cy={95} rx={48} ry={40} fill="#1c1917" stroke="#f59e0b" strokeWidth={1.5} />
          {[-1,1].map((dir,i)=>[[-8,-5],[0,-12],[8,-5]].map(([dx,dy],j)=><ellipse key={`${i}${j}`} cx={cx+dx} cy={95+dir*(20+dy)} rx={5} ry={8} fill="#8b5cf6" opacity={0.8}/>))}
        </> },
      { x: 360, label: 'TELOPHASE',  sub: 'Two nuclei\nform', color: '#8b5cf6',
        render: (cx: number) => <>
          <ellipse cx={cx} cy={95} rx={48} ry={40} fill="#1e1b4b" stroke="#8b5cf6" strokeWidth={1.5} />
          {[-1,1].map((dir,i)=><ellipse key={i} cx={cx} cy={95+dir*14} rx={20} ry={13} fill="#312e81" stroke="#6d28d9" strokeWidth={1}/>)}
          <line x1={cx-48} y1={95} x2={cx+48} y2={95} stroke="#8b5cf6" strokeWidth={1} strokeDasharray="3 2" opacity={0.5} />
        </> },
      { x: 475, label: 'CYTOKINESIS',sub: 'Cell divides\ninto two', color: '#ef4444',
        render: (cx: number) => <>
          {[-1,1].map((dir,i)=><ellipse key={i} cx={cx+dir*26} cy={95} rx={20} ry={30} fill="#1f1317" stroke="#ef4444" strokeWidth={1.5}/>)}
        </> },
    ].map(({ x, label, sub, color, render }, i, arr) => {
      const cx = x + 48;
      return (
        <g key={label}>
          {render(cx)}
          <T x={cx} y={145} size={8} weight="bold" fill={color}>{label}</T>
          {sub.split('\n').map((line, j) => <T key={j} x={cx} y={157 + j * 12} size={7.5} fill="#9ca3af">{line}</T>)}
          {i < arr.length - 1 && <line x1={x + 100} y1={95} x2={x + 112} y2={95} stroke="#4b5563" strokeWidth={1.5} markerEnd="url(#arr)" />}
        </g>
      );
    })}
  </svg>
);

const TrophicPyramid = () => (
  <svg viewBox="0 0 500 280" width="100%" style={{ maxHeight: 280 }}>
    {[
      { y: 200, w: 360, label: 'PRODUCERS',          sub: 'Plants & algae — capture solar energy',  color: '#16a34a', emoji: '🌿' },
      { y: 150, w: 260, label: 'PRIMARY CONSUMERS',   sub: 'Herbivores — eat producers',             color: '#ca8a04', emoji: '🐇' },
      { y: 100, w: 180, label: 'SECONDARY CONSUMERS', sub: 'Omnivores / carnivores',                 color: '#ea580c', emoji: '🦊' },
      { y: 55,  w: 100, label: 'TERTIARY CONSUMERS',  sub: 'Apex predators',                         color: '#dc2626', emoji: '🦅' },
    ].map(({ y, w, label, sub, color, emoji }) => {
      const x = (500 - w) / 2;
      return (
        <g key={label}>
          <rect x={x} y={y} width={w} height={45} rx={4} fill={color} opacity={0.2} stroke={color} strokeWidth={1.5} />
          <T x={250} y={y + 16} size={9} weight="bold" fill={color}>{emoji} {label}</T>
          <T x={250} y={y + 32} size={8} fill="#9ca3af">{sub}</T>
        </g>
      );
    })}
    <T x={250} y={260} size={8} fill="#6b7280">Only ~10% of energy transfers to the next level</T>
    <T x={20}  y={120} size={8} fill="#6b7280" anchor="start">Less energy</T>
    <T x={20}  y={220} size={8} fill="#6b7280" anchor="start">More energy</T>
    <line x1={28} y1={125} x2={28} y2={215} stroke="#4b5563" strokeWidth={1} markerEnd="url(#arr)" />
  </svg>
);

const RockCycle = () => (
  <svg viewBox="0 0 520 300" width="100%" style={{ maxHeight: 300 }}>
    {arrowDef}
    {/* Three rock type boxes */}
    {[
      { x: 30,  y: 200, label: 'SEDIMENTARY', sub: 'Layers of compressed\nsediment', color: '#ca8a04' },
      { x: 360, y: 200, label: 'METAMORPHIC', sub: 'Heat & pressure\ntransforms rock', color: '#7c3aed' },
      { x: 195, y: 30,  label: 'IGNEOUS',     sub: 'Cooled magma\nor lava', color: '#dc2626' },
    ].map(({ x, y, label, sub, color }) => (
      <g key={label}>
        <rect x={x} y={y} width={145} height={70} rx={8} fill={color} opacity={0.15} stroke={color} strokeWidth={1.5} />
        <T x={x + 72} y={y + 24} size={9} weight="bold" fill={color}>{label}</T>
        {sub.split('\n').map((line, i) => <T key={i} x={x + 72} y={y + 40 + i * 14} size={8} fill="#9ca3af">{line}</T>)}
      </g>
    ))}
    {/* Arrows with process labels */}
    {/* Sedimentary → Metamorphic */}
    <path d="M 175,235 Q 260,245 360,235" fill="none" stroke="#6b7280" strokeWidth={1.5} markerEnd="url(#arr)" />
    <T x={265} y={258} size={8} fill="#9ca3af">Heat &amp; pressure</T>
    {/* Metamorphic → Igneous (melting) */}
    <path d="M 420,200 Q 440,130 340,90" fill="none" stroke="#ef4444" strokeWidth={1.5} markerEnd="url(#arr)" />
    <T x={445} y={155} size={8} fill="#fca5a5" anchor="start">Melting</T>
    {/* Igneous → Sedimentary (weathering) */}
    <path d="M 195,90 Q 120,130 105,200" fill="none" stroke="#ca8a04" strokeWidth={1.5} markerEnd="url(#arr)" />
    <T x={50} y={155} size={8} fill="#fcd34d" anchor="start">Weathering &amp;\nerosion</T>
    {/* Igneous ↓ uplift label */}
    <T x={260} y={15} size={10} weight="bold" fill="#e5e7eb">The Rock Cycle</T>
    {/* Magma pool at bottom centre */}
    <ellipse cx={260} cy={290} rx={80} ry={14} fill="#7f1d1d" stroke="#ef4444" strokeWidth={1.5} opacity={0.7} />
    <T x={260} y={290} size={8} fill="#fca5a5">Magma</T>
    <line x1={260} y1={275} x2={260} y2={103} stroke="#ef4444" strokeWidth={1} strokeDasharray="3 2" markerEnd="url(#arr)" />
    <T x={275} y={200} size={8} fill="#fca5a5" anchor="start">Volcanic eruption</T>
  </svg>
);

const PhScale = () => (
  <svg viewBox="0 0 600 200" width="100%" style={{ maxHeight: 200 }}>
    <defs>
      <linearGradient id="phGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"   stopColor="#ef4444" />
        <stop offset="50%"  stopColor="#22c55e" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
    </defs>
    <rect x={20} y={70} width={560} height={40} rx={6} fill="url(#phGrad)" opacity={0.75} />
    {Array.from({ length: 15 }, (_, i) => {
      const x = 20 + i * (560 / 14);
      return (
        <g key={i}>
          <line x1={x} y1={110} x2={x} y2={118} stroke="#e5e7eb" strokeWidth={1} />
          <T x={x} y={128} size={9} fill="#e5e7eb">{i}</T>
        </g>
      );
    })}
    {[
      { x: 48,  label: 'Battery\nacid', sub: 'pH 0' },
      { x: 120, label: 'Lemon\njuice', sub: 'pH 2' },
      { x: 185, label: 'Vinegar', sub: 'pH 3' },
      { x: 310, label: 'Pure water', sub: 'pH 7', bold: true },
      { x: 435, label: 'Baking\nsoda', sub: 'pH 9' },
      { x: 500, label: 'Bleach', sub: 'pH 12' },
      { x: 562, label: 'Drain\ncleaner', sub: 'pH 14' },
    ].map(({ x, label, sub, bold }) => (
      <g key={x}>
        <line x1={x} y1={68} x2={x} y2={50} stroke="#9ca3af" strokeWidth={1} />
        {label.split('\n').map((line, i) => <T key={i} x={x} y={40 - (label.split('\n').length - 1 - i) * 12} size={8} fill="#d1d5db" weight={bold ? 'bold' : 'normal'}>{line}</T>)}
      </g>
    ))}
    <T x={90}  y={165} size={9} fill="#fca5a5" weight="bold">ACIDIC</T>
    <T x={310} y={165} size={9} fill="#86efac" weight="bold">NEUTRAL</T>
    <T x={510} y={165} size={9} fill="#93c5fd" weight="bold">ALKALINE</T>
    <T x={300} y={188} size={8} fill="#6b7280">pH Scale (0 = most acidic, 14 = most alkaline)</T>
  </svg>
);

const ForceDiagram = () => (
  <svg viewBox="0 0 560 240" width="100%" style={{ maxHeight: 240 }}>
    {arrowDef}
    <defs>
      <marker id="arrl" markerWidth="8" markerHeight="8" refX="2" refY="3" orient="auto">
        <path d="M8,0 L8,6 L0,3 z" fill="#ef4444" />
      </marker>
      <marker id="arrr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L0,6 L8,3 z" fill="#3b82f6" />
      </marker>
    </defs>
    {/* Box 1 — balanced */}
    <rect x={30} y={80} width={70} height={50} rx={6} fill="#1f2937" stroke="#6b7280" strokeWidth={1.5} />
    <T x={65} y={105} size={9} fill="#e5e7eb">Object</T>
    <line x1={20} y1={105} x2={30} y2={105} stroke="#ef4444" strokeWidth={2.5} markerEnd="url(#arrl)" />
    <T x={8} y={96} size={8} fill="#fca5a5">20N</T>
    <line x1={100} y1={105} x2={110} y2={105} stroke="#3b82f6" strokeWidth={2.5} markerEnd="url(#arrr)" />
    <T x={118} y={96} size={8} fill="#93c5fd">20N</T>
    <T x={65} y={150} size={9} weight="bold" fill="#10b981">BALANCED FORCES</T>
    <T x={65} y={164} size={8} fill="#9ca3af">Object stays still or</T>
    <T x={65} y={176} size={8} fill="#9ca3af">moves at constant speed</T>

    {/* Box 2 — unbalanced */}
    <rect x={310} y={80} width={70} height={50} rx={6} fill="#1f2937" stroke="#6b7280" strokeWidth={1.5} />
    <T x={345} y={105} size={9} fill="#e5e7eb">Object</T>
    <line x1={290} y1={105} x2={310} y2={105} stroke="#ef4444" strokeWidth={2.5} markerEnd="url(#arrl)" />
    <T x={278} y={96} size={8} fill="#fca5a5">10N</T>
    <line x1={380} y1={105} x2={400} y2={105} stroke="#3b82f6" strokeWidth={3.5} markerEnd="url(#arrr)" />
    <T x={408} y={96} size={8} fill="#93c5fd">30N</T>
    <T x={345} y={150} size={9} weight="bold" fill="#f59e0b">UNBALANCED FORCES</T>
    <T x={345} y={164} size={8} fill="#9ca3af">Net force = 20N right</T>
    <T x={345} y={176} size={8} fill="#9ca3af">Object accelerates →</T>

    <line x1={200} y1={20} x2={200} y2={220} stroke="#374151" strokeWidth={1} strokeDasharray="4 3" />
    <T x={140} y={30} size={10} weight="bold" fill="#e5e7eb">Balanced</T>
    <T x={370} y={30} size={10} weight="bold" fill="#e5e7eb">Unbalanced</T>
    <T x={280} y={220} size={8} fill="#6b7280">Newton's First Law: an object at rest stays at rest unless acted on by an unbalanced force</T>
  </svg>
);

const SpeedVelocity = () => (
  <svg viewBox="0 0 580 260" width="100%" style={{ maxHeight: 260 }}>
    {arrowDef}
    {/* Left graph: Distance-Time */}
    <g>
      <T x={130} y={14} size={10} weight="bold" fill="#e5e7eb">Distance–Time Graph</T>
      {/* Axes */}
      <line x1={40} y1={160} x2={220} y2={160} stroke="#6b7280" strokeWidth={1.5} markerEnd="url(#arr)" />
      <line x1={40} y1={160} x2={40}  y2={20}  stroke="#6b7280" strokeWidth={1.5} markerEnd="url(#arr)" />
      <T x={235} y={160} size={8} fill="#9ca3af" anchor="start">Time</T>
      <T x={35}  y={16}  size={8} fill="#9ca3af" anchor="end">Distance</T>
      {/* Constant speed (steep line) */}
      <line x1={40} y1={155} x2={170} y2={40} stroke="#3b82f6" strokeWidth={2} />
      <T x={175} y={38} size={8} fill="#60a5fa" anchor="start">Faster (steep)</T>
      {/* Slower */}
      <line x1={40} y1={155} x2={170} y2={100} stroke="#10b981" strokeWidth={2} />
      <T x={175} y={98} size={8} fill="#34d399" anchor="start">Slower</T>
      {/* Stationary */}
      <line x1={40} y1={155} x2={170} y2={155} stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 3" />
      <T x={175} y={155} size={8} fill="#fcd34d" anchor="start">Stationary</T>
      <T x={130} y={190} size={8} fill="#6b7280">Gradient = speed</T>
    </g>
    {/* Right graph: Velocity-Time */}
    <g>
      <T x={430} y={14} size={10} weight="bold" fill="#e5e7eb">Velocity–Time Graph</T>
      <line x1={330} y1={160} x2={560} y2={160} stroke="#6b7280" strokeWidth={1.5} markerEnd="url(#arr)" />
      <line x1={330} y1={160} x2={330} y2={20}  stroke="#6b7280" strokeWidth={1.5} markerEnd="url(#arr)" />
      <T x={565} y={160} size={8} fill="#9ca3af" anchor="start">Time</T>
      <T x={325} y={16}  size={8} fill="#9ca3af" anchor="end">Velocity</T>
      {/* Accelerating */}
      <line x1={330} y1={155} x2={460} y2={40} stroke="#3b82f6" strokeWidth={2} />
      <T x={465} y={38} size={8} fill="#60a5fa" anchor="start">Accelerating</T>
      {/* Constant velocity */}
      <line x1={330} y1={90} x2={460} y2={90} stroke="#10b981" strokeWidth={2} />
      <T x={465} y={90} size={8} fill="#34d399" anchor="start">Constant v</T>
      {/* Decelerating */}
      <line x1={330} y1={50} x2={460} y2={155} stroke="#ef4444" strokeWidth={2} />
      <T x={465} y={155} size={8} fill="#fca5a5" anchor="start">Decelerating</T>
      <T x={430} y={190} size={8} fill="#6b7280">Gradient = acceleration; Area = distance</T>
    </g>
  </svg>
);

// ── Additional English Diagrams ───────────────────────────────────────────────

const LiteraryDevices = () => (
  <svg viewBox="0 0 580 270" width="100%" style={{ maxHeight: 270 }}>
    {[
      { x: 10,  y: 10,  label: 'Simile',         ex: '"brave as a lion"',      color: '#3b82f6',  note: 'Compares using\nas/like' },
      { x: 200, y: 10,  label: 'Metaphor',        ex: '"Life is a journey"',    color: '#10b981',  note: 'Direct comparison\n(no as/like)' },
      { x: 390, y: 10,  label: 'Personification', ex: '"The wind whispered"',   color: '#8b5cf6',  note: 'Gives human\ntraits to non-humans' },
      { x: 10,  y: 100, label: 'Alliteration',    ex: '"Peter Piper picked"',   color: '#f59e0b',  note: 'Repeated\nconsonsant sounds' },
      { x: 200, y: 100, label: 'Imagery',         ex: '"crimson sky at dusk"',  color: '#ef4444',  note: 'Vivid sensory\nlanguage' },
      { x: 390, y: 100, label: 'Symbolism',       ex: 'Dove = peace',           color: '#06b6d4',  note: 'Object represents\na deeper idea' },
      { x: 10,  y: 190, label: 'Irony',           ex: '"What lovely weather!"', color: '#a78bfa',  note: 'Meaning opposite\nto literal words' },
      { x: 200, y: 190, label: 'Hyperbole',       ex: '"I\'ve told you a million times"', color: '#f97316', note: 'Extreme\nexaggeration' },
      { x: 390, y: 190, label: 'Foreshadowing',   ex: 'Ominous dark clouds',    color: '#6b7280',  note: 'Hints at future\nevents' },
    ].map(({ x, y, label, ex, color, note }) => (
      <g key={label}>
        <rect x={x} y={y} width={175} height={82} rx={7} fill={color} opacity={0.1} stroke={color} strokeWidth={1.2} />
        <T x={x + 88} y={y + 18} size={9} weight="bold" fill={color}>{label}</T>
        <T x={x + 88} y={y + 35} size={8} fill="#d1d5db">{ex}</T>
        {note.split('\n').map((line, i) => <T key={i} x={x + 88} y={y + 52 + i * 13} size={8} fill="#9ca3af">{line}</T>)}
      </g>
    ))}
  </svg>
);

const NarrativePerspective = () => (
  <svg viewBox="0 0 580 200" width="100%" style={{ maxHeight: 200 }}>
    {[
      { x: 10,  label: 'First Person',     ex: '"I walked into\nthe dark room."',        note: 'Narrator is a character\nInside view · intimate',    color: '#3b82f6' },
      { x: 155, label: 'Second Person',    ex: '"You open the door\nand step inside."',   note: 'Reader becomes\nthe character · rare',       color: '#10b981' },
      { x: 300, label: 'Third Limited',    ex: '"She felt her heart\nbegin to race."',    note: 'One character\'s\nthoughts & feelings',        color: '#f59e0b' },
      { x: 445, label: 'Third Omniscient', ex: '"All characters\'s\nthoughts were bare."', note: 'All-knowing narrator\nGod\'s-eye view',          color: '#8b5cf6' },
    ].map(({ x, label, ex, note, color }, i, arr) => (
      <g key={label}>
        <rect x={x} y={15} width={130} height={165} rx={8} fill={color} opacity={0.1} stroke={color} strokeWidth={1.5} />
        <T x={x + 65} y={34} size={8.5} weight="bold" fill={color}>{label}</T>
        {ex.split('\n').map((line, j) => (
          <text key={j} x={x + 65} y={56 + j * 14} fontSize={8} textAnchor="middle" dominantBaseline="middle" fill="#d1d5db" fontFamily="system-ui,sans-serif" fontStyle="italic">{line}</text>
        ))}
        {note.split('\n').map((line, j) => <T key={j} x={x + 65} y={102 + j * 14} size={8} fill="#9ca3af">{line}</T>)}
        {i < arr.length - 1 && <line x1={x + 134} y1={97} x2={x + 150} y2={97} stroke="#374151" strokeWidth={1} />}
      </g>
    ))}
  </svg>
);

const TextTypes = () => (
  <svg viewBox="0 0 580 260" width="100%" style={{ maxHeight: 260 }}>
    {[
      { x: 10,  y: 10,  icon: '📢', label: 'Persuasive',   purpose: 'Convince or argue\na point of view',  features: 'Emotive language\nRhetorical questions\nEvidence & statistics', color: '#ef4444' },
      { x: 200, y: 10,  icon: '📰', label: 'Informative',  purpose: 'Explain or inform\nthe reader',       features: 'Factual language\nHeadings & diagrams\nTechnical vocabulary',  color: '#3b82f6' },
      { x: 390, y: 10,  icon: '📖', label: 'Narrative',    purpose: 'Tell a story or\nentertain',          features: 'Characters & plot\nSetting & conflict\nLiterary devices',       color: '#10b981' },
      { x: 10,  y: 145, icon: '🔍', label: 'Analytical',   purpose: 'Examine a text\nor idea critically',  features: 'TEEL structure\nTextual evidence\nMetalanguage',             color: '#8b5cf6' },
      { x: 200, y: 145, icon: '💬', label: 'Descriptive',  purpose: 'Create a vivid\npicture for reader',  features: 'Sensory language\nImagery & detail\nShow don\'t tell',        color: '#f59e0b' },
      { x: 390, y: 145, icon: '📝', label: 'Procedural',   purpose: 'Give instructions\nor directions',     features: 'Numbered steps\nImperative verbs\nClear sequence',           color: '#06b6d4' },
    ].map(({ x, y, icon, label, purpose, features, color }) => (
      <g key={label}>
        <rect x={x} y={y} width={175} height={105} rx={8} fill={color} opacity={0.1} stroke={color} strokeWidth={1.2} />
        <T x={x + 88} y={y + 18} size={10} fill={color}>{icon} {label}</T>
        {purpose.split('\n').map((line, i) => <T key={i} x={x + 88} y={y + 36 + i * 14} size={8} fill="#d1d5db">{line}</T>)}
        {features.split('\n').map((line, i) => <T key={i} x={x + 88} y={y + 70 + i * 13} size={7.5} fill="#9ca3af">{line}</T>)}
      </g>
    ))}
  </svg>
);

// ── Maths Diagrams ────────────────────────────────────────────────────────────

const Pythagoras = () => (
  <svg viewBox="0 0 500 300" width="100%" style={{ maxHeight: 300 }}>
    {/* Right triangle */}
    <polygon points="80,240 80,60 320,240" fill="#1e3a5f" stroke="#3b82f6" strokeWidth={2} />
    {/* Right angle marker */}
    <path d="M 80,220 L 100,220 L 100,240" fill="none" stroke="#9ca3af" strokeWidth={1.5} />
    {/* Side labels */}
    <T x={52}  y={150} size={14} weight="bold" fill="#10b981" anchor="end">a</T>
    <T x={200} y={258} size={14} weight="bold" fill="#f59e0b">b</T>
    <T x={212} y={140} size={14} weight="bold" fill="#ef4444">c</T>
    {/* Squares on each side */}
    <rect x={10}  y={60}  width={70} height={180} fill="#10b981" opacity={0.15} stroke="#10b981" strokeWidth={1} />
    <T x={45}  y={150} size={10} fill="#34d399">a²</T>
    <rect x={80}  y={240} width={240} height={50} fill="#f59e0b" opacity={0.15} stroke="#f59e0b" strokeWidth={1} />
    <T x={200} y={265} size={10} fill="#fcd34d">b²</T>
    {/* c² square — rotated, use parallelogram approx */}
    <polygon points="320,240 200,240 80,60 200,60" fill="#ef4444" opacity={0.1} stroke="#ef4444" strokeWidth={1} />
    <T x={195} y={155} size={10} fill="#fca5a5">c²</T>
    {/* Formula */}
    <rect x={340} y={90} width={150} height={80} rx={8} fill="#1f2937" stroke="#4b5563" strokeWidth={1.5} />
    <T x={415} y={115} size={12} weight="bold" fill="#e5e7eb">a² + b² = c²</T>
    <T x={415} y={140} size={9} fill="#9ca3af">Hypotenuse (c)</T>
    <T x={415} y={154} size={9} fill="#9ca3af">is the longest side</T>
    <T x={415} y={185} size={9} fill="#9ca3af">opposite the right angle</T>
    <T x={250} y={290} size={9} fill="#6b7280">Pythagoras' Theorem</T>
  </svg>
);

const NumberLine = () => (
  <svg viewBox="0 0 580 200" width="100%" style={{ maxHeight: 200 }}>
    {arrowDef}
    <defs>
      <marker id="arll" markerWidth="8" markerHeight="8" refX="2" refY="3" orient="auto">
        <path d="M8,0 L8,6 L0,3 z" fill="#6b7280" />
      </marker>
    </defs>
    {/* Main axis */}
    <line x1={30} y1={100} x2={555} y2={100} stroke="#6b7280" strokeWidth={2} markerEnd="url(#arr)" />
    <line x1={30} y1={100} x2={5}   y2={100} stroke="#6b7280" strokeWidth={2} markerEnd="url(#arll)" />
    {/* Ticks and labels -5 to 5 */}
    {Array.from({ length: 11 }, (_, i) => {
      const n = i - 5;
      const x = 292 + n * 50;
      return (
        <g key={n}>
          <line x1={x} y1={92} x2={x} y2={108} stroke="#9ca3af" strokeWidth={1.5} />
          <T x={x} y={120} size={11} fill={n < 0 ? '#ef4444' : n > 0 ? '#3b82f6' : '#10b981'} weight={n === 0 ? 'bold' : 'normal'}>{n}</T>
        </g>
      );
    })}
    <T x={292} y={75} size={9} fill="#10b981">Zero</T>
    <line x1={292} y1={80} x2={292} y2={92} stroke="#10b981" strokeWidth={1} />
    {/* Fraction example */}
    <circle cx={317} cy={100} r={6} fill="#f59e0b" opacity={0.9} />
    <T x={317} y={60} size={9} fill="#fcd34d">½</T>
    <line x1={317} y1={65} x2={317} y2={94} stroke="#fcd34d" strokeWidth={1} strokeDasharray="3 2" />
    {/* Negative example */}
    <circle cx={167} cy={100} r={6} fill="#a78bfa" opacity={0.9} />
    <T x={167} y={60} size={9} fill="#c4b5fd">-2½</T>
    <line x1={167} y1={65} x2={167} y2={94} stroke="#c4b5fd" strokeWidth={1} strokeDasharray="3 2" />
    <T x={130} y={148} size={9} fill="#fca5a5">← Negative numbers</T>
    <T x={380} y={148} size={9} fill="#93c5fd">Positive numbers →</T>
    <T x={292} y={175} size={8} fill="#6b7280">Numbers increase in value from left to right</T>
  </svg>
);

const UnitCircle = () => (
  <svg viewBox="0 0 420 360" width="100%" style={{ maxHeight: 360 }}>
    {arrowDef}
    {/* Axes */}
    <line x1={30}  y1={180} x2={390} y2={180} stroke="#4b5563" strokeWidth={1.5} markerEnd="url(#arr)" />
    <line x1={210} y1={350} x2={210} y2={10}  stroke="#4b5563" strokeWidth={1.5} markerEnd="url(#arr)" />
    <T x={395} y={180} size={9} fill="#9ca3af" anchor="start">x</T>
    <T x={210} y={8}   size={9} fill="#9ca3af">y</T>
    {/* Circle */}
    <circle cx={210} cy={180} r={130} fill="none" stroke="#3b82f6" strokeWidth={2} opacity={0.8} />
    {/* Radius to 30° */}
    <line x1={210} y1={180} x2={323} y2={115} stroke="#ef4444" strokeWidth={2} />
    {/* Point on circle */}
    <circle cx={323} cy={115} r={5} fill="#fbbf24" />
    {/* cos line (horizontal) */}
    <line x1={210} y1={115} x2={323} y2={115} stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 3" />
    {/* sin line (vertical) */}
    <line x1={323} y1={180} x2={323} y2={115} stroke="#8b5cf6" strokeWidth={1.5} strokeDasharray="4 3" />
    {/* Angle arc */}
    <path d="M 240,180 A 30,30 0 0 0 236,158" fill="none" stroke="#f59e0b" strokeWidth={1.5} />
    <T x={248} y={168} size={9} fill="#fcd34d">θ</T>
    {/* Labels */}
    <T x={268} y={108} size={9} fill="#fbbf24">(cos θ, sin θ)</T>
    <T x={265} y={152} size={9} fill="#10b981" anchor="middle">cos θ</T>
    <T x={348} y={148} size={9} fill="#c4b5fd" anchor="start">sin θ</T>
    <T x={255} y={197} size={9} fill="#fca5a5">r = 1</T>
    {/* Quadrant labels */}
    <T x={330} y={148} size={8} fill="#6b7280" anchor="start"> </T>
    <T x={155} y={140} size={8} fill="#4b5563">Q2</T>
    <T x={265} y={140} size={8} fill="#4b5563">Q1</T>
    <T x={155} y={225} size={8} fill="#4b5563">Q3</T>
    <T x={265} y={225} size={8} fill="#4b5563">Q4</T>
    {/* Key points */}
    {[
      { cx: 340, cy: 180, label: '(1, 0)', a: '0°' },
      { cx: 210, cy: 50,  label: '(0, 1)', a: '90°' },
      { cx: 80,  cy: 180, label: '(-1, 0)', a: '180°' },
      { cx: 210, cy: 310, label: '(0, -1)', a: '270°' },
    ].map(({ cx, cy, label, a }) => (
      <g key={a}>
        <circle cx={cx} cy={cy} r={4} fill="#6b7280" />
        <T x={cx + (cx > 210 ? 8 : cx < 210 ? -8 : 0)} y={cy + (cy > 180 ? 14 : cy < 180 ? -10 : 0)} size={8} fill="#9ca3af" anchor={cx > 240 ? 'start' : cx < 180 ? 'end' : 'middle'}>{a} {label}</T>
      </g>
    ))}
    <T x={210} y={348} size={9} fill="#6b7280">Unit Circle — radius = 1</T>
  </svg>
);

const AngleTypes = () => (
  <svg viewBox="0 0 580 200" width="100%" style={{ maxHeight: 200 }}>
    {[
      { x: 15,  label: 'Acute',       deg: '< 90°',  color: '#3b82f6',
        pts: [[50,160],[80,80],[110,160]] },
      { x: 110, label: 'Right',       deg: '= 90°',  color: '#10b981',
        pts: [[145,160],[145,90],[215,160]] },
      { x: 220, label: 'Obtuse',      deg: '90°–180°', color: '#f59e0b',
        pts: [[255,160],[265,90],[340,160]] },
      { x: 345, label: 'Straight',    deg: '= 180°', color: '#ef4444',
        pts: [[360,130],[430,130],[500,130]] },
      { x: 455, label: 'Reflex',      deg: '> 180°', color: '#8b5cf6',
        pts: [[490,160],[510,80],[540,160]] },
    ].map(({ x, label, deg, color, pts }, i) => {
      const [p1, p2, p3] = pts;
      const isRight = label === 'Right';
      return (
        <g key={label}>
          <rect x={x} y={10} width={100} height={180} rx={6} fill={color} opacity={0.07} stroke={color} strokeWidth={1} />
          <line x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]} stroke={color} strokeWidth={2} />
          <line x1={p2[0]} y1={p2[1]} x2={p3[0]} y2={p3[1]} stroke={color} strokeWidth={2} />
          {isRight && <path d={`M ${p2[0]},${p2[1]+15} L ${p2[0]+15},${p2[1]+15} L ${p2[0]+15},${p2[1]}`} fill="none" stroke={color} strokeWidth={1.5} />}
          <T x={x + 50} y={170} size={9}  weight="bold" fill={color}>{label}</T>
          <T x={x + 50} y={184} size={8.5} fill="#9ca3af">{deg}</T>
        </g>
      );
    })}
  </svg>
);

const TriangleTypes = () => (
  <svg viewBox="0 0 580 200" width="100%" style={{ maxHeight: 200 }}>
    {[
      { x: 10,  label: 'Equilateral', sub: 'All sides equal\nAll angles 60°', color: '#3b82f6',
        pts: '75,155 115,80 155,155' },
      { x: 155, label: 'Isosceles',   sub: 'Two sides equal\nTwo angles equal', color: '#10b981',
        pts: '220,155 270,75 320,155' },
      { x: 320, label: 'Scalene',     sub: 'No sides equal\nNo angles equal', color: '#f59e0b',
        pts: '345,155 400,80 455,155' },
      { x: 455, label: 'Right-angled', sub: 'One angle = 90°\nHyp. is longest', color: '#ef4444',
        pts: '470,155 470,80 555,155' },
    ].map(({ x, label, sub, color, pts }) => {
      const coords = pts.split(' ').map(p => p.split(',').map(Number));
      const isRight = label === 'Right-angled';
      return (
        <g key={label}>
          <rect x={x} y={8} width={140} height={182} rx={6} fill={color} opacity={0.08} stroke={color} strokeWidth={1} />
          <polygon points={pts} fill={color} opacity={0.2} stroke={color} strokeWidth={2} />
          {isRight && <path d={`M ${coords[0][0]},${coords[0][1]-18} L ${coords[0][0]+18},${coords[0][1]-18} L ${coords[0][0]+18},${coords[0][1]}`} fill="none" stroke={color} strokeWidth={1.5} />}
          <T x={x + 70} y={170} size={9}  weight="bold" fill={color}>{label}</T>
          {sub.split('\n').map((line, i) => <T key={i} x={x + 70} y={182 + i * 13} size={8} fill="#9ca3af">{line}</T>)}
        </g>
      );
    })}
  </svg>
);

const CircleParts = () => (
  <svg viewBox="0 0 500 310" width="100%" style={{ maxHeight: 310 }}>
    <circle cx={220} cy={155} r={120} fill="none" stroke="#3b82f6" strokeWidth={2} />
    <circle cx={220} cy={155} r={3}   fill="#e5e7eb" />
    {/* Radius */}
    <line x1={220} y1={155} x2={310} y2={90} stroke="#10b981" strokeWidth={2} />
    <T x={280} y={108} size={9} fill="#34d399" anchor="start">Radius (r)</T>
    {/* Diameter */}
    <line x1={100} y1={155} x2={340} y2={155} stroke="#ef4444" strokeWidth={2} />
    <T x={220} y={172} size={9} fill="#fca5a5">Diameter (2r)</T>
    {/* Chord */}
    <line x1={120} y1={100} x2={310} y2={210} stroke="#f59e0b" strokeWidth={2} />
    <T x={100} y={90} size={9} fill="#fcd34d" anchor="end">Chord</T>
    {/* Arc */}
    <path d="M 130,250 A 120,120 0 0 1 100,155" fill="none" stroke="#8b5cf6" strokeWidth={3} />
    <T x={55} y={220} size={9} fill="#c4b5fd" anchor="end">Arc</T>
    {/* Sector */}
    <path d="M 220,155 L 220,35 A 120,120 0 0 1 330,205 Z" fill="#3b82f6" opacity={0.12} stroke="#3b82f6" strokeWidth={1.5} />
    <T x={295} y={80} size={9} fill="#60a5fa" anchor="start">Sector</T>
    {/* Tangent */}
    <line x1={340} y1={60} x2={340} y2={260} stroke="#06b6d4" strokeWidth={2} strokeDasharray="5 3" />
    <T x={360} y={155} size={9} fill="#22d3ee" anchor="start">Tangent</T>
    {/* Circumference label */}
    <T x={220} y={295} size={9} fill="#9ca3af">Circumference C = 2πr</T>
    <T x={220} y={15}  size={10} weight="bold" fill="#e5e7eb">Parts of a Circle</T>
  </svg>
);

const CartesianPlane = () => (
  <svg viewBox="0 0 400 360" width="100%" style={{ maxHeight: 360 }}>
    {arrowDef}
    <defs>
      <marker id="arll2" markerWidth="8" markerHeight="8" refX="2" refY="3" orient="auto">
        <path d="M8,0 L8,6 L0,3 z" fill="#6b7280" />
      </marker>
      <marker id="arld2" markerWidth="8" markerHeight="8" refX="3" refY="6" orient="auto">
        <path d="M0,0 L6,0 L3,8 z" fill="#6b7280" />
      </marker>
    </defs>
    {/* Axes */}
    <line x1={20}  y1={180} x2={385} y2={180} stroke="#6b7280" strokeWidth={2} markerEnd="url(#arr)" />
    <line x1={20}  y1={180} x2={5}   y2={180} stroke="#6b7280" strokeWidth={2} markerEnd="url(#arll2)" />
    <line x1={200} y1={355} x2={200} y2={5}   stroke="#6b7280" strokeWidth={2} markerEnd="url(#arr)" />
    <T x={390} y={180} size={9} fill="#9ca3af" anchor="start">x</T>
    <T x={200} y={3}   size={9} fill="#9ca3af">y</T>
    {/* Ticks */}
    {[-3,-2,-1,1,2,3].map(n => {
      const px = 200 + n * 50; const py = 180 + n * 50;
      return <g key={n}>
        <line x1={px} y1={175} x2={px} y2={185} stroke="#4b5563" strokeWidth={1} />
        <T x={px} y={195} size={8} fill="#6b7280">{n}</T>
        <line x1={195} y1={py} x2={205} y2={py} stroke="#4b5563" strokeWidth={1} />
        <T x={185} y={py} size={8} fill="#6b7280" anchor="end">{-n}</T>
      </g>;
    })}
    {/* Quadrant labels */}
    <T x={300} y={90}  size={9} fill="#4b5563">Q1 (+,+)</T>
    <T x={95}  y={90}  size={9} fill="#4b5563">Q2 (−,+)</T>
    <T x={95}  y={270} size={9} fill="#4b5563">Q3 (−,−)</T>
    <T x={300} y={270} size={9} fill="#4b5563">Q4 (+,−)</T>
    {/* Example points */}
    {[
      { x: 300, y: 80,  label: '(2, 2)',   color: '#10b981' },
      { x: 100, y: 130, label: '(−2, 1)', color: '#f59e0b' },
      { x: 150, y: 280, label: '(−1,−2)', color: '#ef4444' },
      { x: 300, y: 280, label: '(2,−2)',  color: '#8b5cf6' },
    ].map(({ x, y, label, color }) => (
      <g key={label}>
        <circle cx={x} cy={y} r={5} fill={color} />
        <T x={x + 10} y={y - 8} size={8} fill={color} anchor="start">{label}</T>
      </g>
    ))}
    <T x={200} y={350} size={9} fill="#6b7280">Cartesian Plane</T>
  </svg>
);

const GradientIntercept = () => (
  <svg viewBox="0 0 500 300" width="100%" style={{ maxHeight: 300 }}>
    {arrowDef}
    {/* Axes */}
    <line x1={50}  y1={250} x2={470} y2={250} stroke="#4b5563" strokeWidth={1.5} markerEnd="url(#arr)" />
    <line x1={50}  y1={250} x2={50}  y2={20}  stroke="#4b5563" strokeWidth={1.5} markerEnd="url(#arr)" />
    <T x={478} y={250} size={9} fill="#9ca3af" anchor="start">x</T>
    <T x={50}  y={14}  size={9} fill="#9ca3af">y</T>
    {/* Grid lines */}
    {[1,2,3,4,5,6].map(n => {
      const px = 50 + n * 65; const py = 250 - n * 38;
      return <g key={n}>
        <line x1={px} y1={246} x2={px} y2={254} stroke="#374151" strokeWidth={1} />
        <T x={px} y={265} size={8} fill="#6b7280">{n}</T>
        <line x1={46} y1={py} x2={54} y2={py} stroke="#374151" strokeWidth={1} />
        <T x={38} y={py} size={8} fill="#6b7280" anchor="end">{n}</T>
      </g>;
    })}
    {/* Line y = 0.58x + 1.5  mapped: y-int at (50,193), slope ~38/65 */}
    <line x1={50} y1={193} x2={440} y2={48} stroke="#3b82f6" strokeWidth={2.5} />
    {/* y-intercept */}
    <circle cx={50} cy={193} r={6} fill="#10b981" />
    <T x={70} y={188} size={9} fill="#34d399" anchor="start">y-intercept (b)</T>
    <T x={70} y={201} size={8} fill="#9ca3af" anchor="start">where line crosses y-axis</T>
    {/* Rise / Run triangle */}
    <line x1={180} y1={148} x2={310} y2={148} stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 3" />
    <line x1={310} y1={148} x2={310} y2={99}  stroke="#ef4444" strokeWidth={2} strokeDasharray="5 3" />
    <T x={245} y={162} size={9} fill="#fcd34d">Run</T>
    <T x={325} y={125} size={9} fill="#fca5a5" anchor="start">Rise</T>
    <T x={390} y={78}  size={10} weight="bold" fill="#e5e7eb">y = mx + b</T>
    <T x={390} y={95}  size={8}  fill="#9ca3af">m = gradient = Rise/Run</T>
    <T x={390} y={109} size={8}  fill="#9ca3af">b = y-intercept</T>
  </svg>
);

const SohCahToa = () => (
  <svg viewBox="0 0 540 280" width="100%" style={{ maxHeight: 280 }}>
    {/* Triangle */}
    <polygon points="60,240 60,60 340,240" fill="#1e3a5f" stroke="#3b82f6" strokeWidth={2} />
    {/* Right angle */}
    <path d="M 60,220 L 80,220 L 80,240" fill="none" stroke="#9ca3af" strokeWidth={1.5} />
    {/* Angle theta arc */}
    <path d="M 340,240 A 40,40 0 0 0 306,218" fill="none" stroke="#f59e0b" strokeWidth={2} />
    <T x={305} y={235} size={11} fill="#fcd34d" anchor="end">θ</T>
    {/* Side labels */}
    <T x={34}  y={150} size={11} weight="bold" fill="#ef4444" anchor="end">Opposite</T>
    <T x={200} y={260} size={11} weight="bold" fill="#10b981">Adjacent</T>
    <T x={205} y={135} size={11} weight="bold" fill="#8b5cf6">Hypotenuse</T>
    {/* SOH CAH TOA boxes */}
    {[
      { x: 370, y: 30,  label: 'SOH', formula: 'sin θ = Opp / Hyp', color: '#ef4444' },
      { x: 370, y: 105, label: 'CAH', formula: 'cos θ = Adj / Hyp', color: '#10b981' },
      { x: 370, y: 180, label: 'TOA', formula: 'tan θ = Opp / Adj', color: '#8b5cf6' },
    ].map(({ x, y, label, formula, color }) => (
      <g key={label}>
        <rect x={x} y={y} width={155} height={58} rx={7} fill={color} opacity={0.12} stroke={color} strokeWidth={1.5} />
        <T x={x + 35} y={y + 22} size={14} weight="bold" fill={color}>{label}</T>
        <T x={x + 100} y={y + 22} size={8.5} fill="#d1d5db">{formula}</T>
        <line x1={x + 65} y1={y + 10} x2={x + 65} y2={y + 48} stroke={color} strokeWidth={1} opacity={0.4} />
      </g>
    ))}
    <T x={447} y={258} size={9} fill="#6b7280">SOH CAH TOA</T>
  </svg>
);

const ParabolaFeatures = () => (
  <svg viewBox="0 0 500 310" width="100%" style={{ maxHeight: 310 }}>
    {arrowDef}
    {/* Axes */}
    <line x1={30}  y1={260} x2={475} y2={260} stroke="#4b5563" strokeWidth={1.5} markerEnd="url(#arr)" />
    <line x1={250} y1={295} x2={250} y2={15}  stroke="#4b5563" strokeWidth={1.5} markerEnd="url(#arr)" />
    <T x={480} y={260} size={9} fill="#9ca3af" anchor="start">x</T>
    <T x={250} y={12}  size={9} fill="#9ca3af">y</T>
    {/* Parabola y = (x-2)^2 - 4, vertex (2,-4), roots at x=0 and x=4, y-int=0 */}
    {/* Mapped: origin at (170,220), scale 40px per unit */}
    {/* vertex screen: (170+2*40, 220+4*40) = (250, 380) -- too low, adjust */}
    {/* Let's place vertex at screen (250,230), roots at (170,170) and (330,170), y-int (210,170) */}
    {/* y=a(x-h)^2+k, vertex (250,230), scale: pick points */}
    <path d="M 110,100 Q 250,260 390,100" fill="none" stroke="#3b82f6" strokeWidth={2.5} />
    {/* Vertex */}
    <circle cx={250} cy={260} r={6} fill="#f59e0b" />
    <T x={268} y={258} size={9} fill="#fcd34d" anchor="start">Vertex (h, k)</T>
    <T x={268} y={272} size={8} fill="#9ca3af" anchor="start">turning point</T>
    {/* Axis of symmetry */}
    <line x1={250} y1={30} x2={250} y2={260} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="6 3" />
    <T x={255} y={45} size={8} fill="#fcd34d" anchor="start">Axis of symmetry</T>
    <T x={255} y={57} size={8} fill="#9ca3af" anchor="start">x = h</T>
    {/* x-intercepts */}
    <circle cx={130} cy={170} r={6} fill="#10b981" />
    <circle cx={370} cy={170} r={6} fill="#10b981" />
    <T x={110} y={155} size={9} fill="#34d399" anchor="end">x-intercept</T>
    <T x={390} y={155} size={9} fill="#34d399" anchor="start">x-intercept</T>
    <T x={90}  y={167} size={8} fill="#9ca3af" anchor="end">(roots/zeros)</T>
    {/* y-intercept */}
    <circle cx={210} cy={170} r={6} fill="#8b5cf6" />
    <T x={190} y={155} size={9} fill="#c4b5fd" anchor="end">y-intercept</T>
    {/* Concave up label */}
    <T x={250} y={295} size={9} fill="#6b7280">Concave up (a &gt; 0)</T>
  </svg>
);

const AreaFormulas = () => (
  <svg viewBox="0 0 580 260" width="100%" style={{ maxHeight: 260 }}>
    {[
      { x: 10, y: 10, color: '#3b82f6', label: 'Rectangle',
        formula: 'A = l × w',
        shape: <rect x={30} y={35} width={100} height={55} fill="#3b82f6" opacity={0.2} stroke="#3b82f6" strokeWidth={1.5} />,
        dim: [<line key="l" x1={30} y1={98} x2={130} y2={98} stroke="#3b82f6" strokeWidth={1} />, <T key="lt" x={80} y={108} size={8} fill="#60a5fa">l</T>, <line key="w" x1={132} y1={35} x2={132} y2={90} stroke="#3b82f6" strokeWidth={1} />, <T key="wt" x={142} y={62} size={8} fill="#60a5fa">w</T>] },
      { x: 155, y: 10, color: '#10b981', label: 'Triangle',
        formula: 'A = ½ × b × h',
        shape: <polygon points="235,90 195,90 255,35" fill="#10b981" opacity={0.2} stroke="#10b981" strokeWidth={1.5} />,
        dim: [<line key="b" x1={195} y1={97} x2={235} y2={97} stroke="#10b981" strokeWidth={1} />, <T key="bt" x={215} y={107} size={8} fill="#34d399">b</T>, <line key="h" x1={255} y1={35} x2={255} y2={90} stroke="#10b981" strokeWidth={1} strokeDasharray="3 2" />, <T key="ht" x={265} y={62} size={8} fill="#34d399">h</T>] },
      { x: 300, y: 10, color: '#8b5cf6', label: 'Circle',
        formula: 'A = π r²',
        shape: <ellipse cx={375} cy={62} rx={45} ry={45} fill="#8b5cf6" opacity={0.2} stroke="#8b5cf6" strokeWidth={1.5} />,
        dim: [<line key="r" x1={375} y1={62} x2={420} y2={62} stroke="#8b5cf6" strokeWidth={1.5} />, <T key="rt" x={400} y={55} size={8} fill="#c4b5fd">r</T>] },
      { x: 10, y: 140, color: '#f59e0b', label: 'Parallelogram',
        formula: 'A = b × h',
        shape: <polygon points="50,225 160,225 145,170 35,170" fill="#f59e0b" opacity={0.2} stroke="#f59e0b" strokeWidth={1.5} />,
        dim: [<line key="b" x1={50} y1={232} x2={160} y2={232} stroke="#f59e0b" strokeWidth={1} />, <T key="bt" x={105} y={242} size={8} fill="#fcd34d">b</T>, <line key="h" x1={165} y1={170} x2={165} y2={225} stroke="#f59e0b" strokeWidth={1} strokeDasharray="3 2" />, <T key="ht" x={175} y={198} size={8} fill="#fcd34d">h</T>] },
      { x: 200, y: 140, color: '#ef4444', label: 'Trapezium',
        formula: 'A = ½(a+b)h',
        shape: <polygon points="230,225 360,225 340,170 250,170" fill="#ef4444" opacity={0.2} stroke="#ef4444" strokeWidth={1.5} />,
        dim: [<T key="a" x={295} y={165} size={8} fill="#fca5a5">a</T>, <T key="b" x={295} y={235} size={8} fill="#fca5a5">b</T>, <line key="h" x1={365} y1={170} x2={365} y2={225} stroke="#ef4444" strokeWidth={1} strokeDasharray="3 2" />, <T key="ht" x={375} y={198} size={8} fill="#fca5a5">h</T>] },
    ].map(({ x, y, color, label, formula, shape, dim }) => (
      <g key={label}>
        <rect x={x} y={y} width={175} height={120} rx={7} fill={color} opacity={0.06} stroke={color} strokeWidth={1} />
        {shape}
        {dim}
        <T x={x + 88} y={y + 108} size={9} weight="bold" fill={color}>{label}: {formula}</T>
      </g>
    ))}
  </svg>
);

const OrderOfOperations = () => (
  <svg viewBox="0 0 560 200" width="100%" style={{ maxHeight: 200 }}>
    {arrowDef}
    {[
      { x: 10,  label: 'B',  title: 'Brackets',             sub: 'Solve inside\n( ) first',             color: '#3b82f6' },
      { x: 120, label: 'O',  title: 'Orders',               sub: 'Powers & roots\nx², √x',              color: '#8b5cf6' },
      { x: 230, label: 'D', title: 'Division',              sub: 'Left to right',                       color: '#10b981' },
      { x: 340, label: 'M',  title: 'Multiplication',       sub: 'Left to right\n(same level as ÷)',    color: '#10b981' },
      { x: 450, label: 'A',  title: 'Addition',             sub: 'Left to right',                       color: '#f59e0b' },
    ].map(({ x, label, title, sub, color }, i, arr) => (
      <g key={label}>
        <rect x={x} y={15} width={98} height={155} rx={8} fill={color} opacity={0.1} stroke={color} strokeWidth={1.5} />
        <T x={x + 49} y={50}  size={30} weight="bold" fill={color}>{label}</T>
        <T x={x + 49} y={88}  size={9}  weight="bold" fill="#e5e7eb">{title}</T>
        {sub.split('\n').map((line, j) => <T key={j} x={x + 49} y={104 + j * 14} size={8} fill="#9ca3af">{line}</T>)}
        {i < arr.length - 1 && <line x1={x + 102} y1={92} x2={x + 116} y2={92} stroke="#4b5563" strokeWidth={1.5} markerEnd="url(#arr)" />}
      </g>
    ))}
    {/* D/M bracket */}
    <rect x={228} y={10} width={210} height={5} rx={2} fill="#10b981" opacity={0.4} />
    <T x={333} y={8} size={8} fill="#34d399">same priority →</T>
    {/* A/S bracket — show S too */}
    <rect x={448} y={10} width={100} height={5} rx={2} fill="#f59e0b" opacity={0.4} />
    <T x={498} y={8} size={8} fill="#fcd34d">+S same →</T>
    <T x={280} y={190} size={9} fill="#6b7280">BODMAS — always work left to right at the same level</T>
  </svg>
);

const FractionModels = () => (
  <svg viewBox="0 0 580 220" width="100%" style={{ maxHeight: 220 }}>
    {[
      { x: 10,  label: '½',   parts: 2, filled: 1, color: '#3b82f6' },
      { x: 155, label: '⅓',   parts: 3, filled: 1, color: '#10b981' },
      { x: 300, label: '¾',   parts: 4, filled: 3, color: '#f59e0b' },
      { x: 440, label: '²⁄₅', parts: 5, filled: 2, color: '#8b5cf6' },
    ].map(({ x, label, parts, filled, color }) => {
      const bw = 130 / parts;
      return (
        <g key={label}>
          {/* Bar model */}
          {Array.from({ length: parts }, (_, i) => (
            <rect key={i} x={x + i * bw} y={30} width={bw - 2} height={50} rx={3}
              fill={i < filled ? color : '#374151'} opacity={i < filled ? 0.7 : 0.4}
              stroke={color} strokeWidth={1} />
          ))}
          {/* Circle model */}
          <circle cx={x + 65} cy={145} r={38} fill="none" stroke={color} strokeWidth={1.5} opacity={0.5} />
          {Array.from({ length: parts }, (_, i) => {
            const startAngle = (i / parts) * 2 * Math.PI - Math.PI / 2;
            const endAngle   = ((i + 1) / parts) * 2 * Math.PI - Math.PI / 2;
            const x1 = x + 65 + 38 * Math.cos(startAngle);
            const y1 = 145 + 38 * Math.sin(startAngle);
            const x2 = x + 65 + 38 * Math.cos(endAngle);
            const y2 = 145 + 38 * Math.sin(endAngle);
            return (
              <path key={i}
                d={`M ${x + 65},145 L ${x1},${y1} A 38,38 0 0 1 ${x2},${y2} Z`}
                fill={i < filled ? color : 'transparent'} opacity={0.5}
                stroke={color} strokeWidth={1} />
            );
          })}
          <T x={x + 65} y={202} size={16} weight="bold" fill={color}>{label}</T>
        </g>
      );
    })}
    <T x={290} y={218} size={8} fill="#6b7280">Bar models (top) and circle models (bottom)</T>
  </svg>
);

const VennDiagram = () => (
  <svg viewBox="0 0 500 280" width="100%" style={{ maxHeight: 280 }}>
    {/* Rectangle border = sample space */}
    <rect x={20} y={30} width={460} height={220} rx={8} fill="none" stroke="#4b5563" strokeWidth={1.5} strokeDasharray="5 3" />
    <T x={240} y={22} size={9} fill="#6b7280">Sample Space (ξ)</T>
    {/* Circle A */}
    <ellipse cx={185} cy={140} rx={120} ry={95} fill="#3b82f6" opacity={0.18} stroke="#3b82f6" strokeWidth={2} />
    <T x={120} y={105} size={11} weight="bold" fill="#60a5fa">A</T>
    {/* Circle B */}
    <ellipse cx={315} cy={140} rx={120} ry={95} fill="#10b981" opacity={0.18} stroke="#10b981" strokeWidth={2} />
    <T x={380} y={105} size={11} weight="bold" fill="#34d399">B</T>
    {/* Labels */}
    <T x={120} y={145} size={9} fill="#93c5fd">A only</T>
    <T x={120} y={159} size={8} fill="#6b7280">in A, not B</T>
    <T x={250} y={140} size={9} weight="bold" fill="#e5e7eb">A ∩ B</T>
    <T x={250} y={154} size={8} fill="#9ca3af">in both</T>
    <T x={380} y={145} size={9} fill="#6ee7b7">B only</T>
    <T x={380} y={159} size={8} fill="#6b7280">in B, not A</T>
    <T x={50}  y={230} size={8} fill="#6b7280">Neither</T>
    {/* Formula hints */}
    <T x={250} y={260} size={8.5} fill="#9ca3af">P(A ∪ B) = P(A) + P(B) − P(A ∩ B)</T>
  </svg>
);

const IndexLaws = () => (
  <svg viewBox="0 0 580 280" width="100%" style={{ maxHeight: 280 }}>
    {[
      { y: 15,  label: 'Multiplication',  rule: 'aᵐ × aⁿ = aᵐ⁺ⁿ', ex: '3² × 3⁴ = 3⁶',   color: '#3b82f6' },
      { y: 60,  label: 'Division',        rule: 'aᵐ ÷ aⁿ = aᵐ⁻ⁿ', ex: '5⁷ ÷ 5³ = 5⁴',   color: '#10b981' },
      { y: 105, label: 'Power of a power', rule: '(aᵐ)ⁿ = aᵐⁿ',    ex: '(2³)⁴ = 2¹²',    color: '#8b5cf6' },
      { y: 150, label: 'Zero index',      rule: 'a⁰ = 1',           ex: '7⁰ = 1',          color: '#f59e0b' },
      { y: 195, label: 'Negative index',  rule: 'a⁻ⁿ = 1/aⁿ',      ex: '2⁻³ = 1/8',       color: '#ef4444' },
      { y: 240, label: 'Fractional index', rule: 'a^(1/n) = ⁿ√a',  ex: '9^(½) = √9 = 3',  color: '#06b6d4' },
    ].map(({ y, label, rule, ex, color }) => (
      <g key={label}>
        <rect x={10}  y={y} width={555} height={38} rx={5} fill={color} opacity={0.08} stroke={color} strokeWidth={1} />
        <T x={95}  y={y + 19} size={9}  weight="bold" fill={color} anchor="end">{label}</T>
        <line x1={100} y1={y + 5} x2={100} y2={y + 33} stroke="#374151" strokeWidth={1} />
        <T x={310} y={y + 19} size={11} weight="bold" fill="#e5e7eb">{rule}</T>
        <line x1={430} y1={y + 5} x2={430} y2={y + 33} stroke="#374151" strokeWidth={1} />
        <T x={495} y={y + 19} size={9}  fill="#9ca3af" anchor="middle">{ex}</T>
      </g>
    ))}
    <T x={290} y={275} size={8} fill="#6b7280">Index Laws — only apply when the base (a) is the same</T>
  </svg>
);

const QuadrilateralTypes = () => (
  <svg viewBox="0 0 580 220" width="100%" style={{ maxHeight: 220 }}>
    {[
      { x: 10,  label: 'Square',        sub: 'All sides equal\nAll angles 90°',    color: '#3b82f6',
        pts: '35,50 125,50 125,140 35,140' },
      { x: 145, label: 'Rectangle',     sub: 'Opposite sides equal\nAll angles 90°', color: '#10b981',
        pts: '150,65 270,65 270,130 150,130' },
      { x: 290, label: 'Parallelogram', sub: 'Opposite sides equal\nOpposite angles equal', color: '#f59e0b',
        pts: '310,130 420,130 400,55 290,55' },
      { x: 430, label: 'Trapezium',     sub: 'One pair of\nparallel sides',        color: '#8b5cf6',
        pts: '450,130 560,130 540,60 470,60' },
    ].map(({ x, label, sub, color, pts }) => (
      <g key={label}>
        <rect x={x} y={8} width={130} height={202} rx={6} fill={color} opacity={0.07} stroke={color} strokeWidth={1} />
        <polygon points={pts} fill={color} opacity={0.25} stroke={color} strokeWidth={2} />
        <T x={x + 65} y={158} size={9}  weight="bold" fill={color}>{label}</T>
        {sub.split('\n').map((line, i) => <T key={i} x={x + 65} y={172 + i * 14} size={8} fill="#9ca3af">{line}</T>)}
      </g>
    ))}
  </svg>
);

const Shapes3D = () => (
  <svg viewBox="0 0 580 240" width="100%" style={{ maxHeight: 240 }}>
    {[
      { x: 10,  label: 'Cube',          vol: 'V = l³',             sa: 'SA = 6l²',           color: '#3b82f6',
        shape: <><rect x={30} y={50}  width={80} height={80} fill="#3b82f6" opacity={0.2} stroke="#3b82f6" strokeWidth={1.5} /><polygon points="30,50 55,25 135,25 110,50" fill="#3b82f6" opacity={0.3} stroke="#3b82f6" strokeWidth={1.5} /><line x1={110} y1={50} x2={110} y2={130} stroke="#3b82f6" strokeWidth={1.5} /><line x1={110} y1={25} x2={110} y2={50} stroke="#3b82f6" strokeWidth={1.5} /></> },
      { x: 150, label: 'Rectangular Prism', vol: 'V = lwh',        sa: 'SA = 2(lw+lh+wh)',  color: '#10b981',
        shape: <><rect x={160} y={60} width={100} height={65} fill="#10b981" opacity={0.2} stroke="#10b981" strokeWidth={1.5} /><polygon points="160,60 185,35 285,35 260,60" fill="#10b981" opacity={0.3} stroke="#10b981" strokeWidth={1.5} /><line x1={260} y1={60} x2={260} y2={125} stroke="#10b981" strokeWidth={1.5} /></> },
      { x: 310, label: 'Cylinder',       vol: 'V = πr²h',          sa: 'SA = 2πr²+2πrh',    color: '#8b5cf6',
        shape: <><ellipse cx={370} cy={65}  rx={42} ry={14} fill="#8b5cf6" opacity={0.35} stroke="#8b5cf6" strokeWidth={1.5} /><rect x={328} y={65} width={84} height={70} fill="#8b5cf6" opacity={0.18} stroke="#8b5cf6" strokeWidth={0} /><ellipse cx={370} cy={135} rx={42} ry={14} fill="#8b5cf6" opacity={0.2}  stroke="#8b5cf6" strokeWidth={1.5} /><line x1={328} y1={65} x2={328} y2={135} stroke="#8b5cf6" strokeWidth={1.5} /><line x1={412} y1={65} x2={412} y2={135} stroke="#8b5cf6" strokeWidth={1.5} /></> },
      { x: 460, label: 'Cone',          vol: 'V = ⅓πr²h',         sa: 'SA = πr²+πrl',       color: '#ef4444',
        shape: <><ellipse cx={520} cy={130} rx={42} ry={14} fill="#ef4444" opacity={0.2} stroke="#ef4444" strokeWidth={1.5} /><line x1={478} y1={130} x2={520} y2={40}  stroke="#ef4444" strokeWidth={1.5} /><line x1={562} y1={130} x2={520} y2={40}  stroke="#ef4444" strokeWidth={1.5} /><polygon points="478,130 520,40 562,130" fill="#ef4444" opacity={0.15} /></> },
    ].map(({ x, label, vol, sa, color, shape }) => (
      <g key={label}>
        <rect x={x} y={10} width={135} height={220} rx={6} fill={color} opacity={0.06} stroke={color} strokeWidth={1} />
        {shape}
        <T x={x + 67} y={155} size={9}  weight="bold" fill={color}>{label}</T>
        <T x={x + 67} y={170} size={8}  fill="#d1d5db">{vol}</T>
        <T x={x + 67} y={184} size={7.5} fill="#9ca3af">{sa}</T>
      </g>
    ))}
  </svg>
);

const Transformations = () => (
  <svg viewBox="0 0 580 230" width="100%" style={{ maxHeight: 230 }}>
    {/* Translation */}
    <rect x={10} y={10} width={130} height={210} rx={6} fill="#3b82f6" opacity={0.07} stroke="#3b82f6" strokeWidth={1} />
    <polygon points="30,120 60,70 90,120" fill="#3b82f6" opacity={0.3} stroke="#3b82f6" strokeWidth={1.5} />
    <polygon points="65,160 95,110 125,160" fill="#3b82f6" opacity={0.15} stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="4 2" />
    <line x1={60} y1={95} x2={90} y2={133} stroke="#3b82f6" strokeWidth={1.5} markerEnd="url(#arr)" />
    <T x={75} y={188} size={9} weight="bold" fill="#60a5fa">Translation</T>
    <T x={75} y={202} size={8} fill="#9ca3af">Slide — same size</T>
    <T x={75} y={215} size={8} fill="#9ca3af">and shape</T>
    {/* Reflection */}
    <rect x={150} y={10} width={130} height={210} rx={6} fill="#10b981" opacity={0.07} stroke="#10b981" strokeWidth={1} />
    <line x1={215} y1={20} x2={215} y2={190} stroke="#10b981" strokeWidth={1.5} strokeDasharray="5 3" />
    <polygon points="165,130 195,70 195,130" fill="#10b981" opacity={0.3} stroke="#10b981" strokeWidth={1.5} />
    <polygon points="265,130 235,70 235,130" fill="#10b981" opacity={0.15} stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 2" />
    <T x={215} y={188} size={9} weight="bold" fill="#34d399">Reflection</T>
    <T x={215} y={202} size={8} fill="#9ca3af">Flip over a mirror</T>
    <T x={215} y={215} size={8} fill="#9ca3af">line (axis)</T>
    {/* Rotation */}
    <rect x={290} y={10} width={130} height={210} rx={6} fill="#f59e0b" opacity={0.07} stroke="#f59e0b" strokeWidth={1} />
    <circle cx={355} cy={120} r={3} fill="#f59e0b" />
    <polygon points="355,120 355,65 400,65 400,120" fill="#f59e0b" opacity={0.3} stroke="#f59e0b" strokeWidth={1.5} />
    <polygon points="355,120 310,120 310,165 355,165" fill="#f59e0b" opacity={0.15} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 2" />
    <path d="M 370,80 A 25,25 0 0 1 340,140" fill="none" stroke="#f59e0b" strokeWidth={1.5} markerEnd="url(#arr)" />
    <T x={355} y={188} size={9} weight="bold" fill="#fcd34d">Rotation</T>
    <T x={355} y={202} size={8} fill="#9ca3af">Turn around a</T>
    <T x={355} y={215} size={8} fill="#9ca3af">centre point</T>
    {/* Dilation */}
    <rect x={430} y={10} width={140} height={210} rx={6} fill="#8b5cf6" opacity={0.07} stroke="#8b5cf6" strokeWidth={1} />
    <circle cx={500} cy={120} r={3} fill="#8b5cf6" />
    <polygon points="500,120 480,80 520,80" fill="#8b5cf6" opacity={0.15} stroke="#8b5cf6" strokeWidth={1.5} strokeDasharray="4 2" />
    <polygon points="500,120 460,50 540,50" fill="#8b5cf6" opacity={0.3} stroke="#8b5cf6" strokeWidth={1.5} />
    <line x1={500} y1={120} x2={500} y2={53} stroke="#8b5cf6" strokeWidth={1} strokeDasharray="3 2" />
    <T x={500} y={188} size={9} weight="bold" fill="#c4b5fd">Dilation</T>
    <T x={500} y={202} size={8} fill="#9ca3af">Scale factor enlarges</T>
    <T x={500} y={215} size={8} fill="#9ca3af">or shrinks the shape</T>
  </svg>
);

const ScatterPlotCorrelation = () => (
  <svg viewBox="0 0 580 240" width="100%" style={{ maxHeight: 240 }}>
    {arrowDef}
    {[
      { x: 10,  label: 'Positive Correlation',   sub: 'As x increases, y increases',   color: '#10b981',
        dots: [[30,160],[55,140],[80,120],[105,100],[130,85],[155,65]] },
      { x: 210, label: 'Negative Correlation',   sub: 'As x increases, y decreases',   color: '#ef4444',
        dots: [[220,65],[245,80],[270,105],[295,125],[320,145],[345,165]] },
      { x: 410, label: 'No Correlation',         sub: 'No pattern between x and y',    color: '#6b7280',
        dots: [[420,80],[445,155],[470,100],[495,140],[520,75],[545,160]] },
    ].map(({ x, label, sub, color, dots }) => (
      <g key={label}>
        <rect x={x} y={10} width={190} height={220} rx={6} fill={color} opacity={0.07} stroke={color} strokeWidth={1} />
        {/* Mini axes */}
        <line x1={x+15} y1={185} x2={x+180} y2={185} stroke="#4b5563" strokeWidth={1.5} markerEnd="url(#arr)" />
        <line x1={x+15} y1={185} x2={x+15}  y2={30}  stroke="#4b5563" strokeWidth={1.5} markerEnd="url(#arr)" />
        <T x={x+190} y={185} size={8} fill="#6b7280" anchor="start">x</T>
        <T x={x+15}  y={24}  size={8} fill="#6b7280">y</T>
        {dots.map(([dx, dy], i) => <circle key={i} cx={dx} cy={dy} r={5} fill={color} opacity={0.8} />)}
        {/* Trend line for positive/negative */}
        {label !== 'No Correlation' && (
          <line x1={dots[0][0]} y1={dots[0][1]} x2={dots[dots.length-1][0]} y2={dots[dots.length-1][1]}
            stroke={color} strokeWidth={1.5} strokeDasharray="5 3" opacity={0.7} />
        )}
        <T x={x+95} y={200} size={9} weight="bold" fill={color}>{label}</T>
        <T x={x+95} y={213} size={8} fill="#9ca3af">{sub}</T>
      </g>
    ))}
  </svg>
);

const PhotosynthesisRespiration = () => (
  <svg viewBox="0 0 560 260" width="100%" style={{ maxHeight: 260 }}>
    {arrowDef}
    {/* Photosynthesis box */}
    <rect x={20} y={20} width={220} height={100} rx={8} fill="#14532d" stroke="#16a34a" strokeWidth={1.5} />
    <T x={130} y={42} size={10} weight="bold" fill="#4ade80">Photosynthesis</T>
    <T x={130} y={60} size={8.5} fill="#86efac">6CO₂ + 6H₂O + light energy</T>
    <T x={130} y={76} size={10} fill="#e5e7eb">→ C₆H₁₂O₆ + 6O₂</T>
    <T x={130} y={96} size={8} fill="#9ca3af">Chloroplasts · occurs in light</T>
    <T x={130} y={110} size={8} fill="#9ca3af">Produces glucose &amp; oxygen</T>
    {/* Cellular Respiration box */}
    <rect x={320} y={20} width={220} height={100} rx={8} fill="#1c1917" stroke="#f97316" strokeWidth={1.5} />
    <T x={430} y={42} size={10} weight="bold" fill="#fb923c">Cellular Respiration</T>
    <T x={430} y={60} size={8.5} fill="#fdba74">C₆H₁₂O₆ + 6O₂</T>
    <T x={430} y={76} size={10} fill="#e5e7eb">→ 6CO₂ + 6H₂O + ATP</T>
    <T x={430} y={96} size={8} fill="#9ca3af">Mitochondria · occurs always</T>
    <T x={430} y={110} size={8} fill="#9ca3af">Releases energy (ATP)</T>
    {/* Plant in middle */}
    <T x={280} y={75} size={24}>🌿</T>
    {/* Arrows — O2 and CO2 cycling */}
    <path d="M 240,55 Q 280,30 320,55" fill="none" stroke="#3b82f6" strokeWidth={1.5} markerEnd="url(#arr)" />
    <T x={280} y={28} size={8} fill="#60a5fa">O₂ out</T>
    <path d="M 320,80 Q 280,105 240,80" fill="none" stroke="#ef4444" strokeWidth={1.5} markerEnd="url(#arr)" />
    <T x={280} y={108} size={8} fill="#fca5a5">CO₂ in</T>
    {/* Differences table */}
    <rect x={20} y={145} width={520} height={100} rx={6} fill="#1f2937" stroke="#374151" strokeWidth={1} />
    {[
      { label: '',               photo: 'Photosynthesis',     resp: 'Respiration' },
      { label: 'Occurs in:',     photo: 'Plants (chloroplasts)', resp: 'All living cells (mitochondria)' },
      { label: 'Requires:',      photo: 'Light, CO₂, H₂O',   resp: 'Glucose, O₂' },
      { label: 'Produces:',      photo: 'Glucose + O₂',       resp: 'CO₂ + H₂O + energy' },
    ].map(({ label, photo, resp }, i) => {
      const y = 160 + i * 22;
      const iH = i === 0;
      return <g key={i}>
        <T x={100} y={y} size={iH ? 9 : 8} weight={iH ? 'bold' : 'normal'} fill={iH ? '#e5e7eb' : '#9ca3af'} anchor="end">{label}</T>
        <T x={270} y={y} size={iH ? 9 : 8} weight={iH ? 'bold' : 'normal'} fill={iH ? '#4ade80' : '#d1d5db'}>{photo}</T>
        <T x={450} y={y} size={iH ? 9 : 8} weight={iH ? 'bold' : 'normal'} fill={iH ? '#fb923c' : '#d1d5db'}>{resp}</T>
        {i > 0 && <line x1={25} y1={y - 11} x2={535} y2={y - 11} stroke="#374151" strokeWidth={0.5} />}
      </g>;
    })}
  </svg>
);

const PeriodicTableStructure = () => (
  <svg viewBox="0 0 580 260" width="100%" style={{ maxHeight: 260 }}>
    {/* Background zones */}
    <rect x={15}  y={30} width={85}  height={200} rx={4} fill="#1e3a5f" stroke="#3b82f6" strokeWidth={1} opacity={0.5} />
    <rect x={105} y={30} width={300} height={200} rx={4} fill="#1f1207" stroke="#b45309" strokeWidth={1} opacity={0.5} />
    <rect x={410} y={30} width={160} height={200} rx={4} fill="#1a1030" stroke="#7c3aed" strokeWidth={1} opacity={0.5} />
    {/* Metalloids diagonal */}
    <rect x={305} y={30} width={105} height={200} rx={4} fill="#0f1f0f" stroke="#16a34a" strokeWidth={1} opacity={0.4} />
    {/* Labels for zones */}
    <T x={57}  y={140} size={10} weight="bold" fill="#60a5fa">Metals</T>
    <T x={255} y={140} size={10} weight="bold" fill="#f97316">Transition\nMetals</T>
    <T x={355} y={120} size={9}  weight="bold" fill="#4ade80">Metalloids</T>
    <T x={490} y={140} size={10} weight="bold" fill="#c4b5fd">Non-metals</T>
    {/* Period arrows */}
    <line x1={8} y1={60}  x2={8} y2={215} stroke="#6b7280" strokeWidth={1.5} markerEnd="url(#arr)" />
    <T x={5} y={140} size={8} fill="#9ca3af" anchor="end">P\ne\nr\ni\no\nd\ns</T>
    {/* Group arrows */}
    <line x1={15}  y1={22} x2={565} y2={22} stroke="#6b7280" strokeWidth={1.5} markerEnd="url(#arr)" />
    <T x={290} y={18} size={8} fill="#9ca3af">Groups (1–18) →</T>
    {/* Key properties */}
    <rect x={15} y={240} width={550} height={16} rx={3} fill="#111827" />
    <T x={57}  y={248} size={8} fill="#60a5fa">Metals: conduct, malleable, shiny</T>
    <T x={290} y={248} size={8} fill="#c4b5fd">Non-metals: insulate, brittle, dull</T>
    <T x={490} y={248} size={8} fill="#4ade80">Metalloids: semi-conductors</T>
    {/* Sample elements */}
    {[
      { x: 20,  y: 50, sym: 'H',  name: 'Hydrogen',  num: '1',  color: '#8b5cf6' },
      { x: 20,  y: 90, sym: 'Li', name: 'Lithium',   num: '3',  color: '#3b82f6' },
      { x: 20,  y: 130,sym: 'Na', name: 'Sodium',    num: '11', color: '#3b82f6' },
      { x: 110, y: 130,sym: 'Fe', name: 'Iron',      num: '26', color: '#f59e0b' },
      { x: 415, y: 50, sym: 'C',  name: 'Carbon',    num: '6',  color: '#8b5cf6' },
      { x: 415, y: 90, sym: 'O',  name: 'Oxygen',    num: '8',  color: '#8b5cf6' },
      { x: 510, y: 50, sym: 'He', name: 'Helium',    num: '2',  color: '#7c3aed' },
      { x: 510, y: 90, sym: 'Ne', name: 'Neon',      num: '10', color: '#7c3aed' },
    ].map(({ x, y, sym, name, num, color }) => (
      <g key={sym}>
        <rect x={x} y={y} width={75} height={34} rx={4} fill={color} opacity={0.18} stroke={color} strokeWidth={1} />
        <T x={x + 14} y={y + 17} size={14} weight="bold" fill={color} anchor="middle">{sym}</T>
        <T x={x + 50} y={y + 11} size={8}  fill="#d1d5db" anchor="middle">{num}</T>
        <T x={x + 50} y={y + 24} size={7.5} fill="#9ca3af" anchor="middle">{name}</T>
      </g>
    ))}
    <T x={290} y={14} size={10} weight="bold" fill="#e5e7eb"> </T>
  </svg>
);

// ── Statistics Diagrams ───────────────────────────────────────────────────────

const BoxPlot = () => (
  <svg viewBox="0 0 560 220" width="100%" style={{ maxHeight: 220 }}>
    {arrowDef}
    {/* Axis */}
    <line x1={40} y1={130} x2={530} y2={130} stroke="#4b5563" strokeWidth={1.5} markerEnd="url(#arr)" />
    {[10,20,30,40,50,60,70,80,90,100].map(n => {
      const x = 40 + (n / 100) * 480;
      return <g key={n}>
        <line x1={x} y1={125} x2={x} y2={135} stroke="#6b7280" strokeWidth={1} />
        <T x={x} y={145} size={8} fill="#9ca3af">{n}</T>
      </g>;
    })}
    {/* Box plot: min=18, Q1=35, median=52, Q3=68, max=88 */}
    {(() => {
      const sc = (v: number) => 40 + (v / 100) * 480;
      const min=18, q1=35, med=52, q3=68, max=88;
      const y=100, h=40;
      return <>
        {/* Whiskers */}
        <line x1={sc(min)} y1={y+h/2} x2={sc(q1)}  y2={y+h/2} stroke="#9ca3af" strokeWidth={1.5} />
        <line x1={sc(q3)}  y1={y+h/2} x2={sc(max)}  y2={y+h/2} stroke="#9ca3af" strokeWidth={1.5} />
        <line x1={sc(min)} y1={y+8}    x2={sc(min)}  y2={y+h-8} stroke="#9ca3af" strokeWidth={2} />
        <line x1={sc(max)} y1={y+8}    x2={sc(max)}  y2={y+h-8} stroke="#9ca3af" strokeWidth={2} />
        {/* Box */}
        <rect x={sc(q1)} y={y} width={sc(q3)-sc(q1)} height={h} fill="#3b82f6" opacity={0.2} stroke="#3b82f6" strokeWidth={2} />
        {/* Median line */}
        <line x1={sc(med)} y1={y} x2={sc(med)} y2={y+h} stroke="#ef4444" strokeWidth={2.5} />
        {/* Labels */}
        <T x={sc(min)}  y={y-12} size={8} fill="#9ca3af">Min</T>
        <T x={sc(min)}  y={y-3}  size={8} fill="#9ca3af">{min}</T>
        <T x={sc(q1)}   y={y-12} size={8} fill="#60a5fa">Q1</T>
        <T x={sc(q1)}   y={y-3}  size={8} fill="#60a5fa">{q1}</T>
        <T x={sc(med)}  y={y-12} size={8} fill="#fca5a5">Median</T>
        <T x={sc(med)}  y={y-3}  size={8} fill="#fca5a5">{med}</T>
        <T x={sc(q3)}   y={y-12} size={8} fill="#60a5fa">Q3</T>
        <T x={sc(q3)}   y={y-3}  size={8} fill="#60a5fa">{q3}</T>
        <T x={sc(max)}  y={y-12} size={8} fill="#9ca3af">Max</T>
        <T x={sc(max)}  y={y-3}  size={8} fill="#9ca3af">{max}</T>
        {/* IQR brace */}
        <line x1={sc(q1)} y1={y+h+18} x2={sc(q3)} y2={y+h+18} stroke="#10b981" strokeWidth={1.5} />
        <line x1={sc(q1)} y1={y+h+14} x2={sc(q1)} y2={y+h+22} stroke="#10b981" strokeWidth={1.5} />
        <line x1={sc(q3)} y1={y+h+14} x2={sc(q3)} y2={y+h+22} stroke="#10b981" strokeWidth={1.5} />
        <T x={(sc(q1)+sc(q3))/2} y={y+h+30} size={8} fill="#34d399">IQR = Q3 − Q1 = {q3-q1}</T>
      </>;
    })()}
    <T x={285} y={195} size={8} fill="#6b7280">Box Plot (Box-and-Whisker Plot) — shows spread and centre of data</T>
  </svg>
);

const DataTypes = () => (
  <svg viewBox="0 0 540 260" width="100%" style={{ maxHeight: 260 }}>
    {arrowDef}
    {/* Root */}
    <rect x={195} y={10} width={150} height={40} rx={7} fill="#374151" stroke="#6b7280" strokeWidth={1.5} />
    <T x={270} y={30} size={10} weight="bold" fill="#e5e7eb">DATA</T>
    {/* Branches to categorical and numerical */}
    <line x1={270} y1={50}  x2={115} y2={90}  stroke="#6b7280" strokeWidth={1.5} />
    <line x1={270} y1={50}  x2={425} y2={90}  stroke="#6b7280" strokeWidth={1.5} />
    {/* Categorical */}
    <rect x={35} y={90} width={160} height={40} rx={7} fill="#1e3a5f" stroke="#3b82f6" strokeWidth={1.5} />
    <T x={115} y={110} size={10} weight="bold" fill="#60a5fa">Categorical</T>
    <T x={115} y={145} size={8} fill="#9ca3af">Names or labels</T>
    <T x={115} y={158} size={8} fill="#9ca3af">e.g. colour, gender, sport</T>
    {/* Nominal and Ordinal under categorical */}
    <line x1={115} y1={130} x2={65}  y2={175} stroke="#3b82f6" strokeWidth={1} />
    <line x1={115} y1={130} x2={165} y2={175} stroke="#3b82f6" strokeWidth={1} />
    <rect x={15}  y={175} width={100} height={42} rx={5} fill="#3b82f6" opacity={0.12} stroke="#3b82f6" strokeWidth={1} />
    <T x={65}  y={193} size={8} weight="bold" fill="#60a5fa">Nominal</T>
    <T x={65}  y={207} size={7.5} fill="#9ca3af">No order (colours)</T>
    <rect x={120} y={175} width={100} height={42} rx={5} fill="#3b82f6" opacity={0.12} stroke="#3b82f6" strokeWidth={1} />
    <T x={170} y={193} size={8} weight="bold" fill="#60a5fa">Ordinal</T>
    <T x={170} y={207} size={7.5} fill="#9ca3af">Has order (grades)</T>
    {/* Numerical */}
    <rect x={345} y={90} width={160} height={40} rx={7} fill="#14532d" stroke="#10b981" strokeWidth={1.5} />
    <T x={425} y={110} size={10} weight="bold" fill="#34d399">Numerical</T>
    <T x={425} y={145} size={8} fill="#9ca3af">Counts or measurements</T>
    <T x={425} y={158} size={8} fill="#9ca3af">e.g. height, score, age</T>
    {/* Discrete and Continuous under numerical */}
    <line x1={425} y1={130} x2={375} y2={175} stroke="#10b981" strokeWidth={1} />
    <line x1={425} y1={130} x2={475} y2={175} stroke="#10b981" strokeWidth={1} />
    <rect x={325} y={175} width={100} height={42} rx={5} fill="#10b981" opacity={0.12} stroke="#10b981" strokeWidth={1} />
    <T x={375} y={193} size={8} weight="bold" fill="#34d399">Discrete</T>
    <T x={375} y={207} size={7.5} fill="#9ca3af">Whole numbers (goals)</T>
    <rect x={430} y={175} width={100} height={42} rx={5} fill="#10b981" opacity={0.12} stroke="#10b981" strokeWidth={1} />
    <T x={480} y={193} size={8} weight="bold" fill="#34d399">Continuous</T>
    <T x={480} y={207} size={7.5} fill="#9ca3af">Any value (temp)</T>
    <T x={270} y={250} size={8} fill="#6b7280">Understanding data type determines which graph and statistics to use</T>
  </svg>
);

const MeasuresCentre = () => (
  <svg viewBox="0 0 540 250" width="100%" style={{ maxHeight: 250 }}>
    {/* Dataset */}
    <T x={270} y={18} size={10} weight="bold" fill="#e5e7eb">Dataset: 4, 7, 7, 9, 12, 15, 15, 15, 18</T>
    {/* Number line showing data points */}
    <line x1={30} y1={55} x2={510} y2={55} stroke="#4b5563" strokeWidth={1.5} />
    {[4,7,7,9,12,15,15,15,18].map((v, i) => {
      const x = 30 + ((v - 2) / 18) * 480;
      return <g key={i}>
        <line x1={x} y1={50} x2={x} y2={60} stroke="#6b7280" strokeWidth={1} />
        <circle cx={x} cy={40} r={5} fill="#3b82f6" opacity={0.7} />
      </g>;
    })}
    {/* Four stat boxes */}
    {[
      { x: 10,  color: '#3b82f6', label: 'Mean',   symbol: 'x̄', value: '= 102 ÷ 9 ≈ 11.3',
        method: 'Add all values\nthen divide by count', result: '≈ 11.3' },
      { x: 145, color: '#10b981', label: 'Median', symbol: 'M', value: '= 12',
        method: 'Middle value when\ndata is ordered', result: '12' },
      { x: 280, color: '#f59e0b', label: 'Mode',   symbol: 'Mo', value: '= 15',
        method: 'Most frequently\noccurring value', result: '15' },
      { x: 415, color: '#ef4444', label: 'Range',  symbol: 'R', value: '= 18 − 4',
        method: 'Max minus\nmin value', result: '14' },
    ].map(({ x, color, label, symbol, value, method, result }) => (
      <g key={label}>
        <rect x={x} y={75} width={120} height={158} rx={8} fill={color} opacity={0.1} stroke={color} strokeWidth={1.5} />
        <T x={x+60} y={100} size={22} weight="bold" fill={color}>{symbol}</T>
        <T x={x+60} y={126} size={10} weight="bold" fill="#e5e7eb">{label}</T>
        {method.split('\n').map((line, i) => <T key={i} x={x+60} y={144+i*14} size={8} fill="#9ca3af">{line}</T>)}
        <line x1={x+15} y1={176} x2={x+105} y2={176} stroke={color} strokeWidth={1} opacity={0.4} />
        <T x={x+60} y={192} size={9} fill={color}>{value}</T>
        <rect x={x+20} y={204} width={80} height={22} rx={4} fill={color} opacity={0.2} />
        <T x={x+60} y={215} size={11} weight="bold" fill={color}>{result}</T>
      </g>
    ))}
  </svg>
);

const StemAndLeaf = () => (
  <svg viewBox="0 0 500 280" width="100%" style={{ maxHeight: 280 }}>
    <T x={250} y={16} size={10} weight="bold" fill="#e5e7eb">Stem-and-Leaf Plot</T>
    <T x={250} y={30} size={8}  fill="#9ca3af">Dataset: 12, 15, 18, 21, 23, 23, 27, 31, 34, 38, 41, 45</T>
    {/* Headers */}
    <T x={135} y={55} size={9} weight="bold" fill="#9ca3af" anchor="end">Stem</T>
    <T x={155} y={55} size={9} weight="bold" fill="#9ca3af" anchor="start">Leaf</T>
    <line x1={50} y1={60} x2={450} y2={60} stroke="#374151" strokeWidth={1} />
    {/* Stem | Leaf rows */}
    {[
      { stem: '1', leaves: '2  5  8', note: '12, 15, 18' },
      { stem: '2', leaves: '1  3  3  7', note: '21, 23, 23, 27' },
      { stem: '3', leaves: '1  4  8', note: '31, 34, 38' },
      { stem: '4', leaves: '1  5', note: '41, 45' },
    ].map(({ stem, leaves, note }, i) => {
      const y = 85 + i * 40;
      return <g key={stem}>
        <rect x={50} y={y-16} width={400} height={36} rx={4} fill={i%2===0 ? '#1f2937' : '#111827'} />
        <T x={130} y={y} size={13} weight="bold" fill="#e5e7eb" anchor="end">{stem}</T>
        <line x1={138} y1={y-14} x2={138} y2={y+14} stroke="#4b5563" strokeWidth={2} />
        <T x={155} y={y} size={13} fill="#60a5fa" anchor="start">{leaves}</T>
        <T x={420} y={y} size={8} fill="#6b7280" anchor="end">{note}</T>
      </g>;
    })}
    {/* Key */}
    <rect x={50} y={245} width={400} height={28} rx={4} fill="#1f2937" />
    <T x={250} y={259} size={9} fill="#9ca3af">Key: 2 | 3 means 23   ·   Stem = tens digit   ·   Leaf = units digit</T>
    {/* Back label */}
    <T x={250} y={278} size={8} fill="#6b7280">Back-to-back plots compare two datasets using the same stem</T>
  </svg>
);

const TwoWayTable = () => (
  <svg viewBox="0 0 520 270" width="100%" style={{ maxHeight: 270 }}>
    <T x={260} y={16} size={10} weight="bold" fill="#e5e7eb">Two-Way Frequency Table</T>
    <T x={260} y={30} size={8}  fill="#9ca3af">Example: sport preference by year level</T>
    {/* Table structure */}
    {(() => {
      const cols = ['', 'Football', 'Basketball', 'Swimming', 'TOTAL'];
      const rows = [
        { label: 'Year 9', vals: [18, 12, 10, 40], color: '#3b82f6' },
        { label: 'Year 10', vals: [14, 16, 10, 40], color: '#10b981' },
        { label: 'TOTAL',  vals: [32, 28, 20, 80], color: '#6b7280' },
      ];
      const cw = 92, rh = 38, ox = 25, oy = 50;
      return <>
        {/* Column headers */}
        {cols.map((c, ci) => (
          <g key={ci}>
            <rect x={ox + ci*cw} y={oy} width={cw} height={rh} fill={ci===0?'#111827':'#1e3a5f'} stroke="#374151" strokeWidth={1} />
            <T x={ox + ci*cw + cw/2} y={oy+rh/2} size={ci===0?0:9} weight="bold" fill="#93c5fd">{c}</T>
          </g>
        ))}
        {/* Data rows */}
        {rows.map(({ label, vals, color }, ri) => (
          <g key={label}>
            {/* Row label */}
            <rect x={ox} y={oy+(ri+1)*rh} width={cw} height={rh} fill="#1f2937" stroke="#374151" strokeWidth={1} />
            <T x={ox+cw/2} y={oy+(ri+1)*rh+rh/2} size={9} weight="bold" fill={color}>{label}</T>
            {/* Values */}
            {vals.map((v, ci) => {
              const isTotal = ci === 3 || ri === 2;
              return <g key={ci}>
                <rect x={ox+(ci+1)*cw} y={oy+(ri+1)*rh} width={cw} height={rh}
                  fill={isTotal ? '#1f2937' : '#111827'} stroke="#374151" strokeWidth={1} />
                <T x={ox+(ci+1)*cw+cw/2} y={oy+(ri+1)*rh+rh/2} size={isTotal?11:12}
                  weight={isTotal?'bold':'normal'} fill={isTotal?color:'#e5e7eb'}>{v}</T>
              </g>;
            })}
          </g>
        ))}
        {/* Annotations */}
        <T x={260} y={210} size={8} fill="#9ca3af">Row totals → 40 + 40 = 80 ✓  |  Column totals → 32 + 28 + 20 = 80 ✓</T>
        <T x={260} y={225} size={8} fill="#6b7280">P(Football | Yr 9) = 18/40 = 0.45   Relative frequency = cell ÷ grand total</T>
        <rect x={25} y={235} width={470} height={28} rx={4} fill="#1f2937" />
        <T x={260} y={252} size={8} fill="#9ca3af">Grand total (bottom-right) = sum of all rows = sum of all columns</T>
      </>;
    })()}
  </svg>
);

// ── Diagram registry ──────────────────────────────────────────────────────────

export const DIAGRAM_MAP: Record<string, { title: string; icon: string; minWidth: number; render: () => React.ReactElement }> = {
  // English
  'teel-paragraph':        { title: 'TEEL Paragraph Structure',    icon: '📝', minWidth: 520, render: () => <TeelParagraph /> },
  'essay-structure':       { title: '5-Paragraph Essay Structure',  icon: '📄', minWidth: 280, render: () => <EssayStructure /> },
  'story-arc':             { title: "Freytag's Story Arc",          icon: '📖', minWidth: 500, render: () => <StoryArc /> },
  'persuasive-structure':  { title: 'Persuasive Writing Structure', icon: '🗣️', minWidth: 520, render: () => <PersuasiveStructure /> },
  'argument-map':          { title: 'Argument Map',                 icon: '🗺️', minWidth: 460, render: () => <ArgumentMap /> },
  'literary-devices':      { title: 'Literary Devices',             icon: '✍️', minWidth: 520, render: () => <LiteraryDevices /> },
  'narrative-perspective': { title: 'Narrative Perspective',        icon: '👁️', minWidth: 500, render: () => <NarrativePerspective /> },
  'text-types':            { title: 'Text Types Overview',          icon: '📚', minWidth: 520, render: () => <TextTypes /> },
  // Science
  'animal-cell':                    { title: 'Animal Cell',                           icon: '🔬', minWidth: 420, render: () => <AnimalCell /> },
  'plant-cell':                     { title: 'Plant Cell',                            icon: '🌿', minWidth: 420, render: () => <PlantCell /> },
  'water-cycle':                    { title: 'The Water Cycle',                       icon: '💧', minWidth: 500, render: () => <WaterCycle /> },
  'food-chain':                     { title: 'Food Chain',                            icon: '🌱', minWidth: 520, render: () => <FoodChain /> },
  'atom-bohr':                      { title: 'Bohr Model Atom',                       icon: '⚛️', minWidth: 320, render: () => <AtomBohr /> },
  'circuit-series':                 { title: 'Series Circuit',                        icon: '⚡', minWidth: 440, render: () => <CircuitSeries /> },
  'circuit-parallel':               { title: 'Parallel Circuit',                      icon: '⚡', minWidth: 440, render: () => <CircuitParallel /> },
  'wave-diagram':                   { title: 'Wave Diagram',                          icon: '〰️', minWidth: 500, render: () => <WaveDiagram /> },
  'particle-states':                { title: 'States of Matter — Particle Model',    icon: '🧪', minWidth: 500, render: () => <ParticleStates /> },
  'electromagnetic-spectrum':       { title: 'Electromagnetic Spectrum',              icon: '🌈', minWidth: 540, render: () => <ElectromagneticSpectrum /> },
  'human-body-systems':             { title: 'Human Body Systems',                    icon: '🫀', minWidth: 500, render: () => <HumanBodySystems /> },
  'dna-structure':                  { title: 'DNA Double Helix',                      icon: '🧬', minWidth: 340, render: () => <DnaStructure /> },
  'mitosis-stages':                 { title: 'Stages of Mitosis',                     icon: '🔬', minWidth: 520, render: () => <MitosisStages /> },
  'trophic-pyramid':                { title: 'Trophic / Energy Pyramid',              icon: '🌿', minWidth: 380, render: () => <TrophicPyramid /> },
  'rock-cycle':                     { title: 'The Rock Cycle',                        icon: '🪨', minWidth: 440, render: () => <RockCycle /> },
  'ph-scale':                       { title: 'pH Scale',                              icon: '🧪', minWidth: 520, render: () => <PhScale /> },
  'force-diagram':                  { title: 'Balanced & Unbalanced Forces',          icon: '⚖️', minWidth: 480, render: () => <ForceDiagram /> },
  'speed-velocity':                 { title: 'Distance–Time & Velocity–Time Graphs', icon: '📈', minWidth: 500, render: () => <SpeedVelocity /> },
  'photosynthesis-respiration':     { title: 'Photosynthesis vs Respiration',        icon: '🌿', minWidth: 500, render: () => <PhotosynthesisRespiration /> },
  'periodic-table-structure':       { title: 'Periodic Table Structure',              icon: '⚗️', minWidth: 520, render: () => <PeriodicTableStructure /> },
  // Maths
  'angle-types':          { title: 'Types of Angles',                   icon: '📐', minWidth: 500, render: () => <AngleTypes /> },
  'triangle-types':       { title: 'Types of Triangles',                icon: '🔺', minWidth: 500, render: () => <TriangleTypes /> },
  'quadrilateral-types':  { title: 'Types of Quadrilaterals',           icon: '⬜', minWidth: 500, render: () => <QuadrilateralTypes /> },
  'circle-parts':         { title: 'Parts of a Circle',                 icon: '⭕', minWidth: 400, render: () => <CircleParts /> },
  '3d-shapes':            { title: '3D Shapes — Volume & Surface Area', icon: '📦', minWidth: 500, render: () => <Shapes3D /> },
  'transformations':      { title: 'Geometric Transformations',         icon: '🔄', minWidth: 500, render: () => <Transformations /> },
  'cartesian-plane':      { title: 'Cartesian Plane',                   icon: '📊', minWidth: 340, render: () => <CartesianPlane /> },
  'gradient-intercept':   { title: 'Gradient & Y-Intercept',            icon: '📈', minWidth: 420, render: () => <GradientIntercept /> },
  'soh-cah-toa':          { title: 'SOH CAH TOA — Trigonometry',        icon: '📐', minWidth: 460, render: () => <SohCahToa /> },
  'parabola-features':    { title: 'Features of a Parabola',            icon: '∪',  minWidth: 400, render: () => <ParabolaFeatures /> },
  'area-formulas':        { title: 'Area Formulas',                      icon: '📐', minWidth: 500, render: () => <AreaFormulas /> },
  'order-of-operations':  { title: 'Order of Operations (BODMAS)',      icon: '🔢', minWidth: 500, render: () => <OrderOfOperations /> },
  'fraction-models':      { title: 'Fraction Models',                   icon: '½',  minWidth: 500, render: () => <FractionModels /> },
  'scatter-plot':         { title: 'Scatter Plot Correlation',           icon: '📊', minWidth: 500, render: () => <ScatterPlotCorrelation /> },
  'box-plot':             { title: 'Box Plot (Box-and-Whisker)',        icon: '📦', minWidth: 500, render: () => <BoxPlot /> },
  'data-types':           { title: 'Types of Data',                    icon: '🗂️', minWidth: 460, render: () => <DataTypes /> },
  'measures-of-centre':   { title: 'Measures of Centre & Spread',      icon: '📊', minWidth: 480, render: () => <MeasuresCentre /> },
  'stem-and-leaf':        { title: 'Stem-and-Leaf Plot',               icon: '🌿', minWidth: 440, render: () => <StemAndLeaf /> },
  'two-way-table':        { title: 'Two-Way Frequency Table',          icon: '📋', minWidth: 460, render: () => <TwoWayTable /> },
  'venn-diagram':         { title: 'Venn Diagram',                      icon: '⭕', minWidth: 380, render: () => <VennDiagram /> },
  'index-laws':           { title: 'Index Laws',                        icon: '🔢', minWidth: 500, render: () => <IndexLaws /> },
  'pythagoras':           { title: "Pythagoras' Theorem",               icon: '📐', minWidth: 400, render: () => <Pythagoras /> },
  'number-line':          { title: 'Number Line',                       icon: '↔️', minWidth: 480, render: () => <NumberLine /> },
  'unit-circle':          { title: 'Unit Circle',                       icon: '⭕', minWidth: 340, render: () => <UnitCircle /> },
};

// ── Widget component ──────────────────────────────────────────────────────────

export default function DiagramWidget({ id }: { id: string }) {
  const diagram = DIAGRAM_MAP[id.toLowerCase().trim()];
  if (!diagram) {
    return (
      <div className="my-3 px-4 py-3 rounded-xl border border-gray-700 text-xs text-gray-500">
        Diagram not found: <code>{id}</code>
      </div>
    );
  }
  return (
    <div className="my-3 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
        <span className="text-sm">{diagram.icon}</span>
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{diagram.title}</span>
      </div>
      {/* overflow-x: auto ensures wide SVGs scroll on mobile instead of shrinking text to illegible sizes */}
      <div className="bg-gray-50 dark:bg-gray-900/60 p-3 overflow-x-auto">
        <div style={{ minWidth: diagram.minWidth }}>
          {diagram.render()}
        </div>
      </div>
    </div>
  );
}
