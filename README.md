# Chess Academy

Una PWA mobile-first in italiano per imparare gli scacchi con piccole lezioni interattive. Quattro microlezioni: scacchiera, movimento dei pezzi, scacco, scacco matto e stallo.

Concetti rielaborati dall’introduzione e dal capitolo 1 di _How to Win at Chess_ di Levy Rozman, con riferimenti alle pagine PDF nel [curriculum](docs/curriculum.md). Gli esercizi sono originali; un diagramma di matto è ricostruito e verificato sulla pagina PDF 41. Il PDF resta nel repository come materiale di studio e non viene incluso nella PWA.

## Avvio

Richiede Node.js 22.12+ (verificato con 24.19) e npm.

```sh
npm ci
npm run dev
```

Per verificare la PWA, usare la build di produzione:

```sh
npm run build
npm run preview
```

Aprire l'indirizzo mostrato da Vite. In produzione servire `dist/` tramite HTTPS. Il service worker non è abilitato in sviluppo. Dopo il primo caricamento della build e la registrazione del service worker, lezioni e progressi sono disponibili offline. L'installazione si effettua dal browser; il pulsante nell'app appare se il browser offre l'evento di installazione (su iOS: Condividi → Aggiungi alla schermata Home).

## Verifiche

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Su una macchina Linux senza librerie browser, installare i prerequisiti supportati da Playwright (`npx playwright install --with-deps chromium`, con permessi adeguati). Se Chromium è già installato nel sistema, si può usare `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e` senza scaricare un altro browser. I test browser avviano autonomamente l'anteprima di produzione sulla porta 4173: effettuare la build prima e lasciare libera tale porta.

## Funzionalità

- Home con ripresa, progresso e accesso al ripasso; percorso sequenziale, riepilogo e lista degli errori.
- Sei tipi di blocco basati su dati, feedback immediato, suggerimenti e scacchiera con touch/click/drag.
- Mosse legali validate con chess.js; errori didattici senza alterare l'esercizio; promozione a scelta, arrocco ed en passant supportati dal motore.
- Risultati, errori, tentativi, suggerimenti e blocco corrente salvati in IndexedDB con schema e versioni delle lezioni.
- Manifest, icone locali e service worker; nessun account o servizio remoto.

## Contenuti e documentazione

- [Architettura e limiti](docs/architecture.md)
- [Curriculum provvisorio e provenienza delle posizioni](docs/curriculum.md)
- `src/content/unit.ts`: contenuti strutturati della prima unità.
- `source/`: directory riservata al materiale di studio locale. Il PDF fornito è tracciato nel repository e non viene copiato in `dist/`.

I progressi restano nel browser usato: cancellare i dati del sito li elimina. Non sono presenti sincronizzazione, esportazione, AI, Stockfish, funzionalità social o unità successive. Le durate delle lezioni sono stime. La verifica su dispositivi fisici e l'installazione dal menu nativo del browser richiedono una prova dedicata; l'emulazione mobile non sostituisce questi controlli.

## GitHub Pages

Configurazione, verifiche e impostazioni manuali: [guida alla pubblicazione](docs/github-pages.md).
