# Components

## Layout Components

### `src/components/layout/AppLayout.tsx`

**Purpose:** Root shell that wraps every page. Renders the full-height flex layout with Sidebar on the left and a scrollable main area on the right.

**Props:**
```typescript
{ children: React.ReactNode }
```

**Behaviour:**
- Reads `src/data/entries.json` to compute `pendingCount` (entries where `approvalStatus === 'Pending'`).
- Passes `pendingCount` to `<Sidebar>` so the Approvals badge can show the live count.
- Renders: `<Sidebar>` | `<div>` → `<Topbar>` + `<main>` with fade-in animation.

**Used by:** `src/app/layout.tsx` (wraps all routes).

---

### `src/components/layout/Sidebar.tsx`

**Purpose:** Left navigation panel — logo, menu links, general links, download CTA.

**Props:**
```typescript
interface SidebarProps {
  pendingCount: number;  // badge count shown on Approvals link
}
```

**Navigation structure:**
- **Menu:** Dashboard `/`, Approvals `/approvals` (badge), Entries `/entries`, Reports `/reports`, Team `/settings`
- **General:** Settings `/settings`, Help `#`, Logout `#`

**Behaviour:**
- Uses `usePathname()` to highlight the active route with a green left bar and `bg-[#e8f5e9]` background.
- Approvals link shows a pill badge with `pendingCount` if > 0 (capped display at `99+`).
- Download CTA at the bottom is decorative (button has no handler).

**Used by:** `AppLayout`.

---

### `src/components/layout/Topbar.tsx`

**Purpose:** Fixed top header bar — global search input and right-side user actions.

**Props:** None.

**Behaviour:**
- Search input submits on `Enter` → navigates to `/entries?search=<query>` using `useRouter().push()`.
- Mail icon has a red notification dot (decorative, no handler).
- Bell icon (decorative, no handler).
- User avatar shows hardcoded "VB" initials and name "Vikram Bhatia".

**Used by:** `AppLayout`.

---

## Chart Components

### `src/components/charts/EntriesLineChart.tsx`

**Purpose:** Multi-line Recharts chart showing entries per month split by category type.

**Props:**
```typescript
{
  data: { month: string; f2f: number; online: number; mentoring: number; other: number }[];
  height?: number;  // default 200
}
```

**Series:** Face to Face (blue `#3b82f6`), Online (emerald `#10b981`), Mentoring (orange `#f97316`), Other (yellow `#eab308`).

**Used by:** Dashboard page (`src/app/page.tsx`).

---

### `src/components/charts/CategoryBarChart.tsx`

**Purpose:** Horizontal bar chart of entry counts per category. Each bar gets a distinct colour from a 4-colour palette.

**Props:**
```typescript
{ data: { category: string; count: number }[] }
```

**Used by:** Reports page.

---

### `src/components/charts/FacultyBarChart.tsx`

**Purpose:** Horizontal bar chart of total hours per faculty member (top 10).

**Props:**
```typescript
{ data: { name: string; hours: number }[] }
```

**Used by:** Reports page.

---

### `src/components/charts/SubjectPieChart.tsx`

**Purpose:** Donut pie chart of top-8 subjects by entry count.

**Props:**
```typescript
{ data: { subject: string; count: number }[] }
```

`innerRadius={55}` `outerRadius={90}` — donut style with legend below.

**Used by:** Reports page.

---

## Widget Components

Widgets are reusable dashboard card bodies. They are **not** currently used by any page — pages define equivalent components inline. They exist as a cleaner abstraction for future use or refactoring.

### `src/components/widgets/KPICard.tsx`

**Purpose:** Generic KPI stat card with title, large value, optional delta indicator, icon, and left colour border.

**Props:**
```typescript
interface KPICardProps {
  title: string;
  value: string | number;
  delta?: string;         // e.g. "+12 this week"
  deltaType?: 'up' | 'down' | 'neutral';  // default 'neutral'
  icon: React.ReactNode;
  iconBg?: string;        // Tailwind class, default 'bg-[#2563eb]'
  accentColor?: string;   // CSS colour for left border, default #e2e8f0
}
```

**Used by:** Not currently used by any page (replaced by inline stat cards).

---

### `src/components/widgets/ActivityFeed.tsx`

**Purpose:** Scrollable list of recent entries with coloured category dot, faculty name, subject, and relative time ago.

**Props:**
```typescript
{ entries: Entry[] }
```

Uses `createdDate` for relative time calculation.

**Used by:** Not currently used by any page.

---

### `src/components/widgets/ApprovalGauge.tsx`

**Purpose:** SVG semi-circle gauge showing approval rate % with approved/pending legend.

**Props:**
```typescript
interface ApprovalGaugeProps {
  rate: number;           // 0–100 percentage
  approvedCount: number;
  pendingCount: number;
}
```

Note: Dashboard page defines its own inline `ApprovalGauge` with an entrance animation. This widget is the cleaner standalone version.

**Used by:** Not currently used by any page.

---

### `src/components/widgets/CategoryBreakdown.tsx`

**Purpose:** Stacked progress-bar breakdown of entries per category showing approved vs pending proportions.

**Props:**
```typescript
{ data: { category: string; total: number; approved: number; pending: number }[] }
```

**Used by:** Not currently used by any page.

---

### `src/components/widgets/WeekStats.tsx`

**Purpose:** Simple 4-row stat list: entries added, approved, total hours, active faculty for a given week.

**Props:**
```typescript
{ stats: WeekStatsData }
// WeekStatsData: { entries, approved, pending, hours, faculty }
```

**Used by:** Not currently used by any page.

---

## UI Primitives

### `src/components/ui/Badge.tsx`

**Purpose:** Approval status badge pill with optional pulse dot.

**Props:**
```typescript
interface BadgeProps {
  status: string;          // 'Pending' | 'Approved' | 'Rejected'
  pulse?: boolean;         // animated dot, default false
  className?: string;
}
```

Colour map: Pending → orange, Approved → green, Rejected → red, unknown → gray.

**Used by:** Not currently imported by pages (pages define inline status pills).

---

### `src/components/ui/Button.tsx`

**Purpose:** Generic button primitive. (File exists but not read — assumed standard variant/size API.)

**Used by:** Unknown without reading.

---

### `src/components/ui/Card.tsx`

**Purpose:** White rounded card container. (File exists but not read.)

**Used by:** Unknown without reading.

---

### `src/components/ui/CategoryPill.tsx`

**Purpose:** Category label pill (wraps the `CAT_PILL` / `CAT_LABEL` colour maps into a component). (File exists but not read.)

**Used by:** Unknown without reading.

---

### `src/components/ui/Input.tsx`

**Purpose:** Styled text input. (File exists but not read.)

**Used by:** Unknown without reading.

---

### `src/components/ui/Select.tsx`

**Purpose:** Styled select dropdown. (File exists but not read.)

**Used by:** Unknown without reading.

---

## Component Map by Page

| Page | Layout | Charts | Widgets | UI |
|------|--------|--------|---------|----|
| Dashboard | AppLayout | EntriesLineChart | — (inline) | — |
| Entries | AppLayout | — | — (inline) | — |
| Approvals | AppLayout | — | — (inline) | — |
| Reports | AppLayout | CategoryBarChart, FacultyBarChart, SubjectPieChart | — | — |
| Settings | AppLayout | — | — | — |
