begin;

create schema if not exists private;
grant usage on schema private to anon, authenticated;

create function private.valid_vehicle_field_options(kind text, choices jsonb)
returns boolean language plpgsql immutable set search_path = '' as $$
begin
  if jsonb_typeof(choices) <> 'array' then return false; end if;
  if kind <> 'select' then return choices = '[]'::jsonb; end if;
  if jsonb_array_length(choices) not between 1 and 50 then return false; end if;
  return not exists (
    select 1 from jsonb_array_elements(choices) item
    where jsonb_typeof(item) <> 'string' or length(btrim(item #>> '{}')) not between 1 and 80
      or (item #>> '{}') <> btrim(item #>> '{}')
  ) and (select count(*) = count(distinct lower(value)) from jsonb_array_elements_text(choices));
end;
$$;
revoke all on function private.valid_vehicle_field_options(text, jsonb) from public;
grant execute on function private.valid_vehicle_field_options(text, jsonb) to anon, authenticated;

create table public.vehicle_types (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete restrict,
  system_key text unique,
  name text not null check (length(btrim(name)) between 1 and 80 and name = btrim(name)),
  icon text not null check (icon in ('car', 'motorcycle', 'trailer', 'caravan', 'motorhome', 'van', 'other')),
  sort_order integer not null default 0 check (sort_order >= 0),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  constraint vehicle_type_ownership check ((owner_id is null) = (system_key is not null))
);
create unique index vehicle_types_owner_name on public.vehicle_types(owner_id, lower(name)) where archived_at is null;

create table public.vehicle_field_definitions (
  id uuid primary key default gen_random_uuid(),
  vehicle_type_id uuid not null references public.vehicle_types(id) on delete restrict,
  owner_id uuid references auth.users(id) on delete restrict,
  name text not null check (length(btrim(name)) between 1 and 80 and name = btrim(name)),
  data_type text not null check (data_type in ('text', 'integer', 'decimal', 'date', 'boolean', 'select')),
  unit text check (unit is null or (length(btrim(unit)) between 1 and 24 and unit = btrim(unit))),
  required boolean not null default false,
  sort_order integer not null default 1000 check (sort_order between 0 and 10000),
  options jsonb not null default '[]'::jsonb,
  revision integer not null default 1,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  constraint vehicle_field_options check (private.valid_vehicle_field_options(data_type, options))
);
create index vehicle_fields_parent_owner on public.vehicle_field_definitions(vehicle_type_id, owner_id);

-- Future vehicle values must reference a revision ID, never mutable definitions.
create table public.vehicle_field_revisions (
  id uuid primary key default gen_random_uuid(),
  field_id uuid not null references public.vehicle_field_definitions(id) on delete restrict,
  revision integer not null,
  definition jsonb not null,
  created_at timestamptz not null default now(),
  unique(field_id, revision)
);

create function private.increment_vehicle_field_revision()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.id <> old.id or new.owner_id is distinct from old.owner_id
    or new.vehicle_type_id <> old.vehicle_type_id then
    raise exception 'Field identity and ownership are immutable' using errcode = '42501';
  end if;
  new.revision := old.revision + 1;
  return new;
end;
$$;
create function private.capture_vehicle_field_revision()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.vehicle_field_revisions(field_id, revision, definition)
  values (new.id, new.revision, to_jsonb(new) - 'created_at' - 'revision');
  return new;
end;
$$;
revoke all on function private.increment_vehicle_field_revision() from public;
revoke all on function private.capture_vehicle_field_revision() from public;
create trigger vehicle_field_increment before update on public.vehicle_field_definitions
for each row execute function private.increment_vehicle_field_revision();
create trigger vehicle_field_capture after insert or update on public.vehicle_field_definitions
for each row execute function private.capture_vehicle_field_revision();

alter table public.vehicle_types enable row level security;
alter table public.vehicle_field_definitions enable row level security;
alter table public.vehicle_field_revisions enable row level security;

revoke all on public.vehicle_types, public.vehicle_field_definitions, public.vehicle_field_revisions from public, anon, authenticated;
grant select on public.vehicle_types, public.vehicle_field_definitions, public.vehicle_field_revisions to anon, authenticated;
grant insert (owner_id, name, icon) on public.vehicle_types to authenticated;
grant update (name, icon, archived_at) on public.vehicle_types to authenticated;
grant insert (vehicle_type_id, owner_id, name, data_type, unit, required, sort_order, options) on public.vehicle_field_definitions to authenticated;
grant update (name, data_type, unit, required, sort_order, options, archived_at) on public.vehicle_field_definitions to authenticated;

create policy vehicle_types_read on public.vehicle_types for select to anon, authenticated
using (owner_id is null or owner_id = (select auth.uid()));
create policy vehicle_types_insert on public.vehicle_types for insert to authenticated
with check (owner_id = (select auth.uid()) and system_key is null);
create policy vehicle_types_update on public.vehicle_types for update to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()) and system_key is null);

create policy vehicle_fields_read on public.vehicle_field_definitions for select to anon, authenticated
using ((owner_id is null or owner_id = (select auth.uid())) and exists (
  select 1 from public.vehicle_types t where t.id = vehicle_type_id
    and (t.owner_id is null or t.owner_id = (select auth.uid()))
));
create policy vehicle_fields_insert on public.vehicle_field_definitions for insert to authenticated
with check (owner_id = (select auth.uid()) and exists (
  select 1 from public.vehicle_types t where t.id = vehicle_type_id and t.archived_at is null
    and (t.owner_id is null or t.owner_id = (select auth.uid()))
));
create policy vehicle_fields_update on public.vehicle_field_definitions for update to authenticated
using (owner_id = (select auth.uid()) and exists (
  select 1 from public.vehicle_types t where t.id = vehicle_type_id and t.archived_at is null
    and (t.owner_id is null or t.owner_id = (select auth.uid()))
))
with check (owner_id = (select auth.uid()) and exists (
  select 1 from public.vehicle_types t where t.id = vehicle_type_id and t.archived_at is null
    and (t.owner_id is null or t.owner_id = (select auth.uid()))
));
create policy vehicle_field_revisions_read on public.vehicle_field_revisions for select to anon, authenticated
using (exists (select 1 from public.vehicle_field_definitions f where f.id = field_id));

create function public.reorder_vehicle_fields(p_vehicle_type_id uuid, p_field_ids uuid[])
returns void language plpgsql security invoker set search_path = '' as $$
declare expected_count integer;
begin
  if auth.uid() is null or p_field_ids is null then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  -- Serialize reorders per owner and parent without needing write access to standard types.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_vehicle_type_id::text || auth.uid()::text, 0));
  perform 1 from public.vehicle_types t where t.id = p_vehicle_type_id and t.archived_at is null
    and (t.owner_id is null or t.owner_id = auth.uid());
  if not found then raise exception 'Type not available' using errcode = '42501'; end if;
  select count(*) into expected_count from public.vehicle_field_definitions
    where vehicle_type_id = p_vehicle_type_id and owner_id = auth.uid() and archived_at is null;
  if cardinality(p_field_ids) <> expected_count or expected_count > 9000
    or (select count(distinct id) from unnest(p_field_ids) id) <> expected_count
    or exists (
      select 1 from unnest(p_field_ids) requested(id) where not exists (
        select 1 from public.vehicle_field_definitions f where f.id = requested.id
          and f.vehicle_type_id = p_vehicle_type_id and f.owner_id = auth.uid() and f.archived_at is null
      )
    ) then raise exception 'Field list changed. Reload and try again.' using errcode = '40001'; end if;
  update public.vehicle_field_definitions f set sort_order = 999 + ordered.position::integer
  from unnest(p_field_ids) with ordinality as ordered(id, position)
  where f.id = ordered.id and f.owner_id = auth.uid() and f.vehicle_type_id = p_vehicle_type_id
    and f.sort_order is distinct from 999 + ordered.position::integer;
end;
$$;
revoke all on function public.reorder_vehicle_fields(uuid, uuid[]) from public, anon;
grant execute on function public.reorder_vehicle_fields(uuid, uuid[]) to authenticated;

commit;
