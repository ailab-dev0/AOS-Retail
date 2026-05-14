# Data Layer

## Current State: Hybrid

The app has two data paths that coexist without being connected:

| Path | Source | Who uses it |
|------|--------|-------------|
| **Static (active)** | `src/data/entries.json` via `src/lib/data.ts` | All page components |
| **Live (dormant)** | Neon Postgres via `src/app/api/` | No page component yet |

Pages call synchronous helpers from `src/lib/data.ts`. The API routes exist and are DB-backed but no `fetch()` calls point to them from the UI.

**Consequence:** Approval actions on the Approvals page mutate local React state only. Refreshing the page resets all changes.

---

## Static Data Helpers (`src/lib/data.ts`)

All functions read from `const ALL = entriesJson as Entry[]` — the full parsed JSON array in memory.

### Field name note

The static JSON uses **camelCase / PascalCase** field names that differ from the DB schema. Key mappings:

| JSON / lib usage | DB column |
|------------------|-----------|
| `trackingID` | `tracking_id` |
| `SPOC_name` | `spoc_name` |
| `approvalStatus` | `approval_status` |
| `totalHours` | `total_hours` |
| `createdDate` | `created_date` |
| `subCategory` | `sub_category` |

The `Entry` type in `src/data/types.ts` has been updated to use DB-style snake_case, but `src/lib/data.ts` and all page components still access the old camelCase fields from the JSON. TypeScript will surface errors here once pages are migrated.

---

### Function Reference

#### `getAllEntries(): Entry[]`
Returns the full unfiltered array. Use when you need everything.

#### `getFilteredEntries(f: Partial<FilterState>): Entry[]`
Filters by `search` (substring match on `SPOC_name`, `subject`, `trackingID`), `category`, and `status`. Pass `"All"` or omit a field to skip that filter.

#### `getPendingEntries(): Entry[]`
Shorthand for entries where `approvalStatus === 'Pending'`. Used by Dashboard Reminders card.

#### `getStats(): DashboardStats`
Returns `{ total, approved, pending, rejected, approvalRate }`. `approvalRate` is `Math.round((approved/total)*100)`.

#### `getEntriesOverTime(): MonthStats[]`
Returns one object per month Jan–May with `{ month, count, approved, pending, rejected }`.

#### `getEntriesByCategory(): { category: string; count: number }[]`
Count per category, sorted descending. Used in Reports page CategoryBarChart.

#### `getCategoryWithStatus(): { category: string; total: number; approved: number; pending: number }[]`
Per-category breakdown including approval breakdown. Used by CategoryBreakdown widget.

#### `getHoursByFaculty(): { name: string; hours: number }[]`
Top-10 faculty by total decimal hours. Rounds to 1 decimal place.

#### `getSubjectDistribution(): { subject: string; count: number }[]`
Top-8 subjects by frequency. Used in Reports SubjectPieChart.

#### `getCategoryByMonth(): { month: string; f2f: number; online: number; mentoring: number; other: number }[]`
Monthly series split by the four category types. Powers `EntriesLineChart` on Dashboard.

#### `getRecentActivity(n = 8): Entry[]`
Last `n` entries sorted by `createdDate` descending. Default 8; Dashboard passes 5.

#### `getThisWeekStats(): WeekStatsData`
Counts for the week 2026-05-01 to 2026-05-07. **Hardcoded date range** — will need updating or dynamic calculation.

#### `getWeeklyAnalytics(): { day: string; value: number; highlighted: boolean }[]`
7-element array (Sun–Sat) counting entries per day of week. Tuesday (`i === 2`) is always highlighted regardless of data.

#### `getFacultyActivity(): { name: string; initials: string; color: string; task: string; status }[]`
First 5 unique faculty names with initials, avatar color, latest category, and a **hardcoded status pool** (`['Completed','In Progress','Pending','In Progress','Completed']`). Status is not derived from real data.

#### `getTotalHours(): string`
Sums all entries and returns `"HH:MM:SS"` format. Displayed in the Time Tracker widget on Dashboard.

---

## Live Data Path (API routes — not yet used by UI)

### Database Client (`src/db/client.ts`)

```typescript
import { neon } from '@neondatabase/serverless';
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
export const sql = neon(process.env.DATABASE_URL!);
```

The `sql` export is a tagged-template-literal function. Use it as:
```typescript
const rows = await sql`SELECT * FROM entries WHERE id = ${id}`;
// or for dynamic queries:
const rows = await sql(`SELECT * FROM entries ${where}`, params);
```

The `@neondatabase/serverless` driver uses HTTP (not persistent TCP), making it safe in serverless/edge environments.

---

## Migration Guide: Static → Live

To connect a page to real database data, replace each `src/lib/data.ts` call with a `fetch` to the API:

### Example: Entries Page

**Before (static):**
```typescript
import { getFilteredEntries } from '@/lib/data';
// in component:
const data = getFilteredEntries({ search, category, status });
```

**After (live):**
```typescript
const [data, setData] = useState<Entry[]>([]);
useEffect(() => {
  const params = new URLSearchParams({ search, category, status, page: String(page) });
  fetch(`/api/entries?${params}`)
    .then(r => r.json())
    .then(({ data }) => setData(data));
}, [search, category, status, page]);
```

### Field name translation

After migrating, rename field accesses from camelCase to snake_case:

| Before | After |
|--------|-------|
| `e.trackingID` | `e.tracking_id` |
| `e.SPOC_name` | `e.spoc_name` |
| `e.approvalStatus` | `e.approval_status` |
| `e.totalHours` | `e.total_hours` |
| `e.createdDate` | `e.created_date` |
| `e.subCategory` | `e.sub_category` |

The `Entry` type in `src/data/types.ts` already uses snake_case — TypeScript will guide you.

### Migration checklist

- [ ] `src/app/page.tsx` — replace 7 `getXxx()` calls with `fetch('/api/entries?…')`
- [ ] `src/app/entries/page.tsx` — replace `entriesJson` import with API fetch
- [ ] `src/app/approvals/page.tsx` — replace `entriesJson` + wire `updateStatus` to `PATCH /api/entries/[id]`
- [ ] `src/app/reports/page.tsx` — replace `entriesJson` import with API fetch
- [ ] Update `src/lib/data.ts` helper signatures or delete once all pages are migrated
- [ ] Delete `src/data/entries.json` once DB is the source of truth
