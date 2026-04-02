export interface PricingProfile {
  priceSensitivity: number;
  avgMarketPrice: number;
  currency: string;
  costMultiplier: number;
}

export const pricingByCountry: Record<string, PricingProfile> = {
  uae: {
    priceSensitivity: 1.5,
    avgMarketPrice: 6,
    currency: "USD",
    costMultiplier: 1.3,
  },
  germany: {
    priceSensitivity: 3.5,
    avgMarketPrice: 4,
    currency: "EUR",
    costMultiplier: 1.1,
  },
  singapore: {
    priceSensitivity: 2.0,
    avgMarketPrice: 5,
    currency: "SGD",
    costMultiplier: 1.2,
  },
  poland: {
    priceSensitivity: 4.5,
    avgMarketPrice: 2.5,
    currency: "USD",
    costMultiplier: 0.8,
  },
};

export const baseProductionCost: Record<string, number> = {
  sorbet: 2,
  "premium-fruit-gelato": 4,
  "vegan-gelato": 3,
  "milk-gelato": 2.5,
};

export function calculatePriceFit(
  pricePoint: number,
  avgMarketPrice: number,
  priceSensitivity: number,
): number {
  const priceRatio = pricePoint / avgMarketPrice;
  if (priceRatio >= 0.8 && priceRatio <= 1.2) return 5;
  if (priceRatio > 1.5) return Math.max(1, 5 - priceSensitivity * (priceRatio - 1));
  if (priceRatio > 1.2) return Math.max(1, 5 - priceSensitivity * (priceRatio - 1) * 0.5);
  if (priceRatio < 0.5) return Math.max(1, 3 - (1 - priceRatio) * 2);
  return Math.max(1, 4 - (1 - priceRatio) * 2);
}

export function calculateMargin(
  pricePoint: number,
  baseId: string,
  fruitCostIndex: number,
  costMultiplier: number,
): number {
  const baseCost = baseProductionCost[baseId] ?? 2.5;
  return Math.round((pricePoint - baseCost * fruitCostIndex * 0.3 * costMultiplier) * 100) / 100;
}

export type PriceImpact = "boost" | "neutral" | "penalty";

export function getPriceImpact(priceFit: number): PriceImpact {
  if (priceFit >= 4) return "boost";
  if (priceFit >= 2.5) return "neutral";
  return "penalty";
}
