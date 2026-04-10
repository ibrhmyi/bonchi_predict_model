import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChatPanel } from "./components/ChatPanel";
import { CountrySelector } from "./components/CountrySelector";
import { DataHealthPanel } from "./components/DataHealthPanel";
import { MethodologyPanel } from "./components/MethodologyPanel";
import { ModelLibrary } from "./components/ModelLibrary";
import { ResultsPanel } from "./components/ResultsPanel";
import { ScenarioPanel } from "./components/ScenarioPanel";
import { useToolHandlers } from "./llm/useToolHandlers";
import { debounce, loadCloudState, saveCloudState } from "./utils/cloudPersistence";
import {
  buildDefaultWeights,
  buildEmptyProfile,
  countries as initialCountries,
  defaultFactorDefs,
  defaultSelection,
  fruits as initialFruits,
  gelatoBases as initialGelatoBases,
  strategyPresets as initialStrategyPresets,
  type CountryOption,
  type FactorDef,
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
  regionalFlavorBonus as initialFlavorBonus,
  type FlavorFamiliarity,
  type RegionalFlavorEntry,
} from "./data/regionalData";
import { countryDataCompleteness } from "./utils/dataCompleteness";
import { exportAsCSV, exportAsJSON } from "./utils/exportResults";
import { loadState, saveState } from "./utils/persistence";
import type { Scenario } from "./utils/scenarios";
import { getPresetWeights, rankFruitConcepts, type DataOverrides } from "./utils/scoring";

type ActiveTab = "analyze" | "data";

const clampInput = (value: number) => Math.min(5, Math.max(1, value));

// Build initial per-base price points from initial bases
const initialPricePoints: Record<string, number> = Object.fromEntries(
  initialGelatoBases.map((b) => [b.id, 5]),
);

// Collapsible "shelf" — neutral row that opens to reveal detail.
function Shelf({
  label,
  summary,
  children,
  defaultOpen = false,
}: {
  label: string;
  summary?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      className="group rounded-3xl border border-white/70 bg-white/80 shadow-panel backdrop-blur open:bg-white"
      {...(defaultOpen ? { open: true } : {})}
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 rounded-3xl px-5 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F]/40">
        <svg
          aria-hidden="true"
          className="h-4 w-4 shrink-0 text-stone transition-transform group-open:rotate-90"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-sm font-semibold text-ink">{label}</span>
        {summary && <span className="ml-auto truncate text-xs text-stone">{summary}</span>}
      </summary>
      <div className="border-t border-sand/70 px-5 py-5">{children}</div>
    </details>
  );
}

