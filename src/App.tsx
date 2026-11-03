import { useEffect, useRef, useState } from "react";
import { importPdf } from "./documents/import";
import { openPdf, type Pdf } from "./documents/pdf";
import {
  listDocuments,
  documentBytes,
  removeDocument,
  setting,
  setSetting,
  type DocumentRecord,
} from "./storage/reader";
import { Reader } from "./reader/Reader";
export default function App() {
  const [docs, setDocs] = useState<DocumentRecord[]>([]);
  const [active, setActive] = useState<DocumentRecord | null>(null);
  const [pdf, setPdf] = useState<Pdf | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [theme, setTheme] = useState("light");
  const [space, setSpace] = useState("");
  const task = useRef<ReturnType<typeof openPdf> | null>(null);
  const loading = useRef(false);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  useEffect(() => {
    const blocked = () =>
      setMessage(
        "Chiudi le altre schede di Chess Academy per aggiornare l’archivio. Non cancellare i dati del sito.",
      );
    addEventListener("reader-storage-blocked", blocked);
    setting("theme", "light")
      .then(setTheme)
      .catch(() => {});
    listDocuments()
      .then(async (list) => {
        setDocs(list);
        const id = location.hash.split("/")[1];
        const doc = list.find((d) => d.id === id);
        if (doc) await open(doc);
      })
      .catch(() =>
        setMessage(
          "Archivio locale non disponibile. Il documento potrà essere aperto solo per questa sessione.",
        ),
      );
    navigator.storage
      ?.estimate?.()
      .then((s) =>
        setSpace(
          s.quota
            ? `${Math.round((s.usage ?? 0) / 1048576)} MB usati su circa ${Math.round(s.quota / 1048576)} MB disponibili per questa origine.`
            : "Stima dello spazio non disponibile.",
        ),
      )
      .catch(() => {});
    return () => {
      removeEventListener("reader-storage-blocked", blocked);
      void task.current?.destroy();
    };
  }, []);
  async function open(doc: DocumentRecord) {
    if (loading.current) return;
    loading.current = true;
    setBusy(true);
    try {
      await task.current?.destroy();
      const next = openPdf(
        doc.bytes.byteLength ? doc.bytes : await documentBytes(doc.id),
      );
      task.current = next;
      const result = await next.promise;
      setPdf(result);
      setActive(doc);
    } catch {
      setMessage(
        "Il documento non può essere aperto. Prova a importarlo nuovamente.",
      );
    } finally {
      setBusy(false);
      loading.current = false;
    }
  }
  async function close() {
    setActive(null);
    setPdf(null);
    location.hash = "";
    await task.current?.destroy();
    setDocs(await listDocuments().catch(() => docs));
  }
  return (
    <div className="shell">
      <nav className="masthead">
        <b>
          Chess Academy <span>Biblioteca personale</span>
        </b>
        <button
          onClick={() => {
            const t = theme === "light" ? "dark" : "light";
            setTheme(t);
            void setSetting("theme", t).catch(() =>
              setMessage("Tema valido solo in questa sessione."),
            );
          }}
        >
          {theme === "light" ? "Tema scuro" : "Tema chiaro"}
        </button>
      </nav>
      {busy && <p role="status">Apertura locale del documento…</p>}
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
      {active && pdf ? (
        <Reader
          key={active.id}
          doc={active}
          pdf={pdf}
          close={() => {
            void close();
          }}
        />
      ) : (
        <main className="library">
          <p className="eyebrow">LEGGERE. OSSERVARE. ESPLORARE.</p>
          <h1>
            Il tuo libro,
            <br />
            la tua scacchiera.
          </h1>
          <p>
            Importa un PDF e riprendi a leggere sul tuo dispositivo. Il
            documento non viene inviato a server o servizi esterni.
          </p>
          <label className="import">
            Importa un PDF
            <input
              aria-label="Importa un PDF"
              type="file"
              accept="application/pdf,.pdf"
              disabled={busy}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file || loading.current) return;
                setBusy(true);
                setMessage("");
                try {
                  const result = await importPdf(file);
                  setDocs(await listDocuments().catch(() => []));
                  setMessage(
                    result.persistent
                      ? "Documento salvato localmente."
                      : "Spazio insufficiente: documento aperto solo per questa sessione. Non sarà disponibile alla riapertura.",
                  );
                  await open(result.doc);
                } catch (err) {
                  setMessage(
                    err instanceof Error
                      ? err.message
                      : "Importazione non riuscita.",
                  );
                } finally {
                  setBusy(false);
                }
              }}
            />
          </label>
          <p className="fine">
            PDF fino a 64 MB. I dati restano in questo browser e possono essere
            rimossi dal browser in caso di spazio insufficiente. {space}
          </p>
          <button
            onClick={async () => {
              const ok = await navigator.storage?.persist?.();
              setMessage(
                ok
                  ? "Archiviazione persistente concessa dal browser."
                  : "Il browser non ha concesso archiviazione persistente. Conserva il PDF originale.",
              );
            }}
          >
            Richiedi conservazione locale
          </button>
          <section className="books" aria-label="Documenti importati">
            {docs.length === 0 && (
              <p>La biblioteca è vuota. Scegli il tuo PDF per cominciare.</p>
            )}
            {docs
              .sort((a, b) => b.updated - a.updated)
              .map((d) => (
                <article className="book" key={d.id}>
                  {d.cover && (
                    <img src={d.cover} alt="Anteprima della prima pagina" />
                  )}
                  <div>
                    <h2>{d.title}</h2>
                    <p>
                      Pagina {d.page} di {d.pages} ·{" "}
                      {Math.round((d.page / d.pages) * 100)}%
                    </p>
                    <button
                      disabled={busy}
                      onClick={() => {
                        void open(d);
                      }}
                    >
                      Continua a leggere
                    </button>
                    <button
                      onClick={async () => {
                        if (
                          !confirm(
                            "Rimuovere questo PDF, posizione, segnalibri e annotazioni dal dispositivo?",
                          )
                        )
                          return;
                        try {
                          await removeDocument(d.id);
                          setDocs(docs.filter((x) => x.id !== d.id));
                        } catch {
                          setMessage("Rimozione non riuscita. Riprova.");
                        }
                      }}
                    >
                      Rimuovi documento e dati
                    </button>
                  </div>
                </article>
              ))}
          </section>
        </main>
      )}
    </div>
  );
}
