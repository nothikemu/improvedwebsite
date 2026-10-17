import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getStore } from '@/lib/store';

function isAdmin(secret: string | null): boolean {
  const expected = process.env.ADMIN_SECRET;
  // No ADMIN_SECRET configured means moderation is off, not open to everyone.
  if (!expected || !secret) return false;
  const a = Buffer.from(secret);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function DELETE(request: Request, { params }: RouteContext<'/api/messages/[id]'>) {
  try {
    const { id } = await params;

    if (!isAdmin(request.headers.get('x-admin-secret'))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deleted = await getStore().deleteMessage(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}
