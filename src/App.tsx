import { useEffect, useRef, useState } from "react";
import { lessons } from "./content/unit";
import { courseUnits } from "./content/course";
import { LessonPlayer } from "./components/LessonPlayer";
import {
  freshProgress,
  keyFor,
  lessonReady,
  loadProgress,
  saveProgress,
  type Progress,
} from "./persistence/progress";
import { navigate, readRoute } from "./navigation/routes";
type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};
export default function App() {
  const [progress, setProgress] = useState<Progress>(freshProgress),
    [loaded, setLoaded] = useState(false),
    [storageError, setStorageError] = useState(""),
    [route, setRoute] = useState(readRoute),
    [online, setOnline] = useState(navigator.onLine),
    [install, setInstall] = useState<InstallPrompt | null>(null);
  const writes = useRef(Promise.resolve());
  const storageWritable = useRef(true);
  useEffect(() => {
    loadProgress()
      .then(setProgress)
      .catch((e) => {
        storageWritable.current = false;
        setStorageError(
          e instanceof Error ? e.message : "Salvataggio non disponibile.",
        );
      })
      .finally(() => setLoaded(true));
    const routeChange = () => setRoute(readRoute()),
      network = () => setOnline(navigator.onLine),
      prompt = (e: Event) => {
        e.preventDefault();
        setInstall(e as InstallPrompt);
      };
    addEventListener("hashchange", routeChange);
    addEventListener("online", network);
    addEventListener("offline", network);
    addEventListener("beforeinstallprompt", prompt);
    return () => {
      removeEventListener("hashchange", routeChange);
      removeEventListener("online", network);
      removeEventListener("offline", network);
      removeEventListener("beforeinstallprompt", prompt);
    };
  }, []);
  function update(p: Progress) {
    setProgress(p);
    if (!storageWritable.current) return;
    writes.current = writes.current
      .then(() => saveProgress(p))
      .catch(() =>
        setStorageError(
          "Non riesco a salvare su questo dispositivo. I progressi di questa sessione restano disponibili finché non chiudi la pagina.",
        ),
      );
  }
  const completed = lessons.filter(
    (l) => progress.completed[l.id] === l.version,
  ).length;
  function start(id: string, restart = false) {
    const l = lessons.find((l) => l.id === id);
    if (!l) return;
    let p = { ...progress, currentLesson: id };
    if (restart) {
      const results = { ...p.results };
      l.blocks.forEach((b) => delete results[keyFor(l, b.id)]);
      p = { ...p, results, positions: { ...p.positions, [id]: 0 } };
    }
    update(p);
    navigate({ page: "lesson", id });
  }
  const current =
    lessons.find((l) => l.id === progress.currentLesson) ?? lessons[0];
  const next = !lessonReady(progress, current)
    ? current
    : (lessons.find((l) => progress.completed[l.id] !== l.version) ?? current);
  const active =
    "id" in route ? lessons.find((l) => l.id === route.id) : undefined;
  if (!loaded)
    return (
      <div className="loading">
        ♘ <span>Prepariamo la scacchiera…</span>
      </div>
    );
  const lessonView = route.page === "lesson" && active;
  const errorBanner = storageError && (
    <div className="storage-warning" role="alert">
      {storageError}
    </div>
  );
  if (lessonView)
    return (
      <>
        {errorBanner}
        <LessonPlayer
          key={active.id}
          lesson={active}
          progress={progress}
          update={update}
        />
      </>
    );
  function pathList(items = lessons) {
    return (
      <div className="path-list">
        {items.map((l) => {
          const complete = progress.completed[l.id] === l.version;
          return (
            <button
              className={`lesson-card ${complete ? "finished" : ""}`}
              key={l.id}
              onClick={() => start(l.id)}
            >
              <span className="lesson-number">
                {complete ? "✓" : l.icon}
              </span>
              <span className="lesson-info">
                <span className="eyebrow">
                  {String(lessons.indexOf(l) + 1).padStart(2, "0")} · {l.kind}
                </span>
                <strong>{l.title}</strong>
                <small>{l.subtitle}</small>
              </span>
              <span className="lesson-meta">
                {l.minutes} min <b>{complete ? "✓" : "→"}</b>
              </span>
            </button>
          );
        })}
      </div>
    );
  }
  return (
    <div className="app-shell">
      {errorBanner}
      <aside className="desktop-sidebar">
        <Brand />
        <p>
          Un piccolo passo.
          <br />
          Un nuovo modo di pensare.
        </p>
        <nav>
          {[
            ["home", "⌂", "La tua academy"],
            ["path", "⚑", "Il percorso"],
            ["review", "↻", "Ripasso"],
          ].map(([page, icon, label]) => (
            <button
              key={page}
              className={route.page === page ? "active" : ""}
              onClick={() =>
                navigate({ page: page as "home" | "path" | "review" })
              }
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="leaf">✦</span> La pratica batte il talento.
          <small>Dedica qualche minuto a te.</small>
        </div>
      </aside>
      <div className="main-column">
        <header className="mobile-header">
          <Brand />
          <span className="local-badge">
            <i />
            {online ? "I tuoi progressi, qui" : "Sei offline"}
          </span>
        </header>
        <main className="dashboard animate-in">
          {route.page === "home" && (
            <>
              <div className="page-heading">
                <div className="eyebrow">IL TUO SPAZIO PER IMPARARE</div>
                <h1>
                  Le grandi partite iniziano
                  <br className="desktop-break" /> con una piccola mossa
                  <span>.</span>
                </h1>
                <p>Non serve essere un genio. Basta cominciare.</p>
              </div>
              <section className="hero-card">
                <div className="hero-copy">
                  <div className="pill">✦ IMPARA AL TUO RITMO</div>
                  <h2>
                    {completed === lessons.length
                      ? "Il percorso è tuo."
                      : "La prossima mossa\nè la tua."}
                  </h2>
                  <p>
                    {completed === lessons.length
                      ? "Torna sulla scacchiera e rendi le tue idee ancora più solide."
                      : "Dalle prime mosse ai finali: scegli cosa imparare, senza prerequisiti."}
                  </p>
                  <button
                    className="primary light"
                    onClick={() => start(next.id)}
                  >
                    {Object.keys(progress.results).length
                      ? "Continua il percorso"
                      : "Inizia la prima lezione"}{" "}
                    <span>→</span>
                  </button>
                  <small>
                    ◷ {next.minutes} minuti · {next.title}
                  </small>
                </div>
                <div className="hero-art" aria-hidden="true">
                  <div className="art-grid" />
                  <span className="hero-knight">♞</span>
                  <span className="art-star">✧</span>
                  <span className="art-caption">OGNI MOSSA CONTA</span>
                </div>
              </section>
              <div className="stats-grid">
                <div>
                  <span className="stat-icon">⚑</span>
                  <div>
                    <strong>
                      {completed}
                      <small> / {lessons.length}</small>
                    </strong>
                    <p>Lezioni completate</p>
                  </div>
                </div>
                <div>
                  <span className="stat-icon">◈</span>
                  <div>
                    <strong>
                      {Math.round((completed / lessons.length) * 100)}
                      <small>%</small>
                    </strong>
                    <p>Percorso completato</p>
                  </div>
                </div>
              </div>
              <div className="section-title">
                <div>
                  <div className="eyebrow">IL TUO PERCORSO</div>
                  <h2>Scegli la tua prossima lezione</h2>
                </div>
                <button
                  className="text-btn"
                  onClick={() => navigate({ page: "path" })}
                >
                  Vedi tutto <span>→</span>
                </button>
              </div>
              {pathList(lessons.slice(0, 4))}
              <section className="review-banner">
                <span>↻</span>
                <div>
                  <h3>Le idee migliori meritano un ripasso.</h3>
                  <p>
                    {progress.review.length
                      ? `${progress.review.length} attività da rivedere, senza fretta.`
                      : "Gli esercizi più difficili ti aspettano qui."}
                  </p>
                </div>
                <button
                  className="secondary"
                  onClick={() => navigate({ page: "review" })}
                >
                  Ripassa →
                </button>
              </section>
            </>
          )}
          {route.page === "path" && (
            <>
              <div className="page-heading">
                <div className="eyebrow">UNA MOSSA ALLA VOLTA</div>
                <h1>
                  Il tuo percorso<span>.</span>
                </h1>
                <p>{lessons.length} lezioni da esplorare nell’ordine che preferisci. Tutte accessibili da subito.</p>
              </div>
              {courseUnits.map((unit, index) => {
                const items = lessons.filter(lesson => unit.ids.includes(lesson.id));
                const done = items.filter(lesson => progress.completed[lesson.id] === lesson.version).length;
                return (
                  <section key={unit.title} aria-label={unit.title}>
                    <div className="unit-heading">
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <h2>{unit.title}</h2>
                        <p>{unit.subtitle} · {items.reduce((n, l) => n + l.minutes, 0)} minuti</p>
                      </div>
                      <b>{done}/{items.length}</b>
                    </div>
                    {pathList(items)}
                  </section>
                );
              })}
              <div className="source-note">
                Concetti rielaborati dall’introduzione e dal capitolo 1 di How
                to Win at Chess. Esercizi originali e diagrammi verificati sono
                indicati nelle lezioni. Le nuove unità contengono testi ed esercizi originali.
              </div>
            </>
          )}
          {route.page === "review" && (
            <>
              <div className="page-heading">
                <div className="eyebrow">RIPASSO PERSONALE</div>
                <h1>
                  Gli errori fanno strada<span>.</span>
                </h1>
                <p>Riprendi le idee che richiedono ancora un po’ di pratica.</p>
              </div>
              {progress.review.length === 0 ? (
                <div className="empty-state">
                  <span>✧</span>
                  <h2>Una scacchiera pulita</h2>
                  <p>
                    Quando un esercizio ti metterà in difficoltà, lo ritroverai
                    qui. Puoi anche rifare una lezione dal percorso.
                  </p>
                  <button
                    className="primary"
                    onClick={() => navigate({ page: "path" })}
                  >
                    Vai al percorso →
                  </button>
                </div>
              ) : (
                lessons
                  .filter((l) =>
                    progress.review.some((k) =>
                      k.startsWith(`${l.id}@${l.version}/`),
                    ),
                  )
                  .map((l) => (
                    <section className="review-item" key={l.id}>
                      <span className="review-piece">{l.icon}</span>
                      <div>
                        <h2>{l.title}</h2>
                        {l.blocks
                          .filter((b) =>
                            progress.review.includes(keyFor(l, b.id)),
                          )
                          .map((b) => (
                            <p key={b.id}>
                              {b.title} ·{" "}
                              {progress.results[keyFor(l, b.id)]?.errors ?? 0}{" "}
                              errori
                            </p>
                          ))}
                        <button
                          className="primary"
                          onClick={() => start(l.id, true)}
                        >
                          Riprova la lezione →
                        </button>
                      </div>
                    </section>
                  ))
              )}
            </>
          )}
          {route.page === "complete" &&
            active &&
            (progress.completed[active.id] === active.version ? (
              <>
                <div className="completion-mark">✦</div>
                <div className="page-heading centered">
                  <div className="eyebrow">UN PASSO AVANTI</div>
                  <h1>
                    Ben giocato<span>!</span>
                  </h1>
                  <p>Hai completato “{active.title}”.</p>
                </div>
                <div className="completion-stats">
                  <div>
                    <strong>
                      {
                        active.blocks.filter(
                          (b) => progress.results[keyFor(active, b.id)]?.done,
                        ).length
                      }
                      /{active.blocks.length}
                    </strong>
                    <span>Passaggi completati</span>
                  </div>
                  <div>
                    <strong>
                      {active.blocks.reduce(
                        (n, b) =>
                          n +
                          (progress.results[keyFor(active, b.id)]?.errors ?? 0),
                        0,
                      )}
                    </strong>
                    <span>Errori in questa prova</span>
                  </div>
                </div>
                <section className="recap">
                  <h2>Le idee da portare con te</h2>
                  {active.concepts.map((c) => (
                    <p key={c}>
                      <span>✓</span>
                      {c}
                    </p>
                  ))}
                </section>
                {progress.review.some((k) => k.startsWith(active.id + "@")) && (
                  <p className="source-note">
                    Hai attività da ripassare. Gli errori sono parte
                    dell’apprendimento: li trovi nella sezione Ripasso.
                  </p>
                )}
                <button
                  className="primary w-full"
                  onClick={() => {
                    const n = lessons[lessons.indexOf(active) + 1];
                    if (n) start(n.id);
                    else navigate({ page: "path" });
                  }}
                >
                  {lessons.indexOf(active) < lessons.length - 1
                    ? "La prossima lezione"
                    : "Torna al percorso"}{" "}
                  →
                </button>
                <button
                  className="text-btn centered block"
                  onClick={() => navigate({ page: "review" })}
                >
                  Vai al ripasso
                </button>
              </>
            ) : (
              <div className="empty-state">
                <h1>La lezione ti aspetta</h1>
                <p>Completa tutte le attività per sbloccare il riepilogo.</p>
                <button className="primary" onClick={() => start(active.id)}>
                  Riprendi
                </button>
              </div>
            ))}
          {route.page === "lesson" && !lessonView && (
            <div className="empty-state">
              <h1>Un passo alla volta</h1>
              <p>Questa lezione non è ancora disponibile.</p>
              <button
                className="primary"
                onClick={() => navigate({ page: "path" })}
              >
                Torna al percorso
              </button>
            </div>
          )}
          <footer>
            <span>CHESS ACADEMY</span>
            <span>Imparare è la mossa migliore.</span>
          </footer>
          {install && (
            <button
              className="install-button"
              onClick={async () => {
                await install.prompt();
                setInstall(null);
              }}
            >
              ↓ Installa l’app per averla sempre con te
            </button>
          )}
        </main>
      </div>
      <nav className="bottom-nav" aria-label="Navigazione principale">
        {[
          ["home", "⌂", "Home"],
          ["path", "⚑", "Percorso"],
          ["review", "↻", "Ripasso"],
        ].map(([page, icon, label]) => (
          <button
            key={page}
            className={route.page === page ? "active" : ""}
            onClick={() =>
              navigate({ page: page as "home" | "path" | "review" })
            }
          >
            <span>{icon}</span>
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
function Brand() {
  return (
    <a href="#home" className="brand">
      <span>♞</span>
      <div>
        chess<span>academy</span>
      </div>
    </a>
  );
}
