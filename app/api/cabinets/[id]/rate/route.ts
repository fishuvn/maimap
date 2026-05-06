import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

// POST /api/cabinets/[id]/rate — submit or update a rating (1-5)
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Login to rate' }, { status: 401 });
  const { score } = await req.json();
  if (!score || score < 1 || score > 5)
    return NextResponse.json({ error: 'Score must be 1–5' }, { status: 400 });
  const db = getDb();
  // Upsert — update if already rated, insert if not
  db.prepare(`
    INSERT INTO cabinet_ratings (cabinet_id, user_id, score)
    VALUES (?, ?, ?)
    ON CONFLICT(cabinet_id, user_id) DO UPDATE SET score = excluded.score, created_at = datetime('now')
  `).run(id, session.id, score);
  // Return updated stats
  const stats = db.prepare(`
    SELECT ROUND(AVG(score), 1) as avg_rating, COUNT(*) as rating_count
    FROM cabinet_ratings WHERE cabinet_id = ?
  `).get(id) as any;
  // Return the user's own current rating
  const mine = db.prepare('SELECT score FROM cabinet_ratings WHERE cabinet_id = ? AND user_id = ?').get(id, session.id) as any;
  return NextResponse.json({ avg_rating: stats.avg_rating, rating_count: stats.rating_count, my_score: mine?.score });
}

// GET /api/cabinets/[id]/rate — get user's existing rating
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ my_score: null });
  const db = getDb();
  const mine = db.prepare('SELECT score FROM cabinet_ratings WHERE cabinet_id = ? AND user_id = ?').get(id, session.id) as any;
  return NextResponse.json({ my_score: mine?.score ?? null });
}
