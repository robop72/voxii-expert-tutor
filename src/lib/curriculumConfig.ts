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

// ─── Centralized config: Subject → YearLevel → pool of 12 cards ──────────────
// StarterCards picks 3 randomly from the pool each mount for variety.

export const starterCardsConfig: Record<Subject, Record<YearLevel, StarterCard[]>> = {

  Maths: {
    7: [
      { emoji: '🍕', title: 'Mastering Fractions', description: 'Add, subtract, multiply and divide fractions', prompt: "I'm a Year 7 Maths student. Can you help me understand fractions - how to add, subtract, multiply and divide them?" },
      { emoji: '🕵️', title: 'Intro to Algebra', description: 'Variables, expressions and simple equations', prompt: "I'm a Year 7 Maths student. I'd like to learn what algebra is and how variables and expressions work." },
      { emoji: '📐', title: 'Angles & Shapes', description: 'Perimeter, area, angles and 2D geometry', prompt: "I'm a Year 7 Maths student. Can you help me with angles and 2D shapes - including perimeter and area?" },
      { emoji: '💯', title: 'Percentages & Ratios', description: 'Find percentages of amounts and compare ratios', prompt: "I'm a Year 7 Maths student. Can you help me understand percentages and ratios - how to calculate them and use them to compare quantities?" },
      { emoji: '🌡️', title: 'Negative Numbers', description: 'Add, subtract and order negative numbers', prompt: "I'm a Year 7 Maths student. Can you help me understand negative numbers - how to add, subtract, and put them in order?" },
      { emoji: '📊', title: 'Data & Statistics', description: 'Mean, median, mode and range', prompt: "I'm a Year 7 Maths student. Can you teach me about data and statistics - mean, median, mode, and range - and when to use each one?" },
      { emoji: '🔢', title: 'Decimals', description: 'Place value, ordering and operations with decimals', prompt: "I'm a Year 7 Maths student. Can you help me with decimals - understanding place value, ordering them, and performing operations?" },
      { emoji: '🧮', title: 'Prime Numbers & Factors', description: 'Prime factorisation, HCF and LCM', prompt: "I'm a Year 7 Maths student. Can you help me understand prime numbers, prime factorisation, and how to find HCF and LCM?" },
      { emoji: '🗺️', title: 'Coordinates & Graphing', description: 'Plot and read points on the Cartesian plane', prompt: "I'm a Year 7 Maths student. Can you help me understand the Cartesian plane - how to plot and read coordinates in all four quadrants?" },
      { emoji: '⏱️', title: 'Time & Measurement', description: 'Converting units and reading 24-hour time', prompt: "I'm a Year 7 Maths student. Can you help me with time and measurement - converting between units and reading 24-hour time?" },
      { emoji: '🔁', title: 'Patterns & Sequences', description: 'Find the rule in number patterns', prompt: "I'm a Year 7 Maths student. Can you help me identify and extend number patterns and find the rule behind a sequence?" },
      { emoji: '🎲', title: 'Intro to Probability', description: 'Likelihood and simple chance events', prompt: "I'm a Year 7 Maths student. Can you introduce me to probability - what likelihood means and how to calculate simple chance events?" },
    ],
    8: [
      { emoji: '💡', title: 'Index Laws', description: 'Multiply and divide powers with confidence', prompt: "I'm a Year 8 Maths student. Can you teach me the index laws - how to multiply, divide, and raise powers to powers?" },
      { emoji: '➗', title: 'Linear Equations', description: 'Solve one- and two-step equations', prompt: "I'm a Year 8 Maths student. Can you help me solve linear equations step by step?" },
      { emoji: '📐', title: "Pythagoras' Theorem", description: 'Find missing sides in right-angled triangles', prompt: "I'm a Year 8 Maths student. Can you teach me Pythagoras' theorem and show me how to use it to find missing sides?" },
      { emoji: '💸', title: 'Percentages in Real Life', description: 'GST, discounts, profit, loss and percentage change', prompt: "I'm a Year 8 Maths student. Can you help me apply percentages to real situations - like GST, discounts, profit and loss, and percentage change?" },
      { emoji: '📈', title: 'Graphing Linear Equations', description: 'Plot y = mx + c — gradient and y-intercept', prompt: "I'm a Year 8 Maths student. Can you help me graph linear equations - understanding gradient, y-intercept, and plotting y = mx + c?" },
      { emoji: '🧊', title: 'Area & Volume', description: 'Circles, cylinders, prisms and composite shapes', prompt: "I'm a Year 8 Maths student. Can you help me calculate area and volume for circles, cylinders, prisms and composite shapes?" },
      { emoji: '📦', title: 'Expanding Brackets', description: 'Distributive law and collecting like terms', prompt: "I'm a Year 8 Maths student. Can you help me expand brackets using the distributive law and collect like terms?" },
      { emoji: '↔️', title: 'Inequalities', description: 'Solve and graph inequalities on a number line', prompt: "I'm a Year 8 Maths student. Can you help me solve inequalities and show me how to graph them on a number line?" },
      { emoji: '⚡', title: 'Rates & Proportions', description: 'Unit rates, direct proportion and scaling', prompt: "I'm a Year 8 Maths student. Can you help me understand rates and direct proportion - including unit rates and scaling?" },
      { emoji: '🌲', title: 'Probability & Tree Diagrams', description: 'Two-step events and sample spaces', prompt: "I'm a Year 8 Maths student. Can you help me use tree diagrams to work out the probability of two-step events?" },
      { emoji: '📉', title: 'Data Representations', description: 'Histograms, dot plots and stem-and-leaf', prompt: "I'm a Year 8 Maths student. Can you help me read and construct histograms, dot plots, and stem-and-leaf plots?" },
      { emoji: '🧱', title: 'Surface Area', description: 'Nets and surface area of prisms and cylinders', prompt: "I'm a Year 8 Maths student. Can you help me calculate surface area by using nets for prisms and cylinders?" },
    ],
    9: [
      { emoji: '🧩', title: 'Factorising Quadratics', description: 'Expand and factorise expressions like a² − 5a + 6', prompt: "I'm a Year 9 Maths student. Can you help me understand how to factorise quadratic expressions?" },
      { emoji: '⚖️', title: 'Simultaneous Equations', description: 'Solve systems of two equations - substitution & elimination', prompt: "I'm a Year 9 Maths student. Can you help me solve simultaneous equations using substitution and elimination?" },
      { emoji: '📐', title: 'Trigonometry', description: 'SOH CAH TOA - find sides and angles in right triangles', prompt: "I'm a Year 9 Maths student. Can you teach me trigonometry - SOH CAH TOA - and how to find missing sides and angles?" },
      { emoji: '√', title: 'Surds & Indices', description: 'Simplify surds, negative and fractional indices', prompt: "I'm a Year 9 Maths student. Can you help me simplify surds and work with negative and fractional indices?" },
      { emoji: '🎲', title: 'Probability', description: 'Theoretical vs experimental, combined events', prompt: "I'm a Year 9 Maths student. Can you help me understand probability - the difference between theoretical and experimental, and how to work out combined events?" },
      { emoji: '🔵', title: 'Scatter Plots & Statistics', description: 'Correlation, lines of best fit and data analysis', prompt: "I'm a Year 9 Maths student. Can you help me understand scatter plots - how to identify correlation and draw lines of best fit?" },
      { emoji: '↕️', title: 'Linear Inequalities', description: 'Solve and graph on number lines', prompt: "I'm a Year 9 Maths student. Can you help me solve linear inequalities and represent the solutions on a number line?" },
      { emoji: '📉', title: 'Gradient & Rate of Change', description: 'Steepness, real-world rates and average rates', prompt: "I'm a Year 9 Maths student. Can you help me understand gradient as a rate of change, including real-world applications?" },
      { emoji: '⭕', title: 'Circle Calculations', description: 'Arc length and sector area', prompt: "I'm a Year 9 Maths student. Can you help me calculate arc length and sector area in circles?" },
      { emoji: '🌀', title: 'Non-Linear Relationships', description: 'Parabolas, hyperbolas and exponentials', prompt: "I'm a Year 9 Maths student. Can you introduce me to non-linear graphs - parabolas, hyperbolas and exponential curves?" },
      { emoji: '🏦', title: 'Financial Maths', description: 'Simple vs compound interest and budgeting', prompt: "I'm a Year 9 Maths student. Can you help me understand simple and compound interest and how they're used in real life?" },
      { emoji: '📊', title: 'Two-Way Tables', description: 'Conditional probability and relative frequency', prompt: "I'm a Year 9 Maths student. Can you help me read and interpret two-way tables, including how to find conditional probability?" },
    ],
    10: [
      { emoji: '📈', title: 'Quadratic Formula', description: 'Solve any quadratic with the formula and discriminant', prompt: "I'm a Year 10 Maths student. Can you help me use the quadratic formula to solve quadratic equations, including understanding the discriminant?" },
      { emoji: '🔺', title: 'Sine & Cosine Rule', description: 'Solve non-right triangles in any situation', prompt: "I'm a Year 10 Maths student. Can you teach me the sine rule and cosine rule for solving non-right-angled triangles?" },
      { emoji: '📊', title: 'Standard Deviation', description: 'Measure spread in data - calculate and interpret σ', prompt: "I'm a Year 10 Maths student. Can you help me understand standard deviation - what it means and how to calculate it?" },
      { emoji: '🌀', title: 'Functions & Graphs', description: 'Quadratic, exponential and hyperbolic functions', prompt: "I'm a Year 10 Maths student. Can you help me understand different types of functions and their graphs - including quadratic, exponential and hyperbolic?" },
      { emoji: '⭕', title: 'Circle Geometry', description: 'Chord, tangent and arc theorems', prompt: "I'm a Year 10 Maths student. Can you teach me circle geometry - the theorems involving chords, tangents and arcs?" },
      { emoji: '🏦', title: 'Financial Maths', description: 'Compound interest, loans and depreciation', prompt: "I'm a Year 10 Maths student. Can you help me understand financial maths - compound interest, loan repayments, and depreciation?" },
      { emoji: 'log', title: 'Logarithms', description: 'Log definition, log laws and solving equations', prompt: "I'm a Year 10 Maths student. Can you introduce me to logarithms - what they are, the log laws, and how to solve log equations?" },
      { emoji: '🎵', title: 'Trigonometric Graphs', description: 'Sine, cosine and tangent curves - period and amplitude', prompt: "I'm a Year 10 Maths student. Can you help me understand trigonometric graphs - the shapes of sin, cos and tan curves, and what period and amplitude mean?" },
      { emoji: '🔗', title: 'Sequences & Series', description: 'Arithmetic and geometric progressions', prompt: "I'm a Year 10 Maths student. Can you help me understand arithmetic and geometric sequences and series - including finding the nth term and sum formulas?" },
      { emoji: '🧮', title: 'Polynomials', description: 'Factor theorem and dividing polynomials', prompt: "I'm a Year 10 Maths student. Can you help me work with polynomials - including the factor theorem and polynomial long division?" },
      { emoji: '📦', title: 'Rational Expressions', description: 'Simplify and operate on algebraic fractions', prompt: "I'm a Year 10 Maths student. Can you help me simplify and operate with rational (algebraic fraction) expressions?" },
      { emoji: '🧭', title: 'Vectors (Intro)', description: 'Magnitude, direction and adding vectors', prompt: "I'm a Year 10 Maths student. Can you introduce me to vectors - what they are, how to find magnitude and direction, and how to add them?" },
    ],
  },

  English: {
    7: [
      { emoji: '📖', title: 'Short Stories & Poetry', description: 'Identify text features and respond to creative writing', prompt: "I'm a Year 7 English student. Can you help me analyse a short story or poem - looking at its key features and ideas?" },
      { emoji: '✍️', title: 'Poetic Devices', description: 'Simile, metaphor, alliteration, personification', prompt: "I'm a Year 7 English student. Can you teach me the main poetic devices - like simile, metaphor, alliteration, and personification - with examples?" },
      { emoji: '📝', title: 'TEEL Paragraphs', description: 'Write structured Topic–Explanation–Evidence–Link paragraphs', prompt: "I'm a Year 7 English student. Can you help me learn how to write a TEEL paragraph - Topic, Explanation, Evidence, Link?" },
      { emoji: '🎨', title: 'Narrative Writing', description: 'Character, setting, plot and conflict', prompt: "I'm a Year 7 English student. Can you help me write a narrative - covering how to build character, setting, plot and conflict?" },
      { emoji: '🔍', title: 'Comprehension Skills', description: 'Finding main ideas, inference and purpose', prompt: "I'm a Year 7 English student. Can you help me improve my reading comprehension - how to find main ideas, make inferences, and understand a writer's purpose?" },
      { emoji: '✏️', title: 'Punctuation & Grammar', description: 'Commas, apostrophes and complex sentences', prompt: "I'm a Year 7 English student. Can you help me with punctuation and grammar - especially using commas, apostrophes, and writing complex sentences?" },
      { emoji: '📋', title: 'Report Writing', description: 'Structure, tone and presenting information clearly', prompt: "I'm a Year 7 English student. Can you help me write a clear information report - including the right structure and formal tone?" },
      { emoji: '🌈', title: 'Descriptive Writing', description: 'Sensory details and show-don\'t-tell techniques', prompt: "I'm a Year 7 English student. Can you help me write descriptively - using sensory details and showing rather than telling?" },
      { emoji: '🎬', title: 'Dialogue & Characterisation', description: 'How speech reveals character and moves the plot', prompt: "I'm a Year 7 English student. Can you help me write effective dialogue and explain how speech can reveal character?" },
      { emoji: '📰', title: 'News Articles', description: 'Inverted pyramid, headlines and lead sentences', prompt: "I'm a Year 7 English student. Can you teach me how news articles are written - the inverted pyramid structure, strong headlines and lead sentences?" },
      { emoji: '🤔', title: 'Fact vs Opinion', description: 'Identifying bias and purpose in non-fiction texts', prompt: "I'm a Year 7 English student. Can you help me tell the difference between fact and opinion in non-fiction texts, and understand how bias works?" },
      { emoji: '📚', title: 'Book Reviews', description: 'Summarise, evaluate and recommend a book', prompt: "I'm a Year 7 English student. Can you show me how to write a book review - summarising the plot, evaluating the book, and making a recommendation?" },
    ],
    8: [
      { emoji: '📚', title: 'Analysing Novels', description: 'Theme, character, perspective and context', prompt: "I'm a Year 8 English student. Can you help me analyse a novel - looking at theme, characterisation, and perspective?" },
      { emoji: '🗣️', title: 'Persuasive Writing', description: 'Construct arguments with evidence and persuasive techniques', prompt: "I'm a Year 8 English student. Can you help me write a persuasive essay - building a clear argument with evidence and persuasive techniques?" },
      { emoji: '🎭', title: 'Literary Devices', description: 'Irony, foreshadowing, symbolism and more', prompt: "I'm a Year 8 English student. Can you teach me literary devices - like irony, foreshadowing, and symbolism - and how to identify them in texts?" },
      { emoji: '📋', title: 'Text Types', description: 'Purpose and structure of reports, procedures, discussions', prompt: "I'm a Year 8 English student. Can you help me understand different text types - like reports, procedures and discussions - including their purpose and structure?" },
      { emoji: '👁️', title: 'Point of View', description: 'First and third person narration and bias', prompt: "I'm a Year 8 English student. Can you explain point of view in literature - the difference between first and third person narration, and how bias can shape a text?" },
      { emoji: '💬', title: 'Vocabulary & Diction', description: 'Connotation, register and word choice effects', prompt: "I'm a Year 8 English student. Can you help me understand how word choice affects meaning - including connotation, register, and the effect of specific diction on the reader?" },
      { emoji: '🎪', title: 'Drama & Scripts', description: 'Stage directions, dialogue and character motivation', prompt: "I'm a Year 8 English student. Can you help me understand how to read and analyse a play script - including stage directions and character motivation?" },
      { emoji: '🏛️', title: 'Debate Structure', description: 'Affirmative, negative, rebuttals and summaries', prompt: "I'm a Year 8 English student. Can you explain how a formal debate is structured - roles, rebuttals, and how to build a strong argument?" },
      { emoji: '🪞', title: 'Personal Narratives', description: 'Voice, audience and first-person reflection', prompt: "I'm a Year 8 English student. Can you help me write a personal narrative - with a strong first-person voice and reflective depth?" },
      { emoji: '📺', title: 'Media Texts', description: 'Advertising techniques and visual language', prompt: "I'm a Year 8 English student. Can you help me analyse media texts - including how advertising techniques and visual language are used to influence audiences?" },
      { emoji: '✂️', title: 'Editing a Draft', description: 'Improve writing for clarity, style and correctness', prompt: "I'm a Year 8 English student. Can you help me learn how to edit a piece of writing - checking for clarity, varied sentence structure and common errors?" },
      { emoji: '🔤', title: 'Spelling Strategies', description: 'Common patterns, rules and tricky words', prompt: "I'm a Year 8 English student. Can you help me improve my spelling - including common patterns, prefixes and suffixes, and tricky words?" },
    ],
    9: [
      { emoji: '📝', title: 'Analytical Essays', description: 'Multi-paragraph essays with sustained argument', prompt: "I'm a Year 9 English student. Can you help me write a strong multi-paragraph analytical essay with a clear, sustained argument?" },
      { emoji: '🎭', title: 'Advanced Literary Devices', description: 'Irony, symbolism, foreshadowing - and their effects', prompt: "I'm a Year 9 English student. Can you teach me advanced literary devices - including irony, symbolism, and foreshadowing - and how to discuss their effect on the reader?" },
      { emoji: '🗣️', title: 'Persuasive Techniques', description: 'Rhetorical questions, emotive language, rule of three', prompt: "I'm a Year 9 English student. Can you teach me the persuasive language techniques used in texts - like rhetorical questions, emotive language, and the rule of three?" },
      { emoji: '🌐', title: 'Context & Themes', description: 'How historical and social context shapes meaning', prompt: "I'm a Year 9 English student. Can you help me understand how the historical and social context of a text shapes its themes and meaning?" },
      { emoji: '🎙️', title: 'Speeches & Oral Techniques', description: 'Ethos, pathos, logos and persuasive tone', prompt: "I'm a Year 9 English student. Can you help me analyse speeches - including how ethos, pathos, and logos work, and how tone influences an audience?" },
      { emoji: '🏗️', title: 'Narrative Structure', description: 'Exposition, rising action, climax and resolution', prompt: "I'm a Year 9 English student. Can you explain narrative structure - the stages from exposition through to resolution - and how writers use structure for effect?" },
      { emoji: '🔎', title: 'Research Essays', description: 'Source evaluation, citation and paraphrasing', prompt: "I'm a Year 9 English student. Can you help me write a research essay - how to evaluate sources, cite correctly and paraphrase without plagiarising?" },
      { emoji: '🎥', title: 'Film Analysis', description: 'Camera angles, lighting, sound and editing', prompt: "I'm a Year 9 English student. Can you help me analyse film - including how camera angles, lighting, sound and editing are used to create meaning?" },
      { emoji: '🌆', title: 'Dystopian Fiction', description: 'Themes, world-building and social commentary', prompt: "I'm a Year 9 English student. Can you help me analyse dystopian fiction - understanding its themes, world-building techniques and what it says about society?" },
      { emoji: '🖊️', title: 'Creative Non-Fiction', description: 'Memoir, feature articles and travel writing', prompt: "I'm a Year 9 English student. Can you help me write creative non-fiction - like memoir or feature articles - using narrative techniques in factual writing?" },
      { emoji: '🔤', title: 'Language Evolution', description: 'How language changes over time - slang and register', prompt: "I'm a Year 9 English student. Can you explore with me how language changes over time - including slang, register, and why language evolves?" },
      { emoji: '✂️', title: 'Editing & Proofreading', description: 'Improve a draft for clarity, cohesion and style', prompt: "I'm a Year 9 English student. Can you help me learn how to effectively edit and proofread a draft for clarity, cohesion and style?" },
    ],
    10: [
      { emoji: '📚', title: 'Comparative Analysis', description: 'Compare two texts - themes, context and techniques', prompt: "I'm a Year 10 English student. Can you help me write a comparative analysis of two texts, looking at shared themes, contexts, and techniques?" },
      { emoji: '🖊️', title: 'Authorial Intent', description: 'Why does an author make particular choices?', prompt: "I'm a Year 10 English student. Can you help me analyse authorial intent - understanding why a writer makes specific structural, language, and stylistic choices?" },
      { emoji: '🎓', title: 'VCE Preparation', description: 'Text response and language analysis for senior English', prompt: "I'm a Year 10 English student preparing for VCE. Can you help me understand the demands of senior English - especially text response and language analysis essays?" },
      { emoji: '🔎', title: 'Close Reading', description: 'Analyse language, tone and structure in short passages', prompt: "I'm a Year 10 English student. Can you help me practise close reading - analysing language choices, tone, and structural features in a short passage?" },
      { emoji: '😏', title: 'Satire & Tone', description: 'How satire, irony and humour convey meaning', prompt: "I'm a Year 10 English student. Can you help me understand satire and tone - how writers use irony and humour to convey serious meaning?" },
      { emoji: '🖋️', title: 'Creating Texts', description: 'Imaginative and expository writing for senior assessments', prompt: "I'm a Year 10 English student. Can you help me create high-quality imaginative or expository texts suitable for senior English assessments?" },
      { emoji: '🖼️', title: 'Multimodal Texts', description: 'Images, layout, typography and how they make meaning', prompt: "I'm a Year 10 English student. Can you help me analyse multimodal texts - how images, layout and typography work alongside words to create meaning?" },
      { emoji: '🔡', title: 'Stylistic Choices', description: 'Sentence length, syntax and rhythm in prose', prompt: "I'm a Year 10 English student. Can you help me analyse an author's stylistic choices - including sentence length, syntax and rhythm - and their effect on the reader?" },
      { emoji: '🏛️', title: 'Power & Politics in Literature', description: 'How texts reflect social structures and ideologies', prompt: "I'm a Year 10 English student. Can you help me analyse how texts reflect power, politics and social structures - including class, gender and identity?" },
      { emoji: '📜', title: 'Unseen Poetry', description: 'Approaching and analysing an unfamiliar poem', prompt: "I'm a Year 10 English student. Can you give me strategies for analysing an unseen poem I've never read before - including structure, language and meaning?" },
      { emoji: '🎤', title: 'Monologue Writing', description: 'Dramatic voice and character interiority', prompt: "I'm a Year 10 English student. Can you help me write a dramatic monologue - developing a strong character voice and exploring their inner thoughts?" },
      { emoji: '📖', title: 'Research & Referencing', description: 'APA/Harvard style and academic writing conventions', prompt: "I'm a Year 10 English student. Can you help me understand academic referencing - how to cite sources correctly in APA or Harvard style and avoid plagiarism?" },
    ],
  },

  Science: {
    7: [
      { emoji: '🔬', title: 'Cell Structure', description: 'Parts of a cell and their functions - plant vs animal', prompt: "I'm a Year 7 Science student. Can you help me understand cell structure - what are the key parts of plant and animal cells and what do they do?" },
      { emoji: '🚀', title: 'Forces & Motion', description: 'Contact and non-contact forces, balanced vs unbalanced', prompt: "I'm a Year 7 Science student. Can you explain forces and motion - the difference between contact and non-contact forces, and what balanced and unbalanced forces do?" },
      { emoji: '🌍', title: 'The Solar System', description: 'Planets, the sun, moons and the scale of space', prompt: "I'm a Year 7 Science student. Can you help me understand the solar system - the planets, the sun, and how it all fits together?" },
      { emoji: '🦁', title: 'Classification', description: 'Taxonomy, kingdoms and how scientists classify life', prompt: "I'm a Year 7 Science student. Can you explain how scientists classify living things - including taxonomy, kingdoms, and how we group organisms?" },
      { emoji: '🧪', title: 'Mixtures & Separation', description: 'Solutions, suspensions, filtering and evaporation', prompt: "I'm a Year 7 Science student. Can you help me understand mixtures and how to separate them - including solutions, suspensions, filtering, and evaporation?" },
      { emoji: '🌋', title: "Earth's Layers", description: 'Crust, mantle, core and geological processes', prompt: "I'm a Year 7 Science student. Can you explain Earth's internal structure - the crust, mantle, and core - and some of the geological processes they drive?" },
      { emoji: '🌱', title: 'Photosynthesis', description: 'How plants make food using sunlight and CO₂', prompt: "I'm a Year 7 Science student. Can you explain photosynthesis - how plants use sunlight, water and carbon dioxide to make food?" },
      { emoji: '⚙️', title: 'Simple Machines', description: 'Levers, pulleys, gears and mechanical advantage', prompt: "I'm a Year 7 Science student. Can you help me understand simple machines - levers, pulleys and gears - and what mechanical advantage means?" },
      { emoji: '🌦️', title: 'Weather & Climate', description: 'Water cycle, weather patterns and climate zones', prompt: "I'm a Year 7 Science student. Can you help me understand weather and climate - the water cycle, weather patterns, and how climate zones differ?" },
      { emoji: '💡', title: 'Light & Optics', description: 'Reflection, refraction and how shadows form', prompt: "I'm a Year 7 Science student. Can you explain how light behaves - including reflection, refraction and how shadows are formed?" },
      { emoji: '🥦', title: 'Nutrition & Digestion', description: 'Food groups, nutrients and the digestive system', prompt: "I'm a Year 7 Science student. Can you help me understand nutrition and digestion - what nutrients we need and how the digestive system processes food?" },
      { emoji: '🧲', title: 'Magnets', description: 'Magnetic fields, poles and everyday applications', prompt: "I'm a Year 7 Science student. Can you explain magnets - how magnetic fields work, what poles are, and where we use magnets in everyday life?" },
    ],
    8: [
      { emoji: '❤️', title: 'Body Systems', description: 'Digestive, circulatory and respiratory systems', prompt: "I'm a Year 8 Science student. Can you help me understand the main body systems - digestive, circulatory, and respiratory - and how they work together?" },
      { emoji: '⚗️', title: 'Atoms & Elements', description: 'Atomic structure, the periodic table, and compounds', prompt: "I'm a Year 8 Science student. Can you explain atoms, elements, and the periodic table - including how atoms combine to form compounds?" },
      { emoji: '⚡', title: 'Energy Transfer', description: 'Forms of energy, conduction, convection and radiation', prompt: "I'm a Year 8 Science student. Can you help me understand the different forms of energy and how energy is transferred - including conduction, convection, and radiation?" },
      { emoji: '🌿', title: 'Ecosystems', description: 'Food webs, biodiversity and human impact', prompt: "I'm a Year 8 Science student. Can you help me understand ecosystems - how food webs work, why biodiversity matters, and how humans impact the environment?" },
      { emoji: '🍋', title: 'Acids & Bases', description: 'pH scale, neutralisation and everyday reactions', prompt: "I'm a Year 8 Science student. Can you explain acids and bases - the pH scale, how neutralisation works, and some common examples?" },
      { emoji: '🔌', title: 'Electricity & Circuits', description: 'Series and parallel circuits, resistance and current', prompt: "I'm a Year 8 Science student. Can you help me understand electric circuits - the difference between series and parallel, and how current, voltage and resistance relate?" },
      { emoji: '🌱', title: 'Reproduction', description: 'Sexual vs asexual, plant and animal reproduction', prompt: "I'm a Year 8 Science student. Can you explain reproduction - the difference between sexual and asexual reproduction, and how it works in plants and animals?" },
      { emoji: '🔥', title: 'Chemical vs Physical Change', description: 'How to identify and explain each type', prompt: "I'm a Year 8 Science student. Can you help me understand the difference between chemical and physical changes - and how to identify each?" },
      { emoji: '🔊', title: 'Sound', description: 'Vibrations, wave properties, pitch and volume', prompt: "I'm a Year 8 Science student. Can you explain sound - how it travels as a wave, what affects pitch and volume, and how our ears detect it?" },
      { emoji: '🪨', title: 'Rock Cycle', description: 'Igneous, sedimentary, metamorphic and how rocks form', prompt: "I'm a Year 8 Science student. Can you explain the rock cycle - how igneous, sedimentary and metamorphic rocks form and change over time?" },
      { emoji: '🧪', title: 'The Periodic Table', description: 'Groups, periods, metals and non-metals', prompt: "I'm a Year 8 Science student. Can you help me understand the periodic table in more depth - groups, periods, and trends in properties?" },
      { emoji: '🌊', title: 'Human Impact on Ecosystems', description: 'Pollution, habitat loss and sustainability', prompt: "I'm a Year 8 Science student. Can you help me understand how humans impact ecosystems - including pollution, habitat loss and what sustainability means?" },
    ],
    9: [
      { emoji: '⚛️', title: 'Atomic Structure', description: 'Protons, neutrons, electrons - Bohr model and isotopes', prompt: "I'm a Year 9 Science student. Can you explain atomic structure - protons, neutrons, electrons, the Bohr model, and isotopes?" },
      { emoji: '⚗️', title: 'Chemical Equations', description: 'Write and balance chemical equations for reactions', prompt: "I'm a Year 9 Science student. Can you help me write and balance chemical equations?" },
      { emoji: '🧬', title: 'Intro to Genetics', description: 'DNA, genes, chromosomes and cell division', prompt: "I'm a Year 9 Science student. Can you introduce me to genetics - DNA, genes, chromosomes, and how information is passed between cells?" },
      { emoji: '🏃', title: "Newton's Laws", description: 'Apply all three laws to real-world situations', prompt: "I'm a Year 9 Science student. Can you help me understand Newton's three laws of motion and how to apply them to real-world examples?" },
      { emoji: '🦋', title: 'Evolution & Adaptation', description: 'Natural selection, variation and how species change', prompt: "I'm a Year 9 Science student. Can you explain evolution - how natural selection works, what variation is, and how species adapt over time?" },
      { emoji: '🧫', title: 'Acids, Bases & Salts', description: 'Reactions, indicators, pH and neutralisation', prompt: "I'm a Year 9 Science student. Can you help me understand acids, bases and salts in more depth - including reactions, indicators, pH and neutralisation?" },
      { emoji: '☢️', title: 'Radioactivity', description: 'Alpha, beta, gamma radiation and half-life', prompt: "I'm a Year 9 Science student. Can you explain radioactivity - the types of radiation, what half-life means, and how radioactive decay works?" },
      { emoji: '🌏', title: 'Plate Tectonics', description: 'Continental drift, earthquakes and volcanoes', prompt: "I'm a Year 9 Science student. Can you explain plate tectonics - how continental drift works and how it causes earthquakes and volcanoes?" },
      { emoji: '🌿', title: 'Photosynthesis & Respiration', description: 'Equations, rate factors and energy flow', prompt: "I'm a Year 9 Science student. Can you help me compare photosynthesis and respiration - their equations, what affects their rates, and how energy flows through living things?" },
      { emoji: '⚡', title: 'Electrical Energy', description: 'Power, voltage, current, resistance and Ohm's Law', prompt: "I'm a Year 9 Science student. Can you help me understand electrical energy - how power, voltage, current and resistance are related, including Ohm's Law?" },
      { emoji: '🌌', title: 'Space Science', description: 'Stars, galaxies, the Big Bang and the expanding universe', prompt: "I'm a Year 9 Science student. Can you help me understand space science - how stars and galaxies form, what the Big Bang theory says, and evidence for an expanding universe?" },
      { emoji: '🧬', title: 'Biotechnology', description: 'GMOs, cloning and medical applications of genetics', prompt: "I'm a Year 9 Science student. Can you introduce me to biotechnology - including genetically modified organisms, cloning, and how genetics is used in medicine?" },
    ],
    10: [
      { emoji: '🧬', title: 'DNA & Inheritance', description: 'Punnett squares, dominant and recessive alleles', prompt: "I'm a Year 10 Science student. Can you help me understand DNA inheritance - including how to use Punnett squares and the difference between dominant and recessive alleles?" },
      { emoji: '⚗️', title: 'Stoichiometry', description: 'Moles, molar mass and reacting quantities', prompt: "I'm a Year 10 Science student. Can you help me with stoichiometry - calculating moles, molar mass, and reacting quantities in chemical reactions?" },
      { emoji: '🌊', title: 'Momentum & Waves', description: 'Conservation of momentum, wave properties and EM spectrum', prompt: "I'm a Year 10 Science student. Can you help me understand momentum and waves - including conservation of momentum and the properties of the electromagnetic spectrum?" },
      { emoji: '🌡️', title: 'Climate Science', description: 'Greenhouse effect, carbon cycle and human impact', prompt: "I'm a Year 10 Science student. Can you help me understand climate science - the greenhouse effect, the carbon cycle, and how human activity is changing Earth's climate?" },
      { emoji: '🛢️', title: 'Organic Chemistry', description: 'Hydrocarbons, functional groups and reactions', prompt: "I'm a Year 10 Science student. Can you introduce me to organic chemistry - hydrocarbons, functional groups, and the basic reactions they undergo?" },
      { emoji: '🦖', title: 'Evolution & Speciation', description: 'Evidence for evolution and how new species form', prompt: "I'm a Year 10 Science student. Can you help me understand evolution and speciation - what the evidence is for evolution and how new species form over time?" },
      { emoji: '🔥', title: 'Thermochemistry', description: 'Exothermic vs endothermic reactions and energy diagrams', prompt: "I'm a Year 10 Science student. Can you help me understand thermochemistry - the difference between exothermic and endothermic reactions and how to read energy diagrams?" },
      { emoji: '🧲', title: 'Electromagnetism', description: 'Motors, generators, transformers and induction', prompt: "I'm a Year 10 Science student. Can you explain electromagnetism - how motors, generators and transformers work, and what electromagnetic induction is?" },
      { emoji: '🌿', title: 'Ecosystems & Sustainability', description: 'Carrying capacity, trophic levels and conservation', prompt: "I'm a Year 10 Science student. Can you help me understand ecosystem dynamics - carrying capacity, trophic levels, and conservation strategies?" },
      { emoji: '🔬', title: 'Nanotechnology', description: 'Properties of nanomaterials and real-world applications', prompt: "I'm a Year 10 Science student. Can you introduce me to nanotechnology - what makes nanomaterials special and how they're used in medicine, materials and electronics?" },
      { emoji: '🚀', title: 'Space Exploration', description: 'Rockets, satellites and missions beyond Earth', prompt: "I'm a Year 10 Science student. Can you help me understand the science behind space exploration - rockets, satellites, current missions and the challenges of deep space travel?" },
      { emoji: '☢️', title: 'Nuclear Energy', description: 'Fission, fusion, advantages and risks', prompt: "I'm a Year 10 Science student. Can you explain nuclear energy - the difference between fission and fusion, how nuclear power works, and its advantages and risks?" },
    ],
  },
};
