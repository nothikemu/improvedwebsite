import { NextResponse } from 'next/server';
import { getRecentTracks } from '@/lib/lastfm';

export async function GET() {
  try {
    const tracks = await getRecentTracks(20);
    return NextResponse.json(tracks);
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tracks' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 30;
