import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const comments = db.prepare(`SELECT c.*, u.username, u.role, u.avatar_url FROM comments c JOIN users u ON c.user_id = u.id WHERE c.post_id = ? AND c.status = 'approved' AND c.parent_id IS NULL ORDER BY c.created_at ASC`).all(id) as any[];
  const withReplies = comments.map((comment) => ({
    ...comment,
    replies: db.prepare(`SELECT c.*, u.username, u.role, u.avatar_url FROM comments c JOIN users u ON c.user_id = u.id WHERE c.parent_id = ? AND c.status = 'approved' ORDER BY c.created_at ASC`).all(comment.id),
  }));
  return NextResponse.json({ comments: withReplies });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.is_banned) return NextResponse.json({ error: 'Account banned' }, { status: 403 });
  const { body, parent_id, location_id } = await req.json();
  if (!body?.trim()) return NextResponse.json({ error: 'Comment body required' }, { status: 400 });
  const db = getDb();
  const setting = db.prepare('SELECT value FROM site_settings WHERE key = ?').get('require_comment_approval') as any;
  const status = setting?.value === 'false' ? 'approved' : 'pending';
  const result = db.prepare('INSERT INTO comments (post_id, location_id, parent_id, user_id, body, status) VALUES (?, ?, ?, ?, ?, ?)').run(id, location_id || null, parent_id || null, session.id, body.trim(), status);
  const comment = db.prepare('SELECT c.*, u.username FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = ?').get(result.lastInsertRowid);
  return NextResponse.json({ comment, pending: status === 'pending' }, { status: 201 });
}
