# Database

Neon Postgres. Single table: `entries`.

## Table: `entries`

```sql
CREATE TABLE IF NOT EXISTS entries (
  id              SERIAL PRIMARY KEY,
  tracking_id     TEXT,
  spoc_name       TEXT NOT NULL,
  subject         TEXT,
  category        TEXT,
  sub_category    TEXT,
  date            DATE,
  start_time      TEXT,
  end_time        TEXT,
  total_hours     TEXT,
  student_name    TEXT,
  details         TEXT,
  created_date    TIMESTAMPTZ,
  updated_date    TEXT,
  approval_status TEXT DEFAULT 'Pending',
  comment         TEXT,
  uploaded_file_name TEXT,
  approved_by     TEXT,
  ecode           TEXT,
  UNIQUE(tracking_id)
);
```

## Column Reference

| Column | Type | Nullable | Default | Purpose | Example Value |
|--------|------|----------|---------|---------|---------------|
| `id` | SERIAL | No | auto | Internal primary key, auto-increment | `1`, `42` |
| `tracking_id` | TEXT | Yes | — | Human-readable unique ID from the source system (prefixed with `AOS-` in UI) | `"12345"` → displayed as `"AOS-12345"` |
| `spoc_name` | TEXT | **No** | — | Full name of the faculty member (SPOC = Single Point of Contact) | `"Vikram Bhatia"` |
| `subject` | TEXT | Yes | — | Topic or module name taught/mentored | `"Advanced Financial Reporting"` |
| `category` | TEXT | Yes | — | Activity type; one of four values (see below) | `"Face to Face class"` |
| `sub_category` | TEXT | Yes | — | Narrower classification within category | `"CPA Review Session"` |
| `date` | DATE | Yes | — | Date the activity took place | `"2026-03-15"` |
| `start_time` | TEXT | Yes | — | Activity start time (stored as text, not TIME) | `"09:00"` |
| `end_time` | TEXT | Yes | — | Activity end time (stored as text) | `"11:00"` |
| `total_hours` | TEXT | Yes | — | Duration as `H:MM` string; parsed to decimal hours in application code | `"2:00"`, `"1:30"` |
| `student_name` | TEXT | Yes | — | Student name (for mentoring entries) | `"Anita Sharma"` |
| `details` | TEXT | Yes | — | Free-text notes about the session | `"Covered MCQ strategies"` |
| `created_date` | TIMESTAMPTZ | Yes | — | When the entry record was created | `"2026-01-07T10:23:00+05:30"` |
| `updated_date` | TEXT | Yes | — | Last update timestamp (stored as text via `NOW()::text` in PATCH handler) | `"2026-05-14T08:00:00.000Z"` |
| `approval_status` | TEXT | Yes | `'Pending'` | Workflow state; one of `'Pending'`, `'Approved'`, `'Rejected'` | `"Pending"` |
| `comment` | TEXT | Yes | — | Reviewer comment attached to approval or rejection | `"Missing student count"` |
| `uploaded_file_name` | TEXT | Yes | — | Original filename of any supporting document | `"session-notes.pdf"` |
| `approved_by` | TEXT | Yes | — | Name of the reviewer who approved/rejected | `"Vikram Bhatia"` |
| `ecode` | TEXT | Yes | — | Employee code of the faculty member | `"E-1042"` |

## Valid `category` Values

| Value | UI Label | Color |
|-------|----------|-------|
| `"Face to Face class"` | `F2F` | Blue |
| `"Online class"` | `Online` | Emerald |
| `"Mentoring"` | `Mentoring` | Amber |
| `"Other academic work"` | `Other` | Purple |

## Indexes

| Index Name | Column | Purpose |
|------------|--------|---------|
| `idx_entries_spoc` | `spoc_name` | Filter/search by faculty name |
| `idx_entries_status` | `approval_status` | Filter pending/approved/rejected (most common filter) |
| `idx_entries_date` | `date` | Date-range queries for reports |
| `idx_entries_category` | `category` | Category filter on entries/approvals pages |

Plus the implicit `UNIQUE(tracking_id)` index and `PRIMARY KEY (id)`.

## Date Handling Notes

**`date` column** — stored as Postgres `DATE`. In the application layer this is serialised to ISO 8601 string `"YYYY-MM-DD"`. Pages format it for display via `new Date(s).toLocaleDateString('en-IN', ...)`.

**`created_date` column** — stored as `TIMESTAMPTZ` (timezone-aware). Used for "recent activity" sorting.

**`updated_date` column** — stored as `TEXT` rather than a proper timestamp type. The PATCH route writes `NOW()::text`, so the value is a full ISO timestamp string but lacks the type constraints of `TIMESTAMPTZ`. Consider migrating to `TIMESTAMPTZ` when the schema is next revised.

**`start_time` / `end_time`** — stored as `TEXT`, not Postgres `TIME`. Application code does not currently validate these values. Duration is derived from `total_hours`, not computed from start/end.

## Constraints

- `UNIQUE(tracking_id)` — prevents duplicate entries from the same source row.
- `spoc_name NOT NULL` — every entry must belong to a faculty member.
- `approval_status DEFAULT 'Pending'` — new entries start in the pending queue automatically.

## Schema File Location

`src/db/schema.sql` — run this once against your Neon project to create the table:

```bash
psql "$DATABASE_URL" -f src/db/schema.sql
```
