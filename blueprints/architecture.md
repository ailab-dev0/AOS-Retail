# Architecture

## System Diagram

```
┌──────────────────────────────────────────────────────────┐
│                     Browser (Client)                      │
│                                                          │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌────────┐ │
│  │Dashboard │  │ Entries   │  │Approvals │  │Reports │ │
│  │  /       │  │ /entries  │  │/approvals│  │/reports│ │
│  └────┬─────┘  └─────┬─────┘  └────┬─────┘  └───┬────┘ │
│       │              │             │              │      │
│       └──────────────┴─────────────┴──────────────┘      │
│                          │                               │
│              reads src/data/entries.json                 │
│              (static, in-memory, no network)             │
└──────────────────────┬───────────────────────────────────┘
                       │ API calls (future / pending migration)
                       ▼
┌──────────────────────────────────────────────────────────┐
│              Next.js API Routes  (src/app/api/)          │
│                                                          │
│  GET  /api/entries          ← list + filter + paginate   │
│  GET  /api/entries/[id]     ← single entry               │
│  PATCH /api/entries/[id]    ← update approval status     │
│  POST  /api/entries/bulk-approve                         │
└──────────────────────┬───────────────────────────────────┘
                       │ @neondatabase/serverless (HTTP/WebSocket)
                       ▼
┌──────────────────────────────────────────────────────────┐
│                   Neon Postgres (cloud)                  │
│                                                          │
│   entries table (see database.md for full schema)        │
│   Indexes: spoc_name, approval_status, date, category    │
└──────────────────────┬───────────────────────────────────┘
                       │
            originally seeded from
                       │
┌──────────────────────▼───────────────────────────────────┐
│  "TT Data_1st Jan to 7th May (1).csv"  (project root)   │
│  Raw faculty activity export — source of truth for data  │
└──────────────────────────────────────────────────────────┘
```

## Data Flow

### Current (static mode — what the UI actually does today)

```
CSV file
  → imported/parsed into src/data/entries.json  (one-time)
    → src/lib/data.ts  (helper functions, pure, synchronous)
      → page components (dashboard, entries, approvals, reports)
        → React state (client-side filtering/sorting/pagination)
```

### Future (live mode — API routes are ready, pages not yet wired)

```
User action (approve, filter, search)
  → fetch("/api/entries?search=…&status=Pending")
    → Next.js route handler (src/app/api/entries/route.ts)
      → Neon serverless SQL  (@neondatabase/serverless)
        → Neon Postgres cloud DB
          → JSON response → React state update
```

## Tech Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Framework | Next.js | 16.2.6 | App Router, `'use client'` pages |
| Language | TypeScript | ^5 | Strict mode |
| React | React + React DOM | 19.2.4 | Concurrent features |
| Database | Neon Postgres | — | Cloud serverless Postgres |
| DB client | @neondatabase/serverless | ^1.1.0 | HTTP transport, no persistent connections |
| Charts | Recharts | ^3.8.1 | LineChart, BarChart, PieChart |
| Icons | lucide-react | ^1.14.0 | Tree-shaken SVG icons |
| Styling | Tailwind CSS | ^4 | Utility-first, PostCSS plugin |
| Utility | clsx + tailwind-merge | ^2/^3 | Conditional class names |
| Runtime | Node.js | 24 LTS | Vercel default |
| Linting | ESLint | ^9 | eslint-config-next |

## Environment Variables

See [environment.md](environment.md) for full detail.

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes (API routes) | Neon connection string |

## Key Architectural Decisions

**App Router only** — no Pages Router. All layouts use `src/app/layout.tsx` + `AppLayout` client component.

**`'use client'` everywhere** — all page components are client components because they use `useState`, `useMemo`, and `useSearchParams`. No server components in the page layer yet.

**Static JSON as primary data source** — `src/data/entries.json` is loaded at build time. Pages never call the API routes directly; they call helpers in `src/lib/data.ts` that read from the JSON array. This means data is frozen at build time and approval actions (`updateStatus` in `ApprovalsPage`) are ephemeral — they mutate React state only and reset on page refresh.

**API routes are DB-backed but unused by UI** — `src/app/api/` is fully wired to Neon. Migration path: swap `src/lib/data.ts` calls for `fetch('/api/entries')` calls in each page.
