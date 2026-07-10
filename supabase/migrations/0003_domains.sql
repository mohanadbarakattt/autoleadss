-- 0003_domains.sql — custom domains / subdomains for published funnels.
-- Each funnel can be served on {slug}.autoleadss.site (free) or a mapped custom
-- domain. The public page resolves a host → published funnel via a SECURITY
-- DEFINER RPC (no broad table access).

begin;

create table if not exists public.domains (
  id         text primary key default gen_random_uuid()::text,
  owner_id   text not null default (auth.jwt() ->> 'sub'),
  funnel_id  text references public.funnels (id) on delete cascade,
  hostname   text not null unique,
  verified   boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists domains_owner_idx  on public.domains (owner_id);
create index if not exists domains_funnel_idx on public.domains (funnel_id);

alter table public.domains enable row level security;

create policy domains_select on public.domains for select to authenticated
  using (owner_id = (select auth.jwt() ->> 'sub'));
create policy domains_insert on public.domains for insert to authenticated
  with check (owner_id = (select auth.jwt() ->> 'sub'));
create policy domains_update on public.domains for update to authenticated
  using (owner_id = (select auth.jwt() ->> 'sub'))
  with check (owner_id = (select auth.jwt() ->> 'sub'));
create policy domains_delete on public.domains for delete to authenticated
  using (owner_id = (select auth.jwt() ->> 'sub'));

-- Public: resolve a host to its published funnel (safe columns only).
create or replace function public.get_published_funnel_by_host(p_host text)
returns table (id text, name text, slug text, industry text, language text, accent text, spec jsonb, status text)
language sql security definer set search_path = public stable as $$
  select f.id, f.name, f.slug, f.industry, f.language, f.accent, f.spec, f.status
  from public.domains d
  join public.funnels f on f.id = d.funnel_id
  where d.hostname = p_host and f.status = 'published'
  limit 1;
$$;

alter function public.get_published_funnel_by_host(text) owner to postgres;
revoke all on function public.get_published_funnel_by_host(text) from public;
grant execute on function public.get_published_funnel_by_host(text) to anon, authenticated;

commit;
