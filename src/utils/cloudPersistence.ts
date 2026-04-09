// Light wrapper around /api/state for syncing workspace + chat to Upstash.
// Falls back gracefully if the endpoint isn't configured.

const API_BASE = "/api/state";

export async function loadCloudState<T>(kind: "workspace" | "chat"): Promise<T | null> {
  try {
    const url = kind === "chat" ? `${API_BASE}?kind=chat` : API_BASE;
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) return null;
    const json = (await res.json()) as { data: T | null };
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function saveCloudState(kind: "workspace" | "chat", data: unknown): Promise<boolean> {
  try {
    const url = kind === "chat" ? `${API_BASE}?kind=chat` : API_BASE;
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Debounce helper
export function debounce<T extends (...args: never[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return ((...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}
