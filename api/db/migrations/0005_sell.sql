-- 0005_sell.sql — Phase 4a: the Sell data model (products, orders, order_items).
--
-- Scope: `autoleadss` schema only, same ownership model as 0001-0004 —
-- `clerk_user_id text references public.users(clerk_user_id)`, no RLS,
-- authorization enforced in api/ via requireClerkUser + `where clerk_user_id = $1`.
--
-- `clerk_user_id` on products/orders is always the MERCHANT (the storefront
-- owner), never the buyer — a buyer has no AutoLeadss account.
--
-- Money is integer minor units (fils/cents) everywhere — no floats, no
-- decimals — enforced by each *_minor column's CHECK constraint, same
-- discipline as 0004_payments.sql.
--
-- Idempotent — safe to re-run against an already-provisioned database.
--
-- Apply with (see api/db/migrations/README.md for details):
--   psql "$DIRECT_URL" -f api/db/migrations/0005_sell.sql

begin;

create schema if not exists autoleadss;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists autoleadss.products (
  id            text primary key,
  clerk_user_id text not null references public.users (clerk_user_id),
  name          text not null,
  description   text,
  image_url     text,
  price_minor   bigint not null check (price_minor > 0),
  currency      text not null check (currency ~ '^[A-Z]{3}$'),
  stock         integer not null default 0 check (stock >= 0),
  status        text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists autoleadss.orders (
  id              text primary key,
  clerk_user_id   text not null references public.users (clerk_user_id),
  status          text not null default 'pending' check (status in ('pending', 'paid', 'cancelled', 'refunded')),
  subtotal_minor  bigint not null check (subtotal_minor > 0),
  currency        text not null check (currency ~ '^[A-Z]{3}$'),
  payment_id      text references autoleadss.payments (id),
  buyer_name      text,
  buyer_email     text,
  buyer_phone     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Line items SNAPSHOT the name and unit price AS SOLD, rather than joining
-- live to `products`. This is an accounting-integrity requirement, not a
-- nicety: once an order exists, its recorded value must never move under it.
-- If a merchant later edits a product's name/price, or deletes it (deletion
-- archives instead when the product is referenced here — see
-- api/products/[id].ts), every past order that sold it must keep showing
-- exactly what the buyer paid at the time. A line item that re-reads the
-- live product row would silently reprice historical orders whenever the
-- catalogue changes — a corrupted ledger, not a display bug.
create table if not exists autoleadss.order_items (
  id                text primary key,
  order_id          text not null references autoleadss.orders (id) on delete cascade,
  product_id        text references autoleadss.products (id),
  name_snapshot     text not null,
  unit_price_minor  bigint not null check (unit_price_minor > 0),
  quantity          integer not null check (quantity > 0),
  currency          text not null
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists products_clerk_user_id_idx on autoleadss.products (clerk_user_id);

create index if not exists orders_clerk_user_id_idx on autoleadss.orders (clerk_user_id);
create index if not exists orders_payment_id_idx on autoleadss.orders (payment_id);

create index if not exists order_items_order_id_idx on autoleadss.order_items (order_id);

commit;
