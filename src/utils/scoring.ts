import {
  factorDefinitions,
  factorLabels,
  factors,
  type CountryOption,
  type Factor,
  type FactorMap,
  type FruitFactor,
  type FruitOption,
  type GelatoBase,
  type StrategyPreset,
} from "../data/marketFit";
import { calculatePriceFit, pricingByCountry } from "../data/pricing";
import {
  fruitCostByCountry,
  getCostEfficiencyScore,
  regionalFlavorBonus,
} from "../data/regionalData";

export type FactorDetail = {
  factor: Factor;
  countryValue: number;
  conceptValue: number;
  match: number;
  weight: number;
  weightedMatch: number;
};

export type RankedConcept = {
  fruit: FruitOption;
  base: GelatoBase;
  conceptLabel: string;
  score: number;
  baseScore: number;
  conceptProfile: FactorMap;
  factorDetails: FactorDetail[];
  explanation: string[];
  regionalBonus: number;
  regionalFlavorInfo: {
    bonus: number;
    reason: string;
    familiarity: "high" | "medium" | "low" | "novel";
  } | null;
  costEfficiency: {
    score: number;
    costIndex: number;
    supplyReliability: number;
    sourceNote: string;
  } | null;
  priceFit: number | null;
  estimatedMargin: number | null;
};

const clampFactor = (value: number) => Math.min(5, Math.max(1, value));
const roundToTenth = (value: number) => Math.round(value * 10) / 10;

const fruitWeightedFactor = (
  baseValue: number,
  fruitValue: number,
  baseWeight: number,
  fruitWeight: number,
) => roundToTenth(clampFactor(baseValue * baseWeight + fruitValue * fruitWeight));

export const buildConceptProfile = (
  base: GelatoBase,
  fruit: FruitOption,
): FactorMap => ({
  cream: base.profile.cream,
  fruit: fruitWeightedFactor(base.profile.fruit, fruit.profile.fruit, 0.7, 0.3),
  refreshing: fruitWeightedFactor(
    base.profile.refreshing,
    fruit.profile.refreshing,
    0.7,
    0.3,
  ),
  health: fruitWeightedFactor(base.profile.health, fruit.profile.health, 0.7, 0.3),
  premium: fruitWeightedFactor(base.profile.premium, fruit.profile.premium, 0.7, 0.3),
  culturalFit: fruitWeightedFactor(
    base.profile.culturalFit,
    fruit.profile.culturalFit,
    0.6,
    0.4,
  ),
  exoticAppetite: fruitWeightedFactor(
    base.profile.exoticAppetite,
    fruit.profile.exoticAppetite,
    0.6,
    0.4,
  ),
});

const explanationByFactor = (
  factor: Factor,
  country: CountryOption,
  base: GelatoBase,
  fruit: FruitOption,
): string => {
  switch (factor) {
    case "cream":
      return `${base.label} keeps cream intensity close to ${country.label}'s dessert expectations.`;
    case "fruit":
      return `${fruit.label} sharpens the fruit-forward signal this market is looking for.`;
    case "refreshing":
      return `${fruit.label} with ${base.label.toLowerCase()} lands on refreshment for ${country.label}.`;
    case "health":
      return `${base.label} and ${fruit.label.toLowerCase()} support a lighter wellness-led read.`;
    case "premium":
      return `The concept holds a premium cue that fits the target positioning in ${country.label}.`;
    case "culturalFit":
      return `${fruit.label} feels culturally legible enough for this market context.`;
    case "exoticAppetite":
      return `${fruit.label} matches the market's openness to imported or more novel fruit ideas.`;
  }
};

const buildExplanation = (
  country: CountryOption,
  base: GelatoBase,
  fruit: FruitOption,
  factorDetails: FactorDetail[],
): string[] =>
  [...factorDetails]
    .sort((left, right) => right.weightedMatch - left.weightedMatch)
    .slice(0, 3)
    .map((detail) => explanationByFactor(detail.factor, country, base, fruit));

