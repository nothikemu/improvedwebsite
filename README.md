# nothikemu

Hikemu's personal site: an introduction, live Discord presence, projects pulled from GitHub, contact links and a guestbook, on one page.

Built with Next.js 16 (App Router, Cache Components), React 19, TypeScript and Tailwind CSS 4. There are no runtime dependencies beyond those three packages.

## Running it

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script              | What it does                     |
| ------------------- | -------------------------------- |
| `npm run dev`       | Development server               |
| `npm run build`     | Production build                 |
| `npm start`         | Serve the production build       |
| `npm run lint`      | ESLint                           |
| `npm run typecheck` | Generate route types, run `tsc`  |

Copy `.env.example` to `.env.local` for any of the optional settings below. Nothing is required.

## Editing content

All personal copy lives in two files. Components contain no personal text of their own.

- **`data/site.ts`**: name, handle, intro, tags, the about section and interests, social links, Discord ID, footer sign-off, and an optional webring.
- **`data/projects.ts`**: GitHub username, hand-picked featured projects (with optional description overrides and demo links), hidden repositories, whether to include forks, and small labels such as "this site".

When `featured` is empty, the spotlight shows the three most recently pushed repositories and says so ("most recently pushed"). Hand-picked projects are labeled "picked by hand".

## Integrations

### GitHub projects (works out of the box)

Public repositories for the configured user are fetched on the server and cached with `'use cache'`: successful responses for 30 minutes, and failures for about a minute, so an outage doesn't stick. Rate limits, missing profiles and network failures each get their own message plus a link to the GitHub profile; the rest of the page is unaffected. Forks are hidden by default, and archived repositories are marked.

Set `GITHUB_TOKEN` in production. Unauthenticated requests share a 60-per-hour limit per server IP, and hosting providers share IPs.

### Discord presence and music (needs one step)

Presence comes from [Lanyard](https://github.com/Phineas/lanyard), which only reports users who have joined its Discord server. Join the server linked in Lanyard's README with the account whose ID is in `data/site.ts`. Until then, the panel shows "Status unavailable: Discord presence isn't being shared" and never claims the user is offline.

The panel reads one REST snapshot, then keeps a WebSocket open for live updates. If the socket keeps failing, it falls back to polling once a minute. It distinguishes:

- **connecting**: skeleton placeholder, with space reserved so nothing shifts
- **online / idle / do not disturb / offline**: always shown as text, not only as color
- **unavailable**: either not shared, or the service couldn't be reached; explicitly not "offline"
- **stale**: when the connection drops and no update arrives for 2.5 minutes, the last known data is dimmed, timers are hidden, and the age of the data is shown

The listening row and the "now" line under *music* come from Spotify through the same Lanyard data. They appear only when Discord reports a Spotify track (Spotify connected to Discord, with activity sharing on). Nothing is shown as playing unless Discord says so.

### Guestbook (local until storage is configured)

- **Without storage env vars:** local mode. Entries are saved in the visitor's own browser, and the guestbook says so: "entries stay in this browser only. Nobody else can see them."
- **With `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`** (or Vercel's `KV_REST_API_URL` / `KV_REST_API_TOKEN`): shared mode through `app/api/guestbook/route.ts`. The newest 200 entries are kept and the latest 50 are shown.

Server-side protections: the same validation as the form (name up to 32 characters, message up to 240, at most one link, control and invisible characters stripped); a honeypot field; and a one-entry-per-minute rate limit keyed on a salted hash of the visitor's IP. The raw IP is never stored, and the key expires after 60 seconds. Entries are rendered as plain text. To remove an entry, delete it from the `guestbook:entries` list in the Upstash console.

## Design notes

- **Two themes, designed separately.** Dark is "the board": matte black, quartz-white type and a faint perfboard dot grid. Light is "the datasheet": cool quartz paper, ink type and a ruled grid. Both use one ultramarine accent, tuned for contrast in each theme. Status colors are separate from the accent and always paired with a label.
- **Theme handling.** The theme defaults to dark, follows the OS when nothing is saved, and remembers the toggle in `localStorage`. An inline script in `<head>` applies it before first paint, so there's no flash. Where the browser supports view transitions, switching opens the new theme as a circle from the toggle.
- **Type.** Archivo (variable, width axis 62–125) for everything readable; Martian Mono for timestamps, counts and labels. Both are self-hosted through `next/font`.
- **One signature interaction.** The width axis carries the site's motion. The name stretches open on load (a transform, so it never triggers layout), and letters squeeze under a mouse pointer. Clickable names and links widen on hover, and only things that widen are clickable.
- **Tokens** (colors, radii, motion durations and easing) are CSS custom properties at the top of `app/globals.css`, mapped into Tailwind with `@theme`.
- **Motion** uses transforms and opacity, except the pointer-driven squeeze. The only looping animations are the loading skeleton and a three-beat status pulse. `prefers-reduced-motion` turns all of it off.

Small details: the header dot mirrors Discord status, a hairline under the header tracks scroll position (CSS scroll-driven animation, no script), the footer links to the exact commit the page was built from, and the browser console has a note for anyone who opens it.

## Project structure

```
app/
  layout.tsx            fonts, metadata, pre-paint theme script
  page.tsx              composes the sections
  globals.css           design tokens, base styles, animations
  api/guestbook/        guestbook API (GET list, POST sign)
  opengraph-image.tsx   link preview image
  icon.svg
components/             header, hero, name mark, presence panel, about,
                        projects + repository index, contact, guestbook, footer
lib/
  github.ts             GitHub fetch + caching
  projects.ts           featured/auto spotlight, stats
  lanyard.ts            presence store (REST + WebSocket), helpers
  guestbook.ts          validation shared by form and API
  guestbook-store.ts    Upstash REST storage (server-only)
data/
  site.ts               personal content
  projects.ts           project presentation config
```

## Notes and limitations

- **References.** The five reference sites (boo.kim, assumi.ng, aureal.dev, akryst.moe, hkmu.me) couldn't be reached from the environment this was built in, and none are indexed by search engines. The design follows the written brief rather than direct observation of those sites. A reference pass is a good follow-up once they can be inspected.
- The project list reads the first 100 repositories (sorted by most recent push).
- Discord's `discord.com/users/<id>` profile link opens the profile for people signed in to Discord. Swap it in `data/site.ts` for a server invite if you'd rather.
- No webring is configured. The footer renders one only after real links are added to `data/site.ts`.
