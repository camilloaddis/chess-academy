import { useState } from "react";
import { linePositions, type Annotation } from "./model";
export function AnnotationEditor({
  documentId,
  page,
  save,
}: {
  documentId: string;
  page: number;
  save: (a: Annotation) => Promise<void>;
}) {
  const [error, setError] = useState("");
  return (
    <details>
      <summary>Aggiungi una scacchiera a questa pagina</summary>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          try {
            const fen = String(f.get("fen"));
            const moves = String(f.get("moves"))
              .trim()
              .split(/\s+/)
              .filter(Boolean);
            linePositions(fen, moves);
            await save({
              id: crypto.randomUUID(),
              documentId,
              page,
              title: String(f.get("title")),
              section: String(f.get("section")),
              fen,
              moves,
              provenance: f.get("origin") as Annotation["provenance"],
              verification: "pending",
              note: "Annotazione personale. Legalità FEN e mosse controllata; corrispondenza al documento da verificare.",
            });
            setError("Annotazione salvata sul dispositivo.");
          } catch {
            setError(
              "Controlla FEN, mosse e spazio disponibile. Nessuna annotazione salvata.",
            );
          }
        }}
      >
        <label>
          Titolo
          <input name="title" required maxLength={150} />
        </label>
        <label>
          Sezione (facoltativa)
          <input name="section" />
        </label>
        <label>
          FEN
          <input name="fen" required />
        </label>
        <label>
          Mosse SAN inglesi o UCI, separate da spazi
          <input name="moves" placeholder="e2e4 e7e5 g1f3" />
        </label>
        <label>
          Provenienza
          <select name="origin">
            <option value="reconstructed">Ricostruzione da verificare</option>
            <option value="book">Sequenza indicata nel libro</option>
            <option value="original">Esempio originale dell’utente</option>
          </select>
        </label>
        <button>Salva annotazione locale</button>
        <p role="status">{error}</p>
      </form>
    </details>
  );
}
