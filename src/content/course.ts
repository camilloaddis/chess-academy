import data from './course-data.json' with { type: 'json' };
import type { Lesson, MoveActivity } from '../lessons/types';

function activity(example: typeof data[number]['demo']): MoveActivity {
  return {
    fen: example.fen,
    moves: example.moves,
    orientation: 'white',
    completion: example.mate ? 'checkmate' : 'sequence',
    hints: [example.hint],
    ...(example.comments ? { comments: example.comments } : {}),
  };
}

export const additionalLessons: Lesson[] = data.map(row => ({
  id: row.id,
  version: 1,
  title: row.title,
  subtitle: row.subtitle,
  minutes: 4,
  icon: ['♙', '♗', '♘', '♕', '♔'][row.unit % 5],
  kind: row.unit === 1 ? 'Regole' : row.unit === 2 || row.unit === 9 ? 'Tattica' : row.unit === 4 || row.unit === 8 ? 'Finali' : row.unit === 6 ? 'Aperture' : row.unit === 7 ? 'Gambetti' : row.unit === 5 ? 'Pratica' : 'Piani',
  source: 'Testo ed esercizi originali di Chess Academy sulle regole e sui principi generali degli scacchi.',
  concepts: row.concepts,
  blocks: [
    { id: `${row.id}-explain`, type: 'explanation', title: row.subtitle, text: row.text },
    { id: `${row.id}-demo`, type: 'guided_move', title: row.demo.title, text: row.demo.text, activity: activity(row.demo) },
    { id: `${row.id}-practice`, type: 'practice', title: row.practice.title, text: row.practice.text, activity: activity(row.practice) },
    { id: `${row.id}-quiz`, type: 'multiple_choice', title: 'Metti a fuoco l’idea', text: row.question, choices: row.choices, answer: row.answer, hints: [row.concepts[0]], feedback: row.summary },
    { id: `${row.id}-summary`, type: 'summary', title: 'Un’idea da portare in partita', text: row.summary },
  ],
}));

export const courseUnits = [
  { title: 'Le fondamenta', subtitle: 'Dalla prima mossa al primo matto', ids: ['board', 'pieces', 'check', 'mate'] },
  { title: 'Le regole in pratica', subtitle: 'Movimenti, catture e mosse speciali', ids: data.filter(row => row.unit === 1).map(row => row.id) },
  { title: 'Vedere la tattica', subtitle: 'Doppi attacchi, linee e minacce al re', ids: data.filter(row => row.unit === 2).map(row => row.id) },
  { title: 'Aperture e piani', subtitle: 'Centro, sviluppo e pezzi attivi', ids: data.filter(row => row.unit === 3).map(row => row.id) },
  { title: 'Giocare i finali', subtitle: 'Re attivo, pedoni e coordinazione', ids: data.filter(row => row.unit === 4).map(row => row.id) },
  { title: 'Consolidare il gioco', subtitle: 'Partite, aperture, matti e patte', ids: data.filter(row => row.unit === 5).map(row => row.id) },
  { title: 'Un repertorio da capire', subtitle: 'Idee di apertura con entrambi i colori', ids: data.filter(row => row.unit === 6).map(row => row.id) },
  { title: 'Materiale e iniziativa', subtitle: 'Capire i gambetti', ids: data.filter(row => row.unit === 7).map(row => row.id) },
  { title: 'Finali da valutare', subtitle: 'Pedoni, pezzi leggeri e pezzi pesanti', ids: data.filter(row => row.unit === 8).map(row => row.id) },
  { title: 'Calcolare con metodo', subtitle: 'Candidate, difensori e sacrifici', ids: data.filter(row => row.unit === 9).map(row => row.id) },
  { title: 'Scegliere un piano', subtitle: 'Strutture, attività e scambi', ids: data.filter(row => row.unit === 10).map(row => row.id) },
];
