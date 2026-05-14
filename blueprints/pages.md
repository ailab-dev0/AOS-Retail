# Pages

All pages are `'use client'` components wrapped inside `AppLayout` (Sidebar + Topbar).

---

## Dashboard — `/`

**File:** `src/app/page.tsx`

### Purpose
Overview of faculty activity: stats, weekly analytics, reminders (pending entries), recent entries, team collaboration, approval progress, time tracker, and entries-over-time line chart.

### Data Fetched
All data comes from synchronous `src/lib/data.ts` calls — no network requests.

| Call | Returns | Used by |
|------|---------|---------|
| `getStats()` | `DashboardStats` | StatCard ×4 |
| `getWeeklyAnalytics()` | `{ day, value, highlighted }[]` | WeeklyAnalytics bar chart |
| `getPendingEntries()` | `Entry[]` | RemindersCard |
| `getRecentActivity(5)` | `Entry[]` | RecentEntries list |
| `getFacultyActivity()` | faculty objects | TeamCollaboration list |
| `getTotalHours()` | `"HH:MM:SS"` string | TimeTracker |
| `getCategoryByMonth()` | monthly category series | EntriesLineChart |

### State Managed
No local state in `DashboardPage` itself. Child components (`ApprovalGauge`, stat cards) use `useState` + `useEffect` for entrance animations only.

### Layout (12-column grid)
```
[stat] [stat] [stat] [stat]              ← 4 equal cols
[WeeklyAnalytics:5] [Reminders:3] [RecentEntries:4]
[TeamCollab:5] [ApprovalGauge:3] [TimeTracker:4]
[EntriesLineChart: full width]
```

### Sub-components (all defined inline in page.tsx)
- `StatCard` — animated counter + icon + theme color
- `WeeklyAnalytics` — custom bar chart built with divs (not Recharts)
- `RemindersCard` — shows next pending entry or "All caught up"
- `RecentEntries` — last 5 entries with category color dots
- `TeamCollaboration` — first 5 faculty with avatar + status badge
- `ApprovalGauge` — SVG half-donut with animated fill
- `TimeTracker` — displays total hours; pause/stop buttons (decorative, not functional)

### Loading/Error
No loading states — data is synchronous. No error boundary.

---

## Entries — `/entries`

**File:** `src/app/entries/page.tsx`

### Purpose
Full paginated table of all entries with multi-criteria filtering, sortable columns, row selection for bulk actions, and a slide-in detail drawer.

### Data Fetched
Imports `src/data/entries.json` directly at the top of the file (`import entriesJson from '@/data/entries.json'`). All filtering and sorting runs client-side with `useMemo`.

### State Managed

| State var | Type | Purpose |
|-----------|------|---------|
| `search` | string | Free-text search box value (pre-seeded from `?search=` URL param) |
| `cat` | string | Selected category filter (`"All"` or one of the four categories) |
| `status` | string | Selected status filter (`"All"`, `"Pending"`, `"Approved"`, `"Rejected"`) |
| `page` | number | Current pagination page (1-based) |
| `sortKey` | SortKey | Active sort column: `'SPOC_name'`, `'date'`, `'totalHours'`, `'approvalStatus'`, or `null` |
| `sortDir` | `'asc'/'desc'` | Sort direction |
| `selected` | `Set<string>` | Set of `trackingID` values for bulk-selection checkboxes |
| `detailId` | string \| null | `trackingID` of entry whose detail drawer is open |

### URL Parameters Read
`?search=` — pre-fills the search input on mount (supports deep-linking from Dashboard "Recent Entries").

### Computed (useMemo)
- `filtered` — full filter + sort pipeline over all entries
- `stats` — { total, approved, pending, hours } of filtered set (drives the 4 stat cards at top)
- `paged` — slice of `filtered` for current page (15 rows per page)
- `totalPages`

### Loading/Error
Wrapped in `<Suspense>` with a skeleton fallback because `useSearchParams()` requires it in Next.js App Router. No async data; skeleton is only for hydration boundary.

