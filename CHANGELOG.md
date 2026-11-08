# Versionshinweise

Hier stehen alle Änderungen am Entdeckerheft, die neueste Version zuerst.
Jede Version steht genauso auch auf der Webseite unter „✦ Neu in …“.
Die Versionsnummern folgen dem Schema MAJOR.MINOR.PATCH (siehe CLAUDE.md, Abschnitt „Release-Prozess“).

## [1.5.0] – 2026-11-08

Spiele-Bereich mit den Spielen „Fang die Farben“ und „Guckis Weltreise“.

### Neu

- **Spiele-Seite** (`#spiele`): erreichbar über den neuen runden 🎮-Knopf oben rechts (`#gameBtn`) und über den Abschnitt „Spiele“ auf der Startseite. Spiele stehen bewusst **nicht** in der Hauptnavigation; sie sind im versteckten Spiele-Verzeichnis `#gameReg` eingetragen, aus dem Spiele-Seite, Startseite und Wegweiser lesen. Das Farbkreis-Kapitel verweist vor den Übungen auf das Spiel.
- **Spiel „Fang die Farben“** (`#farbfang`, Farbe `--spiel`). Gucki fängt mit einem Eimer fallende Farbtropfen. Gesucht sind genau die zwei Farben, aus denen die angezeigte Zielfarbe gemischt wird.
  - **Stufen:** Stufe 1 hat Mischfarben 1. Ordnung (es fallen nur Grundfarben). Ab sechs gemischten Farben folgt Stufe 2 mit Mischfarben 2. Ordnung (es fallen Grundfarben und Mischfarben 1. Ordnung), mit wachsendem Tempo.
  - **Punkte und Herzen:** 10 Punkte je Mischung plus Serienbonus. Eine falsche Farbe kostet ein Herz, nach drei Herzen ist das Spiel vorbei.
  - **Gut sichtbar:** Die Zielfarbe steht als Banner oben im Spielfeld, mit zwei Fangplätzen. Vor jeder neuen Zielfarbe gibt es eine Ansage von 1,6 s, in der keine Tropfen fallen. Gucki trägt den Eimer auf dem Kopf, damit kein Tropfen vor dem Fangen verdeckt wird, und schaut wie am Bildschirmrand nur ein Stück aus dem Boden. Das Spielfeld wird in der Auflösung des Geräts gezeichnet und ist dadurch auch auf Handys und Tablets scharf. Stufe 1 startet langsam.
  - **Rückmeldung:** Jede Mischung erscheint als „Blau + Gelb = Grün!“. Am Ende stehen alle gemischten Farben als Übersicht da.
  - **Daten aus dem Farbkreis:** Farben, Namen und Mischregeln kommen aus dem Farbkreis-Kapitel (`C`). Die Seite zeigt alle Mischregeln zum Nachlesen.
  - **Steuerung:** Finger/Maus (ziehen), Pfeiltasten, Knöpfe ◀ ▶. Pause per Knopf; das Spiel pausiert auch beim Seitenwechsel oder wenn der Tab im Hintergrund ist.
  - **Rekord** pro Gerät in `localStorage` („ffBest“). Gucki jubelt bei einem neuen Rekord.
- **Spiel „Guckis Weltreise“** (`#weltreise`): Gucki fährt mit einem Containerschiff von Hamburg um die Welt, auf zwei Touren mit je fünf Etappen:
  - **Atlantik-Runde:** Hamburg → Lissabon → New York → Buenos Aires → Kapstadt → Hamburg
  - **Asien-Runde:** Hamburg → Kapstadt → Mumbai → Sydney → Tokio → Hamburg (Rückweg durch den Suezkanal)

  Ablauf je Etappe:
  - **Richtung:** Die Kinder bestimmen auf einer Kompassrose (N, NO, O, SO, S, SW, W, NW), in welcher Himmelsrichtung das Ziel auf der Karte liegt. Die Etappen sind so gewählt, dass die Richtung auf der Karte höchstens 11° von der Hauptrichtung abweicht.
  - **Fahrt:** Das Schiff fährt animiert über Seewege; die Karte zoomt auf die Etappe.
  - **Hafen:** Im Hafen gibt es einen kurzen Steckbrief und eine Frage zu Kontinent, Ozean, Land oder Uhrzeit (ohne Sommerzeit). Richtige Antwort = ein Container.

  Eine ganze Reise ohne Fehler startet Guckis große Party. Das Kompass-Kapitel verweist vor den Übungen auf das Spiel.
- Kopfzeile: Symbol-Knöpfe sind rund. Unter 400 px Breite werden sie kleiner und das Schild „Klasse 5“ entfällt, damit das Logo ganz sichtbar bleibt.

## [1.4.0] – 2026-11-08

