"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { site } from "@/data/site";
import { presenceStore, type PresenceState } from "@/lib/lanyard";

export function usePresence(): PresenceState {
  const store = presenceStore(site.discordId);
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}

/**
 * Current time, refreshed every `intervalMs` while `active`.
 * Null until mounted, so server and first client render agree.
 */
export function useNow(intervalMs: number, active = true): number | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    if (!active) return;
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, active]);
  return now;
}
