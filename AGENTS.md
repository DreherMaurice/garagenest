# Projektregeln für Meine Garage

## Ziel und Umfang

Dieses Repository enthält eine moderne Fahrzeugverwaltungs-PWA. Änderungen
sollen klein, nachvollziehbar und auf den jeweils beauftragten Ausbauschritt
begrenzt bleiben.

Schritt 3 ergänzt Supabase Auth und Benutzerprofile über Auth-Metadaten.
Fahrzeugfunktionen und eigene Datenbanktabellen werden erst nach ausdrücklichem
Auftrag ergänzt.

## Technische Leitplanken

- React-Komponenten werden als TypeScript-Funktionskomponenten geschrieben.
- TypeScript bleibt im Strict-Modus; `any` ist zu vermeiden.
- Styling erfolgt mit Tailwind CSS. Globale CSS-Regeln bleiben auf echte
  Grundlagen beschränkt.
- Farben und wiederkehrende visuelle Werte werden über die semantischen Tokens
  in `src/styles/index.css` verwendet. Komponenten sollen keine eigenen
  Light-/Dark-Farbpaletten definieren.
- Icons stammen aus `lucide-react`; Emojis oder gemischte Icon-Sets werden nicht
  als Oberflächen-Icons verwendet.
- Seiten liegen in `src/pages`, wiederverwendbare Komponenten in
  `src/components` und externe Zugriffe später in `src/services`.
- Domänentypen werden in `src/types` oder direkt beim verantwortlichen Feature
  definiert. Unnötige globale Typen sind zu vermeiden.
- Imports sollen relativ, eindeutig und frei von ungenutzten Abhängigkeiten
  bleiben.

## Erweiterbarkeit und kleine Diffs

- Änderungen bleiben auf die Aufgabe begrenzt. Keine beiläufigen Umbenennungen,
  Formatierungen ganzer Dateien oder Änderungen an fremden Arbeitsständen.
- Fachliche Logik und Typen bleiben möglichst beim verantwortlichen Feature.
  `src/services` und `src/types` sind keine Sammelstellen für beliebigen Code.
- Gemeinsame Komponenten entstehen aus tatsächlich wiederholten Mustern.
  Keine vorsorglichen Abstraktionsschichten oder zusätzlichen Frameworks.
- Seiten setzen vorhandene UI-Bausteine zusammen. Gruppierte Listen verwenden
  `ListSection` und `ListRow`, damit Anpassungen an Darstellung und
  Barrierefreiheit nur an einer Stelle nötig sind.
- Abgeleitete Werte werden berechnet und nicht zusätzlich als React-Zustand
  gespeichert. Effekte synchronisieren externe Systeme.

## UI und Barrierefreiheit

- Oberflächen werden mobile-first und responsiv umgesetzt.
- Mobile Navigation respektiert `safe-area-inset-*`; interaktive Ziele sind auf
  Touch-Bedienung ausgelegt.
- Das Erscheinungsbild unterstützt Light und Dark Mode. Neue UI-Bausteine
  müssen in beiden Modi geprüft werden.
- Liquid Glass bleibt der funktionalen Ebene vorbehalten, insbesondere
  Navigation, Toolbars und temporären Controls. Inhaltsflächen verwenden
  weiterhin ruhige, deckende Systemfarben.
- Glas-Effekte verwenden die zentralen Tokens und Fallbacks in
  `src/styles/index.css`; individuelle Blur- oder Transparenzwerte in
  Komponenten sind zu vermeiden.
- Semantisches HTML, sichtbare Fokuszustände, ausreichende Kontraste und
  sinnvolle zugängliche Namen sind verpflichtend.
- Neue Texte werden standardmäßig auf Deutsch verfasst.

## Benutzerverwaltung und Sicherheit

- Supabase-Zugriffe bleiben in `src/services`, der Sitzungszustand in `src/app/auth`.
- Im Frontend ausschließlich `VITE_SUPABASE_PUBLISHABLE_KEY` verwenden.
  `.env.local` bleibt lokal; niemals Secret- oder Service-Role-Keys eintragen.
- Profil-Metadaten wie Anzeigenamen sind vom Benutzer änderbar und dürfen nicht
  für Autorisierungsentscheidungen verwendet werden.
- Routenschutz steuert die Oberfläche. Spätere Datenzugriffe benötigen immer
  serverseitige Autorisierung und RLS.
- Auth-Tokens, Passwörter und E-Mail-Link-Fragmente nicht protokollieren oder
  in eigenen Speichern ablegen. Die Sitzungsverwaltung übernimmt der SDK.

## Qualitätssicherung

Vor Abschluss einer Änderung müssen mindestens folgende Befehle erfolgreich
laufen:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Neue Abhängigkeiten werden nur ergänzt, wenn sie für den beauftragten Umfang
einen klaren Nutzen haben. Generierte Build-Artefakte und lokale
Umgebungsdateien werden nicht versioniert.
