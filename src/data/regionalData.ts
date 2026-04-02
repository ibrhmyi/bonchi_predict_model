export type FlavorFamiliarity = "high" | "medium" | "low" | "novel";

export interface RegionalFlavorEntry {
  bonus: number;
  reason: string;
  familiarity: FlavorFamiliarity;
}

export const regionalFlavorBonus: Record<string, Record<string, RegionalFlavorEntry>> = {
  uae: {
    mango: {
      bonus: 0.8,
      reason: "Mango is one of the most popular flavors in the UAE — a staple in juices, desserts, and gelato across Dubai and Abu Dhabi.",
      familiarity: "high",
    },
    strawberry: {
      bonus: 0.3,
      reason: "Strawberry is widely accepted but not distinctive in the UAE premium dessert market.",
      familiarity: "medium",
    },
    peach: {
      bonus: 0.15,
      reason: "Peach is uncommon in UAE desserts — positioned as a premium Japanese novelty.",
      familiarity: "low",
    },
    grape: {
      bonus: 0.4,
      reason: "Grape juice and grape-flavored sweets are moderately popular in the UAE.",
      familiarity: "medium",
    },
    mikan: {
      bonus: 0.3,
      reason: "Citrus fruits are popular in the UAE; mandarin offers a refined Japanese twist on familiar flavors.",
      familiarity: "novel",
    },
  },
  germany: {
    mango: {
      bonus: 0.2,
      reason: "Mango has grown in popularity as a tropical import flavor but remains niche in German Eisdiele culture.",
      familiarity: "low",
    },
    strawberry: {
      bonus: 0.8,
      reason: "Strawberry (Erdbeere) is Germany's favorite fruit flavor — a summer institution in ice cream parlors nationwide.",
      familiarity: "high",
    },
    peach: {
      bonus: 0.5,
      reason: "Peach (Pfirsich) is well-liked in Germany, common in yogurt and traditional Eisdiele menus.",
      familiarity: "medium",
    },
    grape: {
      bonus: 0.3,
      reason: "Germany's wine culture gives grape flavor some cultural resonance, though rare in gelato.",
      familiarity: "medium",
    },
    mikan: {
      bonus: 0.4,
      reason: "Mandarine is a Christmas staple in Germany — mikan adds a premium Japanese-origin story to a familiar flavor.",
      familiarity: "medium",
    },
  },
  singapore: {
    mango: {
      bonus: 1.0,
      reason: "Mango is a beloved tropical staple in Singapore — found in everything from ice kachang to sticky rice to premium desserts.",
      familiarity: "high",
    },
    strawberry: {
      bonus: 0.15,
      reason: "Strawberry is popular but fully imported — less culturally rooted than tropical fruits in Singapore.",
      familiarity: "medium",
    },
    peach: {
      bonus: 0.3,
      reason: "Peach has growing appeal through Japanese food culture influence in Singapore — premium positioning.",
      familiarity: "novel",
    },
    grape: {
      bonus: 0.5,
      reason: "Japanese grape (kyoho-style) is a premium delicacy in Singapore's food scene — strong brand potential.",
      familiarity: "medium",
    },
    mikan: {
      bonus: 0.6,
      reason: "Japanese citrus is well-regarded in Singapore — yuzu and mikan carry premium cachet in the food scene.",
      familiarity: "medium",
    },
  },
  poland: {
    mango: {
      bonus: 0.05,
      reason: "Mango is still exotic in Poland — limited local availability, low consumer awareness outside major cities.",
      familiarity: "low",
    },
    strawberry: {
      bonus: 0.9,
      reason: "Strawberry (truskawka) is Poland's most beloved fruit — deeply embedded in local food culture and seasonal traditions.",
      familiarity: "high",
    },
    peach: {
      bonus: 0.35,
      reason: "Peach is moderately popular in Poland, mainly through canned and juice consumption.",
      familiarity: "medium",
    },
    grape: {
      bonus: 0.2,
      reason: "Grape is recognized but not strongly associated with premium desserts in Poland.",
      familiarity: "low",
    },
    mikan: {
      bonus: 0.3,
      reason: "Mandarin oranges are common winter treats in Poland — mikan variant adds a Japanese premium angle.",
      familiarity: "medium",
    },
  },
};

export interface FruitCostEntry {
  costIndex: number;
  supplyReliability: number;
  sourceNote: string;
}

