# Fahrzeugarten und Felder – Migrationen

Diese Migrationen erweitern Supabase Auth um Fahrzeugarten und Felddefinitionen.
Sie erstellen **keine einzelnen Fahrzeuge, Tankvorgänge oder Reparaturen**.

## Im Supabase-Dashboard ausführen

1. Das bestehende Projekt öffnen und **SQL Editor → New query** wählen.
2. Den vollständigen Inhalt von
   `migrations/202611050001_vehicle_type_schema.sql` einfügen und einmal ausführen.
3. Anschließend `migrations/202611050002_seed_vehicle_types.sql` einmal ausführen.
4. Beide Abfragen müssen erfolgreich abgeschlossen sein. Jede Migration läuft
   in einer Transaktion; bei Fehlern im Editor `ROLLBACK;` ausführen, die Ursache
   beheben und die fehlgeschlagene Migration erneut ausführen.
5. App neu laden und unter **Einstellungen → Fahrzeugarten** öffnen.

Migrationen nicht erneut auf ein bereits eingerichtetes Schema anwenden und
bereits angewandte Dateien nicht ändern. Weitere Änderungen werden als neue,
zeitlich nachfolgende Migration hinzugefügt. Keine Schlüssel oder
Datenbankpasswörter in SQL-Dateien oder Git eintragen.

## Alternativ mit installierter Supabase CLI

```bash
supabase login
supabase init
supabase link --project-ref DEINE_PROJEKT_REFERENZ
supabase db push
```

`supabase init` ist nur einmal nötig, falls noch keine `config.toml` existiert.
Vor `db push` das verknüpfte Projekt und die ausstehenden Migrationen prüfen.
Die CLI verwaltet anschließend die Migrationshistorie. Nicht unkoordiniert
zwischen SQL Editor und CLI wechseln: Bei zuvor manuell angewandten Dateien
die Historie zunächst anhand der tatsächlich ausgeführten Migrationen mit
`supabase migration repair ... --status applied` abgleichen.

## Datenmodell und Sicherheit

- `vehicle_types`: sieben Standardarten mit `owner_id = null`; eigene Arten
  gehören einer Auth-User-ID. Standardarten sind auch anonym lesbar.
- `vehicle_field_definitions`: Standardfelder sind unveränderbar. Ein Nutzer
  kann eigene Felder an Standardarten und an seinen eigenen Arten ergänzen.
- `vehicle_field_revisions`: unveränderliche Momentaufnahme jeder Feldversion,
  einschließlich ursprünglicher Dropdown-Optionen, Einheit und Datentyp.
- SELECT-/INSERT-/UPDATE-Policies prüfen Besitzer und Elternart. Die Rechte
  erlauben weder Übertragung von Eigentum noch Umhängen eines Feldes.
- Physisches DELETE ist für Browser-Rollen nicht freigegeben. „Entfernen“ setzt
  `archived_at`; die Oberfläche blendet archivierte Einträge aus. Eigene
  archivierte Metadaten bleiben für spätere historische Auswertungen lesbar.
- `reorder_vehicle_fields` prüft die vollständige Liste aktiver eigener Felder
  und aktualisiert die Reihenfolge atomar. Standardfelder behalten ihre feste
  Reihenfolge; persönliche Felder folgen darunter. Pfeiltasten bewegen persönliche
  Felder gegeneinander, nicht zwischen unveränderliche Standardfelder.
- Snapshot-Trigger liegen im nicht exponierten `private`-Schema, verwenden einen
  leeren `search_path` und sind nicht direkt durch Browser-Rollen aufrufbar.
- RPCs zur Sortierung laufen mit den Rechten des Aufrufers, nicht als Definer.

## Vertrag für spätere Fahrzeugdaten

Ein späterer Fahrzeugwert muss auf `vehicle_field_revisions.id` mit
`ON DELETE RESTRICT` verweisen und nach der gespeicherten Revision interpretiert
werden. Ein stabiler `field_id` identifiziert das logische Feld. Änderungen an
Typ, Einheit, Name oder Dropdown-Optionen erzeugen eine neue Revision und
konvertieren vorhandene Werte **nicht**. Neue Pflichtfelder dürfen vorhandene
Fahrzeuge nicht rückwirkend ungültig machen. Der Nutzer entscheidet später
ausdrücklich über jede Datenkonvertierung. Die heutigen Migrationen legen
dafür ausschließlich die Metadatenbasis an.

Auch bei späteren Fahrzeugwerten müssen RLS und Constraints die gesamte Kette
Nutzer → Fahrzeug → Fahrzeugart → Feldrevision prüfen. Eine einzelne UUID-FK
ist keine Berechtigungsprüfung. Account-Löschung benötigt wegen der bewusst
restriktiven FKs einen gesonderten, expliziten Aufräumablauf.

## Berechtigungen prüfen

Nach den Migrationen `tests/vehicle_type_security.sql` auf einem Entwicklungs-/Testprojekt
im SQL Editor als Projektadministrator oder über `psql` ausführen. Der Test erzeugt zwei temporäre
Auth-User-Fixtures und prüft unter den echten Rollen `anon` und `authenticated`:

- Standardarten und Standardfelder lesbar, aber nicht veränderbar
- Fremde Arten, Zusatzfelder und Revisionen unsichtbar
- Gefälschter Eigentümer und fremde/archivierte Elternart abgewiesen
- Unveränderliche Eigentums- und Elternverknüpfungen
- Sortierung eigener Zusatzfelder; fremde Felder abgewiesen
- Revisionen und alte Dropdown-Optionen bleiben nach Änderungen/Archivierung erhalten
- Keine direkten DELETEs oder Änderungen an der Historie
- Datenbankprüfung ungültiger Dropdown-Optionen

Der Test endet mit `ROLLBACK`, es bleiben keine Testdatensätze zurück. Bei einem
Fehler ebenfalls `ROLLBACK;` ausführen, bevor weitere SQL-Befehle gestartet werden.

Zusätzlich mit zwei echten Konten über die App testen: Art erstellen, umbenennen,
Icon ändern, alle Feldtypen anlegen, Dropdown ändern, Felder sortieren und entfernen,
Seite neu laden, abmelden und mit dem anderen Konto die Trennung prüfen.

Grundlage: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).
