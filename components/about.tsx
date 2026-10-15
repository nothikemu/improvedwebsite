import { site } from "@/data/site";
import { NowPlaying } from "./now-playing";
import { SectionHeading } from "./section-heading";

type Props = {
  /** Most common primary language across public repositories, when known. */
  topLanguage: { name: string; count: number; total: number } | null;
};

export function About({ topLanguage }: Props) {
  const { lead, interests } = site.about;
  return (
    <section id="about" aria-labelledby="about-title" className="container-page py-[clamp(3.5rem,8vw,6.5rem)]">
      <SectionHeading id="about" title="about" aside={`${interests.length} things I keep coming back to`} />

      <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-8">
        <p className="text-[clamp(1.15rem,1.9vw,1.4rem)] leading-[1.45] text-balance lg:col-span-4">
          {lead}
        </p>

        <dl className="grid sm:grid-cols-2 sm:gap-x-8 lg:col-span-8">
          {interests.map((item) => (
            <div key={item.name} className="border-t border-line py-4 first:border-t-0 sm:[&:nth-child(2)]:border-t-0">
              <dt className="stretch-wide font-semibold">{item.name}</dt>
              <dd className="mt-1 max-w-[40ch] text-sm text-muted">
                {item.note}
                {item.live === "github-language" && topLanguage && (
                  <span className="meta mt-2 block text-fg">
                    <span className="text-muted">most used on GitHub </span>
                    {topLanguage.name}
                    <span className="text-muted">
                      , {topLanguage.count} of {topLanguage.total} repos
                    </span>
                  </span>
                )}
                {item.live === "spotify" && <NowPlaying />}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
