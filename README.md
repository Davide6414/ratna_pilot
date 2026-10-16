# RATNA — landing

Landing page di RATNA: una griglia a tutto schermo, bianca, con il logo al centro.

- **Online:** https://davide6414.github.io/ratna_pilot/

## Cosa fa la pagina

- **Griglia:** riempie lo schermo. Le celle sono vuote e bianche, il logo occupa le celle
  centrali (la N sta sempre sulla cella centrale).
- **Logo:** piatto, come nel file originale. All'apertura le lettere entrano girando una
  dopo l'altra.
- **Hover:** passando col mouse su una cella vuota, la cella si gira e diventa azzurra; quando
  il mouse esce torna bianca. Ogni cella completa sempre il giro, così muovendo il mouse resta
  una scia. Le celle tagliate dal bordo dello schermo restano ferme. Disattivato su touch.
- **Responsive:** la dimensione delle celle si adatta allo schermo (circa 5 colonne su
  telefono). Con _riduci movimento_ attivo le animazioni sono disattivate.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router) + React 19 + TypeScript
- CSS Modules e variabili CSS, senza librerie UI
- Animazioni solo in CSS, nessuna libreria

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
  app/                    route (App Router): layout, home, 404, favicon
  components/
    LogoGrid/             la griglia a tutto schermo con il logo
    Glyph/                rendering SVG di una lettera
    Specimen/             riga statica di lettere (pagina 404)
  config/site.ts          testi e metadati del sito (da modificare qui)
  lib/glyphs/             geometria del logo e dell'alfabeto (celle 100 × 100)
```

- **Testi:** si modificano tutti in `src/config/site.ts`.
- **Logo:** in `src/lib/glyphs/logo.ts`, una path SVG per lettera su una cella 100 × 100.
- **Colori:** sono token in `src/app/globals.css` (blu e linee campionati dal file del logo).

## Deploy

Ogni push su `main` esegue `.github/workflows/deploy.yml`: controlli, build statica e
pubblicazione su GitHub Pages. Sulle pull request gira solo la build di verifica.

Configurazione da fare una sola volta: **Settings → Pages → Build and deployment → Source:
GitHub Actions**. Con "Deploy from a branch" GitHub pubblicherebbe anche il README a ogni
push (il workflow lo segnala con un avviso).

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
