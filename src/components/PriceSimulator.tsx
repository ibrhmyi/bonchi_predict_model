import { getPriceImpact, pricingByCountry } from "../data/pricing";

type PriceSimulatorProps = {
  countryId: string;
  pricePoint: number;
  onPriceChange: (price: number) => void;
};

export function PriceSimulator({ countryId, pricePoint, onPriceChange }: PriceSimulatorProps) {
  const pricing = pricingByCountry[countryId];
  if (!pricing) return null;

  const impact = getPriceImpact(
    pricePoint > 0
      ? Math.max(
          1,
          pricePoint / pricing.avgMarketPrice >= 0.8 && pricePoint / pricing.avgMarketPrice <= 1.2
            ? 5
            : 5 - pricing.priceSensitivity * (pricePoint / pricing.avgMarketPrice - 1),
        )
      : 3,
  );

  const impactColors = {
    boost: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", label: "Price Boost" },
    neutral: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", label: "Neutral" },
    penalty: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", label: "Price Penalty" },
  };

  const style = impactColors[impact];

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-ink">Price point (USD)</span>
          <span className="text-lg font-semibold text-ink">${pricePoint.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min="1"
          max="20"
          step="0.25"
          value={pricePoint}
          onChange={(e) => onPriceChange(Number(e.target.value))}
          className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-sand accent-ink"
        />
        <div className="mt-1 flex justify-between text-xs text-stone">
          <span>$1.00</span>
          <span>Avg: ${pricing.avgMarketPrice.toFixed(2)}</span>
          <span>$20.00</span>
        </div>
      </div>

      <div className={`flex items-center gap-3 rounded-2xl border ${style.border} ${style.bg} px-4 py-3`}>
        <div className={`h-3 w-3 rounded-full ${impact === "boost" ? "bg-emerald-500" : impact === "neutral" ? "bg-amber-500" : "bg-red-500"}`} />
        <div>
          <div className={`text-sm font-medium ${style.text}`}>{style.label}</div>
          <div className="text-xs text-stone">
            {pricePoint > 0
              ? `${((pricePoint / pricing.avgMarketPrice) * 100).toFixed(0)}% of market average (sensitivity: ${pricing.priceSensitivity}/5)`
              : "Set a price to see impact"}
          </div>
        </div>
      </div>
    </div>
  );
}
