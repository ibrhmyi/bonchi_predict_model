import { useState, type ReactNode } from "react";
import {
  factorDefinitions,
  factorLabels,
  factors,
  type CountryOption,
  type Factor,
  type FactorMap,
  type FruitFactor,
  type FruitOption,
  type GelatoBase,
  type StrategyPreset,
} from "../data/marketFit";
import type { PricingProfile } from "../data/pricing";
import type { FlavorFamiliarity, RegionalFlavorEntry } from "../data/regionalData";
import { numToVerbal, verbalLabels, verbalToNum, type VerbalLevel } from "../data/regionalData";
import { fruitFactors, type DataOverrides } from "../utils/scoring";
import { BenchmarkMatrix } from "./BenchmarkMatrix";

type ModelLibraryProps = {
  countries: CountryOption[];
  fruits: FruitOption[];
  bases: GelatoBase[];
  presets: StrategyPreset[];
  weights: FactorMap;
  pricingByCountry: Record<string, PricingProfile>;
  flavorData: Record<string, Record<string, RegionalFlavorEntry>>;
  productionCostData: Record<string, number>;
  data?: DataOverrides;
  onAddCountry: () => void;
  onAddFruit: () => void;
  onAddBase: () => void;
  onAddPreset: () => void;
  onCountryLabelChange: (id: string, label: string) => void;
  onCountryFactorChange: (id: string, factor: Factor, value: number) => void;
  onFruitLabelChange: (id: string, label: string) => void;
  onFruitFactorChange: (id: string, factor: FruitFactor, value: number) => void;
  onBaseLabelChange: (id: string, label: string) => void;
  onBaseFactorChange: (id: string, factor: Factor, value: number) => void;
  onPresetLabelChange: (id: string, label: string) => void;
  onPresetFactorChange: (id: string, factor: Factor, value: number) => void;
  onPresetSummaryChange: (id: string, summary: string) => void;
  onPricingChange: (countryId: string, field: keyof PricingProfile, value: number | string) => void;
  onFlavorBonusChange: (countryId: string, fruitId: string, field: keyof RegionalFlavorEntry, value: string) => void;
  onProductionCostChange: (baseId: string, value: number) => void;
};

function NumInput({ value, onChange, min = 0, max = 10, step = 0.1, className = "w-20" }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; className?: string;
}) {
  return (
    <input type="number" min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      className={`${className} rounded-xl border border-sand bg-bone px-3 py-2 text-sm text-ink outline-none transition focus:border-[#2D6A4F]`}
    />
  );
}

