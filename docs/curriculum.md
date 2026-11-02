# Curriculum iniziale — Sprint 1

## Fonte e perimetro

Analizzati `source/How to Win at Chess.pdf`, Levy Rozman, edizione digitale con copyright 2023, 591 pagine PDF: indice (pp. 6–9), introduzione (pp. 11–36), presentazione della Parte 1 (p. 38) e capitolo 1 (pp. 40–50). I numeri qui indicati sono **pagine del PDF, contando da 1**, non numeri di pagina dell'edizione cartacea: nelle pagine esaminate non compare una numerazione stampata affidabile da riportare. I link «this page» del testo estratto non sono stati usati come riferimenti.

L'indice distingue un'introduzione a regole, notazione e pratica; la Parte 1 comprende capitoli 1–8, dai modi di concludere una partita alle aperture, finali, tattica e strategia di base; la Parte 2 comprende capitoli 9–15, con aperture, gambetti, finali, tattica e strategia intermedi. La p. 38 raccomanda la Parte 1 ai giocatori 0–800 Elo e a chi vuole ripassare. Lo sprint usa soltanto introduzione e capitolo 1: non importa il resto del libro.

Testi rielaborati e sintetizzati in italiano, senza trascrizioni estese. Il PDF resta materiale locale di riferimento e non è distribuito con l'app.

## Mappa degli argomenti iniziali

| Nucleo                                           | Pagine PDF    | Scelta didattica                                                                      |
| ------------------------------------------------ | ------------- | ------------------------------------------------------------------------------------- |
| Accessibilità e apprendimento progressivo        | 11; 40–41     | Pochi concetti per schermata, esempi con pochi pezzi prima del matto                  |
| Scacchiera, coordinate, disposizione e turno     | 12–14         | Prima lezione; coordinate visibili sulla scacchiera                                   |
| Donna, torre, alfiere, cavallo                   | 14–18         | Seconda lezione; due attività di movimento                                            |
| Pedoni: avanzamento e cattura                    | 19–22         | Avanzamento nella prima lezione; catture in diagonale introdotte nel riepilogo        |
| Promozione, en passant                           | 23–26         | Supporto tecnico nel motore; approfondimento interattivo rimandato                    |
| Re, sicurezza, arrocco                           | 26–30         | Sicurezza nella terza lezione; arrocco supportato ma non ancora insegnato             |
| Scacco, matto e stallo                           | 31; 40–45; 50 | Terza e quarta lezione; dimostrazione e soluzione autonoma                            |
| Notazione algebrica                              | 31–35         | Coordinate, simbolo # e notazione italiana nei commenti; notazione avanzata rimandata |
| Punteggio, Elo, pratica e analisi                | 35–36         | Contesto per il curriculum futuro; nessun rating simulato o motore AI                 |
| Resa, tempo, materiale insufficiente e abbandono | 45–50         | Breve introduzione e domanda nella quarta lezione; nessun orologio implementato       |

Non tutte le regole dell'introduzione sono già esercitate: l'unità è un primo percorso sui fondamenti e sul matto, non un corso esaustivo.

## Prima unità realizzata

| Lezione                  | Durata stimata | Obiettivo verificabile                                                                | Interazioni                                                                                                  | Riferimenti                                     |
| ------------------------ | -------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| Il tuo primo passo       | 3 min          | Orientarsi con le coordinate e muovere un pedone di due case dalla posizione iniziale | Spiegazione; dimostrazione e4/e5; esercizio d4; domanda sulla colonna; riepilogo                             | Introduzione, PDF pp. 12–14, 19–22, 31–34       |
| Ogni pezzo ha una strada | 4 min          | Distinguere le traiettorie e applicare cavallo e torre                                | Spiegazione dei sei pezzi; Cf3; torre a7; verifica sul salto; riepilogo                                      | Introduzione, PDF pp. 14–18, 26–27              |
| Il re chiede aiuto       | 4 min          | Riconoscere e risolvere uno scacco con una fuga legale                                | Spiegazione; dimostrazione Rd1; esercizio con quattro alternative valide; domanda sulla sicurezza; riepilogo | Introduzione, PDF pp. 27, 31; capitolo 1, p. 50 |
| La mossa che chiude      | 5 min          | Identificare il matto e distinguerlo dallo stallo; riconoscere la vittoria per resa   | Diagramma verificato; Dg7# guidata; matto da trovare; due domande; riepilogo                                 | Introduzione, PDF p. 31; capitolo 1, pp. 40–50  |

