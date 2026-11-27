#!/bin/sh
# Live-Test der Auslieferung: startet den Stack aus docker-compose.yml (nginx:stable-alpine mit nginx.conf)
# und greift ihn mit curl an. Läuft in GitHub Actions (siehe .github/workflows/check.yml), braucht Docker.
# Aufruf im Repository: sh scripts/test-nginx.sh
set -u
PORT=18080
URL="http://127.0.0.1:$PORT"
FAILED=0
fail() { echo "::error::$1"; FAILED=1; }
ok() { echo "ok  $1"; }

# Tiefenverteidigung: ein eingeschmuggelter Symlink in icons/ darf nichts aus dem Repository ausliefern
ln -sf ../.git/config icons/icon-symlink-test.png
PORT=$PORT docker compose up -d --quiet-pull >/dev/null 2>&1 || { echo "::error::docker compose up ging nicht"; docker compose logs; exit 1; }
trap 'docker compose down >/dev/null 2>&1; rm -f icons/icon-symlink-test.png' EXIT
i=0; until curl -fs "$URL/healthz" >/dev/null 2>&1; do i=$((i+1)); [ $i -gt 30 ] && { docker compose logs; fail "nginx startet nicht"; exit 1; }; sleep 1; done
ok "nginx läuft, /healthz antwortet"

status() { curl -s -o /dev/null -w '%{http_code}' --path-as-is "$@"; }
expect() { got=$(status "$2" "$3"); [ "$got" = "$1" ] && ok "$1 für $3" || fail "Erwartet $1, bekommen $got für $3"; }

# Die Seite und ihre Dateien sind da
for p in / /index.html /sw.js /manifest.webmanifest /icons/icon-192.png; do expect 200 -X"GET" "$URL$p"; done

# Alles andere aus dem Repository ist nicht erreichbar – auch mit Tricks im Pfad
for p in /src/entdeckerheft.html /scripts/build.mjs /nginx.conf /docker-compose.yml /CHANGELOG.md /README.md \
         /.git/config /.git/HEAD /icons/../.git/config /icons/..%2f.git/config /%2e%2e/etc/passwd /fonts/ /icons/ \
         /index.html.bak /.env /sw.js/ /index.html%00.txt; do
  got=$(status -X GET "$URL$p"); case "$got" in 400|403|404) ok "$got für $p";; *) fail "Erreichbar ($got): $p";; esac
done

# Symlinks werden nicht befolgt, und unter /icons/ gibt es nur icon-…png
got=$(status "$URL/icons/icon-symlink-test.png"); case "$got" in 403|404) ok "$got für Symlink in icons/";; *) fail "Symlink in icons/ wird ausgeliefert ($got)";; esac
for p in /icons/README /icons/icon-192.png.bak /icons/x.svg; do got=$(status "$URL$p"); case "$got" in 404) ok "404 für $p";; *) fail "$p gibt $got";; esac; done

# Nur GET und HEAD
for m in POST PUT DELETE OPTIONS PATCH TRACE; do got=$(status -X "$m" "$URL/"); case "$got" in 405) ok "405 für $m";; *) fail "Methode $m gibt $got";; esac; done

# Header der Startseite
H=$(curl -sI "$URL/")
has() { echo "$H" | grep -qi "^$1" && ok "Header $1" || fail "Header fehlt: $1"; }
has "content-security-policy: frame-ancestors 'none'"
has "x-frame-options: deny"
has "x-content-type-options: nosniff"
has "referrer-policy: same-origin"
has "permissions-policy: camera=()"
has "cross-origin-opener-policy: same-origin"
has "cross-origin-resource-policy: same-origin"
has "strict-transport-security: max-age="
has "cache-control: no-cache"
echo "$H" | grep -qi '^server: nginx/' && fail "Server-Header verrät die nginx-Version" || ok "keine Versionsnummer im Server-Header"

# Header gelten auch für Symbole und Fehlerseiten
I=$(curl -sI "$URL/icons/icon-192.png"); echo "$I" | grep -qi '^cache-control: public, max-age=86400' && ok "Symbole: lange Cache-Zeit" || fail "Symbole: Cache-Control falsch"
echo "$I" | grep -qi '^x-content-type-options: nosniff' && ok "Symbole: nosniff" || fail "Symbole: nosniff fehlt"
E=$(curl -s -D - "$URL/gibtsnicht")
echo "$E" | grep -qi '^x-frame-options: deny' && ok "404-Seite: Sicherheits-Header" || fail "404-Seite ohne Sicherheits-Header"
echo "$E" | grep -qi 'nginx/[0-9]' && fail "404-Seite verrät die nginx-Version" || ok "404-Seite ohne Versionsnummer"

# Content-Types
ct() { curl -s -o /dev/null -w '%{content_type}' "$URL$1"; }
case "$(ct /sw.js)" in *javascript*) ok "sw.js ist JavaScript";; *) fail "sw.js hat falschen Typ: $(ct /sw.js)";; esac
case "$(ct /manifest.webmanifest)" in application/manifest+json*) ok "Manifest-Typ";; *) fail "Manifest hat falschen Typ: $(ct /manifest.webmanifest)";; esac
case "$(ct /)" in text/html*) ok "Startseite ist HTML";; *) fail "Startseite hat falschen Typ";; esac

# Die CSP aus index.html kommt mit an
curl -s "$URL/" | grep -q 'http-equiv="Content-Security-Policy"' && ok "CSP-Meta in index.html" || fail "CSP-Meta fehlt in index.html"

[ $FAILED -eq 0 ] && echo "Alles in Ordnung: nginx liefert sicher aus." || { docker compose logs | tail -30; exit 1; }
