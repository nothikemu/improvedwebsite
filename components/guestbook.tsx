"use client";

import { useCallback, useEffect, useId, useState } from "react";
import {
  MESSAGE_MAX,
  NAME_MAX,
  isEntry,
  validateEntry,
  type FieldErrors,
  type GuestbookEntry,
} from "@/lib/guestbook";

type Mode = "loading" | "shared" | "local";
const LOCAL_KEY = "guestbook:entries";
const LOCAL_LIMIT = 50;

function readLocal(): GuestbookEntry[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(isEntry) : [];
  } catch {
    return [];
  }
}

function writeLocal(entries: GuestbookEntry[]): boolean {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(entries.slice(0, LOCAL_LIMIT)));
    return true;
  } catch {
    return false;
  }
}

export function Guestbook() {
  const id = useId();
  const [mode, setMode] = useState<Mode>("loading");
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [touched, setTouched] = useState({ name: false, message: false });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const res = await fetch("/api/guestbook", { cache: "no-store" });
      const body = (await res.json()) as { mode?: string; entries?: unknown[]; error?: string };
      if (body.mode === "shared") {
        setMode("shared");
        if (!res.ok) setLoadError(body.error ?? "The guestbook couldn't be loaded.");
        else setEntries((body.entries ?? []).filter(isEntry));
        return;
      }
    } catch {
      // No API reachable (for example a static export): fall through to local mode.
    }
    setMode("local");
    setEntries(readLocal());
  }, []);

  useEffect(() => {
    // Loading is a one-off sync with an external source on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  function check(next: { name: string; message: string }, which = touched) {
    const { errors: found } = validateEntry(next);
    setErrors({
      name: which.name ? found.name : undefined,
      message: which.message ? found.message : undefined,
    });
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    const all = { name: true, message: true };
    setTouched(all);
    const { value, errors: found } = validateEntry({ name, message });
    setErrors(found);
    if (found.name || found.message) {
      const field = event.currentTarget.elements.namedItem(found.name ? "name" : "message");
      (field as HTMLElement | null)?.focus();
      return;
    }

    if (mode === "local") {
      const entry: GuestbookEntry = {
        id: crypto.randomUUID(),
        ...value,
        createdAt: new Date().toISOString(),
      };
      const next = [entry, ...entries];
      if (!writeLocal(next)) {
        setStatus({ kind: "error", text: "This browser blocked local storage, so the entry can't be kept." });
        return;
      }
      setEntries(next);
      setMessage("");
      setTouched({ name: false, message: false });
      setStatus({ kind: "ok", text: "Signed. It's saved in this browser." });
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...value, website: honeypot }),
      });
      const body = (await res.json()) as { entry?: unknown; errors?: FieldErrors; error?: string };
      if (res.ok) {
        if (isEntry(body.entry)) setEntries((prev) => [body.entry as GuestbookEntry, ...prev]);
        setMessage("");
        setTouched({ name: false, message: false });
        setStatus({ kind: "ok", text: "Signed. Thanks for leaving a note." });
      } else if (body.errors) {
        setErrors(body.errors);
      } else {
        setStatus({ kind: "error", text: body.error ?? "That didn't go through. Try again in a minute." });
      }
    } catch {
      setStatus({ kind: "error", text: "Couldn't reach the guestbook. Check your connection and try again." });
    } finally {
      setSending(false);
    }
  }

  const nameLength = [...name].length;
  const messageLength = [...message].length;

  return (
    <section aria-labelledby={`${id}-title`} className="panel flex flex-col">
      <header className="border-b border-line px-5 py-4">
        <h3 id={`${id}-title`} className="stretch-wide text-lg font-semibold">
          guestbook
        </h3>
        <p className="meta mt-1 min-h-[1.5em] text-muted">
          {mode === "loading" && "loading entries"}
          {mode === "shared" && "Entries are public and visible to everyone."}
          {mode === "local" &&
            "Local mode: entries stay in this browser only. Nobody else can see them."}
        </p>
      </header>

      <form onSubmit={submit} noValidate className="grid gap-4 px-5 py-5">
        <div className="grid gap-1.5">
          <div className="flex items-baseline justify-between">
            <label htmlFor={`${id}-name`} className="text-sm font-medium">
              name
            </label>
            <span className={`meta ${nameLength > NAME_MAX ? "text-(--status-dnd)" : "text-muted"}`} aria-hidden="true">
              {nameLength}/{NAME_MAX}
            </span>
          </div>
          <input
            id={`${id}-name`}
            name="name"
            autoComplete="nickname"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) check({ name: e.target.value, message });
            }}
            onBlur={() => {
              const t = { ...touched, name: true };
              setTouched(t);
              check({ name, message }, t);
            }}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${id}-name-error` : undefined}
            className="h-11 rounded-sm border border-line-strong bg-bg px-3 text-[16px] outline-none transition-colors placeholder:text-faint focus-visible:border-accent focus-visible:outline-none aria-invalid:border-(--status-dnd)"
          />
          {errors.name && (
            <p id={`${id}-name-error`} className="text-sm text-(--status-dnd)">
              {errors.name}
            </p>
          )}
        </div>

        <div className="grid gap-1.5">
          <div className="flex items-baseline justify-between">
            <label htmlFor={`${id}-message`} className="text-sm font-medium">
              message
            </label>
            <span
              className={`meta ${messageLength > MESSAGE_MAX ? "text-(--status-dnd)" : "text-muted"}`}
              aria-hidden="true"
            >
              {messageLength}/{MESSAGE_MAX}
            </span>
          </div>
          <textarea
            id={`${id}-message`}
            name="message"
            rows={3}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (errors.message) check({ name, message: e.target.value });
            }}
            onBlur={() => {
              const t = { ...touched, message: true };
              setTouched(t);
              check({ name, message }, t);
            }}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={`${id}-message-hint${errors.message ? ` ${id}-message-error` : ""}`}
            className="resize-y rounded-sm border border-line-strong bg-bg px-3 py-2.5 text-[16px] leading-normal outline-none transition-colors focus-visible:border-accent focus-visible:outline-none aria-invalid:border-(--status-dnd)"
          />
          <p id={`${id}-message-hint`} className="sr-only">
            Up to {MESSAGE_MAX} characters, plain text.
          </p>
          {errors.message && (
            <p id={`${id}-message-error`} className="text-sm text-(--status-dnd)">
              {errors.message}
            </p>
          )}
        </div>

        {/* Honeypot for bots. Hidden from people and assistive technology. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor={`${id}-website`}>Leave this empty</label>
          <input
            id={`${id}-website`}
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <button
            type="submit"
            disabled={sending || mode === "loading"}
            className="group inline-flex h-11 items-center rounded-full bg-fg px-5 text-sm font-semibold text-bg transition-colors hover:bg-accent hover:text-accent-ink disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="stretch-on-hover">{sending ? "signing" : "sign the guestbook"}</span>
          </button>
          <p
            role="status"
            className={`text-sm ${status?.kind === "error" ? "text-(--status-dnd)" : "text-muted"}`}
          >
            {status?.text}
          </p>
        </div>
      </form>

      <div className="border-t border-line px-5 py-4">
        {loadError ? (
          <div className="text-sm">
            <p className="text-muted">{loadError}</p>
            <button type="button" onClick={() => void load()} className="text-link mt-2">
              Try loading again
            </button>
          </div>
        ) : mode === "loading" ? (
          <div className="grid gap-3" aria-hidden="true">
            <div className="skeleton h-3 w-1/3" />
            <div className="skeleton h-3 w-3/4" />
          </div>
        ) : entries.length === 0 ? (
          <p className="text-sm text-muted">No entries yet. Yours can be the first.</p>
        ) : (
          <ol aria-label="Guestbook entries" tabIndex={0} className="grid max-h-80 gap-4 overflow-y-auto pr-1">
            {entries.map((entry) => (
              <li key={entry.id} className="grid gap-0.5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-sm font-semibold">{entry.name}</span>
                  <time dateTime={entry.createdAt} className="meta shrink-0 text-muted">
                    {entry.createdAt.slice(0, 10)}
                  </time>
                </div>
                <p className="text-sm whitespace-pre-line text-muted [overflow-wrap:anywhere]">{entry.message}</p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
