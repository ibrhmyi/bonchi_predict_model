import {
  factorLabels,
  factors,
  type CountryOption,
  type Factor,
  type FactorMap,
  type GelatoBase,
  type StrategyPreset,
} from "../data/marketFit";
import { pricingByCountry } from "../data/pricing";
import { PriceSimulator } from "./PriceSimulator";

type ControlPanelProps = {
  countries: CountryOption[];
  bases: GelatoBase[];
  presets: StrategyPreset[];
  selectedCountryId: string;
  selectedBaseId: string;
  selectedPresetId: string;
  advancedOpen: boolean;
  weights: FactorMap;
  pricePoint: number;
  countryId: string;
  onCountryChange: (value: string) => void;
  onBaseChange: (value: string) => void;
  onPresetChange: (value: string) => void;
  onToggleAdvanced: () => void;
  onWeightChange: (factor: Factor, value: number) => void;
  onPriceChange: (price: number) => void;
};

export function ControlPanel({
  countries,
  bases,
  presets,
  selectedCountryId,
  selectedBaseId,
  selectedPresetId,
  advancedOpen,
  weights,
  pricePoint,
  countryId,
  onCountryChange,
  onBaseChange,
  onPresetChange,
  onToggleAdvanced,
  onWeightChange,
  onPriceChange,
}: ControlPanelProps) {
  const selectedPreset = presets.find((preset) => preset.id === selectedPresetId);
  const pricing = pricingByCountry[countryId];

  return (
    <section className="space-y-6">
      <div className="rounded-4xl border border-white/70 bg-white/80 p-6 shadow-panel backdrop-blur xl:p-8">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-stone">
            Decision inputs
          </p>
          <h2 className="font-serif text-3xl text-ink">Set the market and base</h2>
          <p className="text-sm leading-6 text-stone">
            Choose a country, lock the product base, then rank fruit concepts with a preset or custom weights.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink">Country</span>
            <select
              value={selectedCountryId}
              onChange={(event) => onCountryChange(event.target.value)}
              className="w-full rounded-2xl border border-sand bg-bone px-4 py-3 text-ink shadow-sm outline-none transition focus:border-gold"
            >
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink">Product base</span>
            <select
              value={selectedBaseId}
              onChange={(event) => onBaseChange(event.target.value)}
              className="w-full rounded-2xl border border-sand bg-bone px-4 py-3 text-ink shadow-sm outline-none transition focus:border-gold"
            >
              {bases.map((base) => (
                <option key={base.id} value={base.id}>
                  {base.label}
                </option>
              ))}
            </select>
          </label>

          <div className="space-y-3">
            <span className="text-sm font-medium text-ink">Strategy preset</span>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset) => {
                const active = preset.id === selectedPresetId;

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onPresetChange(preset.id)}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                      active
                        ? "border-ink bg-ink text-white shadow-card"
                        : "border-sand bg-white/80 text-ink hover:border-gold"
                    }`}
                  >
                    <div className="font-medium">{preset.label}</div>
                    <div
                      className={`mt-1 text-xs leading-5 ${
                        active ? "text-white/70" : "text-stone"
                      }`}
                    >
                      {preset.summary}
                    </div>
                  </button>
                );
              })}
            </div>
            {selectedPreset ? (
              <p className="text-xs uppercase tracking-[0.24em] text-stone">
                Active preset: {selectedPreset.label}
              </p>
            ) : null}
          </div>

          <div className="rounded-3xl border border-sand bg-bone/80 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-medium text-ink">Advanced weights</h3>
                <p className="mt-1 text-sm leading-6 text-stone">
                  Expose seven factor sliders to override the preset directly.
                </p>
              </div>
              <button
                type="button"
                onClick={onToggleAdvanced}
                className={`inline-flex h-10 items-center rounded-full px-4 text-sm font-medium transition ${
                  advancedOpen
                    ? "bg-ink text-white"
                    : "bg-white text-ink ring-1 ring-sand"
                }`}
              >
                {advancedOpen ? "Hide" : "Show"}
              </button>
            </div>

            {advancedOpen ? (
              <div className="mt-5 space-y-4">
                {factors.map((factor) => (
                  <label key={factor} className="block">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-ink">{factorLabels[factor]}</span>
                      <span className="font-medium text-stone">{weights[factor].toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.4"
                      max="2"
                      step="0.1"
                      value={weights[factor]}
                      onChange={(event) => onWeightChange(factor, Number(event.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-sand accent-ink"
                    />
                  </label>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Price simulation card */}
      <div className="rounded-4xl border border-white/70 bg-white/80 p-6 shadow-panel backdrop-blur xl:p-8">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-stone">
            Price simulation
          </p>
          <h2 className="font-serif text-2xl text-ink">Set price point</h2>
          {pricing && (
            <p className="text-sm leading-6 text-stone">
              Market avg: ${pricing.avgMarketPrice.toFixed(2)} · Sensitivity: {pricing.priceSensitivity}/5
            </p>
          )}
        </div>
        <div className="mt-5">
          <PriceSimulator
            countryId={countryId}
            pricePoint={pricePoint}
            onPriceChange={onPriceChange}
          />
        </div>
      </div>
    </section>
  );
}
