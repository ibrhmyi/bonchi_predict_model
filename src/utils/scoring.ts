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
  getCostDollarSign,
  getCostEfficiencyScore,
  getSupplyLabel,
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
  insights: string[];
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

function generateDataDrivenInsights(
  country: CountryOption,
  base: GelatoBase,
  fruit: FruitOption,
  flavorData: { bonus: number; reason: string; familiarity: string } | null,
  costData: { costIndex: number; supplyReliability: number; sourceNote: string } | null,
  priceFit: number | null,
  estimatedMargin: number | null,
  pricePoint: number | undefined,
  regionalBonus: number,
  factorDetails: FactorDetail[],
): string[] {
  const insights: string[] = [];

  // Regional flavor insight
  if (flavorData && flavorData.bonus > 0) {
    if (flavorData.familiarity === "high") {
      insights.push(
        `${fruit.label} is a top-selling flavor in ${country.label} — regional flavor bonus of +${regionalBonus.toFixed(1)} pts.`,
      );
    } else if (flavorData.familiarity === "novel") {
      insights.push(
        `${fruit.label} offers novel Japanese appeal in ${country.label} — exotic positioning adds +${regionalBonus.toFixed(1)} pts.`,
      );
    } else if (flavorData.bonus >= 0.3) {
      insights.push(
        `${fruit.label} has moderate local recognition in ${country.label} (+${regionalBonus.toFixed(1)} pts regional bonus).`,
      );
    }
  }

  // Cost & supply insight
  if (costData) {
    const costLabel = getCostDollarSign(costData.costIndex);
    const supplyLabel = getSupplyLabel(costData.supplyReliability);
    insights.push(
      `Sourcing cost: ${costLabel} with ${supplyLabel.toLowerCase()} supply in ${country.label}.`,
    );
  }

  // Price insight
  if (priceFit !== null && pricePoint !== undefined && pricePoint > 0 && estimatedMargin !== null) {
    const pricing = pricingByCountry[country.id];
    if (pricing) {
      const ratio = ((pricePoint / pricing.avgMarketPrice) * 100).toFixed(0);
      insights.push(
        `At $${pricePoint.toFixed(2)}, price is ${ratio}% of ${country.label}'s market average — est. margin $${estimatedMargin.toFixed(2)}/unit.`,
      );
    }
  }

  // Top factor insight
  const topFactor = [...factorDetails].sort((a, b) => b.weightedMatch - a.weightedMatch)[0];
  if (topFactor) {
    const factorName = factorLabels[topFactor.factor].toLowerCase();
    if (topFactor.match >= 4) {
      insights.push(
        `${base.label} format aligns strongly with ${country.label}'s ${factorName} expectations.`,
      );
    }
  }

  // Health insight for sorbet/vegan
  if ((base.id === "sorbet" || base.id === "vegan-gelato") && country.profile.health >= 4) {
    insights.push(
      `${base.label} avoids dairy, fitting health-conscious demand in ${country.label}.`,
    );
  }

  return insights.slice(0, 4);
}

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

      // Regional flavor bonus — scaled to +8 points max for wider spread
      const flavorData = regionalFlavorBonus[country.id]?.[fruit.id];
      const regionalBonusRaw = flavorData ? flavorData.bonus : 0;
      const regionalBonus = roundToTenth(regionalBonusRaw * 8);
      const regionalFlavorInfo = flavorData
        ? { bonus: flavorData.bonus, reason: flavorData.reason, familiarity: flavorData.familiarity }
        : null;

      // Cost efficiency — increased impact
      const costData = fruitCostByCountry[fruit.id]?.[country.id];
      const costEfficiency = costData
        ? {
            score: getCostEfficiencyScore(costData.costIndex, costData.supplyReliability),
            costIndex: costData.costIndex,
            supplyReliability: costData.supplyReliability,
            sourceNote: costData.sourceNote,
          }
        : null;

      // Cost efficiency bonus: -4 to +5 points
      const costBonus = costEfficiency
        ? roundToTenth(((costEfficiency.score - 2.5) / 2.5) * 5)
        : 0;

      // Price fit
      let priceFitValue: number | null = null;
      let priceBonus = 0;
      let estimatedMargin: number | null = null;
      if (pricePoint !== undefined && pricePoint > 0 && pricing) {
        priceFitValue = roundToTenth(
          calculatePriceFit(pricePoint, pricing.avgMarketPrice, pricing.priceSensitivity),
        );
        priceBonus = roundToTenth((priceFitValue - 3) * 2.5);
        const fruitCostIndex = costData?.costIndex ?? 2.5;
        estimatedMargin = roundToTenth(
          pricePoint - (baseProductionCostValue(base.id) * fruitCostIndex * 0.3 * (pricing.costMultiplier)),
        );
      }

      const adjustedScore = Math.min(
        100,
        Math.max(0, roundToTenth(baseScore + regionalBonus + costBonus + priceBonus)),
      );

      const insights = generateDataDrivenInsights(
        country,
        base,
        fruit,
        flavorData ? { bonus: flavorData.bonus, reason: flavorData.reason, familiarity: flavorData.familiarity } : null,
        costData ?? null,
        priceFitValue,
        estimatedMargin,
        pricePoint,
        regionalBonus,
        factorDetails,
      );

      return {
        fruit,
        base,
        conceptLabel: `${fruit.label} ${base.label}`,
        score: adjustedScore,
        baseScore,
        conceptProfile,
        factorDetails,
        explanation: insights,
        insights,
        regionalBonus,
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

export type BenchmarkEntry = {
  fruitId: string;
  fruitLabel: string;
  baseId: string;
  baseLabel: string;
  scores: Record<string, number>;
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