/** Verbal-label select for 1-5 scales */
function VerbalSelect({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const verbal = numToVerbal(value);
  return (
    <select
      value={verbal}
      onChange={(e) => onChange(verbalToNum(e.target.value as VerbalLevel))}
      className="w-28 rounded-xl border border-sand bg-bone px-2 py-2 text-xs text-ink outline-none transition focus:border-[#2D6A4F]"
    >
      {verbalLabels.map((vl) => (
        <option key={vl} value={vl}>{vl}</option>
      ))}
    </select>
  );
}

function TextInput({ value, onChange, className = "w-40" }: {
  value: string; onChange: (v: string) => void; className?: string;
}) {
  return (
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
      className={`${className} rounded-xl border border-sand bg-bone px-3 py-2 text-sm text-ink outline-none transition focus:border-[#2D6A4F]`}
    />
  );
}

function FactorHeader({ factor }: { factor: Factor }) {
  return (
    <th className="group relative px-3 py-2">
      <span className="cursor-help border-b border-dashed border-stone/40">{factorLabels[factor]}</span>
      <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-1 w-48 -translate-x-1/2 rounded-xl border border-sand bg-white p-3 text-xs font-normal normal-case tracking-normal text-stone opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        <span className="font-medium text-ink">{factorLabels[factor]}</span>: {factorDefinitions[factor]}
      </div>
    </th>
  );
}

function Section({ title, subtitle, action, children, defaultOpen = true }: {
  title: string; subtitle: string; action?: ReactNode; children: ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-4xl border border-white/70 bg-white/80 shadow-panel backdrop-blur">
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 xl:px-8">
        <div className="text-left">
          <h2 className="font-serif text-xl text-ink">{title}</h2>
          <p className="mt-0.5 text-xs text-stone">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          {action}
          <svg className={`h-4 w-4 shrink-0 text-stone transition-transform ${open ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {open && <div className="border-t border-sand px-6 pb-6 pt-4 xl:px-8 overflow-x-auto">{children}</div>}
    </section>
  );
}

export function ModelLibrary(props: ModelLibraryProps) {
  const {
    countries, fruits, bases, presets, weights, data,
    pricingByCountry, flavorData, productionCostData,
    onAddCountry, onAddFruit, onAddBase, onAddPreset,
    onCountryLabelChange, onCountryFactorChange,
    onFruitLabelChange, onFruitFactorChange,
    onBaseLabelChange, onBaseFactorChange,
    onPresetLabelChange, onPresetFactorChange, onPresetSummaryChange,
    onPricingChange, onFlavorBonusChange, onProductionCostChange,
  } = props;

  return (
    <div className="space-y-4">
      {/* Benchmark Matrix */}
      <BenchmarkMatrix countries={countries} bases={bases} fruits={fruits} weights={weights} data={data} />

      {/* Market Profiles */}
      <Section title="Market Profiles" subtitle="Country demand profiles (Very Low – Very High)"
        action={<button type="button" onClick={(e) => { e.stopPropagation(); onAddCountry(); }}
          className="rounded-full bg-[#1B4332] px-3 py-1.5 text-xs font-medium text-white">Add Country</button>}>
        <table className="min-w-full border-separate border-spacing-y-1.5">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.2em] text-stone">
              <th className="px-3 py-2">Country</th>
              {factors.map((f) => <FactorHeader key={f} factor={f} />)}
            </tr>
          </thead>
          <tbody>
            {countries.map((c) => (
              <tr key={c.id} className="bg-[#fffdfa] text-sm">
                <td className="px-3 py-2"><TextInput value={c.label} onChange={(v) => onCountryLabelChange(c.id, v)} /></td>
                {factors.map((f) => (
                  <td key={f} className="px-3 py-2">
                    <VerbalSelect value={c.profile[f]} onChange={(v) => onCountryFactorChange(c.id, f, v)} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* Fruit Characteristics */}
      <Section title="Fruit Characteristics" subtitle="Fruit-level attributes (Very Low – Very High)"
        action={<button type="button" onClick={(e) => { e.stopPropagation(); onAddFruit(); }}
          className="rounded-full bg-[#1B4332] px-3 py-1.5 text-xs font-medium text-white">Add Fruit</button>}>
        <table className="min-w-full border-separate border-spacing-y-1.5">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.2em] text-stone">
              <th className="px-3 py-2">Fruit</th>
              {fruitFactors.map((f) => <FactorHeader key={f} factor={f} />)}
            </tr>
          </thead>
          <tbody>
            {fruits.map((fr) => (
              <tr key={fr.id} className="bg-[#fffdfa] text-sm">
                <td className="px-3 py-2"><TextInput value={fr.label} onChange={(v) => onFruitLabelChange(fr.id, v)} className="w-48" /></td>
                {fruitFactors.map((f) => (
                  <td key={f} className="px-3 py-2">
                    <VerbalSelect value={fr.profile[f]} onChange={(v) => onFruitFactorChange(fr.id, f, v)} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* Product Formats */}
      <Section title="Product Formats" subtitle="Base profiles and production costs" defaultOpen={false}
        action={<button type="button" onClick={(e) => { e.stopPropagation(); onAddBase(); }}
          className="rounded-full bg-[#1B4332] px-3 py-1.5 text-xs font-medium text-white">Add Base</button>}>
        <table className="min-w-full border-separate border-spacing-y-1.5">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.2em] text-stone">
              <th className="px-3 py-2">Base</th>
              {factors.map((f) => <FactorHeader key={f} factor={f} />)}
              <th className="px-3 py-2">Cost ($)</th>
            </tr>
          </thead>
          <tbody>
            {bases.map((b) => (
              <tr key={b.id} className="bg-[#fffdfa] text-sm">
                <td className="px-3 py-2"><TextInput value={b.label} onChange={(v) => onBaseLabelChange(b.id, v)} className="w-44" /></td>
                {factors.map((f) => (
                  <td key={f} className="px-3 py-2">
                    <VerbalSelect value={b.profile[f]} onChange={(v) => onBaseFactorChange(b.id, f, v)} />
                  </td>
                ))}
                <td className="px-3 py-2">
                  <NumInput value={productionCostData[b.id] ?? 2.5} onChange={(v) => onProductionCostChange(b.id, v)} min={0} max={50} step={0.5} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* Pricing */}
      <Section title="Market Pricing" subtitle="Average gelato price and currency per country" defaultOpen={false}>
        <table className="min-w-full border-separate border-spacing-y-1.5">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.2em] text-stone">
              <th className="px-3 py-2">Country</th>
              <th className="px-3 py-2">Avg Price ($)</th>
              <th className="px-3 py-2">Currency</th>
            </tr>
          </thead>
          <tbody>
            {countries.map((c) => {
              const p = pricingByCountry[c.id];
              if (!p) return (
                <tr key={c.id} className="bg-[#fffdfa] text-sm">
                  <td className="px-3 py-2 text-ink">{c.label}</td>
                  <td colSpan={2} className="px-3 py-2 text-xs text-stone">No pricing data — add via scoring</td>
                </tr>
              );
              return (
                <tr key={c.id} className="bg-[#fffdfa] text-sm">
                  <td className="px-3 py-2 font-medium text-ink">{c.label}</td>
                  <td className="px-3 py-2"><NumInput value={p.avgMarketPrice} onChange={(v) => onPricingChange(c.id, "avgMarketPrice", v)} min={0} max={50} step={0.5} /></td>
                  <td className="px-3 py-2"><TextInput value={p.currency} onChange={(v) => onPricingChange(c.id, "currency", v)} className="w-20" /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Section>

      {/* Regional Flavor Familiarity */}
      <Section title="Regional Flavor Familiarity" subtitle="How well each fruit is known in each country" defaultOpen={false}>
        {countries.map((c) => (
          <div key={c.id} className="mb-4 last:mb-0">
            <h3 className="mb-2 text-sm font-semibold text-ink">{c.label}</h3>
            <table className="min-w-full border-separate border-spacing-y-1">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-stone">
                  <th className="px-3 py-1.5">Fruit</th>
                  <th className="px-3 py-1.5">Familiarity</th>
                </tr>
              </thead>
              <tbody>
                {fruits.map((fr) => {
                  const entry = flavorData[c.id]?.[fr.id] ?? { familiarity: "low" as FlavorFamiliarity };
                  return (
                    <tr key={fr.id} className="bg-[#fffdfa] text-sm">
                      <td className="px-3 py-1.5 text-ink">{fr.label}</td>
                      <td className="px-3 py-1.5">
                        <select value={entry.familiarity} onChange={(e) => onFlavorBonusChange(c.id, fr.id, "familiarity", e.target.value)}
                          className="rounded-xl border border-sand bg-bone px-2 py-2 text-xs text-ink outline-none focus:border-[#2D6A4F]">
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                          <option value="novel">Novel</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      </Section>

      {/* Strategy Presets */}
      <Section title="Scoring Weights" subtitle="Preset strategies that determine which factors dominate ranking" defaultOpen={false}
        action={<button type="button" onClick={(e) => { e.stopPropagation(); onAddPreset(); }}
          className="rounded-full bg-[#1B4332] px-3 py-1.5 text-xs font-medium text-white">Add Strategy</button>}>
        <table className="min-w-full border-separate border-spacing-y-1.5">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.2em] text-stone">
              <th className="px-3 py-2">Preset</th>
              {factors.map((f) => <FactorHeader key={f} factor={f} />)}
              <th className="px-3 py-2">Summary</th>
            </tr>
          </thead>
          <tbody>
            {presets.map((p) => (
              <tr key={p.id} className="bg-[#fffdfa] text-sm">
                <td className="px-3 py-2"><TextInput value={p.label} onChange={(v) => onPresetLabelChange(p.id, v)} className="w-36" /></td>
                {factors.map((f) => (
                  <td key={f} className="px-3 py-2">
                    <NumInput value={p.weights[f]} onChange={(v) => onPresetFactorChange(p.id, f, v)} min={0.1} max={3} step={0.1} className="w-16" />
                  </td>
                ))}
                <td className="px-3 py-2"><TextInput value={p.summary} onChange={(v) => onPresetSummaryChange(p.id, v)} className="w-64" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </div>
  );
}
