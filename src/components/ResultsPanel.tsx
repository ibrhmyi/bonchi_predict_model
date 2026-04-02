import { useState } from "react";
import { factorLabels, type CountryOption, type GelatoBase, type StrategyPreset } from "../data/marketFit";
import { getCostDollarSign, getFlavorFamiliarityLabel, getMatchQualityLabel, getSupplyLabel } from "../data/regionalData";
import { getPriceImpact } from "../data/pricing";
import type { RankedConcept } from "../utils/scoring";
import { CompetitorPanel } from "./CompetitorPanel";
import { DemographicsPanel } from "./DemographicsPanel";

type ResultsPanelProps = {
  country: CountryOption;
  base: GelatoBase;
  preset: StrategyPreset;
  ranking: RankedConcept[];
};

const familiarityBadgeColors = {
  green: "bg-emerald-100 text-emerald-700 border-emerald-200",
  yellow: "bg-amber-100 text-amber-700 border-amber-200",
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  red: "bg-red-100 text-red-700 border-red-200",
};

function CollapsibleSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 rounded-2xl border border-sand bg-white/80 px-5 py-3.5 text-sm font-medium text-ink transition hover:border-[#2D6A4F]/30 hover:bg-white"
      >
        <svg
          className={`h-4 w-4 shrink-0 text-stone transition-transform ${open ? "rotate-90" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        {label}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

function FactorBar({ label, score }: { label: string; score: number }) {
  const quality = getMatchQualityLabel(score);
  const pct = (score / 5) * 100;
  const color =
    score >= 4.5
      ? "from-[#2D6A4F] to-[#40916C]"
      : score >= 3.5
        ? "from-[#40916C] to-[#74C69D]"
        : score >= 2.5
          ? "from-[#B78543] to-[#D4A76A]"
          : "from-[#7d7468] to-[#a09585]";

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="text-ink">{label}</span>
        <span className={`text-xs font-semibold ${score >= 3.5 ? "text-[#2D6A4F]" : score >= 2.5 ? "text-[#B78543]" : "text-stone"}`}>
          {quality}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-sand/60">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function ResultsPanel({
  country,
  base,
  preset,
  ranking,
}: ResultsPanelProps) {
  const topPick = ranking[0];
  const [showAllFactors, setShowAllFactors] = useState(false);

  if (!topPick) return null;

  // Top 3 factors sorted by weighted match
  const sortedFactors = [...topPick.factorDetails].sort(
    (a, b) => b.weightedMatch - a.weightedMatch,
  );
  const displayFactors = showAllFactors ? sortedFactors : sortedFactors.slice(0, 3);

  const priceImpact = topPick.priceFit !== null ? getPriceImpact(topPick.priceFit) : null;
  const priceImpactStyle = {
    boost: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Price Boost" },
    neutral: { bg: "bg-amber-100", text: "text-amber-700", label: "Neutral" },
    penalty: { bg: "bg-red-100", text: "text-red-700", label: "Price Penalty" },
  };

  return (
    <section className="space-y-5">
      {/* Hero: Best concept */}
      <article className="overflow-hidden rounded-4xl border border-[#e8decd] bg-[#fffdf9] shadow-panel">
        <div className="bg-gradient-to-br from-[#fbf8f3] via-white to-[#f2eadf] p-6 xl:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-stone">
                Best concept for {country.label}
              </p>
              <h2 className="mt-2 font-serif text-4xl text-ink xl:text-5xl">
                {topPick.conceptLabel}
              </h2>

              {/* Badges row */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {topPick.regionalFlavorInfo && (
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${familiarityBadgeColors[getFlavorFamiliarityLabel(topPick.regionalFlavorInfo.familiarity).color]}`}
                  >
                    {getFlavorFamiliarityLabel(topPick.regionalFlavorInfo.familiarity).label}
                  </span>
                )}
                {topPick.regionalBonus > 0 && (
                  <span className="text-xs font-medium text-[#2D6A4F]">
                    +{topPick.regionalBonus.toFixed(1)} pts regional
                  </span>
                )}
                {topPick.costEfficiency && (
                  <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                    {getCostDollarSign(topPick.costEfficiency.costIndex)} sourcing · {getSupplyLabel(topPick.costEfficiency.supplyReliability)}
                  </span>
                )}
                {priceImpact && (
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${priceImpactStyle[priceImpact].bg} ${priceImpactStyle[priceImpact].text}`}
                  >
                    {priceImpactStyle[priceImpact].label}
                  </span>
                )}
              </div>
            </div>

            {/* Score cards */}
            <div className="flex gap-3">
              <div className="rounded-3xl bg-[#1B4332] px-5 py-4 text-white shadow-lg shadow-[#1B4332]/20">
                <div className="text-[10px] uppercase tracking-[0.28em] text-white/50">
                  Score
                </div>
                <div className="mt-1 flex items-end gap-1.5">
                  <span className="text-5xl font-bold tabular-nums">{topPick.score}</span>
                  <span className="pb-1 text-lg text-white/40">/100</span>
                </div>
              </div>
              {topPick.estimatedMargin !== null && (
                <div className="rounded-3xl bg-[#2D6A4F] px-5 py-4 text-white shadow-lg shadow-[#2D6A4F]/20">
                  <div className="text-[10px] uppercase tracking-[0.28em] text-white/50">
                    Est. Margin
                  </div>
                  <div className="mt-1 text-4xl font-bold tabular-nums">
                    ${topPick.estimatedMargin.toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_0.85fr] xl:p-8">
          {/* Data-driven insights */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-stone">
              Why this works
            </h3>
            <ul className="mt-3 space-y-2.5">
              {topPick.insights.map((line, i) => (
                <li
                  key={i}
                  className="rounded-2xl border border-[#2D6A4F]/10 bg-[#2D6A4F]/[0.03] px-4 py-3 text-sm leading-6 text-ink"
                >
                  {line}
                </li>
              ))}
            </ul>
          </div>

          {/* Factor bars — top 3 by default */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-stone">
              Key strengths
            </h3>
            <div className="mt-3 space-y-3.5">
              {displayFactors.map((detail) => (
                <FactorBar
                  key={detail.factor}
                  label={factorLabels[detail.factor]}
                  score={detail.match}
                />
              ))}
              {topPick.costEfficiency && showAllFactors && (
                <FactorBar label="Cost Efficiency" score={topPick.costEfficiency.score} />
              )}
              {topPick.priceFit !== null && showAllFactors && (
                <FactorBar label="Price Accessibility" score={topPick.priceFit} />
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowAllFactors((v) => !v)}
              className="mt-3 text-xs font-medium text-[#2D6A4F] hover:underline"
            >
              {showAllFactors ? "Show top 3 only" : "Show all factors"}
            </button>
          </div>
        </div>
      </article>

      {/* Ranked list */}
      <article className="rounded-4xl border border-white/70 bg-white/80 p-6 shadow-panel backdrop-blur xl:p-8">
        <h3 className="font-serif text-2xl text-ink">Top Products</h3>
        <p className="mt-1 text-sm text-stone">
          All {base.label.toLowerCase()} concepts ranked for {country.label} — {preset.label.toLowerCase()} strategy.
        </p>

        <div className="mt-5 space-y-2.5">
          {ranking.map((entry, index) => {
            const flavorInfo = entry.regionalFlavorInfo;
            const familiarityStyle = flavorInfo
              ? familiarityBadgeColors[getFlavorFamiliarityLabel(flavorInfo.familiarity).color]
              : null;

            return (
              <div
                key={entry.fruit.id}
                className={`flex flex-col gap-3 rounded-2xl border px-4 py-3.5 transition-all duration-200 md:flex-row md:items-center md:justify-between ${
                  index === 0
                    ? "border-[#2D6A4F]/20 bg-[#2D6A4F]/[0.04]"
                    : "border-[#ece3d5] bg-[#fffdfa] hover:border-sand"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                      index === 0
                        ? "bg-[#1B4332] text-white"
                        : "bg-ink/5 text-ink"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-ink">{entry.conceptLabel}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      {flavorInfo && familiarityStyle && (
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${familiarityStyle}`}
                        >
                          {getFlavorFamiliarityLabel(flavorInfo.familiarity).label}
                        </span>
                      )}
                      {entry.costEfficiency && (
                        <span className="text-[10px] font-medium text-blue-600">
                          {getCostDollarSign(entry.costEfficiency.costIndex)} · {getSupplyLabel(entry.costEfficiency.supplyReliability)}
                        </span>
                      )}
                      {entry.regionalBonus > 0 && (
                        <span className="text-[10px] font-medium text-[#2D6A4F]">
                          +{entry.regionalBonus.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {entry.estimatedMargin !== null && (
                    <div className="text-right">
                      <div className="text-base font-bold text-[#2D6A4F]">
                        ${entry.estimatedMargin.toFixed(2)}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-stone">
                        margin
                      </div>
                    </div>
                  )}
                  <div className="text-right">
                    <div className="text-2xl font-bold tabular-nums text-ink">{entry.score}</div>
                    <div className="text-[10px] uppercase tracking-wider text-stone">
                      score
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </article>

      {/* Collapsible sections */}
      <CollapsibleSection label={`\u{1F4CA} View ${country.label} demographics`}>
        <DemographicsPanel countryId={country.id} countryLabel={country.label} />
      </CollapsibleSection>

      <CollapsibleSection label={`\u{1F3EA} View competitor landscape in ${country.label}`}>
        <CompetitorPanel countryId={country.id} countryLabel={country.label} />
      </CollapsibleSection>
    </section>
  );
}
