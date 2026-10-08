# Nocturne

Clothing storefront: React frontend + Express API on Supabase Postgres.

```
frontend/   Vite + React 19 + Tailwind v4 storefront (see frontend/README.md)
backend/    Express 5 API, raw SQL via `pg` (no ORM / query builder)
  db/schema.sql      tables (users, products, orders, order_items)
  src/db/pool.js     the only place that talks to Postgres
  src/routes/        auth, products, orders, payments
reference/  design references
```

## Setup

```bash
npm install                                   # installs both workspaces (run at the repo root)
cp backend/.env.example backend/.env          # fill in DATABASE_URL, JWT_SECRET, and Razorpay test keys
cp frontend/.env.example frontend/.env
npm run db:migrate                            # create tables in Supabase
npm run db:seed                               # load 43 demo products + demo user
npm run dev                                   # API on :4000, web on http://localhost:5173
```

Demo login: `demo@nocturne.in` / `password123`.

To work on the UI without a database, set `VITE_API_BASE_URL=` (empty) in `frontend/.env`; the frontend then uses its in-browser mocks.

### Supabase values (backend/.env)

| Variable       | Where to get it                                                                                                                                           |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL` | Supabase dashboard → project → **Connect** → **Session pooler** → URI. Replace `[YOUR-PASSWORD]` with your DB password (URL-encode `@ # / %` if present). |
| `JWT_SECRET`   | Any long random string: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`                                                  |

The Supabase project URL and anon/service keys are **not** needed: the backend talks to Postgres directly and handles auth itself (bcrypt + JWT).

Supabase also exposes `public` tables through its REST API. `schema.sql` enables row-level security with no policies, which blocks that API, so only this backend can read the data.

## Scripts (repo root)

| Script                        | What it does                               |
| ----------------------------- | ------------------------------------------ |
| `npm run dev`                 | API + frontend together                    |
| `npm run dev:web` / `dev:api` | Just one of them                           |
| `npm run db:migrate`          | Apply `backend/db/schema.sql` (idempotent) |
| `npm run db:seed`             | Upsert demo products and the demo user     |
| `npm run build`               | Production build of the frontend           |
| `npm start`                   | Run the API without file watching          |
| `npm run lint` / `format`     | ESLint (both workspaces) / Prettier        |

## Database rules

- `pg` with raw SQL only. No ORM or query builder, and no Supabase JS client.
- Every query is a constant SQL string with `$1, $2, …` placeholders and a values array. User input never goes into the SQL text. Optional filters use `($n IS NULL OR …)` instead of building SQL dynamically.
