import { useCallback, useEffect, useRef, useState } from "react";
import { CountrySelector } from "./components/CountrySelector";
import { DataHealthPanel } from "./components/DataHealthPanel";
import { MethodologyPanel } from "./components/MethodologyPanel";
import { ModelLibrary } from "./components/ModelLibrary";
import { ResultsPanel } from "./components/ResultsPanel";
import { ScenarioPanel } from "./components/ScenarioPanel";
import {
  countries as initialCountries,
  defaultSelection,
  emptyCountryProfile,
  emptyFruitProfile,
  factorLabels,
  factors,
  fruits as initialFruits,
  gelatoBases as initialGelatoBases,
  strategyPresets as initialStrategyPresets,
  type CountryOption,
  type Factor,
  type FruitOption,
  type GelatoBase,
  type StrategyPreset,
} from "./data/marketFit";
import { pricingByCountry } from "./data/pricing";
import { exportAsCSV, exportAsJSON } from "./utils/exportResults";
import { loadState, saveState } from "./utils/persistence";
import type { Scenario } from "./utils/scenarios";
import { getPresetWeights, rankFruitConcepts } from "./utils/scoring";

type ActiveTab = "decision-tool" | "model-library" | "methodology";

const clampInput = (value: number) => Math.min(5, Math.max(1, value));

