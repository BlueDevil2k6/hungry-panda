# Hungry Panda — Concept & Product Specification

**A takeout ordering platform for a pan-Asian kitchen, built around allergy-safe ordering.**

Version 0.1 · Draft for review · 8 July 2026

---

## 1. Concept & vision

Hungry Panda is a web app for a single restaurant that sells **takeout / pickup**
food. Guests browse a menu organised by topic (dumplings, bao, noodles, rice
bowls, sides, sweets, drinks), build an order, pay online, and collect in store.

The product's distinguishing idea is **allergy-safe ordering**: a customer tells
the app what they're allergic to *once*, and from then on every dish that
contains one of their allergens is clearly flagged and **cannot be added to the
cart**. This turns a stressful, error-prone task ("can I actually eat this?")
into a calm one, and it protects the kitchen from orders it shouldn't fulfil.

Three audiences are served by one system:

| Audience | What they need |
|---|---|
| **Returning customer** | Sign in with Google, keep allergens saved, reorder a favourite in one tap. |
| **Guest** | Order and pay without an account — no friction, no sign-up wall. |
| **Owner / staff (admin)** | Sign in with Google (restricted), set the menu, prices, descriptions and allergens, mark items sold out, and work the live order queue. |

### Design principles

1. **Safety reads at a glance.** Brand colour is *bamboo green*; chili-red and
   turmeric-amber are reserved exclusively as allergen **signals**, never as
   decoration, so "blocked / caution / safe" is unambiguous.
2. **No account required to buy.** Sign-in is an accelerator (saved allergens,
   reorder, history), never a gate.
3. **The admin edits what the customer sees.** Menu, pricing, availability and
   allergen data live in one place; a change is live on the storefront
   instantly.
4. **Honest about safety.** Allergen blocking is a strong aid, not a medical
   guarantee — the UI says so and always invites customers to talk to staff
   about severe allergies (see §6.4).

---

## 2. Assumptions & decisions

These were chosen to make the concept concrete. All are cheap to revisit — flag
any you'd like changed.

- **Cuisine / brand:** modern pan-Asian ("Hungry Panda"). Menu content is
  illustrative.
- **Fulfilment:** pickup/takeout only in the MVP (no delivery, no couriers).
- **Payments:** **Stripe** (cards + Apple Pay / Google Pay via Payment Request).
  Swappable for Adyen/Square if preferred.
- **Auth:** **Google OAuth (OpenID Connect)** for both customers and admins,
  plus **guest checkout**. Admin access is allow-listed by email/domain.
- **Single location** in the MVP; the data model leaves room for multi-site.
- **Currency/tax** shown as USD with a flat 8.5% sample tax; real tax rules are a
  configuration concern.

---

## 3. Target users & personas

- **Priya, 29 — the allergic regular.** Peanut and shellfish allergy. Wants to
  order quickly without reading every ingredient list. Values saved allergens
  and one-tap reorder. *(This is the signed-in demo user in the prototype.)*
- **Sam, 24 — the guest.** Grabbing lunch once. Won't create an account; wants to
  pay with Apple Pay in under a minute.
- **Marco, 45 — the owner/admin.** Sets tonight's specials, 86's the salmon when
  it runs out, watches the order queue during the rush. *(Admin demo user.)*

---

## 4. Scope

### In scope (MVP)
- Storefront: home, topic-organised menu, item cards, cart, checkout, confirmation.
- Allergen profile (guest-local or saved to account) with hard blocking.
- Google sign-in for customers + guest checkout.
- Stripe payments (card + wallets), pickup scheduling (ASAP / timed).
- Order history & one-tap reorder for signed-in customers.
- Admin: Google sign-in (restricted), menu & pricing CRUD, allergen tagging,
  availability toggles, live order queue with status transitions, basic
  dashboard KPIs.
- Ready-notification to the customer (SMS/email/push — see §10).

### Out of scope (later)
- Delivery & courier dispatch, live driver tracking.
- Loyalty/points, promo codes, gift cards.
- Multi-location, franchising, per-branch menus.
- Table service / dine-in, KDS hardware integration, printer routing.
- Inventory/stock depletion, ingredient-level costing.
- Native mobile apps (the web app is responsive/PWA-ready).

---

## 5. Functional requirements

IDs are grouped by area. **MoSCoW**: (M)ust, (S)hould, (C)ould.

### 5.1 Menu & browsing
- **FR-M1 (M)** Menu is grouped into **topics/categories**; each has a name,
  blurb, sort order and image/emoji.
