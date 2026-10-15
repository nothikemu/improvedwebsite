/**
 * Discord presence through Lanyard (https://github.com/Phineas/lanyard).
 *
 * One shared connection per page: a REST request for the first snapshot, then
 * a WebSocket for live updates, with reconnects and a polling fallback.
 * Components read it through `useSyncExternalStore`.
 */

export type DiscordStatus = "online" | "idle" | "dnd" | "offline";

export type LanyardActivity = {
  id: string;
  name: string;
  type: 0 | 1 | 2 | 3 | 4 | 5;
  state?: string;
  details?: string;
  emoji?: { name: string; id?: string; animated?: boolean };
  timestamps?: { start?: number; end?: number };
  application_id?: string;
  assets?: {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
  };
};

export type LanyardSpotify = {
  track_id: string | null;
  song: string;
  artist: string;
  album: string;
  album_art_url: string | null;
  timestamps: { start: number; end: number };
};

export type LanyardPresence = {
  discord_status: DiscordStatus;
  discord_user: {
    id: string;
    username: string;
    global_name?: string | null;
    avatar: string | null;
  };
  activities: LanyardActivity[];
  listening_to_spotify: boolean;
  spotify: LanyardSpotify | null;
  active_on_discord_desktop: boolean;
  active_on_discord_mobile: boolean;
  active_on_discord_web: boolean;
};

export type PresenceState = {
  /** connecting: no answer yet. ready: presence data available. unavailable: no usable data. */
  phase: "connecting" | "ready" | "unavailable";
  /** Why presence is unavailable. Never means the user is offline. */
  reason: "not_monitored" | "network" | null;
  presence: LanyardPresence | null;
  /** True while the live socket is open. Lanyard only pushes changes, so data stays current while connected. */
  connected: boolean;
  /** Epoch ms of the last update received. */
  updatedAt: number | null;
};

/** Without a live socket, data older than this is shown as stale. */
export const STALE_AFTER_MS = 150_000;

const REST_URL = "https://api.lanyard.rest/v1/users/";
const SOCKET_URL = "wss://api.lanyard.rest/socket";
const POLL_MS = 60_000;
const NOT_MONITORED_RETRY_MS = 5 * 60_000;

const INITIAL: PresenceState = {
  phase: "connecting",
  reason: null,
  presence: null,
  connected: false,
  updatedAt: null,
};

type Listener = () => void;

function isPresence(value: unknown): value is LanyardPresence {
  return (
    typeof value === "object" &&
    value !== null &&
    "discord_status" in value &&
    "discord_user" in value
  );
}

