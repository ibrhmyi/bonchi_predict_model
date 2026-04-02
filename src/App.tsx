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
import {
  baseProductionCost as initialProductionCost,
  pricingByCountry as initialPricingByCountry,
  type PricingProfile,
} from "./data/pricing";
import {
  fruitCostByCountry as initialFruitCostByCountry,
  regionalFlavorBonus as initialFlavorBonus,
  type FlavorFamiliarity,
  type FruitCostEntry,
  type RegionalFlavorEntry,
} from "./data/regionalData";
import { exportAsCSV, exportAsJSON } from "./utils/exportResults";
import { loadState, saveState } from "./utils/persistence";
import type { Scenario } from "./utils/scenarios";
import { getPresetWeights, rankFruitConcepts, type DataOverrides } from "./utils/scoring";

type ActiveTab = "analyze" | "data";

const clampInput = (value: number) => Math.min(5, Math.max(1, value));

export default function App() {
  const persisted = useRef(loadState());
  const initial = persisted.current;

  const [activeTab, setActiveTab] = useState<ActiveTab>("analyze");

  // Core model data
  const [countries, setCountries] = useState<CountryOption[]>(initial?.countries ?? initialCountries);
  const [fruits, setFruits] = useState<FruitOption[]>(initial?.fruits ?? initialFruits);
  const [bases, setBases] = useState<GelatoBase[]>(initial?.bases ?? initialGelatoBases);
  const [presets, setPresets] = useState<StrategyPreset[]>(initial?.presets ?? initialStrategyPresets);

  // Editable external data
  const [pricingData, setPricingData] = useState<Record<string, PricingProfile>>(initial?.pricingByCountry ?? initialPricingByCountry);
  const [flavorData, setFlavorData] = useState<Record<string, Record<string, RegionalFlavorEntry>>>(initial?.regionalFlavorBonus ?? initialFlavorBonus);
  const [fruitCostData, setFruitCostData] = useState<Record<string, Record<string, FruitCostEntry>>>(initial?.fruitCostByCountry ?? initialFruitCostByCountry);
  const [productionCostData, setProductionCostData] = useState<Record<string, number>>(initial?.baseProductionCost ?? initialProductionCost);

  // Selections
  const [countryId, setCountryId] = useState<string>(initial?.countryId ?? defaultSelection.countryId);
  const [baseId, setBaseId] = useState<string>(initial?.baseId ?? defaultSelection.baseId);
  const [presetId, setPresetId] = useState<string>(initial?.presetId ?? defaultSelection.presetId);
  const [pricePoint, setPricePoint] = useState(initial?.pricePoint ?? 5);

  const selectedPreset = presets.find((p) => p.id === presetId) ?? presets[0];
  const [weights, setWeights] = useState(initial?.weights ?? getPresetWeights(selectedPreset));

  useEffect(() => { setWeights(getPresetWeights(selectedPreset)); }, [selectedPreset]);
  useEffect(() => { if (!countries.some((c) => c.id === countryId) && countries[0]) setCountryId(countries[0].id); }, [countries, countryId]);
  useEffect(() => { if (!bases.some((b) => b.id === baseId) && bases[0]) setBaseId(bases[0].id); }, [bases, baseId]);
  useEffect(() => { if (!presets.some((p) => p.id === presetId) && presets[0]) setPresetId(presets[0].id); }, [presets, presetId]);

  // Persist everything
  useEffect(() => {
    saveState({
      countries, fruits, bases, presets, countryId, baseId, presetId, pricePoint, weights,
      pricingByCountry: pricingData, regionalFlavorBonus: flavorData,
      fruitCostByCountry: fruitCostData, baseProductionCost: productionCostData,
    });
  }, [countries, fruits, bases, presets, countryId, baseId, presetId, pricePoint, weights, pricingData, flavorData, fruitCostData, productionCostData]);

  const selectedCountry = countries.find((c) => c.id === countryId) ?? countries[0];
  const selectedBase = bases.find((b) => b.id === baseId) ?? bases[0];
  const safePreset = selectedPreset ?? presets[0];
  const pricing = pricingData[countryId];

  const dataOverrides: DataOverrides = {
    pricingByCountry: pricingData,
    regionalFlavorBonus: flavorData,
    fruitCostByCountry: fruitCostData,
    baseProductionCost: productionCostData,
  };

  const ranking =
    selectedCountry && selectedBase
      ? rankFruitConcepts({
          country: selectedCountry,
          base: selectedBase,
          fruits, weights, pricePoint,
          data: dataOverrides,
        })
      : [];

  // Export
  const handleExport = useCallback((format: "json" | "csv") => {
    if (!selectedCountry || !selectedBase || !safePreset) return;
    const meta = {
      country: selectedCountry.label, base: selectedBase.label,
      strategy: safePreset.label, pricePoint,
      exportedAt: new Date().toISOString(),
    };
    format === "json" ? exportAsJSON(ranking, meta) : exportAsCSV(ranking, meta);
  }, [ranking, selectedCountry, selectedBase, safePreset, pricePoint]);

  // Scenario restore
  const handleRestoreScenario = useCallback((scenario: Scenario) => {
    setCountryId(scenario.countryId);
    setBaseId(scenario.baseId);
    setPresetId(scenario.presetId);
    setPricePoint(scenario.pricePoint);
    setWeights(scenario.weights);
    setActiveTab("analyze");
  }, []);

  const tabClass = (tab: ActiveTab) =>
    `rounded-full px-5 py-2.5 text-sm font-medium transition ${
      activeTab === tab
        ? "bg-[#1B4332] text-white shadow-md shadow-[#1B4332]/20"
        : "bg-white/85 text-ink ring-1 ring-sand hover:ring-[#2D6A4F]/40"
    }`;

  return (
    <main className="min-h-screen px-4 py-6 text-ink sm:px-6 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.36em] text-stone">Bonchi</p>
            <h1 className="mt-1 font-serif text-4xl leading-none text-ink sm:text-5xl">Market Fit</h1>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setActiveTab("analyze")} className={tabClass("analyze")}>Analyze</button>
            <button type="button" onClick={() => setActiveTab("data")} className={tabClass("data")}>Data</button>
          </div>
        </header>

        {/* ═══════════ ANALYZE TAB ═══════════ */}
        {activeTab === "analyze" && selectedCountry && selectedBase && safePreset ? (
          <div className="space-y-5">
            {/* Country */}
            <CountrySelector
              countries={countries}
              selectedId={countryId}
              onChange={setCountryId}
              pricingByCountry={pricingData}
            />

            {/* Inline controls — base, strategy, price */}
            <div className="rounded-3xl border border-white/70 bg-white/80 px-5 py-4 shadow-panel backdrop-blur">
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-stone">Product base</span>
                  <select
                    value={baseId}
                    onChange={(e) => setBaseId(e.target.value)}
                    className="w-full rounded-xl border border-sand bg-bone px-3 py-2.5 text-sm text-ink outline-none transition focus:border-[#2D6A4F]"
                  >
                    {bases.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
                  </select>
                </label>
                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-stone">Strategy</span>
                  <select
                    value={presetId}
                    onChange={(e) => setPresetId(e.target.value)}
                    className="w-full rounded-xl border border-sand bg-bone px-3 py-2.5 text-sm text-ink outline-none transition focus:border-[#2D6A4F]"
                  >
                    {presets.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </label>
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-stone">Price point</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="range" min="1" max="20" step="0.25"
                      value={pricePoint}
                      onChange={(e) => setPricePoint(Number(e.target.value))}
                      className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-sand accent-[#2D6A4F]"
                    />
                    <span className="w-14 text-right text-sm font-semibold text-ink">${pricePoint.toFixed(2)}</span>
                  </div>
                  {pricing && (
                    <p className="text-[10px] text-stone">
                      Avg ${pricing.avgMarketPrice.toFixed(2)} · Sensitivity {pricing.priceSensitivity}/5
                    </p>
                  )}
                </div>
              </div>

              {/* Weight overrides — compact */}
              <details className="mt-3">
                <summary className="cursor-pointer text-xs font-medium text-[#2D6A4F] hover:underline">
                  Adjust factor weights
                </summary>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {factors.map((factor) => (
                    <label key={factor} className="block">
                      <div className="mb-1 flex items-center justify-between text-[11px]">
                        <span className="text-ink">{factorLabels[factor]}</span>
                        <span className="font-medium text-stone">{weights[factor].toFixed(1)}x</span>
                      </div>
                      <input
                        type="range" min="0.4" max="2" step="0.1"
                        value={weights[factor]}
                        onChange={(e) => setWeights((w) => ({ ...w, [factor]: Number(e.target.value) }))}
                        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-sand accent-[#2D6A4F]"
                      />
                    </label>
                  ))}
                </div>
              </details>
            </div>

            {/* Results */}
            <ResultsPanel
              country={selectedCountry}
              base={selectedBase}
              preset={safePreset}
              ranking={ranking}
            />

            {/* Compact action row: export + snapshot */}
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => handleExport("json")}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3.5 py-2 text-xs font-medium text-ink ring-1 ring-sand transition hover:ring-[#2D6A4F]/40">
                Export JSON
              </button>
              <button type="button" onClick={() => handleExport("csv")}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3.5 py-2 text-xs font-medium text-ink ring-1 ring-sand transition hover:ring-[#2D6A4F]/40">
                Export CSV
              </button>
              <div className="ml-auto" />
              <ScenarioPanel
                countryId={countryId} baseId={baseId} presetId={presetId}
                pricePoint={pricePoint} weights={weights}
                topConcept={ranking[0]?.conceptLabel ?? "—"} topScore={ranking[0]?.score ?? 0}
                countryLabel={selectedCountry.label} baseLabel={selectedBase.label}
                presetLabel={safePreset.label} onRestore={handleRestoreScenario}
              />
            </div>
          </div>
        ) : null}

        {/* ═══════════ DATA TAB ═══════════ */}
        {activeTab === "data" ? (
          <div className="space-y-6">
            <ModelLibrary
              countries={countries} fruits={fruits} bases={bases} presets={presets} weights={weights}
              pricingByCountry={pricingData} flavorData={flavorData}
              fruitCostData={fruitCostData} productionCostData={productionCostData}
              data={dataOverrides}
              onAddCountry={() => setCountries((c) => [...c, { id: `country-${c.length + 1}`, label: `New Country ${c.length + 1}`, profile: emptyCountryProfile() }])}
              onAddFruit={() => setFruits((f) => [...f, { id: `fruit-${f.length + 1}`, label: `New Fruit ${f.length + 1}`, profile: emptyFruitProfile() }])}
              onCountryLabelChange={(id, label) => setCountries((c) => c.map((x) => x.id === id ? { ...x, label } : x))}
              onCountryFactorChange={(id, factor, value) => setCountries((c) => c.map((x) => x.id === id ? { ...x, profile: { ...x.profile, [factor]: clampInput(value) } } : x))}
              onFruitLabelChange={(id, label) => setFruits((f) => f.map((x) => x.id === id ? { ...x, label } : x))}
              onFruitFactorChange={(id, factor: Factor, value) => setFruits((f) => f.map((x) => x.id === id ? { ...x, profile: { ...x.profile, [factor]: clampInput(value) } } : x))}
              onBaseLabelChange={(id, label) => setBases((b) => b.map((x) => x.id === id ? { ...x, label } : x))}
              onBaseFactorChange={(id, factor, value) => setBases((b) => b.map((x) => x.id === id ? { ...x, profile: { ...x.profile, [factor]: clampInput(value) } } : x))}
              onPresetLabelChange={(id, label) => setPresets((p) => p.map((x) => x.id === id ? { ...x, label } : x))}
              onPresetFactorChange={(id, factor, value) => setPresets((p) => p.map((x) => x.id === id ? { ...x, weights: { ...x.weights, [factor]: clampInput(value) } } : x))}
              onPresetSummaryChange={(id, summary) => setPresets((p) => p.map((x) => x.id === id ? { ...x, summary } : x))}
              onPricingChange={(cId, field, value) => setPricingData((prev) => ({ ...prev, [cId]: { ...prev[cId], [field]: value } }))}
              onFlavorBonusChange={(cId, fId, field, value) => setFlavorData((prev) => ({ ...prev, [cId]: { ...prev[cId], [fId]: { ...(prev[cId]?.[fId] ?? { bonus: 0, reason: "", familiarity: "low" as FlavorFamiliarity }), [field]: value } } }))}
              onFruitCostChange={(fId, cId, field, value) => setFruitCostData((prev) => ({ ...prev, [fId]: { ...prev[fId], [cId]: { ...(prev[fId]?.[cId] ?? { costIndex: 2.5, supplyReliability: 3, sourceNote: "" }), [field]: value } } }))}
              onProductionCostChange={(bId, value) => setProductionCostData((prev) => ({ ...prev, [bId]: value }))}
            />
            <DataHealthPanel countries={countries} fruits={fruits} bases={bases} />

            {/* Methodology — collapsible at bottom */}
            <details className="rounded-4xl border border-white/70 bg-white/80 shadow-panel backdrop-blur">
              <summary className="cursor-pointer px-6 py-5 text-sm font-semibold text-ink xl:px-8">
                Methodology & Data Sources
              </summary>
              <div className="border-t border-sand px-6 pb-6 pt-5 xl:px-8">
                <MethodologyPanel />
              </div>
            </details>
          </div>
        ) : null}
      </div>
    </main>
  );
}
