# LiquidLens-Integration

LiquidLens ist eine unabhängige MIT-lizenzierte Community-Bibliothek, keine
Apple-Bibliothek. Geprüfter Upstream-Stand:
`0dc4b52d7ce7339aa00c9397e831267d68c0fb19` (Core 1.0.1).

## Originalcode und reproduzierbare Installation

Das Originalrepository liegt unter `vendor/LiquidLens`; `.gitmodules` beschreibt
es als Submodul. Das Core-Paket ist eine lokale `file:`-Abhängigkeit ohne weitere
Runtime-Abhängigkeiten. Der React-Port besitzt upstream kein eigenes
`package.json`; Vite und TypeScript lösen `@liquidlens/react` deshalb direkt auf
die Originaldatei `vendor/LiquidLens/packages/react/index.ts` auf.

Bei neuen Checkouts:

```bash
git submodule update --init --recursive
npm ci
```

`postinstall` führt `scripts/prepare-liquidlens.mjs` aus. Das Skript wendet
`vendor/liquidlens.patch` auf den unveränderten, gepinnten Commit an und
akzeptiert einen lokalen Stand, dessen Diff genau dem Patch entspricht. Bei
unerwarteten Änderungen bricht es ab. Manuell lässt es
sich mit `npm run vendor:prepare` aufrufen. Weder das Skript noch die App laden
Code zur Laufzeit von einem CDN.

Beim ersten Commit dieses Integrationsstands müssen `.gitmodules`, der Gitlink
`vendor/LiquidLens`, die Patch-Datei und das Installationsskript gemeinsam
versioniert werden. Lokale Vendor-Änderungen allein werden in einem Submodul
nicht durch einen Commit des Hauptprojekts gespeichert; genau dafür liegt der
Patch zusätzlich im Hauptprojekt. Es wurden hier keine Commits angelegt.

Updates erfolgen bewusst: neuen Upstream-Code prüfen, Commit-Pin anpassen,
Patches vergleichen und Tests wiederholen. Keine automatischen Upstream-Updates.
Die Lizenz liegt auch unter `public/licenses/LiquidLens.txt` und wird mitgebaut.

## Gelesene Grundlagen

- Vollständige `AI_CONTEXT.md` und `README.md`
- React-README und React-/Core-Quellcode einschließlich CSS/Tokens
- `docs/02` bis `docs/10`: Optik, Material, Varianten, HIG, Web-Aufbau,
  Browserunterstützung, Tokens, Accessibility und API
