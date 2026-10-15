import { site } from "@/data/site";
import { NameMark } from "./name-mark";
import { PresencePanel } from "./presence-panel";

type Props = {
  /** Most recently pushed repository, when GitHub data is available. */
  latest: { name: string; url: string; date: string } | null;
};

export function Hero({ latest }: Props) {
  return (
    <section id="top" aria-label="Introduction" className="relative isolate">
      <div aria-hidden="true" className="surface-texture absolute inset-0 -z-10" />

      <div className="container-page pt-[clamp(2.5rem,7vw,5.5rem)] pb-[clamp(2.5rem,6vw,4.5rem)]">
        <div data-name-area className="name-area">
          <NameMark name={site.name} />
        </div>

        <div
          className="intro-fade meta mt-[clamp(1rem,2.4vw,1.75rem)] flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-line pt-3 text-muted"
          style={{ "--delay": "300ms" } as React.CSSProperties}
        >
          <span>
            online as <span className="text-fg">@{site.handle}</span>
          </span>
          {latest && (
            <span>
              latest push{" "}
              <a href={latest.url} className="text-link text-fg" target="_blank" rel="noopener noreferrer">
                {latest.name}
              </a>{" "}
              <time dateTime={latest.date}>{latest.date}</time>
            </span>
          )}
        </div>

        <div className="mt-[clamp(2.5rem,6vw,4.5rem)] grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7 lg:pr-8">
            <p className="max-w-[34ch] text-[clamp(1.25rem,2.3vw,1.6rem)] leading-[1.38] text-balance">
              {site.intro}
            </p>

            <ul aria-label="Interests" className="mt-7 flex max-w-[42rem] flex-wrap gap-x-2 gap-y-2">
              {site.tags.map((tag) => (
                <li
                  key={tag}
                  className="meta rounded-sm border border-line px-2 py-1 text-muted"
                >
                  {tag}
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
              <a
                href="#projects"
                className="group inline-flex h-11 items-center rounded-full bg-fg px-5 text-sm font-semibold text-bg transition-colors hover:bg-accent hover:text-accent-ink"
              >
                <span className="stretch-on-hover">see projects</span>
              </a>
              <a href="#contact" className="text-link text-sm font-medium">
                get in touch
              </a>
            </div>
          </div>

          <div
            className="intro-fade lg:col-span-5"
            style={{ "--delay": "450ms" } as React.CSSProperties}
          >
            <PresencePanel />
          </div>
        </div>
      </div>
    </section>
  );
}
