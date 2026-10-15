/**
 * Project configuration. Public repositories are discovered automatically from
 * GitHub; this file only adjusts how they are presented.
 */

export type FeaturedProject = {
  /** Repository name exactly as it appears on GitHub. */
  repo: string;
  /** Optional replacement for the GitHub description. */
  description?: string;
  /** Optional live demo URL. Overrides the repository's "homepage" field. */
  demo?: string;
};

export const projectsConfig = {
  githubUser: "nothikemu",

  /**
   * Hand-picked projects, shown first and in this order. When empty, the
   * spotlight shows the most recently pushed repositories instead and labels
   * them that way.
   *
   * Example: [{ repo: "my-robot", demo: "https://my-robot.example" }]
   */
  featured: [] as FeaturedProject[],

  /** How many repositories the spotlight shows when nothing is hand-picked. */
  spotlightCount: 3,

  /** Repository names to leave out entirely. */
  hidden: [] as string[],

  includeForks: false,

  /** Short tags shown next to specific repositories. */
  labels: {
    improvedwebsite: "this site",
  } as Record<string, string>,
};
