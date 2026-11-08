# Entdeckerheft – Projektkontext

Dieses Dokument ist der Kontext für alle, die am Entdeckerheft weiterarbeiten: Menschen und Claude.
Bitte vor jeder Änderung lesen und bei größeren Änderungen mit aktualisieren.

## Worum es geht

Das Entdeckerheft ist eine interaktive Lernseite. Auf der Seite selbst heißt sie **S.D.L.W.** – eine lustige
Abkürzung für „Super Duper Lern Webseite“ (Seitentitel, Logo oben links). Ausgeschrieben steht der Name nicht sichtbar
auf der Seite, sondern nur als Hinweis beim Darüberfahren, für Screenreader und in Guckis Ruf. Projekt und Repository heißen Entdeckerheft.
Die Seite ist für die **5. Klasse eines Gymnasiums in Hamburg**.
Jedes Thema ist ein **Kapitel** mit kurzer Erklärung, einem interaktiven Teil zum Ausprobieren und Übungsaufgaben,
die sofort Rückmeldung geben. Ein kleines Maskottchen („Gucki“) reagiert auf richtige und falsche Antworten.

Aktuelle Kapitel (Jahrgang 5):

| Fach | Kapitel | Element-ID | Übungen (IDs) |
|---|---|---|---|
| Deutsch | Groß- und Kleinschreibung | `deutsch` | d1–d5 |
| Kunst | Farbkreis nach Itten | `farbkreis` | t1–t5 |
| Erdkunde | Die sieben Kontinente | `kontinente` | k1–k4 |
| Erdkunde | Die Meere der Welt | `meere` | m1–m5 |
| Erdkunde | Tag und Nacht (mit Zeitzonen) | `tagnacht` | n1, n2, n3, n5, n6, n4 |
| Erdkunde | Der Kompass | `kompass` | c1–c5 |
| Musik | Noten lesen (mit Pausen) | `noten` | u1, u2, u3, u6, u4, u5 |

Dazu kommt die Seite **Versionshinweise** (`#neuigkeiten`, Element-ID `neuigkeiten`), die kein Fach hat.

## Zielgruppe, Sprache und Ton

- Kinder von etwa 10–11 Jahren. Lehrkräfte setzen die Seite im Unterricht und für Hausaufgaben ein.
- Sprache: Deutsch, **du-Ansprache**, kurze und klare Sätze, Fachbegriffe immer erklären.
- Fachlich korrekt bleiben. Wo Schulbücher abweichen, kurz darauf hinweisen
  (Beispiel: „In manchen Atlanten stehen nur drei Ozeane.“).
- Bezug zu Hamburg, wo es passt (Elbe, Hafen, Alster, Landungsbrücken).
- Rechtschreibung nach den amtlichen Regeln. Kontinent am Südpol heißt **Antarktika**,
  das Gebiet um den Südpol **Antarktis** (so ist es auf der Seite erklärt).

## Aufbau des Repositorys

```
src/entdeckerheft.html   Quelldatei: die ganze Seite (HTML, CSS, JS in einer Datei)
index.html               gebaut aus src/ – eigenständige Seite zum Öffnen im Browser / GitHub Pages
scripts/build.mjs        baut index.html aus src/entdeckerheft.html
scripts/check-release.mjs prüft Versionshinweise und ob index.html aktuell ist
CHANGELOG.md             Versionshinweise (Release Notes) für GitHub
.github/workflows/       Prüfung bei Pull Requests, automatisches GitHub-Release nach dem Merge
```

**Nur `src/entdeckerheft.html` bearbeiten.** `index.html` wird immer mit `node scripts/build.mjs` erzeugt.
`src/entdeckerheft.html` hat kein `<!doctype>`, `<html>`, `<head>` oder `<body>`, weil es gleichzeitig die
Vorlage für das claude.ai-Artifact ist (claude.ai ergänzt dieses Gerüst selbst). Das Build-Skript fügt es für
`index.html` hinzu.

Es gibt keine Abhängigkeiten und keinen Paketmanager. Node.js ab Version 18 reicht für die Skripte.

## Aufbau der Seite (src/entdeckerheft.html)

Reihenfolge in der Datei:

