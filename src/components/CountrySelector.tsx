import type { CountryOption } from "../data/marketFit";
import { pricingByCountry as defaultPricing, type PricingProfile } from "../data/pricing";
import { demographicsByCountry } from "../data/demographics";

type CountrySelectorProps = {
  countries: CountryOption[];
  selectedId: string;
  onChange: (id: string) => void;
  pricingByCountry?: Record<string, PricingProfile>;
};

const countryMeta: Record<string, { flag: string; climate: string }> = {
  uae: { flag: "\u{1F1E6}\u{1F1EA}", climate: "Hot climate, premium market" },
  germany: { flag: "\u{1F1E9}\u{1F1EA}", climate: "Europe's largest, value-oriented" },
  singapore: { flag: "\u{1F1F8}\u{1F1EC}", climate: "Tropical, affluent, dessert culture" },
  poland: { flag: "\u{1F1F5}\u{1F1F1}", climate: "Growing market, price-conscious" },
};

export function CountrySelector({ countries, selectedId, onChange, pricingByCountry = defaultPricing }: CountrySelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {countries.map((country) => {
        const active = country.id === selectedId;
        const meta = countryMeta[country.id];
        const demo = demographicsByCountry[country.id];
        const pricing = pricingByCountry[country.id];

        return (
          <button
            key={country.id}
            type="button"
            onClick={() => onChange(country.id)}
            className={`group relative rounded-3xl border-2 px-5 py-4 text-left transition-all duration-200 ${
              active
                ? "border-[#2D6A4F] bg-[#2D6A4F] text-white shadow-lg shadow-[#2D6A4F]/20"
                : "border-sand bg-white/80 text-ink hover:border-[#2D6A4F]/40 hover:shadow-md"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{meta?.flag ?? "\u{1F30D}"}</span>
              <span className="text-lg font-semibold">{country.label}</span>
            </div>
            <p className={`mt-2 text-xs leading-5 ${active ? "text-white/70" : "text-stone"}`}>
              {meta?.climate ?? "Market profile"}
            </p>
            <div className={`mt-2 flex items-center gap-3 text-[11px] font-medium ${active ? "text-white/60" : "text-stone/70"}`}>
              {demo && <span>{demo.population}M pop</span>}
              {pricing && <span>Avg ${pricing.avgMarketPrice}</span>}
            </div>
          </button>
        );
      })}
    </div>
  );
}
