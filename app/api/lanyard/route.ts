import { NextResponse } from 'next/server';
import { site } from '@/data/site';
import { getLanyardData } from '@/lib/lanyard';

export async function GET() {
  const discordId = process.env.DISCORD_ID || site.discordId;

  try {
    const data = await getLanyardData(discordId);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Lanyard API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Discord status' },
      { status: 500 }
    );
  }
}
