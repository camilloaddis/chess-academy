import { Chess, type Square, type PieceSymbol } from "chess.js";
import type { MoveActivity } from "../lessons/types";
export type Evaluation =
  | { kind: "illegal" | "incorrect"; message: string }
  | { kind: "correct"; fen: string; san: string; complete: boolean };
export function evaluateMove(
  fen: string,
  from: string,
  to: string,
  promotion: PieceSymbol,
  activity: MoveActivity,
  ply: number,
): Evaluation {
  const game = new Chess(fen);
  let move;
  try {
    move = game.move({ from, to, promotion });
  } catch {
    return {
      kind: "illegal",
      message: game.isCheck()
        ? "Il re è sotto scacco: questa mossa non lo mette al sicuro."
        : "Questa mossa non è legale. Controlla il movimento del pezzo e la sicurezza del re.",
    };
  }
  const uci = move.from + move.to + (move.promotion ?? "");
  if (!activity.moves[ply]?.includes(uci))
    return {
      kind: "incorrect",
      message:
        "La mossa è legale, ma non raggiunge l’obiettivo di questo esercizio. La posizione resta invariata: riprova.",
    };
  const last = ply + 1 === activity.moves.length;
  if (last && activity.completion === "checkmate" && !game.isCheckmate())
    return {
      kind: "incorrect",
      message:
        "Non è ancora scacco matto. Cerca una mossa che chiuda tutte le fughe.",
    };
  return { kind: "correct", fen: game.fen(), san: move.san, complete: last };
}
export function destinations(fen: string, square: string) {
  return new Chess(fen)
    .moves({ square: square as Square, verbose: true })
    .map((m) => m.to);
}
export function needsPromotion(fen: string, from: string, to: string) {
  const p = new Chess(fen).get(from as Square);
  return p?.type === "p" && (to[1] === "8" || to[1] === "1");
}
export function boardState(fen: string) {
  const g = new Chess(fen);
  return g.isCheckmate()
    ? "Scacco matto"
    : g.isStalemate()
      ? "Stallo"
      : g.isCheck()
        ? "Scacco"
        : `Muove il ${g.turn() === "w" ? "Bianco" : "Nero"}`;
}

export function completedPosition(activity: MoveActivity) {
  const game = new Chess(activity.fen);
  for (const alternatives of activity.moves) {
    const u = alternatives[0];
    game.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] });
  }
  return game.fen();
}
