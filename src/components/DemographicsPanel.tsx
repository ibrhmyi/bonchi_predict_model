import { calculateAddressablePopulation, calculateAnnualServings, demographicsByCountry } from "../data/demographics";

type DemographicsPanelProps = {
  countryId: string;
  countryLabel: string;
};

const demandColors = [
  "bg-red-300",
  "bg-orange-300",
  "bg-amber-300",
  "bg-lime-300",
  "bg-emerald-400",
];

function getDemandColor(index: number): string {
  const clamped = Math.round(Math.min(5, Math.max(1, index))) - 1;
  return demandColors[clamped];
}

export function DemographicsPanel({ countryId, countryLabel }: DemographicsPanelProps) {
  const data = demographicsByCountry[countryId];
  if (!data) return null;

  const addressable = calculateAddressablePopulation(data);
  const annualServings = calculateAnnualServings(data);

  return (
    <article className="rounded-3xl border border-[#e8decd] bg-[#fffdf9] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone">
            Demographics
          </p>
          <h3 className="mt-1 text-lg font-medium text-ink">{countryLabel}</h3>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold text-ink">{data.population}M</div>
          <div className="text-xs text-stone">Population</div>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-stone">
          Age distribution & dessert demand
        </div>
        <div className="space-y-2">
          {data.ageDistribution.map((group) => (
            <div key={group.label} className="flex items-center gap-3">
              <span className="w-12 shrink-0 text-xs text-stone">{group.label}</span>
              <div className="relative h-5 flex-1 overflow-hidden rounded-full bg-sand/60">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getDemandColor(group.gelatoDemandIndex)}`}
                  style={{ width: `${group.percentage}%` }}
                />
              </div>
              <span className="w-10 shrink-0 text-right text-xs font-medium text-ink">
                {group.percentage}%
              </span>
              <div
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{
                  backgroundColor:
                    group.gelatoDemandIndex >= 4
                      ? "#2D6A4F"
                      : group.gelatoDemandIndex >= 3
                        ? "#B78543"
                        : "#7d7468",
                }}
                title={`Demand index: ${group.gelatoDemandIndex}`}
              >
                {group.gelatoDemandIndex.toFixed(1)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-sand bg-bone/60 px-3 py-2.5 text-center">
          <div className="text-[10px] uppercase tracking-wider text-stone">Male / Female</div>
          <div className="mt-1 text-sm font-medium text-ink">
            {data.genderSplit.male}% / {data.genderSplit.female}%
          </div>
        </div>
        <div className="rounded-2xl border border-sand bg-bone/60 px-3 py-2.5 text-center">
          <div className="text-[10px] uppercase tracking-wider text-stone">Urban rate</div>
          <div className="mt-1 text-sm font-medium text-ink">{data.urbanRate}%</div>
        </div>
        <div className="rounded-2xl border border-sand bg-bone/60 px-3 py-2.5 text-center">
          <div className="text-[10px] uppercase tracking-wider text-stone">Addressable pop.</div>
          <div className="mt-1 text-sm font-medium text-ink">{addressable}M</div>
        </div>
        <div className="rounded-2xl border border-sand bg-bone/60 px-3 py-2.5 text-center">
          <div className="text-[10px] uppercase tracking-wider text-stone">Est. annual servings</div>
          <div className="mt-1 text-sm font-medium text-ink">{annualServings}M</div>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-stone">{data.insight}</p>
    </article>
  );
}
