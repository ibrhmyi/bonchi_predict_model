export interface AgeGroup {
  label: string;
  percentage: number;
  gelatoDemandIndex: number;
}

export interface Demographics {
  population: number;
  ageDistribution: AgeGroup[];
  genderSplit: { male: number; female: number };
  urbanRate: number;
  insight: string;
}

export const demographicsByCountry: Record<string, Demographics> = {
  uae: {
    population: 10,
    ageDistribution: [
      { label: "18–24", percentage: 14, gelatoDemandIndex: 4.2 },
      { label: "25–34", percentage: 30, gelatoDemandIndex: 4.5 },
      { label: "35–44", percentage: 26, gelatoDemandIndex: 3.8 },
      { label: "45–54", percentage: 18, gelatoDemandIndex: 3.0 },
      { label: "55+", percentage: 12, gelatoDemandIndex: 2.2 },
    ],
    genderSplit: { male: 69, female: 31 },
    urbanRate: 88,
    insight:
      "UAE's young, affluent, and heavily urban population drives premium dessert demand year-round. The 25–34 age group is the strongest gelato segment.",
  },
  germany: {
    population: 84,
    ageDistribution: [
      { label: "18–24", percentage: 10, gelatoDemandIndex: 3.8 },
      { label: "25–34", percentage: 16, gelatoDemandIndex: 4.0 },
      { label: "35–44", percentage: 17, gelatoDemandIndex: 3.5 },
      { label: "45–54", percentage: 20, gelatoDemandIndex: 3.0 },
      { label: "55+", percentage: 37, gelatoDemandIndex: 2.5 },
    ],
    genderSplit: { male: 49, female: 51 },
    urbanRate: 77,
    insight:
      "Germany's large population offsets its older demographic skew. Strong Eisdiele (ice cream parlor) culture creates seasonal demand peaks in summer months.",
  },
  singapore: {
    population: 5.9,
    ageDistribution: [
      { label: "18–24", percentage: 12, gelatoDemandIndex: 4.5 },
      { label: "25–34", percentage: 22, gelatoDemandIndex: 4.8 },
      { label: "35–44", percentage: 22, gelatoDemandIndex: 4.2 },
      { label: "45–54", percentage: 20, gelatoDemandIndex: 3.5 },
      { label: "55+", percentage: 24, gelatoDemandIndex: 2.8 },
    ],
    genderSplit: { male: 48, female: 52 },
    urbanRate: 100,
    insight:
      "Singapore's 100% urban population and strong dessert culture yield a high per-capita addressable market despite small total population.",
  },
  poland: {
    population: 38,
    ageDistribution: [
      { label: "18–24", percentage: 11, gelatoDemandIndex: 3.5 },
      { label: "25–34", percentage: 18, gelatoDemandIndex: 3.8 },
      { label: "35–44", percentage: 20, gelatoDemandIndex: 3.2 },
      { label: "45–54", percentage: 18, gelatoDemandIndex: 2.8 },
      { label: "55+", percentage: 33, gelatoDemandIndex: 2.2 },
    ],
    genderSplit: { male: 48, female: 52 },
    urbanRate: 60,
    insight:
      "Poland's growing middle class and expanding dessert market present value-oriented opportunities. Urban centers like Warsaw and Krakow drive premium demand.",
  },
};

export function calculateAddressablePopulation(demographics: Demographics): number {
  const avgDemandIndex =
    demographics.ageDistribution.reduce(
      (sum, group) => sum + group.percentage * group.gelatoDemandIndex,
      0,
    ) / 100;
  const raw = demographics.population * (demographics.urbanRate / 100) * (avgDemandIndex / 5);
  return Math.round(Math.min(demographics.population, raw) * 100) / 100;
}

export function calculateAnnualServings(demographics: Demographics): number {
  const avgDemandIndex =
    demographics.ageDistribution.reduce(
      (sum, group) => sum + group.percentage * group.gelatoDemandIndex,
      0,
    ) / 100;
  const purchaseFrequency = 1.5;
  return Math.round(
    demographics.population * (demographics.urbanRate / 100) * avgDemandIndex * purchaseFrequency * 100,
  ) / 100;
}
