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
      "Add a new country/market AND populate its flavor familiarity in ONE call. Always include a full profile, realistic pricing, AND flavorFamiliarity for EVERY existing fruit (get fruit IDs from getSnapshot first). Do NOT leave flavor data blank — that produces meaningless rankings.",
    inputSchema: z.object({
      label: z.string().describe("Country name, e.g. 'Vietnam'"),
      profile: factorSchema.describe(
        "Realistic 1-5 factor scores based on climate, income, food culture. REQUIRED — do not leave blank.",
      ),
      avgMarketPrice: z
        .number()
        .describe("Average premium gelato cup price in USD for this market. REQUIRED."),
      currency: z.string().optional().describe("3-letter code, e.g. 'VND'. Default USD."),
      flavorFamiliarity: z
        .array(
          z.object({
            fruitId: z.string().describe("Existing fruit ID from getSnapshot"),
            familiarity: z.enum(["high", "medium", "low", "novel"]).describe("How familiar/popular this fruit is locally"),
          }),
        )
        .describe(
          "REQUIRED. One entry per existing fruit reflecting how familiar/popular that fruit is in this market.",
        ),
    }),
  },

  addFruit: {
    description:
      "Add a new fruit option. Flavor familiarity rows for all existing countries will be auto-created.",
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
      currency: z.string().optional(),
    }),
  },

  updateFlavorFamiliarity: {
    description:
      "Update a fruit's regional flavor familiarity for a specific country. Used when the user says e.g. 'mango is very popular in Vietnam'.",
    inputSchema: z.object({
      countryId: z.string(),
      fruitId: z.string(),
      familiarity: z.enum(["high", "medium", "low", "novel"]),
    }),
  },

  setSelection: {
    description:
      "Change what's currently selected on the Analyze tab: country, base, strategy preset, or price point for a specific base. Call this to drive the user's view.",
    inputSchema: z.object({
      countryId: z.string().optional(),
      baseId: z.string().optional(),
      presetId: z.string().optional(),
      pricePoint: z.number().optional().describe("Sets price for the currently selected base"),
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
