export const factors = [
  "cream",
  "fruit",
  "refreshing",
  "health",
  "premium",
  "culturalFit",
  "exoticAppetite",
] as const;

export type Factor = (typeof factors)[number];

export type FactorMap = Record<Factor, number>;

export type FruitFactor = Exclude<Factor, "cream">;
export type FruitFactorMap = Record<FruitFactor, number>;

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
  profile: FruitFactorMap;
};

export type StrategyPreset = {
  id: string;
  label: string;
  weights: FactorMap;
  summary: string;
};

export const factorLabels: Record<Factor, string> = {
  cream: "Cream",
  fruit: "Fruit",
  refreshing: "Refreshing",
  health: "Health",
  premium: "Premium",
  culturalFit: "Cultural Fit",
  exoticAppetite: "Exotic Appetite",
};

export const factorDefinitions: Record<Factor, string> = {
  cream: "How rich and dairy-led the concept feels.",
  fruit: "How clearly the concept reads as fruit-forward.",
  refreshing: "How strongly the product fits hot climates and light dessert demand.",
  health: "How much the concept signals lighter, cleaner, wellness-oriented appeal.",
  premium: "How strongly the concept supports upscale pricing and gifting cues.",
  culturalFit: "How aligned the flavor feels with local taste culture.",
  exoticAppetite: "How open the market is to novel imported fruit flavors.",
};

export const countries: CountryOption[] = [
  {
    id: "uae",
    label: "UAE",
    profile: {
      cream: 3,
      fruit: 4,
      refreshing: 5,
      health: 3,
      premium: 4,
      culturalFit: 3,
      exoticAppetite: 4,
    },
  },
  {
    id: "germany",
    label: "Germany",
    profile: {
      cream: 5,
      fruit: 3,
      refreshing: 2,
      health: 3,
      premium: 4,
      culturalFit: 4,
      exoticAppetite: 2,
    },
  },
  {
    id: "singapore",
    label: "Singapore",
    profile: {
      cream: 3,
      fruit: 5,
      refreshing: 4,
      health: 4,
      premium: 5,
      culturalFit: 4,
      exoticAppetite: 4,
    },
  },
  {
    id: "poland",
    label: "Poland",
    profile: {
      cream: 4,
      fruit: 3,
      refreshing: 2,
      health: 2,
      premium: 2,
      culturalFit: 3,
      exoticAppetite: 2,
    },
  },
];

export const gelatoBases: GelatoBase[] = [
  {
    id: "sorbet",
    label: "Sorbet",
    profile: {
      cream: 1,
      fruit: 5,
      refreshing: 5,
      health: 5,
      premium: 3,
      culturalFit: 3,
      exoticAppetite: 4,
    },
  },
  {
    id: "premium-fruit-gelato",
    label: "Premium Fruit Gelato",
    profile: {
      cream: 3,
      fruit: 4,
      refreshing: 4,
      health: 4,
      premium: 5,
      culturalFit: 4,
      exoticAppetite: 3,
    },
  },
  {
    id: "vegan-gelato",
    label: "Vegan Gelato",
    profile: {
      cream: 2,
      fruit: 4,
      refreshing: 4,
      health: 5,
      premium: 4,
      culturalFit: 3,
      exoticAppetite: 3,
    },
  },
  {
    id: "milk-gelato",
    label: "Milk Gelato",
    profile: {
      cream: 5,
      fruit: 2,
      refreshing: 2,
      health: 2,
      premium: 4,
      culturalFit: 4,
      exoticAppetite: 2,
    },
  },
];

export const fruits: FruitOption[] = [
  {
    id: "mango",
    label: "Mango",
    profile: {
      fruit: 5,
      refreshing: 5,
      health: 4,
      premium: 4,
      culturalFit: 3,
      exoticAppetite: 5,
    },
  },
  {
    id: "strawberry",
    label: "Strawberry",
    profile: {
      fruit: 4,
      refreshing: 4,
      health: 4,
      premium: 4,
      culturalFit: 5,
      exoticAppetite: 2,
    },
  },
  {
    id: "peach",
    label: "Peach",
    profile: {
      fruit: 3,
      refreshing: 3,
      health: 4,
      premium: 3,
      culturalFit: 3,
      exoticAppetite: 2,
    },
  },
  {
    id: "grape",
    label: "Grape",
    profile: {
      fruit: 3,
      refreshing: 2,
      health: 3,
      premium: 3,
      culturalFit: 3,
      exoticAppetite: 2,
    },
  },
  {
    id: "mikan",
    label: "Mandarin Orange (Mikan)",
    profile: {
      fruit: 5,
      refreshing: 5,
      health: 5,
      premium: 4,
      culturalFit: 4,
      exoticAppetite: 3,
    },
  },
];

export const strategyPresets: StrategyPreset[] = [
  {
    id: "balanced",
    label: "Balanced",
    weights: {
      cream: 1,
      fruit: 1,
      refreshing: 1,
      health: 1,
      premium: 1,
      culturalFit: 1,
      exoticAppetite: 1,
    },
    summary: "Even weighting across climate, product feel, and market positioning.",
  },
  {
    id: "climate-first",
    label: "Climate-first",
    weights: {
      cream: 0.7,
      fruit: 1.1,
      refreshing: 1.8,
      health: 1,
      premium: 0.8,
      culturalFit: 0.9,
      exoticAppetite: 0.9,
    },
    summary: "Pushes cold, fruit-forward concepts that suit warmer climates.",
  },
  {
    id: "premium-first",
    label: "Premium-first",
    weights: {
      cream: 0.8,
      fruit: 0.9,
      refreshing: 0.8,
      health: 0.8,
      premium: 1.9,
      culturalFit: 1.2,
      exoticAppetite: 1,
    },
    summary: "Optimizes for perceived quality, premium fit, and cultural confidence.",
  },
  {
    id: "health-first",
    label: "Health-first",
    weights: {
      cream: 0.5,
      fruit: 1.4,
      refreshing: 1,
      health: 1.9,
      premium: 0.7,
      culturalFit: 0.8,
      exoticAppetite: 0.7,
    },
    summary: "Prioritizes fruit clarity and wellness-oriented positioning.",
  },
];

export const defaultSelection = {
  countryId: "singapore",
  baseId: "sorbet",
  presetId: "balanced",
} as const;

export const emptyCountryProfile = (): FactorMap => ({
  cream: 3,
  fruit: 3,
  refreshing: 3,
  health: 3,
  premium: 3,
  culturalFit: 3,
  exoticAppetite: 3,
});

export const emptyFruitProfile = (): FruitFactorMap => ({
  fruit: 3,
  refreshing: 3,
  health: 3,
  premium: 3,
  culturalFit: 3,
  exoticAppetite: 3,
});