1. `<title>`, Google-Fonts-Link, `<style>` mit allen Farb-Tokens (`:root`) und den Regeln für die dunkle Ansicht.
2. Kopfzeile (`.topbar`): Logo „S.D.L.W.“ (`#logo`, Regenbogen-Schrift; Klick lässt Gucki sich vorstellen), Jahrgang, kleines rundes ✦-Symbol (`#newsBtn`) als Link zur Seite `#neuigkeiten`
   mit rotem Punkt, solange die neueste Version noch nicht angesehen wurde (`localStorage` „seenVersion“), Hell/Dunkel-Knopf.
3. JSON-Block `<script type="application/json" id="releaseData">` – die Versionshinweise der Webseite
   im Format `{"releases":[…neueste zuerst…],"summaries":[…]}`.
4. Navigation (`nav.navx`): Fächer (`.fach`) mit Themen-Links (`a[data-topic]`).
5. Wegweiser-Leiste (`#crumbs`, klebt beim Scrollen oben): Fach-Symbol, „Fach · Kapitel“, aktueller Abschnitt,
   Position („3/13“), Pfeile ‹ › zum vorherigen/nächsten Abschnitt, Knopf ☰ „Abschnitte“ mit Sprungliste und
   Fortschrittsbalken in der Fachfarbe (`--fc`). Daneben das Inhaltsverzeichnis `#toc` (nur ab 1240 px Breite).
6. Ein `<div class="topic" id="…">` je Kapitel (nur eines ist sichtbar, gesteuert über den URL-Hash),
   zuletzt die Versionsseite `#neuigkeiten` mit dem Container `#relPage`.
7. Knopf „Nach oben“ (`#toTop`, unten links) und Gucki (`#gucki`, unten rechts).
8. Externe Kartendaten (siehe unten) und ein großes `<script>` mit allen Funktionen, gegliedert durch Kommentare
   wie `/* ================= NOTEN ================= */`.

### Wichtige Bausteine im Skript

- **Routing:** `TOPICS` (Liste der Kapitel-IDs plus `neuigkeiten`) und `route()`. Ein Kapitel ist über
  `#kapitelid` direkt verlinkbar. `route()` ruft am Ende `Wegweiser.update()` auf.
- **Wegweiser:** sammelt beim Kapitelwechsel alle `section > h2` und die `h3` in `.task .taskhead` des Kapitels.
  Daraus entstehen Sprungliste, Inhaltsverzeichnis und die Anzeige des aktuellen Abschnitts (Scroll-Spy).
  Die Liste ist in „Erklärungen“ und „Übungen“ (ab der Überschrift „Übungsaufgaben“) geteilt und zeigt ✓ für
  fehlerfreie Übungen und ✎ für Aufträge ohne `[data-score]`. `guckiDone` und „Neu beginnen“ rufen
  `Wegweiser.refresh()` auf, damit die Haken aktuell bleiben. Fachfarbe und Symbol kommen aus der Navigation.
  Neue Kapitel müssen ihre Überschriften deshalb in dieser Struktur haben. Weil der URL-Hash das Kapitel
  bestimmt, springen die Einträge per Skript (`scrollTo`) statt über Anker-Links.
- **Versionsseite:** baut sich aus `releaseData`. Je zehn Versionen (vom ältesten an gezählt) bilden einen Block.
  Der Block mit der neuesten Version steht ausführlich da, alle älteren Blöcke werden mit ihrer Zusammenfassung
  aus `summaries` gezeigt, die Einzelversionen lassen sich aufklappen.
- **`quiz(box, items)`:** Multiple-Choice-Übung. `items` = `[{q, o:[{v,label}], a, why, hint?}]`.
  Zählt Punkte, meldet an Gucki, setzt `box._reset`.
- **`rankTask`, `mapQuiz`, Takt-/Klaviatur-/Detektiv-Übungen:** eigene Übungsarten. Jede setzt `box._reset`.
- **Gucki-Schnittstelle** (für jede neue Übungsart einbauen):
  - `guckiCheer()` bei einer richtigen Antwort
  - `guckiCry()` bei einer falschen Antwort (zählt auch „Cringe“ nach drei Fehlern in Folge)
  - `guckiDone(perfekt, box)` wenn eine Übung fertig ist. Sind alle Übungen eines Kapitels fehlerfrei,
    startet die große Konfetti-Party. Nach 2 fehlerfreien Übungen in Folge Sonnenbrille, nach 3 „Aura“.
- **„Neu beginnen“:** Der Block `/* --- Neu beginnen --- */` am Ende fügt jeder `.task` mit `box._reset`
  automatisch einen Knopf hinzu. Er muss **nach** allen Übungen im Skript stehen.
