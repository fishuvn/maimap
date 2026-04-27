import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { getSession, signToken } from '@/lib/auth';

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { username, email, bio, currentPassword, newPassword } = await req.json();
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(session.id) as any;
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // If changing password, require current password
    if (newPassword) {
      if (!currentPassword) return NextResponse.json({ error: 'Current password required' }, { status: 400 });
      const valid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      if (newPassword.length < 6) return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
    }

    // Check username/email uniqueness (excluding self)
    if (username && username !== user.username) {
      const taken = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(username, session.id);
      if (taken) return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
    }
    if (email && email !== user.email) {
      const taken = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, session.id);
      if (taken) return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    const newHash = newPassword ? await bcrypt.hash(newPassword, 10) : user.password_hash;
    db.prepare('UPDATE users SET username = ?, email = ?, bio = ?, password_hash = ? WHERE id = ?').run(
      username || user.username,
      email || user.email,
      bio ?? user.bio,
      newHash,
      session.id
    );

    // Re-issue token with updated info
    const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(session.id) as any;
    const token = await signToken({ id: updated.id, username: updated.username, email: updated.email, role: updated.role, is_banned: updated.is_banned });
    const response = NextResponse.json({ success: true, user: { id: updated.id, username: updated.username, email: updated.email, role: updated.role } });
    response.cookies.set('maimap_token', token, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' });
    return response;
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}