Übung „Tag oder Nacht?“ neu aufgebaut, Seite komplett ohne Internet nutzbar, Weltzeituhr aufgeräumt.

### Verbessert

- **Globus (Tag und Nacht, Meere):** Die grob als Rechtecke eingezeichneten Wüsten (gelblich: Sahara/Arabien, Mitte Australiens) sind entfernt. Sie waren nirgends erklärt und lenkten vom Thema ab. Land ist jetzt einheitlich grün, Eis weiß, Meer blau.
- **Schriften ohne Internet:** Bricolage Grotesque (Stärke 600–800) und Atkinson Hyperlegible (400, 700) sind eingebettet statt von Google Fonts geladen, gekürzt auf die nötigen Zeichen (zusammen rund 140 KB). Damit lädt die Seite nichts mehr aus dem Internet. Neu im Repository: `fonts/` (WOFF-Dateien, Lizenztexte SIL OFL 1.1) und `scripts/make-fonts.py`.
- **Weltkarte ohne Internet:** Die Kartendaten (Apache ECharts 4.9.0, `map/js/world.js`, Apache-Lizenz 2.0) sind jetzt direkt in die Seite eingebaut, statt beim Öffnen von jsdelivr geladen zu werden. Kontinente, Meere, Globen und Weltzeituhr zeigen auch offline die echte Karte. Die Datei wird dadurch etwa 100 KB größer.
- **Aufgabe 1 „Tag oder Nacht?“ (n1, Kapitel Tag und Nacht):** Vorher kamen sechsmal dieselbe Frage, ob der Punkt auf der hellen Seite liegt; die Erklärung nannte nur die Uhrzeit. Jetzt gibt es drei Stufen:
  - **Erkennen:** eine Frage am Globus-Bild, Tag oder Nacht, mit Begründung
  - **Ablesen:** drei Fragen zur Ansicht von oben: Morgen, Mittag, Abend oder Mitternacht? Lösbar nur mit dem Drehpfeil; bei Fehlern gibt es einen Hinweis darauf.
  - **Verstehen:** zwei von fünf Fragen, z. B. warum es Tag und Nacht gibt (mit dem häufigen Irrtum „Die Erde kreist um die Sonne“ als Falle), warum nur eine Hälfte hell ist, Neuseeland gegenüber, Sonnenaufgang im Osten, was beim Sonnenuntergang wirklich passiert

### Behoben

- **Weltzeituhr (Kapitel Tag und Nacht):** In den Stadt-Kärtchen ragten „Sonnenuntergang“, „Sonnenaufgang“ und „nächster Tag“ je nach Bildschirmbreite und Uhrzeit über den Rand hinaus. Die Kärtchen haben jetzt zwei Zeilen: oben Stadt und Uhrzeit, darunter Tag/Nacht und gegebenenfalls „nächster Tag“ oder „Vortag“. Geprüft für alle Uhrzeiten bei 360 bis 1300 px Breite.

## [1.3.1] – 2026-11-08

Freundlichere Erklärung der Aufregung.

### Verbessert

- **„Woran merkst du starke Aufregung?“** (Kapitel Klassenarbeit) ist positiver formuliert. Aufregung wird als Zeichen erklärt, dass einem die Arbeit wichtig ist, und Stresshormone als Energie, wie bei Sport oder einem Auftritt. Die Anzeichen heißen jetzt „Signale“ und sind sanfter beschrieben. Jede Karte nennt gleich, was hilft. Ein Merkkasten sagt, dass die Signale ungefährlich sind, vorbeigehen und jeder sie kennt.

## [1.3.0] – 2026-11-08

Neuer Bereich „Lernen“ mit dem Kapitel „Fit für die Klassenarbeit“.

### Neu

- **Kapitel „Fit für die Klassenarbeit“** (`#klassenarbeit`) im neuen Navigationsbereich **Lernen** (Farbe `--lern`). Inhalte:
  - rechtzeitig anfangen und verteilt lernen
  - Lernmethoden: selbst abfragen, Karteikarten, Lernzettel, jemandem erklären, Aufgaben üben, Lernplatz, Pausen
  - Tag vorher und Morgen der Arbeit
  - acht Schritte in der Arbeit
  - Arbeitsanweisungen (Operatoren: nennen, beschreiben, erklären, begründen, vergleichen, zuordnen)
  - Tipps gegen Aufregung
  - Berichtigung nach der Arbeit
