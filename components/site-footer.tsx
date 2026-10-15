import { cacheLife } from "next/cache";
import { site } from "@/data/site";

async function Year() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

const buildSha = process.env.BUILD_SHA ?? "";

export function SiteFooter() {
  const ring = site.webring;
  return (
    <footer className="border-t border-line">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="stretch-wide font-semibold">
            &copy; <Year /> {site.name}
          </p>
          <p className="mt-1 text-sm text-muted">{site.signoff}</p>
        </div>

        <ul className="meta flex flex-wrap gap-x-5 gap-y-2 self-start text-muted lg:col-span-4" aria-label="Elsewhere">
          {site.socials.map((link) => (
            <li key={link.label}>
              <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-link hover:text-fg">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="meta flex flex-wrap gap-x-5 gap-y-2 self-start text-muted sm:col-span-2 lg:col-span-3 lg:justify-end">
          <a href={site.sourceRepo} target="_blank" rel="noopener noreferrer" className="text-link hover:text-fg">
            source
          </a>
          {buildSha && (
            <a
              href={`${site.sourceRepo}/commit/${buildSha}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-link hover:text-fg"
              title="The commit this page was built from"
            >
              build {buildSha.slice(0, 7)}
            </a>
          )}
          <a href="#top" className="text-link hover:text-fg">
            back to top
          </a>
        </div>

        {ring && (
          <nav aria-label={`${ring.name} webring`} className="meta flex flex-wrap items-center gap-x-4 gap-y-2 text-muted sm:col-span-2 lg:col-span-12">
            <a href={ring.prev} className="text-link hover:text-fg">previous site</a>
            <a href={ring.home} className="text-link hover:text-fg">{ring.name}</a>
            <a href={ring.next} className="text-link hover:text-fg">next site</a>
          </nav>
        )}
      </div>
    </footer>
  );
}
