import { NextResponse } from 'next/server';
import { sql } from '@/db/client';

export async function GET() {
  try {
    const rows = await sql`
      SELECT DISTINCT category FROM entries
      WHERE category IS NOT NULL ORDER BY category
    `;
    return NextResponse.json(rows.map((r) => (r as { category: string }).category));
  } catch (error) {
    console.error('[/api/categories] error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
