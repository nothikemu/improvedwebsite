/**
 * Everything personal on the site lives in this file. Components read from it
 * and contain no personal copy of their own.
 *
 * Anything marked PLACEHOLDER is a slot the original layout fills that Hikemu
 * hasn't provided yet. Placeholders render as clearly labelled stand-ins and
 * never as made-up details; swap in the real thing whenever it's ready.
 */

export type SocialIcon = 'github' | 'x' | 'discord' | 'osu' | 'steam';

export type SocialLink = {
  /** Tooltip text. */
  label: string;
  icon: SocialIcon;
  /** `null` renders a disabled, labelled placeholder button. */
  href: string | null;
};

export const site = {
  /** Shown on the profile card until (or if) live Discord data isn't available. */
  name: 'Hikemu',
  handle: 'nothikemu',

  /** <title>, meta description and link previews. */
  title: "hikemu's crib",
  description: 'welcome 2 my digital playground',
  keywords: ['hikemu', 'nothikemu', 'retro', 'y2k', 'personal website', 'music'],
  twitterCreator: '@nothikemu',

  /**
   * Discord user ID for the profile card: avatar, banner, avatar decoration,
   * display name and status all come from Discord through Lanyard. Lanyard only
   * reports users who have joined its Discord server (discord.gg/lanyard).
   * Overridable with the DISCORD_ID env var.
   */
  discordId: '1338171592882262088',

  /**
   * PLACEHOLDER: Hikemu's Last.fm username for the "Recently Played" window.
   * Set it here or with the LASTFM_USERNAME env var (plus LASTFM_API_KEY).
   * Until both are set, the window shows its "No recent tracks found" state.
   */
  lastfmUsername: null as string | null,

  /** Status bar of the music window. */
  musicLibraryLabel: "hikemu's music library",

  /** The "About Me - Notepad" window. */
  about: {
    text: "Hi, I'm Hikemu, usually found online as nothikemu. I like computers more than is probably normal, along with code, music, games, robots, and the odd corners of the internet. This is where I keep what I make and what I'm into.",
    interests:
      'programming, computers, hardware, robotics, music, games, internet culture, and experimental software.',
  },

  /** Icon buttons under the name, in display order. */
  socials: [
    { label: 'GitHub', icon: 'github', href: 'https://github.com/nothikemu' },
    { label: 'X', icon: 'x', href: 'https://x.com/nothikemu' },
    { label: 'Discord', icon: 'discord', href: 'https://discord.com/users/1338171592882262088' },
    // PLACEHOLDER: the original links an osu! profile here. Add Hikemu's, or delete the entry.
    { label: 'osu!', icon: 'osu', href: null },
    // PLACEHOLDER: the original links a Steam profile here. Add Hikemu's, or delete the entry.
    { label: 'Steam', icon: 'steam', href: null },
  ] satisfies SocialLink[] as SocialLink[],

  images: {
    /**
     * PLACEHOLDER: banner shown when the Discord profile has no banner of its own.
     * Replace the file (any image; it's cropped to the card's width) or point
     * this at a new one in /public.
     */
    bannerFallback: '/placeholders/banner.svg',
    /**
     * PLACEHOLDER: the character art that sits in the profile card's bottom-right
     * corner. Use a transparent PNG at a 7:9 aspect ratio (the original was 420x540).
     */
    character: {
      src: '/placeholders/character.svg',
      alt: 'Character art placeholder',
    },
  },
};
