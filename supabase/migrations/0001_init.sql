-- Hungry Panda — initial schema (Postgres / Supabase)
-- Mirrors src/domain/types.ts. Apply with the Supabase CLI or SQL editor.
-- The app defaults to an in-memory store; wire SupabaseStore (see
-- supabase/README.md) to use this schema in production.

create extension if not exists pgcrypto;

-- Controlled allergen vocabulary -------------------------------------------
create table if not exists allergens (
  id      text primary key,
  label   text not null,
  example text not null default ''
);

-- Menu ----------------------------------------------------------------------
create table if not exists categories (
  id          text primary key,
  name        text not null,
  blurb       text not null default '',
  emoji       text not null default '',
  gradient    text[] not null default '{}',
  sort_order  int  not null default 0,
  active      boolean not null default true
);

create table if not exists menu_items (
  id           uuid primary key default gen_random_uuid(),
  category_id  text not null references categories(id) on delete restrict,
  name         text not null,
  description  text not null default '',
  price_cents  int  not null check (price_cents >= 0),
  emoji        text not null default '',
  spice_level  int  not null default 0 check (spice_level between 0 and 3),
  vegetarian   boolean not null default false,
  popular      boolean not null default false,
  available    boolean not null default true,
  allergens    text[]  not null default '{}', -- subset of allergens.id
  sort_order   int  not null default 0,
  created_at   timestamptz not null default now()
);
create index if not exists menu_items_category_idx on menu_items(category_id);

-- Users / profiles (1:1 with Supabase auth.users) ---------------------------
create table if not exists profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text not null,
  name            text not null default '',
  phone           text,
  role            text not null default 'customer'
                    check (role in ('customer','staff','admin')),
  allergens       text[] not null default '{}',
  marketing_opt_in boolean not null default false,
  created_at      timestamptz not null default now()
);

create table if not exists staff_allowlist (
  email text primary key,
  role  text not null default 'staff' check (role in ('staff','admin'))
);

-- Orders --------------------------------------------------------------------
create table if not exists orders (
  id             uuid primary key default gen_random_uuid(),
  code           text unique not null,
  user_id        uuid references profiles(id) on delete set null, -- null = guest
  customer_name  text not null,
  contact_phone  text,
  status         text not null default 'new'
                   check (status in ('new','preparing','ready','pickedup')),
  pickup_type    text not null default 'asap' check (pickup_type in ('asap','scheduled')),
  pickup_at      text,
  subtotal_cents int  not null,
  tax_cents      int  not null,
  total_cents    int  not null,
  notes          text,
  payment_status text not null default 'pending'
                   check (payment_status in ('pending','paid','failed')),
  payment_ref    text,
  created_at     timestamptz not null default now()
);
create index if not exists orders_user_idx on orders(user_id);
create index if not exists orders_status_idx on orders(status);

create table if not exists order_items (
  id                 uuid primary key default gen_random_uuid(),
  order_id           uuid not null references orders(id) on delete cascade,
  item_id            text not null,
  name_snapshot      text not null,
  unit_price_cents   int  not null,
  quantity           int  not null check (quantity > 0),
  allergens_snapshot text[] not null default '{}'
);
create index if not exists order_items_order_idx on order_items(order_id);

-- Row-Level Security --------------------------------------------------------
-- Staff check based on the caller's profile role.
create or replace function is_staff() returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role in ('staff','admin')
  );
$$;

alter table allergens        enable row level security;
alter table categories       enable row level security;
alter table menu_items       enable row level security;
alter table profiles         enable row level security;
alter table staff_allowlist  enable row level security;
alter table orders           enable row level security;
alter table order_items      enable row level security;

-- Menu & allergens: world-readable, staff-writable.
create policy menu_public_read   on menu_items for select using (true);
create policy menu_staff_write   on menu_items for all using (is_staff()) with check (is_staff());
create policy cat_public_read    on categories for select using (true);
create policy cat_staff_write    on categories for all using (is_staff()) with check (is_staff());
create policy allg_public_read   on allergens  for select using (true);

-- Profiles: a user reads/updates only their own row; staff read all.
create policy profile_self_read   on profiles for select using (id = auth.uid() or is_staff());
create policy profile_self_update on profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy profile_self_insert on profiles for insert with check (id = auth.uid());

-- Orders: customers see their own; staff see & manage all.
-- (Guest orders have user_id null and are created via the service role.)
create policy order_own_read   on orders for select using (user_id = auth.uid() or is_staff());
create policy order_own_insert on orders for insert with check (user_id = auth.uid());
create policy order_staff_all  on orders for update using (is_staff()) with check (is_staff());

create policy oi_read  on order_items for select using (
  exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_staff()))
);
create policy oi_staff on order_items for all using (is_staff()) with check (is_staff());

create policy staff_read on staff_allowlist for select using (is_staff());
