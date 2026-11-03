# Sprint 2 — Prototipo verificabile

## Funziona

Import locale (PDF fino a 64 MB), controllo dell’impronta e duplicati, anteprima, libreria, pagina fedele con testo selezionabile, indice incorporato e segnalibri personali, ripresa dal numero di pagina dopo refresh, tema chiaro/scuro, annotazioni per documento e pagina, FEN e linee SAN/UCI, esplorazione libera con promozione, ripristino della linea. Il PDF non viene caricato verso nessun servizio. Rendering di una pagina alla volta, pixel ratio limitato a 2 e altezza render limitata per evitare canvas smisurati; non è un limite assoluto alla memoria interna del parser PDF.js.

Due test browser con un PDF sintetico originale verificano importazione, indice, annotazioni, mosse, refresh, ripresa offline, cancellazione, input invalido e migrazione del vecchio store. Il test registra le richieste e non ammette servizi esterni o POST. Due test unitari verificano le linee e le tre ricostruzioni. È stata inoltre provata localmente l’importazione del PDF di riferimento e l’apertura delle annotazioni alle pagine 14/41/42; il file e le immagini di verifica restano fuori dal repository.

## Sperimentale e limiti

La modalità adattiva preserva le stringhe di testo nell’ordine restituito da PDF.js e separa righe secondo la geometria. Non deduce con certezza paragrafi, gerarchie di titoli, sillabazioni, colonne o figure. Segnala un ordine geometrico sospetto o testo molto scarso, ma non certifica la correttezza delle altre pagine. PDF scansiti senza livello testuale richiedono il rendering originale: nessun OCR. Font adattivo regolabile per la sessione; solo il tema è persistito tra sessioni.

I PDF protetti da password vengono rifiutati con un messaggio, non è ancora presente un dialogo password. Non sono riprodotti moduli XFA, audio, script o azioni del PDF. Il testo è selezionabile solo se un livello testuale esiste; l’estrazione non corregge il contenuto.

Gli ancoraggi sono a livello di pagina, con sezione descrittiva facoltativa: le scacchiere compaiono dopo la pagina. Non esistono ancora coordinate di paragrafo o riconoscimento immagine→FEN. Le annotazioni predefinite si applicano esclusivamente al file con l’impronta verificata: altre edizioni richiedono associazioni personali. Turno e campi non visibili del FEN sono dichiarati come ricostruiti nel contesto. Le sequenze degli utenti sono validate da chess.js ma non automaticamente confrontate con il libro.

L’archivio è legato a origine e browser, non sincronizzato né cifrato separatamente dal profilo browser. La richiesta di persistenza e la quota sono controllate quando l’API è disponibile; gli errori di scrittura producono una lettura in memoria o un avviso per posizione/annotazione non salvata. Il limite per file non garantisce che ogni PDF complesso possa essere elaborato su ogni telefono. Il bundle PDF.js e i supporti offline richiedono circa 5,5 MB; il primo caricamento deve terminare online. La UI non ha ancora un indicatore di installazione offline completata.

## Sprint successivo

1. Validazione editoriale pagina per pagina del reflow, con paragrafi e titoli solo dove l’ordine è affidabile; conservare sempre il PDF fedele.
2. Ancoraggi geometrici e pannello contestuale, editor per modificare/verificare annotazioni, import/export di annotazioni senza testo del libro.
3. Ripresa più precisa del punto di lettura (offset nella pagina), zoom PDF e navigazione cronologica del browser più completa.
4. Gestione password, cancellazione import/render, ulteriori prove su Safari/iOS e su PDF molto grandi o scansiti; report quota e recupero da eviction più dettagliati.
5. Messaggio di aggiornamento PWA e cache pronta; backup locale delle preferenze e annotazioni e percorso esplicito di archiviazione dei vecchi progressi.
