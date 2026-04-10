/**
 * Methodology, Sources & Confidence Tags
 *
 * Documents every assumption in the model and tags its reliability.
 */

export type Confidence = "verified" | "estimated" | "placeholder";

export const confidenceLabels: Record<Confidence, { label: string; color: string }> = {
  verified: { label: "Verified", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  estimated: { label: "Estimated", color: "bg-amber-100 text-amber-700 border-amber-200" },
  placeholder: { label: "Placeholder", color: "bg-red-100 text-red-700 border-red-200" },
};

/** Confidence ratings for each data category, per country where relevant */
export const dataConfidence: Record<string, { confidence: Confidence; source: string }> = {
  // Country factor profiles
  "country:uae": {
    confidence: "estimated",
    source: "Internal assessment based on Euromonitor frozen desserts report (2023) and Dubai retail observations.",
  },
  "country:germany": {
    confidence: "estimated",
    source: "Internal assessment based on Eisdiele culture research and German ice cream market reports (Statista 2023).",
  },
  "country:singapore": {
    confidence: "estimated",
    source: "Internal assessment based on Singapore Food Agency data and premium dessert market observations.",
  },
  "country:poland": {
    confidence: "estimated",
    source: "Internal assessment based on Polish frozen dessert consumption data (GUS 2023) and market visits.",
  },

  // Demographics
  "demographics:uae": {
    confidence: "verified",
    source: "UAE Federal Competitiveness and Statistics Centre (2023). Demand indices are estimated.",
  },
  "demographics:germany": {
    confidence: "verified",
    source: "Statistisches Bundesamt (Destatis) 2023. Demand indices are estimated.",
  },
  "demographics:singapore": {
    confidence: "verified",
    source: "Singapore Department of Statistics (2023). Demand indices are estimated.",
  },
  "demographics:poland": {
    confidence: "verified",
    source: "Central Statistical Office of Poland (GUS) 2023. Demand indices are estimated.",
  },

  // Pricing
  "pricing:uae": {
    confidence: "estimated",
    source: "Based on premium gelato prices observed in Dubai Mall, City Walk, and Abu Dhabi retail (2023–2024).",
  },
  "pricing:germany": {
    confidence: "estimated",
    source: "Based on Eisdiele pricing surveys in Munich, Berlin, Hamburg (2023).",
  },
  "pricing:singapore": {
    confidence: "estimated",
    source: "Based on premium gelato pricing at Orchard Road and Marina Bay outlets (2023–2024).",
  },
  "pricing:poland": {
    confidence: "estimated",
    source: "Based on Warsaw and Krakow artisan gelato pricing (2023).",
  },

  // Regional flavor bonuses
  "flavor:general": {
    confidence: "estimated",
    source: "Familiarity ratings based on import data trends, Google Trends analysis, and local retail surveys.",
  },

  // Competitors
  "competitors:general": {
    confidence: "estimated",
    source: "Competitor names are real businesses. Market share percentages and positioning are rough estimates, not verified.",
  },

  // Production costs
  "production:general": {
    confidence: "placeholder",
    source: "Base production costs ($2–$4) are industry-average estimates. Replace with Bonchi's actual COGS.",
  },
};

/** Model methodology — explains the scoring formula */
export const methodologySections = [
  {
    title: "7-Factor Scoring Model",
    body: "Each fruit×base concept is scored against a country's market profile across 7 factors: Cream, Fruit, Refreshing, Health, Premium, Cultural Fit, and Exotic Appetite. Each factor is rated on a verbal scale (Very Low to Very High, mapped to 1–5 internally). Match score = 5 − |demand − supply|, then weighted by the active strategy.",
  },
  {
    title: "Profile Blending",
    body: "A concept profile blends the base and fruit profiles. Standard factors use 70% base / 30% fruit. Cultural factors (Cultural Fit, Exotic Appetite) use 60% base / 40% fruit, since fruit origin matters more for cultural positioning.",
  },
  {
    title: "Score Composition",
    body: "Final score = Base Score (0–100 from weighted factor matching) + Regional Flavor Bonus (0–8 pts based on local familiarity) + Price Fit Bonus (approx −5 to +5 pts based on how well the selling price matches the local market average). Clamped to 0–100.",
  },
  {
    title: "Regional Flavor Bonus",
    body: "Each fruit has a familiarity rating per country: High, Medium, Low, or Novel. The bonus is derived automatically — High familiarity (well-known local flavor) gives the strongest boost, Novel (Japanese exotic appeal) gives a moderate boost, Medium gives a small boost, and Low gives minimal bonus. Maximum contribution is 8 points.",
  },
  {
    title: "Price Fit",
    body: "Compares the selling price (set per product base) against the country's average market price. Prices within 80–120% of market average score highest (5/5). Prices above 150% or below 50% of market average are penalized most. The bonus/penalty scales linearly between these thresholds.",
  },
  {
    title: "Margin Estimate",
    body: "Estimated margin = Selling Price − Base Production Cost. This is a simple unit-level estimate. Production costs are set per product format (e.g. Sorbet $2, Premium Gelato $4). All fruit is produced in Japan — there is no per-country sourcing cost adjustment.",
  },
];
