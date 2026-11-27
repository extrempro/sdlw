# Sicherheit von S.D.L.W.

**Stand:** 27.11.2026 · **Grundlage:** OWASP ASVS 5.0.0, Level 2 · **Erstprüfung**

## Was geprüft wurde

- **Anwendung:** S.D.L.W. (Repository `extrempro/sdlw`), Version 1.16.0 und die Korrekturen dieser Prüfung (1.16.1).
  Eine statische Lernseite in einer HTML-Datei (`src/entdeckerheft.html` → `index.html`), dazu Service Worker (`sw.js`),
  App-Manifest und Symbole. **Keine Anmeldung, keine Rollen, keine Mandanten, keine Datenbank, kein Server-Code.**
- **Betrieb:** öffentlich im Internet. Docker-Container `nginx:stable-alpine` (`docker-compose.yml`, `nginx.conf`), ausgerollt
  mit Arcane per Git-Sync, HTTPS über den NetBird Reverse Proxy davor.
- **Schützenswerte Daten:** keine personenbezogenen Daten auf dem Server. Im Browser speichert die Seite nur Komfort-Werte
  (siehe „Dokumentierte Sicherheitsentscheidungen“). Nutzer sind Kinder (10–11 Jahre) → Datensparsamkeit ist besonders wichtig.
- **Vorgehen:**
  1. Bestandsaufnahme des Codes: alle Stellen, an denen Daten ins HTML gelangen (`innerHTML`, 157 Stellen), alle Eingaben
     (URL-Hash, `localStorage`, Eingabefelder), Service Worker, externe Verbindungen, Abläufe in GitHub Actions.
  2. Angriffe im echten Browser (Chromium/Playwright) gegen eine lokal ausgelieferte Instanz (`index.html` über einen
     HTTP-Server, damit Service Worker und CSP wie im Betrieb greifen).
  3. nginx konnte in der Prüfumgebung nicht gestartet werden (kein Docker). Deshalb gibt es jetzt den Live-Test
     `scripts/test-nginx.sh`, der in GitHub Actions den echten Stack aus `docker-compose.yml` startet und angreift.
  4. Unabhängiger Prüfer (eigener Agent ohne Kenntnis der eigenen Funde) mit Zugriff auf Instanz und Code.

## Funde und Korrekturen (eigene Prüfung)

| # | Fund | Schwere | Stand |
|---|---|---|---|
| E1 | Keine Content-Security-Policy. Eine eingeschleuste Skript-Zeile würde ausgeführt. (Es wurde keine Lücke gefunden, über die das möglich wäre – die CSP ist die zweite Verteidigungslinie.) | mittel | **behoben:** `scripts/build.mjs` schreibt eine CSP als `<meta>` in `index.html`: `script-src 'self'` plus SHA-256-Prüfsumme jedes eingebetteten Skripts (kein `unsafe-inline`, kein `unsafe-eval`), `object-src`, `base-uri`, `form-action` = `'none'`, `connect-src 'self'`. Nachweis: eingeschleustes `<img onerror>` und neues `<script>` werden blockiert; alle Seiten, Spiele, 125 Gucki-Tricks, Ton und Service Worker laufen ohne CSP-Verstoß. Test: `scripts/test-sicherheit.mjs`. |
| E2 | nginx setzte nur `nosniff` und `Referrer-Policy`; es fehlten `frame-ancestors`/`X-Frame-Options` (Einbetten in fremde Seiten), `Permissions-Policy`, `Strict-Transport-Security`, `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`. Fehlerseiten (404) bekamen gar keine Sicherheits-Header. | niedrig | **behoben:** alle Header einmal im `server`-Block mit `always`; `Cache-Control` über eine `map`, damit kein `add_header` in `location`-Blöcken die übrigen Header aufhebt. Test: `scripts/test-sicherheit.mjs` (Konfiguration) und `scripts/test-nginx.sh` (live, auch für 404 und Symbole). |
| E3 | nginx verriet seine Versionsnummer (Header `Server`, Fehlerseiten). | niedrig | **behoben:** `server_tokens off`. Test: `scripts/test-nginx.sh`. |
| E4 | Alle HTTP-Methoden erreichten nginx (bei statischen Dateien harmlos, aber unnötig). | Info | **behoben:** nur `GET` und `HEAD`, sonst 405. Test: `scripts/test-nginx.sh`. |
| E5 | GitHub Actions über verschiebbare Versions-Tags (`@v4`) eingebunden – ein veränderter Tag könnte fremden Code in den Release-Ablauf bringen (der `contents: write` hat). | niedrig | **behoben:** `actions/checkout` und `actions/setup-node` auf feste Commit-Prüfsummen (v4.4.0) gesetzt. |
| E6 | Container lief mit allen Standard-Rechten und beschreibbarem Dateisystem. | niedrig | **behoben:** `no-new-privileges`, `read_only: true` mit `tmpfs` für die Arbeitsordner von nginx, `cap_drop: ALL` mit nur `CHOWN`, `SETUID`, `SETGID`, `NET_BIND_SERVICE`. Test: `scripts/test-nginx.sh` startet genau diesen Stack. |
| E7 | Vorlese-Stimmen: Manche Browser (z. B. Chrome mit „Google“-Stimmen) schicken den vorzulesenden Text an den Anbieter. Betroffen sind nur englische Vokabeln aus der Seite, keine Eingaben der Kinder. | Info | **offen, Entscheidung der Lehrkraft:** Die Seite wählt die Stimme nach Klangqualität; Online-Stimmen werden nur abgewertet, wenn das Gerät offline ist. Im Hilfe-Bereich der Vokabeln lässt sich eine Stimme fest einstellen. Möglich wäre, Stimmen auf dem Gerät immer vorzuziehen – dann klingt es auf manchen Computern roboterhafter. |