export const rankFruitConcepts = ({
  country,
  base,
  fruits,
  weights,
  pricePoint,
}: {
  country: CountryOption;
  base: GelatoBase;
  fruits: FruitOption[];
  weights: StrategyPreset["weights"];
  pricePoint?: number;
}): RankedConcept[] => {
  const maxPossibleScore = factors.reduce(
    (total, factor) => total + 5 * weights[factor],
    0,
  );

  const pricing = pricingByCountry[country.id];

  return fruits
    .map((fruit) => {
      const conceptProfile = buildConceptProfile(base, fruit);
      const factorDetails = factors.map((factor) => {
        const countryValue = country.profile[factor];
        const conceptValue = conceptProfile[factor];
        const match = 5 - Math.abs(countryValue - conceptValue);
        const weight = weights[factor];

        return {
          factor,
          countryValue,
          conceptValue,
          match,
          weight,
          weightedMatch: roundToTenth(match * weight),
        };
      });

      const weightedScore = factorDetails.reduce(
        (total, detail) => total + detail.weightedMatch,
        0,
      );

      const baseScore = roundToTenth((weightedScore / maxPossibleScore) * 100);

      // Regional flavor bonus
      const flavorData = regionalFlavorBonus[country.id]?.[fruit.id];
      const regionalBonus = flavorData ? flavorData.bonus : 0;
      const regionalFlavorInfo = flavorData
        ? { bonus: flavorData.bonus, reason: flavorData.reason, familiarity: flavorData.familiarity }
        : null;

      // Cost efficiency
      const costData = fruitCostByCountry[fruit.id]?.[country.id];
      const costEfficiency = costData
        ? {
            score: getCostEfficiencyScore(costData.costIndex, costData.supplyReliability),
            costIndex: costData.costIndex,
            supplyReliability: costData.supplyReliability,
            sourceNote: costData.sourceNote,
          }
        : null;

      // Cost efficiency adjustment (0 to +3 points)
      const costBonus = costEfficiency
        ? roundToTenth(((costEfficiency.score - 2.5) / 2.5) * 3)
        : 0;

      // Price fit
      let priceFitValue: number | null = null;
      let priceBonus = 0;
      let estimatedMargin: number | null = null;
      if (pricePoint !== undefined && pricePoint > 0 && pricing) {
        priceFitValue = roundToTenth(
          calculatePriceFit(pricePoint, pricing.avgMarketPrice, pricing.priceSensitivity),
        );
        // Price impact: ±5 points based on fit (5 = perfect = +5, 1 = poor = -5)
        priceBonus = roundToTenth((priceFitValue - 3) * 2.5);
        const fruitCostIndex = costData?.costIndex ?? 2.5;
        estimatedMargin = roundToTenth(
          pricePoint - (baseProductionCostValue(base.id) * fruitCostIndex * 0.3 * (pricing.costMultiplier)),
        );
      }

      const adjustedScore = Math.min(
        100,
        Math.max(0, roundToTenth(baseScore + regionalBonus * 5 + costBonus + priceBonus)),
      );

      return {
        fruit,
        base,
        conceptLabel: `${fruit.label} ${base.label}`,
        score: adjustedScore,
        baseScore,
        conceptProfile,
        factorDetails,
        explanation: buildExplanation(country, base, fruit, factorDetails),
        regionalBonus: roundToTenth(regionalBonus * 5),
        regionalFlavorInfo,
        costEfficiency,
        priceFit: priceFitValue,
        estimatedMargin,
      };
    })
    .sort((left, right) => right.score - left.score);
};

function baseProductionCostValue(baseId: string): number {
  const costs: Record<string, number> = {
    sorbet: 2,
    "premium-fruit-gelato": 4,
    "vegan-gelato": 3,
    "milk-gelato": 2.5,
  };
  return costs[baseId] ?? 2.5;
}

// Benchmark utility: score a single combination
export const scoreSingleCombination = ({
  country,
  base,
  fruit,
  weights,
}: {
  country: CountryOption;
  base: GelatoBase;
  fruit: FruitOption;
  weights: StrategyPreset["weights"];
}): number => {
  const results = rankFruitConcepts({
    country,
    base,
    fruits: [fruit],
    weights,
  });
  return results[0]?.score ?? 0;
};

// Benchmark: generate full cross-reference matrix
export type BenchmarkEntry = {
  fruitId: string;
  fruitLabel: string;
  baseId: string;
  baseLabel: string;
  scores: Record<string, number>; // countryId → score
  min: number;
  max: number;
  avg: number;
  bestCountry: string;
};

export const generateBenchmarkMatrix = ({
  countries,
  bases,
  fruits,
  weights,
}: {
  countries: CountryOption[];
  bases: GelatoBase[];
  fruits: FruitOption[];
  weights: StrategyPreset["weights"];
}): BenchmarkEntry[] => {
  const entries: BenchmarkEntry[] = [];

  for (const base of bases) {
    for (const fruit of fruits) {
      const scores: Record<string, number> = {};
      for (const country of countries) {
        scores[country.id] = scoreSingleCombination({ country, base, fruit, weights });
      }

      const scoreValues = Object.values(scores);
      const min = Math.min(...scoreValues);
      const max = Math.max(...scoreValues);
      const avg = roundToTenth(scoreValues.reduce((s, v) => s + v, 0) / scoreValues.length);
      const bestCountryId = Object.entries(scores).sort(([, a], [, b]) => b - a)[0][0];
      const bestCountry = countries.find((c) => c.id === bestCountryId)?.label ?? bestCountryId;

      entries.push({
        fruitId: fruit.id,
        fruitLabel: fruit.label,
        baseId: base.id,
        baseLabel: base.label,
        scores,
        min,
        max,
        avg,
        bestCountry,
      });
    }
  }

  return entries.sort((a, b) => b.max - a.max);
};

export const getPresetWeights = (preset: StrategyPreset): FactorMap => ({
  cream: preset.weights.cream,
  fruit: preset.weights.fruit,
  refreshing: preset.weights.refreshing,
  health: preset.weights.health,
  premium: preset.weights.premium,
  culturalFit: preset.weights.culturalFit,
  exoticAppetite: preset.weights.exoticAppetite,
});

export const getDominantFactors = (weights: FactorMap): Factor[] =>
  factors.slice().sort((left, right) => weights[right] - weights[left]).slice(0, 2);

export const fruitFactors: FruitFactor[] = [
  "fruit",
  "refreshing",
  "health",
  "premium",
  "culturalFit",
  "exoticAppetite",
];

export const getFactorLabel = (factor: Factor) => factorLabels[factor];
export const getFactorDefinition = (factor: Factor) => factorDefinitions[factor];
