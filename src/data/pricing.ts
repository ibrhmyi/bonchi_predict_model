export interface PricingProfile {
  avgMarketPrice: number;
  currency: string;
}

export const pricingByCountry: Record<string, PricingProfile> = {
  uae: {
    avgMarketPrice: 6,
    currency: "USD",
  },
  germany: {
    avgMarketPrice: 4,
    currency: "EUR",
  },
  singapore: {
    avgMarketPrice: 5,
    currency: "SGD",
  },
  poland: {
    avgMarketPrice: 2.5,
    currency: "USD",
  },
};

export const baseProductionCost: Record<string, number> = {
  sorbet: 2,
  "premium-fruit-gelato": 4,
  "vegan-gelato": 3,
  "milk-gelato": 2.5,
};

/**
 * Price fit — how well the selling price matches the local market.
 * Pure ratio-based: within 80-120% of avg = perfect (5).
 */
export function calculatePriceFit(
  pricePoint: number,
  avgMarketPrice: number,
): number {
  const priceRatio = pricePoint / avgMarketPrice;
  if (priceRatio >= 0.8 && priceRatio <= 1.2) return 5;
  if (priceRatio > 1.5) return Math.max(1, 5 - (priceRatio - 1) * 2);
  if (priceRatio > 1.2) return Math.max(1, 5 - (priceRatio - 1));
  if (priceRatio < 0.5) return Math.max(1, 3 - (1 - priceRatio) * 2);
  return Math.max(1, 4 - (1 - priceRatio) * 2);
}

/**
 * Margin = selling price - base production cost. Simple.
 */
export function calculateMargin(
  pricePoint: number,
  baseId: string,
): number {
  const baseCost = baseProductionCost[baseId] ?? 2.5;
  return Math.round((pricePoint - baseCost) * 100) / 100;
}

export type PriceImpact = "boost" | "neutral" | "penalty";

export function getPriceImpact(priceFit: number): PriceImpact {
  if (priceFit >= 4) return "boost";
  if (priceFit >= 2.5) return "neutral";
  return "penalty";
}
