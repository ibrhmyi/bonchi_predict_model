import { useCallback, useRef, useEffect } from "react";
import {
  emptyCountryProfile,
  emptyFruitProfile,
  type CountryOption,
  type Factor,
  type FactorMap,
  type FruitFactor,
  type FruitFactorMap,
  type FruitOption,
  type GelatoBase,
  type StrategyPreset,
} from "../data/marketFit";
import type { PricingProfile } from "../data/pricing";
import type { FlavorFamiliarity, RegionalFlavorEntry } from "../data/regionalData";
import { rankFruitConcepts, type DataOverrides } from "../utils/scoring";
import type { ToolName } from "./tools";

type State = {
  countries: CountryOption[];
  fruits: FruitOption[];
  bases: GelatoBase[];
  presets: StrategyPreset[];
  pricingData: Record<string, PricingProfile>;
  flavorData: Record<string, Record<string, RegionalFlavorEntry>>;
  productionCostData: Record<string, number>;
  countryId: string;
  baseId: string;
  presetId: string;
  pricePoints: Record<string, number>;
  weights: FactorMap;
};

type Setters = {
  setCountries: React.Dispatch<React.SetStateAction<CountryOption[]>>;
  setFruits: React.Dispatch<React.SetStateAction<FruitOption[]>>;
  setBases: React.Dispatch<React.SetStateAction<GelatoBase[]>>;
  setPresets: React.Dispatch<React.SetStateAction<StrategyPreset[]>>;
  setPricingData: React.Dispatch<React.SetStateAction<Record<string, PricingProfile>>>;
  setFlavorData: React.Dispatch<React.SetStateAction<Record<string, Record<string, RegionalFlavorEntry>>>>;
  setProductionCostData: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  setCountryId: React.Dispatch<React.SetStateAction<string>>;
  setBaseId: React.Dispatch<React.SetStateAction<string>>;
  setPresetId: React.Dispatch<React.SetStateAction<string>>;
  setPricePoints: React.Dispatch<React.SetStateAction<Record<string, number>>>;
};

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `id-${Date.now()}`;