export default function App() {
  const persisted = useRef(loadState());
  const initial = persisted.current;

  const [activeTab, setActiveTab] = useState<ActiveTab>("analyze");

  // Dynamic factor definitions
  const [factorDefs, setFactorDefs] = useState<FactorDef[]>(initial?.factorDefs ?? defaultFactorDefs);

  // Core model data
  const [countries, setCountries] = useState<CountryOption[]>(initial?.countries ?? initialCountries);
  const [fruits, setFruits] = useState<FruitOption[]>(initial?.fruits ?? initialFruits);
  const [bases, setBases] = useState<GelatoBase[]>(initial?.bases ?? initialGelatoBases);
  const [presets, setPresets] = useState<StrategyPreset[]>(initial?.presets ?? initialStrategyPresets);

  // Editable external data
  const [pricingData, setPricingData] = useState<Record<string, PricingProfile>>(initial?.pricingByCountry ?? initialPricingByCountry);
  const [flavorData, setFlavorData] = useState<Record<string, Record<string, RegionalFlavorEntry>>>(initial?.regionalFlavorBonus ?? initialFlavorBonus);
  const [productionCostData, setProductionCostData] = useState<Record<string, number>>(initial?.baseProductionCost ?? initialProductionCost);

  // Selections
  const [countryId, setCountryId] = useState<string>(initial?.countryId ?? defaultSelection.countryId);
  const [baseId, setBaseId] = useState<string>(initial?.baseId ?? defaultSelection.baseId);
  const [presetId, setPresetId] = useState<string>(initial?.presetId ?? defaultSelection.presetId);
  const [pricePoints, setPricePoints] = useState<Record<string, number>>(initial?.pricePoints ?? initialPricePoints);

  // Active price for the currently selected base
  const pricePoint = pricePoints[baseId] ?? 5;
  const setPricePoint = useCallback(
    (v: number) => setPricePoints((prev) => ({ ...prev, [baseId]: v })),
    [baseId],
  );

  const selectedPreset = presets.find((p) => p.id === presetId) ?? presets[0];
  const [weights, setWeights] = useState(initial?.weights ?? getPresetWeights(selectedPreset));

  useEffect(() => { setWeights(getPresetWeights(selectedPreset)); }, [selectedPreset]);
  useEffect(() => { if (!countries.some((c) => c.id === countryId) && countries[0]) setCountryId(countries[0].id); }, [countries, countryId]);
  useEffect(() => { if (!bases.some((b) => b.id === baseId) && bases[0]) setBaseId(bases[0].id); }, [bases, baseId]);
  useEffect(() => { if (!presets.some((p) => p.id === presetId) && presets[0]) setPresetId(presets[0].id); }, [presets, presetId]);

  // Cloud sync — load workspace + chat history once on mount
  const [initialChat, setInitialChat] = useState<unknown[] | undefined>(undefined);
  const [cloudLoaded, setCloudLoaded] = useState(false);
  const [cloudError, setCloudError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [workspaceRes, chatRes] = await Promise.all([
        loadCloudState<{
          factorDefs?: FactorDef[];
          countries?: CountryOption[]; fruits?: FruitOption[]; bases?: GelatoBase[]; presets?: StrategyPreset[];
          countryId?: string; baseId?: string; presetId?: string;
          pricePoints?: Record<string, number>; pricePoint?: number;
          weights?: typeof weights;
          pricingByCountry?: Record<string, PricingProfile>;
          regionalFlavorBonus?: Record<string, Record<string, RegionalFlavorEntry>>;
          baseProductionCost?: Record<string, number>;
        }>("workspace"),
        loadCloudState<unknown[]>("chat"),
      ]);
      if (cancelled) return;
      if (!workspaceRes.ok || !chatRes.ok) {
        setCloudError(workspaceRes.error ?? chatRes.error ?? "Cloud sync unavailable");
      }
      const cloudWorkspace = workspaceRes.data;
      if (cloudWorkspace) {
        if (cloudWorkspace.factorDefs) setFactorDefs(cloudWorkspace.factorDefs);
        if (cloudWorkspace.countries) setCountries(cloudWorkspace.countries);
        if (cloudWorkspace.fruits) setFruits(cloudWorkspace.fruits);
        if (cloudWorkspace.bases) setBases(cloudWorkspace.bases);
        if (cloudWorkspace.presets) setPresets(cloudWorkspace.presets);
        if (cloudWorkspace.pricingByCountry) setPricingData(cloudWorkspace.pricingByCountry);
        if (cloudWorkspace.regionalFlavorBonus) setFlavorData(cloudWorkspace.regionalFlavorBonus);
        if (cloudWorkspace.baseProductionCost) setProductionCostData(cloudWorkspace.baseProductionCost);
        if (cloudWorkspace.countryId) setCountryId(cloudWorkspace.countryId);
        if (cloudWorkspace.baseId) setBaseId(cloudWorkspace.baseId);
        if (cloudWorkspace.presetId) setPresetId(cloudWorkspace.presetId);
        if (cloudWorkspace.pricePoints) {
          setPricePoints(cloudWorkspace.pricePoints);
        } else if (typeof cloudWorkspace.pricePoint === "number") {
          const bases = cloudWorkspace.bases ?? initialGelatoBases;
          setPricePoints(Object.fromEntries(bases.map((b) => [b.id, cloudWorkspace.pricePoint as number])));
        }
        if (cloudWorkspace.weights) setWeights(cloudWorkspace.weights);
      }
      setInitialChat(Array.isArray(chatRes.data) ? chatRes.data : []);
      setCloudLoaded(true);
    })();
    return () => { cancelled = true; };
  }, []);

  // Persist everything — local immediately + cloud debounced
  const debouncedCloudSave = useMemo(
    () => debounce((payload: unknown) => { void saveCloudState("workspace", payload); }, 800),
    [],
  );
  useEffect(() => {
    const payload = {
      factorDefs, countries, fruits, bases, presets, countryId, baseId, presetId, pricePoints, weights,
      pricingByCountry: pricingData, regionalFlavorBonus: flavorData,
      baseProductionCost: productionCostData,
    };
    saveState(payload);
    if (cloudLoaded) debouncedCloudSave(payload);
  }, [factorDefs, countries, fruits, bases, presets, countryId, baseId, presetId, pricePoints, weights, pricingData, flavorData, productionCostData, cloudLoaded, debouncedCloudSave]);

  // Debounced chat history sync
  const debouncedChatSave = useMemo(
    () => debounce((msgs: unknown[]) => { void saveCloudState("chat", msgs); }, 1200),
    [],
  );
  const handleChatMessagesChange = useCallback((msgs: unknown[]) => {
    if (cloudLoaded) debouncedChatSave(msgs);
  }, [cloudLoaded, debouncedChatSave]);

  // Tool handlers for the LLM
  const handleToolCall = useToolHandlers(
    {
      countries, fruits, bases, presets, factorDefs,
      pricingData, flavorData, productionCostData,
      countryId, baseId, presetId, pricePoints, weights,
    },
    {
      setCountries, setFruits, setBases, setPresets,
      setPricingData, setFlavorData, setProductionCostData,
      setCountryId, setBaseId, setPresetId, setPricePoints,
    },
  );

  const selectedCountry = countries.find((c) => c.id === countryId) ?? countries[0];
  const selectedBase = bases.find((b) => b.id === baseId) ?? bases[0];
  const safePreset = selectedPreset ?? presets[0];
  const pricing = pricingData[countryId];

  // Default weights for the currently-selected strategy
  const defaultWeights = useMemo(
    () => (safePreset ? getPresetWeights(safePreset) : weights),
    [safePreset, weights],
  );
  const weightsModified = useMemo(
    () => factorDefs.some((fd) => Math.abs((weights[fd.id] ?? 1) - (defaultWeights[fd.id] ?? 1)) > 0.001),
    [weights, defaultWeights, factorDefs],
  );

  // Data completeness
  const completeness = selectedCountry
    ? countryDataCompleteness(selectedCountry.id, fruits, flavorData)
    : null;

  const dataOverrides: DataOverrides = {
    pricingByCountry: pricingData,
    regionalFlavorBonus: flavorData,
    baseProductionCost: productionCostData,
  };

  const ranking =
    selectedCountry && selectedBase
      ? rankFruitConcepts({
          country: selectedCountry,
          base: selectedBase,
          fruits, weights, pricePoint,
          factorDefs,
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
    if (scenario.pricePoints) {
      setPricePoints(scenario.pricePoints);
    } else if (typeof scenario.pricePoint === "number") {
      setPricePoints((prev) => ({ ...prev, [scenario.baseId]: scenario.pricePoint }));
    }
    setWeights(scenario.weights);
    setActiveTab("analyze");
  }, []);

  // Factor management handlers
  const handleAddFactor = useCallback(() => {
    const id = `factor-${Date.now()}`;
    const label = `Factor ${factorDefs.length + 1}`;
    setFactorDefs((prev) => [...prev, { id, label, definition: "New scoring factor." }]);
    // Add default value (3) to all existing entities
    setCountries((prev) => prev.map((c) => ({ ...c, profile: { ...c.profile, [id]: 3 } })));
    setFruits((prev) => prev.map((f) => ({ ...f, profile: { ...f.profile, [id]: 3 } })));
    setBases((prev) => prev.map((b) => ({ ...b, profile: { ...b.profile, [id]: 3 } })));
    setPresets((prev) => prev.map((p) => ({ ...p, weights: { ...p.weights, [id]: 1 } })));
    setWeights((prev) => ({ ...prev, [id]: 1 }));
  }, [factorDefs.length]);

  const handleDeleteFactor = useCallback((factorId: string) => {
    if (factorDefs.length <= 1) return;
    setFactorDefs((prev) => prev.filter((fd) => fd.id !== factorId));
    // Remove from all entities
    const strip = (profile: Record<string, number>) => {
      const next = { ...profile };
      delete next[factorId];
      return next;
    };
    setCountries((prev) => prev.map((c) => ({ ...c, profile: strip(c.profile) })));
    setFruits((prev) => prev.map((f) => ({ ...f, profile: strip(f.profile) })));
    setBases((prev) => prev.map((b) => ({ ...b, profile: strip(b.profile) })));
    setPresets((prev) => prev.map((p) => ({ ...p, weights: strip(p.weights) })));
    setWeights((prev) => strip(prev));
  }, [factorDefs.length]);

  const handleRenameFactor = useCallback((factorId: string, label: string) => {
    setFactorDefs((prev) => prev.map((fd) => fd.id === factorId ? { ...fd, label } : fd));
  }, []);

  const handleFactorDefinitionChange = useCallback((factorId: string, definition: string) => {
    setFactorDefs((prev) => prev.map((fd) => fd.id === factorId ? { ...fd, definition } : fd));
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
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.36em] text-stone">Bonchi</p>
            <h1 className="mt-1 font-serif text-4xl leading-none text-ink sm:text-5xl">Market Fit</h1>
            <p className="mt-2 max-w-xl text-sm text-stone">
              Which fruit gelato concept will sell best — market by market.
            </p>
          </div>
          <div className="flex gap-2" role="tablist" aria-label="Main navigation">
            <button type="button" role="tab" aria-selected={activeTab === "analyze"} onClick={() => setActiveTab("analyze")} className={tabClass("analyze")}>Analyze</button>
            <button type="button" role="tab" aria-selected={activeTab === "data"} onClick={() => setActiveTab("data")} className={tabClass("data")}>Data</button>
          </div>
        </header>

        {/* Cloud load state */}
        {!cloudLoaded && (
          <div role="status" aria-live="polite" className="mb-6 space-y-3">
            <div className="h-24 animate-pulse rounded-3xl bg-white/60" />
            <div className="h-64 animate-pulse rounded-4xl bg-white/60" />
            <span className="sr-only">Loading workspace from cloud...</span>
          </div>
        )}
        {cloudLoaded && cloudError && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          >
            <svg aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75l-7-12a2 2 0 00-3.4 0l-7 12A2 2 0 005 19z" />
            </svg>
            <div className="flex-1">
              <p className="font-medium">Cloud sync unavailable</p>
              <p className="mt-0.5 text-xs text-amber-800/80">
                Working from local data. Changes won't persist across devices until the connection recovers.
                <span className="ml-1 text-amber-800/60">({cloudError})</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCloudError(null)}
              aria-label="Dismiss cloud sync warning"
              className="rounded-full p-1 text-amber-700/70 transition hover:bg-amber-100 hover:text-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* ANALYZE TAB */}
        {cloudLoaded && activeTab === "analyze" && selectedCountry && selectedBase && safePreset ? (
          <div className="space-y-5">
            {/* 1. Pick a market */}
            <CountrySelector
              countries={countries}
              selectedId={countryId}
              onChange={setCountryId}
              pricingByCountry={pricingData}
            />

            {/* Correctness warning */}
            {completeness && completeness.incomplete && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-2xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900"
              >
                <svg aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75l-7-12a2 2 0 00-3.4 0l-7 12A2 2 0 005 19z" />
                </svg>
                <div className="flex-1">
                  <p className="font-medium">{selectedCountry.label} is missing local data</p>
                  <p className="mt-0.5 text-xs text-amber-800/80">
                    Only {completeness.flavorFilled}/{completeness.total} fruits have a flavor familiarity set. The ranking below is
                    approximate until you add local context.
                  </p>
                  <p className="mt-1.5 text-xs text-amber-800/80">
                    <span className="font-medium">Fix it fast:</span> open <b>Ask AI</b> bottom-right and say{" "}
                    <i>"fill in the flavor data for {selectedCountry.label}"</i>, or edit the tables manually in the Data tab.
                  </p>
                </div>
              </div>
            )}

            {/* 2. The answer — hero card with "why this works" */}
            <ResultsPanel
              country={selectedCountry}
              base={selectedBase}
              preset={safePreset}
              ranking={ranking}
              factorDefs={factorDefs}
            />

            {/* 3. Optional shelves */}
            <Shelf
              label="Tune the model"
              summary={`${selectedBase.label} · ${safePreset.label} · $${pricePoint.toFixed(2)}${weightsModified ? " · modified" : ""}`}
            >
              <p className="mb-4 text-xs text-stone">
                Swap the product base, pick a scoring strategy, and set the shelf price you're testing.
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-stone">Product base</span>
                  <select
                    value={baseId}
                    onChange={(e) => setBaseId(e.target.value)}
                    aria-label="Product base"
                    className="w-full rounded-xl border border-sand bg-bone px-3 py-2.5 text-sm text-ink outline-none transition focus:border-[#2D6A4F] focus-visible:ring-2 focus-visible:ring-[#2D6A4F]/40"
                  >
                    {bases.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
                  </select>
                </label>
                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-stone">Strategy</span>
                  <select
                    value={presetId}
                    onChange={(e) => setPresetId(e.target.value)}
                    aria-label="Scoring strategy"
                    className="w-full rounded-xl border border-sand bg-bone px-3 py-2.5 text-sm text-ink outline-none transition focus:border-[#2D6A4F] focus-visible:ring-2 focus-visible:ring-[#2D6A4F]/40"
                  >
                    {presets.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                  {safePreset?.summary && (
                    <p className="text-[11px] leading-snug text-stone">{safePreset.summary}</p>
                  )}
                </label>
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-stone">
                    Price for {selectedBase.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="range" min="1" max="20" step="0.25"
                      value={pricePoint}
                      onChange={(e) => setPricePoint(Number(e.target.value))}
                      aria-label={`Price point for ${selectedBase.label}, currently ${pricePoint.toFixed(2)} dollars`}
                      className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-sand accent-[#2D6A4F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F]/40"
                    />
                    <span className="w-14 text-right text-sm font-semibold text-ink">${pricePoint.toFixed(2)}</span>
                  </div>
                  {pricing && (
                    <p className="text-[11px] text-stone">
                      Market avg: ${pricing.avgMarketPrice.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5 border-t border-sand/70 pt-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-stone">
                      Factor weights
                    </p>
                    <p className="mt-0.5 text-[11px] leading-snug text-stone/80">
                      Each factor's weight multiplies how much it counts toward the final score. Higher weight = that
                      trait matters more when picking the winner. Defaults come from the <b>{safePreset.label}</b> strategy.
                    </p>
                  </div>
                  {weightsModified && (
                    <button
                      type="button"
                      onClick={() => setWeights(defaultWeights)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#2D6A4F]/30 bg-white px-3 py-1.5 text-[11px] font-medium text-[#2D6A4F] transition hover:bg-[#2D6A4F]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F]/40"
                    >
                      <svg aria-hidden="true" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15m-10.418-7a8.003 8.003 0 0115.357 2M4.582 9H9" />
                      </svg>
                      Reset to {safePreset.label}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {factorDefs.map((fd) => {
                    const isModified = Math.abs((weights[fd.id] ?? 1) - (defaultWeights[fd.id] ?? 1)) > 0.001;
                    return (
                      <label key={fd.id} className="block">
                        <div className="mb-1 flex items-center justify-between text-[11px]">
                          <span className="flex items-center gap-1 text-ink">
                            {fd.label}
                            {isModified && (
                              <span
                                aria-label="Modified from strategy default"
                                title="Modified from strategy default"
                                className="inline-block h-1.5 w-1.5 rounded-full bg-[#2D6A4F]"
                              />
                            )}
                          </span>
                          <span className="font-medium tabular-nums text-stone">{(weights[fd.id] ?? 1).toFixed(1)}x</span>
                        </div>
                        <input
                          type="range" min="0.4" max="2" step="0.1"
                          value={weights[fd.id] ?? 1}
                          onChange={(e) => setWeights((w) => ({ ...w, [fd.id]: Number(e.target.value) }))}
                          aria-label={`${fd.label} weight, currently ${(weights[fd.id] ?? 1).toFixed(1)} times. ${fd.definition}`}
                          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-sand accent-[#2D6A4F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F]/40"
                        />
                        <p className="mt-1 text-[10px] leading-snug text-stone/80">{fd.definition}</p>
                      </label>
                    );
                  })}
                </div>
              </div>
            </Shelf>

            <Shelf
              label="Save & export"
              summary="snapshots / JSON / CSV"
            >
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => handleExport("json")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-medium text-ink ring-1 ring-sand transition hover:ring-[#2D6A4F]/40">
                  Export JSON
                </button>
                <button type="button" onClick={() => handleExport("csv")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-medium text-ink ring-1 ring-sand transition hover:ring-[#2D6A4F]/40">
                  Export CSV
                </button>
                <div className="ml-auto" />
                <ScenarioPanel
                  countryId={countryId} baseId={baseId} presetId={presetId}
                  pricePoint={pricePoint} pricePoints={pricePoints} weights={weights}
                  topConcept={ranking[0]?.conceptLabel ?? "—"} topScore={ranking[0]?.score ?? 0}
                  countryLabel={selectedCountry.label} baseLabel={selectedBase.label}
                  presetLabel={safePreset.label} onRestore={handleRestoreScenario}
                />
              </div>
            </Shelf>
          </div>
        ) : null}

        {/* DATA TAB */}
        {activeTab === "data" ? (
          <div className="space-y-6">
            <ModelLibrary
              countries={countries} fruits={fruits} bases={bases} presets={presets}
              factorDefs={factorDefs} weights={weights}
              pricingByCountry={pricingData} flavorData={flavorData}
              productionCostData={productionCostData}
              data={dataOverrides}
              onAddCountry={() => {
                const id = `country-${Date.now()}`;
                const label = `New Country ${countries.length + 1}`;
                setCountries((c) => [...c, { id, label, profile: buildEmptyProfile(factorDefs) }]);
                setPricingData((prev) => ({ ...prev, [id]: { avgMarketPrice: 4, currency: "USD" } }));
                setFlavorData((prev) => {
                  const updated = { ...prev, [id]: {} as Record<string, RegionalFlavorEntry> };
                  for (const fr of fruits) updated[id][fr.id] = { familiarity: "low" as const };
                  return updated;
                });
                setCountryId(id);
                setActiveTab("analyze");
              }}
              onDeleteCountry={(id) => {
                if (countries.length <= 1) return;
                setCountries((c) => c.filter((x) => x.id !== id));
                setPricingData((prev) => { const next = { ...prev }; delete next[id]; return next; });
                setFlavorData((prev) => { const next = { ...prev }; delete next[id]; return next; });
                if (countryId === id) setCountryId(countries.find((c) => c.id !== id)?.id ?? "");
              }}
              onAddFruit={() => {
                const id = `fruit-${Date.now()}`;
                const label = `New Fruit ${fruits.length + 1}`;
                setFruits((f) => [...f, { id, label, profile: buildEmptyProfile(factorDefs) }]);
                setFlavorData((prev) => {
                  const updated = { ...prev };
                  for (const c of countries) updated[c.id] = { ...updated[c.id], [id]: { familiarity: "low" as const } };
                  return updated;
                });
              }}
              onDeleteFruit={(id) => {
                if (fruits.length <= 1) return;
                setFruits((f) => f.filter((x) => x.id !== id));
                setFlavorData((prev) => {
                  const next = { ...prev };
                  for (const cId of Object.keys(next)) {
                    const cFlavors = { ...next[cId] }; delete cFlavors[id]; next[cId] = cFlavors;
                  }
                  return next;
                });
              }}
              onAddBase={() => {
                const id = `base-${Date.now()}`;
                const label = `New Base ${bases.length + 1}`;
                setBases((b) => [...b, { id, label, profile: buildEmptyProfile(factorDefs) }]);
                setProductionCostData((prev) => ({ ...prev, [id]: 2.5 }));
                setPricePoints((prev) => ({ ...prev, [id]: 5 }));
              }}
              onDeleteBase={(id) => {
                if (bases.length <= 1) return;
                setBases((b) => b.filter((x) => x.id !== id));
                setProductionCostData((prev) => { const next = { ...prev }; delete next[id]; return next; });
                setPricePoints((prev) => { const next = { ...prev }; delete next[id]; return next; });
                if (baseId === id) setBaseId(bases.find((b) => b.id !== id)?.id ?? "");
              }}
              onAddPreset={() => {
                const id = `preset-${Date.now()}`;
                setPresets((p) => [...p, { id, label: `New Strategy ${presets.length + 1}`, weights: buildDefaultWeights(factorDefs), summary: "" }]);
              }}
              onDeletePreset={(id) => {
                if (presets.length <= 1) return;
                setPresets((p) => p.filter((x) => x.id !== id));
                if (presetId === id) setPresetId(presets.find((p) => p.id !== id)?.id ?? "");
              }}
              onAddFactor={handleAddFactor}
              onDeleteFactor={handleDeleteFactor}
              onRenameFactor={handleRenameFactor}
              onFactorDefinitionChange={handleFactorDefinitionChange}
              onCountryLabelChange={(id, label) => setCountries((c) => c.map((x) => x.id === id ? { ...x, label } : x))}
              onCountryFactorChange={(id, factor, value) => setCountries((c) => c.map((x) => x.id === id ? { ...x, profile: { ...x.profile, [factor]: clampInput(value) } } : x))}
              onFruitLabelChange={(id, label) => setFruits((f) => f.map((x) => x.id === id ? { ...x, label } : x))}
              onFruitFactorChange={(id, factor, value) => setFruits((f) => f.map((x) => x.id === id ? { ...x, profile: { ...x.profile, [factor]: clampInput(value) } } : x))}
              onBaseLabelChange={(id, label) => setBases((b) => b.map((x) => x.id === id ? { ...x, label } : x))}
              onBaseFactorChange={(id, factor, value) => setBases((b) => b.map((x) => x.id === id ? { ...x, profile: { ...x.profile, [factor]: clampInput(value) } } : x))}
              onPresetLabelChange={(id, label) => setPresets((p) => p.map((x) => x.id === id ? { ...x, label } : x))}
              onPresetFactorChange={(id, factor, value) => setPresets((p) => p.map((x) => x.id === id ? { ...x, weights: { ...x.weights, [factor]: clampInput(value) } } : x))}
              onPresetSummaryChange={(id, summary) => setPresets((p) => p.map((x) => x.id === id ? { ...x, summary } : x))}
              onPricingChange={(cId, field, value) => setPricingData((prev) => ({ ...prev, [cId]: { ...prev[cId], [field]: value } }))}
              onFlavorBonusChange={(cId, fId, _field, value) => setFlavorData((prev) => ({ ...prev, [cId]: { ...prev[cId], [fId]: { familiarity: value as FlavorFamiliarity } } }))}
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

      {/* Floating AI assistant — available on every tab */}
      {cloudLoaded && (
        <ChatPanel
          onToolCall={handleToolCall}
          initialMessages={initialChat as never}
          onMessagesChange={handleChatMessagesChange}
        />
      )}
    </main>
  );
}
