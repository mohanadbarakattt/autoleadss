-- 0004_agency.sql — white-label / agency mode (tier D).
-- A white-label agency owns sub-accounts (their clients) and a branding profile.
-- Funnels can be tagged to a sub-account. All owner-scoped by the agency's Clerk id.

begin;

create table if not exists public.agency_settings (
  owner_id   text primary key default (auth.jwt() ->> 'sub'),
  brand_name text,
  accent     text,
  logo_url   text,
  hide_badge boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sub_accounts (
  id            text primary key default gen_random_uuid()::text,
  owner_id      text not null default (auth.jwt() ->> 'sub'),
  name          text not null,
  contact_email text,
  created_at    timestamptz not null default now()
);

alter table public.funnels add column if not exists sub_account_id text references public.sub_accounts (id) on delete set null;

create index if not exists sub_accounts_owner_idx on public.sub_accounts (owner_id);
create index if not exists funnels_subaccount_idx on public.funnels (sub_account_id);

alter table public.agency_settings enable row level security;
alter table public.sub_accounts     enable row level security;

create policy agency_settings_all on public.agency_settings for all to authenticated
  using (owner_id = (select auth.jwt() ->> 'sub'))
  with check (owner_id = (select auth.jwt() ->> 'sub'));

create policy sub_accounts_select on public.sub_accounts for select to authenticated
  using (owner_id = (select auth.jwt() ->> 'sub'));
create policy sub_accounts_insert on public.sub_accounts for insert to authenticated
  with check (owner_id = (select auth.jwt() ->> 'sub'));
create policy sub_accounts_update on public.sub_accounts for update to authenticated
  using (owner_id = (select auth.jwt() ->> 'sub'))
  with check (owner_id = (select auth.jwt() ->> 'sub'));
create policy sub_accounts_delete on public.sub_accounts for delete to authenticated
  using (owner_id = (select auth.jwt() ->> 'sub'));

commit;