export default function App() {
  // ── Hydrate from localStorage on first render ──
  const persisted = useRef(loadState());
  const initial = persisted.current;

  const [activeTab, setActiveTab] = useState<ActiveTab>("decision-tool");
  const [countries, setCountries] = useState<CountryOption[]>(initial?.countries ?? initialCountries);
  const [fruits, setFruits] = useState<FruitOption[]>(initial?.fruits ?? initialFruits);
  const [bases, setBases] = useState<GelatoBase[]>(initial?.bases ?? initialGelatoBases);
  const [presets, setPresets] = useState<StrategyPreset[]>(initial?.presets ?? initialStrategyPresets);
  const [countryId, setCountryId] = useState<string>(initial?.countryId ?? defaultSelection.countryId);
  const [baseId, setBaseId] = useState<string>(initial?.baseId ?? defaultSelection.baseId);
  const [presetId, setPresetId] = useState<string>(initial?.presetId ?? defaultSelection.presetId);
  const [pricePoint, setPricePoint] = useState(initial?.pricePoint ?? 5);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const selectedPreset = presets.find((preset) => preset.id === presetId) ?? presets[0];
  const [weights, setWeights] = useState(initial?.weights ?? getPresetWeights(selectedPreset));

  useEffect(() => {
    setWeights(getPresetWeights(selectedPreset));
  }, [selectedPreset]);

  useEffect(() => {
    if (!countries.some((c) => c.id === countryId) && countries[0]) {
      setCountryId(countries[0].id);
    }
  }, [countries, countryId]);

  useEffect(() => {
    if (!bases.some((b) => b.id === baseId) && bases[0]) {
      setBaseId(bases[0].id);
    }
  }, [bases, baseId]);

  useEffect(() => {
    if (!presets.some((p) => p.id === presetId) && presets[0]) {
      setPresetId(presets[0].id);
    }
  }, [presets, presetId]);

  // ── Persist state to localStorage on changes ──
  useEffect(() => {
    saveState({ countries, fruits, bases, presets, countryId, baseId, presetId, pricePoint, weights });
  }, [countries, fruits, bases, presets, countryId, baseId, presetId, pricePoint, weights]);

  const selectedCountry = countries.find((c) => c.id === countryId) ?? countries[0];
  const selectedBase = bases.find((b) => b.id === baseId) ?? bases[0];
  const safePreset = selectedPreset ?? presets[0];
  const pricing = pricingByCountry[countryId];

  const ranking =
    selectedCountry && selectedBase
      ? rankFruitConcepts({
          country: selectedCountry,
          base: selectedBase,
          fruits,
          weights,
          pricePoint,
        })
      : [];

  // ── Export handlers ──
  const handleExportJSON = useCallback(() => {
    if (!selectedCountry || !selectedBase || !safePreset) return;
    exportAsJSON(ranking, {
      country: selectedCountry.label,
      base: selectedBase.label,
      strategy: safePreset.label,
      pricePoint,
      exportedAt: new Date().toISOString(),
    });
  }, [ranking, selectedCountry, selectedBase, safePreset, pricePoint]);

  const handleExportCSV = useCallback(() => {
    if (!selectedCountry || !selectedBase || !safePreset) return;
    exportAsCSV(ranking, {
      country: selectedCountry.label,
      base: selectedBase.label,
      strategy: safePreset.label,
      pricePoint,
      exportedAt: new Date().toISOString(),
    });
  }, [ranking, selectedCountry, selectedBase, safePreset, pricePoint]);

  // ── Scenario restore ──
  const handleRestoreScenario = useCallback((scenario: Scenario) => {
    setCountryId(scenario.countryId);
    setBaseId(scenario.baseId);
    setPresetId(scenario.presetId);
    setPricePoint(scenario.pricePoint);
    setWeights(scenario.weights);
    setActiveTab("decision-tool");
  }, []);

  const tabButtonClass = (tab: ActiveTab) =>
    `rounded-full px-5 py-2.5 text-sm font-medium transition ${
      activeTab === tab
        ? "bg-[#1B4332] text-white shadow-md shadow-[#1B4332]/20"
        : "bg-white/85 text-ink ring-1 ring-sand hover:ring-[#2D6A4F]/40"
    }`;

  return (
    <main className="min-h-screen px-4 py-6 text-ink sm:px-6 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.36em] text-stone">
              Bonchi
            </p>
            <h1 className="mt-1 font-serif text-4xl leading-none text-ink sm:text-5xl">
              Market Fit
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("decision-tool")}
              className={tabButtonClass("decision-tool")}
            >
              Decision Tool
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("model-library")}
              className={tabButtonClass("model-library")}
            >
              Model Library
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("methodology")}
              className={tabButtonClass("methodology")}
            >
              Methodology
            </button>
          </div>
        </header>

        {activeTab === "decision-tool" && selectedCountry && selectedBase && safePreset ? (
          <div className="space-y-6">
            {/* Step 1: Country selection */}
            <CountrySelector
              countries={countries}
              selectedId={countryId}
              onChange={setCountryId}
            />

            {/* Step 2: Results */}
            <ResultsPanel
              country={selectedCountry}
              base={selectedBase}
              preset={safePreset}
              ranking={ranking}
            />

            {/* Export & Scenario row */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleExportJSON}
                className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-medium text-ink ring-1 ring-sand transition hover:ring-[#2D6A4F]/40"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export JSON
              </button>
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-medium text-ink ring-1 ring-sand transition hover:ring-[#2D6A4F]/40"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export CSV
              </button>
            </div>

            {/* Scenario snapshots */}
            <ScenarioPanel
              countryId={countryId}
              baseId={baseId}
              presetId={presetId}
              pricePoint={pricePoint}
              weights={weights}
              topConcept={ranking[0]?.conceptLabel ?? "—"}
              topScore={ranking[0]?.score ?? 0}
              countryLabel={selectedCountry.label}
              baseLabel={selectedBase.label}
              presetLabel={safePreset.label}
              onRestore={handleRestoreScenario}
            />

            {/* Advanced Settings — collapsed by default */}
            <div className="rounded-4xl border border-white/70 bg-white/80 shadow-panel backdrop-blur">
              <button
                type="button"
                onClick={() => setAdvancedOpen((v) => !v)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 xl:px-8"
              >
                <div className="text-left">
                  <h3 className="text-sm font-semibold text-ink">Advanced Settings</h3>
                  <p className="mt-0.5 text-xs text-stone">
                    Product base, strategy, price point, weight overrides
                  </p>
                </div>
                <svg
                  className={`h-5 w-5 shrink-0 text-stone transition-transform ${advancedOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {advancedOpen && (
                <div className="border-t border-sand px-6 pb-6 pt-5 xl:px-8">
                  <div className="grid gap-6 lg:grid-cols-3">
                    {/* Product base */}
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-ink">Product base</span>
                      <select
                        value={baseId}
                        onChange={(e) => setBaseId(e.target.value)}
                        className="w-full rounded-2xl border border-sand bg-bone px-4 py-3 text-ink shadow-sm outline-none transition focus:border-[#2D6A4F]"
                      >
                        {bases.map((base) => (
                          <option key={base.id} value={base.id}>
                            {base.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    {/* Strategy */}
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-ink">Strategy</span>
                      <select
                        value={presetId}
                        onChange={(e) => setPresetId(e.target.value)}
                        className="w-full rounded-2xl border border-sand bg-bone px-4 py-3 text-ink shadow-sm outline-none transition focus:border-[#2D6A4F]"
                      >
                        {presets.map((preset) => (
                          <option key={preset.id} value={preset.id}>
                            {preset.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    {/* Price point */}
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-ink">Price point</span>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="1"
                          max="20"
                          step="0.25"
                          value={pricePoint}
                          onChange={(e) => setPricePoint(Number(e.target.value))}
                          className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-sand accent-[#2D6A4F]"
                        />
                        <span className="w-16 text-right text-sm font-semibold text-ink">
                          ${pricePoint.toFixed(2)}
                        </span>
                      </div>
                      {pricing && (
                        <p className="text-xs text-stone">
                          Market avg: ${pricing.avgMarketPrice.toFixed(2)} · Sensitivity: {pricing.priceSensitivity}/5
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Weight overrides */}
                  <details className="mt-6">
                    <summary className="cursor-pointer text-sm font-medium text-[#2D6A4F] hover:underline">
                      Override factor weights
                    </summary>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {factors.map((factor) => (
                        <label key={factor} className="block">
                          <div className="mb-1.5 flex items-center justify-between text-xs">
                            <span className="text-ink">{factorLabels[factor]}</span>
                            <span className="font-medium text-stone">{weights[factor].toFixed(1)}x</span>
                          </div>
                          <input
                            type="range"
                            min="0.4"
                            max="2"
                            step="0.1"
                            value={weights[factor]}
                            onChange={(e) =>
                              setWeights((w) => ({
                                ...w,
                                [factor]: Number(e.target.value),
                              }))
                            }
                            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-sand accent-[#2D6A4F]"
                          />
                        </label>
                      ))}
                    </div>
                  </details>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {activeTab === "model-library" ? (
          <div className="space-y-6">
          <ModelLibrary
            countries={countries}
            fruits={fruits}
            bases={bases}
            presets={presets}
            weights={weights}
            onAddCountry={() =>
              setCountries((current) => [
                ...current,
                {
                  id: `country-${current.length + 1}`,
                  label: `New Country ${current.length + 1}`,
                  profile: emptyCountryProfile(),
                },
              ])
            }
            onAddFruit={() =>
              setFruits((current) => [
                ...current,
                {
                  id: `fruit-${current.length + 1}`,
                  label: `New Fruit ${current.length + 1}`,
                  profile: emptyFruitProfile(),
                },
              ])
            }
            onCountryLabelChange={(id, label) =>
              setCountries((current) =>
                current.map((c) => (c.id === id ? { ...c, label } : c)),
              )
            }
            onCountryFactorChange={(id, factor, value) =>
              setCountries((current) =>
                current.map((c) =>
                  c.id === id
                    ? { ...c, profile: { ...c.profile, [factor]: clampInput(value) } }
                    : c,
                ),
              )
            }
            onFruitLabelChange={(id, label) =>
              setFruits((current) =>
                current.map((f) => (f.id === id ? { ...f, label } : f)),
              )
            }
            onFruitFactorChange={(id, factor: Factor, value) =>
              setFruits((current) =>
                current.map((f) =>
                  f.id === id
                    ? { ...f, profile: { ...f.profile, [factor]: clampInput(value) } }
                    : f,
                ),
              )
            }
            onBaseLabelChange={(id, label) =>
              setBases((current) =>
                current.map((b) => (b.id === id ? { ...b, label } : b)),
              )
            }
            onBaseFactorChange={(id, factor, value) =>
              setBases((current) =>
                current.map((b) =>
                  b.id === id
                    ? { ...b, profile: { ...b.profile, [factor]: clampInput(value) } }
                    : b,
                ),
              )
            }
            onPresetLabelChange={(id, label) =>
              setPresets((current) =>
                current.map((p) => (p.id === id ? { ...p, label } : p)),
              )
            }
            onPresetFactorChange={(id, factor, value) =>
              setPresets((current) =>
                current.map((p) =>
                  p.id === id
                    ? { ...p, weights: { ...p.weights, [factor]: clampInput(value) } }
                    : p,
                ),
              )
            }
            onPresetSummaryChange={(id, summary) =>
              setPresets((current) =>
                current.map((p) => (p.id === id ? { ...p, summary } : p)),
              )
            }
          />
          <DataHealthPanel countries={countries} fruits={fruits} bases={bases} />
          </div>
        ) : null}

        {activeTab === "methodology" ? <MethodologyPanel /> : null}
      </div>
    </main>
  );
}
