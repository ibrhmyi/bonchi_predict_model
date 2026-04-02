import { useState } from "react";
import type { CountryOption, FruitOption, GelatoBase, FactorMap } from "../data/marketFit";
import { generateBenchmarkMatrix, type DataOverrides } from "../utils/scoring";

type BenchmarkMatrixProps = {
  countries: CountryOption[];
  bases: GelatoBase[];
  fruits: FruitOption[];
  weights: FactorMap;
  data?: DataOverrides;
};

function scoreColor(score: number): string {
  if (score >= 75) return "bg-emerald-100 text-emerald-800";
  if (score >= 50) return "bg-amber-100 text-amber-800";
  return "bg-red-100 text-red-800";
}

export function BenchmarkMatrix({ countries, bases, fruits, weights, data }: BenchmarkMatrixProps) {
  const [showMatrix, setShowMatrix] = useState(false);
  const [filterBase, setFilterBase] = useState<string>("all");

  const matrix = showMatrix
    ? generateBenchmarkMatrix({ countries, bases, fruits, weights, data })
    : [];

  const filtered =
    filterBase === "all" ? matrix : matrix.filter((e) => e.baseId === filterBase);

  return (
    <section className="rounded-4xl border border-[#2D6A4F]/15 bg-[#2D6A4F]/[0.02] p-6 shadow-panel xl:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-serif text-2xl text-ink">Score Benchmarks</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-stone">
            See how all {fruits.length * bases.length} fruit x base combinations score across {countries.length} markets.
            Includes regional flavor and cost efficiency adjustments.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowMatrix((v) => !v)}
          className="inline-flex items-center rounded-full bg-[#1B4332] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
        >
          {showMatrix ? "Hide Matrix" : "Generate All Benchmarks"}
        </button>
      </div>

      {showMatrix && (
        <>
          <div className="mt-5 flex items-center gap-3">
            <span className="text-sm text-stone">Filter by base:</span>
            <select
              value={filterBase}
              onChange={(e) => setFilterBase(e.target.value)}
              className="rounded-xl border border-sand bg-bone px-3 py-2 text-sm text-ink outline-none transition focus:border-[#2D6A4F]"
            >
              <option value="all">All bases</option>
              {bases.map((base) => (
                <option key={base.id} value={base.id}>
                  {base.label}
                </option>
              ))}
            </select>
            <div className="ml-auto flex items-center gap-2 text-xs text-stone">
              <span className="inline-block h-3 w-3 rounded bg-emerald-100" /> 75+
              <span className="inline-block h-3 w-3 rounded bg-amber-100" /> 50–75
              <span className="inline-block h-3 w-3 rounded bg-red-100" /> &lt;50
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-1">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.24em] text-stone">
                  <th className="px-3 py-2">Concept</th>
                  {countries.map((c) => (
                    <th key={c.id} className="px-3 py-2 text-center">
                      {c.label}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-center">Avg</th>
                  <th className="px-3 py-2 text-center">Range</th>
                  <th className="px-3 py-2">Best Market</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry) => (
                  <tr
                    key={`${entry.fruitId}-${entry.baseId}`}
                    className="bg-white/80 text-sm"
                  >
                    <td className="px-3 py-2.5">
                      <div className="font-medium text-ink">
                        {entry.fruitLabel} {entry.baseLabel}
                      </div>
                    </td>
                    {countries.map((c) => (
                      <td key={c.id} className="px-3 py-2.5 text-center">
                        <span
                          className={`inline-block min-w-[3rem] rounded-lg px-2 py-1 text-xs font-semibold ${scoreColor(entry.scores[c.id] ?? 0)}`}
                        >
                          {entry.scores[c.id]?.toFixed(1) ?? "\u2014"}
                        </span>
                      </td>
                    ))}
                    <td className="px-3 py-2.5 text-center">
                      <span className="font-semibold text-ink">{entry.avg}</span>
                    </td>
                    <td className="px-3 py-2.5 text-center text-xs text-stone">
                      {entry.min.toFixed(1)}\u2013{entry.max.toFixed(1)}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-ink">{entry.bestCountry}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
