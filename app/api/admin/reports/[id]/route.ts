import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);
  if (!session || (session.role !== 'moderator' && session.role !== 'admin')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { action } = await req.json();
  const db = getDb();
  db.prepare("UPDATE reports SET status = ?, resolved_by = ?, resolved_at = datetime('now') WHERE id = ?").run(action === 'resolve' ? 'resolved' : 'dismissed', session.id, id);
  return NextResponse.json({ success: true });
}
