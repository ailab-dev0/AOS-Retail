# API Routes

All routes live under `src/app/api/`. They are Next.js App Router route handlers backed by Neon Postgres via `src/db/client.ts`.

**Important:** These routes are fully functional but the UI pages currently read from static JSON, not these endpoints. See [data-layer.md](data-layer.md).

---

## GET /api/entries

List entries with optional filtering and pagination.

**File:** `src/app/api/entries/route.ts`

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `search` | string | `""` | Case-insensitive ILIKE match against `spoc_name`, `subject`, or `tracking_id` |
| `category` | string | `""` | Exact match on `category` column; pass `"All"` or omit to skip |
| `status` | string | `""` | Exact match on `approval_status`; pass `"All"` or omit to skip |
| `page` | integer | `1` | 1-based page number; minimum 1 |
| `limit` | integer | `50` | Rows per page; capped at 200 |

### Response — 200 OK

```json
{
  "data": [
    {
      "id": 1,
      "tracking_id": "12345",
      "spoc_name": "Vikram Bhatia",
      "subject": "Advanced Financial Reporting",
      "category": "Face to Face class",
      "sub_category": "CPA Review",
      "date": "2026-03-15",
      "start_time": "09:00",
      "end_time": "11:00",
      "total_hours": "2:00",
      "student_name": null,
      "details": null,
      "created_date": "2026-01-07T04:53:00.000Z",
      "updated_date": null,
      "approval_status": "Pending",
      "comment": null,
      "uploaded_file_name": null,
      "approved_by": null,
      "ecode": "E-1042"
    }
  ],
  "total": 312,
  "page": 1,
  "limit": 50
}
```

| Field | Type | Description |
|-------|------|-------------|
| `data` | Entry[] | Array of entry rows; max `limit` items |
| `total` | integer | Total matching rows (for pagination) |
| `page` | integer | Current page echoed back |
| `limit` | integer | Page size echoed back |

### SQL Executed

Two queries in parallel:
1. `SELECT * FROM entries [WHERE …] ORDER BY created_date DESC NULLS LAST LIMIT $n OFFSET $m`
2. `SELECT COUNT(*)::int as total FROM entries [WHERE …]`

---

## GET /api/entries/[id]

Fetch a single entry by its integer primary key.

**File:** `src/app/api/entries/[id]/route.ts`

### Path Parameters

| Param | Type | Description |
|-------|------|-------------|
| `id` | integer | Database `id` column (not `tracking_id`) |

### Response — 200 OK

Single `Entry` object (same shape as one element of `data` array above).

### Response — 404 Not Found

```json
{ "error": "Not found" }
```

---

## PATCH /api/entries/[id]

Update the approval status (and optional comment / approver) of a single entry.

**File:** `src/app/api/entries/[id]/route.ts`

### Path Parameters

| Param | Type | Description |
|-------|------|-------------|
| `id` | integer | Database `id` column |

### Request Body

```json
{
  "approval_status": "Approved",
  "comment": "Looks good",
  "approved_by": "Vikram Bhatia"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `approval_status` | string | **Yes** | New status: `"Approved"`, `"Rejected"`, or `"Pending"` |
| `comment` | string | No | Reviewer note; defaults to `""` if omitted |
| `approved_by` | string | No | Reviewer name; defaults to `""` if omitted |

### Response — 200 OK

Updated entry object (same shape as GET single).

### Response — 404 Not Found

```json
{ "error": "Not found" }
```

### SQL Executed

```sql
UPDATE entries
SET approval_status = $1,
    comment         = $2,
    approved_by     = $3,
    updated_date    = NOW()::text
WHERE id = $4
RETURNING *
```

---

## POST /api/entries/bulk-approve

Bulk-update `approval_status` for multiple entries at once.

**File:** `src/app/api/entries/bulk-approve/route.ts`

### Request Body

```json
{
  "ids": [1, 2, 5, 18],
  "approval_status": "Approved",
  "approved_by": "Vikram Bhatia"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ids` | integer[] | **Yes** | Array of database `id` values to update; must be non-empty |
| `approval_status` | string | **Yes** | Target status for all matching rows |
| `approved_by` | string | No | Reviewer name; defaults to `""` if omitted |

### Response — 200 OK

```json
{ "updated": 4 }
```

| Field | Type | Description |
|-------|------|-------------|
| `updated` | integer | Number of rows actually updated |

### Response — 400 Bad Request

```json
{ "error": "ids required" }
```

Returned when `ids` is missing, not an array, or empty.

### SQL Executed

```sql
UPDATE entries
SET approval_status = $1,
    approved_by     = $2
WHERE id = ANY($3::int[])
RETURNING id, approval_status
```

---

## Error Conventions

| HTTP Status | Meaning |
|-------------|---------|
| 200 | Success |
| 400 | Malformed request body (e.g. missing required fields) |
| 404 | Row not found for given `id` |
| 500 | Unhandled Neon/DB error (bubbles as Next.js default 500) |

No authentication middleware is currently applied to any route.
