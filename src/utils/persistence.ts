/**
 * localStorage Persistence
 *
 * Saves and restores the full app state so edits survive page refreshes.
 */

import type { CountryOption, FruitOption, GelatoBase, StrategyPreset, FactorMap } from "../data/marketFit";

const STORAGE_KEY = "bonchi-market-fit";
const VERSION = 1;

export interface PersistedState {
  version: number;
  countries: CountryOption[];
  fruits: FruitOption[];
  bases: GelatoBase[];
  presets: StrategyPreset[];
  countryId: string;
  baseId: string;
  presetId: string;
  pricePoint: number;
  weights: FactorMap;
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

    const parsed = JSON.parse(raw) as PersistedState;
    if (parsed.version !== VERSION) return null;

    // Basic shape validation
    if (
      !Array.isArray(parsed.countries) ||
      !Array.isArray(parsed.fruits) ||
      !Array.isArray(parsed.bases) ||
      !Array.isArray(parsed.presets) ||
      typeof parsed.countryId !== "string" ||
      typeof parsed.baseId !== "string" ||
      typeof parsed.presetId !== "string" ||
      typeof parsed.pricePoint !== "number" ||
      typeof parsed.weights !== "object"
    ) {
      return null;
    }

    return {
      countries: parsed.countries,
      fruits: parsed.fruits,
      bases: parsed.bases,
      presets: parsed.presets,
      countryId: parsed.countryId,
      baseId: parsed.baseId,
      presetId: parsed.presetId,
      pricePoint: parsed.pricePoint,
      weights: parsed.weights,
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