export function useToolHandlers(state: State, setters: Setters) {
  // Keep latest state in a ref so the handler closure is stable
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  return useCallback(
    async (toolName: ToolName, input: Record<string, unknown>): Promise<unknown> => {
      const s = stateRef.current;
      const activePricePoint = s.pricePoints[s.baseId] ?? 5;

      switch (toolName) {
        case "getSnapshot": {
          const dataOverrides: DataOverrides = {
            pricingByCountry: s.pricingData,
            regionalFlavorBonus: s.flavorData,
            baseProductionCost: s.productionCostData,
          };
          const country = s.countries.find((c) => c.id === s.countryId) ?? s.countries[0];
          const base = s.bases.find((b) => b.id === s.baseId) ?? s.bases[0];
          const ranking =
            country && base
              ? rankFruitConcepts({
                  country,
                  base,
                  fruits: s.fruits,
                  weights: s.weights,
                  pricePoint: activePricePoint,
                  data: dataOverrides,
                }).slice(0, 5)
              : [];
          return {
            countries: s.countries.map((c) => ({ id: c.id, label: c.label, profile: c.profile })),
            fruits: s.fruits.map((f) => ({ id: f.id, label: f.label, profile: f.profile })),
            bases: s.bases.map((b) => ({ id: b.id, label: b.label })),
            strategies: s.presets.map((p) => ({ id: p.id, label: p.label, summary: p.summary })),
            pricing: s.pricingData,
            currentSelection: {
              countryId: s.countryId,
              countryLabel: country?.label,
              baseId: s.baseId,
              baseLabel: base?.label,
              presetId: s.presetId,
              pricePoint: activePricePoint,
            },
            topConcepts: ranking.map((r) => ({
              rank: ranking.indexOf(r) + 1,
              concept: r.conceptLabel,
              score: Math.round(r.score * 100) / 100,
              fruitId: r.fruit.id,
              regionalBonus: r.regionalBonus,
              insights: r.insights,
            })),
          };
        }

        case "addCountry": {
          const label = String(input.label ?? "New Country");
          const id = `c-${slugify(label)}-${Date.now().toString(36)}`;
          const profile: FactorMap = {
            ...emptyCountryProfile(),
            ...((input.profile as Partial<FactorMap>) ?? {}),
          };
          setters.setCountries((prev) => [...prev, { id, label, profile }]);
          setters.setPricingData((prev) => ({
            ...prev,
            [id]: {
              avgMarketPrice: typeof input.avgMarketPrice === "number" ? input.avgMarketPrice : 4,
              currency: typeof input.currency === "string" ? input.currency : "USD",
            },
          }));

          // Build flavor lookup from LLM input, fall back to "low" for missing fruits
          type FlavorInput = { fruitId: string; familiarity?: FlavorFamiliarity };
          const flavorInputs = Array.isArray(input.flavorFamiliarity)
            ? (input.flavorFamiliarity as FlavorInput[])
            : [];
          const flavorMap = new Map<string, FlavorInput>();
          for (const fb of flavorInputs) if (fb?.fruitId) flavorMap.set(fb.fruitId, fb);
          setters.setFlavorData((prev) => {
            const next = { ...prev, [id]: {} as Record<string, RegionalFlavorEntry> };
            for (const fr of s.fruits) {
              const fb = flavorMap.get(fr.id);
              next[id][fr.id] = {
                familiarity: (fb?.familiarity ?? "low") as FlavorFamiliarity,
              };
            }
            return next;
          });

          const filledFlavor = flavorMap.size;
          return {
            ok: true,
            id,
            label,
            message: `Added ${label} with ${filledFlavor}/${s.fruits.length} flavor rows filled.`,
          };
        }

        case "addFruit": {
          const label = String(input.label ?? "New Fruit");
          const id = `f-${slugify(label)}-${Date.now().toString(36)}`;
          const profile: FruitFactorMap = {
            ...emptyFruitProfile(),
            ...((input.profile as Partial<FruitFactorMap>) ?? {}),
          };
          setters.setFruits((prev) => [...prev, { id, label, profile }]);
          setters.setFlavorData((prev) => {
            const next = { ...prev };
            for (const c of s.countries) {
              next[c.id] = {
                ...next[c.id],
                [id]: { familiarity: "low" as FlavorFamiliarity },
              };
            }
            return next;
          });
          return { ok: true, id, label, message: `Added ${label}` };
        }

        case "updateMarketPricing": {
          const cId = String(input.countryId);
          const country = s.countries.find((c) => c.id === cId);
          if (!country) return { ok: false, error: `Country ${cId} not found` };
          setters.setPricingData((prev) => ({
            ...prev,
            [cId]: {
              ...(prev[cId] ?? { avgMarketPrice: 4, currency: "USD" }),
              ...(typeof input.avgMarketPrice === "number" ? { avgMarketPrice: input.avgMarketPrice } : {}),
              ...(typeof input.currency === "string" ? { currency: input.currency } : {}),
            },
          }));
          return { ok: true, message: `Updated pricing for ${country.label}` };
        }

        case "updateFlavorFamiliarity": {
          const cId = String(input.countryId);
          const fId = String(input.fruitId);
          const country = s.countries.find((c) => c.id === cId);
          const fruit = s.fruits.find((f) => f.id === fId);
          if (!country || !fruit) return { ok: false, error: "Country or fruit not found" };
          setters.setFlavorData((prev) => ({
            ...prev,
            [cId]: {
              ...prev[cId],
              [fId]: {
                familiarity: (typeof input.familiarity === "string" ? input.familiarity : "low") as FlavorFamiliarity,
              },
            },
          }));
          return { ok: true, message: `Updated ${fruit.label} familiarity in ${country.label}` };
        }

        case "setSelection": {
          const updates: string[] = [];
          if (typeof input.countryId === "string") {
            const c = s.countries.find((x) => x.id === input.countryId);
            if (c) {
              setters.setCountryId(c.id);
              updates.push(`country=${c.label}`);
            }
          }
          if (typeof input.baseId === "string") {
            const b = s.bases.find((x) => x.id === input.baseId);
            if (b) {
              setters.setBaseId(b.id);
              updates.push(`base=${b.label}`);
            }
          }
          if (typeof input.presetId === "string") {
            const p = s.presets.find((x) => x.id === input.presetId);
            if (p) {
              setters.setPresetId(p.id);
              updates.push(`strategy=${p.label}`);
            }
          }
          if (typeof input.pricePoint === "number") {
            const baseToSet = typeof input.baseId === "string" ? input.baseId : s.baseId;
            setters.setPricePoints((prev) => ({ ...prev, [baseToSet]: input.pricePoint as number }));
            updates.push(`price=$${input.pricePoint}`);
          }
          return { ok: true, message: `Updated selection: ${updates.join(", ")}` };
        }

        case "runAnalysis": {
          const limit = typeof input.limit === "number" ? input.limit : 5;
          const dataOverrides: DataOverrides = {
            pricingByCountry: s.pricingData,
            regionalFlavorBonus: s.flavorData,
            baseProductionCost: s.productionCostData,
          };
          const country = s.countries.find((c) => c.id === s.countryId);
          const base = s.bases.find((b) => b.id === s.baseId);
          if (!country || !base) return { ok: false, error: "No country/base selected" };
          const ranking = rankFruitConcepts({
            country,
            base,
            fruits: s.fruits,
            weights: s.weights,
            pricePoint: activePricePoint,
            data: dataOverrides,
          }).slice(0, limit);
          return {
            ok: true,
            country: country.label,
            base: base.label,
            pricePoint: activePricePoint,
            results: ranking.map((r, i) => ({
              rank: i + 1,
              concept: r.conceptLabel,
              score: Math.round(r.score * 100) / 100,
              regionalBonus: Math.round(r.regionalBonus * 100) / 100,
              topInsights: r.insights.slice(0, 2),
              factors: r.factorDetails.map((d) => ({
                factor: d.factor,
                country: d.countryValue,
                concept: Math.round(d.conceptValue * 10) / 10,
                weighted: Math.round(d.weightedMatch * 100) / 100,
              })),
            })),
          };
        }

        default: {
          const _exhaustive: never = toolName;
          return { ok: false, error: `Unknown tool: ${String(_exhaustive)}` };
        }
      }
    },
    [setters],
  );
}

// Re-export types so consumers don't need to redeclare
export type { Factor, FruitFactor };
