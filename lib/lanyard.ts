import { DiscordStatus, LanyardResponse } from '@/types/lanyard';

export async function getLanyardData(userId: string): Promise<LanyardResponse> {
  const response = await fetch(`https://api.lanyard.rest/v1/users/${encodeURIComponent(userId)}`, {
    next: { revalidate: 10 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Lanyard data (${response.status})`);
  }

  return response.json();
}

export function getDiscordAvatarUrl(userId: string, avatarHash: string, size: number = 128): string {
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${avatarHash.startsWith('a_') ? 'gif' : 'png'}?size=${size}`;
}

export function getAvatarDecorationUrl(asset: string): string {
  return `https://cdn.discordapp.com/avatar-decoration-presets/${asset}.png`;
}

export function getDiscordBannerUrl(userId: string, bannerHash: string, size: number = 600): string {
  return `https://cdn.discordapp.com/banners/${userId}/${bannerHash}.${bannerHash.startsWith('a_') ? 'gif' : 'png'}?size=${size}`;
}

export function getStatusColor(status: DiscordStatus): string {
  const colors = {
    online: '#23a559',
    idle: '#f0b232',
    dnd: '#f23f43',
    offline: '#80848e',
  };
  return colors[status];
}

export function getStatusLabel(status: DiscordStatus): string {
  const labels = {
    online: 'Online',
    idle: 'Idle',
    dnd: 'Do Not Disturb',
    offline: 'Offline',
  };
  return labels[status];
}
