import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/db/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(200, parseInt(searchParams.get('limit') || '50'));
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: unknown[] = [];
    let pi = 1;

    if (search) {
      conditions.push(`(spoc_name ILIKE $${pi} OR subject ILIKE $${pi} OR tracking_id ILIKE $${pi})`);
      params.push(`%${search}%`); pi++;
    }
    if (category && category !== 'All') {
      conditions.push(`category = $${pi}`); params.push(category); pi++;
    }
    if (status && status !== 'All') {
      conditions.push(`approval_status = $${pi}`); params.push(status); pi++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [dataRows, countRows] = await Promise.all([
      sql.query(`SELECT * FROM entries ${where} ORDER BY created_date DESC NULLS LAST LIMIT $${pi} OFFSET $${pi + 1}`, [...params, limit, offset]),
      sql.query(`SELECT COUNT(*)::int as total FROM entries ${where}`, params),
    ]);

    return NextResponse.json({
      data: dataRows,
      total: (countRows[0] as { total: number }).total,
      page,
      limit,
    });
  } catch (error) {
    console.error('[/api/entries] error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
