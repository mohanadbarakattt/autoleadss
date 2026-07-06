-- 0001_saas.sql — AutoLeadss SaaS schema (Supabase / Postgres)
-- Auth: Clerk (Third-Party Auth). owner_id = Clerk user id (JWT `sub`), defaulted
-- from the request token so clients never send it. RLS restricts every table to
-- its owner; the public published-funnel page reaches data only via SECURITY
-- DEFINER functions (never broad table grants). IDs are text to match the app's
-- client-generated ids (offline-first / optimistic writes).

begin;

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.workspaces (
  id         text primary key default gen_random_uuid()::text,
  owner_id   text not null default (auth.jwt() ->> 'sub'),
  name       text not null,
  region     text not null default 'gulf',
  plan       text not null default 'starter',
  created_at timestamptz not null default now()
);

create table if not exists public.funnels (
  id           text primary key default gen_random_uuid()::text,
  owner_id     text not null default (auth.jwt() ->> 'sub'),
  workspace_id text references public.workspaces (id) on delete set null,
  name         text not null,
  slug         text not null unique,
  industry     text not null,
  language     text not null,
  status       text not null default 'draft',
  accent       text,
  spec         jsonb not null default '{}'::jsonb,
  visits       integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.leads (
  id         text primary key default gen_random_uuid()::text,
  funnel_id  text not null references public.funnels (id) on delete cascade,
  owner_id   text not null default (auth.jwt() ->> 'sub'),
  name       text,
  phone      text,
  email      text,
  message    text,
  source     text not null default 'page',
  status     text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id         text primary key default gen_random_uuid()::text,
  owner_id   text not null default (auth.jwt() ->> 'sub'),
  funnel_id  text references public.funnels (id) on delete cascade,
  type       text not null,
  meta       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.media_jobs (
  id         text primary key default gen_random_uuid()::text,
  owner_id   text not null default (auth.jwt() ->> 'sub'),
  funnel_id  text references public.funnels (id) on delete cascade,
  kind       text not null,
  status     text not null default 'queued',
  payload    jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes (slug already unique via inline constraint)
-- ---------------------------------------------------------------------------

create index if not exists workspaces_owner_id_idx    on public.workspaces (owner_id);
create index if not exists funnels_owner_id_idx        on public.funnels (owner_id);
create index if not exists funnels_status_idx          on public.funnels (status);
create index if not exists leads_owner_id_idx          on public.leads (owner_id);
create index if not exists leads_funnel_id_idx         on public.leads (funnel_id);
create index if not exists activity_logs_owner_id_idx  on public.activity_logs (owner_id);
create index if not exists media_jobs_owner_id_idx     on public.media_jobs (owner_id);

-- ---------------------------------------------------------------------------
-- Row Level Security — owner-only, scoped to the Clerk user id.
-- ---------------------------------------------------------------------------

alter table public.workspaces    enable row level security;
alter table public.funnels       enable row level security;
alter table public.leads         enable row level security;
alter table public.activity_logs enable row level security;
alter table public.media_jobs    enable row level security;

do $$
declare t text;
begin
  foreach t in array array['workspaces','funnels','leads','activity_logs','media_jobs']
  loop
    execute format($f$
      create policy %1$s_select on public.%1$s for select to authenticated
        using (owner_id = (select auth.jwt() ->> 'sub'));
      create policy %1$s_insert on public.%1$s for insert to authenticated
        with check (owner_id = (select auth.jwt() ->> 'sub'));
      create policy %1$s_update on public.%1$s for update to authenticated
        using (owner_id = (select auth.jwt() ->> 'sub'))
        with check (owner_id = (select auth.jwt() ->> 'sub'));
      create policy %1$s_delete on public.%1$s for delete to authenticated
        using (owner_id = (select auth.jwt() ->> 'sub'));
    $f$, t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Public published-funnel access (SECURITY DEFINER, search_path pinned).
-- ---------------------------------------------------------------------------

create or replace function public.get_published_funnel(p_slug text)
returns table (id text, name text, slug text, industry text, language text, accent text, spec jsonb, status text)
language sql security definer set search_path = public stable as $$
  select f.id, f.name, f.slug, f.industry, f.language, f.accent, f.spec, f.status
  from public.funnels f
  where f.slug = p_slug and f.status = 'published';
$$;

create or replace function public.increment_visit(p_slug text)
returns void language sql security definer set search_path = public volatile as $$
  update public.funnels set visits = visits + 1
  where slug = p_slug and status = 'published';
$$;

create or replace function public.capture_lead(
  p_slug text, p_name text, p_phone text, p_email text, p_message text, p_source text default 'page'
) returns void language plpgsql security definer set search_path = public volatile as $$
declare v_funnel_id text; v_owner_id text;
begin
  select f.id, f.owner_id into v_funnel_id, v_owner_id
  from public.funnels f where f.slug = p_slug and f.status = 'published';
  if v_funnel_id is null then
    raise exception 'Funnel not found or not published: %', p_slug using errcode = 'no_data_found';
  end if;
  insert into public.leads (funnel_id, owner_id, name, phone, email, message, source, status)
  values (v_funnel_id, v_owner_id, p_name, p_phone, p_email, p_message, coalesce(p_source, 'page'), 'new');
end;
$$;

-- Ensure definer functions are owned by the table owner so they bypass RLS
-- regardless of the migration role.
alter function public.get_published_funnel(text) owner to postgres;
alter function public.increment_visit(text)       owner to postgres;
alter function public.capture_lead(text, text, text, text, text, text) owner to postgres;

revoke all on function public.get_published_funnel(text) from public;
revoke all on function public.increment_visit(text)       from public;
revoke all on function public.capture_lead(text, text, text, text, text, text) from public;

grant execute on function public.get_published_funnel(text) to anon, authenticated;
grant execute on function public.increment_visit(text)       to anon, authenticated;
grant execute on function public.capture_lead(text, text, text, text, text, text) to anon, authenticated;

commit;