## Funde des unabhängigen Prüfers

Der Prüfer (eigener Agent, ohne Kenntnis der eigenen Funde) hat die laufende Instanz und den Code angegriffen. Er fand
nichts mit Schwere hoch oder mittel. Jeder Fund wurde nachgeprüft.

| # | Fund | Schwere | Stand |
|---|---|---|---|
| P1 | Manipulierter `vokBox`-Wert (z. B. Fach 9) ließ den Karteikasten abstürzen – auf geteilten Klassengeräten könnte ein Kind die Übung für das nächste lahmlegen. Kein HTML-Einschleusen möglich. | niedrig | **bestätigt, behoben:** beim Laden werden nur Einträge mit Fach 1–3 übernommen. Nachweis: vier kaputte Werte getestet, Karteikasten läuft, keine Fehler. |
| P2 | `guckiSpecial` wurde nicht als Liste geprüft; ein Wert wie `{}` warf Fehler bei besonderen Tricks. | niedrig | **bestätigt, behoben:** nur Listen, nur bekannte Trick-Namen. |
| P3 | Service Worker ersetzte Weiterleitungen und jede Fehlerantwort (404, 405, 5xx – auch für `/healthz`) durch die gespeicherte Seite mit Status 200. Eine spätere Umleitung (Umzug der Adresse) wäre auf installierten Geräten nie angekommen; es gab keinen Notschalter. | niedrig | **bestätigt, behoben:** Weiterleitungen (`opaqueredirect`) und Antworten unter 500 werden durchgereicht; die gespeicherte Seite gibt es nur für die Startadresse (`/`, `/index.html`) bei Netzfehler, 5xx oder nach 4 s. Nachweis: `/gibtsnicht` → 404, `/icons` folgt der Weiterleitung, offline starten `/` und `/index.html#zahlen` weiter. Notschalter siehe „Dokumentierte Sicherheitsentscheidungen“. Dabei selbst einen Escape-Fehler im Build bemerkt (ungültige `sw.js`) – Test `sw.js ist gültiges JavaScript` ergänzt. |
| P4 | Port in `docker-compose.yml` auf allen Schnittstellen (`0.0.0.0`); Docker umgeht Firewall-Regeln des Hosts, die Seite wäre ggf. direkt per HTTP ohne Proxy erreichbar. | niedrig | **offen, Entscheidung beim Betrieb:** hängt davon ab, wie der NetBird-Proxy den Container erreicht (siehe Offene Punkte). Inhalte sind öffentlich. |
| P5 | Image `nginx:stable-alpine` nicht per Prüfsumme festgelegt; Master-Prozess läuft als root (braucht CHOWN/SETUID/SETGID). | niedrig | **akzeptiert:** Ein fester Digest würde Sicherheitsupdates von nginx verhindern, solange niemand ihn pflegt. Der Container ist gehärtet (E6). Umstieg auf `nginxinc/nginx-unprivileged` als späterer Schritt (ändert den Port für den Proxy). |
| P6 | Ganzes Repository samt `.git` im Web-Root; Schutz nur über `location`-Regeln; Symlinks in `icons/` würden befolgt. | niedrig | **teilweise behoben:** `disable_symlinks on`, unter `/icons/` nur noch `icon-….png` (Positivliste). Live-Test legt einen Symlink auf `.git/config` an → 403. Eigener Auslieferungsordner (`public/`) als späterer Schritt. |
| P7 | `actions/checkout` speicherte das Token (im Release-Ablauf mit Schreibrecht) in `.git/config`. | niedrig | **behoben:** `persist-credentials: false` in beiden Abläufen; `gh` bekommt das Token nur über `GH_TOKEN`. Test in `scripts/test-sicherheit.mjs`. |
| P8 | `frame-ancestors` wirkt nicht als `<meta>`; außerhalb von nginx (z. B. die `index.html` am GitHub-Release) lässt sich die Seite einbetten. | niedrig | **akzeptiert und dokumentiert:** nur die Auslieferung über nginx ist abgesichert; die Seite hat keine Aktionen, die sich per Clickjacking missbrauchen ließen. |
| P9 | `script-src 'self'` erlaubt jede JavaScript-Datei derselben Adresse (heute nur `sw.js`). | Info | **akzeptiert:** ohne eine Möglichkeit, HTML einzuschleusen, nicht ausnutzbar; `'self'` bleibt für ältere Browser, die den Service Worker über `script-src` prüfen. |
| P10 | Versionshinweise werden per `innerHTML` eingesetzt (Daten aus dem eigenen Repository). | Info | **behoben:** Test prüft, dass sie kein `<` oder `>` enthalten. |
| P11 | Online-Vorlesestimmen werden wegen des Klangs bevorzugt (siehe E7). | Info | **offen, Entscheidung der Lehrkraft.** |
| P12 | Action-Prüfsummen offline nicht überprüfbar. | Info | **geprüft:** per `git ls-remote` gegen `refs/tags/v4` und `v4.4.0` der offiziellen Repositories `actions/checkout` und `actions/setup-node`. |
| P13 | HSTS ohne `includeSubDomains`, keine Ratenbegrenzung, `/healthz` öffentlich, Log-Aufbewahrung offen. | Info | **akzeptiert:** Subdomains sind nicht bekannt; statische Seite ohne teure Anfragen; `/healthz` verrät nichts; Logs siehe Offene Punkte. |
| P14 | `Referrer-Policy` fehlte außerhalb von nginx. | Info | **behoben:** zusätzlich `<meta name="referrer" content="same-origin">` in `index.html`. |
| P15 | Karteikasten-Stand ist auf geteilten Geräten für das nächste Kind sichtbar. | Info | **akzeptiert:** kein Personenbezug; „Karteikasten leeren“ vorhanden. |

