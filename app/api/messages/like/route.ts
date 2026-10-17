import { NextResponse } from 'next/server';
import { getStore } from '@/lib/store';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { messageId } = body;

    if (!messageId || typeof messageId !== 'string') {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    const likes = await getStore().likeMessage(messageId);
    if (likes === null) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, likes });
  } catch (error) {
    console.error('Error liking message:', error);
    return NextResponse.json({ error: 'Failed to like message' }, { status: 500 });
  }
}
