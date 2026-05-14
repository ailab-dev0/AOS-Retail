# Environment Variables

## Variable Reference

### `DATABASE_URL`

| Property | Value |
|----------|-------|
| **Required** | Yes — for API routes. Optional if only running static JSON mode. |
| **Where set** | `.env.local` (local dev), Vercel project environment variables (staging/production) |
| **Purpose** | Neon Postgres connection string used by `src/db/client.ts` to instantiate the serverless SQL client |
| **Format** | `postgresql://user:password@host/dbname?sslmode=require` |
| **Example** | `postgresql://aos_owner:abc123@ep-example-123.us-east-2.aws.neon.tech/aos_retail?sslmode=require` |
| **Used in** | `src/db/client.ts` (throws hard error at import time if missing) |
| **Effect if missing** | API routes (`/api/entries`, `/api/entries/[id]`, `/api/entries/bulk-approve`) will throw `Error: DATABASE_URL is not set` on any request. Pages that read static JSON are unaffected. |

---

## How to Set Up (Local Development)

1. Create a `.env.local` file in the project root (already gitignored):
   ```
   DATABASE_URL=postgresql://...
   ```

2. Get the connection string from the Neon console:
   - Log in to [console.neon.tech](https://console.neon.tech)
   - Select your project → Connection Details
   - Copy the **Pooled connection** string

3. Run the schema if you haven't already:
   ```bash
   psql "$DATABASE_URL" -f src/db/schema.sql
   ```

4. Start the dev server:
   ```bash
   npm run dev
   ```

---

## Vercel Deployment

Set environment variables via the Vercel dashboard or CLI:

```bash
vercel env add DATABASE_URL production
vercel env add DATABASE_URL preview
vercel env add DATABASE_URL development
```

Or in the Vercel dashboard: Project → Settings → Environment Variables.

The Neon Vercel integration can auto-populate `DATABASE_URL` if you connect your Neon project from the Vercel Marketplace.

---

## No Other Variables

As of current state, `DATABASE_URL` is the only application environment variable. The following Next.js variables are available from the framework but not explicitly set by this project:

| Variable | Set by | Notes |
|----------|--------|-------|
| `NODE_ENV` | Next.js / Vercel | `development` / `production` / `test` |
| `NEXT_PUBLIC_*` | (none defined) | No public env vars currently; add here if needed for client-side config |
| `VERCEL_URL` | Vercel (auto) | Available in Vercel deployments; not used by current code |

---

## Adding New Variables

- **Server-only** (API routes, server components, `src/db/`): add to `.env.local` and Vercel env; access via `process.env.VAR_NAME`.
- **Client-accessible**: prefix with `NEXT_PUBLIC_`; these are baked into the client bundle at build time.
- Always add new variables to this file.
