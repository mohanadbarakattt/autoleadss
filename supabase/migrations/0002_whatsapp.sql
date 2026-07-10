-- 0002_whatsapp.sql — WhatsApp Cloud API (BYO WABA per tenant).
-- Each funnel can attach the customer's own WhatsApp number. The webhook edge
-- function reads these with the service role (bypassing RLS); the dashboard
-- manages them under owner-scoped RLS.

begin;

create table if not exists public.whatsapp_connections (
  id              text primary key default gen_random_uuid()::text,
  owner_id        text not null default (auth.jwt() ->> 'sub'),
  funnel_id       text references public.funnels (id) on delete cascade,
  phone_number_id text not null unique,       -- Meta phone_number_id
  waba_id         text,
  access_token    text not null,              -- customer's Cloud API token (pass-through)
  verify_token    text not null,              -- webhook verification token
  display_phone   text,
  status          text not null default 'connected',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.whatsapp_messages (
  id           text primary key default gen_random_uuid()::text,
  owner_id     text not null,
  funnel_id    text references public.funnels (id) on delete cascade,
  wa_id        text not null,                 -- contact's WhatsApp id (phone)
  profile_name text,
  direction    text not null,                 -- 'in' | 'out'
  body         text,
  created_at   timestamptz not null default now()
);

create index if not exists wa_conn_phone_idx    on public.whatsapp_connections (phone_number_id);
create index if not exists wa_conn_funnel_idx    on public.whatsapp_connections (funnel_id);
create index if not exists wa_conn_owner_idx      on public.whatsapp_connections (owner_id);
create index if not exists wa_msg_owner_idx       on public.whatsapp_messages (owner_id);
create index if not exists wa_msg_funnel_wa_idx   on public.whatsapp_messages (funnel_id, wa_id);

alter table public.whatsapp_connections enable row level security;
alter table public.whatsapp_messages    enable row level security;

do $$
declare t text;
begin
  foreach t in array array['whatsapp_connections','whatsapp_messages']
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

commit;
