export type FlavorFamiliarity = "high" | "medium" | "low" | "novel";

export interface RegionalFlavorEntry {
  familiarity: FlavorFamiliarity;
}

/** Fixed bonus coefficient derived from familiarity level */
export const familiarityBonusMap: Record<FlavorFamiliarity, number> = {
  high: 0.8,
  medium: 0.4,
  low: 0.1,
  novel: 0.6,
};

export function getBonusFromFamiliarity(familiarity: FlavorFamiliarity): number {
  return familiarityBonusMap[familiarity];
}

export const regionalFlavorBonus: Record<string, Record<string, RegionalFlavorEntry>> = {
  uae: {
    mango: { familiarity: "high" },
    strawberry: { familiarity: "medium" },
    peach: { familiarity: "low" },
    grape: { familiarity: "medium" },
    mikan: { familiarity: "novel" },
  },
  germany: {
    mango: { familiarity: "low" },
    strawberry: { familiarity: "high" },
    peach: { familiarity: "medium" },
    grape: { familiarity: "medium" },
    mikan: { familiarity: "medium" },
  },
  singapore: {
    mango: { familiarity: "high" },
    strawberry: { familiarity: "medium" },
    peach: { familiarity: "novel" },
    grape: { familiarity: "medium" },
    mikan: { familiarity: "medium" },
  },
  poland: {
    mango: { familiarity: "low" },
    strawberry: { familiarity: "high" },
    peach: { familiarity: "medium" },
    grape: { familiarity: "low" },
    mikan: { familiarity: "medium" },
  },
};

export function getFlavorFamiliarityLabel(familiarity: FlavorFamiliarity): {
  label: string;
  color: "green" | "yellow" | "blue" | "red";
} {
  switch (familiarity) {
    case "high":
      return { label: "Strong local flavor", color: "green" };
    case "medium":
      return { label: "Moderate familiarity", color: "yellow" };
    case "low":
      return { label: "Low familiarity", color: "red" };
    case "novel":
      return { label: "Novel / exotic appeal", color: "blue" };
  }
}

export function getMatchQualityLabel(score: number): string {
  if (score >= 4.5) return "Excellent";
  if (score >= 3.5) return "Strong";
  if (score >= 2.5) return "Good";
  if (score >= 1.5) return "Moderate";
  return "Weak";
}

/** Verbal labels for the 1-5 numeric scale used in country/fruit/base profiles */
export const verbalLabels = ["Very Low", "Low", "Medium", "High", "Very High"] as const;
export type VerbalLevel = (typeof verbalLabels)[number];

export function numToVerbal(n: number): VerbalLevel {
  const idx = Math.round(n) - 1;
  return verbalLabels[Math.max(0, Math.min(4, idx))];
}

export function verbalToNum(v: VerbalLevel): number {
  return verbalLabels.indexOf(v) + 1;
}
