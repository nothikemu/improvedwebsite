import { NextResponse } from 'next/server';
import { getStore, hashVisitor } from '@/lib/store';

// Counts unique visitors (by salted IP hash).
export async function GET(request: Request) {
  try {
    const count = await getStore().recordVisit(hashVisitor(request));
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Visitor count error:', error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
