-- smartLAB — projects (migration 0003)
-- Curated per-client project list used by the Register Sample modal so the
-- PROJECT field is a dropdown instead of free text.
--
-- Run this file in: Supabase Dashboard → SQL Editor (or `supabase db push`).
-- Requires the public.profiles table and public.is_staff() from migration 0001.

create table if not exists public.projects (
    id          uuid primary key default gen_random_uuid(),
    client_id   uuid not null references public.profiles(id) on delete cascade,
    name        text not null,
    is_active   boolean not null default true,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now(),
    unique (client_id, name)
);

create index if not exists idx_projects_client on public.projects(client_id);

alter table public.projects enable row level security;

-- ============================================================
-- RLS POLICIES (own rows, or any row for lab staff)
-- ============================================================
create policy "projects_select_own_or_staff"
    on public.projects for select
    using (client_id = auth.uid() or public.is_staff());

create policy "projects_insert_own_or_staff"
    on public.projects for insert
    with check (client_id = auth.uid() or public.is_staff());

create policy "projects_update_own_or_staff"
    on public.projects for update
    using (client_id = auth.uid() or public.is_staff());

create policy "projects_delete_own_or_staff"
    on public.projects for delete
    using (client_id = auth.uid() or public.is_staff());

-- ============================================================
-- Optional: seed from projects already referenced by specimens
-- (one-time, idempotent):
--   insert into public.projects (client_id, name)
--   select distinct client_id, project
--   from public.specimens
--   where project is not null and btrim(project) <> ''
--   on conflict (client_id, name) do nothing;
-- ============================================================
