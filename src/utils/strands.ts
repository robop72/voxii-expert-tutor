export interface Strand {
  id: string;
  emoji: string;
  description: string;
  badgeBg: string;
  badgeText: string;
  topics: string[];
}

export const STRANDS: Strand[] = [
  {
    id: "Number",
    emoji: "🔢",
    description: "Surds, indices, financial maths, ratios",
    badgeBg: "bg-blue-100 dark:bg-blue-900/40",
    badgeText: "text-blue-700 dark:text-blue-300",
    topics: ["Surds", "Index laws", "Compound interest", "Scientific notation"],
  },
  {
    id: "Algebra",
    emoji: "📐",
    description: "Equations, quadratics, linear functions",
    badgeBg: "bg-violet-100 dark:bg-violet-900/40",
    badgeText: "text-violet-700 dark:text-violet-300",
    topics: ["Linear equations", "Factorising", "Simultaneous equations", "Functions"],
  },
  {
    id: "Measurement",
    emoji: "📏",
    description: "Pythagoras, trigonometry, area & volume",
    badgeBg: "bg-emerald-100 dark:bg-emerald-900/40",
    badgeText: "text-emerald-700 dark:text-emerald-300",
    topics: ["Pythagoras", "Trigonometry", "Area", "Volume"],
  },
  {
    id: "Space",
    emoji: "🔷",
    description: "Geometry, transformations, coordinate plane",
    badgeBg: "bg-cyan-100 dark:bg-cyan-900/40",
    badgeText: "text-cyan-700 dark:text-cyan-300",
    topics: ["Parallel lines", "Transformations", "Coordinate geometry", "Proof"],
  },
  {
    id: "Statistics",
    emoji: "📊",
    description: "Data, graphs, mean, median, scatter plots",
    badgeBg: "bg-orange-100 dark:bg-orange-900/40",
    badgeText: "text-orange-700 dark:text-orange-300",
    topics: ["Mean/median/mode", "Box plots", "Scatter plots", "Distributions"],
  },
  {
    id: "Probability",
    emoji: "🎲",
    description: "Chance, tree diagrams, Venn diagrams",
    badgeBg: "bg-rose-100 dark:bg-rose-900/40",
    badgeText: "text-rose-700 dark:text-rose-300",
    topics: ["Tree diagrams", "Venn diagrams", "Two-way tables", "Experimental probability"],
  },
];

const KEYWORD_MAP: Record<string, string[]> = {
  Number: [
    "fraction", "decimal", "percentage", "ratio", "rate", "integer",
    "irrational", "rational", "real number", "surds", "surd", "index", "indices",
    "scientific notation", "significant figures", "rounding", "proportion",
    "financial", "interest", "profit", "loss", "tax", "depreciation",
    "compound interest", "simple interest", "income",
  ],
  Algebra: [
    "equation", "expression", "expand", "factorise", "factorize",
    "simplify", "linear", "quadratic", "parabola", "gradient", "slope",
    "intercept", "simultaneous", "inequality", "substitution",
    "polynomial", "binomial", "pronumeral", "variable", "formula",
    "function", "relation", "direct proportion", "index law", "algebraic fraction",
  ],
  Measurement: [
    "area", "perimeter", "volume", "surface area", "length", "mass",
    "capacity", "pythagoras", "trigonometry", "sine", "cosine",
    "tangent", "angle", "bearing", "similar", "congruent", "scale",
    "unit conversion", "composite shape", "prism", "cylinder",
    "cone", "sphere", "pyramid", "arc", "sector",
  ],
  Space: [
    "geometry", "parallel", "perpendicular", "transformation",
    "reflection", "rotation", "translation", "dilation", "symmetry",
    "polygon", "circle", "chord", "coordinate", "cartesian",
    "proof", "theorem", "congruence", "similarity", "midpoint", "distance",
    "transversal", "number plane",
  ],
  Statistics: [
    "data", "mean", "median", "mode", "range", "outlier", "histogram",
    "stem", "leaf", "box plot", "dot plot", "scatter", "correlation",
    "distribution", "skew", "symmetric", "bimodal", "frequency",
    "relative frequency", "sample", "population", "survey",
    "back-to-back", "interquartile", "quartile",
  ],
  Probability: [
    "probability", "chance", "likelihood", "event", "outcome",
    "sample space", "tree diagram", "venn diagram", "two-way table",
    "independent", "dependent", "replacement", "complementary",
    "experimental", "theoretical", "random", "equally likely",
  ],
};

export function detectStrand(text: string): string | null {
  const lower = text.toLowerCase();
  const scores: Record<string, number> = {};
  for (const [strand, keywords] of Object.entries(KEYWORD_MAP)) {
    scores[strand] = keywords.filter(kw => lower.includes(kw)).length;
  }
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return best && best[1] > 0 ? best[0] : null;
}