Le durate sono stime, da verificare con utenti. Le lezioni sono ora tutte accessibili liberamente. Anche i blocchi interni si possono saltare o scegliere dal selettore: solo le attività svolte correttamente vengono completate. Visitare le schermate non completa gli esercizi.

## Provenienza delle posizioni

| Posizione                                                                       | Provenienza                                                                    | Verifica                                                                                                                                                                                           |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Disposizione iniziale standard e sequenza e4/e5                                 | Esercizio originale basato sulle regole; non attribuito a un diagramma del PDF | Posizione iniziale e mosse legali con chess.js                                                                                                                                                     |
| Torre: `7k/8/8/8/8/8/8/R3K3 w - - 0 1`                                          | Originale                                                                      | a1–a7 legale                                                                                                                                                                                       |
| Scacco: `k3r3/8/8/8/8/8/8/4K3 w - - 0 1`                                        | Originale                                                                      | Fughe e1–d1/d2/f1/f2 legali; e1–e2 illegale                                                                                                                                                        |
| Matto con Re bianco e6, donna e7, Re nero e8: `4k3/4Q3/4K3/8/8/8/8/8 b - - 0 1` | **Diagramma del PDF p. 41, verificato visivamente**                            | Ricostruite le case leggendo coordinate e pezzi nell'immagine. Turno al Nero inferito dal matto; diritti d'arrocco, en passant e contatori impostati convenzionalmente. chess.js conferma il matto |
| Esercizio: `7k/8/5KQ1/8/8/8/8/8 w - - 0 1` → g6–g7#                             | **Originale**, ispirato al concetto di donna protetta dal re                   | Non è il diagramma p. 41: case differenti, etichetta originale nell'app. chess.js conferma g7#                                                                                                     |

Non sono state ricostruite le posizioni dei matti con più pezzi, del matto del barbiere, del matto dell'imbecille o delle partite storiche (pp. 42–49): non sono necessarie per questo incremento. Nessuna posizione non verificata viene attribuita al PDF.

## Passi successivi, fuori dallo sprint

Microlezioni dedicate a catture e protezione, movimento di donna e alfiere, promozione, arrocco ed en passant (introduzione pp. 14–30); notazione con catture e disambiguazione (pp. 32–35). Solo successivamente, nuove unità sui capitoli successivi della Parte 1. Conservare ID stabili e incrementare la versione di lezione se cambiano attività o criteri di completamento.


## Catalogo attuale: 60 lezioni consultabili liberamente

Le quattro lezioni iniziali conservano ID, versioni e progressi. Le 56 aggiunte sono testi ed esercizi originali sui principi generali degli scacchi, senza importazioni dal libro. Il percorso si rivolge indicativamente a chi studia dai fondamenti fino ai temi utili nella fascia 0–1300 Elo; non assegna né garantisce un rating. Ogni nuova lezione include spiegazione, dimostrazione, esercizio, domanda con feedback e riepilogo.

