/** A scoring factor — fully dynamic, can be added/removed/renamed */
export type FactorDef = {
  id: string;
  label: string;
  definition: string;
  /** How base and fruit profiles blend for this factor. Default "standard". */
  blendMode?: "standard" | "cultural" | "base-only";
};

/** Profile is just a bag of factor scores keyed by factor id */
export type FactorMap = Record<string, number>;

export type CountryOption = {
  id: string;
  label: string;
  profile: FactorMap;
};

export type GelatoBase = {
  id: string;
  label: string;
  profile: FactorMap;
};

export type FruitOption = {
  id: string;
  label: string;
  profile: FactorMap;
};

export type StrategyPreset = {
  id: string;
  label: string;
  weights: FactorMap;
  summary: string;
};

// ─── Default factor definitions ─────────────────────────────────

export const defaultFactorDefs: FactorDef[] = [
  { id: "cream", label: "Cream", definition: "How rich and dairy-led the concept feels.", blendMode: "base-only" },
  { id: "fruit", label: "Fruit", definition: "How clearly the concept reads as fruit-forward." },
  { id: "refreshing", label: "Refreshing", definition: "How strongly the product fits hot climates and light dessert demand." },
  { id: "health", label: "Health", definition: "How much the concept signals lighter, cleaner, wellness-oriented appeal." },
  { id: "premium", label: "Premium", definition: "How strongly the concept supports upscale pricing and gifting cues." },
  { id: "culturalFit", label: "Cultural Fit", definition: "How aligned the flavor feels with local taste culture.", blendMode: "cultural" },
  { id: "exoticAppetite", label: "Exotic Appetite", definition: "How open the market is to novel imported fruit flavors.", blendMode: "cultural" },
];

// ─── Helpers ────────────────────────────────────────────────────

/** Build a profile with all factors set to a default value */
export const buildEmptyProfile = (factorDefs: FactorDef[], defaultValue = 3): FactorMap =>
  Object.fromEntries(factorDefs.map((f) => [f.id, defaultValue]));

/** Build a weights map with all factors set to 1 */
export const buildDefaultWeights = (factorDefs: FactorDef[]): FactorMap =>
  Object.fromEntries(factorDefs.map((f) => [f.id, 1]));

/** Get label for a factor id, falling back to the id itself */
export const getFactorLabel = (factorDefs: FactorDef[], id: string): string =>
  factorDefs.find((f) => f.id === id)?.label ?? id;

/** Get definition for a factor id */
export const getFactorDefinition = (factorDefs: FactorDef[], id: string): string =>
  factorDefs.find((f) => f.id === id)?.definition ?? "";

// ─── Default data ───────────────────────────────────────────────

export const countries: CountryOption[] = [
  {
    id: "uae",
    label: "UAE",
    profile: { cream: 3, fruit: 4, refreshing: 5, health: 3, premium: 4, culturalFit: 3, exoticAppetite: 4 },
  },
  {
    id: "germany",
    label: "Germany",
    profile: { cream: 5, fruit: 3, refreshing: 2, health: 3, premium: 4, culturalFit: 4, exoticAppetite: 2 },
  },
  {
    id: "singapore",
    label: "Singapore",
    profile: { cream: 3, fruit: 5, refreshing: 4, health: 4, premium: 5, culturalFit: 4, exoticAppetite: 4 },
  },
  {
    id: "poland",
    label: "Poland",
    profile: { cream: 4, fruit: 3, refreshing: 2, health: 2, premium: 2, culturalFit: 3, exoticAppetite: 2 },
  },
];

export const gelatoBases: GelatoBase[] = [
  {
    id: "sorbet",
    label: "Sorbet",
    profile: { cream: 1, fruit: 5, refreshing: 5, health: 5, premium: 3, culturalFit: 3, exoticAppetite: 4 },
  },
  {
    id: "premium-fruit-gelato",
    label: "Premium Fruit Gelato",
    profile: { cream: 3, fruit: 4, refreshing: 4, health: 4, premium: 5, culturalFit: 4, exoticAppetite: 3 },
  },
  {
    id: "vegan-gelato",
    label: "Vegan Gelato",
    profile: { cream: 2, fruit: 4, refreshing: 4, health: 5, premium: 4, culturalFit: 3, exoticAppetite: 3 },
  },
  {
    id: "milk-gelato",
    label: "Milk Gelato",
    profile: { cream: 5, fruit: 2, refreshing: 2, health: 2, premium: 4, culturalFit: 4, exoticAppetite: 2 },
  },
];

export const fruits: FruitOption[] = [
  {
    id: "mango",
    label: "Mango",
    profile: { cream: 3, fruit: 5, refreshing: 5, health: 4, premium: 4, culturalFit: 3, exoticAppetite: 5 },
  },
  {
    id: "strawberry",
    label: "Strawberry",
    profile: { cream: 3, fruit: 4, refreshing: 4, health: 4, premium: 4, culturalFit: 5, exoticAppetite: 2 },
  },
  {
    id: "peach",
    label: "Peach",
    profile: { cream: 3, fruit: 3, refreshing: 3, health: 4, premium: 3, culturalFit: 3, exoticAppetite: 2 },
  },
  {
    id: "grape",
    label: "Grape",
    profile: { cream: 3, fruit: 3, refreshing: 2, health: 3, premium: 3, culturalFit: 3, exoticAppetite: 2 },
  },
  {
    id: "mikan",
    label: "Mandarin Orange (Mikan)",
    profile: { cream: 3, fruit: 5, refreshing: 5, health: 5, premium: 4, culturalFit: 4, exoticAppetite: 3 },
  },
];

export const strategyPresets: StrategyPreset[] = [
  {
    id: "balanced",
    label: "Balanced",
    weights: { cream: 1, fruit: 1, refreshing: 1, health: 1, premium: 1, culturalFit: 1, exoticAppetite: 1 },
    summary: "Even weighting across climate, product feel, and market positioning.",
  },
  {
    id: "climate-first",
    label: "Climate-first",
    weights: { cream: 0.7, fruit: 1.1, refreshing: 1.8, health: 1, premium: 0.8, culturalFit: 0.9, exoticAppetite: 0.9 },
    summary: "Pushes cold, fruit-forward concepts that suit warmer climates.",
  },
  {
    id: "premium-first",
    label: "Premium-first",
    weights: { cream: 0.8, fruit: 0.9, refreshing: 0.8, health: 0.8, premium: 1.9, culturalFit: 1.2, exoticAppetite: 1 },
    summary: "Optimizes for perceived quality, premium fit, and cultural confidence.",
  },
  {
    id: "health-first",
    label: "Health-first",
    weights: { cream: 0.5, fruit: 1.4, refreshing: 1, health: 1.9, premium: 0.7, culturalFit: 0.8, exoticAppetite: 0.7 },
    summary: "Prioritizes fruit clarity and wellness-oriented positioning.",
  },
];

export const defaultSelection = {
  countryId: "singapore",
  baseId: "sorbet",
  presetId: "balanced",
} as const;