- **FR-M2 (M)** Each item shows name, description, price, image, dietary tags
  (plant-based, spice level) and its **allergen list**.
- **FR-M3 (M)** Items can be marked **unavailable ("sold out")**; they appear
  disabled and cannot be ordered.
- **FR-M4 (S)** Popular items are badged.
- **FR-M5 (C)** Per-item options/modifiers (size, spice level, add-ons) — data
  model supports it; UI deferred.
- **FR-M6 (S)** Category quick-jump navigation on the menu page.

### 5.2 Cart & checkout
- **FR-C1 (M)** Add/remove items and change quantity from the menu or cart.
- **FR-C2 (M)** Cart persists during the session; shows subtotal, tax and total.
- **FR-C3 (M)** Checkout collects: pickup timing (ASAP or scheduled), name,
  mobile number, optional kitchen notes.
- **FR-C4 (M)** No delivery address is requested (pickup only).
- **FR-C5 (M)** A blocked (allergen) or sold-out item can never enter the cart,
  including via reorder (it is skipped with a notice).

### 5.3 Allergen safety  *(the core feature — see §6)*
- **FR-A1 (M)** Customer can select from a defined allergen list
  (gluten, peanut, tree nut, soy, sesame, shellfish, fish, egg, dairy).
- **FR-A2 (M)** Guests store allergens locally; signed-in users store them on
  their profile, synced across devices.
- **FR-A3 (M)** Any dish containing a selected allergen is **flagged in red**
  and its **Add control is removed** ("blocked from your order").
