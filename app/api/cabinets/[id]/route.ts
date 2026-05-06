import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

// PATCH /api/cabinets/[id] — update cabinet (admin/mod)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);
  if (!session || (session.role !== 'moderator' && session.role !== 'admin'))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { token_cost, status } = await req.json();
  const db = getDb();
  db.prepare('UPDATE cabinets SET token_cost = COALESCE(?, token_cost), status = COALESCE(?, status) WHERE id = ?')
    .run(token_cost ?? null, status ?? null, id);
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
