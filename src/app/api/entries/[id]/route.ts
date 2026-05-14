import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/db/client';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const rows = await sql`SELECT * FROM entries WHERE id = ${id}`;
    if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('[/api/entries/:id GET] error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { approval_status, comment, approved_by } = await req.json();
    const rows = await sql`
      UPDATE entries
      SET approval_status = ${approval_status},
          comment        = ${comment ?? ''},
          approved_by    = ${approved_by ?? ''},
          updated_date   = NOW()::text
      WHERE id = ${id}
      RETURNING *
    `;
    if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('[/api/entries/:id PATCH] error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
