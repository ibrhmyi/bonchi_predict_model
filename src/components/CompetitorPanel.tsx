import { bonchiPositioning, competitorsByCountry } from "../data/competitors";

type CompetitorPanelProps = {
  countryId: string;
  countryLabel: string;
};

const typeColors: Record<string, { bg: string; text: string }> = {
  "Premium Chain": { bg: "bg-amber-100", text: "text-amber-800" },
  "Local Artisan": { bg: "bg-emerald-100", text: "text-emerald-800" },
  "Mass Market": { bg: "bg-blue-100", text: "text-blue-800" },
};

export function CompetitorPanel({ countryId, countryLabel }: CompetitorPanelProps) {
  const competitors = competitorsByCountry[countryId];
  if (!competitors) return null;

  return (
    <article className="rounded-3xl border border-[#e8decd] bg-[#fffdf9] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone">
        Competitor landscape
      </p>
      <h3 className="mt-1 text-lg font-medium text-ink">{countryLabel}</h3>

      <div className="mt-4 space-y-3">
        {competitors.map((comp) => {
          const colors = typeColors[comp.type] ?? { bg: "bg-gray-100", text: "text-gray-800" };
          return (
            <div
              key={comp.name}
              className="rounded-2xl border border-sand bg-white/80 px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-ink">{comp.name}</div>
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${colors.bg} ${colors.text}`}
                  >
                    {comp.type}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-ink">{comp.priceRange}</div>
                  <div className="text-[10px] uppercase tracking-wider text-stone">
                    ~{comp.marketShare} share
                  </div>
                </div>
              </div>
              <p className="mt-2 text-xs leading-5 text-stone">{comp.strengths}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl border border-[#2D6A4F]/20 bg-[#2D6A4F]/5 px-4 py-3">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2D6A4F]">
          Bonchi positioning
        </div>
        <p className="mt-1.5 text-sm leading-6 text-ink">{bonchiPositioning}</p>
      </div>
    </article>
  );
}