function createStore(userId: string) {
  let state = INITIAL;
  const listeners = new Set<Listener>();
  let socket: WebSocket | null = null;
  let heartbeat: ReturnType<typeof setInterval> | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let failures = 0;
  let running = false;

  function set(patch: Partial<PresenceState>) {
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
  }

  function receive(presence: LanyardPresence) {
    set({ phase: "ready", reason: null, presence, updatedAt: Date.now() });
  }

  function schedule(fn: () => void, ms: number) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(fn, ms);
  }

  async function poll(): Promise<"ok" | "not_monitored" | "error"> {
    try {
      const res = await fetch(REST_URL + userId, {
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });
      const body: unknown = await res.json();
      if (
        typeof body === "object" &&
        body !== null &&
        "success" in body &&
        body.success === true &&
        "data" in body &&
        isPresence(body.data)
      ) {
        receive(body.data);
        return "ok";
      }
      const code =
        typeof body === "object" && body !== null && "error" in body
          ? (body.error as { code?: string })?.code
          : undefined;
      if (code === "user_not_monitored") {
        set({ phase: "unavailable", reason: "not_monitored", presence: null });
        return "not_monitored";
      }
      return "error";
    } catch {
      return "error";
    }
  }

  function stopSocket() {
    if (heartbeat) clearInterval(heartbeat);
    heartbeat = null;
    if (socket) {
      socket.onclose = null;
      socket.onmessage = null;
      socket.close();
    }
    socket = null;
  }

  function connect() {
    if (!running || typeof WebSocket === "undefined") return;
    stopSocket();
    const ws = new WebSocket(SOCKET_URL);
    socket = ws;

    ws.onmessage = (event) => {
      let msg: { op: number; t?: string; d?: unknown };
      try {
        msg = JSON.parse(String(event.data));
      } catch {
        return;
      }
      if (msg.op === 1) {
        const interval =
          (msg.d as { heartbeat_interval?: number } | undefined)?.heartbeat_interval ?? 30_000;
        ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: userId } }));
        if (heartbeat) clearInterval(heartbeat);
        heartbeat = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ op: 3 }));
        }, interval);
      } else if (msg.op === 0 && (msg.t === "INIT_STATE" || msg.t === "PRESENCE_UPDATE")) {
        if (!isPresence(msg.d)) return;
        failures = 0;
        state = { ...state, connected: true };
        receive(msg.d);
      }
    };

    ws.onclose = () => {
      stopSocket();
      if (!running) return;
      failures += 1;
      set({
        connected: false,
        ...(state.presence ? {} : { phase: "unavailable", reason: "network" }),
      });
      if (failures > 4) {
        // The socket keeps failing: poll instead, and give the socket another go each minute.
        schedule(async () => {
          await poll();
          connect();
        }, POLL_MS);
        return;
      }
      schedule(connect, Math.min(30_000, 1000 * 2 ** failures));
    };
  }

  async function start() {
    running = true;
    const first = await poll();
    if (!running) return;
    if (first === "not_monitored") {
      schedule(() => void start(), NOT_MONITORED_RETRY_MS);
      return;
    }
    connect();
  }

  function stop() {
    running = false;
    if (timer) clearTimeout(timer);
    timer = null;
    stopSocket();
    state = { ...state, connected: false };
  }

  return {
    subscribe(listener: Listener) {
      listeners.add(listener);
      if (listeners.size === 1) void start();
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) stop();
      };
    },
    getSnapshot: () => state,
    getServerSnapshot: () => INITIAL,
  };
}

const stores = new Map<string, ReturnType<typeof createStore>>();

export function presenceStore(userId: string) {
  let store = stores.get(userId);
  if (!store) {
    store = createStore(userId);
    stores.set(userId, store);
  }
  return store;
}

export const STATUS_LABEL: Record<DiscordStatus, string> = {
  online: "online",
  idle: "idle",
  dnd: "do not disturb",
  offline: "offline",
};

export const ACTIVITY_VERB: Record<LanyardActivity["type"], string> = {
  0: "playing",
  1: "streaming",
  2: "listening to",
  3: "watching",
  4: "",
  5: "competing in",
};

/** Resolve a Discord activity asset key to an image URL, when possible. */
export function activityImage(activity: LanyardActivity): string | null {
  const key = activity.assets?.large_image;
  if (!key) return null;
  if (key.startsWith("mp:external/")) {
    return `https://media.discordapp.net/external/${key.slice("mp:external/".length)}`;
  }
  if (key.startsWith("mp:")) return `https://media.discordapp.net/${key.slice(3)}`;
  if (key.startsWith("spotify:")) return `https://i.scdn.co/image/${key.slice(8)}`;
  if (/^\d+$/.test(key) && activity.application_id) {
    return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${key}.png?size=128`;
  }
  return null;
}

export function avatarUrl(user: LanyardPresence["discord_user"]): string | null {
  if (!user.avatar) return null;
  const ext = user.avatar.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=64`;
}

export function platforms(p: LanyardPresence): string[] {
  const list: string[] = [];
  if (p.active_on_discord_desktop) list.push("desktop");
  if (p.active_on_discord_mobile) list.push("mobile");
  if (p.active_on_discord_web) list.push("web");
  return list;
}

/** "1:05" or "1:02:05". */
export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

export function formatAgo(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 10) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.round(m / 60)}h ago`;
}
