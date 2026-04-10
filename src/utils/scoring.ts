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
import {
  baseProductionCost as defaultBaseProductionCost,
  calculatePriceFit,
  pricingByCountry as defaultPricingByCountry,
  type PricingProfile,
} from "../data/pricing";
import {
  getBonusFromFamiliarity,
  regionalFlavorBonus as defaultRegionalFlavorBonus,
  type RegionalFlavorEntry,
} from "../data/regionalData";
import { defaultScoringConfig, type ScoringConfig } from "../data/scoringConfig";

/** Optional overrides for all external data — when provided, replaces static imports */
export type DataOverrides = {
  pricingByCountry?: Record<string, PricingProfile>;
  regionalFlavorBonus?: Record<string, Record<string, RegionalFlavorEntry>>;
  baseProductionCost?: Record<string, number>;
};

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
    familiarity: "high" | "medium" | "low" | "novel";
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
  config: ScoringConfig = defaultScoringConfig,
): FactorMap => {
  const { standardBaseWeight: sB, standardFruitWeight: sF, culturalBaseWeight: cB, culturalFruitWeight: cF } = config.blending;
  return {
    cream: base.profile.cream,
    fruit: fruitWeightedFactor(base.profile.fruit, fruit.profile.fruit, sB, sF),
    refreshing: fruitWeightedFactor(base.profile.refreshing, fruit.profile.refreshing, sB, sF),
    health: fruitWeightedFactor(base.profile.health, fruit.profile.health, sB, sF),
    premium: fruitWeightedFactor(base.profile.premium, fruit.profile.premium, sB, sF),
    culturalFit: fruitWeightedFactor(base.profile.culturalFit, fruit.profile.culturalFit, cB, cF),
    exoticAppetite: fruitWeightedFactor(base.profile.exoticAppetite, fruit.profile.exoticAppetite, cB, cF),
  };
};

function generateDataDrivenInsights(
  country: CountryOption,
  base: GelatoBase,
  fruit: FruitOption,
  flavorData: { familiarity: string } | null,
  priceFit: number | null,
  estimatedMargin: number | null,
  pricePoint: number | undefined,
  regionalBonus: number,
  factorDetails: FactorDetail[],
  pricing: PricingProfile | undefined,
  maxInsights = 4,
): string[] {
  const insights: string[] = [];

  if (flavorData && regionalBonus > 0) {
    if (flavorData.familiarity === "high") {
      insights.push(
        `${fruit.label} is a top-selling flavor in ${country.label} — regional flavor bonus of +${regionalBonus.toFixed(1)} pts.`,
      );
    } else if (flavorData.familiarity === "novel") {
      insights.push(
        `${fruit.label} offers novel Japanese appeal in ${country.label} — exotic positioning adds +${regionalBonus.toFixed(1)} pts.`,
      );
    } else if (flavorData.familiarity === "medium") {
      insights.push(
        `${fruit.label} has moderate local recognition in ${country.label} (+${regionalBonus.toFixed(1)} pts regional bonus).`,
      );
    }
  }

  if (priceFit !== null && pricePoint !== undefined && pricePoint > 0 && estimatedMargin !== null && pricing) {
    const ratio = ((pricePoint / pricing.avgMarketPrice) * 100).toFixed(0);
    insights.push(
      `At $${pricePoint.toFixed(2)}, price is ${ratio}% of ${country.label}'s market average — est. margin $${estimatedMargin.toFixed(2)}/unit.`,
    );
  }

  const topFactor = [...factorDetails].sort((a, b) => b.weightedMatch - a.weightedMatch)[0];
  if (topFactor) {
    const factorName = factorLabels[topFactor.factor].toLowerCase();
    if (topFactor.match >= 4) {
      insights.push(
        `${base.label} format aligns strongly with ${country.label}'s ${factorName} expectations.`,
      );
    }
  }

  if ((base.id === "sorbet" || base.id === "vegan-gelato") && country.profile.health >= 4) {
    insights.push(
      `${base.label} avoids dairy, fitting health-conscious demand in ${country.label}.`,
    );
  }

  return insights.slice(0, maxInsights);
}

