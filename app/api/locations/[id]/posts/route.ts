import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const posts = db.prepare(`SELECT p.*, u.username, u.role, u.avatar_url, (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id AND c.status = 'approved') as comment_count FROM posts p JOIN users u ON p.user_id = u.id WHERE p.location_id = ? AND p.status = 'approved' ORDER BY p.created_at DESC`).all(id);
  return NextResponse.json({ posts });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.is_banned) return NextResponse.json({ error: 'Account banned' }, { status: 403 });
  const { title, body } = await req.json();
  if (!title?.trim() || !body?.trim()) return NextResponse.json({ error: 'Title and body required' }, { status: 400 });
  const db = getDb();
  const setting = db.prepare('SELECT value FROM site_settings WHERE key = ?').get('require_post_approval') as any;
  const status = setting?.value === 'false' ? 'approved' : 'pending';
  const result = db.prepare('INSERT INTO posts (location_id, user_id, title, body, status) VALUES (?, ?, ?, ?, ?)').run(id, session.id, title.trim(), body.trim(), status);
  const post = db.prepare('SELECT p.*, u.username FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id = ?').get(result.lastInsertRowid);
  return NextResponse.json({ post, pending: status === 'pending' }, { status: 201 });
}
