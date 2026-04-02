import type { ReactNode } from "react";
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
import { fruitFactors } from "../utils/scoring";
import { BenchmarkMatrix } from "./BenchmarkMatrix";

type ModelLibraryProps = {
  countries: CountryOption[];
  fruits: FruitOption[];
  bases: GelatoBase[];
  presets: StrategyPreset[];
  weights: FactorMap;
  onAddCountry: () => void;
  onAddFruit: () => void;
  onCountryLabelChange: (id: string, label: string) => void;
  onCountryFactorChange: (id: string, factor: Factor, value: number) => void;
  onFruitLabelChange: (id: string, label: string) => void;
  onFruitFactorChange: (id: string, factor: FruitFactor, value: number) => void;
  onBaseLabelChange: (id: string, label: string) => void;
  onBaseFactorChange: (id: string, factor: Factor, value: number) => void;
  onPresetLabelChange: (id: string, label: string) => void;
  onPresetFactorChange: (id: string, factor: Factor, value: number) => void;
  onPresetSummaryChange: (id: string, summary: string) => void;
};

const clampEntry = (value: number) => Math.min(5, Math.max(1, value));

function ScoreInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <input
      type="number"
      min="1"
      max="5"
      step="0.1"
      value={value}
      onChange={(event) => onChange(clampEntry(Number(event.target.value) || 1))}
      className="w-20 rounded-xl border border-sand bg-bone px-3 py-2 text-sm text-ink outline-none transition focus:border-[#2D6A4F]"
    />
  );
}

function FactorHeader({ factor }: { factor: Factor }) {
  return (
    <th className="group relative px-3 py-2">
      <span className="cursor-help border-b border-dashed border-stone/40">
        {factorLabels[factor]}
      </span>
      <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-1 w-48 -translate-x-1/2 rounded-xl border border-sand bg-white p-3 text-xs font-normal normal-case tracking-normal text-stone opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        <span className="font-medium text-ink">{factorLabels[factor]}</span> (1–5):{" "}
        {factorDefinitions[factor]}
      </div>
    </th>
  );
}

function qualitativeLabel(value: number): string {
  if (value >= 4.5) return "very high";
  if (value >= 3.5) return "high";
  if (value >= 2.5) return "moderate";
  if (value >= 1.5) return "low";
  return "very low";
}

function TableShell({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-4xl border border-white/70 bg-white/80 p-6 shadow-panel backdrop-blur xl:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-serif text-2xl text-ink">{title}</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-stone">{subtitle}</p>
        </div>
        {action}
      </div>
      <div className="mt-5 overflow-x-auto">{children}</div>
    </section>
  );
}

