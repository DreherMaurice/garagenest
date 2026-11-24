# Meine Garage

Grundstruktur für eine moderne, responsive Fahrzeugverwaltungs-PWA mit React,
TypeScript, Vite und Tailwind CSS.

## Aktueller Umfang

- Responsives App-Layout mit mobiler Tab-Bar und Desktop-Sidebar
- Dashboard sowie Platzhalterseiten für Fahrzeuge, Hinzufügen, Statistiken und Einstellungen
- React-Router-Navigation zwischen allen App-Bereichen
- Persistentes Erscheinungsbild mit System-, Light- und Dark-Mode
- Semantische Design-Tokens und Lucide-Icons im iOS-inspirierten UI
- Zurückhaltendes Liquid-Glass-System für Navigation und funktionale Overlay-Ebenen
- Barrierearme Fallbacks für reduzierte Transparenz, erhöhten Kontrast und reduzierte Bewegung
- Installierbare PWA-Basis mit Web-App-Manifest und Service Worker
- Supabase Auth: Registrierung, E-Mail-Bestätigung, Login, Logout und Passwort-Reset
- Geschützte App-Routen, persistente Sitzung und Profil mit optionalem Anzeigenamen
- Fahrzeugarten mit Standardfeldern, eigenen Arten und persönlichen Felddefinitionen
- TypeScript im Strict-Modus
- ESLint mit Regeln für TypeScript und React Hooks

Einzelne Fahrzeuge, Tankvorgänge und Reparaturen sind noch nicht enthalten.
Benutzerprofile verwenden ausschließlich Supabase-Auth-Metadaten. Fahrzeugarten
und Felddefinitionen werden in eigenen, durch RLS geschützten Tabellen gespeichert.

## Voraussetzungen

- Git, Node.js 22 ab 22.18 oder Node.js ab 24
- npm 10 oder neuer

## Lokal starten

```bash
git submodule update --init --recursive
npm ci
npm run dev
```

Vite zeigt anschließend die lokale Adresse an, üblicherweise
`http://localhost:5173`.

## Qualität prüfen

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Den fertigen Build lokal ansehen:

```bash
npm run preview
```

## Projektstruktur

```text
public/                 Statische Dateien und App-Icon
src/
  app/                  App-Einstieg und Routing
    auth/               Sitzungszustand und Routenschutz
    theme/              Theme-Zustand und lokale Speicherung
  assets/               Lokale Bilder und andere Medien
  components/
    auth/                Formularelemente, Status und Auth-Layout
    layout/              Seitenübergreifendes Layout
    navigation/          Sidebar und mobile Tab-Bar
    ui/                  Wiederverwendbare UI-Bausteine
  pages/                 Seiten, nach Feature gruppiert
  services/              Supabase-Client und Auth-Zugriffe
  styles/                Globale Styles und Tailwind-Einstieg
  types/                 Gemeinsame TypeScript-Typen
```

## Routen

| Route | Bereich |
| --- | --- |
| `/` | Dashboard |
| `/vehicles` | Fahrzeuge |
| `/add` | Hinzufügen |
| `/statistics` | Statistiken |
| `/settings` | Einstellungen und Erscheinungsbild |
| `/settings/vehicle-types` | Fahrzeugarten und persönliche Felder |
| `/settings/vehicle-types/new` | Eigene Fahrzeugart erstellen |
| `/settings/vehicle-types/:typeId` | Art und Felder verwalten |
| `/login` | Anmeldung |
| `/register` | Registrierung |
| `/forgot-password` | Reset-E-Mail anfordern |
| `/auth/callback` | Rückleitung nach E-Mail-Bestätigung |
| `/auth/update-password` | Passwort mit gültiger Sitzung ändern |

