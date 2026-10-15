"use client";

import { useState } from "react";
import { site } from "@/data/site";
import {
  ACTIVITY_VERB,
  STALE_AFTER_MS,
  STATUS_LABEL,
  activityImage,
  avatarUrl,
  formatAgo,
  formatDuration,
  platforms,
  type LanyardActivity,
  type LanyardPresence,
  type LanyardSpotify,
} from "@/lib/lanyard";
import { useNow, usePresence } from "./hooks";

/** An external image that quietly disappears if it fails to load. */
function Thumb({ src, size, round = false }: { src: string | null; size: number; round?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;
  return (
    // External, frequently changing art from Discord/Spotify CDNs: a plain img avoids an optimizer round trip.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`shrink-0 bg-sunken object-cover ${round ? "rounded-full" : "rounded-sm"}`}
      style={{ width: size, height: size }}
    />
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[5.25rem_1fr] gap-3 border-t border-line px-4 py-3 first:border-t-0">
      <dt className="meta pt-0.5 text-muted">{label}</dt>
      <dd className="min-w-0 text-sm leading-snug">{children}</dd>
    </div>
  );
}

function ActivityRow({ activity, now }: { activity: LanyardActivity; now: number | null }) {
  const verb = ACTIVITY_VERB[activity.type];
  const start = activity.timestamps?.start;
  const end = activity.timestamps?.end;
  let timing: string | null = null;
  if (now && end && end > now) timing = `${formatDuration(end - now)} left`;
  else if (now && start) timing = `for ${formatDuration(now - start)}`;

  return (
    <Row label={verb || "doing"}>
      <div className="flex gap-3">
        <Thumb src={activityImage(activity)} size={40} />
        <div className="min-w-0">
          <p className="truncate font-medium">{activity.name}</p>
          {activity.details && <p className="truncate text-muted">{activity.details}</p>}
          {activity.state && <p className="truncate text-muted">{activity.state}</p>}
          {timing && <p className="meta mt-0.5 text-muted">{timing}</p>}
        </div>
      </div>
    </Row>
  );
}

function SpotifyRow({ spotify, now }: { spotify: LanyardSpotify; now: number | null }) {
  const { start, end } = spotify.timestamps;
  const length = end - start;
  const elapsed = now ? Math.min(Math.max(now - start, 0), length) : 0;
  const trackUrl = spotify.track_id ? `https://open.spotify.com/track/${spotify.track_id}` : null;

  return (
    <Row label="listening">
      <div className="flex gap-3">
        <Thumb src={spotify.album_art_url} size={48} />
        <div className="min-w-0 flex-1">
          {trackUrl ? (
            <a
              href={trackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-link block truncate font-medium"
            >
              {spotify.song}
            </a>
          ) : (
            <p className="truncate font-medium">{spotify.song}</p>
          )}
          <p className="truncate text-muted">{spotify.artist.replaceAll(";", ",")}</p>
          {now && length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div
                className="h-0.5 flex-1 overflow-hidden rounded-full bg-line"
                role="progressbar"
                aria-label="Track progress"
                aria-valuemin={0}
                aria-valuemax={Math.round(length / 1000)}
                aria-valuenow={Math.round(elapsed / 1000)}
                aria-valuetext={`${formatDuration(elapsed)} of ${formatDuration(length)}`}
              >
                <div
                  className="h-full origin-left bg-fg transition-transform duration-1000 ease-linear"
                  style={{ transform: `scaleX(${elapsed / length})` }}
                />
              </div>
              <span className="meta shrink-0 text-muted">
                {formatDuration(elapsed)} / {formatDuration(length)}
              </span>
            </div>
          )}
        </div>
      </div>
    </Row>
  );
}

function PresenceBody({ presence, now }: { presence: LanyardPresence; now: number | null }) {
  const status = presence.discord_status;
  const custom = presence.activities.find((a) => a.type === 4);
  const activities = presence.activities.filter(
    (a) => a.type !== 4 && !(presence.listening_to_spotify && a.id.startsWith("spotify")),
  );
  const where = platforms(presence);
  const listening = presence.listening_to_spotify && presence.spotify;

  return (
    <dl>
      <Row label="discord">
        <span className="flex items-center gap-2">
          <span className="status-dot" data-status={status} data-live="true" aria-hidden="true" />
          <span className="font-medium">{STATUS_LABEL[status]}</span>
          {status !== "offline" && where.length > 0 && (
            <span className="meta text-muted">on {where.join(" + ")}</span>
          )}
        </span>
        {custom?.state && (
          <p className="mt-1 text-muted">
            {custom.emoji && !custom.emoji.id ? `${custom.emoji.name} ` : ""}
            {custom.state}
          </p>
        )}
      </Row>

      {activities.map((a) => (
        <ActivityRow key={`${a.id}-${a.name}`} activity={a} now={now} />
      ))}

      {listening && presence.spotify ? (
        <SpotifyRow spotify={presence.spotify} now={now} />
      ) : status !== "offline" ? (
        <Row label="listening">
          <span className="text-muted">Nothing on Spotify right now.</span>
        </Row>
      ) : null}

      {status !== "offline" && activities.length === 0 && (
        <Row label="doing">
          <span className="text-muted">No activity showing on Discord.</span>
        </Row>
      )}
      {status === "offline" && (
        <Row label="doing">
          <span className="text-muted">Nothing to show while offline.</span>
        </Row>
      )}
    </dl>
  );
}

function Skeleton() {
  return (
    <div aria-hidden="true">
      {[0.45, 0.7, 0.55].map((w, i) => (
        <div key={i} className="grid grid-cols-[5.25rem_1fr] gap-3 border-t border-line px-4 py-3.5 first:border-t-0">
          <div className="skeleton h-3 w-14" />
          <div className="skeleton h-3" style={{ width: `${w * 100}%` }} />
        </div>
      ))}
    </div>
  );
}

export function PresencePanel() {
  const state = usePresence();
  const { phase, presence, connected, updatedAt, reason } = state;
  const now = useNow(1000, phase === "ready");

  const age = now && updatedAt ? now - updatedAt : 0;
  const stale = phase === "ready" && !connected && age > STALE_AFTER_MS;

  let footer: string;
  if (phase === "connecting") footer = "connecting";
  else if (phase === "unavailable") footer = reason === "not_monitored" ? "not shared" : "retrying";
  else if (connected) footer = "live";
  else if (stale) footer = `stale, last update ${formatAgo(age)}`;
  else footer = now && updatedAt ? `updated ${formatAgo(age)}` : "updated";

  const user = presence?.discord_user;

  return (
    <section
      aria-labelledby="presence-title"
      aria-busy={phase === "connecting"}
      className="panel flex min-h-[15.5rem] flex-col overflow-hidden"
    >
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          {user && <Thumb src={avatarUrl(user)} size={24} round />}
          <h2 id="presence-title" className="truncate text-sm font-semibold">
            right now
          </h2>
        </div>
        {user && (
          <span className="meta truncate text-muted">@{user.username}</span>
        )}
      </header>

      <div className={`flex-1 transition-opacity ${stale ? "opacity-55" : ""}`}>
        {phase === "connecting" && <Skeleton />}

        {phase === "unavailable" && (
          <div className="px-4 py-4 text-sm">
            <p className="flex items-center gap-2 font-medium">
              <span className="status-dot" data-status="unknown" aria-hidden="true" />
              Status unavailable
            </p>
            <p className="mt-2 max-w-[38ch] text-muted">
              {reason === "not_monitored"
                ? "Discord presence isn't being shared at the moment."
                : "The presence service couldn't be reached, so there's nothing to show. It will keep trying."}{" "}
              This doesn&apos;t mean {site.name} is offline.
            </p>
          </div>
        )}

        {/* Stale data hides elapsed timers: there's no telling whether the activity continued. */}
        {phase === "ready" && presence && <PresenceBody presence={presence} now={stale ? null : now} />}
      </div>

      <footer className="meta flex items-center justify-between gap-3 border-t border-line px-4 py-2.5 text-muted">
        <a
          href="https://github.com/Phineas/lanyard"
          target="_blank"
          rel="noopener noreferrer"
          className="text-link"
        >
          via lanyard
        </a>
        <span className="flex items-center gap-1.5">
          {/* Connection indicator: accent, not status green, so it can't be read as "online". */}
          {connected && (
            <span
              className="status-dot size-1.5!"
              style={{ "--dot": "var(--accent)" } as React.CSSProperties}
              aria-hidden="true"
            />
          )}
          {footer}
        </span>
      </footer>
    </section>
  );
}