export function ModelLibrary({
  countries,
  fruits,
  bases,
  presets,
  weights,
  onAddCountry,
  onAddFruit,
  onCountryLabelChange,
  onCountryFactorChange,
  onFruitLabelChange,
  onFruitFactorChange,
  onBaseLabelChange,
  onBaseFactorChange,
  onPresetLabelChange,
  onPresetFactorChange,
  onPresetSummaryChange,
}: ModelLibraryProps) {
  return (
    <div className="space-y-6">
      {/* Benchmark Matrix — prominent */}
      <BenchmarkMatrix
        countries={countries}
        bases={bases}
        fruits={fruits}
        weights={weights}
      />

      <TableShell
        title="Market Profiles"
        subtitle="How each country's consumers value different product attributes (1–5 scale). Hover column headers for definitions."
        action={
          <button
            type="button"
            onClick={onAddCountry}
            className="inline-flex items-center rounded-full bg-[#1B4332] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            Add Country
          </button>
        }
      >
        <table className="min-w-full border-separate border-spacing-y-2">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.24em] text-stone">
              <th className="px-3 py-2">Country</th>
              {factors.map((factor) => (
                <FactorHeader key={factor} factor={factor} />
              ))}
            </tr>
          </thead>
          <tbody>
            {countries.map((country) => (
              <tr key={country.id} className="rounded-2xl bg-[#fffdfa] text-sm text-ink">
                <td className="px-3 py-3">
                  <input
                    value={country.label}
                    onChange={(event) => onCountryLabelChange(country.id, event.target.value)}
                    className="w-40 rounded-xl border border-sand bg-bone px-3 py-2 outline-none transition focus:border-[#2D6A4F]"
                  />
                </td>
                {factors.map((factor) => (
                  <td key={factor} className="px-3 py-3">
                    <div className="flex items-center gap-1.5">
                      <ScoreInput
                        value={country.profile[factor]}
                        onChange={(value) => onCountryFactorChange(country.id, factor, value)}
                      />
                      <span className="hidden text-[10px] text-stone/60 xl:inline">
                        {qualitativeLabel(country.profile[factor])}
                      </span>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>

      <TableShell
        title="Fruit Characteristics"
        subtitle="Fruit-level attributes that blend with the product base to form the final concept profile."
        action={
          <button
            type="button"
            onClick={onAddFruit}
            className="inline-flex items-center rounded-full bg-[#1B4332] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            Add Fruit
          </button>
        }
      >
        <table className="min-w-full border-separate border-spacing-y-2">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.24em] text-stone">
              <th className="px-3 py-2">Fruit</th>
              {fruitFactors.map((factor) => (
                <FactorHeader key={factor} factor={factor} />
              ))}
            </tr>
          </thead>
          <tbody>
            {fruits.map((fruit) => (
              <tr key={fruit.id} className="rounded-2xl bg-[#fffdfa] text-sm text-ink">
                <td className="px-3 py-3">
                  <input
                    value={fruit.label}
                    onChange={(event) => onFruitLabelChange(fruit.id, event.target.value)}
                    className="w-48 rounded-xl border border-sand bg-bone px-3 py-2 outline-none transition focus:border-[#2D6A4F]"
                  />
                </td>
                {fruitFactors.map((factor) => (
                  <td key={factor} className="px-3 py-3">
                    <ScoreInput
                      value={fruit.profile[factor]}
                      onChange={(value) => onFruitFactorChange(fruit.id, factor, value)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>

      <TableShell
        title="Product Formats"
        subtitle="Base profiles shape texture, premium positioning, and non-fruit characteristics."
      >
        <table className="min-w-full border-separate border-spacing-y-2">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.24em] text-stone">
              <th className="px-3 py-2">Base</th>
              {factors.map((factor) => (
                <FactorHeader key={factor} factor={factor} />
              ))}
            </tr>
          </thead>
          <tbody>
            {bases.map((base) => (
              <tr key={base.id} className="rounded-2xl bg-[#fffdfa] text-sm text-ink">
                <td className="px-3 py-3">
                  <input
                    value={base.label}
                    onChange={(event) => onBaseLabelChange(base.id, event.target.value)}
                    className="w-44 rounded-xl border border-sand bg-bone px-3 py-2 outline-none transition focus:border-[#2D6A4F]"
                  />
                </td>
                {factors.map((factor) => (
                  <td key={factor} className="px-3 py-3">
                    <ScoreInput
                      value={base.profile[factor]}
                      onChange={(value) => onBaseFactorChange(base.id, factor, value)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>

      <TableShell
        title="Scoring Weights"
        subtitle="Preset weights determine which factors dominate the ranking. Changes apply to both tabs."
      >
        <table className="min-w-full border-separate border-spacing-y-2">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.24em] text-stone">
              <th className="px-3 py-2">Preset</th>
              {factors.map((factor) => (
                <FactorHeader key={factor} factor={factor} />
              ))}
              <th className="px-3 py-2">Summary</th>
            </tr>
          </thead>
          <tbody>
            {presets.map((preset) => (
              <tr key={preset.id} className="rounded-2xl bg-[#fffdfa] text-sm text-ink">
                <td className="px-3 py-3">
                  <input
                    value={preset.label}
                    onChange={(event) => onPresetLabelChange(preset.id, event.target.value)}
                    className="w-36 rounded-xl border border-sand bg-bone px-3 py-2 outline-none transition focus:border-[#2D6A4F]"
                  />
                </td>
                {factors.map((factor) => (
                  <td key={factor} className="px-3 py-3">
                    <ScoreInput
                      value={preset.weights[factor]}
                      onChange={(value) => onPresetFactorChange(preset.id, factor, value)}
                    />
                  </td>
                ))}
                <td className="px-3 py-3">
                  <input
                    value={preset.summary}
                    onChange={(event) => onPresetSummaryChange(preset.id, event.target.value)}
                    className="w-80 rounded-xl border border-sand bg-bone px-3 py-2 outline-none transition focus:border-[#2D6A4F]"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>
    </div>
  );
}
