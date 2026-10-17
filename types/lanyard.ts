export type DiscordStatus = 'online' | 'idle' | 'dnd' | 'offline';

export interface LanyardData {
  discord_user: {
    id: string;
    username: string;
    avatar: string | null;
    discriminator: string;
    bot: boolean;
    global_name: string | null;
    avatar_decoration_data: {
      asset: string;
      sku_id: string;
    } | null;
    display_name: string | null;
    public_flags: number;
    banner?: string | null;
    banner_color?: string | null;
  };
  discord_status: DiscordStatus;
  activities: Array<{
    id: string;
    name: string;
    type: number;
    state?: string;
    details?: string;
    timestamps?: {
      start?: number;
      end?: number;
    };
    assets?: {
      large_image?: string;
      large_text?: string;
      small_image?: string;
      small_text?: string;
    };
    application_id?: string;
    created_at: number;
  }>;
  spotify: {
    track_id: string;
    timestamps: {
      start: number;
      end: number;
    };
    song: string;
    artist: string;
    album_art_url: string;
    album: string;
  } | null;
  listening_to_spotify: boolean;
  kv: Record<string, string>;
  active_on_discord_web: boolean;
  active_on_discord_desktop: boolean;
  active_on_discord_mobile: boolean;
}

export interface LanyardResponse {
  success: boolean;
  data: LanyardData;
}
