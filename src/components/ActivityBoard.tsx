import { useState, type CSSProperties } from "react";
import { Chessboard } from "react-chessboard";
import type { PieceSymbol } from "chess.js";
import type { MoveActivity } from "../lessons/types";
import {
  boardState,
  completedPosition,
  destinations,
  evaluateMove,
  needsPromotion,
} from "../engine/chess";
export function ActivityBoard({
  activity,
  guided,
  done,
  onAttempt,
  provenance = "Posizione didattica originale · non tratta dal PDF",
}: {
  activity: MoveActivity;
  guided: boolean;
  done: boolean;
  onAttempt: (correct: boolean, complete?: boolean) => void;
  provenance?: string;
}) {
  const [fen, setFen] = useState(() =>
      done ? completedPosition(activity) : activity.fen,
    ),
    [ply, setPly] = useState(done ? activity.moves.length : 0),
    [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState(""),
    [tone, setTone] = useState(""),
    [pending, setPending] = useState<{ from: string; to: string } | null>(null);
  const [last, setLast] = useState<string[]>([]);
  function move(from: string, to: string, promotion: PieceSymbol = "q") {
    if (ply >= activity.moves.length) return false;
    const result = evaluateMove(fen, from, to, promotion, activity, ply);
    setSelected(null);
    if (result.kind !== "correct") {
      setFeedback(result.message);
      setTone("error");
      onAttempt(false);
      return false;
    }
    setFen(result.fen);
    setLast([from, to]);
    setPly(ply + 1);
    setTone("success");
    setFeedback(
      activity.comments?.[ply] ??
        (result.complete
          ? "Obiettivo raggiunto. Ottima mossa!"
          : `${result.san}: bene, continua.`),
    );
    if (!guided || result.complete) onAttempt(true, result.complete);
    return true;
  }
  function requestMove(from: string, to: string) {
    if (done && ply === 0) return false;
    if (needsPromotion(fen, from, to)) {
      setPending({ from, to });
      return false;
    }
    return move(from, to);
  }
  const styles: Record<string, CSSProperties> = {};
  last.forEach((s) => (styles[s] = { backgroundColor: "#d5df87" }));
  if (selected) {
    styles[selected] = { backgroundColor: "#e5c26b" };
    destinations(fen, selected).forEach(
      (s) =>
        (styles[s] = {
          backgroundImage:
            "radial-gradient(circle, #142e2955 20%, transparent 24%)",
        }),
    );
  }
  const disabled = guided || done || ply >= activity.moves.length;
  return (
    <div className="board-activity">
      <div className="board-label">
        <span>
          <i /> {boardState(fen)}
        </span>
        <span>{guided ? "DIMOSTRAZIONE" : "TOCCA O TRASCINA"}</span>
      </div>
      <div className="board-shell" aria-label="Scacchiera interattiva">
        <Chessboard
          options={{
            id: "lesson-board",
            position: fen,
            boardOrientation: activity.orientation,
            allowDragging: !disabled,
            animationDurationInMs: matchMedia(
              "(prefers-reduced-motion: reduce)",
            ).matches
              ? 0
              : 180,
            lightSquareStyle: { backgroundColor: "#eeefdb" },
            darkSquareStyle: { backgroundColor: "#739685" },
            squareStyles: styles,
            onPieceDrop: ({ sourceSquare, targetSquare }) =>
              targetSquare && !disabled
                ? requestMove(sourceSquare, targetSquare)
                : false,
            onSquareClick: ({ square, piece }) => {
              if (disabled) return;
              if (selected && selected !== square) {
                requestMove(selected, square);
                return;
              }
              if (piece) setSelected(selected === square ? null : square);
            },
            boardStyle: { borderRadius: "8px", overflow: "hidden" },
          }}
        />
      </div>
      <p className="board-credit">{provenance}</p>
      {guided && ply < activity.moves.length && (
        <button
          className="primary w-full"
          onClick={() => {
            const u = activity.moves[ply][0];
            move(u.slice(0, 2), u.slice(2, 4), (u[4] ?? "q") as PieceSymbol);
          }}
        >
          Mostra la mossa {ply + 1} <span>→</span>
        </button>
      )}
      {feedback && (
        <div role="status" className={`feedback ${tone}`}>
          {feedback}
        </div>
      )}
      {pending && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Scegli la promozione"
          className="promotion"
        >
          <strong>Promuovi il pedone</strong>
          <p>Scegli il pezzo con cui continuare.</p>
          <div>
            {(["q", "r", "b", "n"] as const).map((p, i) => (
              <button
                key={p}
                onClick={() => {
                  move(pending.from, pending.to, p);
                  setPending(null);
                }}
              >
                {["Donna", "Torre", "Alfiere", "Cavallo"][i]}
              </button>
            ))}
          </div>
          <button onClick={() => setPending(null)}>Annulla</button>
        </div>
      )}
    </div>
  );
}