Alle fünf App-Bereiche benötigen eine Anmeldung. Der Passwortwechsel zeigt
das Formular ebenfalls erst nach erfolgreicher Sitzungsinitialisierung und
mit gültiger Sitzung an. E-Mail-Rückleitungen verwenden den für eine reine
Browser-App vorgesehenen impliziten Supabase-Flow; der SDK übernimmt die
Auswertung und entfernt die Token-Fragmente. Eine Recovery-Sitzung führt zum
Passwortwechsel, auch wenn ein angepasster Link auf einer anderen App-Route landet.

## Supabase einrichten

1. Ein Supabase-Projekt erstellen. Unter **Connect** die Projekt-URL und unter
   **Settings → API Keys** den **Publishable Key** (`sb_publishable_…`) kopieren.
2. Falls `.env.local` fehlt, `.env.example` dorthin kopieren. In `.env.local`
   die beiden Werte eintragen:

   ```dotenv
   VITE_SUPABASE_URL=https://DEIN-PROJEKT.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_DEIN_OEFFENTLICHER_KEY
   ```

   `.env.local` ist ignoriert. **Niemals Secret-Keys oder Service-Role-Keys eintragen.** Vite stellt
   `VITE_`-Werte dem Browser zur Verfügung. Start und Build weisen ungültige
   Konfigurationen zurück; ohne beide Werte zeigt die App einen Einrichtungshinweis.
3. Unter **Authentication → Sign In / Providers → Email** E-Mail/Passwort und
   **Confirm email** aktivieren. Die minimale Passwortlänge auf mindestens
   **12 Zeichen** setzen; die App fordert ebenfalls mindestens 12 Zeichen.
4. Unter **Authentication → URL Configuration** setzen:
   - **Site URL:** `http://localhost:5173`
   - **Redirect URLs:** `http://localhost:5173/auth/callback` und
     `http://localhost:5173/auth/update-password`
   - Bei Verwendung von `127.0.0.1` dieselben beiden URLs mit diesem Host
     ergänzen. Bei einem anderen Vite-Port die URLs entsprechend anpassen.
   - Für Produktion die HTTPS-App-Adresse als Site URL verwenden und deren
     beide Callback-Pfade explizit freigeben. Keine Produktions-Wildcards nötig.
5. Die Standardvorlagen für **Confirm signup** und **Reset Password** können
   unverändert bleiben: Der Link muss `{{ .ConfirmationURL }}` verwenden.
   Die App übergibt die passende Redirect-URL beim jeweiligen Aufruf.
6. Für E-Mail-Versand an beliebige Nutzer unter **Authentication → Email / SMTP**
   einen eigenen SMTP-Dienst konfigurieren. Der eingebaute Testversand erlaubt
   nur Adressen von Projekt-/Organisationsteammitgliedern und ist stark limitiert.
7. Vite nach Änderungen an `.env.local` neu starten: `npm run dev`.

Für Benutzerprofile ist keine eigene Tabelle erforderlich. Der Anzeigename
liegt in `user_metadata.display_name`; die E-Mail stammt aus Supabase Auth.
Metadaten dürfen nicht für Berechtigungsprüfungen genutzt werden. Die Sitzung
wird vom SDK im Browser verwaltet, automatisch erneuert und zwischen Tabs
synchronisiert. Logout meldet die aktuelle Sitzung auf diesem Gerät ab.

Routenschutz sichert die Oberfläche, nicht Datenbankabfragen. Die Fahrzeugarten-
Tabellen verwenden daher zusätzlich RLS und eingeschränkte Spaltenrechte.
Der Service Worker speichert ausschließlich statische App-Dateien, keine
Supabase-Antworten. Das Hosting muss SPA-Routen auf `index.html` zurückführen.

