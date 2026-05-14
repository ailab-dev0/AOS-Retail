import type { Entry } from '@/data/types';

const BASE = '/api';

function transformEntry(row: Record<string, unknown>): Entry {
  return {
    id: row.id as number,
    trackingID: (row.tracking_id ?? '') as string,
    SPOC_name: (row.spoc_name ?? '') as string,
    subject: row.subject as string | null,
    category: row.category as string | null,
    subCategory: row.sub_category as string | null,
    date: row.date as string | null,
    startTime: row.start_time as string | null,
    endTime: row.end_time as string | null,
    totalHours: row.total_hours as string | null,
    studentName: row.student_name as string | null,
    details: row.details as string | null,
    createdDate: row.created_date as string | null,
    updatedDate: row.updated_date as string | null,
    approvalStatus: (row.approval_status ?? 'Pending') as string,
    comment: row.comment as string | null,
    uploadedFileName: row.uploaded_file_name as string | null,
    approvedBy: row.approved_by as string | null,
    ecode: row.ecode as string | null,
  };
}

export async function fetchEntries(params?: {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.search) qs.set('search', params.search);
  if (params?.category && params.category !== 'All') qs.set('category', params.category);
  if (params?.status && params.status !== 'All') qs.set('status', params.status);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  const res = await fetch(`${BASE}/entries?${qs}`);
  if (!res.ok) throw new Error('Failed to fetch entries');
  const json = await res.json();
  return {
    data: (json.data as Record<string, unknown>[]).map(transformEntry),
    total: json.total as number,
    page: json.page as number,
    limit: json.limit as number,
  };
}

export async function fetchStats() {
  const res = await fetch(`${BASE}/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  const json = await res.json();
  return {
    ...json,
    recentActivity: (json.recentActivity as Record<string, unknown>[]).map(transformEntry),
  };
}

export async function fetchCategories(): Promise<string[]> {
  const res = await fetch(`${BASE}/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function updateEntry(
  id: number,
  data: { approval_status?: string; comment?: string; approved_by?: string }
): Promise<Entry> {
  const res = await fetch(`${BASE}/entries/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update entry');
  return res.json().then(transformEntry);
}

export async function bulkApproveEntries(
  ids: number[],
  approval_status: string,
  approved_by?: string
) {
  const res = await fetch(`${BASE}/entries/bulk-approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids, approval_status, approved_by }),
  });
  if (!res.ok) throw new Error('Failed to bulk update');
  return res.json();
}
