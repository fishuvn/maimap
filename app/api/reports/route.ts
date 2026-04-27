import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.is_banned) return NextResponse.json({ error: 'Account banned' }, { status: 403 });
  const { target_type, target_id, reason } = await req.json();
  if (!target_type || !target_id || !reason?.trim()) return NextResponse.json({ error: 'All fields required' }, { status: 400 });
  const db = getDb();
  const existing = db.prepare("SELECT id FROM reports WHERE reporter_id = ? AND target_type = ? AND target_id = ? AND status = 'open'").get(session.id, target_type, target_id);
  if (existing) return NextResponse.json({ error: 'You have already reported this content' }, { status: 409 });
  const result = db.prepare('INSERT INTO reports (reporter_id, target_type, target_id, reason) VALUES (?, ?, ?, ?)').run(session.id, target_type, target_id, reason.trim());
  return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 });
}
