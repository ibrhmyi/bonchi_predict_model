import type { FruitOption } from "../data/marketFit";
import type { RegionalFlavorEntry } from "../data/regionalData";

/**
 * Detects countries whose supporting data is blank enough that the ranking
 * becomes meaningless. A country is "incomplete" when more than half of its
 * fruits have no flavor familiarity set (defaulting to "low").
 */
export function countryDataCompleteness(
  countryId: string,
  fruits: FruitOption[],
  flavorData: Record<string, Record<string, RegionalFlavorEntry>>,
): {
  flavorFilled: number;
  total: number;
  incomplete: boolean;
} {
  const total = fruits.length;
  if (total === 0) return { flavorFilled: 0, total: 0, incomplete: false };

  let flavorFilled = 0;
  for (const fr of fruits) {
    const flavor = flavorData[countryId]?.[fr.id];
    // Anything other than the default "low" is considered filled
    if (flavor && flavor.familiarity !== "low") flavorFilled++;
  }

  const incomplete = flavorFilled < Math.ceil(total / 2);
  return { flavorFilled, total, incomplete };
}
