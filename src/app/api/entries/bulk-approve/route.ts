import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/db/client';

export async function POST(req: NextRequest) {
  try {
    const { ids, approval_status, approved_by } = await req.json();
    if (!Array.isArray(ids) || !ids.length)
      return NextResponse.json({ error: 'ids required' }, { status: 400 });
    const rows = await sql`
      UPDATE entries
      SET approval_status = ${approval_status},
          approved_by     = ${approved_by ?? ''}
      WHERE id = ANY(${ids}::int[])
      RETURNING id, approval_status
    `;
    return NextResponse.json({ updated: rows.length });
  } catch (error) {
    console.error('[/api/entries/bulk-approve] error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
