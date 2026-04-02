/**
 * Data Health Check
 *
 * Validates that all cross-referenced data entries exist.
 * Catches missing regional flavor data, missing cost data, missing pricing, etc.
 */

import type { CountryOption, FruitOption, GelatoBase } from "../data/marketFit";
import { pricingByCountry, baseProductionCost } from "../data/pricing";
import { regionalFlavorBonus, fruitCostByCountry } from "../data/regionalData";
import { demographicsByCountry } from "../data/demographics";

export type HealthSeverity = "error" | "warning";

export interface HealthIssue {
  severity: HealthSeverity;
  category: string;
  message: string;
}

export function runDataHealthCheck(
  countries: CountryOption[],
  fruits: FruitOption[],
  bases: GelatoBase[],
): HealthIssue[] {
  const issues: HealthIssue[] = [];

  for (const country of countries) {
    // Check pricing data exists
    if (!pricingByCountry[country.id]) {
      issues.push({
        severity: "error",
        category: "Pricing",
        message: `Missing pricing profile for "${country.label}" (${country.id}). Price simulation won't work.`,
      });
    }

    // Check demographics data exists
    if (!demographicsByCountry[country.id]) {
      issues.push({
        severity: "warning",
        category: "Demographics",
        message: `Missing demographics data for "${country.label}" (${country.id}). Demographics panel will be empty.`,
      });
    }

    // Check regional flavor data exists for each fruit
    for (const fruit of fruits) {
      if (!regionalFlavorBonus[country.id]?.[fruit.id]) {
        issues.push({
          severity: "warning",
          category: "Regional Flavor",
          message: `Missing flavor bonus for "${fruit.label}" in "${country.label}". Regional bonus will default to 0.`,
        });
      }
    }

    // Check fruit cost data exists for each fruit
    for (const fruit of fruits) {
      if (!fruitCostByCountry[fruit.id]?.[country.id]) {
        issues.push({
          severity: "warning",
          category: "Fruit Cost",
          message: `Missing cost data for "${fruit.label}" in "${country.label}". Cost efficiency won't appear.`,
        });
      }
    }
  }

  // Check base production costs
  for (const base of bases) {
    if (baseProductionCost[base.id] === undefined) {
      issues.push({
        severity: "warning",
        category: "Production Cost",
        message: `Missing production cost for base "${base.label}" (${base.id}). Using default $2.50.`,
      });
    }
  }

  // Check for factor value ranges
  for (const country of countries) {
    for (const [key, value] of Object.entries(country.profile)) {
      if (value < 1 || value > 5) {
        issues.push({
          severity: "error",
          category: "Data Range",
          message: `"${country.label}" has ${key}=${value} — must be 1–5.`,
        });
      }
    }
  }

  for (const fruit of fruits) {
    for (const [key, value] of Object.entries(fruit.profile)) {
      if (value < 1 || value > 5) {
        issues.push({
          severity: "error",
          category: "Data Range",
          message: `"${fruit.label}" has ${key}=${value} — must be 1–5.`,
        });
      }
    }
  }

  return issues;
}
