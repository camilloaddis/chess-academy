import { useEffect, useState } from "react";
import type { Pdf } from "../documents/pdf";
import type { DocumentRecord } from "../storage/reader";
import {
  savePosition,
  annotationsFor,
  putAnnotation,
  removeAnnotation,
} from "../storage/reader";
import { extractPage, outline } from "../extraction/text";
import { PdfPage } from "./PdfPage";
import { Explorer } from "../chess/Explorer";
import type { Annotation } from "../annotations/model";
import { AnnotationEditor } from "../annotations/Editor";
export function Reader({
  doc,
  pdf,
  close,
}: {
  doc: DocumentRecord;
  pdf: Pdf;
  close: () => void;
}) {
  const [page, setPage] = useState(() => {
    const n = Number(location.hash.split("/")[2]);
    return Number.isInteger(n) && n > 0 && n <= doc.pages ? n : doc.page;
  });
  const [mode, setMode] = useState("pdf");
  const [size, setSize] = useState(19);
  const [toc, setToc] = useState<Awaited<ReturnType<typeof outline>>>([]);
  const [text, setText] = useState<Awaited<
    ReturnType<typeof extractPage>
  > | null>(null);
  const [marks, setMarks] = useState(doc.bookmarks);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [message, setMessage] = useState("");
  useEffect(() => {
    outline(pdf)
      .then(setToc)
      .catch(() => setToc([]));
    annotationsFor(doc.id)
      .then(setAnnotations)
      .catch(() => setMessage("Annotazioni locali non disponibili."));
  }, [pdf, doc.id]);
  useEffect(() => {
    let active = true;
    setText(null);
    if (mode === "text")
      extractPage(pdf, page)
        .then((t) => {
          if (active) setText(t);
        })
        .catch(() => {
          if (active)
            setMessage("Estrazione non disponibile. Usa la pagina PDF.");
        });
    return () => {
      active = false;
    };
  }, [pdf, page, mode]);
  useEffect(() => {
    location.hash = `read/${doc.id}/${page}`;
    void savePosition(doc.id, page, marks).catch(() =>
      setMessage(
        "Posizione non salvata: spazio locale o IndexedDB non disponibile.",
      ),
    );
  }, [doc.id, page, marks]);
  function go(n: number) {
    if (Number.isInteger(n) && n >= 1 && n <= doc.pages) {
      setPage(n);
      window.scrollTo(0, 0);
    }
  }
  return (
    <main className="reader">
      <header className="reader-bar">
        <button onClick={close}>← Libreria</button>
        <span>{doc.title}</span>
        <button
          onClick={() =>
            setMarks(
              marks.includes(page)
                ? marks.filter((n) => n !== page)
                : [...marks, page],
            )
          }
        >
          {marks.includes(page) ? "Rimuovi segnalibro" : "Segnalibro"}
        </button>
      </header>
      <progress aria-label="Avanzamento lettura" max={doc.pages} value={page} />
      <nav className="reading-tools" aria-label="Lettura">
        <label>
          Modalità
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="pdf">PDF originale</option>
            <option value="text">Testo adattivo · sperimentale</option>
          </select>
        </label>
        {mode === "text" && (
          <label>
            Carattere
            <input
              aria-label="Dimensione carattere"
              type="range"
              min={16}
              max={30}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
            />
          </label>
        )}
        <label>
          Pagina PDF
          <input
            aria-label="Pagina PDF"
            type="number"
            min={1}
            max={doc.pages}
            value={page}
            onChange={(e) => go(Number(e.target.value))}
          />
        </label>
        <span>di {doc.pages}</span>
      </nav>
      <details className="contents">
        <summary>Indice e segnalibri</summary>
        {toc.length ? (
          toc.map((item, i) => (
            <button
              key={i}
              style={{ marginLeft: `${Math.min(item.depth, 4)}em` }}
              onClick={() => go(item.page)}
            >
              {item.title} · {item.page}
            </button>
          ))
        ) : (
          <p>
            Il PDF non contiene un indice navigabile. Usa le pagine PDF o crea
            segnalibri; non vengono inventati capitoli.
          </p>
        )}
        {marks.map((n) => (
          <button key={n} onClick={() => go(n)}>
            Segnalibro · {n}
          </button>
        ))}
      </details>
      {message && <p role="status">{message}</p>}
      {mode === "pdf" ? (
        <PdfPage key={page} pdf={pdf} page={page} />
      ) : (
        <article className="reflow" style={{ fontSize: size }}>
          <p className="extraction-note">
            Estrazione locale sperimentale: le righe non sono riscritte né
            tradotte. Paragrafi, colonne e figure potrebbero non essere
            ricostruiti.{" "}
            <button onClick={() => setMode("pdf")}>
              Confronta con il PDF originale
            </button>
          </p>
          {text ? (
            <>
              {text.uncertain && (
                <p role="alert">
                  Ordine o quantità del testo incerti. Preferisci il PDF
                  originale per questa pagina.
                </p>
              )}
              {text.lines.map((line, i) => (
                <div key={i}>{line || " "}</div>
              ))}
            </>
          ) : (
            <p>Estrazione in corso…</p>
          )}
        </article>
      )}
      <section
        className="page-annotations"
        aria-label="Scacchiere di questa pagina"
      >
        <h2>Alla scacchiera · pagina {page}</h2>
        {annotations
          .filter((a) => a.page === page)
          .map((a) => (
            <details key={a.id}>
              <summary>
                {a.title} ·{" "}
                {a.verification === "verified" ? "verificata" : "da verificare"}
              </summary>
              <Explorer annotation={a} />
              <button
                onClick={async () => {
                  try {
                    await removeAnnotation(a.id);
                    setAnnotations(annotations.filter((x) => x.id !== a.id));
                  } catch {
                    setMessage("Impossibile rimuovere l’annotazione.");
                  }
                }}
              >
                Elimina annotazione
              </button>
            </details>
          ))}
        <AnnotationEditor
          documentId={doc.id}
          page={page}
          save={async (a) => {
            await putAnnotation(a);
            setAnnotations([...annotations, a]);
          }}
        />
      </section>
      <footer className="controls">
        <button disabled={page === 1} onClick={() => go(page - 1)}>
          ← Pagina precedente
        </button>
        <span>
          {page} / {doc.pages}
        </span>
        <button disabled={page === doc.pages} onClick={() => go(page + 1)}>
          Pagina successiva →
        </button>
      </footer>
    </main>
  );
}
