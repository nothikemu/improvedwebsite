"use client";

import { usePresence } from "./hooks";

/** One line naming the current Spotify track, only while Discord presence reports one. */
export function NowPlaying() {
  const { presence } = usePresence();
  const spotify = presence?.listening_to_spotify ? presence.spotify : null;
  if (!spotify) return null;
  return (
    <p className="meta mt-2 flex min-w-0 items-center gap-2 text-fg">
      <span className="status-dot" data-status="online" aria-hidden="true" />
      <span className="truncate">
        <span className="text-muted">now </span>
        {spotify.song}
        <span className="text-muted"> by </span>
        {spotify.artist.split(";")[0]}
      </span>
    </p>
  );
}
