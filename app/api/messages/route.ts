import { NextResponse } from 'next/server';
import { getStore, hashVisitor } from '@/lib/store';

const COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes between posts per visitor
const MAX_AUTHOR = 20;
const MAX_CONTENT = 200;

export async function GET() {
  try {
    const messages = await getStore().listMessages(100);
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const author = typeof body.author === 'string' ? body.author.trim().slice(0, MAX_AUTHOR) : '';
    const content = typeof body.content === 'string' ? body.content.trim() : '';

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const store = getStore();
    const visitor = hashVisitor(request);
    const now = Date.now();

    const lastPost = await store.getLastPost(visitor);
    if (lastPost !== null) {
      const timeSinceLastPost = now - lastPost;
      if (timeSinceLastPost < COOLDOWN_MS) {
        const minutes = Math.ceil((COOLDOWN_MS - timeSinceLastPost) / 60000);
        return NextResponse.json(
          { error: `Please wait ${minutes} minute(s) before posting again` },
          { status: 429 }
        );
      }
    }

    const message = {
      id: now.toString() + Math.random().toString(36).slice(2, 11),
      author: author || 'Anonymous',
      content: content.slice(0, MAX_CONTENT),
      timestamp: now,
      likes: 0,
    };

    await store.addMessage(message);
    await store.setLastPost(visitor, now, COOLDOWN_MS);

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error('Error posting message:', error);
    return NextResponse.json({ error: 'Failed to post message' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
