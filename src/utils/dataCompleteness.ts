import type { FruitOption } from "../data/marketFit";
import type { FruitCostEntry, RegionalFlavorEntry } from "../data/regionalData";

/**
 * Detects countries whose supporting data is blank enough that the ranking
 * becomes meaningless (every fruit ties on pure profile match). A country is
 * "incomplete" when more than half of its fruits have no flavor signal AND
 * sit at the neutral sourcing default.
 */
export function countryDataCompleteness(
  countryId: string,
  fruits: FruitOption[],
  flavorData: Record<string, Record<string, RegionalFlavorEntry>>,
  fruitCostData: Record<string, Record<string, FruitCostEntry>>,
): {
  flavorFilled: number;
  costFilled: number;
  total: number;
  incomplete: boolean;
} {
  const total = fruits.length;
  if (total === 0) return { flavorFilled: 0, costFilled: 0, total: 0, incomplete: false };

  let flavorFilled = 0;
  let costFilled = 0;
  for (const fr of fruits) {
    const flavor = flavorData[countryId]?.[fr.id];
    if (flavor && !(flavor.bonus === 0 && flavor.familiarity === "low")) flavorFilled++;

    const cost = fruitCostData[fr.id]?.[countryId];
    // The auto-populated default is 2.5 / 3 / empty-note; anything other than
    // that exact default is considered "touched".
    if (
      cost &&
      !(cost.costIndex === 2.5 && cost.supplyReliability === 3 && !cost.sourceNote)
    ) {
      costFilled++;
    }
  }

  const incomplete = flavorFilled < Math.ceil(total / 2) || costFilled < Math.ceil(total / 2);
  return { flavorFilled, costFilled, total, incomplete };
}
