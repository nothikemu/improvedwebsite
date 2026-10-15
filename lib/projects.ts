import { projectsConfig } from "@/data/projects";
import type { Repo } from "@/lib/github";

export type ShowcaseRepo = Repo & {
  /** Demo link from config, falling back to the repository's homepage field. */
  demo: string | null;
  label: string | null;
};

export type Showcase = {
  /** "featured" when hand-picked in config, "recent" when chosen automatically. */
  spotlightKind: "featured" | "recent";
  spotlight: ShowcaseRepo[];
  /** Every visible repository, spotlight included, for the full index. */
  all: ShowcaseRepo[];
};

export function buildShowcase(repos: Repo[]): Showcase {
  const { featured, hidden, includeForks, labels, spotlightCount } = projectsConfig;
  const featuredByName = new Map(featured.map((f) => [f.repo.toLowerCase(), f]));

  const all: ShowcaseRepo[] = repos
    .filter((r) => !hidden.includes(r.name))
    .filter((r) => includeForks || !r.fork)
    .map((r) => {
      const config = featuredByName.get(r.name.toLowerCase());
      return {
        ...r,
        description: config?.description ?? r.description,
        demo: config?.demo ?? r.homepage,
        label: labels[r.name] ?? null,
      };
    });

  const picked = featured
    .map((f) => all.find((r) => r.name.toLowerCase() === f.repo.toLowerCase()))
    .filter((r): r is ShowcaseRepo => Boolean(r));

  if (picked.length > 0) {
    return { spotlightKind: "featured", spotlight: picked, all };
  }

  const recent = all
    .filter((r) => !r.archived)
    .toSorted((a, b) => b.pushedAt.localeCompare(a.pushedAt))
    .slice(0, spotlightCount);

  return { spotlightKind: "recent", spotlight: recent, all };
}

/** Small facts for the hero and about section, derived from the visible repositories. */
export function repoStats(all: ShowcaseRepo[]) {
  const newest = all.toSorted((a, b) => b.pushedAt.localeCompare(a.pushedAt))[0];

  const counts = new Map<string, number>();
  for (const r of all) if (r.language) counts.set(r.language, (counts.get(r.language) ?? 0) + 1);
  const [top] = [...counts.entries()].sort((a, b) => b[1] - a[1]);

  return {
    latest: newest
      ? { name: newest.name, url: newest.url, date: formatDate(newest.pushedAt) }
      : null,
    topLanguage: top ? { name: top[0], count: top[1], total: all.length } : null,
  };
}

/** Locale-independent date, so server and client render the same text. */
export function formatDate(iso: string): string {
  return iso.slice(0, 10);
}