| Unità | Lezioni |
| --- | --- |
| Le fondamenta | Le quattro lezioni iniziali sopra descritte |
| Le regole in pratica | Diagonali e linee libere; Catturare e proteggere; Il re trova casa; Una cattura al passaggio; Un pedone cambia ruolo; Leggere una partita |
| Vedere la tattica | Due bersagli in una mossa; Un pezzo inchiodato; Prima il re, poi la torre; Aprire una linea nascosta; L’ultima traversa è fragile |
| Aperture e piani | Cominciare dal centro; Portare i pezzi in partita; Scegliere un’apertura; Migliorare la posizione |
| Giocare i finali | Anche il re entra in gioco; Un passo che conta; La corsa del pedone; Chiudere con re e donna; Chiudere con re e torre |

Le nuove attività sui matti mostrano posizioni conclusive: non sono allenamenti completi di conversione contro una difesa automatica. Le aperture introducono piani e prime mosse, non un repertorio esaustivo. I tempi sono stime di lettura e pratica. Tutto il catalogo è incluso nella cache offline; lo schema IndexedDB resta invariato.


### Copertura dei temi delle due parti

L’indice del materiale di riferimento è stato usato soltanto come lista di argomenti generali. Le nuove spiegazioni e le posizioni sono originali: non sono la trascrizione, la traduzione o la ricostruzione degli esempi e delle partite del libro. Il corso copre i nuclei tematici dell’indice, non ogni pagina o variante del PDF.

| Perimetro di studio | Lezioni o unità |
| --- | --- |
| Regole, notazione, punteggio, pratica | Fondamenta; Regole in pratica; Giocare, misurare, imparare |
| Modi di vincere, scacco e sicurezza, resa, tempo | Il re chiede aiuto; La mossa che chiude; Giocare, misurare, imparare |
| Aperture del Bianco: e4, d4, principi e matto rapido | Un piano dopo 1.e4; Costruire dopo 1.d4; Tre mosse da verificare |
| Aperture del Nero: risposte classiche, sistemi e costruzione | Rispondere con il Nero; Una struttura, molte risposte |
| Matti di base e cooperazione dei pezzi | Due torri fanno una scala; Chiudere con re e donna; Chiudere con re e torre; L’ultima traversa è fragile |
| Patte per accordo, ripetizione, stallo, regola delle mosse e materiale | Quando nessuno vince |
| Visione, attacco, difesa, cattura e tattiche iniziali | Vedere prima di muovere; Catturare e proteggere; Vedere la tattica |
| Strategia iniziale: debolezze, spazio, posizioni aperte e chiuse | Un bersaglio da fissare; Spazio da usare; Quando si aprono le linee |
| Apprendere aperture e repertorio con entrambi i colori | Scegliere un’apertura; Un repertorio da capire |
| Londra, Viennese e Alapin | Un centro per il sistema di Londra; Sviluppare con la Viennese; Preparare d4 contro la Siciliana |
| Scandinava, Caro-Kann, gambetto di donna rifiutato e sistemi | Sfidare e4 subito; Una spinta preparata; Sostenere il centro nero; Una struttura, molte risposte |
| Gambetti con entrambi i colori | Offrire per guadagnare tempi; L’iniziativa con il Nero |
| Finali di re e pedoni, cavalli, alfieri contro cavalli, alfieri, torri, donne | Finali da valutare; Un passo che conta; La corsa del pedone |
| Ricerca di candidate, calcolo, matto in una linea di tre mosse e materiale | Una ricerca ordinata; Tre mosse da verificare; Calcolare uno scambio |
| Rimozione del difensore, intermedia, scoperta, sacrificio, deviazione e attrazione | Togliere una difesa; Prima una mossa intermedia; Aprire una linea nascosta; Attirare e deviare |
| Pedoni, pezzi leggeri, torri, donna, scambi e routine decisionale | Scegliere un piano |

Tutte le 60 lezioni sono raggiungibili dal percorso e dai link diretti senza completamenti precedenti. Il selettore interno non assegna risultati: gli esercizi saltati restano incompleti. Le attività svolte e lo storico dei completamenti preesistenti sono conservati; aprire una lezione già completata non azzera i risultati. Il reset resta un’azione esplicita nel ripasso.
