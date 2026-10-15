/**
 * Personal content for the site. Edit this file to change what the page says;
 * components read from here and contain no personal copy of their own.
 */

export type SocialLink = {
  /** Shown exactly as written. */
  label: string;
  href: string;
  /** Small secondary text next to the label. */
  detail: string;
};

export type Interest = {
  name: string;
  note: string;
  /**
   * Optional live detail under the note, from real data only:
   * "github-language" shows the most common language across public repos,
   * "spotify" shows the current track when Discord presence reports one.
   */
  live?: "github-language" | "spotify";
};

export const site = {
  name: "Hikemu",
  handle: "nothikemu",

  /** Used for <title>, meta description and link previews. */
  title: "Hikemu (nothikemu)",
  description:
    "Hikemu's corner of the internet: code, computers, music, games, robots, and whatever side project is running right now.",

  /** Hero statement. Keep it to two or three sentences. */
  intro:
    "Hi, I'm Hikemu, usually found online as nothikemu. I like computers more than is probably normal, along with code, music, games, robots, and the odd corners of the internet. This is where I keep what I make and what I'm into.",

  /** Short words shown under the intro. */
  tags: ["programming", "hardware", "robotics", "music", "games", "internet culture"],

  about: {
    lead: "I like figuring out how things work, and then making something slightly strange with whatever I learned.",
    interests: [
      {
        name: "programming",
        note: "Writing code for fun, then following whatever rabbit hole it opens.",
        live: "github-language",
      },
      {
        name: "computers",
        note: "How they work, from the case screws down to the instructions.",
      },
      {
        name: "hardware",
        note: "The parts you can hold. Taking things apart to see what's inside.",
      },
      {
        name: "robotics",
        note: "Where code leaves the screen and starts moving things.",
      },
      {
        name: "music",
        note: "Usually on in the background, whatever else is happening.",
        live: "spotify",
      },
      {
        name: "games",
        note: "Playing them, and wondering how they were put together.",
      },
      {
        name: "internet culture",
        note: "Small websites, old forums, and the weirder corners of the web.",
      },
      {
        name: "experimental software",
        note: "Projects that start with “what if” and don't need a better reason.",
      },
    ] satisfies Interest[],
  },

  /**
   * Social links, in display order. Labels are shown exactly as written.
   * The Discord link uses Discord's own profile route, which opens the profile
   * for anyone signed in to Discord. Swap it for a server invite if you prefer.
   */
  socials: [
    { label: "github", href: "https://github.com/nothikemu", detail: "nothikemu" },
    { label: "x", href: "https://x.com/nothikemu", detail: "@nothikemu" },
    { label: "twitter", href: "https://twitter.com/nothikemu", detail: "@nothikemu" },
    {
      label: "discord",
      href: "https://discord.com/users/1338171592882262088",
      detail: "opens in Discord",
    },
  ] satisfies SocialLink[],

  /** Discord user ID used for live presence through Lanyard. */
  discordId: "1338171592882262088",

  /** Public repository for this site. Used for the footer source and build links. */
  sourceRepo: "https://github.com/nothikemu/improvedwebsite",

  signoff: "Thanks for scrolling all the way down.",

  /**
   * Optional webring. Leave as null until you've joined one; the footer only
   * renders it when all three links are set.
   * Example: { name: "some ring", prev: "https://…", home: "https://…", next: "https://…" }
   */
  webring: null as null | { name: string; prev: string; home: string; next: string },
} as const;