### Key Interactions
- Clicking a stat card sets status filter to that status
- Clicking a faculty name cell sets search to that name
- Clicking a category pill sets category filter to that category
- Clicking a status pill sets status filter to that status
- Bulk actions (Approve/Hold/Delete) are rendered but not wired to data mutations
- Eye icon opens the detail drawer for that row

---

## Approvals — `/approvals`

**File:** `src/app/approvals/page.tsx`

### Purpose
Workflow queue for reviewing pending entries. Approve or reject individual entries with animated row exit; bulk approve/reject via selection; tabbed view for Pending vs Approved.

### Data Fetched
Imports `src/data/entries.json` directly. Initial data is loaded into `useState<Entry[]>` so mutations are possible.

### State Managed

| State var | Type | Purpose |
|-----------|------|---------|
| `entries` | Entry[] | Mutable copy of all entries (supports status updates) |
| `tab` | `'pending'/'approved'` | Which tab is active |
| `exiting` | `Set<string>` | IDs animating out (CSS class `row-exiting` applied for 280ms) |
| `toasts` | Toast[] | Active toast notifications |
| `toastId` | number | Incrementing ID for toast deduplication |
| `search` | string | Filter input |
| `cat` | string | Category filter |
| `page` | number | Current page |
| `selected` | `Set<string>` | Checked entries for bulk action |

### Derived (useMemo)
- `pending` — entries where `approvalStatus === 'Pending'`
- `approved` — entries where `approvalStatus === 'Approved'`
- `approvedToday` — approved entries with `date >= '2026-05-13'` (hardcoded threshold)
- `displayed` — filtered subset of `pending` or `approved` depending on active tab
- `paged` — paginated slice (12 rows per page)

### Key Interactions
- **Approve button**: sets exit animation → after 280ms updates `entries` state → shows green toast
- **Reject button**: same pattern, red toast
- **Bulk approve/reject**: immediately updates all selected entries, no animation delay
- **Tab switch**: resets page and selection
- State changes are **in-memory only** — not persisted to API or DB

### Loading/Error
No loading state. Toasts auto-dismiss after 3 seconds.

---

## Reports — `/reports`

**File:** `src/app/reports/page.tsx`

### Purpose
Analytics dashboard with month-range filter (Jan–May 2026) and four charts: entries over time, entries by category, hours by faculty (top 10), subject distribution.

### Data Fetched
Imports `src/data/entries.json` directly. All aggregations run with `useMemo` on the client.

### State Managed

| State var | Type | Purpose |
|-----------|------|---------|
| `fromM` | string | Start month (`'Jan'`–`'May'`), default `'Jan'` |
| `toM` | string | End month (`'Jan'`–`'May'`), default `'May'` |

### Derived (useMemo)
- `filtered` — entries where month index is within `[fromM, toM]` range
- `entriesOverTime` — `MonthStats[]` for the selected range
- `byCategory` — `{ category, count }[]` sorted descending
- `byFaculty` — top-10 `{ name, hours }[]`
- `bySubject` — top-8 `{ subject, count }[]`
- `stats` — `{ total, approved, pending, hours }` for selected range

### Charts Rendered
1. `MonthlyLineChart` (inline Recharts LineChart) — total/approved/pending lines per month
2. `CategoryBarChart` (from `src/components/charts/`)
3. `FacultyBarChart` (from `src/components/charts/`)
4. `SubjectPieChart` (from `src/components/charts/`)

### Loading/Error
No loading state. Export button shows `alert('Export coming soon')` — not implemented.

---

## Settings — `/settings`

**File:** `src/app/settings/page.tsx`

### Purpose
User profile display and notification preferences. Mostly static/decorative — no persistence.

### Data Fetched
None — all data is hardcoded (Vikram Bhatia / vbhatia@aos.edu / Retail Ops Lead / CPA·CMA).

### State Managed

| State var | Type | Purpose |
|-----------|------|---------|
| `toggles` | object | `{ newEntry, approved, digest, darkMode }` — boolean notification/theme toggles |

### Key Interactions
- Toggle switches update local state only (not persisted)
- "Change Password" button is decorative (no handler)
- Quick Links sidebar navigates to other pages
- Four anchor links (`#profile`, `#notifications`, `#security`, `#display`) scroll to sections

### Loading/Error
None.
