import { useEffect, useState } from "react";
import { ControlPanel } from "./components/ControlPanel";
import { ModelLibrary } from "./components/ModelLibrary";
import { ResultsPanel } from "./components/ResultsPanel";
import {
  countries as initialCountries,
  defaultSelection,
  emptyCountryProfile,
  emptyFruitProfile,
  fruits as initialFruits,
  gelatoBases as initialGelatoBases,
  strategyPresets as initialStrategyPresets,
  type CountryOption,
  type FruitOption,
  type GelatoBase,
  type StrategyPreset,
} from "./data/marketFit";
import { getPresetWeights, rankFruitConcepts } from "./utils/scoring";

type ActiveTab = "decision-tool" | "model-library";

const clampInput = (value: number) => Math.min(5, Math.max(1, value));

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("decision-tool");
  const [countries, setCountries] = useState<CountryOption[]>(initialCountries);
  const [fruits, setFruits] = useState<FruitOption[]>(initialFruits);
  const [bases, setBases] = useState<GelatoBase[]>(initialGelatoBases);
  const [presets, setPresets] = useState<StrategyPreset[]>(initialStrategyPresets);
  const [countryId, setCountryId] = useState<string>(defaultSelection.countryId);
  const [baseId, setBaseId] = useState<string>(defaultSelection.baseId);
  const [presetId, setPresetId] = useState<string>(defaultSelection.presetId);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const selectedPreset = presets.find((preset) => preset.id === presetId) ?? presets[0];
  const [weights, setWeights] = useState(getPresetWeights(selectedPreset));

  useEffect(() => {
    setWeights(getPresetWeights(selectedPreset));
  }, [selectedPreset]);

  useEffect(() => {
    if (!countries.some((country) => country.id === countryId) && countries[0]) {
      setCountryId(countries[0].id);
    }
  }, [countries, countryId]);

  useEffect(() => {
    if (!bases.some((base) => base.id === baseId) && bases[0]) {
      setBaseId(bases[0].id);
    }
  }, [bases, baseId]);

  useEffect(() => {
    if (!presets.some((preset) => preset.id === presetId) && presets[0]) {
      setPresetId(presets[0].id);
    }
  }, [presets, presetId]);

  const selectedCountry = countries.find((country) => country.id === countryId) ?? countries[0];
  const selectedBase = bases.find((base) => base.id === baseId) ?? bases[0];
  const safePreset = selectedPreset ?? presets[0];

  const ranking =
    selectedCountry && selectedBase
      ? rankFruitConcepts({
          country: selectedCountry,
          base: selectedBase,
          fruits,
          weights,
        })
      : [];

  const tabButtonClass = (tab: ActiveTab) =>
    `rounded-full px-5 py-2.5 text-sm font-medium transition ${
      activeTab === tab
        ? "bg-ink text-white shadow-card"
        : "bg-white/85 text-ink ring-1 ring-[#e7dece] hover:ring-gold"
    }`;

  return (
    <main className="min-h-screen px-4 py-6 text-ink sm:px-6 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 rounded-4xl border border-white/70 bg-white/70 p-6 shadow-panel backdrop-blur xl:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.36em] text-stone">
                Bonchi prototype
              </p>
              <h1 className="mt-3 font-serif text-5xl leading-none text-ink sm:text-6xl xl:text-7xl">
                Gelato Market Fit
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-stone">
                Transparent concept scoring for deciding which fruit gelato ideas Bonchi should prioritize by market.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
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
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-sand bg-bone/80 px-4 py-4">
              <div className="text-xs uppercase tracking-[0.24em] text-stone">Country</div>
              <div className="mt-2 text-lg font-medium text-ink">
                {selectedCountry?.label ?? "N/A"}
              </div>
            </div>
            <div className="rounded-3xl border border-sand bg-bone/80 px-4 py-4">
              <div className="text-xs uppercase tracking-[0.24em] text-stone">Gelato Base</div>
              <div className="mt-2 text-lg font-medium text-ink">
                {selectedBase?.label ?? "N/A"}
              </div>
            </div>
            <div className="rounded-3xl border border-sand bg-bone/80 px-4 py-4">
              <div className="text-xs uppercase tracking-[0.24em] text-stone">Preset</div>
              <div className="mt-2 text-lg font-medium text-ink">{safePreset?.label ?? "N/A"}</div>
            </div>
          </div>
        </header>

        {activeTab === "decision-tool" && selectedCountry && selectedBase && safePreset ? (
          <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
            <ControlPanel
              countries={countries}
              bases={bases}
              presets={presets}
              selectedCountryId={countryId}
              selectedBaseId={baseId}
              selectedPresetId={presetId}
              advancedOpen={advancedOpen}
              weights={weights}
              onCountryChange={setCountryId}
              onBaseChange={setBaseId}
              onPresetChange={setPresetId}
              onToggleAdvanced={() => setAdvancedOpen((open) => !open)}
              onWeightChange={(factor, value) =>
                setWeights((current) => ({ ...current, [factor]: clampInput(value) }))
              }
            />

            <ResultsPanel
              country={selectedCountry}
              base={selectedBase}
              preset={safePreset}
              weights={weights}
              ranking={ranking}
            />
          </div>
        ) : null}

        {activeTab === "model-library" ? (
          <ModelLibrary
            countries={countries}
            fruits={fruits}
            bases={bases}
            presets={presets}
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
                current.map((country) =>
                  country.id === id ? { ...country, label } : country,
                ),
              )
            }
            onCountryFactorChange={(id, factor, value) =>
              setCountries((current) =>
                current.map((country) =>
                  country.id === id
                    ? {
                        ...country,
                        profile: {
                          ...country.profile,
                          [factor]: clampInput(value),
                        },
                      }
                    : country,
                ),
              )
            }
            onFruitLabelChange={(id, label) =>
              setFruits((current) =>
                current.map((fruit) => (fruit.id === id ? { ...fruit, label } : fruit)),
              )
            }
            onFruitFactorChange={(id, factor, value) =>
              setFruits((current) =>
                current.map((fruit) =>
                  fruit.id === id
                    ? {
                        ...fruit,
                        profile: {
                          ...fruit.profile,
                          [factor]: clampInput(value),
                        },
                      }
                    : fruit,
                ),
              )
            }
            onBaseLabelChange={(id, label) =>
              setBases((current) =>
                current.map((base) => (base.id === id ? { ...base, label } : base)),
              )
            }
            onBaseFactorChange={(id, factor, value) =>
              setBases((current) =>
                current.map((base) =>
                  base.id === id
                    ? {
                        ...base,
                        profile: {
                          ...base.profile,
                          [factor]: clampInput(value),
                        },
                      }
                    : base,
                ),
              )
            }
            onPresetLabelChange={(id, label) =>
              setPresets((current) =>
                current.map((preset) => (preset.id === id ? { ...preset, label } : preset)),
              )
            }
            onPresetFactorChange={(id, factor, value) =>
              setPresets((current) =>
                current.map((preset) =>
                  preset.id === id
                    ? {
                        ...preset,
                        weights: {
                          ...preset.weights,
                          [factor]: clampInput(value),
                        },
                      }
                    : preset,
                ),
              )
            }
            onPresetSummaryChange={(id, summary) =>
              setPresets((current) =>
                current.map((preset) => (preset.id === id ? { ...preset, summary } : preset)),
              )
            }
          />
        ) : null}
      </div>
    </main>
  );
}