Ohne Fund geprüft (Prüfer): XSS über Hash (auch `__proto__`, `javascript:`, 200 000 Zeichen), über alle `localStorage`-Werte und
alle Eingabefelder (auch 50 000 Zeichen), Prototype Pollution, DOM-Clobbering, CSP-Umgehung (`data:`-Skripte, Strings in
`setTimeout`, Bilder und `fetch` zu fremden Adressen blockiert), Datenabfluss über `style-src 'unsafe-inline'`, Verbindungen zu
Dritten (keine), offene Weiterleitungen (keine), Cache-Poisoning im Service Worker (nicht möglich), GitHub Actions
(`pull_request` statt `pull_request_target`, keine Einschleusung in `run`).

## Stand je ASVS-Kapitel (5.0)

| Kapitel | Stand | Umsetzung und Belege |
|---|---|---|
| V1 Encoding und Sanitization | erfüllt | Alle Daten, die ins HTML gelangen, stammen aus der Seite selbst; Werte aus `localStorage` werden geprüft (z. B. Klasse nur aus der Liste vorhandener Klassen, Hell/Dunkel nur `light`/`dark`) oder als Zahl gelesen; Stimmennamen werden mit `esc()` maskiert. Angriffe mit HTML über URL-Hash, alle 13 `localStorage`-Schlüssel und 48 Eingabefelder: kein einziges eingeschleustes Element. Zusätzlich CSP (E1). |
| V2 Validierung und Geschäftslogik | erfüllt | Eingaben in Übungen und Spielen werden nur verglichen oder als Zahl gelesen (z. B. `MZ.parse`, Ziffern-Felder entfernen alles außer Ziffern). Es gibt keine serverseitige Geschäftslogik. |
| V3 Web-Frontend | erfüllt | CSP mit Prüfsummen (E1), `frame-ancestors 'none'` und `X-Frame-Options: DENY` (E2), `nosniff`, `Referrer-Policy: same-origin`, COOP/CORP, keine Inline-Handler und keine `javascript:`-Adressen (Test), externe Links mit `rel="noopener"` (Test). Service Worker beantwortet nur `GET` an die eigene Adresse. |
| V4 API und Web-Services | nicht zutreffend | Keine API. |
| V5 Dateien | nicht zutreffend | Keine Uploads. nginx liefert nur die benötigten Dateien und `/icons/icon-….png`, alles andere (Quellen, `.git`, Skripte, Konfiguration) gibt 404 – auch mit Pfadtricks (`..`, `%2f`, `%2e%2e`) und über Symlinks (P6). Test: `scripts/test-nginx.sh`. |
| V6 Authentifizierung | nicht zutreffend | Keine Anmeldung. |
| V7 Sitzungen | nicht zutreffend | Keine Sitzungen, keine Cookies. |
| V8 Autorisierung | nicht zutreffend | Alle Inhalte sind öffentlich; es gibt keine geschützten Daten. |
| V9 Self-contained Tokens | nicht zutreffend | Keine Tokens. |
| V10 OAuth und OIDC | nicht zutreffend | Keine Anmeldung über Dritte. |
| V11 Kryptografie | nicht zutreffend | Keine Kryptografie in der Anwendung (SHA-256 nur im Build für die CSP). |
| V12 Sichere Kommunikation | teilweise | HTTPS macht der NetBird-Proxy; nginx setzt `Strict-Transport-Security` (E2). Zwischen Proxy und Container läuft HTTP – vertretbar, weil nur öffentliche Inhalte ohne Zugangsdaten übertragen werden. Ob HTTP→HTTPS umgeleitet wird, liegt am Proxy (offener Punkt). |
| V13 Konfiguration | teilweise | Keine Geheimnisse im Repository (geprüft), keine Abhängigkeiten zur Laufzeit (keine CDNs, Schriften und Kartendaten eingebettet), Container gehärtet (E6), Version verborgen (E3), feste Action-Versionen ohne gespeicherte Zugangsdaten (E5, P7), `main` per Ruleset geschützt. Offen: Port-Freigabe (P4), Image-Pflege (P5). |
| V14 Datenschutz | erfüllt | Keine Verbindungen zu Dritten zur Laufzeit, kein Tracking, keine Cookies. `localStorage` nur für Komfort (siehe unten); Lernplan und Packliste speichern bewusst nichts (geteilte Klassengeräte). Hinweis zu Online-Stimmen (E7). |
| V15 Sicheres Programmieren und Architektur | erfüllt | Kein `eval`, kein `new Function`, keine Strings in `setTimeout`. Gespeicherte Werte werden beim Lesen geprüft (P1, P2); Fehler werden abgefangen (`try/catch`, Standardwerte). Seite funktioniert auch ohne `localStorage`. |
| V16 Logging und Fehlerbehandlung | teilweise | Kein Server-Code, also nichts zu protokollieren außer den nginx-Zugriffen (Standard-Log im Container, Healthcheck ausgenommen). Fehlerseiten ohne Interna (E3). Aufbewahrung der Logs regelt der Docker-Host (offener Punkt). |
| V17 WebRTC | nicht zutreffend | Kein WebRTC. |

