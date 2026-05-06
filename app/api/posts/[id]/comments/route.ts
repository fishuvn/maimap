import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  // Include guest_name for anonymous comments (no user_id)
  const comments = db.prepare(`
    SELECT c.*, u.username, u.role, u.avatar_url,
      COALESCE(u.username, c.guest_name, 'Guest') as display_name
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.post_id = ? AND c.status = 'approved' AND c.parent_id IS NULL
    ORDER BY c.created_at ASC
  `).all(id) as any[];
  const withReplies = comments.map((comment) => ({
    ...comment,
    replies: db.prepare(`
      SELECT c.*, u.username, u.role, u.avatar_url,
        COALESCE(u.username, c.guest_name, 'Guest') as display_name
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.parent_id = ? AND c.status = 'approved'
      ORDER BY c.created_at ASC
    `).all(comment.id),
  }));
  return NextResponse.json({ comments: withReplies });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);
  // Banned users can't comment
  if (session?.is_banned) return NextResponse.json({ error: 'Account banned' }, { status: 403 });

  const { body, parent_id, location_id, guest_name } = await req.json();
  if (!body?.trim()) return NextResponse.json({ error: 'Comment body required' }, { status: 400 });

  // Guest comments allowed — but need a name if not logged in
  const displayName = session ? null : (guest_name?.trim() || 'Guest');

  const db = getDb();
  // Comments are always auto-approved (open forum)
  const result = db.prepare(
    'INSERT INTO comments (post_id, location_id, parent_id, user_id, guest_name, body, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(id, location_id || null, parent_id || null, session?.id || null, displayName, body.trim(), 'approved');

  const comment = db.prepare(`
    SELECT c.*, u.username, u.role,
      COALESCE(u.username, c.guest_name, 'Guest') as display_name
    FROM comments c LEFT JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `).get(result.lastInsertRowid);
  return NextResponse.json({ comment }, { status: 201 });
}
