import { NextResponse } from 'next/server';
import { sql } from '@/db/client';

export async function GET() {
  try {
  const [totals, byCategory, byMonth, recent, byFaculty, thisWeek] = await Promise.all([
    sql`SELECT
      COUNT(*)::int                                                        AS total,
      COUNT(*) FILTER (WHERE approval_status = 'Approved')::int           AS approved,
      COUNT(*) FILTER (WHERE approval_status = 'Pending')::int            AS pending,
      COUNT(*) FILTER (WHERE approval_status = 'Rejected')::int           AS rejected
    FROM entries`,

    sql`SELECT category,
      COUNT(*)::int                                                        AS count,
      COUNT(*) FILTER (WHERE approval_status = 'Approved')::int           AS approved,
      COUNT(*) FILTER (WHERE approval_status = 'Pending')::int            AS pending
    FROM entries WHERE category IS NOT NULL
    GROUP BY category ORDER BY count DESC`,

    sql`SELECT
      TO_CHAR(date, 'Mon')           AS month,
      EXTRACT(MONTH FROM date)::int  AS month_num,
      COUNT(*)::int                  AS count,
      COUNT(*) FILTER (WHERE approval_status = 'Approved')::int AS approved,
      COUNT(*) FILTER (WHERE approval_status = 'Pending')::int  AS pending,
      COUNT(*) FILTER (WHERE approval_status = 'Rejected')::int AS rejected
    FROM entries WHERE date IS NOT NULL
    GROUP BY TO_CHAR(date, 'Mon'), EXTRACT(MONTH FROM date)
    ORDER BY month_num`,

    sql`SELECT * FROM entries ORDER BY created_date DESC NULLS LAST LIMIT 8`,

    sql`SELECT spoc_name AS name,
      COUNT(*)::int AS entries,
      ROUND(SUM(
        CASE WHEN total_hours ~ '^[0-9]+:[0-9]+'
          THEN EXTRACT(HOUR  FROM total_hours::interval)
             + EXTRACT(MINUTE FROM total_hours::interval) / 60.0
          ELSE 0 END
      )::numeric, 1) AS hours
    FROM entries GROUP BY spoc_name ORDER BY hours DESC LIMIT 10`,

    sql`SELECT
      COUNT(*)::int                                                        AS entries,
      COUNT(*) FILTER (WHERE approval_status = 'Approved')::int           AS approved,
      COUNT(*) FILTER (WHERE approval_status = 'Pending')::int            AS pending,
      COUNT(DISTINCT spoc_name)::int                                       AS faculty
    FROM entries WHERE date >= CURRENT_DATE - INTERVAL '7 days'`,
  ]);

  const t = totals[0] as { total: number; approved: number; pending: number; rejected: number };
  return NextResponse.json({
    ...t,
    approvalRate: t.total > 0 ? Math.round((t.approved / t.total) * 100) : 0,
    byCategory,
    byMonth,
    recentActivity: recent,
    hoursByFaculty: byFaculty,
    thisWeek: thisWeek[0],
  });
  } catch (error) {
    console.error('[/api/stats] error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
