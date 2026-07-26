# Imprintly

Interaktive Demo eines Impressum-Generators. Die Anwendung liest normale
Inhaltsseiten einer angegebenen Domain, ignoriert bestehende Rechtstexte und
FAQ-Seiten, lässt den Nutzer die erkannte Einordnung bestätigen und zeigt
anschließend nur die dafür relevanten Fragen.

## Funktionsweise

1. Der Nutzer gibt eine öffentliche Website ein.
2. Der Server besucht bis zu zwölf relevante Seiten derselben Domain.
3. Rechtstexte, Datenschutz, AGB, Cookies und FAQ werden ausgelassen.
4. Eine semantische oder regelbasierte Analyse beschreibt Angebot, Zielgruppe
   und Seitentyp.
5. Der Nutzer bestätigt oder korrigiert diese Einordnung.
6. Der Fragenkatalog blendet nur die erkannten Pflichtmodule ein.
7. Aus den Antworten entsteht ein kopierbarer Impressumsentwurf.

Der Crawler blockiert lokale und private Netzwerkadressen, begrenzt Laufzeit,
Seitenzahl und Textmenge und folgt nur Links innerhalb derselben Domain.

## Lokaler Start

```bash
npm install
npm run dev
```

## OpenAI-Konfiguration

Für die semantische Website-Einordnung wird serverseitig `OPENAI_API_KEY`
verwendet. Ohne Schlüssel bleibt eine regelbasierte Einordnung aktiv.

1. `.env.example` als `.env.local` kopieren.
2. Einen eigenen, neuen API-Schlüssel als `OPENAI_API_KEY` eintragen.
3. In Vercel dieselbe Variable ausschließlich als Secret hinterlegen.

API-Schlüssel dürfen weder mit `NEXT_PUBLIC_` beginnen noch in Git committed
werden. Das optionale `OPENAI_MODEL` überschreibt das Standardmodell.

## Builds

```bash
# Vercel-kompatibler Next.js-Build
npx next build

# OpenAI Sites / vinext
npm run build
```
