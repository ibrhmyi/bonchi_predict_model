import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { request as httpsRequest } from "node:https";

// Custom middleware that runs BEFORE vite's built-in file-serving so that
// requests to /api/* are proxied to the live Vercel deployment instead of
// being resolved against the local api/*.ts source files.
function liveApiProxy(): Plugin {
  const target = "bonchimf.vercel.app";
  return {
    name: "live-api-proxy",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith("/api/")) return next();

        const chunks: Buffer[] = [];
        req.on("data", (chunk: Buffer) => chunks.push(chunk));
        req.on("end", () => {
          const body = Buffer.concat(chunks as unknown as Uint8Array[]);
          // Strip hop-by-hop + host headers
          const headers: Record<string, string> = {};
          for (const [k, v] of Object.entries(req.headers)) {
            if (!v) continue;
            if (["host", "connection", "content-length"].includes(k.toLowerCase())) continue;
            headers[k] = Array.isArray(v) ? v.join(",") : v;
          }
          if (body.length > 0) headers["content-length"] = String(body.length);

          const upstream = httpsRequest(
            {
              host: target,
              port: 443,
              method: req.method,
              path: req.url,
              headers,
            },
            (upstreamRes) => {
              res.statusCode = upstreamRes.statusCode ?? 502;
              for (const [k, v] of Object.entries(upstreamRes.headers)) {
                if (v !== undefined) res.setHeader(k, v as string | string[]);
              }
              upstreamRes.pipe(res);
            },
          );
          upstream.on("error", (err) => {
            console.error("[live-api-proxy] error:", err.message);
            if (!res.headersSent) res.statusCode = 502;
            res.end(JSON.stringify({ error: err.message }));
          });
          if (body.length > 0) upstream.write(body);
          upstream.end();
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), liveApiProxy()],
});
