begin;

insert into public.vehicle_types(id, system_key, name, icon, sort_order) values
('00000000-0000-4000-8000-000000000001', 'car', 'PKW', 'car', 0),
('00000000-0000-4000-8000-000000000002', 'motorcycle', 'Motorrad', 'motorcycle', 1),
('00000000-0000-4000-8000-000000000003', 'trailer', 'Anhänger', 'trailer', 2),
('00000000-0000-4000-8000-000000000004', 'caravan', 'Wohnwagen', 'caravan', 3),
('00000000-0000-4000-8000-000000000005', 'motorhome', 'Wohnmobil', 'motorhome', 4),
('00000000-0000-4000-8000-000000000006', 'van', 'Transporter', 'van', 5),
('00000000-0000-4000-8000-000000000007', 'other', 'Sonstiges', 'other', 6);

insert into public.vehicle_field_definitions(vehicle_type_id, name, data_type, required, sort_order)
select t.id, f.name, f.data_type, f.required, f.position
from public.vehicle_types t cross join (values
  ('Hersteller', 'text', true, 0), ('Modell', 'text', true, 1),
  ('Kennzeichen', 'text', false, 2), ('Fahrgestellnummer', 'text', false, 3),
  ('Erstzulassung', 'date', false, 4)
) as f(name, data_type, required, position) where t.owner_id is null;

insert into public.vehicle_field_definitions(vehicle_type_id, name, data_type, unit, sort_order)
select t.id, f.name, f.kind, f.unit, f.position
from (values
  ('car', 'Kilometerstand', 'integer', 'km', 5),
  ('car', 'Leistung', 'decimal', 'kW', 6), ('car', 'Hubraum', 'integer', 'cm³', 7),
  ('car', 'Sitzplätze', 'integer', null, 8),
  ('motorcycle', 'Kilometerstand', 'integer', 'km', 5),
  ('motorcycle', 'Hubraum', 'integer', 'cm³', 6), ('motorcycle', 'Leistung', 'decimal', 'kW', 7),
  ('trailer', 'Zulässige Gesamtmasse', 'decimal', 'kg', 5),
  ('trailer', 'Nutzlast', 'decimal', 'kg', 6), ('trailer', 'Gebremst', 'boolean', null, 7),
  ('caravan', 'Zulässige Gesamtmasse', 'decimal', 'kg', 5),
  ('caravan', 'Schlafplätze', 'integer', null, 6), ('caravan', 'Länge', 'decimal', 'm', 7),
  ('motorhome', 'Kilometerstand', 'integer', 'km', 5),
  ('motorhome', 'Zulässige Gesamtmasse', 'decimal', 'kg', 6),
  ('motorhome', 'Schlafplätze', 'integer', null, 7),
  ('van', 'Kilometerstand', 'integer', 'km', 5),
  ('van', 'Zulässige Gesamtmasse', 'decimal', 'kg', 6),
  ('van', 'Nutzlast', 'decimal', 'kg', 7), ('other', 'Bemerkungen', 'text', null, 5)
) as f(key, name, kind, unit, position)
join public.vehicle_types t on t.system_key = f.key;

insert into public.vehicle_field_definitions(vehicle_type_id, name, data_type, sort_order, options)
values ('00000000-0000-4000-8000-000000000001', 'Antrieb', 'select', 9,
  '["Benzin", "Diesel", "Elektro", "Hybrid", "Sonstiges"]');

commit;
