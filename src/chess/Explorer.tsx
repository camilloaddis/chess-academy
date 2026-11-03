import { useState } from "react";
import { Chess, type PieceSymbol } from "chess.js";
import { Chessboard } from "react-chessboard";
import { linePositions, type Annotation } from "../annotations/model";
import { boardState, needsPromotion } from "../engine/chess";
export function Explorer({ annotation: a }: { annotation: Annotation }) {
  const line = linePositions(a.fen, a.moves);
  const [index, setIndex] = useState(0);
  const [exploration, setExploration] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [promotion, setPromotion] = useState<{
    from: string;
    to: string;
  } | null>(null);
  const [error, setError] = useState("");
  const fen = exploration.at(-1) ?? line.positions[index];
  const jump = (i: number) => {
    setIndex(i);
    setExploration([]);
    setSelected(null);
    setError("");
  };
  function move(from: string, to: string, piece: PieceSymbol = "q") {
    try {
      const g = new Chess(fen);
      g.move({ from, to, promotion: piece });
      setExploration([...exploration, g.fen()]);
      setSelected(null);
      setError("");
      return true;
    } catch {
      setError("Mossa non legale in questa posizione.");
      return false;
    }
  }
  function request(from: string, to: string) {
    if (needsPromotion(fen, from, to)) {
      setPromotion({ from, to });
      return false;
    }
    return move(from, to);
  }
  return (
    <section className="explorer">
      <h3>{a.title}</h3>
      <p>
        {a.provenance === "original"
          ? "Esempio originale aggiunto all’app"
          : a.provenance === "book"
            ? "Linea indicata nel libro"
            : "Posizione ricostruita dal diagramma"}{" "}
        · {a.verification === "verified" ? "Verificata" : "Da verificare"}
      </p>
      <small>{a.note}</small>
      <Chessboard
        options={{
          position: fen,
          boardStyle: { width: "100%" },
          onPieceDrop: ({ sourceSquare, targetSquare }) =>
            targetSquare ? request(sourceSquare, targetSquare) : false,
          onSquareClick: ({ square, piece }) => {
            if (selected && selected !== square) request(selected, square);
            else if (piece) setSelected(square);
          },
          squareStyles: selected
            ? { [selected]: { backgroundColor: "#c8a65b" } }
            : {},
        }}
      />
      <p role="status">
        {boardState(fen)} ·{" "}
        {exploration.length
          ? "Esplorazione libera: non è la linea del libro"
          : `Linea annotata: ${index}/${a.moves.length}`}
      </p>
      {error && <p role="alert">{error}</p>}
      {promotion && (
        <div role="dialog" aria-label="Promozione">
          {(["q", "r", "b", "n"] as const).map((p, i) => (
            <button
              key={p}
              onClick={() => {
                move(promotion.from, promotion.to, p);
                setPromotion(null);
              }}
            >
              {["Donna", "Torre", "Alfiere", "Cavallo"][i]}
            </button>
          ))}
        </div>
      )}
      <div className="controls">
        <button onClick={() => jump(0)}>Inizio</button>
        <button
          disabled={!index && !exploration.length}
          onClick={() =>
            exploration.length
              ? setExploration(exploration.slice(0, -1))
              : jump(index - 1)
          }
        >
          Indietro
        </button>
        <button
          disabled={index === a.moves.length}
          onClick={() => jump(index + 1)}
        >
          Avanti
        </button>
        <button onClick={() => jump(index)}>Ripristina linea</button>
      </div>
      <p className="notation">
        {line.san.map((s, i) => (
          <button
            key={i}
            aria-current={i + 1 === index ? "step" : undefined}
            onClick={() => jump(i + 1)}
          >
            {i + 1}. {s}
          </button>
        ))}
        {!line.san.length &&
          "Solo posizione: nessuna sequenza attribuita al libro."}
      </p>
    </section>
  );
}
