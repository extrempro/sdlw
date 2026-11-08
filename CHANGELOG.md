# Versionshinweise

Hier stehen alle Änderungen am Entdeckerheft, die neueste Version zuerst.
Jede Version steht genauso auch auf der Webseite unter „✦ Neu in …“.
Die Versionsnummern folgen dem Schema MAJOR.MINOR.PATCH (siehe CLAUDE.md, Abschnitt „Release-Prozess“).

## [1.1.0] – 2026-11-08

Neuer Name und besser zurechtfinden.

### Neu

- **Neuer Name: S.D.L.W. – Super Duper Lern Webseite.** Der Name steht als Logo oben links, die Schrift läuft in Regenbogenfarben. Ein Klick auf das Logo lässt es hüpfen, Gucki macht einen Salto, leuchtet golden, ruft „Super Duper Lern Webseite!“ und es regnet ein wenig Konfetti. Auch der Seitentitel heißt jetzt „S.D.L.W.“. Das Projekt und das Repository heißen weiterhin Entdeckerheft.
- **Wegweiser-Leiste:** Eine Leiste unter der Navigation bleibt beim Scrollen oben stehen. Sie zeigt das Symbol und die Farbe des Fachs, „Fach · Kapitel“ und groß den aktuellen Abschnitt, dazu „3/13“ als Position und unten einen Fortschrittsbalken durch das Kapitel. Mit ‹ › geht es zum vorherigen oder nächsten Abschnitt, mit ☰ öffnet sich die Liste aller Abschnitte, getrennt nach „Erklärungen“ und „Übungen“, nummeriert, mit grünem Haken für fehlerfrei geschaffte Übungen und ✎ für Aufträge fürs Heft.
- **Inhaltsverzeichnis:** Auf breiten Bildschirmen (ab 1240 px) steht rechts neben dem Inhalt dieselbe Liste mit Fortschrittsbalken; der aktuelle Abschnitt ist markiert.
- **Nach oben:** Ein Knopf unten links bringt zurück an den Seitenanfang, sobald man etwas gescrollt hat.
- **Eigene Seite für Versionshinweise:** Ein kleines ✦-Symbol oben rechts öffnet die Seite `#neuigkeiten`. Ein roter Punkt am Symbol zeigt, dass es eine Version gibt, die man sich noch nicht angesehen hat. Die neuesten Versionen stehen dort ausführlich. Je zehn ältere Versionen werden zu einem Block zusammengefasst, die Einzelheiten lassen sich aufklappen.

### Verbessert

- Versionshinweise der Webseite (`releaseData`) haben jetzt die Form `{"releases": […], "summaries": […]}`. `scripts/check-release.mjs` verlangt für jeden abgeschlossenen Zehnerblock eine Zusammenfassung.
- Der mitlaufende Lageplan im Kompass-Kapitel bleibt unter der neuen Leiste sichtbar.

## [1.0.0] – 2026-11-08

Die erste Version des Entdeckerhefts für Klasse 5.

### Neu

- **Deutsch – Groß- und Kleinschreibung:** vier Grundregeln, Nomen erkennen (Artikelprobe, Begleiter, Endungen), Nominalisierung mit Signalwörtern, Tageszeiten. Wort-Lupe zum Antippen, Übungen „Groß oder klein?“, Fehlerdetektiv, „Finde das Nomen“, „Warum groß?“ und ein Schreibauftrag.
- **Kunst – Farbkreis nach Itten:** anklickbarer 12-teiliger Farbkreis, Grund- und Mischfarben, Komplementärfarben, warme und kalte Farben. Übungen: Mischmaschine, Ordne zu, Gegenfarbe, warm oder kalt, Malauftrag.
- **Erdkunde – Die sieben Kontinente:** Weltkarte zum Antippen mit Steckbriefen, Größenvergleich, Kartenrätsel, Reihenfolge, Quiz, Steckbrief-Auftrag.
- **Erdkunde – Die Meere der Welt:** Weltkarte und drehbarer 3D-Globus mit den fünf Ozeanen, Nordsee und Ostsee im Vergleich, Kartenrätsel, Reihenfolge, Richtig/Falsch, Quiz, Atlas-Auftrag.
- **Erdkunde – Tag und Nacht:** 3D-Globus mit Jahreszeiten, Ansicht von oben, Weltzeituhr mit Zeitzonen und Datumsgrenze, sechs Übungen inklusive Zeitzonen-Rechnen und Experiment.
- **Erdkunde – Der Kompass:** Windrose, Kompass zum Drehen, Karte lesen in drei Schritten, Einnorden zum Ausprobieren, Übungen mit Lageplan und verdrehter Karte, Schulhof-Rallye.
- **Musik – Noten lesen:** Notensystem und klingende Klaviatur, Notennamen mit Merksätzen, Notenwerte, Pausen im Takt mit Takt-Baukasten, Übungen zu Notennamen, Klaviatur, Notenwerten, Pausen (mit Hörübung) und Notenwörtern.
- **Gucki, das Maskottchen:** klatscht bei richtigen Antworten, weint bei Fehlern, setzt nach zwei fehlerfreien Übungen eine Sonnenbrille auf, sagt „Aura!“ und „Cringe!“ und feiert ein fehlerfreies Kapitel mit einer großen Konfetti-Party samt Flugzeug.
- **Bedienung:** Navigation nach Jahrgang und Fach, helle und dunkle Ansicht, „Neu beginnen“ für jede Übung und für ganze Kapitel, Versionshinweise auf der Webseite.
