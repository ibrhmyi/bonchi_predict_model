export interface Competitor {
  name: string;
  type: "Premium Chain" | "Local Artisan" | "Mass Market";
  priceRange: string;
  strengths: string;
  marketShare: string;
}

export const competitorsByCountry: Record<string, Competitor[]> = {
  uae: [
    {
      name: "Haagen-Dazs",
      type: "Premium Chain",
      priceRange: "$5–8",
      strengths: "Strong brand recognition, mall presence, premium positioning",
      marketShare: "~18%",
    },
    {
      name: "Baskin-Robbins",
      type: "Mass Market",
      priceRange: "$3–6",
      strengths: "Wide flavor range, family-friendly, extensive franchise network",
      marketShare: "~22%",
    },
    {
      name: "Local artisan brands",
      type: "Local Artisan",
      priceRange: "$4–7",
      strengths: "Unique Middle Eastern flavors, Instagram-driven, pop-up presence",
      marketShare: "~8%",
    },
  ],
  germany: [
    {
      name: "Movenpick / Langnese",
      type: "Premium Chain",
      priceRange: "€3–6",
      strengths: "Deep brand trust, supermarket and cafe distribution, Swiss quality image",
      marketShare: "~20%",
    },
    {
      name: "Local Eisdiele culture",
      type: "Local Artisan",
      priceRange: "€1.50–4",
      strengths: "Neighborhood loyalty, seasonal tradition, handmade appeal",
      marketShare: "~30%",
    },
    {
      name: "Aldi/Lidl private label",
      type: "Mass Market",
      priceRange: "€1–3",
      strengths: "Aggressive pricing, wide retail footprint, value perception",
      marketShare: "~15%",
    },
  ],
  singapore: [
    {
      name: "Haagen-Dazs",
      type: "Premium Chain",
      priceRange: "S$5–9",
      strengths: "Premium positioning, cafe format, gifting culture alignment",
      marketShare: "~15%",
    },
    {
      name: "Udders",
      type: "Local Artisan",
      priceRange: "S$4–7",
      strengths: "Local favorite, unique Asian-inspired flavors, strong social presence",
      marketShare: "~10%",
    },
    {
      name: "Cold Storage / FairPrice brands",
      type: "Mass Market",
      priceRange: "S$3–5",
      strengths: "Supermarket convenience, price accessibility, familiar flavors",
      marketShare: "~20%",
    },
  ],
  poland: [
    {
      name: "Grycan",
      type: "Local Artisan",
      priceRange: "PLN 8–15",
      strengths: "Premium Polish brand, family heritage story, cafe chain network",
      marketShare: "~12%",
    },
    {
      name: "Algida / Magnum",
      type: "Mass Market",
      priceRange: "PLN 4–10",
      strengths: "Massive distribution, impulse-buy positioning, TV advertising",
      marketShare: "~25%",
    },
    {
      name: "Artisan gelaterias",
      type: "Local Artisan",
      priceRange: "PLN 6–12",
      strengths: "Italian-style authenticity, urban trendsetting, seasonal events",
      marketShare: "~6%",
    },
  ],
};

export const bonchiPositioning =
  "Bonchi enters as a premium Japanese-fruit artisan brand, positioned between mass-market chains and luxury imports. The combination of high-quality Japanese agriculture and unique fruit varieties creates a differentiated space no current competitor occupies.";