## Dokumentierte Sicherheitsentscheidungen

- **Keine Anmeldung, keine Daten auf dem Server.** Fortschritt, Rekorde und Einstellungen bleiben auf dem Gerät des Kindes.
- **Gespeichert im Browser (`localStorage`)**, nur Komfort, kein Personenbezug: Hell/Dunkel (`theme`), gewählte Klasse
  (`klasse`), zuletzt gesehene Version (`seenVersion`), Vorlese-Stimme (`vokVoice`), Karteikasten-Stand (`vokBox`),
  Spiel-Rekorde (`ffBest`, `blitzBest`, `memoBest`, `hafenBest`, `mauerBest`, `zielBest2`, `lmemBest`), gefundene
  besondere Gucki-Tricks (`guckiSpecial`). Manipulierte Werte werden geprüft oder führen höchstens zu falschen Zahlen auf dem
  eigenen Gerät.
- **Service-Worker-Cache:** speichert nur `index.html`, Manifest und Symbole der eigenen Adresse; Seiten kommen immer zuerst
  frisch vom Server. Nur für die Startadresse gibt es die gespeicherte Seite (offline, bei 5xx oder nach 4 Sekunden);
  Weiterleitungen und 404 kommen vom Server.
- **Notschalter für die App:** Soll S.D.L.W. auf allen Geräten abgeschaltet werden, die erzeugte `sw.js` durch eine Datei mit
  `self.addEventListener("install", () => self.skipWaiting()); self.addEventListener("activate", () => self.registration.unregister());`
  ersetzen und ausrollen. Beim nächsten Besuch meldet sich der Service Worker ab.