export const fruitCostByCountry: Record<string, Record<string, FruitCostEntry>> = {
  mango: {
    singapore: {
      costIndex: 1.5,
      supplyReliability: 5.0,
      sourceNote: "Abundant supply from Southeast Asian growers — low logistics cost, year-round availability.",
    },
    uae: {
      costIndex: 2.0,
      supplyReliability: 4.0,
      sourceNote: "Imported from India and Pakistan via established trade routes — reliable and cost-effective.",
    },
    germany: {
      costIndex: 3.5,
      supplyReliability: 3.0,
      sourceNote: "Air-freighted from tropical origins — premium import cost, limited off-season supply.",
    },
    poland: {
      costIndex: 4.0,
      supplyReliability: 2.5,
      sourceNote: "Expensive import with limited cold-chain infrastructure — seasonal availability only.",
    },
  },
  strawberry: {
    singapore: {
      costIndex: 3.0,
      supplyReliability: 3.0,
      sourceNote: "Imported from Australia, Korea, or Japan — moderate cost, some seasonal gaps.",
    },
    uae: {
      costIndex: 3.5,
      supplyReliability: 3.0,
      sourceNote: "Imported year-round with some local hydroponic supply emerging.",
    },
    germany: {
      costIndex: 1.5,
      supplyReliability: 5.0,
      sourceNote: "Locally grown in summer with stable EU import supply year-round — excellent cost efficiency.",
    },
    poland: {
      costIndex: 1.0,
      supplyReliability: 5.0,
      sourceNote: "Poland is a major European strawberry producer — excellent local supply, lowest-cost sourcing.",
    },
  },
  peach: {
    singapore: {
      costIndex: 3.5,
      supplyReliability: 4.0,
      sourceNote: "Bonchi-sourced from Japan — premium but reliable through the farmer network.",
    },
    uae: {
      costIndex: 3.0,
      supplyReliability: 4.0,
      sourceNote: "Bonchi-sourced from Japan with established logistics via the Dubai hub.",
    },
    germany: {
      costIndex: 2.0,
      supplyReliability: 4.5,
      sourceNote: "Bonchi-sourced from Japan with EU supplementary supply — reliable and moderate cost.",
    },
    poland: {
      costIndex: 2.0,
      supplyReliability: 4.5,
      sourceNote: "Bonchi-sourced with local supplementary peach production available.",
    },
  },
  grape: {
    singapore: {
      costIndex: 2.5,
      supplyReliability: 3.5,
      sourceNote: "Japanese grape imports are premium; regional alternatives more affordable.",
    },
    uae: {
      costIndex: 2.5,
      supplyReliability: 3.5,
      sourceNote: "Good import access from multiple origins — moderate cost.",
    },
    germany: {
      costIndex: 2.0,
      supplyReliability: 4.0,
      sourceNote: "Strong local viticulture; table grapes readily available for processing.",
    },
    poland: {
      costIndex: 2.5,
      supplyReliability: 3.5,
      sourceNote: "Moderate supply — EU trade routes keep costs manageable.",
    },
  },
  mikan: {
    singapore: {
      costIndex: 2.0,
      supplyReliability: 4.0,
      sourceNote: "Bonchi-sourced from Japan — reliable supply with strong regional demand for citrus.",
    },
    uae: {
      costIndex: 2.5,
      supplyReliability: 3.5,
      sourceNote: "Bonchi-sourced from Japan — longer supply chain through Dubai.",
    },
    germany: {
      costIndex: 2.5,
      supplyReliability: 4.0,
      sourceNote: "Bonchi-sourced from Japan — EU mandarin supply can supplement for processing.",
    },
    poland: {
      costIndex: 2.5,
      supplyReliability: 3.5,
      sourceNote: "Bonchi-sourced from Japan — seasonal availability, import-dependent.",
    },
  },
};

export function getCostEfficiencyScore(costIndex: number, supplyReliability: number): number {
  return Math.min(5, Math.max(1, 5 - costIndex + supplyReliability * 0.5));
}

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

export function getCostDollarSign(costIndex: number): string {
  if (costIndex <= 1.5) return "$";
  if (costIndex <= 2.5) return "$$";
  if (costIndex <= 3.5) return "$$$";
  if (costIndex <= 4.5) return "$$$$";
  return "$$$$$";
}

export function getSupplyLabel(supplyReliability: number): string {
  if (supplyReliability >= 4.0) return "Year-round";
  if (supplyReliability >= 3.0) return "Seasonal";
  return "Import-dependent";
}

export function getMatchQualityLabel(score: number): string {
  if (score >= 4.5) return "Excellent";
  if (score >= 3.5) return "Strong";
  if (score >= 2.5) return "Good";
  if (score >= 1.5) return "Moderate";
  return "Weak";
}
