import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password)
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    if (user.is_banned) return NextResponse.json({ error: 'Your account has been banned' }, { status: 403 });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    const token = await signToken({ id: user.id, username: user.username, email: user.email, role: user.role, is_banned: user.is_banned });
    const response = NextResponse.json({ user: { id: user.id, username: user.username, email: user.email, role: user.role } });
    response.cookies.set('maimap_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' });
    return response;
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}
