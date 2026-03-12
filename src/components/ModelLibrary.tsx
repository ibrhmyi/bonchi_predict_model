import type { ReactNode } from "react";
import {
  factorDefinitions,
  factorLabels,
  factors,
  type CountryOption,
  type Factor,
  type FruitFactor,
  type FruitOption,
  type GelatoBase,
  type StrategyPreset,
} from "../data/marketFit";
import { fruitFactors } from "../utils/scoring";

type ModelLibraryProps = {
  countries: CountryOption[];
  fruits: FruitOption[];
  bases: GelatoBase[];
  presets: StrategyPreset[];
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
      className="w-20 rounded-xl border border-sand bg-bone px-3 py-2 text-sm text-ink outline-none transition focus:border-gold"
    />
  );
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
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-stone">
            Model library
          </p>
          <h2 className="mt-2 font-serif text-3xl text-ink">{title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-stone">{subtitle}</p>
        </div>
        {action}
      </div>
      <div className="mt-6 overflow-x-auto">{children}</div>
    </section>
  );
}

export function ModelLibrary({
  countries,
  fruits,
  bases,
  presets,
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
      <TableShell
        title="Countries"
        subtitle="Market demand profiles on a 1 to 5 scale. Edit directly to pressure-test the recommendation engine."
        action={
          <button
            type="button"
            onClick={onAddCountry}
            className="inline-flex items-center rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
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
                <th key={factor} className="px-3 py-2">
                  {factorLabels[factor]}
                </th>
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
                    className="w-40 rounded-xl border border-sand bg-bone px-3 py-2 outline-none transition focus:border-gold"
                  />
                </td>
                {factors.map((factor) => (
                  <td key={factor} className="px-3 py-3">
                    <ScoreInput
                      value={country.profile[factor]}
                      onChange={(value) => onCountryFactorChange(country.id, factor, value)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>

      <TableShell
        title="Fruits"
        subtitle="Fruit-level assumptions that blend into the selected gelato base to produce the final concept profile."
        action={
          <button
            type="button"
            onClick={onAddFruit}
            className="inline-flex items-center rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
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
                <th key={factor} className="px-3 py-2">
                  {factorLabels[factor]}
                </th>
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
                    className="w-40 rounded-xl border border-sand bg-bone px-3 py-2 outline-none transition focus:border-gold"
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
        title="Gelato Bases"
        subtitle="Base profiles shape texture, premium level, and the non-fruit characteristics of the final concept."
      >
        <table className="min-w-full border-separate border-spacing-y-2">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.24em] text-stone">
              <th className="px-3 py-2">Base</th>
              {factors.map((factor) => (
                <th key={factor} className="px-3 py-2">
                  {factorLabels[factor]}
                </th>
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
                    className="w-44 rounded-xl border border-sand bg-bone px-3 py-2 outline-none transition focus:border-gold"
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
        title="Strategy Presets"
        subtitle="Preset weights determine which factors dominate the ranking. Editing these changes both tabs immediately."
      >
        <table className="min-w-full border-separate border-spacing-y-2">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.24em] text-stone">
              <th className="px-3 py-2">Preset</th>
              {factors.map((factor) => (
                <th key={factor} className="px-3 py-2">
                  {factorLabels[factor]}
                </th>
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
                    className="w-36 rounded-xl border border-sand bg-bone px-3 py-2 outline-none transition focus:border-gold"
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
                    className="w-80 rounded-xl border border-sand bg-bone px-3 py-2 outline-none transition focus:border-gold"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>

      <section className="rounded-4xl border border-white/70 bg-white/80 p-6 shadow-panel backdrop-blur xl:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-stone">
          Factor definitions
        </p>
        <h2 className="mt-2 font-serif text-3xl text-ink">Glossary</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {factors.map((factor) => (
            <article key={factor} className="rounded-3xl border border-sand bg-[#fffdfa] p-5">
              <h3 className="text-lg font-medium text-ink">{factorLabels[factor]}</h3>
              <p className="mt-2 text-sm leading-6 text-stone">{factorDefinitions[factor]}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
