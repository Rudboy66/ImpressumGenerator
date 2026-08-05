# Imprintly

Interaktive Demo eines Impressum-Generators. Die Anwendung liest normale
Inhaltsseiten einer angegebenen Domain, ignoriert bestehende Rechtstexte und
FAQ-Seiten, lässt den Nutzer die erkannte Einordnung bestätigen und zeigt
anschließend nur die dafür relevanten Fragen.

## Funktionsweise

1. Der Nutzer gibt eine öffentliche Website ein.
2. Der Server wertet Sitemap und interne Navigation aus und besucht bis zu 18
   relevante Seiten derselben Domain.
3. Rechtstexte, Datenschutz, AGB, Cookies und FAQ werden ausgelassen.
4. Eine erste KI-Prüfung erstellt ein Website-Dossier zu Angebot, Nutzerweg,
   Zielgruppe, Geschäftsmodell und impressumsrelevanten Branchenmerkmalen.
5. Eine zweite, skeptische KI-Prüfung bewertet jede Frage des Katalogs mit
   Evidenz und Konfidenz als erkannt, zu bestätigen, offen oder nicht relevant.
6. Der Nutzer bestätigt oder korrigiert das Website-Dossier.
7. Sicher erkannte Angaben werden übernommen, plausible Angaben vorgefüllt und
   nur unbekannte Angaben offen abgefragt.
8. Aus den Antworten entsteht ein kopierbarer Impressumsentwurf.

Der Crawler blockiert lokale und private Netzwerkadressen, begrenzt Laufzeit,
Seitenzahl und Textmenge und folgt nur Links innerhalb derselben Domain.

## Lokaler Start

```bash
npm install
npm run dev
```

## OpenAI-Konfiguration

Die KI-Analyse ist verpflichtend. Auf Vercel verwendet die Anwendung automatisch
AI Gateway mit OIDC. Alternativ kann sie OpenAI direkt mit `OPENAI_API_KEY`
aufrufen. Eine stumpfe regelbasierte Einordnung wird nicht mehr als Ergebnis an
den Nutzer ausgegeben.

1. `.env.example` als `.env.local` kopieren.
2. Einen eigenen, neuen API-Schlüssel als `OPENAI_API_KEY` eintragen.
3. In Vercel dieselbe Variable ausschließlich als Secret hinterlegen. Alternativ
   kann dort `AI_GATEWAY_API_KEY` verwendet werden; Vercel-Deployments können
   auch automatisch per OIDC authentifizieren.

API-Schlüssel dürfen weder mit `NEXT_PUBLIC_` beginnen noch in Git committed
werden. Das optionale `OPENAI_MODEL` überschreibt das Standardmodell.

## Builds

```bash
# Vercel-kompatibler Next.js-Build
npx next build

# OpenAI Sites / vinext
npm run build
```
