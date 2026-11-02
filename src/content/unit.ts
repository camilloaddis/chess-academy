import { additionalLessons } from "./course";
import type { Lesson, MoveActivity } from "../lessons/types";
const activity = (
  fen: string,
  moves: string[][],
  hints: string[],
  extra: Partial<MoveActivity> = {},
): MoveActivity => ({
  fen,
  moves,
  hints,
  orientation: "white",
  completion: "sequence",
  ...extra,
});
const start = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const mate = "7k/8/5KQ1/8/8/8/8/8 w - - 0 1";
export const lessons: Lesson[] = [
  {
    id: "board",
    version: 1,
    title: "Il tuo primo passo",
    subtitle: "La scacchiera, i pezzi e il turno",
    minutes: 3,
    icon: "♙",
    kind: "Esplora",
    source:
      "Introduzione, PDF pp. 12–14, 19–22, 31–34. Testi rielaborati in italiano.",
    concepts: [
      "La scacchiera ha 64 case, con una casa chiara in basso a destra.",
      "Il Bianco muove per primo. Colonne a–h, traverse 1–8.",
      "Il pedone avanza, ma cattura in diagonale.",
    ],
    blocks: [
      {
        id: "board-welcome",
        type: "explanation",
        title: "64 case. Infinite possibilità.",
        text: "La scacchiera ha 64 case: tieni una casa chiara in basso a destra. Le colonne si chiamano a–h, le traverse 1–8: e4 è una casa precisa. Due eserciti, un obiettivo: mettere il re avversario sotto attacco senza lasciargli una via di salvezza. Si chiama scacco matto. Cominciamo con una sola mossa.",
      },
      {
        id: "board-demo",
        type: "guided_move",
        title: "Apriamo il centro",
        text: "Il Bianco comincia. Guarda il pedone da e2 a e4, poi la risposta del Nero.",
        activity: activity(
          start,
          [["e2e4"], ["e7e5"]],
          ["Segui il pedone sulla colonna e."],
          {
            comments: [
              "e4: dalla casa iniziale un pedone può avanzare di due case, se entrambe sono libere.",
              "e5: ora il Nero ha risposto. Il turno torna al Bianco.",
            ],
          },
        ),
      },
      {
        id: "board-pawn",
        type: "find_move",
        title: "Ora tocca a te",
        text: "Porta il pedone bianco da d2 a d4. Tocca il pezzo e poi la casa di arrivo, oppure trascinalo.",
        activity: activity(
          start,
          [["d2d4"]],
          [
            "Cerca la colonna d, subito a sinistra del re.",
            "Tocca d2, poi d4.",
          ],
        ),
        feedback:
          "Bene! Il pedone occupa il centro e libera una diagonale per l’alfiere.",
      },
      {
        id: "board-quiz",
        type: "multiple_choice",
        title: "Una coordinata, una casa",
        text: "Nella coordinata e4, che cosa indica la lettera e?",
        choices: ["La colonna", "La traversa", "Il colore del pezzo"],
        answer: 0,
        hints: ["Le lettere scorrono da sinistra a destra."],
        feedback: "Esatto: lettera per la colonna, numero per la traversa.",
      },
      {
        id: "board-summary",
        type: "summary",
        title: "Hai fatto la prima mossa",
        text: "Sai orientarti, riconoscere una casa e muovere un pedone. Piccoli passi, solide fondamenta.",
      },
    ],
  },
  {
    id: "pieces",
    version: 1,
    title: "Ogni pezzo ha una strada",
    subtitle: "Torri, alfieri e il salto del cavallo",
    minutes: 4,
    icon: "♘",
    kind: "Pratica",
    source:
      "Introduzione, PDF pp. 14–18 e 26–27. Testi rielaborati in italiano.",
    concepts: [
      "La torre segue righe e colonne; l’alfiere le diagonali.",
      "La donna combina torre e alfiere. Il cavallo salta a L.",
      "Il re si sposta di una casa e non può entrare sotto attacco.",
    ],
    blocks: [
      {
        id: "pieces-explain",
        type: "explanation",
        title: "Impara le strade",
        text: "La torre va in linea retta, l’alfiere in diagonale. La donna usa entrambe le strade. Questi pezzi non saltano gli altri. Il cavallo è speciale: due case in una direzione e una di lato, anche oltre gli ostacoli. Il re muove di una casa, solo se è sicura.",
      },
      {
        id: "pieces-knight",
        type: "practice",
        title: "Salta verso il centro",
        text: "Sviluppa il cavallo da g1 a f3. Può saltare sopra i pedoni!",
        activity: activity(
          start,
          [["g1f3"]],
          [
            "Il cavallo si trova tra la torre e l’alfiere.",
            "Da g1, conta due case verso l’alto e una a sinistra: f3.",
          ],
        ),
      },
      {
        id: "pieces-rook",
        type: "find_move",
        title: "La strada della torre",
        text: "La torre è in a1. Portala in a7 lungo la colonna libera.",
        activity: activity(
          "7k/8/8/8/8/8/8/R3K3 w - - 0 1",
          [["a1a7"]],
          [
            "Una torre segue righe o colonne, senza cambiare direzione.",
            "Tocca a1, poi a7.",
          ],
        ),
      },
      {
        id: "pieces-quiz",
        type: "multiple_choice",
        title: "Chi può saltare?",
        text: "Quale pezzo può superare altri pezzi lungo il proprio percorso?",
        choices: ["L’alfiere", "Il cavallo", "La donna"],
        answer: 1,
        hints: ["Il suo movimento ha la forma di una L."],
        feedback: "Il cavallo! Gli altri pezzi devono avere la strada libera.",
      },
      {
        id: "pieces-summary",
        type: "summary",
        title: "Un piccolo esercito, sei ruoli",
        text: "Re, donna, torri, alfieri, cavalli e pedoni: ciascuno ha il suo movimento. Prima di muovere, controlla la strada e la sicurezza del tuo re.",
      },
    ],
  },
  {
    id: "check",
    version: 1,
    title: "Il re chiede aiuto",
    subtitle: "Riconoscere lo scacco e uscirne",
    minutes: 4,
    icon: "♔",
    kind: "Impara",
    source:
      "Introduzione, PDF pp. 27 e 31; capitolo 1, PDF p. 50. Testi rielaborati in italiano.",
    concepts: [
      "Scacco significa che il re è attaccato.",
      "Devi eliminare subito lo scacco: spostare il re, catturare o interporre.",
      "Non tutte le difese sono possibili in ogni posizione.",
    ],
    blocks: [
      {
        id: "check-explain",
        type: "explanation",
        title: "Il re non si cattura",
        text: "Quando un pezzo attacca il re, è scacco. La mossa successiva deve renderlo sicuro: puoi spostarlo, catturare chi attacca o mettere un pezzo in mezzo. Non puoi ignorare lo scacco.",
      },
      {
        id: "check-demo",
        type: "guided_move",
        title: "Esci dalla linea di tiro",
        text: "La torre nera in e8 attacca il re lungo la colonna e. Il re bianco si sposta in d1.",
        activity: activity(
          "k3r3/8/8/8/8/8/8/4K3 w - - 0 1",
          [["e1d1"]],
          ["La colonna e è sotto attacco."],
          {
            comments: [
              "Rd1: il re lascia la colonna e. In notazione italiana R indica il re; sulla scacchiera il movimento è e1–d1.",
            ],
          },
        ),
      },
      {
        id: "check-escape",
        type: "find_move",
        title: "Trova un rifugio",
        text: "Il Bianco è sotto scacco. Sposta il re su una casa sicura: sono accettate tutte le fughe legali.",
        activity: activity(
          "k3r3/8/8/8/8/8/8/4K3 w - - 0 1",
          [["e1d1", "e1d2", "e1f1", "e1f2"]],
          [
            "Restare sulla colonna e non risolve lo scacco.",
            "Prova d1, d2, f1 oppure f2.",
          ],
        ),
        feedback: "Il re è al sicuro. Hai risposto allo scacco.",
      },
      {
        id: "check-quiz",
        type: "multiple_choice",
        title: "La priorità del turno",
        text: "Il tuo re è sotto scacco. Puoi fare una mossa che lascia il re ancora attaccato?",
        choices: [
          "Sì, se attacco la donna",
          "No, devo risolvere lo scacco",
          "Sì, se catturo un pedone",
        ],
        answer: 1,
        hints: ["La sicurezza del re viene prima di tutto."],
      },
      {
        id: "check-summary",
        type: "summary",
        title: "Prima la sicurezza",
        text: "Quando c’è scacco, fermati: spostare, catturare, interporre. Cerca una difesa legale prima di ogni altro piano.",
      },
    ],
  },
  {
    id: "mate",
    version: 1,
    title: "La mossa che chiude",
    subtitle: "Dallo scacco allo scacco matto",
    minutes: 5,
    icon: "♕",
    kind: "Verifica",
    source:
      "Introduzione, PDF p. 31; capitolo 1, PDF pp. 40–50. Testi rielaborati in italiano.",
    concepts: [
      "Lo scacco matto è scacco senza alcuna risposta legale.",
      "Il re e la donna possono collaborare per togliere tutte le fughe.",
      "Senza scacco e senza mosse legali è stallo: patta.",
    ],
    blocks: [
      {
        id: "mate-explain",
        type: "explanation",
        diagram: {
          fen: "4k3/4Q3/4K3/8/8/8/8/8 b - - 0 1",
          orientation: "white",
          provenance: "Diagramma verificato · PDF p. 41 · muove il Nero",
        },
        title: "Scacco + nessuna via di uscita",
        text: "Lo scacco da solo non basta per vincere. È matto quando il re è attaccato e nessuna mossa legale può salvarlo. Se invece non è sotto scacco ma non ha mosse legali, è stallo: la partita è patta.",
      },
      {
        id: "mate-demo",
        type: "guided_move",
        title: "Due pezzi, un lavoro di squadra",
        text: "Re bianco in f6, donna in g6, re nero in h8. Guarda Dg7#: la donna dà scacco e il re bianco la protegge.",
        activity: activity(
          mate,
          [["g6g7"]],
          ["La donna arriva accanto al re, protetta dal proprio re."],
          {
            completion: "checkmate",
            comments: [
              "Dg7#: il re nero è sotto scacco, non può catturare la donna protetta e non ha fughe. È matto.",
            ],
          },
        ),
      },
      {
        id: "mate-solve",
        type: "find_move",
        title: "Trova il matto in una",
        text: "Riparti dalla stessa posizione. Collabora con il re bianco e trova la mossa che dà scacco matto.",
        activity: activity(
          mate,
          [["g6g7"]],
          [
            "Avvicina la donna al re nero senza lasciarla indifesa.",
            "La casa g7 è protetta dal re in f6.",
          ],
        ),
        feedback: "Scacco matto! La donna copre le fughe e il re la sostiene.",
      },
      {
        id: "mate-quiz",
        type: "multiple_choice",
        title: "Matto oppure stallo?",
        text: "Il re non è sotto scacco, ma il giocatore di turno non ha mosse legali. Qual è il risultato?",
        choices: [
          "Scacco matto: perde",
          "Stallo: patta",
          "Deve saltare il turno",
        ],
        answer: 1,
        hints: ["Per il matto il re deve essere attaccato."],
        feedback:
          "È stallo. Per questo devi controllare sempre anche la presenza dello scacco.",
      },
      {
        id: "mate-results",
        type: "multiple_choice",
        title: "Si vince solo con il matto?",
        text: "Il capitolo 1 presenta anche resa, sconfitta per tempo e abbandono. Se il tuo avversario si arrende, come termina la partita?",
        choices: [
          "Vinci la partita",
          "È sempre patta",
          "Dovete continuare fino al matto",
        ],
        answer: 0,
        hints: ["La resa è la decisione di concedere la vittoria."],
        feedback:
          "Vinci per resa. Il tempo è un altro modo di concludere: se chi resta ha solo il re e l’altro esaurisce il tempo, è patta perché quel re da solo non può dare matto.",
      },
      {
        id: "mate-summary",
        type: "summary",
        title: "Le fondamenta ci sono",
        text: "Sai fare una mossa, riconoscere lo scacco e concludere con un matto. Nel ripasso puoi tornare sugli esercizi che ti hanno fatto pensare di più.",
      },
    ],
  },
  ...additionalLessons,
];
export const contentVersion = 2;