- **Starke Aufregung:** Ein Teil erklärt Anzeichen in Körper, Kopf und Verhalten (mit kindgerechter Erklärung von Stresshormonen). Dazu kommen:
  - **Aufregungs-Thermometer** mit fünf Stufen, die je passende Tipps zeigen; bei „Panik“ der Rat, der Lehrkraft Bescheid zu sagen
  - **Atem-Kreis** zum Mitatmen: 4 s ein, 2 s halten, 6 s aus, 5 Runden
  - leise Tricks für die Arbeit: Fäuste-Trick, 5-4-3-2-1, Stopp und Mut-Satz, lockern und trinken
  - Vorbeugen: vorbereitet, ausgeschlafen und satt in die Arbeit, Bewegung am Tag vorher
- **Lernplan zum Ausprobieren:** Schieberegler für 3 bis 10 Tage bis zur Arbeit. Daraus entsteht ein Tagesplan mit echten Daten zum Abhaken. Fällt die Arbeit aufs Wochenende, erscheint ein Hinweis.
- **Packliste** zum Abhaken. Gucki freut sich, wenn alles erledigt ist.
- **Übungen:**
  - ka1: Was ist schlau? (6 Situationen)
  - ka2: Was sollst du tun? (Operatoren)
  - ka3: Schritt für Schritt (Reihenfolge in der Arbeit)
  - ka4: Stimmt das? (richtig/falsch)
  - ka6: Was hilft jetzt? (Anzeichen und Hilfen bei Aufregung)
  - ka5: Auftrag „Mein Lernplan“

  ka1 bis ka4 und ka6 zählen für Guckis Kapitel-Party.

### Verbessert

- Die Startseite erwähnt den neuen Bereich und zeigt das Kapitel automatisch als Karte.

## [1.2.0] – 2026-11-08

Eine Startseite mit Haus-Knopf, ein Favicon und Verbesserungen für Handys und Tablets.

### Neu

- **Startseite** (`#start`, auch ohne Adresszusatz): Begrüßung, alle Kapitel als Karten mit Fach, Symbol, Kurzbeschreibung und Fortschritt („2 von 5 fehlerfrei“), dazu „So lernst du hier“ in drei Schritten. Die Karten entstehen automatisch aus der Navigation; die Kurzbeschreibung steht im Attribut `data-desc` des Navigationslinks. Gucki sagt beim ersten Öffnen „Hallo!“.
- **Haus-Knopf** oben rechts neben dem ✦: führt von überall zur Startseite und ist dort hervorgehoben.
- **Favicon:** Gucki mit Augen als SVG-Symbol im Browser-Tab und als App-Symbol (`apple-touch-icon`, 180 × 180 px) für den Startbildschirm von Tablets und Handys.

### Verbessert

- Unter dem Logo „S.D.L.W.“ steht nicht mehr ausgeschrieben „Super Duper Lern Webseite“. Die Bedeutung erscheint weiterhin als Hinweis beim Darüberfahren mit der Maus, wird von Screenreadern vorgelesen und Gucki ruft sie beim Klick aufs Logo.
- **Pfeile ‹ › in der Wegweiser-Leiste** sind jetzt gezeichnete SVG-Pfeile. Auf manchen Android-Handys fehlte das Zeichen in der Schrift und erschien als Anführungszeichen.
- **Farbkreis auf dem Handy:** Der Kreis ist auf schmalen Bildschirmen kleiner, damit Kreis und Erklärung zusammen sichtbar sind. Ist die Erklärung nach dem Antippen nicht ganz zu sehen, scrollt die Seite ein Stück dorthin. Antippen reagiert sofort (`touch-action: manipulation`), ohne grauen Tipp-Rahmen von Chrome.
- Die Wegweiser-Leiste zeigt auf Seiten ohne Abschnitte (Startseite) nur den Seitennamen, ohne Pfeile und leeren Zähler.

### Behoben

- **Farbkreis in Chrome auf Android-Handys zerstückelt:** Beim Antippen wurden die übrigen Farbfelder mit einem `opacity`-Übergang abgedunkelt. Chrome auf Android hat diese SVG-Flächen dabei zerstückelt und mit Bildrauschen gezeichnet, der Farbkreis war nicht benutzbar. Das Abdunkeln läuft jetzt über `fill-opacity`, ebenso auf den Karten der Kapitel Kontinente und Meere.
- **Gucki in Firefox auf Tablets/Android:** Firefox schiebt Elemente, die unten am Bildschirm kleben, beim Hochscrollen manchmal um die Höhe der Adressleiste nach oben (bekannter Firefox-Fehler, Mozilla-Bugs 1797964 und 2012733). Guckis Körper reicht jetzt unter den Bildschirmrand, sodass er dann höchstens etwas weiter herausschaut, statt in der Luft zu schweben.
- Das ✦-Symbol für die Versionshinweise war kein runder Knopf mehr und der rote Punkt für ungesehene Versionen fehlte (Stile gingen verloren). Beides ist wieder da, gemeinsam mit dem Haus-Knopf in der Klasse `.iconbtn`.

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
