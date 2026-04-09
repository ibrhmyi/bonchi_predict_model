import { google } from "@ai-sdk/google";
import { convertToModelMessages, streamText, tool, stepCountIs, type ToolSet, type UIMessage } from "ai";
import { toolSchemas } from "../src/llm/tools";

export const config = { runtime: "edge" };

const SYSTEM_PROMPT = `You are the Bonchi Market Fit assistant — an embedded agent inside a market intelligence tool used by Bonchi, a Japanese fruit agriculture company evaluating fruit-based gelato concepts for international markets.

## What the tool does
The tool ranks fruit + base + market combinations using a 7-factor weighted scoring model: cream, fruit, refreshing, health, premium, culturalFit, exoticAppetite. It blends a chosen base (sorbet, premium fruit gelato, etc.) with a fruit and scores it against a country's profile, with bonuses for regional flavor familiarity, fruit sourcing cost, and price fit.

## Your job
Help the user explore data, add new markets/fruits, fill in plausible defaults, run analyses, and explain results. You have tools to read and modify the workspace.

## Rate limit budget
You are on a tight rate limit. MINIMIZE tool calls. Prefer ONE big call over many small ones. Never follow mutations with getSnapshot — trust the tool result.

## Rules
1. **Always call getSnapshot FIRST** before adding/modifying anything — you need the real fruit IDs.
2. **addCountry must be complete in ONE call.** You MUST include:
   - realistic 1-5 factor scores in 'profile' (climate, income, food culture)
   - realistic 'avgMarketPrice' in USD and 'priceSensitivity' (1-5)
   - 'flavorBonuses': one entry per EXISTING fruit with familiarity + bonus (0 for unknown, 0.04 medium, 0.08 high)
   - 'fruitCosts': one entry per EXISTING fruit with costIndex (1=cheap local, 5=expensive import) and supplyReliability
   NEVER skip flavorBonuses or fruitCosts — blank data produces garbage rankings.
3. **Use real knowledge**: e.g. Hong Kong → high premium (5), high exoticAppetite (4), mango/lychee = high familiarity, year-round tropical imports cheap.
4. **After addCountry: call setSelection → countryId then runAnalysis.** That's 3 calls total for "add X". No more.
5. **Never call getSnapshot after a mutation.** The mutation result already tells you what changed.
6. **Cite real numbers** from tool results (score, rank, price). Be concise — bullets, no preamble.
7. **Never invent IDs.** Use only IDs returned from getSnapshot.

## Style
Direct, knowledgeable, no fluff. You're talking to a small product team, not writing marketing copy.`;

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    // Build tools object — types are intentionally loose because schemas
    // come from a runtime-iterated map; the runtime contract is enforced
    // by the shared toolSchemas + client-side handlers.
    const tools: ToolSet = {};
    for (const [name, def] of Object.entries(toolSchemas)) {
      tools[name] = tool<unknown>({
        description: def.description,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        inputSchema: def.inputSchema as any,
      }) as ToolSet[string];
    }

    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: google("gemini-2.0-flash"),
      system: SYSTEM_PROMPT,
      messages: modelMessages,
      tools,
      stopWhen: stepCountIs(8),
      temperature: 0.4,
    });

    return result.toUIMessageStreamResponse();
  } catch (err) {
    console.error("[api/chat] error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
