import { z } from "zod";

// Shared tool schemas — used by both the server (api/chat.ts) to define
// tools for Gemini, and the client (ChatPanel.tsx) to execute them against
// React state.

export const factorSchema = z.object({
  cream: z.number().min(1).max(5).optional(),
  fruit: z.number().min(1).max(5).optional(),
  refreshing: z.number().min(1).max(5).optional(),
  health: z.number().min(1).max(5).optional(),
  premium: z.number().min(1).max(5).optional(),
  culturalFit: z.number().min(1).max(5).optional(),
  exoticAppetite: z.number().min(1).max(5).optional(),
});

export const fruitFactorSchema = z.object({
  fruit: z.number().min(1).max(5).optional(),
  refreshing: z.number().min(1).max(5).optional(),
  health: z.number().min(1).max(5).optional(),
  premium: z.number().min(1).max(5).optional(),
  culturalFit: z.number().min(1).max(5).optional(),
  exoticAppetite: z.number().min(1).max(5).optional(),
});

export const toolSchemas = {
  getSnapshot: {
    description:
      "Returns the current workspace data: countries, fruits, bases, strategies, pricing, and the current top-ranked concepts. Call this first when the user asks anything about the data or results.",
    inputSchema: z.object({}),
  },

  addCountry: {
    description:
      "Add a new country/market AND populate its flavor familiarity + sourcing cost rows in ONE call. Always include a full profile, realistic pricing, AND flavorBonuses + fruitCosts arrays for EVERY existing fruit (get fruit IDs from getSnapshot first). Do NOT leave flavor/cost data blank — that produces meaningless rankings.",
    inputSchema: z.object({
      label: z.string().describe("Country name, e.g. 'Vietnam'"),
      profile: factorSchema.describe(
        "Realistic 1-5 factor scores based on climate, income, food culture. REQUIRED — do not leave blank.",
      ),
      avgMarketPrice: z
        .number()
        .describe("Average premium gelato cup price in USD for this market. REQUIRED."),
      priceSensitivity: z
        .number()
        .min(1)
        .max(5)
        .describe("1=insensitive (luxury market), 5=very sensitive. REQUIRED."),
      currency: z.string().optional().describe("3-letter code, e.g. 'VND'. Default USD."),
      costMultiplier: z
        .number()
        .optional()
        .describe("Local cost multiplier vs base. Default 1."),
      flavorBonuses: z
        .array(
          z.object({
            fruitId: z.string().describe("Existing fruit ID from getSnapshot"),
            familiarity: z.enum(["high", "medium", "low", "novel"]),
            bonus: z.number().min(0).max(1).describe("0 = unknown, 0.04 = medium, 0.08 = high"),
            reason: z.string().optional(),
          }),
        )
        .describe(
          "REQUIRED. One entry per existing fruit reflecting how familiar/popular that fruit is in this market.",
        ),
      fruitCosts: z
        .array(
          z.object({
            fruitId: z.string().describe("Existing fruit ID from getSnapshot"),
            costIndex: z.number().min(1).max(5).describe("1=cheap local supply, 5=expensive import"),
            supplyReliability: z.number().min(1).max(5).describe("1=unreliable, 5=year-round"),
            sourceNote: z.string().optional(),
          }),
        )
        .describe("REQUIRED. One entry per existing fruit reflecting local sourcing reality."),
    }),
  },

  addFruit: {
    description:
      "Add a new fruit option. Flavor familiarity and sourcing cost rows for all existing countries will be auto-created.",
    inputSchema: z.object({
      label: z.string().describe("Fruit name, e.g. 'Yuzu'"),
      profile: fruitFactorSchema.optional(),
    }),
  },

  updateMarketPricing: {
    description: "Update pricing fields for an existing country.",
    inputSchema: z.object({
      countryId: z.string(),
      avgMarketPrice: z.number().optional(),
      priceSensitivity: z.number().min(1).max(5).optional(),
      costMultiplier: z.number().optional(),
      currency: z.string().optional(),
    }),
  },

  updateFlavorBonus: {
    description:
      "Update a fruit's regional flavor familiarity for a specific country. Used when the user says e.g. 'mango is very popular in Vietnam'.",
    inputSchema: z.object({
      countryId: z.string(),
      fruitId: z.string(),
      bonus: z.number().min(0).max(1).optional().describe("0-1 score bonus"),
      familiarity: z.enum(["high", "medium", "low", "novel"]).optional(),
      reason: z.string().optional().describe("Short justification"),
    }),
  },

  updateFruitCost: {
    description: "Update sourcing cost and supply reliability for a fruit in a country.",
    inputSchema: z.object({
      fruitId: z.string(),
      countryId: z.string(),
      costIndex: z.number().min(1).max(5).optional(),
      supplyReliability: z.number().min(1).max(5).optional(),
      sourceNote: z.string().optional(),
    }),
  },

  setSelection: {
    description:
      "Change what's currently selected on the Analyze tab: country, base, strategy preset, or price point. Call this to drive the user's view.",
    inputSchema: z.object({
      countryId: z.string().optional(),
      baseId: z.string().optional(),
      presetId: z.string().optional(),
      pricePoint: z.number().optional(),
    }),
  },

  runAnalysis: {
    description:
      "Re-run the scoring engine and return the top-ranked fruit concepts for the currently selected country/base/strategy. Use after making changes to show the user the impact.",
    inputSchema: z.object({
      limit: z.number().min(1).max(10).optional().describe("How many top concepts to return. Default 5."),
    }),
  },
} as const;

export type ToolName = keyof typeof toolSchemas;
