# Entdeckerheft (S.D.L.W.)

Auf der Seite heißt sie **S.D.L.W.** – die *Super Duper Lern Webseite*. Interaktive Lernseite für die 5. Klasse (Gymnasium, Hamburg) mit Erklärungen, Ausprobier-Teilen und Übungen,
die sofort Rückmeldung geben.

**Kapitel:** Groß- und Kleinschreibung (Deutsch) · Farbkreis nach Itten (Kunst) · Die sieben Kontinente,
Die Meere der Welt, Tag und Nacht, Der Kompass (Erdkunde) · Noten lesen (Musik)

## Benutzen

`index.html` herunterladen und im Browser öffnen – fertig. Es braucht keinen Server und keine Installation.
Die Seite funktioniert komplett **ohne Internet**: Weltkarten-Daten und Schriften sind eingebaut.

Eingebaute Fremddaten:
- Kartendaten aus Apache ECharts 4.9.0 (`map/js/world.js`, Apache-Lizenz 2.0)
- Schriften Bricolage Grotesque und Atkinson Hyperlegible (SIL Open Font License 1.1, Lizenztexte im Ordner `fonts/`)

Ein Kapitel direkt öffnen: `index.html#deutsch`, `#farbkreis`, `#kontinente`, `#meere`, `#tagnacht`,
`#kompass`, `#noten`. Die Versionshinweise stehen unter `index.html#neuigkeiten`.

Die fertige Datei hängt außerdem an jedem [GitHub-Release](../../releases) als Download.

## Ausrollen mit Docker / Arcane

Im Repository liegen `docker-compose.yml` und `nginx.conf`. Der Stack startet einen nginx-Container, der das
Repository nur lesend einbindet und **nur die Webseite** ausliefert (`index.html`, `manifest.webmanifest`, `sw.js`,
`icons/`). Alles andere – Quelltext, Skripte, diese README – gibt 404.

**Mit der Git-Synchronisierung von Arcane:**

1. In Arcane eine neue Git-Synchronisierung (GitOps) anlegen.
2. Repository `https://github.com/extrempro/sdlw`, Branch `main`, Compose-Datei `docker-compose.yml`.
3. „Sync Files“ (Ordner mit synchronisieren) eingeschaltet lassen – sonst fehlen `index.html` und die anderen Dateien.
4. Optional die Umgebungsvariable `PORT` setzen (Standard 8080).

Nach jedem Merge auf `main` holt Arcane beim nächsten Sync die neue Version. Weil Seite, Manifest und Service Worker
nicht zwischengespeichert werden, bekommen Browser und installierte Apps das Update beim nächsten Öffnen.

**HTTPS:** Der Container spricht nur HTTP. Für die App (Progressive Web App) muss ein Reverse-Proxy davor HTTPS anbieten.

## Als App (Progressive Web App)

Liegt die Seite auf einem Webserver mit **https**, lässt sie sich als App installieren und startet danach auch
ohne Internet. Dafür müssen neben `index.html` auch `manifest.webmanifest`, `sw.js` und der Ordner `icons/`
auf dem Server liegen (bei einem `git clone` ist das automatisch so). Hauptadresse oder Unterordner – beides geht.

- Chrome/Edge (Android, Windows, Chromebook): Symbol „App installieren“ in der Adressleiste oder im Menü.
- iPhone/iPad: in Safari Teilen → „Zum Home-Bildschirm“.

Neue Versionen holt sich die App von selbst, sobald das Gerät online ist.

## Mitarbeiten

- Bearbeitet wird nur `src/entdeckerheft.html`. `index.html`, `manifest.webmanifest` und `sw.js` entstehen mit
  `node scripts/build.mjs`. Die App-Symbole in `icons/` erzeugt `node scripts/make-icons.mjs` (braucht Playwright).
- Jede Änderung bekommt eine neue Version mit Versionshinweisen in `CHANGELOG.md` **und** auf der Webseite.
  `node scripts/check-release.mjs` prüft, ob alles zusammenpasst.
- Änderungen kommen per Pull Request auf `main`. Nach dem Merge entsteht automatisch ein GitHub-Release.

Die Versionshinweise stehen in [CHANGELOG.md](CHANGELOG.md).
