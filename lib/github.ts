import "server-only";
import { cacheLife, cacheTag } from "next/cache";

export type Repo = {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  url: string;
  homepage: string | null;
  topics: string[];
  fork: boolean;
  archived: boolean;
  pushedAt: string;
};

export type RepoFailure = "rate_limited" | "not_found" | "unavailable";

export type ReposResult =
  | { ok: true; repos: Repo[]; fetchedAt: string }
  | { ok: false; reason: RepoFailure; fetchedAt: string };

type GitHubRepo = {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  homepage: string | null;
  topics?: string[];
  fork: boolean;
  archived: boolean;
  pushed_at: string;
};

// Overridable so the page can be tested against a local fixture server.
const API_URL = process.env.GITHUB_API_URL ?? "https://api.github.com";

function normalize(repo: GitHubRepo): Repo {
  return {
    name: repo.name,
    description: repo.description?.trim() || null,
    language: repo.language,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    url: repo.html_url,
    homepage: repo.homepage?.trim() || null,
    topics: repo.topics ?? [],
    fork: repo.fork,
    archived: repo.archived,
    pushedAt: repo.pushed_at,
  };
}

/**
 * Public repositories owned by `user`, most recently pushed first.
 * Successful responses are cached for 30 minutes; failures for about a minute
 * so a transient GitHub outage doesn't stick to the page.
 */
export async function getRepos(user: string): Promise<ReposResult> {
  "use cache";
  cacheTag("github-repos");

  const fetchedAt = new Date().toISOString();
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": `${user}-personal-site`,
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const res = await fetch(
      `${API_URL}/users/${encodeURIComponent(user)}/repos?type=owner&sort=pushed&per_page=100`,
      { headers, signal: AbortSignal.timeout(8000) },
    );

    if (!res.ok) {
      cacheLife("minutes");
      const limited =
        res.status === 429 ||
        (res.status === 403 && res.headers.get("x-ratelimit-remaining") === "0");
      const reason: RepoFailure = limited
        ? "rate_limited"
        : res.status === 404
          ? "not_found"
          : "unavailable";
      return { ok: false, reason, fetchedAt };
    }

    const data: unknown = await res.json();
    if (!Array.isArray(data)) {
      cacheLife("minutes");
      return { ok: false, reason: "unavailable", fetchedAt };
    }

    cacheLife({ stale: 300, revalidate: 1800, expire: 60 * 60 * 24 * 7 });
    return { ok: true, repos: (data as GitHubRepo[]).map(normalize), fetchedAt };
  } catch {
    cacheLife("minutes");
    return { ok: false, reason: "unavailable", fetchedAt };
  }
}
