# AOS-Retail-Next — Blueprint Index

Documentation for new developers to understand the codebase end-to-end.

## Files

| File | Description |
|------|-------------|
| [architecture.md](architecture.md) | ASCII system diagram, full data flow (CSV → Neon → API → React), tech stack table, environment variables overview |
| [database.md](database.md) | `entries` table: every column, type, nullable, purpose, example value; all indexes; date handling notes |
| [api-routes.md](api-routes.md) | Every API route: method, path, query params, request body, response shape, error codes |
| [data-layer.md](data-layer.md) | Old static JSON functions vs new async Neon fetch functions; migration guide; current hybrid state |
| [pages.md](pages.md) | Every page: route, purpose, data fetched, components used, state managed, loading/error handling |
| [components.md](components.md) | Every component file: path, exported props interface, purpose, which pages use it |
| [environment.md](environment.md) | Every environment variable: name, required/optional, where set, purpose, example value |

## Quick orientation

```
AOS-Retail-Next/
├── src/app/              # Next.js App Router pages + API routes
│   ├── page.tsx          # Dashboard (/)
│   ├── entries/          # Entries table (/entries)
│   ├── approvals/        # Approval queue (/approvals)
│   ├── reports/          # Analytics (/reports)
│   ├── settings/         # User settings (/settings)
│   └── api/entries/      # REST API backed by Neon Postgres
├── src/components/
│   ├── layout/           # AppLayout, Sidebar, Topbar
│   ├── charts/           # Recharts wrappers
│   ├── widgets/          # Dashboard card components
│   └── ui/               # Generic primitives (Badge, Button…)
├── src/data/
│   ├── entries.json      # Static seed data (camelCase schema)
│   └── types.ts          # TypeScript types (dual: DB snake_case + legacy camelCase)
├── src/db/
│   ├── schema.sql        # Neon table DDL
│   └── client.ts         # Neon serverless SQL client
└── src/lib/data.ts       # Static data helper functions (reads from JSON)
```

The app is currently in a **hybrid state**: pages read from `src/data/entries.json` (static), while `src/app/api/` routes are wired to Neon Postgres. See [data-layer.md](data-layer.md) for the full migration picture.
