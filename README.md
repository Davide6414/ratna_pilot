# RATNA — landing

Landing page di RATNA: una griglia a tutto schermo con il logo al centro e una lettera
dell'alfabeto geometrico RATNA in ogni cella.

- **Online:** https://davide6414.github.io/ratna_pilot/
- **Alfabeto completo:** https://davide6414.github.io/ratna_pilot/alphabet/

## Cosa fa la pagina

- **Logo:** al centro della griglia (la N sta sempre sulla cella centrale). Le lettere sono
  blocchi estrusi in 3D: col mouse si vedono i lati, su touch ruotano lentamente da sole.
- **Celle:** lettere bianche che girano come un tabellone _split-flap_.
- **Hover / tap:** la cella gira su una lettera blu che poi torna bianca.
- **Tastiera:** scrivendo, il testo compare sotto il logo e scorre quando finisce la riga
  (`Backspace` cancella, `Esc` svuota).
- **Responsive:** la dimensione delle celle si adatta allo schermo (circa 5 colonne su
  telefono). Con _riduci movimento_ attivo le animazioni sono disattivate.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router) + React 19 + TypeScript
- CSS Modules e variabili CSS, senza librerie UI
- 3D leggero solo in CSS (nessun WebGL): `perspective`, `rotateX` e livelli SVG sovrapposti

## Sviluppo

Serve Node 22 (vedi `.nvmrc`).

```bash
npm install
npm run dev        # http://localhost:3000
npm run check      # lint + typecheck + formattazione
npm run build      # export statico in ./out
npm run preview    # serve ./out in locale
```

## Struttura

```
src/
  app/                    route (App Router): layout, home, /alphabet, 404, favicon
  components/
    LetterGrid/           la griglia: tile split-flap, logo estruso, interazioni
    Glyph/                rendering SVG di una lettera (anche versione estrusa)
    Specimen/             righe statiche di lettere (pagina alfabeto, 404)
    SiteFooter/
  config/site.ts          testi e metadati del sito (da modificare qui)
  lib/glyphs/             geometria dell'alfabeto e del logo (celle 100 × 100)
```

- **Testi:** si modificano tutti in `src/config/site.ts`.
- **Lettere:** in `src/lib/glyphs/alphabet.ts`, una path SVG per lettera su una cella 100 × 100.
- **Colori:** sono token in `src/app/globals.css`, campionati dal file del logo.

## Deploy

Ogni push su `main` esegue `.github/workflows/deploy.yml`: controlli, build statica e
pubblicazione su GitHub Pages. Sulle pull request gira solo la build di verifica.

Configurazione da fare una sola volta: **Settings → Pages → Build and deployment → Source:
GitHub Actions**.

Il workflow passa il base path (`/ratna_pilot`) e l'URL del sito tramite `PAGES_BASE_PATH` e
`SITE_URL`. Con un dominio personalizzato il base path diventa vuoto da solo.

## Passare a un server

Il progetto è un normale progetto Next.js, solo esportato in statico. Per aggiungere un
backend (API, SSR, form, auth):

1. Fai la build con `NEXT_OUTPUT=standalone`, oppure togli `output` da `next.config.ts`.
2. Aggiungi Route Handlers, Server Actions o pagine dinamiche dove servono.
3. Pubblica su un hosting Node (Vercel, Docker, ecc.) invece che su GitHub Pages.

Componenti e stili non cambiano. `src/config/site.ts` è il punto da sostituire con dati
presi da un CMS o da un'API.
