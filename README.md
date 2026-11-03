# Chess Academy — Lettore personale

Prototipo Sprint 2: PDF privati sul dispositivo e scacchiere locali collegate alle pagine. React, TypeScript, Vite, PDF.js, chess.js, react-chessboard e IndexedDB. Nessun backend o analytics.

## Provare il lettore

```sh
npm ci
npm run dev
```

Aprire `/chess-academy/`, importare un PDF (massimo 64 MB), continuare dalla libreria. Il PDF è elaborato nel browser; non è incluso nella repository né negli artefatti. Non servono file in `source/`.

La pagina originale mantiene il layout e un livello di testo selezionabile, quando presente nel PDF. La modalità adattiva è una vista sperimentale delle righe estratte: non traduce né sintetizza e non ricostruisce in modo affidabile tutti i paragrafi, le colonne o i diagrammi. Il PDF originale resta sempre disponibile.

L’indice usa i segnalibri strutturali del PDF; se assenti si naviga per numero di pagina o segnalibri personali. I numeri sono pagine PDF, non numerazione tipografica.

## Scacchiere

Espandere “Aggiungi una scacchiera a questa pagina”, inserire FEN e mosse SAN inglesi o UCI separate da spazi. Provenienza e verifica sono distinte: le annotazioni personali restano “da verificare”, anche se le mosse sono legali. Si può esplorare liberamente, tornare indietro e ripristinare la linea annotata. Una posizione di matto non ha mosse legali da esplorare.

Per l’edizione di riferimento identificata dall’impronta SHA-256 in `src/annotations/model.ts` vengono predisposte tre ricostruzioni confrontate visivamente: pagine PDF 14, 41 e 42. Non vengono assegnate ad altri file o edizioni. Sono diagrammi statici, senza mosse inventate attribuite all’autore. Nessun testo o immagine del libro è distribuito.

## Dati e privacy

Il database `chess-academy` passa da versione 1 a 2 senza modificare lo store `state` dei vecchi progressi. Documenti e metadati sono separati: la libreria non carica tutti i file in RAM. Posizione, segnalibri, tema e annotazioni restano in IndexedDB. Rimuovere un documento elimina anche file, copertina, posizione, segnalibri e annotazioni associate. Il tema globale e lo storico delle microlezioni restano conservati.

In caso di quota insufficiente o errore di scrittura il PDF si apre soltanto in memoria, con un messaggio esplicito; dopo la chiusura va selezionato di nuovo. Il browser può rimuovere dati non persistenti: conservare sempre il proprio PDF. Il pulsante di conservazione locale chiede al browser `storage.persist()` senza garantirne l’approvazione. Se l’aggiornamento del database è bloccato, chiudere le vecchie schede senza cancellare i dati.

## Struttura

- `documents/`: importazione, impronta, limite file, PDF.js e worker locale.
- `reader/`: rendering, navigazione, indice, posizione e modalità di lettura.
- `extraction/`: estrazione conservativa delle righe e dell’indice incorporato.
- `chess/`: esploratore che riutilizza chess.js e react-chessboard; `engine/` conserva i validatori esistenti.
- `annotations/`: schema indipendente dal testo, editor e ricostruzioni verificate.
- `storage/`: migrazione e archivio locale.

Il vecchio catalogo e il modello dei progressi sono conservati come codice non collegato alla UI, per non perdere dati e possibilità di migrazione. Non esiste una seconda esperienza di microlezioni nella navigazione o nel bundle del lettore.

## Verifiche e GitHub Pages

```sh
npm test
npm run build
npx playwright install --with-deps chromium
npm run test:e2e
```

Il workflow esistente verifica le PR e pubblica solo i push su `main`. Base path `/chess-academy/`, worker PDF.js, font, CMap e codec sono locali e precachati. Gli artefatti ammettono solo app, icone e supporti PDF.js; nessun PDF importato entra in `dist/`. Offline disponibile dopo il completamento del primo caricamento e con documenti salvati localmente.

La PR non viene unita automaticamente. Per provare su GitHub Pages: unire manualmente dopo revisione, attendere il workflow, aprire https://camilloaddis.github.io/chess-academy/ e importare il proprio PDF. Chiudere le schede della versione precedente e riaprire online se la PWA mostra ancora le microlezioni. Non cancellare lo storage.

Limiti e prossimo incremento: [Sprint 2](docs/sprint-2.md).