- **Zählende Übungen:** Nur `.task`-Elemente mit `[data-score]` zählen für die Kapitel-Party.
  Mal-, Schreib- und Experimentieraufträge haben kein `[data-score]`.
- **Weltkarte/Globen:** Natural-Earth-Projektion, eigene Ozeangrenzen (`OPOLY`), eigener vereinfachter
  Umriss von Antarktika (`ANT_PTS`), weil die Antarktis in den geladenen Daten falsch gezeichnet wird.
- **Töne (Musik):** Web Audio API (`nTone`, `nTick`), startet erst nach einer Berührung.

### Design-Regeln

- Alle Farben als Tokens in `:root`, dunkle Werte in beiden Dark-Mode-Blöcken
  (`@media (prefers-color-scheme: dark)` und `:root[data-theme="dark"]`). Keine Farbe nur in einem Theme definieren.
- Schriften: Bricolage Grotesque (Überschriften), Atkinson Hyperlegible (Text) über Google Fonts, mit Ersatzschriften.
- Muss auf Handybreite (~390 px) funktionieren, ohne seitliches Scrollen.
- Kein `alert()`, `confirm()`, `prompt()`, `window.print()`. Externe Skripte nur von erlaubten CDNs
  (cdnjs, jsdelivr, unpkg) mit fester Versionsnummer.
- Dinge, die Lösungen verraten, nicht in Antwortmöglichkeiten einbauen (z. B. keine Pausenzeichen neben Pausennamen).

### Externe Abhängigkeiten

- Google Fonts (Schriften).
- Weltkarten-Daten: `https://cdn.jsdelivr.net/npm/echarts@4.9.0/map/js/world.js`. Die Seite fängt den Aufruf
  `echarts.registerMap` mit einem kleinen Platzhalter ab und zeichnet die Karten selbst. Lädt die Datei nicht
  (offline), erscheint eine einfache Punktkarte als Ersatz.
- `localStorage` nur für Komfort: Hell/Dunkel-Wahl und Gucki-Sonnenbrille. Alles funktioniert auch ohne.

## Neues Kapitel hinzufügen – Checkliste

1. `<div class="topic" id="neueid" hidden>` vor `#gucki` einfügen, Aufbau wie die anderen Kapitel
   (Header mit Eyebrow „Fach · Klasse 5 · Bereich“, Erklärungen, interaktiver Teil, „Übungsaufgaben“, Tasks, Footer).
2. ID in `TOPICS` ergänzen und einen Link in der Navigation beim passenden Fach (`.fach`) einfügen.
3. Übungen mit `quiz()` oder eigener Logik bauen. Gucki-Schnittstelle und `box._reset` nicht vergessen.
4. Merkkasten-Farbe: `#neueid .merk{--accent:…}`.
5. Hell und dunkel sowie Handybreite prüfen.
6. Release-Prozess unten durchführen.

## Release-Prozess (Pflicht bei jeder Änderung)

Jede Version, die auf `main` landet, bekommt Versionshinweise – **auf GitHub und auf der Webseite**.

**Änderungen werden gesammelt.** Ein Pull Request wird **erst geöffnet, wenn die Lehrkraft es ausdrücklich sagt**.
Bis dahin landen alle Änderungen als Commits auf dem Arbeitsbranch `naechste-version` (von `main` abgezweigt,
gepusht, damit nichts verloren geht). Die kommende Version hat **einen** Eintrag in CHANGELOG.md und `releaseData`,
der mit jeder Änderung ergänzt wird. Kommt etwas Größeres dazu, steigt die Versionsnummer dieses Eintrags mit
(z. B. 1.1.1 → 1.2.0, sobald eine neue Funktion dabei ist). Die claude.ai-Vorschau wird trotzdem nach jeder
Änderung aktualisiert, damit man alles vorab ansehen kann.

1. **Versionsnummer festlegen** (MAJOR.MINOR.PATCH, nach der größten Änderung im Sammel-Eintrag):
   - PATCH (1.0.**1**): Fehlerkorrekturen, kleine Textänderungen.
   - MINOR (1.**1**.0): neues Kapitel, neue Übung, neue Funktion.
   - MAJOR (**2**.0.0): grundlegender Umbau, z. B. ein neuer Jahrgang mit eigener Struktur.
2. **CHANGELOG.md:** oben einen neuen Abschnitt `## [x.y.z] – JJJJ-MM-TT` mit `### Neu`, `### Verbessert`
   oder `### Behoben` einfügen.
