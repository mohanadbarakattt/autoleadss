-- 0005_public_branding.sql — carry the funnel owner's white-label branding into the
-- public published-funnel RPCs, so remote public pages honor hide-badge / brand
-- (not just the demo/local path). Return type changes require drop + recreate.

begin;

drop function if exists public.get_published_funnel(text);
create function public.get_published_funnel(p_slug text)
returns table (id text, name text, slug text, industry text, language text, accent text, spec jsonb, status text, brand_name text, hide_badge boolean)
language sql security definer set search_path = public stable as $$
  select f.id, f.name, f.slug, f.industry, f.language, f.accent, f.spec, f.status,
         a.brand_name, coalesce(a.hide_badge, false)
  from public.funnels f
  left join public.agency_settings a on a.owner_id = f.owner_id
  where f.slug = p_slug and f.status = 'published';
$$;
alter function public.get_published_funnel(text) owner to postgres;
revoke all on function public.get_published_funnel(text) from public;
grant execute on function public.get_published_funnel(text) to anon, authenticated;

drop function if exists public.get_published_funnel_by_host(text);
create function public.get_published_funnel_by_host(p_host text)
returns table (id text, name text, slug text, industry text, language text, accent text, spec jsonb, status text, brand_name text, hide_badge boolean)
language sql security definer set search_path = public stable as $$
  select f.id, f.name, f.slug, f.industry, f.language, f.accent, f.spec, f.status,
         a.brand_name, coalesce(a.hide_badge, false)
  from public.domains d
  join public.funnels f on f.id = d.funnel_id
  left join public.agency_settings a on a.owner_id = f.owner_id
  where d.hostname = p_host and f.status = 'published'
  limit 1;
$$;
alter function public.get_published_funnel_by_host(text) owner to postgres;
revoke all on function public.get_published_funnel_by_host(text) from public;
grant execute on function public.get_published_funnel_by_host(text) to anon, authenticated;

commit;
