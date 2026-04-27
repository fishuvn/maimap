import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const db = getDb();
  const users = db.prepare(`SELECT id, username, email, role, is_banned, created_at, (SELECT COUNT(*) FROM posts WHERE user_id = users.id) as post_count, (SELECT COUNT(*) FROM comments WHERE user_id = users.id) as comment_count FROM users WHERE username LIKE ? OR email LIKE ? ORDER BY created_at DESC`).all(`%${search}%`, `%${search}%`);
  return NextResponse.json({ users });
}
