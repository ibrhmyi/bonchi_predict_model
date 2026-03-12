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
  conceptProfile: FactorMap;
  factorDetails: FactorDetail[];
  explanation: string[];
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
}: {
  country: CountryOption;
  base: GelatoBase;
  fruits: FruitOption[];
  weights: StrategyPreset["weights"];
}): RankedConcept[] => {
  const maxPossibleScore = factors.reduce(
    (total, factor) => total + 5 * weights[factor],
    0,
  );

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

      return {
        fruit,
        base,
        conceptLabel: `${fruit.label} ${base.label}`,
        score: roundToTenth((weightedScore / maxPossibleScore) * 100),
        conceptProfile,
        factorDetails,
        explanation: buildExplanation(country, base, fruit, factorDetails),
      };
    })
    .sort((left, right) => right.score - left.score);
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
