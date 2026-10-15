import "server-only";
import { isEntry, type GuestbookEntry } from "@/lib/guestbook";

/**
 * Shared guestbook storage on Upstash Redis, through its REST API so no SDK is
 * needed. Configured with UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
 * (or the KV_REST_API_URL / KV_REST_API_TOKEN names Vercel's integration uses).
 */

const LIST_KEY = "guestbook:entries";
const KEEP = 200;
export const PAGE_SIZE = 50;
const RATE_WINDOW_S = 60;

function config() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

export function isConfigured(): boolean {
  return config() !== null;
}

async function pipeline(commands: (string | number)[][]): Promise<unknown[]> {
  const cfg = config();
  if (!cfg) throw new Error("Guestbook storage is not configured");
  const res = await fetch(`${cfg.url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`Storage responded ${res.status}`);
  const results = (await res.json()) as { result?: unknown; error?: string }[];
  const failed = results.find((r) => r.error);
  if (failed) throw new Error(failed.error);
  return results.map((r) => r.result);
}

export async function listEntries(): Promise<GuestbookEntry[]> {
  const [raw] = await pipeline([["LRANGE", LIST_KEY, 0, PAGE_SIZE - 1]]);
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    try {
      const parsed: unknown = JSON.parse(String(item));
      return isEntry(parsed) ? [parsed] : [];
    } catch {
      return [];
    }
  });
}

/** Returns false when this visitor signed within the rate-limit window. */
export async function claimRateLimit(visitorKey: string): Promise<boolean> {
  const [result] = await pipeline([
    ["SET", `guestbook:rate:${visitorKey}`, 1, "EX", RATE_WINDOW_S, "NX"],
  ]);
  return result === "OK";
}

export async function addEntry(entry: GuestbookEntry): Promise<void> {
  await pipeline([
    ["LPUSH", LIST_KEY, JSON.stringify(entry)],
    ["LTRIM", LIST_KEY, 0, KEEP - 1],
  ]);
}
