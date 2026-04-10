import { useState, type ReactNode } from "react";
import {
  type CountryOption,
  type FactorDef,
  type FactorMap,
  type FruitOption,
  type GelatoBase,
  type StrategyPreset,
} from "../data/marketFit";
import type { PricingProfile } from "../data/pricing";
import type { FlavorFamiliarity, RegionalFlavorEntry } from "../data/regionalData";
import { numToVerbal, verbalLabels, verbalToNum, type VerbalLevel } from "../data/regionalData";
import type { DataOverrides } from "../utils/scoring";
import { BenchmarkMatrix } from "./BenchmarkMatrix";

type ModelLibraryProps = {
  countries: CountryOption[];
  fruits: FruitOption[];
  bases: GelatoBase[];
  presets: StrategyPreset[];
  factorDefs: FactorDef[];
  weights: FactorMap;
  pricingByCountry: Record<string, PricingProfile>;
  flavorData: Record<string, Record<string, RegionalFlavorEntry>>;
  productionCostData: Record<string, number>;
  data?: DataOverrides;
  onAddCountry: () => void;
  onDeleteCountry: (id: string) => void;
  onAddFruit: () => void;
  onDeleteFruit: (id: string) => void;
  onAddBase: () => void;
  onDeleteBase: (id: string) => void;
  onAddPreset: () => void;
  onDeletePreset: (id: string) => void;
  onAddFactor: () => void;
  onDeleteFactor: (id: string) => void;
  onRenameFactor: (id: string, label: string) => void;
  onFactorDefinitionChange: (id: string, definition: string) => void;
  onCountryLabelChange: (id: string, label: string) => void;
  onCountryFactorChange: (id: string, factor: string, value: number) => void;
  onFruitLabelChange: (id: string, label: string) => void;
  onFruitFactorChange: (id: string, factor: string, value: number) => void;
  onBaseLabelChange: (id: string, label: string) => void;
  onBaseFactorChange: (id: string, factor: string, value: number) => void;
  onPresetLabelChange: (id: string, label: string) => void;
  onPresetFactorChange: (id: string, factor: string, value: number) => void;
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

function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} title="Remove"
      className="rounded-full p-1 text-stone/50 transition hover:bg-red-50 hover:text-red-500">
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
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

