import { Chess } from "chess.js";
export type Annotation = {
  id: string;
  documentId: string;
  page: number;
  section?: string;
  title: string;
  fen: string;
  moves: string[];
  provenance: "book" | "reconstructed" | "original";
  verification: "pending" | "verified";
  note: string;
};
export function linePositions(fen: string, moves: string[]) {
  const g = new Chess(fen);
  const positions = [g.fen()];
  const san: string[] = [];
  for (const value of moves) {
    const m = /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(value)
      ? g.move({
          from: value.slice(0, 2),
          to: value.slice(2, 4),
          promotion: value[4],
        })
      : g.move(value);
    san.push(m.san);
    positions.push(g.fen());
  }
  return { positions, san };
}
export const referenceHash =
  "8ad4a94dcb830d54b64d2658b759e8c144af08c0f5fcc89bc38d8e18b1dbe453";
export function referenceAnnotations(documentId: string): Annotation[] {
  if (documentId !== referenceHash) return [];
  return [
    {
      page: 14,
      title: "Disposizione iniziale",
      fen: new Chess().fen(),
      section: "Introduzione",
    },
    {
      page: 41,
      title: "Re e donna: posizione di matto",
      fen: "4k3/4Q3/4K3/8/8/8/8/8 b - - 0 1",
      section: "Capitolo 1",
    },
    {
      page: 42,
      title: "Alfiere e cavallo: posizione di matto",
      fen: "7k/6B1/6KN/8/8/8/8/8 b - - 0 1",
      section: "Capitolo 1",
    },
  ].map((p) => ({
    ...p,
    id: `${documentId}:${p.page}`,
    documentId,
    moves: [],
    provenance: "reconstructed",
    verification: "verified",
    note: "Pezzi e case confrontati visivamente con questa edizione. Turno desunto dal contesto; diritti e contatori FEN convenzionali. Il diagramma non presenta una sequenza di mosse.",
  }));
}