- **CSP:** Prüfsummen statt `unsafe-inline` für Skripte. `style-src 'unsafe-inline'` bleibt bewusst erlaubt, weil die Seite
  viele `style`-Attribute nutzt; Stil-Einschleusung ohne Skript ist hier ohne Wirkung auf Daten.
- **Erlaubte Pfade bei nginx:** `/`, `/index.html`, `/sw.js`, `/manifest.webmanifest`, `/icons/icon-….png`, `/healthz`. Alles andere 404; Symlinks werden nicht befolgt.
- **Zwischenspeicher:** Seite, Manifest und Service Worker `no-cache`; Symbole 1 Tag.
- **Testzugänge zur Vorführung** (`GuckiTricks.play()`, `FangDieFarben.state()`) sind öffentlich, aber ohne Wirkung auf andere Nutzer.

## Offene Punkte

- **NetBird Reverse Proxy:** sicherstellen, dass er HTTP auf HTTPS umleitet und die Header von nginx unverändert durchreicht
  (prüfen mit `curl -sI https://<adresse>/` – erwartet u. a. `content-security-policy: frame-ancestors 'none'` und
  `strict-transport-security`). Falls der Proxy selbst `Strict-Transport-Security` setzt, ist doppelt unschädlich.
- **Port-Freigabe (P4):** In `docker-compose.yml` ist der Port auf allen Schnittstellen offen. Erreicht der NetBird-Proxy den
  Container über `localhost` desselben Rechners, `"127.0.0.1:${PORT:-8080}:80"` eintragen; erreicht er ihn über die NetBird-IP,
  nur diese IP freigeben. Danach ist die Seite nicht mehr ohne HTTPS am Proxy vorbei erreichbar.
- **Später möglich:** eigener Auslieferungsordner statt des ganzen Repositorys (P6), `nginx-unprivileged` (P5),
  Dependabot für die GitHub Actions.
- **Nach dem nächsten Arcane-Sync:** einmal prüfen, dass der Container mit `read_only` und den reduzierten Rechten startet
  (in GitHub Actions getestet, auf dem Server noch nicht).
- **Aufbewahrung der nginx-Zugriffslogs** (IP-Adressen) auf dem Docker-Host festlegen, z. B. Docker-Log-Rotation.
- **Claude-Vorschau:** Die Vorschau auf claude.ai wird von claude.ai ausgeliefert, nicht von nginx; dort gelten deren Regeln.

## Hinweis

Diese Prüfung ersetzt keinen externen Penetrationstest. Nach größeren Änderungen (z. B. Anmeldung, Server-Code, Uploads,
neue externe Dienste) wiederholen. Die Tests `scripts/test-sicherheit.mjs` und `scripts/test-nginx.sh` laufen bei jedem
Push auf `naechste-version` und bei jedem Pull Request automatisch.
