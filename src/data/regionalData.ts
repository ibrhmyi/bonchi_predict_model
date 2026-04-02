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
      reason: "Mango is one of the most popular flavors in the UAE — a staple in juices, desserts, and gelato.",
      familiarity: "high",
    },
    strawberry: {
      bonus: 0.3,
      reason: "Strawberry is widely accepted but not distinctive in the UAE market.",
      familiarity: "medium",
    },
    peach: {
      bonus: 0.2,
      reason: "Peach is uncommon in UAE desserts — positioned as a premium Japanese novelty.",
      familiarity: "low",
    },
    grape: {
      bonus: 0.1,
      reason: "Grape flavoring exists but rarely in premium gelato contexts in the UAE.",
      familiarity: "low",
    },
    mikan: {
      bonus: 0.4,
      reason: "Citrus fruits are popular in the UAE; mikan offers a refined Japanese twist.",
      familiarity: "novel",
    },
  },
  germany: {
    mango: {
      bonus: 0.3,
      reason: "Mango has grown in popularity but remains a tropical import flavor in Germany.",
      familiarity: "medium",
    },
    strawberry: {
      bonus: 0.7,
      reason: "Strawberry is Germany's favorite fruit flavor — Erdbeere is a summer institution.",
      familiarity: "high",
    },
    peach: {
      bonus: 0.4,
      reason: "Peach (Pfirsich) is well-liked in Germany, especially in yogurt and Eisdiele menus.",
      familiarity: "medium",
    },
    grape: {
      bonus: 0.3,
      reason: "Germany's wine culture gives grape flavor some cultural resonance.",
      familiarity: "medium",
    },
    mikan: {
      bonus: 0.2,
      reason: "Mandarine is known in Germany but mikan as a Japanese variety adds exotic appeal.",
      familiarity: "novel",
    },
  },
  singapore: {
    mango: {
      bonus: 0.7,
      reason: "Mango is a beloved tropical staple in Singapore — found in everything from desserts to sticky rice.",
      familiarity: "high",
    },
    strawberry: {
      bonus: 0.2,
      reason: "Strawberry is popular but imported; less culturally rooted than tropical fruits.",
      familiarity: "medium",
    },
    peach: {
      bonus: 0.3,
      reason: "Peach has growing appeal through Japanese food culture influence in Singapore.",
      familiarity: "low",
    },
    grape: {
      bonus: 0.5,
      reason: "Japanese grape (kyoho-style) is a premium delicacy in Singapore — strong brand potential.",
      familiarity: "medium",
    },
    mikan: {
      bonus: 0.6,
      reason: "Japanese citrus is well-regarded in Singapore's food scene; yuzu and mikan have premium cachet.",
      familiarity: "medium",
    },
  },
  poland: {
    mango: {
      bonus: 0.1,
      reason: "Mango is still relatively exotic in Poland — limited local availability and awareness.",
      familiarity: "low",
    },
    strawberry: {
      bonus: 0.8,
      reason: "Strawberry (truskawka) is Poland's most beloved fruit — deeply embedded in local food culture.",
      familiarity: "high",
    },
    peach: {
      bonus: 0.3,
      reason: "Peach is moderately popular in Poland, mostly through canned and juice consumption.",
      familiarity: "medium",
    },
    grape: {
      bonus: 0.2,
      reason: "Grape is recognized but not strongly associated with premium desserts in Poland.",
      familiarity: "low",
    },
    mikan: {
      bonus: 0.1,
      reason: "Mandarin oranges are common in winter but mikan is an unfamiliar Japanese variety.",
      familiarity: "novel",
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
      supplyReliability: 4.5,
      sourceNote: "Abundant supply from Southeast Asian growers — low logistics cost.",
    },
    uae: {
      costIndex: 2.0,
      supplyReliability: 4.0,
      sourceNote: "Imported from India and Pakistan — established trade routes.",
    },
    germany: {
      costIndex: 3.5,
      supplyReliability: 3.0,
      sourceNote: "Air-freighted from tropical origins — premium import cost.",
    },
    poland: {
      costIndex: 4.0,
      supplyReliability: 2.5,
      sourceNote: "Expensive import with limited cold-chain infrastructure.",
    },
  },
  strawberry: {
    singapore: {
      costIndex: 3.0,
      supplyReliability: 3.0,
      sourceNote: "Imported from Australia, Korea, or Japan — moderate cost.",
    },
    uae: {
      costIndex: 3.5,
      supplyReliability: 3.0,
      sourceNote: "Imported year-round — some local hydroponic supply emerging.",
    },
    germany: {
      costIndex: 1.5,
      supplyReliability: 4.5,
      sourceNote: "Locally grown in summer; stable EU import supply year-round.",
    },
    poland: {
      costIndex: 1.5,
      supplyReliability: 4.5,
      sourceNote: "Poland is a major European strawberry producer — excellent local supply.",
    },
  },
  peach: {
    singapore: {
      costIndex: 3.5,
      supplyReliability: 4.0,
      sourceNote: "Bonchi-sourced from Japan — premium but reliable through farmer network.",
    },
    uae: {
      costIndex: 3.0,
      supplyReliability: 4.0,
      sourceNote: "Bonchi-sourced from Japan — established logistics via Dubai hub.",
    },
    germany: {
      costIndex: 2.0,
      supplyReliability: 4.5,
      sourceNote: "Bonchi-sourced from Japan with EU supplementary supply — reliable.",
    },
    poland: {
      costIndex: 2.0,
      supplyReliability: 4.5,
      sourceNote: "Bonchi-sourced with local supplementary peach production.",
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
      sourceNote: "Strong local viticulture; table grapes readily available.",
    },
    poland: {
      costIndex: 2.5,
      supplyReliability: 3.5,
      sourceNote: "Moderate supply — EU trade routes keep costs manageable.",
    },
  },
  mikan: {
    singapore: {
      costIndex: 3.0,
      supplyReliability: 4.0,
      sourceNote: "Bonchi-sourced from Japan — reliable but premium logistics cost.",
    },
    uae: {
      costIndex: 3.5,
      supplyReliability: 3.5,
      sourceNote: "Bonchi-sourced from Japan — longer supply chain through Dubai.",
    },
    germany: {
      costIndex: 3.0,
      supplyReliability: 4.0,
      sourceNote: "Bonchi-sourced from Japan — EU mandarin supply can supplement.",
    },
    poland: {
      costIndex: 3.5,
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
      return { label: "Strong local affinity", color: "green" };
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
