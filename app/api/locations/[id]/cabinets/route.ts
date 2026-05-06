import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const cabinets = db.prepare(`
    SELECT c.*,
      ROUND(AVG(r.score), 1) as avg_rating,
      COUNT(r.id) as rating_count
    FROM cabinets c
    LEFT JOIN cabinet_ratings r ON r.cabinet_id = c.id
    WHERE c.location_id = ?
    GROUP BY c.id
    ORDER BY c.number ASC
  `).all(id);
  return NextResponse.json({ cabinets });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);
  if (!session || (session.role !== 'moderator' && session.role !== 'admin'))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { number, token_cost, status } = await req.json();
  if (!number) return NextResponse.json({ error: 'Cabinet number required' }, { status: 400 });
  const db = getDb();
  try {
    const result = db.prepare(
      'INSERT INTO cabinets (location_id, number, token_cost, status) VALUES (?, ?, ?, ?)'
    ).run(id, number, token_cost ?? 7, status ?? 'unknown');
    const cabinet = db.prepare('SELECT * FROM cabinets WHERE id = ?').get(result.lastInsertRowid);
    return NextResponse.json({ cabinet });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
