import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { action, role } = await req.json();
  const db = getDb();
  if (action === 'ban') db.prepare('UPDATE users SET is_banned = 1 WHERE id = ?').run(id);
  else if (action === 'unban') db.prepare('UPDATE users SET is_banned = 0 WHERE id = ?').run(id);
  else if (action === 'setRole' && role) {
    if (!['user', 'moderator', 'admin'].includes(role)) return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);
  }
  const user = db.prepare('SELECT id, username, email, role, is_banned FROM users WHERE id = ?').get(id);
  return NextResponse.json({ user });
}
