import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!session || (session.role !== 'moderator' && session.role !== 'admin')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const db = getDb();
  const totalUsers = (db.prepare('SELECT COUNT(*) as c FROM users').get() as any).c;
  const totalLocations = (db.prepare('SELECT COUNT(*) as c FROM locations').get() as any).c;
  const verifiedLocations = (db.prepare('SELECT COUNT(*) as c FROM locations WHERE is_verified = 1').get() as any).c;
  const pendingPosts = (db.prepare("SELECT COUNT(*) as c FROM posts WHERE status = 'pending'").get() as any).c;
  const pendingComments = (db.prepare("SELECT COUNT(*) as c FROM comments WHERE status = 'pending'").get() as any).c;
  const openReports = (db.prepare("SELECT COUNT(*) as c FROM reports WHERE status = 'open'").get() as any).c;
  return NextResponse.json({ stats: { totalUsers, totalLocations, verifiedLocations, pendingPosts, pendingComments, openReports } });
}