export const rankFruitConcepts = ({
  country,
  base,
  fruits,
  weights,
  pricePoint,
  config = defaultScoringConfig,
  data,
}: {
  country: CountryOption;
  base: GelatoBase;
  fruits: FruitOption[];
  weights: StrategyPreset["weights"];
  pricePoint?: number;
  config?: ScoringConfig;
  data?: DataOverrides;
}): RankedConcept[] => {
  const pricingMap = data?.pricingByCountry ?? defaultPricingByCountry;
  const flavorMap = data?.regionalFlavorBonus ?? defaultRegionalFlavorBonus;
  const prodCostMap = data?.baseProductionCost ?? defaultBaseProductionCost;

  const maxPossibleScore = factors.reduce(
    (total, factor) => total + 5 * weights[factor],
    0,
  );

  const pricing = pricingMap[country.id];

  return fruits
    .map((fruit) => {
      const conceptProfile = buildConceptProfile(base, fruit, config);
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

      const flavorData = flavorMap[country.id]?.[fruit.id];
      const regionalBonusRaw = flavorData ? getBonusFromFamiliarity(flavorData.familiarity) : 0;
      const regionalBonus = roundToTenth(regionalBonusRaw * config.regionalBonus.maxPoints);
      const regionalFlavorInfo = flavorData
        ? { familiarity: flavorData.familiarity }
        : null;

      let priceFitValue: number | null = null;
      let priceBonus = 0;
      let estimatedMargin: number | null = null;
      if (pricePoint !== undefined && pricePoint > 0 && pricing) {
        priceFitValue = roundToTenth(
          calculatePriceFit(pricePoint, pricing.avgMarketPrice),
        );
        priceBonus = roundToTenth((priceFitValue - config.priceBonus.neutralFit) * config.priceBonus.multiplier);
        const baseCost = prodCostMap[base.id] ?? 2.5;
        estimatedMargin = roundToTenth(pricePoint - baseCost);
      }

      const adjustedScore = Math.min(
        config.scoreBounds.max,
        Math.max(config.scoreBounds.min, roundToTenth(baseScore + regionalBonus + priceBonus)),
      );

      const insights = generateDataDrivenInsights(
        country, base, fruit,
        flavorData ? { familiarity: flavorData.familiarity } : null,
        priceFitValue, estimatedMargin, pricePoint,
        regionalBonus, factorDetails, pricing,
        config.maxInsights,
      );

      return {
        fruit, base,
        conceptLabel: `${fruit.label} ${base.label}`,
        score: adjustedScore, baseScore, conceptProfile, factorDetails,
        explanation: insights, insights,
        regionalBonus, regionalFlavorInfo,
        priceFit: priceFitValue, estimatedMargin,
      };
    })
    .sort((left, right) => right.score - left.score);
};

export const scoreSingleCombination = ({
  country, base, fruit, weights, data,
}: {
  country: CountryOption;
  base: GelatoBase;
  fruit: FruitOption;
  weights: StrategyPreset["weights"];
  data?: DataOverrides;
}): number => {
  const results = rankFruitConcepts({ country, base, fruits: [fruit], weights, data });
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
  countries, bases, fruits, weights, data,
}: {
  countries: CountryOption[];
  bases: GelatoBase[];
  fruits: FruitOption[];
  weights: StrategyPreset["weights"];
  data?: DataOverrides;
}): BenchmarkEntry[] => {
  const entries: BenchmarkEntry[] = [];

  for (const base of bases) {
    for (const fruit of fruits) {
      const scores: Record<string, number> = {};
      for (const country of countries) {
        scores[country.id] = scoreSingleCombination({ country, base, fruit, weights, data });
      }

      const scoreValues = Object.values(scores);
      const min = Math.min(...scoreValues);
      const max = Math.max(...scoreValues);
      const avg = roundToTenth(scoreValues.reduce((s, v) => s + v, 0) / scoreValues.length);
      const bestCountryId = Object.entries(scores).sort(([, a], [, b]) => b - a)[0][0];
      const bestCountry = countries.find((c) => c.id === bestCountryId)?.label ?? bestCountryId;

      entries.push({
        fruitId: fruit.id, fruitLabel: fruit.label,
        baseId: base.id, baseLabel: base.label,
        scores, min, max, avg, bestCountry,
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
  "fruit", "refreshing", "health", "premium", "culturalFit", "exoticAppetite",
];

export const getFactorLabel = (factor: Factor) => factorLabels[factor];
export const getFactorDefinition = (factor: Factor) => factorDefinitions[factor];
