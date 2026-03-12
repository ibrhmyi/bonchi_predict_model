import { factorLabels, type CountryOption, type FactorMap, type GelatoBase, type StrategyPreset } from "../data/marketFit";
import { getDominantFactors, type RankedConcept } from "../utils/scoring";

type ResultsPanelProps = {
  country: CountryOption;
  base: GelatoBase;
  preset: StrategyPreset;
  weights: FactorMap;
  ranking: RankedConcept[];
};

export function ResultsPanel({
  country,
  base,
  preset,
  weights,
  ranking,
}: ResultsPanelProps) {
  const topPick = ranking[0];
  const dominantFactors = getDominantFactors(weights);

  return (
    <section className="space-y-6">
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
            </div>

            <div className="w-full max-w-xs rounded-3xl bg-ink px-5 py-4 text-white shadow-card">
              <div className="text-xs uppercase tracking-[0.28em] text-white/60">
                Score
              </div>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-5xl font-semibold">{topPick.score}</span>
                <span className="pb-1 text-white/60">/100</span>
              </div>
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
                      className="h-full rounded-full bg-gradient-to-r from-olive via-gold to-clay"
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
            </div>
          </div>
        </div>
      </article>

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
          {ranking.map((entry, index) => (
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
                </div>
              </div>

              <div className="flex items-center gap-5">
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
          ))}
        </div>
      </article>
    </section>
  );
}
