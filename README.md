# hikemu's crib

Hikemu's personal site: a Windows 7 Aero desktop of four windows, namely a Discord profile card, a guestbook, a Last.fm "Windows Media Player" and an "About Me" notepad.

It's a rebrand of akryst.moe, built from that site's published MIT-licensed source ([AeroBio](https://github.com/Akryst/Aerobio)). Layout, styles, animations and behavior match the original; all of Akryst's personal content and artwork is replaced with Hikemu's details or labelled placeholders. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Built with Next.js 16, React 19, Tailwind CSS 3, [7.css](https://github.com/khang-nd/7.css) and Framer Motion. Tailwind stays on v3 deliberately: v4 changes default border colors, radii and shadows, which would visibly change the windows.

## Running it

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script              | What it does                    |
| ------------------- | ------------------------------- |
| `npm run dev`       | Development server              |
| `npm run build`     | Production build                |
| `npm start`         | Serve the production build      |
| `npm run lint`      | ESLint                          |
| `npm run typecheck` | Generate route types, run `tsc` |

Copy `.env.example` to `.env.local` for the optional settings below. Nothing is required to run the site.

## Editing content

All personal content lives in **`data/site.ts`**: name and handle, page title and description, the About text and interests, social buttons, Discord ID, Last.fm username, and the placeholder images. Components contain no personal copy.

### Placeholders still to fill

| Slot | Where | What to provide |
| --- | --- | --- |
| Character art (profile card, bottom-right) | `public/placeholders/character.svg`, `site.images.character` | A transparent PNG at 7:9, e.g. 420×540 |
| Banner fallback (shown when the Discord profile has no banner) | `public/placeholders/banner.svg`, `site.images.bannerFallback` | Any image; it's cropped to a ~3.8:1 strip |
| osu! and Steam buttons | `site.socials` | Profile URLs, or delete the entries. Until then they render as disabled buttons labelled "placeholder" |
| Last.fm username | `site.lastfmUsername` or `LASTFM_USERNAME` | Plus a `LASTFM_API_KEY` |
| Favicon, touch icon, link-preview image | `public/favicon.ico`, `public/apple-touch-icon.png`, `public/og-image.png` | Generic "h" tile and title card for now; replace with your own |

## Integrations

### Discord profile (Lanyard)

The avatar, avatar decoration, banner, display name, username and status dot come live from Discord via [Lanyard](https://github.com/Phineas/lanyard), refreshed every 10 seconds. Lanyard only reports users who have joined [its Discord server](https://discord.gg/lanyard), so join it with the account whose ID is in `data/site.ts` (or `DISCORD_ID`). Until then the card shows the original's fallback avatar ring, a grey status dot, and the name and handle from `data/site.ts`.

### Recently played (Last.fm)

Set `LASTFM_API_KEY` ([get one here](https://www.last.fm/api/account/create)) and `LASTFM_USERNAME`. The 20 most recent scrobbles show with album art, "Playing" for the current track, and refresh every 30 seconds. The key stays on the server. Without it, the window shows "No recent tracks found".

### Guestbook and visit counter

- Anyone can post (nickname up to 20 characters or anonymous, message up to 200), once every 30 minutes per visitor. Likes are one per browser.
- **Moderation:** set `ADMIN_SECRET`, then visit `/?admin=YOUR_SECRET` once. Delete buttons appear and the status bar shows "🔐 Admin mode". The server checks the secret on every delete; with no `ADMIN_SECRET` set, deleting is disabled.
- The "visits" badge counts unique visitors.
- IP addresses are never stored, only salted hashes (`HASH_SALT`).

**Storage:** with `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (or Vercel's `KV_REST_API_URL` / `KV_REST_API_TOKEN`), data lives in Upstash Redis. **Use this on Vercel or any serverless host**, since their filesystems don't persist. Without it, data is kept in `.data/store.json` (or `DATA_DIR`), which suits local development and a long-running server.

## Deploying

- **Vercel:** import the repo, add the Upstash integration (or the two `UPSTASH_*` variables), and set `ADMIN_SECRET`, `HASH_SALT` and the Last.fm variables.
- **A server with pm2:** `npm run build && pm2 start ecosystem.config.js`, which serves on port 3000 with the file store.

## Differences from the original, on purpose

Visually and behaviorally the site matches the original. Under the hood a few things changed:

- **Storage:** Prisma + SQLite is replaced by Upstash Redis or a JSON file, so the guestbook works on serverless hosts. The endpoints, limits and responses are the same.
- **Security:** the Last.fm key is no longer bundled into client JavaScript. The admin secret has no hard-coded fallback and is sent in a header instead of the URL. Raw IPs aren't stored.
- **Locale:** the guestbook's Spanish relative times and dialogs ("hace 2 días") are now English ("2 days ago"), to match Hikemu's site. The clock is still 24-hour.
- **Markup:** social links are `<a role="button">` instead of a `<button>` nested inside an `<a>` (invalid HTML). They're styled to render the same, idle and on hover.
- **Profile fallback:** if Discord data never arrives, the card shows the configured name and handle instead of a blank name.
- The original loaded the Inter font without ever applying it, so it's not loaded here; text renders in 7.css's Segoe UI stack exactly as before.