- Skills `liquid-glass-react`, `liquid-glass-web`, `liquid-glass-auditor`
- [Apple HIG: Materials](https://developer.apple.com/design/human-interface-guidelines/materials)

## Ergebnis des Code-Reviews / lokale Patches

Die Original-Optik bleibt erhalten: Snell-Profil, SDF, Canvas-Displacement-Map,
SVG `feImage`/`feDisplacementMap`, Specular-Pseudoelemente und Token-System.
Die Brechungsberechnung wird nicht nachgebaut oder ersetzt.

Gezielte Korrekturen am Community-Code:

1. React 19: `React.JSX.IntrinsicElements` statt veralteter globaler JSX-Namespace.
   Native Buttons/Links/Dialoge verwenden `useGlassRef`, damit ihre vollständigen
   nativen Attribute und Typen erhalten bleiben.
2. Expliziter Browser-Fallback: SVG-Backdrop-Refraction nur bei Chromium-Heuristik,
   nicht bei Safari, Firefox oder Chrome auf iOS. Andere Engines bekommen die
   Blur-/Specular-Variante ohne unnötige Canvas-Maps. Dies ist eine konservative
   Heuristik, kein Beweis für Grafiktreiber-/Browserunterstützung.
3. Entfernte DOM-Teilbäume räumen zugehörige Filter auf. Spät eingefügte
   verschachtelte Glass-Elemente werden erkannt.
4. `destroy()` räumt Timer, Resize-/Load-Listener und Preference-Listener auf;
   `init()` ist zusätzlich auf Core-Ebene idempotent.
5. Geänderte Transparenz-/Kontrastpräferenzen aktualisieren die Flächen und
   entfernen vorhandene Filter. Reduzierte Bewegung stoppt Pointer-Highlights.

Der Core enthält keine Netzwerkaufrufe, Telemetrie oder dynamische Codeausführung.
Er liest Elementmaße, Pointerposition und Medienpräferenzen. Mobile Tilt-Sensoren
bleiben deaktiviert. SVG-Markup wird aus intern berechneten Zahlen und einer
Canvas-Data-URL erzeugt; keine Nutzereingaben werden dort interpoliert.

## Komponenten und Materialregeln

- `GlassProvider`: einmalige Initialisierung über `useLiquidGlass`.
- `GlassButton`/`GlassLink`: tatsächliche native Elemente mit `useGlassRef`.
- Tab-Bar und Sidebar: originale `<LiquidGlass>`-Komponente.
- Neuer Fahrzeugart-Link: schwebende Aktion mit echten Brechungsfiltern.
- `ConfirmDialog`: natives modales `dialog` im Portal; Fokus auf Abbrechen,
  Escape/Backdrop-Abbruch, Fokus-Rückgabe, gesperrter Abbruch während Speicherung.
  Dialog-Buttons bleiben solide Textaktionen, damit kein Glas auf Glas entsteht.

`src/components/glass/glass-tokens.ts` steuert die Physik (Blur 2px,
Refraction 18px, reduzierte Button-Brechung, Quality 360, Tilt aus).
Die semantischen Farben, neutralen Regular-Flächen und Tiefenwerte kommen aus
`src/styles/index.css`. Eine neutrale `GlassLegibility`-Schicht liegt nur in der
Mitte unter den Beschriftungen, unterhalb der originalen Specular-Layer. Der
Rand bleibt mit 18–20 % Grundfüllung deutlich durchlässiger. Die Mittenschicht
ist weder ein zweiter Glasfilter noch eine eigene Brechungsimplementierung.
Sie beeinflusst kein Layout und ist für Pointer und Assistenztechnik unsichtbar.
Bei reduzierter Transparenz/erhöhtem Kontrast entfällt sie zugunsten der deckenden
Fallback-Fläche. Specular beträgt 0.65 in Light Mode und 0.30 in Dark Mode.
Es werden keine bunten Hintergründe ins Produkt eingeführt, nur um den Effekt
sichtbarer zu machen. Über flachen Flächen ist Lichtbrechung naturgemäß subtil.
Die Navigation zeigt beim Scrollen die darunterliegenden Inhalte.

Auf einer vollständig einfarbigen Fläche lässt sich durch stärkere Brechung
allein kein sichtbares verzerrtes Motiv erzeugen. Besonders die Desktop-Sidebar
steht in einer eigenen Layout-Spalte ohne Inhalt dahinter. Ihre Materialkanten
und Highlights können sichtbar sein, während echte Hintergrundverzerrung dort
ohne Hintergrunddetails subtil bleibt. Eine neue Hintergrundgestaltung wurde
nicht als Teil der Materialkorrektur eingeführt.

Vendor-CSS liegt in Tailwinds Komponenten-Layer, damit z. B. `fixed` nicht von
der upstream gesetzten relativen Position überschrieben wird. Vendor-Demos sind
vom Tailwind-Scanning ausgeschlossen. App-Inhaltslisten bleiben deckend.

## Fallbacks und Accessibility

| Umgebung | Verhalten |
| --- | --- |
| Chromium, normale Präferenzen | SVG-Displacement-Maps, Blur, Specular und Tiefe |
| Safari/Firefox/iOS-Browser | Explizit nur Blur und Specular; keine Brechung behaupten |
| Reduzierte Transparenz / mehr Kontrast | Deckende Systemfläche, keine Filter oder Highlights |
| Reduzierte Bewegung | Keine bewegten Highlights oder Press-/Morph-Animationen |
| Kein `backdrop-filter` | Deckende Systemfläche |

Beschriftungen, `aria-current`, native Button-Typen, Disabled-Zustände,
Fokusmarkierungen und Safe Areas bleiben erhalten. Der native Dialog übernimmt
Fokusbegrenzung und modale Semantik. Die App blockiert bei fehlender Authentifizierung
weiterhin geschützte Routen; die Testseite enthält keine Auth-Umgehung im App-Router.

## Tests und Audit

`npm test` führt den **echten Core** in einem instrumentierten DOM/Canvas aus:
neutrale Mitte und ausgelenkte Randpixel, SVG-Filter, Browser-Fallbacks,
Präferenzwechsel, Filter-Cleanup und Listener-Teardown. Dies ist kein visueller
Browsernachweis und kein Ersatz für Compositing-/GPU-Tests.

Für Browserprüfungen einen separaten lokalen Vite-Server starten:

```bash
npm run dev -- --host 127.0.0.1 --port 5178 --strictPort
node scripts/check-glass-browser.mjs brave
node scripts/check-glass-browser.mjs edge
node scripts/check-glass-browser.mjs firefox
```

Das Skript verwendet installierte Browser mit isolierten Profilen, keine
persönlichen Sitzungen. Es prüft die gemeinsamen React-Komponenten unter
`tests/glass-fixture.html` in Light/Desktop und Dark/Mobile, inklusive Modalfokus,
Formular-Submit, Disabled, Positionierung und Filter/Fallback. Screenshots und
Ergebnisdateien werden unter `node_modules/.cache/glass-browser` erzeugt.
Diese Testseite ist kein Build-Einstiegspunkt und wird nicht veröffentlicht.

Vor produktiver Freigabe außerdem echte Safari-/Firefox-/Chromium-Pixel prüfen:
Randbrechung über Text, Kontrast auf dem compositierten Hintergrund, Keyboard-
Navigation, Reduced Transparency/Motion/Contrast, Landscape-Safe-Areas und
wiederholte Routenwechsel. User-Agent-Simulation ersetzt keinen anderen Browser.

| Auditpunkt | Nachweis / Freigabestatus |
| --- | --- |
| Brechungsimplementierung, niedriger Blur, Regular, dezenter Tint | Original-Core, zentrale Werte, Unit-Tests |
| Kein Glas auf Glas, wenige Flächen | Gemeinsame Navigation, Aktionen und ein Dialog |
| Fallback/Cleanup/Präferenzlogik | Regressionstests des Original-Cores mit Patches |
| Semantik/Focus/Submit/Responsive | Browserprüfskript; tatsächliche Ergebnisse separat festhalten |
| Sichtbare Randbrechung und compositierter Kontrast | Visuelle Prüfung erforderlich; nicht aus Unit-Tests ableiten |

Ohne erfolgreiche Browser-/Pixelprüfung ist die **visuelle Produktionsfreigabe offen**.

Stand der Prüfung am 2026-11-05: Zehn Unit-/Regressionstests, TypeScript, Lint und
Produktionsbuild erfolgreich. Reale CLI-Versuche mit Brave und Edge scheiterten
in dieser Ausführungsumgebung am nicht startfähigen GPU-Prozess, auch nach
Freigabe und mit Software-Rendering-Flag. Firefox erreichte das Zeitlimit.
Es wurden dabei keine verwertbaren Browser-Screenshots erzeugt. Safari war hier
nicht verfügbar. Die oben aufgeführten echten Browser-/Kontrastprüfungen sind
deshalb noch nicht als bestanden zu betrachten; die User-Agent-Fallbacktests
sind ausdrücklich nur Tests der Programmlogik.