- **FR-A4 (M)** The menu shows a running summary ("Flagging N dishes that
  contain your …").
- **FR-A5 (S)** Allergen preferences are editable everywhere they matter (header
  pill, menu banner, account page, checkout).
- **FR-A6 (M)** A clear disclaimer accompanies the feature (§6.4).

### 5.4 Accounts & authentication
- **FR-U1 (M)** Customers can **sign in with Google** (OIDC).
- **FR-U2 (M)** **Guest checkout** requires no account.
- **FR-U3 (M)** Signed-in customers get: saved allergens, saved profile
  (name, phone, marketing opt-in), **order history**, and **one-tap reorder**.
- **FR-U4 (M)** Reorder loads a past order into the cart, **skipping** any items
  now blocked by allergens or unavailable, and tells the user what was skipped.
- **FR-U5 (M)** Customers can sign out; guest state is cleared appropriately.

### 5.5 Payments
- **FR-P1 (M)** Pay by card via **Stripe**; PAN never touches our servers
  (Stripe Elements / PaymentIntents).
- **FR-P2 (S)** **Apple Pay / Google Pay** via the Payment Request API.
- **FR-P3 (M)** Order is only created/confirmed after payment authorises;
  failures are shown inline with a retry.
- **FR-P4 (S)** Emailed/texted receipt on success.

### 5.6 Admin — menu management
- **FR-D1 (M)** Admin signs in with **Google, restricted to allow-listed
  staff**; unauthorised Google accounts are refused.
- **FR-D2 (M)** Create, edit and delete menu items: **name, description,
  category, price, allergens, availability**.
- **FR-D3 (M)** Toggle item availability ("86" an item) instantly.
- **FR-D4 (M)** Changes are reflected on the storefront immediately.
- **FR-D5 (S)** Manage categories (add, rename, reorder).
- **FR-D6 (C)** Bulk actions and menu scheduling (e.g. lunch vs dinner).

### 5.7 Admin — orders & dashboard
- **FR-O1 (M)** Live order queue with statuses **New → Preparing → Ready →
  Picked up**; staff advance an order's status.
- **FR-O2 (M)** Each order shows customer, items, total, pickup time and any
  kitchen notes.
- **FR-O3 (S)** Dashboard KPIs: orders today, revenue, average pickup time, live
  order count, top sellers.
- **FR-O4 (S)** Advancing to "Ready" triggers the customer ready-notification.

---

## 6. Allergen safety model (detail)

### 6.1 Data
Each menu item carries a set of allergen tags drawn from a controlled
vocabulary. Each customer (or guest session) carries a set of **avoided**
allergens.

```
blocked(item, user)  ⇔  item.allergens ∩ user.avoided ≠ ∅
```

### 6.2 Behaviour
- A **blocked** item is dimmed, its matching allergen chips turn red, an inline
  banner names the offending allergen(s), and the **Add / quantity control is
  removed**. It cannot be added by any path (menu, deep link, or reorder).
- A **safe** item is unaffected; items with *no* listed allergens are positively
  marked "No listed allergens".
- The menu header summarises how many dishes are currently blocked.

### 6.3 Where it's set & synced
Header pill → allergen modal, menu banner, **Account ▸ Allergens & diet**, and
the checkout identity card all read/write the same set. Signed-in = saved to
profile; guest = saved to the device.

### 6.4 Safety disclaimer (must ship with the feature)
> Allergen filtering is a safety aid based on the ingredients we record — it is
> **not a medical guarantee**. Dishes are prepared in a shared kitchen where
> cross-contact can occur. If you have a severe allergy, please tell our staff
> before ordering.

This copy appears on the allergen settings panel and near the point of purchase.

---

## 7. Authentication & accounts

- **Protocol:** Google OAuth 2.0 / OpenID Connect. We store the Google subject
  ID, email, and display name; no passwords.
- **Roles:** `guest`, `customer`, `staff`, `admin/owner`. Role is derived from an
  allow-list (staff/admin) or defaults to `customer`.
- **Admin gate:** the admin console checks the authenticated email against the
  staff allow-list (or a Google Workspace domain) and refuses everyone else with
  a clear "restricted to authorised staff" message.
- **Sessions:** short-lived signed session cookies (HttpOnly, Secure, SameSite);
  refresh handled server-side. Guests use an anonymous session token that can be
  upgraded to a customer session on sign-in (cart & allergens carry over).

---

## 8. Payments

- **Stripe** with server-created **PaymentIntents**; the client confirms using
  **Stripe Elements** (card) or the **Payment Request Button** (Apple/Google
  Pay). Card data is tokenised by Stripe and never transits or is stored on our
  servers → **PCI-DSS SAQ-A** scope.
- **Order lifecycle vs payment:** create a `pending` order → create/confirm the
  PaymentIntent → on `succeeded` webhook, mark order `paid` and push it to the
  kitchen queue; on failure, keep the cart and surface a retry.
- **Refunds/cancellations:** owner-initiated refunds via Stripe (admin, later
  phase).

---

## 9. Non-functional requirements

- **Performance:** menu interactive < 2 s on 4G; add-to-cart and allergen
  toggles feel instant (optimistic UI).
- **Accessibility:** WCAG 2.1 AA — keyboard operable, visible focus, colour is
  never the *only* signal (blocked items also carry text + icon), sufficient
  contrast in light and dark themes.
- **Responsive:** phone-first; works from 360 px to desktop. PWA-installable
  (later).
- **Security & privacy:** HTTPS everywhere; least-privilege admin; allergen &
  contact data treated as personal data (GDPR/CCPA) — exportable/deletable.
  Stripe handles card data.
- **Reliability:** payment and order writes are idempotent; webhook processing is
  retry-safe.
- **Internationalisation-ready:** copy externalised; currency/tax configurable.
- **Observability:** structured logs, error tracking, and payment/webhook audit
  trail.

---

## 10. Key user flows

**Order (guest):** Home → Menu → set allergens (optional) → add safe items →
Cart → Checkout → *Continue as guest* → pickup details → Stripe payment →
Confirmation + ready-notification.

**Order (returning):** Sign in with Google → allergens auto-applied → add items
(or **Reorder** from history) → Checkout (details pre-filled) → pay → Confirmation
saved to account.

**Set allergies:** any allergen entry point → toggle allergens → menu re-flags &
locks matching dishes immediately.

**Admin — edit the menu:** Staff Google sign-in → **Menu & pricing** → edit item
(name/description/price/allergens) or toggle availability → live on storefront.

**Admin — work the rush:** Dashboard → **Order queue** → advance New → Preparing
→ Ready (fires customer notification) → Picked up.

**Notifications:** on "Ready", notify the customer by SMS (Twilio/Brevo) and/or
email; signed-in users may also get web push.

---

## 11. Information architecture & screen inventory

Every screen below is realised in the interactive prototype
(`mockups/index.html`) and captured in `screenshots/`.

**Storefront (customer)**
1. Home / landing — hero, topics, "how it works", allergy-safe pitch.
2. Menu — topic sidebar, allergy banner, item cards with live blocking.
3. Cart drawer — line items, quantities, totals.
4. Allergen modal — pick allergens (guest or saved).
5. Sign-in modal — Google + guest.
6. Checkout — identity (signed-in/guest), pickup, Stripe payment, summary.
7. Order confirmed — number, pickup time, status tracker, receipt.
8. My account — order history + reorder, allergens & diet, profile.

**Admin console**
9. Staff sign-in — Google, restricted.
10. Dashboard — KPIs, live queue preview, top sellers.
11. Menu & pricing — table with availability switches + item editor.
12. Order queue — advanceable statuses.

---

## 12. Data model (illustrative)

```
User            id, google_sub, email, name, phone, role,
                marketing_opt_in, created_at
AllergenProfile user_id (or guest_token), allergen_ids[]        # avoided set
Allergen        id, label, description                          # controlled list
Category        id, name, blurb, image, sort_order, active
MenuItem        id, category_id, name, description, price_cents,
                image, spice_level, is_vegetarian, is_popular,
                is_available, sort_order
MenuItemAllergen  menu_item_id, allergen_id                     # many-to-many
Order           id, code (HP-####), user_id?, guest_contact?,
                status, pickup_type(asap|scheduled), pickup_at,
                subtotal_cents, tax_cents, total_cents,
                notes, created_at
OrderItem       id, order_id, menu_item_id, name_snapshot,
                unit_price_cents_snapshot, quantity,
                allergen_snapshot[]                             # frozen at purchase
Payment         id, order_id, stripe_payment_intent, status,
                amount_cents, method, receipt_url
StaffAllowlist  email or domain, role
```

Note: order lines **snapshot** name, price and allergens at purchase time so
later menu edits never rewrite history.

---

## 13. Suggested architecture & tech stack

A pragmatic, low-ops stack that matches the connectors available in this
workspace:

- **Frontend:** Next.js (React) + TypeScript, server components for the menu,
  client interactivity for cart/allergens. Tailwind or CSS variables (the
  prototype's token system ports directly).
- **Backend/data:** **Supabase** (Postgres + Row-Level Security + Auth). RLS
  enforces that customers see only their own orders and that only allow-listed
  staff reach admin data.
- **Auth:** Google provider via Supabase Auth (customers) with a staff allow-list
  table gating the admin role; anonymous sessions for guests.
- **Payments:** Stripe (PaymentIntents + Elements + Payment Request); Stripe
  webhooks → Supabase Edge Function to finalise orders.
- **Notifications:** Brevo (email) and/or Twilio (SMS) for receipts & "ready".
- **Hosting:** Vercel (web) + Supabase (data). Deploys from Git.

```
[Next.js app] ──REST/RPC──> [Supabase: Postgres + Auth + RLS]
      │                              │
      ├── Stripe Elements ──> [Stripe] ──webhook──> [Edge Function → orders]
      └── on "Ready" ─────────> [Brevo / Twilio] ──> customer
```

Nothing here is load-bearing — React + a Postgres API + Stripe is the shape;
the specific vendors can change.

---

## 14. Key API surface (illustrative)

```
GET  /api/menu                     → categories + available items (+ allergens)
GET  /api/me/allergens             → current user's avoided allergens
PUT  /api/me/allergens             → replace avoided set
POST /api/cart/validate            → reject blocked/unavailable items server-side
POST /api/orders                   → create pending order (server recomputes totals)
POST /api/payments/intent          → Stripe PaymentIntent for an order
POST /api/webhooks/stripe          → finalise order on payment success
GET  /api/me/orders                → history (auth)
POST /api/me/orders/:id/reorder    → build a cart, skipping blocked/unavailable

# admin (staff-only)
GET/POST/PATCH/DELETE /api/admin/items
PATCH /api/admin/items/:id/availability
GET  /api/admin/orders             → queue
PATCH /api/admin/orders/:id/status → advance New→Preparing→Ready→PickedUp
```

**Server-side safety:** allergen blocking, availability and price are always
**re-validated on the server** at cart-validate and order-create time — the
client UI is a convenience, not the source of truth.

---

## 15. Roadmap

- **Phase 1 — MVP (this spec):** storefront, allergen blocking, Google + guest,
  Stripe pickup orders, admin menu + queue, ready-notifications.
- **Phase 2:** item modifiers/options, promo codes & loyalty, scheduled menus,
  admin refunds, richer analytics, PWA install + web push.
- **Phase 3:** delivery + courier dispatch, multi-location, KDS/printer routing,
  inventory.

---

## 16. Open questions

1. Real cuisine, brand name and logo — keep "Hungry Panda" or replace?
2. Payment provider — Stripe, or an existing merchant account (Square/Adyen)?
3. Is delivery needed soon, or is pickup-only fine for launch?
4. Ready-notification channel priority — SMS, email, or both?
5. Any allergens/diets to add beyond the nine listed (e.g. celery, mustard,
   sulphites, halal/kosher, vegan-strict)?
6. Single location now, or design multi-site from day one?
7. Tax/VAT rules and receipt/invoice requirements for your region.
