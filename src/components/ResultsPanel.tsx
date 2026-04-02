import { factorLabels, type CountryOption, type FactorMap, type GelatoBase, type StrategyPreset } from "../data/marketFit";
import { getCostDollarSign, getFlavorFamiliarityLabel, getSupplyLabel } from "../data/regionalData";
import { getDominantFactors, type RankedConcept } from "../utils/scoring";
import { CompetitorPanel } from "./CompetitorPanel";
import { DemographicsPanel } from "./DemographicsPanel";
import { PriceSimulator } from "./PriceSimulator";

type ResultsPanelProps = {
  country: CountryOption;
  base: GelatoBase;
  preset: StrategyPreset;
  weights: FactorMap;
  ranking: RankedConcept[];
  pricePoint: number;
  onPriceChange: (price: number) => void;
};

const familiarityBadgeColors = {
  green: "bg-emerald-100 text-emerald-700 border-emerald-200",
  yellow: "bg-amber-100 text-amber-700 border-amber-200",
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  red: "bg-red-100 text-red-700 border-red-200",
};

export function ResultsPanel({
  country,
  base,
  preset,
  weights,
  ranking,
  pricePoint,
  onPriceChange,
}: ResultsPanelProps) {
  const topPick = ranking[0];
  const dominantFactors = getDominantFactors(weights);

  return (
    <section className="space-y-6">
      {/* Top concept */}
      <article className="overflow-hidden rounded-4xl border border-[#e8decd] bg-[#fffdf9] shadow-panel">
        <div className="border-b border-[#eee4d6] bg-gradient-to-br from-[#fbf8f3] via-white to-[#f2eadf] p-6 xl:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-stone">
                Best concept
              </p>
              <h2 className="mt-3 font-serif text-4xl text-ink xl:text-5xl">
                {topPick.conceptLabel}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone">
                Top fruit choice for {country.label} when Bonchi enters with {base.label.toLowerCase()} under the {preset.label.toLowerCase()} strategy.
              </p>
              {/* Regional flavor badge */}
              {topPick.regionalFlavorInfo && (
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${familiarityBadgeColors[getFlavorFamiliarityLabel(topPick.regionalFlavorInfo.familiarity).color]}`}
                  >
                    {getFlavorFamiliarityLabel(topPick.regionalFlavorInfo.familiarity).label}
                  </span>
                  {topPick.regionalBonus > 0 && (
                    <span className="text-xs font-medium text-emerald-600">
                      +{topPick.regionalBonus.toFixed(1)} pts regional flavor bonus
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <div className="w-full max-w-[160px] rounded-3xl bg-ink px-5 py-4 text-white shadow-card">
                <div className="text-xs uppercase tracking-[0.28em] text-white/60">
                  Score
                </div>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-5xl font-semibold">{topPick.score}</span>
                  <span className="pb-1 text-white/60">/100</span>
                </div>
              </div>
              {topPick.estimatedMargin !== null && (
                <div className="w-full max-w-[140px] rounded-3xl bg-[#2D6A4F] px-4 py-4 text-white shadow-card">
                  <div className="text-xs uppercase tracking-[0.28em] text-white/60">
                    Est. Margin
                  </div>
                  <div className="mt-2 text-3xl font-semibold">
                    ${topPick.estimatedMargin.toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-8 p-6 xl:grid-cols-[1fr_0.95fr] xl:p-8">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-stone">
              Why this concept works
            </h3>
            <ul className="mt-4 space-y-3">
              {topPick.explanation.map((line) => (
                <li
                  key={line}
                  className="rounded-2xl border border-sand bg-bone/60 px-4 py-3 text-sm leading-6 text-ink"
                >
                  {line}
                </li>
              ))}
              {topPick.regionalFlavorInfo && (
                <li className="rounded-2xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-sm leading-6 text-ink">
                  {topPick.regionalFlavorInfo.reason}
                </li>
              )}
              {topPick.costEfficiency && (
                <li className="rounded-2xl border border-blue-200 bg-blue-50/60 px-4 py-3 text-sm leading-6 text-ink">
                  {topPick.costEfficiency.sourceNote}
                  {" "}(Sourcing: {getCostDollarSign(topPick.costEfficiency.costIndex)}, Supply: {getSupplyLabel(topPick.costEfficiency.supplyReliability)})
                </li>
              )}
            </ul>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-stone">
                Factor breakdown
              </h3>
              <span className="text-xs uppercase tracking-[0.24em] text-stone">
                Match vs market
              </span>
            </div>
            <div className="mt-4 space-y-4">
              {topPick.factorDetails.map((detail) => (
                <div key={detail.factor}>
                  <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                    <span className="text-ink">{factorLabels[detail.factor]}</span>
                    <span className="text-stone">{detail.match.toFixed(1)} / 5</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-sand/80">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-olive via-gold to-clay transition-all duration-500"
                      style={{ width: `${(detail.match / 5) * 100}%` }}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-stone">
                    <span>
                      Market {detail.countryValue} | Concept {detail.conceptValue}
                    </span>
                    <span>{detail.weight.toFixed(1)}x weight</span>
                  </div>
                </div>
              ))}
              {/* Cost efficiency bar */}
              {topPick.costEfficiency && (
                <div>
                  <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                    <span className="text-ink">Cost Efficiency</span>
                    <span className="text-stone">{topPick.costEfficiency.score.toFixed(1)} / 5</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-sand/80">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
                      style={{ width: `${(topPick.costEfficiency.score / 5) * 100}%` }}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-stone">
                    <span>
                      Cost {getCostDollarSign(topPick.costEfficiency.costIndex)} | {getSupplyLabel(topPick.costEfficiency.supplyReliability)}
                    </span>
                    <span>sourcing factor</span>
                  </div>
                </div>
              )}
              {/* Price fit bar */}
              {topPick.priceFit !== null && (
                <div>
                  <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                    <span className="text-ink">Price Accessibility</span>
                    <span className="text-stone">{topPick.priceFit.toFixed(1)} / 5</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-sand/80">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500"
                      style={{ width: `${(topPick.priceFit / 5) * 100}%` }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-stone">
                    Based on ${pricePoint.toFixed(2)} price point
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </article>

      {/* Price simulation */}
      <article className="rounded-4xl border border-white/70 bg-white/80 p-6 shadow-panel backdrop-blur xl:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-stone">
          Price simulation
        </p>
        <h3 className="mt-2 font-serif text-3xl text-ink">Price Impact</h3>
        <p className="mt-2 max-w-xl text-sm leading-6 text-stone">
          Adjust the price point to see how it affects market fit scoring and estimated margins across all concepts.
        </p>
        <div className="mt-5">
          <PriceSimulator
            countryId={country.id}
            pricePoint={pricePoint}
            onPriceChange={onPriceChange}
          />
        </div>
      </article>

      {/* Full ranking */}
      <article className="rounded-4xl border border-white/70 bg-white/80 p-6 shadow-panel backdrop-blur xl:p-8">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-stone">
              Fruit ranking for selected base
            </p>
            <h3 className="mt-2 font-serif text-3xl text-ink">All fruit concepts</h3>
          </div>
          <p className="max-w-xl text-sm leading-6 text-stone">
            The current model leans hardest on {factorLabels[dominantFactors[0]].toLowerCase()} and{" "}
            {factorLabels[dominantFactors[1]].toLowerCase()}.
          </p>
        </div>

        <div className="mt-6 space-y-3">
          {ranking.map((entry, index) => {
            const flavorInfo = entry.regionalFlavorInfo;
            const familiarityStyle = flavorInfo
              ? familiarityBadgeColors[getFlavorFamiliarityLabel(flavorInfo.familiarity).color]
              : null;

            return (
              <div
                key={entry.fruit.id}
                className={`flex flex-col gap-4 rounded-3xl border px-4 py-4 transition md:flex-row md:items-center md:justify-between ${
                  index === 0
                    ? "border-[#dcc6a6] bg-[#f7f1e7]"
                    : "border-[#ece3d5] bg-[#fffdfa]"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ink text-sm font-semibold text-white">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-lg font-medium text-ink">{entry.fruit.label}</div>
                    <p className="mt-1 text-sm leading-6 text-stone">{entry.conceptLabel}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      {flavorInfo && familiarityStyle && (
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${familiarityStyle}`}
                        >
                          {getFlavorFamiliarityLabel(flavorInfo.familiarity).label}
                        </span>
                      )}
                      {entry.costEfficiency && (
                        <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                          {getCostDollarSign(entry.costEfficiency.costIndex)} · {getSupplyLabel(entry.costEfficiency.supplyReliability)}
                        </span>
                      )}
                      {entry.regionalBonus > 0 && (
                        <span className="text-[10px] font-medium text-emerald-600">
                          +{entry.regionalBonus.toFixed(1)} regional
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  {entry.estimatedMargin !== null && (
                    <>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-[#2D6A4F]">
                          ${entry.estimatedMargin.toFixed(2)}
                        </div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-stone">
                          margin
                        </div>
                      </div>
                      <div className="h-12 w-px bg-[#e7dece]" />
                    </>
                  )}
                  <div className="text-right">
                    <div className="text-2xl font-semibold text-ink">{entry.score}</div>
                    <div className="text-xs uppercase tracking-[0.24em] text-stone">
                      Fit score
                    </div>
                  </div>
                  <div className="h-12 w-px bg-[#e7dece]" />
                  <div className="max-w-[220px] text-sm text-stone">
                    Strongest on{" "}
                    {entry.factorDetails
                      .slice()
                      .sort((left, right) => right.weightedMatch - left.weightedMatch)
                      .slice(0, 2)
                      .map((detail) => factorLabels[detail.factor].toLowerCase())
                      .join(" and ")}
                    .
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </article>

      {/* Demographics & Competitors */}
      <div className="grid gap-6 xl:grid-cols-2">
        <DemographicsPanel countryId={country.id} countryLabel={country.label} />
        <CompetitorPanel countryId={country.id} countryLabel={country.label} />
      </div>
    </section>
  );
}
