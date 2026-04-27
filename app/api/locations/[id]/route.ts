import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const location = db.prepare(`SELECT l.*, u.username as verified_by_username FROM locations l LEFT JOIN users u ON l.verified_by = u.id WHERE l.id = ?`).get(id) as any;
  if (!location) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const posts = db.prepare(`SELECT p.*, u.username, u.role, u.avatar_url, (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id AND c.status = 'approved') as comment_count FROM posts p JOIN users u ON p.user_id = u.id WHERE p.location_id = ? AND p.status = 'approved' ORDER BY p.created_at DESC`).all(id);
  return NextResponse.json({ location, posts });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);
  if (!session || (session.role !== 'moderator' && session.role !== 'admin'))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json();
  const db = getDb();
  if (body.action === 'verify') {
    db.prepare("UPDATE locations SET is_verified = 1, verified_by = ?, verified_at = datetime('now') WHERE id = ?").run(session.id, id);
  } else if (body.action === 'unverify') {
    db.prepare('UPDATE locations SET is_verified = 0, verified_by = NULL, verified_at = NULL WHERE id = ?').run(id);
  } else {
    const { name, address, lat, lng, country } = body;
    db.prepare('UPDATE locations SET name = ?, address = ?, lat = ?, lng = ?, country = ? WHERE id = ?').run(name, address, lat, lng, country, id);
  }
  const location = db.prepare('SELECT * FROM locations WHERE id = ?').get(id);
  return NextResponse.json({ location });
}
