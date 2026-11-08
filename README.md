# Entdeckerheft

Interaktive Lernseite für die 5. Klasse (Gymnasium, Hamburg) mit Erklärungen, Ausprobier-Teilen und Übungen,
die sofort Rückmeldung geben.

**Kapitel:** Groß- und Kleinschreibung (Deutsch) · Farbkreis nach Itten (Kunst) · Die sieben Kontinente,
Die Meere der Welt, Tag und Nacht, Der Kompass (Erdkunde) · Noten lesen (Musik)

## Benutzen

`index.html` herunterladen und im Browser öffnen – fertig. Es braucht keinen Server und keine Installation.
Für die echte Weltkarte und die Schriften wird eine Internetverbindung genutzt; ohne Internet erscheint eine
einfache Ersatzkarte.

Ein Kapitel direkt öffnen: `index.html#deutsch`, `#farbkreis`, `#kontinente`, `#meere`, `#tagnacht`,
`#kompass`, `#noten`. Die Versionshinweise stehen unter `index.html#neuigkeiten`.

Die fertige Datei hängt außerdem an jedem [GitHub-Release](../../releases) als Download.

## Mitarbeiten

- Bearbeitet wird nur `src/entdeckerheft.html`. `index.html` entsteht mit `node scripts/build.mjs`.
- Jede Änderung bekommt eine neue Version mit Versionshinweisen in `CHANGELOG.md` **und** auf der Webseite.
  `node scripts/check-release.mjs` prüft, ob alles zusammenpasst.
- Änderungen kommen per Pull Request auf `main`. Nach dem Merge entsteht automatisch ein GitHub-Release.

Alle Details, Konventionen und die Checkliste für neue Kapitel stehen in [CLAUDE.md](CLAUDE.md).
Die Versionshinweise stehen in [CHANGELOG.md](CHANGELOG.md).
