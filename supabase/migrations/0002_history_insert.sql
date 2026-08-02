-- smartLAB — 0002: initial audit row when a specimen is first registered.
-- The 0001 trigger (trg_specimen_status_change) is BEFORE UPDATE only, so a
-- freshly registered specimen had no timeline entry. This insert trigger logs
-- the 'registered' state so the client timeline is populated from day one.

create or replace function public.on_specimen_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.specimen_status_history (specimen_id, status, changed_by, note)
    values (new.id, new.status, new.client_id, new.notes);
    return new;
end;
$$;

drop trigger if exists trg_specimen_status_insert on public.specimens;
create trigger trg_specimen_status_insert
    before insert on public.specimens
    for each row execute function public.on_specimen_insert();
