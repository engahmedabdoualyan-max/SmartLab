-- smartLAB — Supabase schema (migration 0001)
-- Shared serverless datastore: Specimens, Pavement Designs, Break Schedules,
-- webhook dispatch logs, and role-isolated profiles (client vs lab staff).
--
-- Run this file in: Supabase Dashboard → SQL Editor (or `supabase db push`).
-- Requires the "auth" schema (Supabase Auth) which exists by default.

-- ============================================================
-- Extension (uuid generation)
-- ============================================================
create extension if not exists pgcrypto;

-- ============================================================
-- Helper: is the current authenticated user a lab staff member?
-- ============================================================
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'staff'
  );
$$;

-- ============================================================
-- profiles — extends Supabase auth.users with a role + contact info
-- ============================================================
create table if not exists public.profiles (
    id          uuid primary key references auth.users(id) on delete cascade,
    role        text not null default 'client'
                check (role in ('client','staff')),
    full_name   text,
    phone       text,
    company     text,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own_or_staff"
    on public.profiles for select
    using (id = auth.uid() or public.is_staff());

create policy "profiles_insert_own"
    on public.profiles for insert
    with check (id = auth.uid());

create policy "profiles_update_own_or_staff"
    on public.profiles for update
    using (id = auth.uid() or public.is_staff());

-- ============================================================
-- specimens — sample lifecycle tracked through the lab
-- ============================================================
create table if not exists public.specimens (
    id               uuid primary key default gen_random_uuid(),
    sample_no        text not null,
    client_id        uuid not null references public.profiles(id) on delete restrict,
    project          text,
    location         text,
    material_type    text not null default 'concrete'
                     check (material_type in ('concrete','asphalt','soil','steel','other')),
    test_type        text,
    status           text not null default 'registered'
                     check (status in ('registered','received','in_progress',
                                       'awaiting_break','tested','approved','rejected')),
    assigned_engineer text,
    results          jsonb not null default '{}'::jsonb,
    notes            text,
    received_at      timestamptz,
    completed_at     timestamptz,
    created_at       timestamptz not null default now(),
    updated_at       timestamptz not null default now(),
    unique (sample_no, client_id)
);

create index if not exists idx_specimens_client on public.specimens(client_id);
create index if not exists idx_specimens_status on public.specimens(status);
create index if not exists idx_specimens_sample on public.specimens(sample_no);

alter table public.specimens enable row level security;

create policy "specimens_select_own_or_staff"
    on public.specimens for select
    using (client_id = auth.uid() or public.is_staff());

create policy "specimens_insert_own_or_staff"
    on public.specimens for insert
    with check (client_id = auth.uid() or public.is_staff());

create policy "specimens_update_own_or_staff"
    on public.specimens for update
    using (client_id = auth.uid() or public.is_staff());

-- ============================================================
-- specimen_status_history — audit trail of lifecycle transitions
-- ============================================================
create table if not exists public.specimen_status_history (
    id          bigserial primary key,
    specimen_id uuid not null references public.specimens(id) on delete cascade,
    status      text not null,
    changed_by  uuid references public.profiles(id),
    note        text,
    created_at  timestamptz not null default now()
);

create index if not exists idx_status_history_specimen
    on public.specimen_status_history(specimen_id, created_at desc);

alter table public.specimen_status_history enable row level security;

create policy "history_select_own_or_staff"
    on public.specimen_status_history for select
    using (
        exists (
            select 1 from public.specimens s
            where s.id = specimen_id and (s.client_id = auth.uid() or public.is_staff())
        )
    );

-- Automatic history row + completed_at when status changes
create or replace function public.on_specimen_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    if new.status is distinct from old.status then
        insert into public.specimen_status_history (specimen_id, status, changed_by, note)
        values (new.id, new.status, auth.uid(), new.notes);
    end if;
    if new.status = 'approved' and new.completed_at is null then
        new.completed_at = now();
    end if;
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists trg_specimen_status_change on public.specimens;
create trigger trg_specimen_status_change
    before update on public.specimens
    for each row execute function public.on_specimen_status_change();

-- ============================================================
-- pavement_designs — saved AASHTO design parameters (for LandXML re-export)
-- ============================================================
create table if not exists public.pavement_designs (
    id            uuid primary key default gen_random_uuid(),
    client_id     uuid not null references public.profiles(id) on delete cascade,
    project_name  text,
    route_name    text,
    location      text,
    designer      text,
    agency        text,
    design_type   text not null default 'flexible',
    params        jsonb not null default '{}'::jsonb,   -- inputs (designLife, reliability, mr, ...)
    results       jsonb not null default '{}'::jsonb,   -- outputs (SN, W18, thickness total)
    thicknesses   jsonb not null default '{}'::jsonb,   -- layer thickness table (D1, D2, D3)
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
);

alter table public.pavement_designs enable row level security;

create policy "pavement_select_own_or_staff"
    on public.pavement_designs for select
    using (client_id = auth.uid() or public.is_staff());

create policy "pavement_insert_own_or_staff"
    on public.pavement_designs for insert
    with check (client_id = auth.uid() or public.is_staff());

create policy "pavement_update_own_or_staff"
    on public.pavement_designs for update
    using (client_id = auth.uid() or public.is_staff());

-- ============================================================
-- break_schedules — concrete break/set schedule per specimen
-- ============================================================
create table if not exists public.break_schedules (
    id            uuid primary key default gen_random_uuid(),
    specimen_id   uuid not null references public.specimens(id) on delete cascade,
    schedule_date timestamptz not null,
    status        text not null default 'scheduled'
                  check (status in ('scheduled','completed','missed','rescheduled')),
    scheduled_by  uuid references public.profiles(id),
    notes         text,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
);

alter table public.break_schedules enable row level security;

create policy "break_select_own_or_staff"
    on public.break_schedules for select
    using (
        exists (
            select 1 from public.specimens s
            where s.id = specimen_id and (s.client_id = auth.uid() or public.is_staff())
        )
    );

create policy "break_insert_staff"
    on public.break_schedules for insert
    with check (public.is_staff());

create policy "break_update_staff"
    on public.break_schedules for update
    using (public.is_staff());

-- ============================================================
-- webhook_logs — dispatch audit trail (WhatsApp / SMS / generic)
-- ============================================================
create table if not exists public.webhook_logs (
    id          bigserial primary key,
    specimen_id uuid references public.specimens(id) on delete set null,
    event       text not null,                 -- e.g. 'specimen.approved'
    provider    text not null default 'dry_run', -- twilio_whatsapp | twilio_sms | generic_webhook | dry_run
    destination text,
    payload     jsonb not null default '{}'::jsonb,
    status      text not null default 'queued' check (status in ('queued','sent','failed')),
    response    jsonb not null default '{}'::jsonb,
    created_at  timestamptz not null default now()
);

alter table public.webhook_logs enable row level security;

create policy "webhook_logs_select_staff"
    on public.webhook_logs for select
    using (public.is_staff());

create policy "webhook_logs_insert_staff"
    on public.webhook_logs for insert
    with check (public.is_staff());

-- ============================================================
-- Convenience view: webhook dispatch log with specimen context
-- ============================================================
create or replace view public.v_webhook_logs as
select
    w.id,
    w.event,
    w.provider,
    w.destination,
    w.status as dispatch_status,
    w.payload,
    w.response,
    w.created_at,
    s.sample_no,
    s.project
from public.webhook_logs w
left join public.specimens s on s.id = w.specimen_id;

-- ============================================================
-- Friendly helpers for day-to-day ops (run from SQL Editor)
-- ============================================================
-- Promote a registered user to lab staff:
--   update public.profiles set role = 'staff' where id = '<user-uuid>';
-- List all active specimens with their latest status:
--   select sample_no, status, updated_at from public.specimens order by updated_at desc;
