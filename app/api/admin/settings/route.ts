import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const db = getDb();
  const settings = db.prepare('SELECT key, value FROM site_settings').all() as { key: string; value: string }[];
  return NextResponse.json({ settings: Object.fromEntries(settings.map((s) => [s.key, s.value])) });
}

export async function PUT(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { settings } = await req.json();
  const db = getDb();
  const upsert = db.prepare('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)');
  db.transaction((s: Record<string, string>) => { for (const [key, value] of Object.entries(s)) upsert.run(key, value); })(settings);
  return NextResponse.json({ success: true });
}
