# Architettura

PWA client-only: React 19, TypeScript, Vite, Tailwind CSS 4, react-chessboard 5, chess.js 1.4 e IndexedDB tramite idb. Nessun backend, autenticazione, AI o caricamento del PDF.

## Moduli

- `src/content/unit.ts`: prima unità, spiegazioni rielaborate dal PDF, posizioni originali e diagramma verificato. Per aggiungere una lezione non occorre creare componenti React.
- `src/lessons/types.ts`: unione discriminata dei sei tipi di blocco. Ogni lezione e blocco hanno un ID stabile; la versione della lezione cambia quando cambiano i criteri di completamento.
- `src/engine/chess.ts`: validazione pura delle mosse, controlli su scacco e matto, promozione e destinazioni. Non dipende dalla UI o dal database.
- `src/components/ActivityBoard.tsx`: scacchiera, click/touch/drag, selezione della promozione e dimostrazione guidata.
- `src/components/LessonPlayer.tsx`: interpretazione dei blocchi, suggerimenti, verifica risposte, navigazione tra passaggi e completamento.
- `src/persistence/progress.ts`: schema versionato, aggiornamenti immutabili dei risultati e archivio IndexedDB.
- `src/navigation/routes.ts`: rotte hash, compatibili con hosting statico, cronologia browser e fallback offline.
- `src/App.tsx`: Home, Percorso, Ripasso, Completamento; coordinamento dello stato, installazione e stato della rete.
- `src/styles.css`: Tailwind e stile visuale responsive con supporto a movimento ridotto.

## Modello delle lezioni

`explanation` e `summary` richiedono conferma tramite Continua/Concludi. `guided_move` richiede di eseguire tutte le mosse della dimostrazione. `find_move` e `practice` richiedono la sequenza corretta. `multiple_choice` richiede la risposta corretta.

Ogni attività scacchistica dichiara FEN, orientamento, alternative UCI per ciascuna semimossa, suggerimenti progressivi e criterio finale (`sequence` o `checkmate`). Le mosse sono validate da chess.js su una copia della posizione. Una mossa illegale o fuori obiettivo non modifica la posizione mostrata. Non si applica automaticamente una risposta del computer: in una sequenza guidata ogni semimossa è mostrata dall'utente. Le sequenze interattive richiedono tutte le semimosse dichiarate.

## Persistenza

Database `chess-academy`, versione 1, store `state`, chiave `progress`:

- `schemaVersion`, `contentVersion`;
- `currentLesson`, `positions` per riprendere il blocco corrente;
- `completed`: versione completata per lezione;
- `results`: tentativi, errori, completamento e suggerimenti per `lessonId@version/blockId`;
- `review`: ID delle attività con errori.

Le scritture sono serializzate per evitare riordinamenti. Il contenuto attuale non ha attività multi-sessione lunghe: riprendendo un blocco scacchistico non completato, si riparte dal suo FEN iniziale, conservando tentativi ed errori. Le versioni di lezione isolano vecchi risultati incompatibili senza cancellarli. Una versione di schema non supportata produce un avviso e non viene sovrascritta al caricamento. Non sono ancora necessarie migrazioni da una versione precedente.

Il completamento richiede tutti i blocchi soddisfatti; una visita alla rotta Completamento non lo assegna. Le lezioni successive richiedono la versione corrente della precedente. Riprovare una lezione azzera solo i risultati correnti di quella lezione; gli altri progressi restano. Le attività restano nella coda di ripasso finché non vengono risolte senza errori in un nuovo tentativo. Il precedente completamento rimane registrato, quindi ripassare non blocca il percorso già sbloccato.

## Offline e aggiornamenti

vite-plugin-pwa genera manifest e service worker Workbox. HTML, JavaScript, CSS, icone e contenuti didattici sono locali e precachati; nessun font o immagine dipende da CDN. I PDF di `source/` non sono asset pubblici. Il PDF originale è stato rimosso dai branch e dalla loro cronologia e non viene copiato in `dist/`. Il service worker richiede HTTPS o localhost ed è attivo nella build di produzione, non nel server di sviluppo. Il primo caricamento deve avvenire online e completare la registrazione. I processi Vite non sopravvivono al riavvio dell'ambiente.

## Verifiche

Test unitari delle posizioni, delle alternative, della sicurezza del re, di arrocco, en passant, promozione/sottopromozione e del matto; test del gating di completamento e del versionamento. Test browser sulla build di produzione per touch, navigazione tra blocchi, errori, persistenza dopo refresh, larghezze 360/390/430 px, desktop e caricamento effettivo offline con service worker.

## Limiti intenzionali

Analizzati indice, introduzione e capitolo 1; le altre parti non sono importate. I sei movimenti sono introdotti, ma non ciascuno con una lezione dedicata. Arrocco, en passant e promozione sono supportati dal motore e coperti dai test, ma non sono ancora insegnati nella prima unità. Non ci sono ripetizione spaziata, importazione massiva, ricerca globale, sincronizzazione, motore di analisi o pannello autore. La navigazione è centralizzata in App; un router esterno e il caricamento differito delle unità si potranno introdurre quando la quantità di contenuti lo richiederà.
