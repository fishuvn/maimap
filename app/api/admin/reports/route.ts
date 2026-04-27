import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

function requireMod(s: any) { return s && (s.role === 'moderator' || s.role === 'admin'); }

export async function GET(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!requireMod(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const db = getDb();
  const reports = db.prepare(`SELECT r.*, u.username as reporter_username, ru.username as resolved_by_username FROM reports r JOIN users u ON r.reporter_id = u.id LEFT JOIN users ru ON r.resolved_by = ru.id ORDER BY r.created_at DESC`).all();
  return NextResponse.json({ reports });
}
