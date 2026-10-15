import { projectsConfig } from "@/data/projects";
import type { ReposResult } from "@/lib/github";
import { formatDate, type Showcase, type ShowcaseRepo } from "@/lib/projects";
import { RepoIndex } from "./repo-index";
import { SectionHeading } from "./section-heading";

const profileUrl = `https://github.com/${projectsConfig.githubUser}`;

const FAILURE_COPY = {
  rate_limited:
    "GitHub's API rate limit was reached, so the project list couldn't load. It retries on its own within a few minutes.",
  not_found: `GitHub has no public profile named ${projectsConfig.githubUser} right now.`,
  unavailable:
    "GitHub couldn't be reached, so the project list didn't load. It retries on its own within a few minutes.",
} as const;

function checkedAt(iso: string) {
  return `${iso.slice(0, 10)} ${iso.slice(11, 16)} UTC`;
}

function Stars({ count }: { count: number }) {
  return (
    <span>
      <span aria-hidden="true">★ </span>
      {count}
      <span className="sr-only"> {count === 1 ? "star" : "stars"}</span>
    </span>
  );
}

function SpotlightItem({ repo }: { repo: ShowcaseRepo }) {
  return (
    <li className="group relative isolate grid gap-x-8 gap-y-5 border-t border-line py-8 first:border-t-0 lg:grid-cols-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-3 inset-y-1 -z-10 rounded-md bg-raised opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:-inset-x-5"
      />
      <div className="min-w-0 lg:col-span-7">
        <h3 className="text-[clamp(1.75rem,4.2vw,3rem)] leading-[1.02] font-bold tracking-[-0.015em]">
          <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="stretch-on-hover break-words after:absolute after:inset-0 after:content-['']"
          >
            {repo.name}
          </a>
        </h3>
        <p className={`mt-3 max-w-[56ch] ${repo.description ? "" : "text-muted italic"}`}>
          {repo.description ?? "No description on GitHub yet."}
        </p>
      </div>

      <div className="flex flex-col justify-between gap-4 lg:col-span-5">
        <dl className="meta grid grid-cols-[auto_1fr] gap-x-5 gap-y-1 text-muted">
          <dt>language</dt>
          <dd className="text-fg">{repo.language ?? "not detected"}</dd>
          <dt>stars</dt>
          <dd className="text-fg">
            <Stars count={repo.stars} />
          </dd>
          <dt>last push</dt>
          <dd className="text-fg">
            <time dateTime={repo.pushedAt}>{formatDate(repo.pushedAt)}</time>
          </dd>
          {repo.topics.length > 0 && (
            <>
              <dt>topics</dt>
              <dd className="text-fg">{repo.topics.slice(0, 6).join(", ")}</dd>
            </>
          )}
        </dl>
        <div className="flex flex-wrap items-center gap-2">
          {repo.label && (
            <span className="meta rounded-sm border border-accent/50 px-1.5 py-0.5 text-accent">{repo.label}</span>
          )}
          {repo.archived && (
            <span className="meta rounded-sm border border-line px-1.5 py-0.5 text-muted">archived</span>
          )}
          {repo.demo && (
            <a
              href={repo.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="meta relative z-10 rounded-sm border border-line-strong px-2 py-1 text-fg transition-colors hover:border-accent hover:text-accent"
            >
              open live demo
            </a>
          )}
        </div>
      </div>
    </li>
  );
}

export function Projects({ result, showcase }: { result: ReposResult; showcase: Showcase | null }) {
  const aside = showcase ? (
    <>
      {showcase.all.length} public {showcase.all.length === 1 ? "repository" : "repositories"} from{" "}
      <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="text-link text-fg">
        github.com/{projectsConfig.githubUser}
      </a>
      , checked {checkedAt(result.fetchedAt)}
    </>
  ) : (
    <>checked {checkedAt(result.fetchedAt)}</>
  );

  return (
    <section
      id="projects"
      aria-labelledby="projects-title"
      className="container-page py-[clamp(3.5rem,8vw,6.5rem)]"
    >
      <SectionHeading id="projects" title="projects" aside={aside} />

      {!result.ok && (
        <div className="panel mt-10 max-w-2xl px-5 py-5" role="status">
          <p className="font-medium">The project list isn&apos;t available right now.</p>
          <p className="mt-2 text-muted">{FAILURE_COPY[result.reason]}</p>
          <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="text-link mt-4 inline-block text-sm">
            Browse repositories on GitHub
          </a>
        </div>
      )}

      {showcase && showcase.all.length === 0 && (
        <div className="panel mt-10 max-w-2xl px-5 py-5">
          <p className="font-medium">No public repositories yet.</p>
          <p className="mt-2 text-muted">
            New projects show up here automatically once they&apos;re public on GitHub.
          </p>
          <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="text-link mt-4 inline-block text-sm">
            Visit the GitHub profile
          </a>
        </div>
      )}

      {showcase && showcase.spotlight.length > 0 && (
        <div className="mt-10">
          <p className="meta text-muted">
            {showcase.spotlightKind === "featured" ? "picked by hand" : "most recently pushed"}
          </p>
          <ul className="mt-2">
            {showcase.spotlight.map((repo) => (
              <SpotlightItem key={repo.name} repo={repo} />
            ))}
          </ul>
        </div>
      )}

      {showcase && showcase.all.length > showcase.spotlight.length && (
        <RepoIndex repos={showcase.all} />
      )}
    </section>
  );
}
