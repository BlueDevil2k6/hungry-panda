# Supabase (production data layer)

The app ships with a zero-config **in-memory store** (`src/data/store.ts`) so it
runs and is testable without any backend. This folder holds the **Postgres
schema** for the production data layer described in the spec (§12–13).

> Status: the SQL migration below is complete and reviewable. The runtime is
> still on the in-memory store — swapping in a `SupabaseStore` is the documented
> next step (the seam is already isolated behind the `Store` interface).

## Apply the schema

```bash
# with the Supabase CLI against a linked project
supabase db push
# or paste supabase/migrations/0001_init.sql into the SQL editor
```

Then seed the controlled data (categories, allergens, menu) from
`src/data/seed.ts`, and add staff to `staff_allowlist`.

## Wiring the app to Supabase

Everything the app needs from storage goes through one interface — `Store` in
`src/data/store.ts` — and one factory, `getStore()`. To go live:

1. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (see `.env.example`).
2. Add `src/data/supabase-store.ts` implementing `Store` with
   `@supabase/supabase-js` (already a dependency), mapping each method to the
   tables in `0001_init.sql`.
3. Select it in `getStore()`:

   ```ts
   import { config } from "@/auth/config";
   export function getStore(): Store {
     if (!instance) {
       instance = config.supabaseConfigured
         ? new SupabaseStore()   // production
         : new InMemoryStore();  // local / CI default
     }
     return instance;
   }
   ```

Because `getStore()` is the only entry point, no route handler or component
changes are needed.

## Auth & RLS

Row-Level Security is enabled on every table (`0001_init.sql`):

- **Menu/allergens** — world-readable, staff-writable.
- **Profiles** — a user reads/updates only their own row; staff read all.
- **Orders** — customers see their own; staff see and manage all; guest orders
  (`user_id null`) are created via the service role.

Google sign-in maps to Supabase Auth's Google provider; the admin role is
granted by matching the verified email against `staff_allowlist` (or
`ADMIN_ALLOWLIST`).
