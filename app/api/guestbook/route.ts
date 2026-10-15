import { connection } from "next/server";
import { validateEntry, type GuestbookEntry } from "@/lib/guestbook";
import { addEntry, claimRateLimit, isConfigured, listEntries } from "@/lib/guestbook-store";

// Responses: { mode: "local" } when no storage is configured, so the client
// falls back to browser-only entries; otherwise { mode: "shared", ... }.

export async function GET() {
  await connection();
  if (!isConfigured()) return Response.json({ mode: "local" });
  try {
    return Response.json(
      { mode: "shared", entries: await listEntries() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { mode: "shared", error: "The guestbook couldn't be loaded. Try again in a minute." },
      { status: 502 },
    );
  }
}

async function visitorKey(request: Request): Promise<string> {
  // Only a salted hash of the address is used, and only as a 60-second rate-limit key.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  const salt = process.env.GUESTBOOK_SALT ?? "guestbook";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${salt}:${ip}`));
  return Array.from(new Uint8Array(digest).slice(0, 12), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: Request) {
  if (!isConfigured()) {
    return Response.json({ error: "The shared guestbook isn't set up on this site." }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (typeof parsed !== "object" || parsed === null) throw new Error();
    body = parsed as Record<string, unknown>;
  } catch {
    return Response.json({ error: "The request wasn't valid JSON." }, { status: 400 });
  }

  // Honeypot: a field people never see. Pretend it worked so bots don't adapt.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return Response.json({ ok: true }, { status: 201 });
  }

  const { value, errors } = validateEntry({
    name: typeof body.name === "string" ? body.name : "",
    message: typeof body.message === "string" ? body.message : "",
  });
  if (errors.name || errors.message) {
    return Response.json({ errors }, { status: 422 });
  }

  try {
    if (!(await claimRateLimit(await visitorKey(request)))) {
      return Response.json(
        { error: "You just signed. Wait a minute before signing again." },
        { status: 429 },
      );
    }
    const entry: GuestbookEntry = {
      id: crypto.randomUUID(),
      ...value,
      createdAt: new Date().toISOString(),
    };
    await addEntry(entry);
    return Response.json({ entry }, { status: 201 });
  } catch {
    return Response.json(
      { error: "The guestbook couldn't save that. Try again in a minute." },
      { status: 502 },
    );
  }
}
