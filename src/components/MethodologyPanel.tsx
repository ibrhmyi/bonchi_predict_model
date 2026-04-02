import {
  confidenceLabels,
  dataConfidence,
  methodologySections,
  type Confidence,
} from "../data/methodology";

function ConfidenceBadge({ level }: { level: Confidence }) {
  const style = confidenceLabels[level];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${style.color}`}
    >
      {style.label}
    </span>
  );
}

export function MethodologyPanel() {
  // Group confidence entries by category
  const categories = [
    { label: "Country Market Profiles", keys: ["country:uae", "country:germany", "country:singapore", "country:poland"] },
    { label: "Demographics", keys: ["demographics:uae", "demographics:germany", "demographics:singapore", "demographics:poland"] },
    { label: "Pricing", keys: ["pricing:uae", "pricing:germany", "pricing:singapore", "pricing:poland"] },
    { label: "Regional Flavor Data", keys: ["flavor:general"] },
    { label: "Fruit Sourcing Costs", keys: ["cost:general"] },
    { label: "Competitor Intelligence", keys: ["competitors:general"] },
    { label: "Production Costs", keys: ["production:general"] },
  ];

  return (
    <div className="space-y-6">
      {/* How the model works */}
      <section className="rounded-4xl border border-white/70 bg-white/80 p-6 shadow-panel backdrop-blur xl:p-8">
        <h2 className="font-serif text-2xl text-ink">How the Model Works</h2>
        <p className="mt-1 text-sm text-stone">
          Scoring methodology and formula breakdown.
        </p>
        <div className="mt-5 space-y-4">
          {methodologySections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-ink">{section.title}</h3>
              <p className="mt-1 text-sm leading-6 text-stone">{section.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Data confidence */}
      <section className="rounded-4xl border border-white/70 bg-white/80 p-6 shadow-panel backdrop-blur xl:p-8">
        <h2 className="font-serif text-2xl text-ink">Data Sources & Confidence</h2>
        <p className="mt-1 text-sm text-stone">
          Every data point is tagged with a confidence level. Replace placeholders with real data before production use.
        </p>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {(Object.keys(confidenceLabels) as Confidence[]).map((level) => (
            <div key={level} className="flex items-center gap-1.5">
              <ConfidenceBadge level={level} />
              <span className="text-xs text-stone">
                {level === "verified"
                  ? "From official/published sources"
                  : level === "estimated"
                    ? "Informed estimate, needs validation"
                    : "Rough proxy, replace with real data"}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 space-y-4">
          {categories.map((cat) => (
            <div key={cat.label}>
              <h3 className="text-sm font-semibold text-ink">{cat.label}</h3>
              <div className="mt-2 space-y-1.5">
                {cat.keys.map((key) => {
                  const entry = dataConfidence[key];
                  if (!entry) return null;
                  const label = key.includes(":") ? key.split(":")[1] : key;
                  return (
                    <div
                      key={key}
                      className="flex items-start gap-3 rounded-xl border border-sand bg-bone/50 px-4 py-2.5 text-sm"
                    >
                      <ConfidenceBadge level={entry.confidence} />
                      <div className="flex-1">
                        {cat.keys.length > 1 && (
                          <span className="mr-2 font-medium capitalize text-ink">
                            {label === "general" ? "All entries" : label.toUpperCase()}:
                          </span>
                        )}
                        <span className="text-stone">{entry.source}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