function FactorHeader({ factorDef, onDelete, canDelete }: { factorDef: FactorDef; onDelete?: () => void; canDelete?: boolean }) {
  return (
    <th className="group relative px-3 py-2">
      <span className="cursor-help border-b border-dashed border-stone/40">{factorDef.label}</span>
      {canDelete && onDelete && (
        <button type="button" onClick={onDelete} title={`Remove ${factorDef.label} factor`}
          className="ml-1 inline-block rounded-full p-0.5 text-stone/30 transition hover:text-red-500">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
      <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-1 w-48 -translate-x-1/2 rounded-xl border border-sand bg-white p-3 text-xs font-normal normal-case tracking-normal text-stone opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        <span className="font-medium text-ink">{factorDef.label}</span>: {factorDef.definition}
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
    countries, fruits, bases, presets, factorDefs, weights, data,
    pricingByCountry, flavorData, productionCostData,
    onAddCountry, onDeleteCountry, onAddFruit, onDeleteFruit, onAddBase, onDeleteBase, onAddPreset, onDeletePreset,
    onAddFactor, onDeleteFactor, onRenameFactor, onFactorDefinitionChange,
    onCountryLabelChange, onCountryFactorChange,
    onFruitLabelChange, onFruitFactorChange,
    onBaseLabelChange, onBaseFactorChange,
    onPresetLabelChange, onPresetFactorChange, onPresetSummaryChange,
    onPricingChange, onFlavorBonusChange, onProductionCostChange,
  } = props;

  const canDeleteFactor = factorDefs.length > 1;

  return (
    <div className="space-y-4">
      {/* Benchmark Matrix */}
      <BenchmarkMatrix countries={countries} bases={bases} fruits={fruits} weights={weights} factorDefs={factorDefs} data={data} />

      {/* Factor Definitions */}
      <Section title="Scoring Factors" subtitle="Add, remove, or rename the dimensions used to score concepts"
        action={<button type="button" onClick={(e) => { e.stopPropagation(); onAddFactor(); }}
          className="rounded-full bg-[#1B4332] px-3 py-1.5 text-xs font-medium text-white">Add Factor</button>}>
        <table className="min-w-full border-separate border-spacing-y-1.5">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.2em] text-stone">
              <th className="px-3 py-2">Label</th>
              <th className="px-3 py-2">Definition</th>
              <th className="px-3 py-2">Blend Mode</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {factorDefs.map((fd) => (
              <tr key={fd.id} className="bg-[#fffdfa] text-sm">
                <td className="px-3 py-2">
                  <TextInput value={fd.label} onChange={(v) => onRenameFactor(fd.id, v)} className="w-36" />
                </td>
                <td className="px-3 py-2">
                  <TextInput value={fd.definition} onChange={(v) => onFactorDefinitionChange(fd.id, v)} className="w-72" />
                </td>
                <td className="px-3 py-2 text-xs text-stone capitalize">{fd.blendMode ?? "standard"}</td>
                <td className="px-3 py-2">
                  {canDeleteFactor && <DeleteButton onClick={() => onDeleteFactor(fd.id)} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* Market Profiles — includes pricing columns */}
      <Section title="Market Profiles" subtitle="Country demand profiles, pricing, and currency"
        action={<button type="button" onClick={(e) => { e.stopPropagation(); onAddCountry(); }}
          className="rounded-full bg-[#1B4332] px-3 py-1.5 text-xs font-medium text-white">Add Country</button>}>
        <table className="min-w-full border-separate border-spacing-y-1.5">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.2em] text-stone">
              <th className="px-3 py-2">Country</th>
              {factorDefs.map((fd) => (
                <FactorHeader key={fd.id} factorDef={fd} />
              ))}
              <th className="px-3 py-2">Avg Price ($)</th>
              <th className="px-3 py-2">Currency</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {countries.map((c) => {
              const p = pricingByCountry[c.id];
              return (
                <tr key={c.id} className="bg-[#fffdfa] text-sm">
                  <td className="px-3 py-2"><TextInput value={c.label} onChange={(v) => onCountryLabelChange(c.id, v)} /></td>
                  {factorDefs.map((fd) => (
                    <td key={fd.id} className="px-3 py-2">
                      <VerbalSelect value={c.profile[fd.id] ?? 3} onChange={(v) => onCountryFactorChange(c.id, fd.id, v)} />
                    </td>
                  ))}
                  <td className="px-3 py-2">
                    <NumInput value={p?.avgMarketPrice ?? 4} onChange={(v) => onPricingChange(c.id, "avgMarketPrice", v)} min={0} max={50} step={0.5} />
                  </td>
                  <td className="px-3 py-2">
                    <TextInput value={p?.currency ?? "USD"} onChange={(v) => onPricingChange(c.id, "currency", v)} className="w-20" />
                  </td>
                  <td className="px-3 py-2">
                    {countries.length > 1 && <DeleteButton onClick={() => onDeleteCountry(c.id)} />}
                  </td>
                </tr>
              );
            })}
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
              {factorDefs.map((fd) => (
                <FactorHeader key={fd.id} factorDef={fd} />
              ))}
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {fruits.map((fr) => (
              <tr key={fr.id} className="bg-[#fffdfa] text-sm">
                <td className="px-3 py-2"><TextInput value={fr.label} onChange={(v) => onFruitLabelChange(fr.id, v)} className="w-48" /></td>
                {factorDefs.map((fd) => (
                  <td key={fd.id} className="px-3 py-2">
                    <VerbalSelect value={fr.profile[fd.id] ?? 3} onChange={(v) => onFruitFactorChange(fr.id, fd.id, v)} />
                  </td>
                ))}
                <td className="px-3 py-2">
                  {fruits.length > 1 && <DeleteButton onClick={() => onDeleteFruit(fr.id)} />}
                </td>
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
              {factorDefs.map((fd) => (
                <FactorHeader key={fd.id} factorDef={fd} />
              ))}
              <th className="px-3 py-2">Cost ($)</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {bases.map((b) => (
              <tr key={b.id} className="bg-[#fffdfa] text-sm">
                <td className="px-3 py-2"><TextInput value={b.label} onChange={(v) => onBaseLabelChange(b.id, v)} className="w-44" /></td>
                {factorDefs.map((fd) => (
                  <td key={fd.id} className="px-3 py-2">
                    <VerbalSelect value={b.profile[fd.id] ?? 3} onChange={(v) => onBaseFactorChange(b.id, fd.id, v)} />
                  </td>
                ))}
                <td className="px-3 py-2">
                  <NumInput value={productionCostData[b.id] ?? 2.5} onChange={(v) => onProductionCostChange(b.id, v)} min={0} max={50} step={0.5} />
                </td>
                <td className="px-3 py-2">
                  {bases.length > 1 && <DeleteButton onClick={() => onDeleteBase(b.id)} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* Regional Flavor Familiarity — matrix: countries as rows, fruits as columns */}
      <Section title="Regional Flavor Familiarity" subtitle="How well each fruit is known in each country (rows = countries, columns = fruits)" defaultOpen={false}>
        <table className="min-w-full border-separate border-spacing-y-1">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-stone">
              <th className="px-3 py-1.5">Country</th>
              {fruits.map((fr) => (
                <th key={fr.id} className="px-3 py-1.5 text-center">{fr.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {countries.map((c) => (
              <tr key={c.id} className="bg-[#fffdfa] text-sm">
                <td className="px-3 py-1.5 font-medium text-ink">{c.label}</td>
                {fruits.map((fr) => {
                  const entry = flavorData[c.id]?.[fr.id] ?? { familiarity: "low" as FlavorFamiliarity };
                  return (
                    <td key={fr.id} className="px-3 py-1.5 text-center">
                      <select value={entry.familiarity} onChange={(e) => onFlavorBonusChange(c.id, fr.id, "familiarity", e.target.value)}
                        className="rounded-xl border border-sand bg-bone px-2 py-2 text-xs text-ink outline-none focus:border-[#2D6A4F]">
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                        <option value="novel">Novel</option>
                      </select>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* Strategy Presets */}
      <Section title="Scoring Weights" subtitle="Preset strategies that determine which factors dominate ranking" defaultOpen={false}
        action={<button type="button" onClick={(e) => { e.stopPropagation(); onAddPreset(); }}
          className="rounded-full bg-[#1B4332] px-3 py-1.5 text-xs font-medium text-white">Add Strategy</button>}>
        <table className="min-w-full border-separate border-spacing-y-1.5">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.2em] text-stone">
              <th className="px-3 py-2">Preset</th>
              {factorDefs.map((fd) => (
                <FactorHeader key={fd.id} factorDef={fd} />
              ))}
              <th className="px-3 py-2">Summary</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {presets.map((p) => (
              <tr key={p.id} className="bg-[#fffdfa] text-sm">
                <td className="px-3 py-2"><TextInput value={p.label} onChange={(v) => onPresetLabelChange(p.id, v)} className="w-36" /></td>
                {factorDefs.map((fd) => (
                  <td key={fd.id} className="px-3 py-2">
                    <NumInput value={p.weights[fd.id] ?? 1} onChange={(v) => onPresetFactorChange(p.id, fd.id, v)} min={0.1} max={3} step={0.1} className="w-16" />
                  </td>
                ))}
                <td className="px-3 py-2"><TextInput value={p.summary} onChange={(v) => onPresetSummaryChange(p.id, v)} className="w-64" /></td>
                <td className="px-3 py-2">
                  {presets.length > 1 && <DeleteButton onClick={() => onDeletePreset(p.id)} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </div>
  );
}
