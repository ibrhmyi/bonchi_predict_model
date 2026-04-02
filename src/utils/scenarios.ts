/**
 * Scenario Snapshots
 *
 * Save, name, and compare different configurations.
 */

import type { FactorMap } from "../data/marketFit";

const SCENARIOS_KEY = "bonchi-scenarios";

export interface Scenario {
  id: string;
  name: string;
  createdAt: string;
  countryId: string;
  baseId: string;
  presetId: string;
  pricePoint: number;
  weights: FactorMap;
  /** Top concept label at time of save */
  topConcept: string;
  /** Top concept score at time of save */
  topScore: number;
}

export function generateScenarioId(): string {
  return `scenario-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function loadScenarios(): Scenario[] {
  try {
    const raw = localStorage.getItem(SCENARIOS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Scenario[];
  } catch {
    return [];
  }
}

export function saveScenario(scenario: Scenario): Scenario[] {
  const existing = loadScenarios();
  const updated = [scenario, ...existing];
  try {
    localStorage.setItem(SCENARIOS_KEY, JSON.stringify(updated));
  } catch {
    // fail silently
  }
  return updated;
}

export function deleteScenario(id: string): Scenario[] {
  const existing = loadScenarios();
  const updated = existing.filter((s) => s.id !== id);
  try {
    localStorage.setItem(SCENARIOS_KEY, JSON.stringify(updated));
  } catch {
    // fail silently
  }
  return updated;
}

export function renameScenario(id: string, name: string): Scenario[] {
  const existing = loadScenarios();
  const updated = existing.map((s) => (s.id === id ? { ...s, name } : s));
  try {
    localStorage.setItem(SCENARIOS_KEY, JSON.stringify(updated));
  } catch {
    // fail silently
  }
  return updated;
}
