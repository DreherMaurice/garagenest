-- Run after both migrations as postgres (SQL Editor or psql).
-- Test fixtures and mutations are rolled back, including auth.users inserts.
begin;
insert into auth.users(id) values
('10000000-0000-4000-8000-000000000001'),
('10000000-0000-4000-8000-000000000002');

create function pg_temp.assert_true(value boolean, message text)
returns void language plpgsql as $$ begin
  if value is distinct from true then raise exception 'Assertion failed: %', message; end if;
end; $$;

set local role anon;
select pg_temp.assert_true((select count(*) = 7 from public.vehicle_types where owner_id is null), 'seven standard types readable anonymously');
select pg_temp.assert_true((select count(*) > 35 from public.vehicle_field_definitions), 'standard fields readable anonymously');
do $$ begin
  begin
    insert into public.vehicle_types(owner_id, name, icon) values ('10000000-0000-4000-8000-000000000001', 'Not allowed', 'other');
    raise exception 'Anonymous write was allowed';
  exception when insufficient_privilege then null; end;
end; $$;

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
insert into public.vehicle_types(owner_id, name, icon) values (auth.uid(), 'Security test A', 'other');
insert into public.vehicle_field_definitions(vehicle_type_id, owner_id, name, data_type, options)
select id, auth.uid(), 'Test dropdown', 'select', '["A", "B"]' from public.vehicle_types where name = 'Security test A';
insert into public.vehicle_field_definitions(vehicle_type_id, owner_id, name, data_type)
values ('00000000-0000-4000-8000-000000000001', auth.uid(), 'Personal extension A', 'decimal');

with updated as (
  update public.vehicle_types set name = 'Hacked' where owner_id is null returning id
) select pg_temp.assert_true((select count(*) = 0 from updated), 'standard types cannot be updated');
with updated as (
  update public.vehicle_field_definitions set name = 'Hacked' where owner_id is null returning id
) select pg_temp.assert_true((select count(*) = 0 from updated), 'standard fields cannot be updated');

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000002', true);
select pg_temp.assert_true((select count(*) = 0 from public.vehicle_types where name = 'Security test A'), 'other owner type is hidden');
select pg_temp.assert_true((select count(*) = 0 from public.vehicle_field_definitions where name in ('Test dropdown', 'Personal extension A')), 'other owner fields are hidden even on a standard type');
with updated as (
  update public.vehicle_field_definitions set name = 'Hacked' where name = 'Personal extension A' returning id
) select pg_temp.assert_true((select count(*) = 0 from updated), 'other owner fields cannot be changed');
insert into public.vehicle_types(owner_id, name, icon) values (auth.uid(), 'Security test B', 'van');
insert into public.vehicle_field_definitions(vehicle_type_id, owner_id, name, data_type)
values ('00000000-0000-4000-8000-000000000001', auth.uid(), 'Personal extension B', 'text');

-- Obtain IDs as the fixture administrator, then try forged parent links as A.
reset role;
select set_config('test.foreign_type', (select id::text from public.vehicle_types where name = 'Security test B'), true);
select set_config('test.foreign_field', (select id::text from public.vehicle_field_definitions where name = 'Personal extension B'), true);
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
do $$ begin
  begin
    insert into public.vehicle_field_definitions(vehicle_type_id, owner_id, name, data_type)
    values (current_setting('test.foreign_type')::uuid, auth.uid(), 'Forged parent', 'text');
    raise exception 'Foreign parent accepted';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.vehicle_types(owner_id, name, icon)
    values ('10000000-0000-4000-8000-000000000002', 'Forged owner', 'car');
    raise exception 'Foreign owner accepted';
  exception when insufficient_privilege then null; end;
  begin
    update public.vehicle_field_definitions set owner_id = '10000000-0000-4000-8000-000000000002' where name = 'Personal extension A';
    raise exception 'Ownership could be changed';
  exception when insufficient_privilege then null; end;
  begin
    update public.vehicle_field_definitions set vehicle_type_id = current_setting('test.foreign_type')::uuid where name = 'Personal extension A';
    raise exception 'Parent could be changed';
  exception when insufficient_privilege then null; end;
  begin
    perform public.reorder_vehicle_fields('00000000-0000-4000-8000-000000000001', array[current_setting('test.foreign_field')::uuid]);
    raise exception 'Reorder accepted foreign field';
  exception when serialization_failure then null; end;
end; $$;

select public.reorder_vehicle_fields('00000000-0000-4000-8000-000000000001', array[
  (select id from public.vehicle_field_definitions where name = 'Personal extension A')
]);
select pg_temp.assert_true((select sort_order = 1000 from public.vehicle_field_definitions where name = 'Personal extension A'), 'own standard-type extension reordered');

update public.vehicle_field_definitions set options = '["New"]' where name = 'Test dropdown';
select pg_temp.assert_true((select count(*) = 2 from public.vehicle_field_revisions r
  join public.vehicle_field_definitions f on f.id = r.field_id where f.name = 'Test dropdown'), 'editing retains old revision');
select pg_temp.assert_true((select r.definition->'options' = '["A", "B"]'::jsonb from public.vehicle_field_revisions r
  join public.vehicle_field_definitions f on f.id = r.field_id where f.name = 'Test dropdown' and r.revision = 1), 'old dropdown options remain unchanged');
update public.vehicle_field_definitions set archived_at = now() where name = 'Test dropdown';
select pg_temp.assert_true((select count(*) = 3 from public.vehicle_field_revisions r
  join public.vehicle_field_definitions f on f.id = r.field_id where f.name = 'Test dropdown'), 'archive retains all revisions');
do $$ begin
  begin
    delete from public.vehicle_field_definitions where name = 'Test dropdown';
    raise exception 'Physical deletion allowed';
  exception when insufficient_privilege then null; end;
  begin
    update public.vehicle_field_revisions set definition = '{}'::jsonb;
    raise exception 'History mutation allowed';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.vehicle_field_definitions(vehicle_type_id, owner_id, name, data_type, options)
    values ('00000000-0000-4000-8000-000000000001', auth.uid(), 'Invalid', 'select', '["Same", "same"]');
    raise exception 'Duplicate dropdown options accepted';
  exception when check_violation then null; end;
end; $$;
update public.vehicle_types set archived_at = now() where name = 'Security test A';
do $$ begin
  begin
    insert into public.vehicle_field_definitions(vehicle_type_id, owner_id, name, data_type)
    select id, auth.uid(), 'Archived parent', 'text' from public.vehicle_types where name = 'Security test A';
    raise exception 'Archived parent accepted';
  exception when insufficient_privilege then null; end;
end; $$;

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000002', true);
select pg_temp.assert_true((select count(*) = 0 from public.vehicle_field_revisions r
  where r.definition->>'name' in ('Test dropdown', 'Personal extension A')), 'other owner revisions hidden');

rollback;