Dokumentation: [Passwort-Authentifizierung](https://supabase.com/docs/guides/auth/passwords),
[API-Schlüssel](https://supabase.com/docs/guides/getting-started/api-keys),
[E-Mail-Tests](https://supabase.com/docs/guides/auth/testing-auth-flows).

## Auth vor Freigabe manuell prüfen

- Registrierung mit optionalem Namen; vor Bestätigung schlägt der Login mit
  verständlicher Meldung fehl. Bestätigung erneut senden und Link öffnen.
- Login, geschützte Route direkt aufrufen, Seite neu laden und zweiten Tab öffnen.
- In Einstellungen Namen ändern; nach erneutem Laden muss er erhalten bleiben.
- Logout; Zurücknavigation und Neuladen dürfen keine geschützten Seiten zeigen.
- Reset anfordern, E-Mail-Link öffnen, Passwort ändern, anschließend mit dem
  neuen Passwort anmelden. Alten oder abgelaufenen Link erneut öffnen und einen
  neuen anfordern. Der Reset-Link funktioniert auch in einem neuen Browser.
- Falsches Passwort, langsame/offline Verbindung und Versand-Limit prüfen.
- Formulare in Light/Dark Mode, mit Tastatur sowie auf schmalem Smartphone prüfen.

Die lokalen Tests prüfen Schlüsselvalidierung, sichere Rückleitungsziele und
Fehlerbehandlung. Echte Auth- und E-Mail-Abläufe benötigen ein konfiguriertes
Supabase-Projekt und ersetzen diese manuellen Prüfungen nicht.

## Schritt 4: Fahrzeugarten-Datenbank einrichten

Die zwei versionierten Migrationen unter `supabase/migrations` müssen in dieser
Reihenfolge ausgeführt werden: zuerst Schema/RLS, danach Standardarten und Felder.
Die genaue Anleitung, Berechtigungstests und der Vertrag für spätere Fahrzeugwerte
stehen in [supabase/README.md](./supabase/README.md). Ohne diese Migrationen zeigt
die Fahrzeugarten-Seite einen Einrichtungshinweis, statt Daten lokal zu speichern.

Eigene Arten und Felder sind nur für ihren Besitzer sichtbar. Standardfelder
bleiben unveränderbar; persönliche Zusatzfelder können ergänzt werden. Feldtypen:
Text, Ganzzahl, Dezimalzahl, Datum, Ja/Nein und Dropdown mit eigenen Optionen.
Bearbeitung erzeugt Revisionen; Löschen archiviert die Metadaten. Damit bleiben
frühere Definitionen für spätere Fahrzeugwerte erhalten.

Weitere Konventionen und Projektregeln stehen in [AGENTS.md](./AGENTS.md).

## LiquidLens

Navigation, primäre Buttons, schwebende Aktionen und Bestätigungsdialoge verwenden
die echte LiquidLens-Core-/React-Implementierung aus `vendor/LiquidLens`.
Nach einem frischen Checkout zunächst `git submodule update --init --recursive`,
dann `npm ci` ausführen. Installation, Review, lokale Patches und Browserprüfungen
sind in [docs/liquidlens.md](./docs/liquidlens.md) dokumentiert. LiquidLens ist ein
Community-Projekt, keine Apple-Bibliothek. Refraction wird nur für unterstützte
Chromium-Umgebungen aktiviert; andere Browser erhalten die dokumentierten Fallbacks.

## Erweiterungen

Neue Seiten werden beim jeweiligen Feature unter `src/pages` angelegt und in
`src/app/AppRoutes.tsx` registriert. Einträge der Hauptnavigation stehen zentral
in `src/app/navigation.ts`. Sidebar und Tab-Bar nutzen dieselbe Liste.

Seiten setzen kleine UI-Bausteine zusammen: `PageHeader` für Überschriften,
`ListSection` und `ListRow` für gruppierte Listen. Fachliche Logik und Typen
bleiben zunächst beim Feature; nur tatsächlich gemeinsam genutzter Code wird
ausgelagert. Materialklassen wie `glass-surface` bestimmen das Aussehen, während
die jeweilige Layout-Komponente ihre Positionierung festlegt.

Der kurze Theme-Bootstrap in `index.html` verhindert ein Aufblitzen der falschen
Darstellung vor dem React-Start. Speicher-Schlüssel, gültige Werte und
System-Fallback müssen mit `src/app/theme/ThemeProvider.tsx` übereinstimmen.
