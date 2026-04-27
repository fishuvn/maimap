import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!session || (session.role !== 'moderator' && session.role !== 'admin')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const db = getDb();
  const pendingPosts = db.prepare(`SELECT p.*, u.username, l.name as location_name FROM posts p JOIN users u ON p.user_id = u.id JOIN locations l ON p.location_id = l.id WHERE p.status = 'pending' ORDER BY p.created_at ASC`).all();
  const pendingComments = db.prepare(`SELECT c.*, u.username, l.name as location_name, p.title as post_title FROM comments c JOIN users u ON c.user_id = u.id LEFT JOIN locations l ON c.location_id = l.id LEFT JOIN posts p ON c.post_id = p.id WHERE c.status = 'pending' ORDER BY c.created_at ASC`).all();
  return NextResponse.json({ pendingPosts, pendingComments });
}
