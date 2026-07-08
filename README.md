# 🐼 Hungry Panda

A **pan-Asian takeout ordering web app**, built around **allergy-safe ordering**.
Customers browse a menu by topic, tell the app what they're allergic to once, and
every unsafe dish is flagged and locked out of the cart. Sign in with Google to
reorder favourites, or check out as a guest; pay with Stripe. Owners get an admin
console to set the menu, prices, descriptions and allergens, and to work a live
order queue.

The repo contains both the **product design** (concept, spec, interactive
prototype, screenshots) and the **application** (a Next.js + TypeScript app that
implements the spec).

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

It runs with **zero configuration** in demo mode: in-memory data, a simulated
Google sign-in, and instant (fake) payments — so the whole flow works offline.
Fill in `.env.local` (see `.env.example`) to switch on real Google OAuth, Stripe
and Supabase.

Try it: set allergies (header pill) and watch dishes lock → add items → checkout
→ order confirmed. Sign in with Google to reorder from history. Visit `/admin`
for the staff console (dashboard, menu & pricing editor, order queue).

```bash
npm test             # domain unit tests (allergens, pricing, cart, orders)
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run build        # production build
node tools/smoke.mjs # end-to-end smoke test (needs a running `npm start`)
```

## Architecture

Recommended stack from the spec (§13): **Next.js (App Router) + TypeScript**,
**Supabase (Postgres)** for data, **Google OAuth** for auth, **Stripe** for
payments. Every integration has a demo-mode fallback so nothing is required to
run locally.

```
src/
  domain/       Pure, unit-tested core: allergen blocking, pricing,
                server-side cart validation, order building.
  data/         Store interface + in-memory implementation (seeded from the
                prototype menu). Supabase is the documented production path.
  auth/         Signed-cookie sessions (jose); admin allow-list.
  payments/     Stripe helper (PaymentIntent) + demo-mode fallback.
  app/api/      Route handlers: menu, session, auth, allergens, orders,
                reorder, cart validation, admin item/order management.
  app/(store)/  Storefront: home, menu, checkout, account, order confirmation.
  app/admin/    Staff console: sign-in gate, dashboard, menu editor, queue.
  components/   AppProvider (client state) + storefront/admin UI.
supabase/       SQL schema + RLS for the production data layer.
```

**Safety is enforced on the server.** Allergen blocking, availability and pricing
are always re-validated in `src/domain/cart.ts` at cart-validate and order-create
time — the client UI is only a convenience (see `POST /api/orders`).

### What's live vs. configured

| Area | Default (no secrets) | With configuration |
|---|---|---|
| Data | In-memory store, seeded | Supabase Postgres (`supabase/`) |
| Auth | Simulated Google sign-in | Google OIDC + staff allow-list |
| Payments | Approved instantly (demo) | Stripe PaymentIntent + webhook |

> Persistence is in-memory today (resets on restart); the Supabase schema and
> the swap-in point are ready in `supabase/README.md`.

## Design deliverables

The original concept and design work live alongside the app:

| Path | What it is |
|---|---|
| [`docs/concept-and-spec.md`](docs/concept-and-spec.md) | Concept, feature requirements, allergen model, data model, architecture, roadmap. |
| [`mockups/index.html`](mockups/index.html) | Self-contained interactive prototype (open in any browser). |
| [`screenshots/`](screenshots/) | 18 rendered PNGs of every screen (light, dark, mobile). |
| `tools/` | Build/screenshot/smoke scripts. |

## Design system

- **Brand:** bamboo green `#2E7150` — the accent, kept deliberately separate from
  the semantic **allergen** colours so safety always reads clearly.
- **Semantic signals:** chili red `#C1362F` = *blocked*; turmeric amber `#B5720E`
  = *caution*.
- **Type:** Fraunces (display serif) + Figtree (UI), self-hosted from `/public/fonts`.
- **Themes:** full light and dark support (OS preference or in-app toggle).
