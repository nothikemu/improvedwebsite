"use client";

import { useMemo, useState } from "react";
import type { ShowcaseRepo } from "@/lib/projects";

type Sort = "pushed" | "stars" | "name";

const SORTS: { id: Sort; label: string }[] = [
  { id: "pushed", label: "recent" },
  { id: "stars", label: "stars" },
  { id: "name", label: "a–z" },
];

const INITIAL_ROWS = 10;

function Toggle({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className="meta min-h-8 rounded-sm border border-transparent px-2 py-1 text-muted transition-colors hover:text-fg aria-pressed:border-line-strong aria-pressed:text-fg"
    >
      {children}
    </button>
  );
}

export function RepoIndex({ repos }: { repos: ShowcaseRepo[] }) {
  const [sort, setSort] = useState<Sort>("pushed");
  const [language, setLanguage] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const languages = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of repos) if (r.language) counts.set(r.language, (counts.get(r.language) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [repos]);

  const rows = useMemo(() => {
    const list = language ? repos.filter((r) => r.language === language) : [...repos];
    if (sort === "stars") list.sort((a, b) => b.stars - a.stars || b.pushedAt.localeCompare(a.pushedAt));
    else if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    else list.sort((a, b) => b.pushedAt.localeCompare(a.pushedAt));
    return list;
  }, [repos, sort, language]);

  const visible = expanded ? rows : rows.slice(0, INITIAL_ROWS);

  return (
    <div className="mt-12 sm:mt-16">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b border-line pb-3">
        <h3 className="stretch-wide text-xl font-semibold">every repository</h3>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {languages.length > 1 && (
            <div role="group" aria-label="Filter by language" className="flex flex-wrap items-center gap-1">
              <Toggle pressed={language === null} onClick={() => setLanguage(null)}>
                all
              </Toggle>
              {languages.map(([name, count]) => (
                <Toggle key={name} pressed={language === name} onClick={() => setLanguage(name)}>
                  {name} <span className="opacity-80">{count}</span>
                </Toggle>
              ))}
            </div>
          )}
          <div role="group" aria-label="Sort repositories" className="flex items-center gap-1">
            {SORTS.map((s) => (
              <Toggle key={s.id} pressed={sort === s.id} onClick={() => setSort(s.id)}>
                {s.label}
              </Toggle>
            ))}
          </div>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {`Showing ${visible.length} of ${rows.length} repositories${language ? ` in ${language}` : ""}, sorted by ${SORTS.find((s) => s.id === sort)?.label}.`}
      </p>
      <ul aria-label="Repositories">
        {visible.map((repo) => (
          <li
            key={repo.name}
            className="group relative grid grid-cols-[1fr_auto] gap-x-6 gap-y-1 border-b border-line py-3.5 md:grid-cols-[minmax(9rem,15rem)_1fr_7.5rem_3.5rem_6rem] md:items-baseline"
          >
            <span className="col-start-1 row-start-1 flex min-w-0 items-baseline gap-2">
              <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="stretch-on-hover truncate font-semibold transition-colors after:absolute after:inset-0 after:content-[''] group-hover:text-accent"
              >
                {repo.name}
              </a>
              {repo.archived && <span className="meta shrink-0 text-muted">archived</span>}
            </span>
            <p
              className={`col-span-2 row-start-2 truncate text-sm md:col-span-1 md:col-start-2 md:row-start-1 ${
                repo.description ? "text-muted" : "text-muted italic"
              }`}
            >
              {repo.description ?? "No description"}
            </p>
            <span className="meta col-span-2 row-start-3 truncate text-muted md:col-span-1 md:col-start-3 md:row-start-1">
              {repo.language ?? "no language"}
              <span className="md:hidden">
                {"  /  "}
                <time dateTime={repo.pushedAt}>{repo.pushedAt.slice(0, 10)}</time>
              </span>
            </span>
            <span className="meta col-start-2 row-start-1 text-right text-muted md:col-start-4">
              <span aria-hidden="true">★ </span>
              {repo.stars}
              <span className="sr-only"> stars</span>
            </span>
            <time
              dateTime={repo.pushedAt}
              className="meta hidden text-right text-muted md:col-start-5 md:row-start-1 md:block"
            >
              {repo.pushedAt.slice(0, 10)}
            </time>
          </li>
        ))}
      </ul>

      {rows.length > INITIAL_ROWS && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="text-link mt-5 text-sm"
        >
          {expanded ? "Show fewer" : `Show all ${rows.length}`}
        </button>
      )}
    </div>
  );
}
