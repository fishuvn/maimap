import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);
  if (!session || (session.role !== 'moderator' && session.role !== 'admin')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { action } = await req.json();
  const db = getDb();
  db.prepare('UPDATE posts SET status = ? WHERE id = ?').run(action === 'approve' ? 'approved' : 'hidden', id);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);
  if (!session || (session.role !== 'moderator' && session.role !== 'admin')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const db = getDb();
  db.prepare('DELETE FROM comments WHERE post_id = ?').run(id);
  db.prepare('DELETE FROM posts WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
