import type { VercelRequest, VercelResponse } from "@vercel/node";
import Redis from "ioredis";

const STATE_KEY = "bonchi:workspace:v1";
const CHAT_KEY = "bonchi:chat:v1";

let cached: Redis | null = null;
function getRedis(): Redis | null {
  if (cached) return cached;
  const url = process.env.REDIS_URL;
  if (!url) return null;
  cached = new Redis(url, {
    maxRetriesPerRequest: 2,
    enableReadyCheck: false,
    lazyConnect: false,
  });
  return cached;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const redis = getRedis();
  if (!redis) {
    return res.status(503).json({ error: "REDIS_URL env var not configured" });
  }

  const kind = req.query.kind === "chat" ? CHAT_KEY : STATE_KEY;

  try {
    if (req.method === "GET") {
      const raw = await redis.get(kind);
      const data = raw ? JSON.parse(raw) : null;
      return res.status(200).json({ data });
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      await redis.set(kind, JSON.stringify(body));
      return res.status(200).json({ ok: true });
    }

    if (req.method === "DELETE") {
      await redis.del(kind);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).send("Method not allowed");
  } catch (err) {
    console.error("[api/state] error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}
