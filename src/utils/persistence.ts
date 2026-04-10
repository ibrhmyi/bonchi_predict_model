/**
 * localStorage Persistence
 *
 * Saves and restores the full app state so edits survive page refreshes.
 */

import type { CountryOption, FruitOption, GelatoBase, StrategyPreset, FactorMap } from "../data/marketFit";
import type { PricingProfile } from "../data/pricing";
import type { RegionalFlavorEntry } from "../data/regionalData";

const STORAGE_KEY = "bonchi-market-fit";
const VERSION = 3;

export interface PersistedState {
  version: number;
  countries: CountryOption[];
  fruits: FruitOption[];
  bases: GelatoBase[];
  presets: StrategyPreset[];
  countryId: string;
  baseId: string;
  presetId: string;
  pricePoints: Record<string, number>;
  weights: FactorMap;
  pricingByCountry?: Record<string, PricingProfile>;
  regionalFlavorBonus?: Record<string, Record<string, RegionalFlavorEntry>>;
  baseProductionCost?: Record<string, number>;
}

export function saveState(state: Omit<PersistedState, "version">): void {
  try {
    const payload: PersistedState = { version: VERSION, ...state };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage might be full or unavailable — fail silently
  }
}

export function loadState(): Omit<PersistedState, "version"> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as PersistedState & { pricePoint?: number };
    // Accept version 1, 2 or 3
    if (![1, 2, 3].includes(parsed.version)) return null;

    if (
      !Array.isArray(parsed.countries) ||
      !Array.isArray(parsed.fruits) ||
      !Array.isArray(parsed.bases) ||
      !Array.isArray(parsed.presets) ||
      typeof parsed.countryId !== "string" ||
      typeof parsed.baseId !== "string" ||
      typeof parsed.presetId !== "string" ||
      typeof parsed.weights !== "object"
    ) {
      return null;
    }

    // Migrate v1/v2 single pricePoint → per-base pricePoints
    let pricePoints: Record<string, number>;
    if (parsed.pricePoints && typeof parsed.pricePoints === "object") {
      pricePoints = parsed.pricePoints;
    } else {
      const oldPrice = typeof parsed.pricePoint === "number" ? parsed.pricePoint : 5;
      pricePoints = Object.fromEntries(parsed.bases.map((b) => [b.id, oldPrice]));
    }

    // Migrate old flavor entries that have bonus/reason fields → strip to just familiarity
    let flavorBonus = parsed.regionalFlavorBonus;
    if (flavorBonus) {
      const migrated: Record<string, Record<string, RegionalFlavorEntry>> = {};
      for (const [cId, fruits] of Object.entries(flavorBonus)) {
        migrated[cId] = {};
        for (const [fId, entry] of Object.entries(fruits)) {
          migrated[cId][fId] = { familiarity: (entry as { familiarity?: string }).familiarity as RegionalFlavorEntry["familiarity"] ?? "low" };
        }
      }
      flavorBonus = migrated;
    }

    // Strip removed fields from pricing (priceSensitivity, costMultiplier)
    let pricingByCountry = parsed.pricingByCountry;
    if (pricingByCountry) {
      const migrated: Record<string, PricingProfile> = {};
      for (const [cId, profile] of Object.entries(pricingByCountry)) {
        migrated[cId] = {
          avgMarketPrice: (profile as { avgMarketPrice?: number }).avgMarketPrice ?? 4,
          currency: (profile as { currency?: string }).currency ?? "USD",
        };
      }
      pricingByCountry = migrated;
    }

    return {
      countries: parsed.countries,
      fruits: parsed.fruits,
      bases: parsed.bases,
      presets: parsed.presets,
      countryId: parsed.countryId,
      baseId: parsed.baseId,
      presetId: parsed.presetId,
      pricePoints,
      weights: parsed.weights,
      pricingByCountry,
      regionalFlavorBonus: flavorBonus,
      baseProductionCost: parsed.baseProductionCost,
    };
  } catch {
    return null;
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // fail silently
  }
}
