import { About } from "@/components/about";
import { Contact } from "@/components/contact";
import { Hero } from "@/components/hero";
import { Projects } from "@/components/projects";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { projectsConfig } from "@/data/projects";
import { getRepos } from "@/lib/github";
import { buildShowcase, repoStats } from "@/lib/projects";

export default async function Home() {
  const result = await getRepos(projectsConfig.githubUser);
  const showcase = result.ok ? buildShowcase(result.repos) : null;
  const { latest, topLanguage } = repoStats(showcase?.all ?? []);

  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero latest={latest} />
        <About topLanguage={topLanguage} />
        <Projects result={result} showcase={showcase} />
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}
