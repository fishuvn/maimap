import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();
    if (!username || !email || !password)
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    if (username.length < 3)
      return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 });
    if (password.length < 6)
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    const db = getDb();
    const setting = db.prepare('SELECT value FROM site_settings WHERE key = ?').get('allow_registration') as any;
    if (setting?.value === 'false')
      return NextResponse.json({ error: 'Registration is currently disabled' }, { status: 403 });
    const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
    if (existing)
      return NextResponse.json({ error: 'Username or email already taken' }, { status: 409 });
    const hash = await bcrypt.hash(password, 10);
    const result = db.prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)').run(username, email.toLowerCase(), hash);
    const user = db.prepare('SELECT id, username, email, role, is_banned FROM users WHERE id = ?').get(result.lastInsertRowid) as any;
    const token = await signToken(user);
    const response = NextResponse.json({ user }, { status: 201 });
    response.cookies.set('maimap_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' });
    return response;
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}
