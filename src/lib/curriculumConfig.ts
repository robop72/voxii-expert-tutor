// ─── Strict types - app will not compile if invalid values are used ───────────

export type YearLevel = 7 | 8 | 9 | 10;
export type Subject = 'Maths' | 'English' | 'Science';

export const ALLOWED_YEAR_LEVELS: readonly YearLevel[] = [7, 8, 9, 10] as const;
export const ALLOWED_SUBJECTS: readonly Subject[] = ['Maths', 'English', 'Science'] as const;

export function isYearLevel(n: number): n is YearLevel {
  return (ALLOWED_YEAR_LEVELS as readonly number[]).includes(n);
}

// ─── Starter card shape ───────────────────────────────────────────────────────

export interface StarterCard {
  emoji: string;
  title: string;
  description: string;
  prompt: string;
}

// ─── Centralized config: Subject → YearLevel → 3 cards ───────────────────────

export const starterCardsConfig: Record<Subject, Record<YearLevel, [StarterCard, StarterCard, StarterCard]>> = {

  Maths: {
    7: [
      {
        emoji: '🍕',
        title: 'Mastering Fractions',
        description: 'Add, subtract, multiply and divide fractions',
        prompt: "I'm a Year 7 Maths student. Can you help me understand fractions - how to add, subtract, multiply and divide them? Please start by asking me a diagnostic question to see where I'm at.",
      },
      {
        emoji: '🕵️',
        title: 'Intro to Algebra',
        description: 'Variables, expressions and simple equations',
        prompt: "I'm a Year 7 Maths student. I'd like to learn what algebra is and how variables and expressions work. Please start by asking me a diagnostic question.",
      },
      {
        emoji: '📐',
        title: 'Angles & Shapes',
        description: 'Perimeter, area, angles and 2D geometry',
        prompt: "I'm a Year 7 Maths student. Can you help me with angles and 2D shapes - including perimeter and area? Please start with a diagnostic question.",
      },
    ],
    8: [
      {
        emoji: '💡',
        title: 'Index Laws',
        description: 'Multiply and divide powers with confidence',
        prompt: "I'm a Year 8 Maths student. Can you teach me the index laws - how to multiply, divide, and raise powers to powers? Please start with a diagnostic question.",
      },
      {
        emoji: '➗',
        title: 'Linear Equations',
        description: 'Solve one- and two-step equations',
        prompt: "I'm a Year 8 Maths student. Can you help me solve linear equations step by step? Please start with a diagnostic question.",
      },
      {
        emoji: '📐',
        title: "Pythagoras' Theorem",
        description: 'Find missing sides in right-angled triangles',
        prompt: "I'm a Year 8 Maths student. Can you teach me Pythagoras' theorem and show me how to use it to find missing sides? Please start with a diagnostic question.",
      },
    ],
    9: [
      {
        emoji: '🧩',
        title: 'Factorising Quadratics',
        description: 'Expand and factorise expressions like a² − 5a + 6',
        prompt: "I'm a Year 9 Maths student. Can you help me understand how to factorise quadratic expressions? Please start with a diagnostic question.",
      },
      {
        emoji: '⚖️',
        title: 'Simultaneous Equations',
        description: 'Solve systems of two equations - substitution & elimination',
        prompt: "I'm a Year 9 Maths student. Can you help me solve simultaneous equations using substitution and elimination? Please start with a diagnostic question.",
      },
      {
        emoji: '📐',
        title: 'Trigonometry',
        description: 'SOH CAH TOA - find sides and angles in right triangles',
        prompt: "I'm a Year 9 Maths student. Can you teach me trigonometry - SOH CAH TOA - and how to find missing sides and angles? Please start with a diagnostic question.",
      },
    ],
    10: [
      {
        emoji: '📈',
        title: 'Quadratic Formula',
        description: 'Solve any quadratic with the formula and discriminant',
        prompt: "I'm a Year 10 Maths student. Can you help me use the quadratic formula to solve quadratic equations, including understanding the discriminant? Please start with a diagnostic question.",
      },
      {
        emoji: '🔺',
        title: 'Sine & Cosine Rule',
        description: 'Solve non-right triangles in any situation',
        prompt: "I'm a Year 10 Maths student. Can you teach me the sine rule and cosine rule for solving non-right-angled triangles? Please start with a diagnostic question.",
      },
      {
        emoji: '📊',
        title: 'Standard Deviation',
        description: 'Measure spread in data - calculate and interpret σ',
        prompt: "I'm a Year 10 Maths student. Can you help me understand standard deviation - what it means and how to calculate it? Please start with a diagnostic question.",
      },
    ],
  },

  English: {
    7: [
      {
        emoji: '📖',
        title: 'Short Stories & Poetry',
        description: 'Identify text features and respond to creative writing',
        prompt: "I'm a Year 7 English student. Can you help me analyse a short story or poem - looking at its key features and ideas? Please start with a diagnostic question.",
      },
      {
        emoji: '✍️',
        title: 'Poetic Devices',
        description: 'Simile, metaphor, alliteration, personification',
        prompt: "I'm a Year 7 English student. Can you teach me the main poetic devices - like simile, metaphor, alliteration, and personification - with examples? Please start with a diagnostic question.",
      },
      {
        emoji: '📝',
        title: 'TEEL Paragraphs',
        description: 'Write structured Topic–Explanation–Evidence–Link paragraphs',
        prompt: "I'm a Year 7 English student. Can you help me learn how to write a TEEL paragraph - Topic, Explanation, Evidence, Link? Please start with a diagnostic question.",
      },
    ],
    8: [
      {
        emoji: '📚',
        title: 'Analysing Novels',
        description: 'Theme, character, perspective and context',
        prompt: "I'm a Year 8 English student. Can you help me analyse a novel - looking at theme, characterisation, and perspective? Please start with a diagnostic question.",
      },
      {
        emoji: '🗣️',
        title: 'Persuasive Writing',
        description: 'Construct arguments with evidence and persuasive techniques',
        prompt: "I'm a Year 8 English student. Can you help me write a persuasive essay - building a clear argument with evidence and persuasive techniques? Please start with a diagnostic question.",
      },
      {
        emoji: '🎭',
        title: 'Literary Devices',
        description: 'Irony, foreshadowing, symbolism and more',
        prompt: "I'm a Year 8 English student. Can you teach me literary devices - like irony, foreshadowing, and symbolism - and how to identify them in texts? Please start with a diagnostic question.",
      },
    ],
    9: [
      {
        emoji: '📝',
        title: 'Analytical Essays',
        description: 'Multi-paragraph essays with sustained argument',
        prompt: "I'm a Year 9 English student. Can you help me write a strong multi-paragraph analytical essay with a clear, sustained argument? Please start with a diagnostic question about my essay structure knowledge.",
      },
      {
        emoji: '🎭',
        title: 'Advanced Literary Devices',
        description: 'Irony, symbolism, foreshadowing - and their effects',
        prompt: "I'm a Year 9 English student. Can you teach me advanced literary devices - including irony, symbolism, and foreshadowing - and how to discuss their effect on the reader? Please start with a diagnostic question.",
      },
      {
        emoji: '🗣️',
        title: 'Persuasive Techniques',
        description: 'Rhetorical questions, emotive language, rule of three',
        prompt: "I'm a Year 9 English student. Can you teach me the persuasive language techniques used in texts - like rhetorical questions, emotive language, and the rule of three? Please start with a diagnostic question.",
      },
    ],
    10: [
      {
        emoji: '📚',
        title: 'Comparative Analysis',
        description: 'Compare two texts - themes, context and techniques',
        prompt: "I'm a Year 10 English student. Can you help me write a comparative analysis of two texts, looking at shared themes, contexts, and techniques? Please start with a diagnostic question.",
      },
      {
        emoji: '🖊️',
        title: 'Authorial Intent',
        description: 'Why does an author make particular choices?',
        prompt: "I'm a Year 10 English student. Can you help me analyse authorial intent - understanding why a writer makes specific structural, language, and stylistic choices? Please start with a diagnostic question.",
      },
      {
        emoji: '🎓',
        title: 'VCE Preparation',
        description: 'Text response and language analysis for senior English',
        prompt: "I'm a Year 10 English student preparing for VCE. Can you help me understand the demands of senior English - especially text response and language analysis essays? Please start with a diagnostic question.",
      },
    ],
  },

  Science: {
    7: [
      {
        emoji: '🔬',
        title: 'Cell Structure',
        description: 'Parts of a cell and their functions - plant vs animal',
        prompt: "I'm a Year 7 Science student. Can you help me understand cell structure - what are the key parts of plant and animal cells and what do they do? Please start with a diagnostic question.",
      },
      {
        emoji: '🚀',
        title: 'Forces & Motion',
        description: 'Contact and non-contact forces, balanced vs unbalanced',
        prompt: "I'm a Year 7 Science student. Can you explain forces and motion - the difference between contact and non-contact forces, and what balanced and unbalanced forces do? Please start with a diagnostic question.",
      },
      {
        emoji: '🌍',
        title: 'The Solar System',
        description: 'Planets, the sun, moons and the scale of space',
        prompt: "I'm a Year 7 Science student. Can you help me understand the solar system - the planets, the sun, and how it all fits together? Please start with a diagnostic question.",
      },
    ],
    8: [
      {
        emoji: '❤️',
        title: 'Body Systems',
        description: 'Digestive, circulatory and respiratory systems',
        prompt: "I'm a Year 8 Science student. Can you help me understand the main body systems - digestive, circulatory, and respiratory - and how they work together? Please start with a diagnostic question.",
      },
      {
        emoji: '⚗️',
        title: 'Atoms & Elements',
        description: 'Atomic structure, the periodic table, and compounds',
        prompt: "I'm a Year 8 Science student. Can you explain atoms, elements, and the periodic table - including how atoms combine to form compounds? Please start with a diagnostic question.",
      },
      {
        emoji: '⚡',
        title: 'Energy Transfer',
        description: 'Forms of energy, conduction, convection and radiation',
        prompt: "I'm a Year 8 Science student. Can you help me understand the different forms of energy and how energy is transferred - including conduction, convection, and radiation? Please start with a diagnostic question.",
      },
    ],
    9: [
      {
        emoji: '⚛️',
        title: 'Atomic Structure',
        description: 'Protons, neutrons, electrons - Bohr model and isotopes',
        prompt: "I'm a Year 9 Science student. Can you explain atomic structure - protons, neutrons, electrons, the Bohr model, and isotopes? Please start with a diagnostic question.",
      },
      {
        emoji: '⚗️',
        title: 'Chemical Equations',
        description: 'Write and balance chemical equations for reactions',
        prompt: "I'm a Year 9 Science student. Can you help me write and balance chemical equations? Please start with a diagnostic question about what I already know.",
      },
      {
        emoji: '🧬',
        title: 'Intro to Genetics',
        description: 'DNA, genes, chromosomes and cell division',
        prompt: "I'm a Year 9 Science student. Can you introduce me to genetics - DNA, genes, chromosomes, and how information is passed between cells? Please start with a diagnostic question.",
      },
    ],
    10: [
      {
        emoji: '🧬',
        title: 'DNA & Inheritance',
        description: 'Punnett squares, dominant and recessive alleles',
        prompt: "I'm a Year 10 Science student. Can you help me understand DNA inheritance - including how to use Punnett squares and the difference between dominant and recessive alleles? Please start with a diagnostic question.",
      },
      {
        emoji: '⚗️',
        title: 'Stoichiometry',
        description: 'Moles, molar mass and reacting quantities',
        prompt: "I'm a Year 10 Science student. Can you help me with stoichiometry - calculating moles, molar mass, and reacting quantities in chemical reactions? Please start with a diagnostic question.",
      },
      {
        emoji: '🌊',
        title: 'Momentum & Waves',
        description: 'Conservation of momentum, wave properties and EM spectrum',
        prompt: "I'm a Year 10 Science student. Can you help me understand momentum and waves - including conservation of momentum and the properties of the electromagnetic spectrum? Please start with a diagnostic question.",
      },
    ],
  },
};
