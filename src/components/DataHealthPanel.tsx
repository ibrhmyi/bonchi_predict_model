import { useState } from "react";
import type { CountryOption, FruitOption, GelatoBase } from "../data/marketFit";
import { runDataHealthCheck, type HealthIssue } from "../utils/dataHealthCheck";

type DataHealthPanelProps = {
  countries: CountryOption[];
  fruits: FruitOption[];
  bases: GelatoBase[];
};

export function DataHealthPanel({ countries, fruits, bases }: DataHealthPanelProps) {
  const [issues, setIssues] = useState<HealthIssue[] | null>(null);

  const handleRun = () => {
    setIssues(runDataHealthCheck(countries, fruits, bases));
  };

  const errors = issues?.filter((i) => i.severity === "error") ?? [];
  const warnings = issues?.filter((i) => i.severity === "warning") ?? [];

  return (
    <section className="rounded-4xl border border-white/70 bg-white/80 p-6 shadow-panel backdrop-blur xl:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-serif text-2xl text-ink">Data Health Check</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-stone">
            Validates all cross-referenced data entries. Catches missing regional,
            cost, pricing, and demographics data.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRun}
          className="inline-flex items-center rounded-full bg-[#1B4332] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
        >
          {issues !== null ? "Re-check" : "Run Health Check"}
        </button>
      </div>

      {issues !== null && (
        <div className="mt-5 space-y-4">
          {/* Summary */}
          <div className="flex items-center gap-4">
            {errors.length === 0 && warnings.length === 0 ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                All {countries.length * fruits.length + countries.length + bases.length} data points valid
              </span>
            ) : (
              <>
                {errors.length > 0 && (
                  <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700">
                    {errors.length} error{errors.length !== 1 ? "s" : ""}
                  </span>
                )}
                {warnings.length > 0 && (
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-700">
                    {warnings.length} warning{warnings.length !== 1 ? "s" : ""}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Issue list */}
          {issues.length > 0 && (
            <div className="space-y-1.5">
              {issues.map((issue, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
                    issue.severity === "error"
                      ? "border-red-200 bg-red-50 text-red-800"
                      : "border-amber-200 bg-amber-50 text-amber-800"
                  }`}
                >
                  <span className="mt-0.5 shrink-0 text-xs font-semibold uppercase tracking-wider">
                    {issue.category}
                  </span>
                  <span>{issue.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
