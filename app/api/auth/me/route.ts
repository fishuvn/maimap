import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null });
  const db = getDb();
  const user = db.prepare('SELECT id, username, email, role, is_banned, avatar_url, bio, created_at FROM users WHERE id = ?').get(session.id) as any;
  if (!user || user.is_banned) return NextResponse.json({ user: null });
  return NextResponse.json({ user });
}
