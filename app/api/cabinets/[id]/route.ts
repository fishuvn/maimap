import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

// PATCH /api/cabinets/[id] — update cabinet status, note, payment_type, cost (admin/mod)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);
  if (!session || (session.role !== 'moderator' && session.role !== 'admin'))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { status, status_note, payment_type, cost } = await req.json();
  const db = getDb();
  db.prepare(`
    UPDATE cabinets SET
      status = COALESCE(?, status),
      status_note = ?,
      payment_type = COALESCE(?, payment_type),
      cost = COALESCE(?, cost)
    WHERE id = ?
  `).run(status ?? null, status_note ?? null, payment_type ?? null, cost ?? null, id);
  const cabinet = db.prepare('SELECT * FROM cabinets WHERE id = ?').get(id);
  return NextResponse.json({ cabinet });
}

// DELETE /api/cabinets/[id] — remove cabinet (admin/mod)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);
  if (!session || (session.role !== 'moderator' && session.role !== 'admin'))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const db = getDb();
  db.prepare('DELETE FROM cabinets WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