3. **Webseite:** im JSON-Block `releaseData` in `src/entdeckerheft.html` in der Liste `releases` **ganz oben**
   einen Eintrag `{"version":"x.y.z","date":"JJJJ-MM-TT","title":"…","items":["…"]}` ergänzen.
   Kindgerecht formulieren – die Kinder lesen das.
   **Nach zehn Änderungen zusammenfassen:** Sobald eine neue Version einen neuen Zehnerblock beginnt
   (die 11., 21., 31. … Version), braucht der gerade abgeschlossene Block eine Zusammenfassung in `summaries`:
   `{"from":"älteste Version des Blocks","to":"neueste Version des Blocks","title":"…","items":["…"]}`.
   Die Zusammenfassung nennt in 3–6 kindgerechten Punkten, was sich in diesen zehn Versionen insgesamt getan hat.
   `check-release.mjs` meldet, welcher Block noch eine Zusammenfassung braucht. `CHANGELOG.md` bleibt vollständig.
4. `node scripts/build.mjs` ausführen (baut `index.html`).
5. `node scripts/check-release.mjs` ausführen – muss „Alles in Ordnung“ melden.
6. Auf `naechste-version` committen und pushen. **Erst auf Ansage** einen Pull Request gegen `main` öffnen;
   die Release Notes in die PR-Beschreibung übernehmen. Nach dem Merge für die nächste Runde `naechste-version`
   neu von `main` abzweigen.
7. Nach dem Merge erstellt der Workflow `release.yml` automatisch das GitHub-Release `vx.y.z` mit den
   Notizen aus CHANGELOG.md und hängt `index.html` als Download an.

Der Workflow `check.yml` lässt einen Pull Request scheitern, wenn die Versionshinweise nicht zusammenpassen,
eine Zusammenfassung fehlt, `index.html` veraltet ist oder die Versionsnummer schon veröffentlicht wurde.

## Vorschau auf claude.ai

Die Seite ist zusätzlich als claude.ai-Artifact veröffentlicht (privat, über das Teilen-Menü freigebbar):
https://claude.ai/artifact/R6pJni9HKDoiQHJXYtZUyB
Veröffentlicht wird `src/entdeckerheft.html`. Nach jeder Änderung dort aktualisieren (auch vor dem Pull Request).

## Getroffene Entscheidungen (nicht ohne Rückfrage ändern)

- Fünf Ozeane (mit Südlichem und Arktischem Ozean); Hinweis auf Atlanten mit drei Ozeanen.
- Südlicher Ozean grün (`--sud`), damit er sich von Pazifik und Atlantik abhebt.
- Kerguelen („Fr. S. Antarctic Lands“) zählen auf der Kontinente-Karte zu Afrika, nicht zu Antarktika.
- Kompass immer mit festen Farben (heller Grundplatte, schwarzer Richtungspfeil), auch in der dunklen Ansicht.
- Lageplan im Kompass-Kapitel ist ausdrücklich als ausgedachtes Beispiel gekennzeichnet.
- Zeitzonen und Uhrzeiten rechnen ohne Sommerzeit; das steht auf der Seite.
- Gucki-Jugendwörter: „Aura“ (3 fehlerfreie Übungen in Folge), „Cringe“ (3 Fehler in Folge), Banner „DAS CRAZY!“.
- Fünfmal schnell auf Gucki tippen startet die große Party (Vorführ-Trick für Lehrkräfte).
- Versionshinweise stehen auf einer eigenen Seite (`#neuigkeiten`) und werden je zehn Versionen zusammengefasst.
- „Nach oben“ unten links, Gucki unten rechts – die beiden Ecken nicht anders belegen.
- Name auf der Seite: „S.D.L.W.“ (Super Duper Lern Webseite) mit Regenbogen-Animation; Klick aufs Logo:
  Gucki macht Salto mit goldenem Leuchten, ruft „Super Duper Lern Webseite!“, etwas Konfetti.
- Versionshinweise nur als kleines rundes ✦-Symbol oben rechts, roter Punkt bei ungesehener Version.

## Bekannte Grenzen

- Die echten Kartendaten lassen sich nur online testen; ohne Internet erscheint die Punktkarte.
- Töne brauchen eingeschalteten Ton am Gerät (iPhone/iPad: Stummschalter aus).
- Beim lokalen Öffnen (`file://`) merken sich manche Browser (Safari) Hell/Dunkel und Sonnenbrille nicht.
