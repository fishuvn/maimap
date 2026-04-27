import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const country = url.searchParams.get('country');
  const search = url.searchParams.get('search');
  const verified = url.searchParams.get('verified');
  const db = getDb();
  let query = `SELECT l.*, u.username as verified_by_username,
      (SELECT COUNT(*) FROM posts p WHERE p.location_id = l.id AND p.status = 'approved') as post_count
    FROM locations l LEFT JOIN users u ON l.verified_by = u.id WHERE 1=1`;
  const params: any[] = [];
  if (country) { query += ' AND l.country = ?'; params.push(country); }
  if (search) { query += ' AND (l.name LIKE ? OR l.address LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  if (verified === 'true') { query += ' AND l.is_verified = 1'; }
  query += ' ORDER BY l.name ASC';
  const locations = db.prepare(query).all(...params);
  const countries = (db.prepare('SELECT DISTINCT country FROM locations ORDER BY country').all() as any[]).map(r => r.country);
  return NextResponse.json({ locations, countries });
}
