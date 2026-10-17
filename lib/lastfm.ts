import { site } from '@/data/site';
import { LastFmResponse, Track } from '@/types/lastfm';

const LASTFM_API_KEY = process.env.LASTFM_API_KEY || '';
const LASTFM_USERNAME = process.env.LASTFM_USERNAME || site.lastfmUsername || '';

export async function getRecentTracks(limit: number = 10): Promise<Track[]> {
  if (!LASTFM_API_KEY || !LASTFM_USERNAME) {
    console.error('Last.fm API key or username not configured');
    return [];
  }

  try {
    const url = new URL('https://ws.audioscrobbler.com/2.0/');
    url.searchParams.append('method', 'user.getrecenttracks');
    url.searchParams.append('user', LASTFM_USERNAME);
    url.searchParams.append('api_key', LASTFM_API_KEY);
    url.searchParams.append('format', 'json');
    url.searchParams.append('limit', limit.toString());

    const response = await fetch(url.toString(), {
      next: { revalidate: 30 } // Revalidate every 30 seconds
    });

    if (!response.ok) {
      throw new Error(`Last.fm API error: ${response.status}`);
    }

    const data: LastFmResponse = await response.json();

    if (!data.recenttracks || !data.recenttracks.track) {
      return [];
    }

    const tracks = Array.isArray(data.recenttracks.track)
      ? data.recenttracks.track
      : [data.recenttracks.track];

    return tracks.map((track) => ({
      name: track.name,
      artist: track.artist['#text'],
      album: track.album?.['#text'],
      url: track.url,
      image: track.image.find((img) => img.size === 'large')?.['#text'] || '',
      timestamp: track.date?.uts,
      isNowPlaying: track['@attr']?.nowplaying === 'true',
    }));
  } catch (error) {
    console.error('Error fetching Last.fm tracks:', error);
    return [];
  }
}
