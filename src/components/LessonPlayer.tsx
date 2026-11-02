import { useState } from "react";
import type { Lesson } from "../lessons/types";
import { isBoardBlock } from "../lessons/types";
import {
  keyFor,
  lessonReady,
  recordAttempt,
  completeLesson,
  type Progress,
} from "../persistence/progress";
import { ActivityBoard } from "./ActivityBoard";
import { navigate } from "../navigation/routes";
export function LessonPlayer({
  lesson,
  progress,
  update,
}: {
  lesson: Lesson;
  progress: Progress;
  update: (p: Progress) => void;
}) {
  const index = Math.min(
      progress.positions[lesson.id] ?? 0,
      lesson.blocks.length - 1,
    ),
    block = lesson.blocks[index],
    key = keyFor(lesson, block.id),
    result = progress.results[key];
  const [feedback, setFeedback] = useState("");
  const done = !!result?.done;
  function attempt(correct: boolean, complete = correct) {
    update(recordAttempt(progress, key, correct, complete));
  }
  function go(i: number) {
    setFeedback("");
    update({
      ...progress,
      positions: { ...progress.positions, [lesson.id]: i },
    });
  }
  function next() {
    let p = progress;
    if (block.type === "explanation" || block.type === "summary")
      p = {
        ...p,
        results: {
          ...p.results,
          [key]: { attempts: 0, errors: 0, hints: 0, done: true },
        },
      };
    if (index < lesson.blocks.length - 1) {
      update({ ...p, positions: { ...p.positions, [lesson.id]: index + 1 } });
      setFeedback("");
    } else if (lessonReady(p, lesson)) {
      update(completeLesson(p, lesson));
      navigate({ page: "complete", id: lesson.id });
    }
  }
  const hintCount = result?.hints ?? 0;
  const hints = isBoardBlock(block)
    ? block.activity.hints
    : "hints" in block
      ? block.hints
      : [];
  return (
    <main className="lesson-page animate-in">
      <div className="lesson-top">
        <button
          className="icon-btn"
          aria-label="Esci dalla lezione"
          onClick={() => navigate({ page: "path" })}
        >
          ×
        </button>
        <div className="grow">
          <div className="eyebrow">{lesson.title}</div>
          <div className="progress-track">
            <div
              style={{ width: `${(index / lesson.blocks.length) * 100}%` }}
            />
          </div>
        </div>
        <span>
          {index + 1}/{lesson.blocks.length}
        </span>
      </div>
      <div className="lesson-body" key={block.id}>
        <div className="eyebrow accent">
          {block.type === "guided_move"
            ? "GUARDA E IMPARA"
            : block.type === "find_move" || block.type === "practice"
              ? "METTITI ALLA PROVA"
              : block.type === "multiple_choice"
                ? "UN ULTIMO CONTROLLO"
                : block.type === "summary"
                  ? "PORTA CON TE"
                  : "UNA NUOVA IDEA"}
        </div>
        <h1>{block.title}</h1>
        <p className="lesson-text">{block.text}</p>
        {block.diagram && (
          <ActivityBoard
            key={key + "diagram"}
            activity={{
              ...block.diagram,
              moves: [],
              hints: [],
              completion: "sequence",
            }}
            guided={true}
            done={true}
            onAttempt={() => {}}
            provenance={block.diagram.provenance}
          />
        )}
        {(block.type === "explanation" || block.type === "summary") &&
          !block.diagram && (
            <div className="concept-card">
              <div className="large-piece">
                {block.type === "summary" ? "✦" : lesson.icon}
              </div>
              <span>
                {block.type === "summary"
                  ? "Una piccola conquista. Un passo avanti."
                  : "Una mossa alla volta."}
              </span>
              {block.type === "summary" && (
                <ul>
                  {lesson.concepts.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        {isBoardBlock(block) && (
          <ActivityBoard
            key={key}
            activity={block.activity}
            guided={block.type === "guided_move"}
            done={done}
            onAttempt={attempt}
          />
        )}
        {block.type === "multiple_choice" && (
          <div className="choices">
            {block.choices.map((c, i) => (
              <button
                disabled={done}
                className={done && i === block.answer ? "correct" : ""}
                key={c}
                onClick={() => {
                  const correct = i === block.answer;
                  attempt(correct);
                  setFeedback(
                    correct
                      ? (block.feedback ?? "Esatto! Hai colto il punto.")
                      : "Non proprio. Ripensa alla regola e prova ancora.",
                  );
                }}
              >
                <span>{String.fromCharCode(65 + i)}</span>
                {c}
                {done && i === block.answer && <b>✓</b>}
              </button>
            ))}
            {feedback && (
              <p
                role="status"
                className={`feedback ${done ? "success" : "error"}`}
              >
                {feedback}
              </p>
            )}
          </div>
        )}
        {done && isBoardBlock(block) && (
          <p className="feedback success">
            ✓ {block.feedback ?? "Attività completata. Puoi proseguire."}
          </p>
        )}
        {hints.length > 0 && !done && (
          <div className="hint-area">
            <button
              className="text-btn"
              onClick={() =>
                update({
                  ...progress,
                  results: {
                    ...progress.results,
                    [key]: {
                      ...(result ?? {
                        attempts: 0,
                        errors: 0,
                        done: false,
                        hints: 0,
                      }),
                      hints: Math.min(hintCount + 1, hints.length),
                    },
                  },
                })
              }
            >
              ☼{" "}
              {hintCount >= hints.length
                ? "Suggerimenti mostrati"
                : "Un piccolo suggerimento"}
            </button>
            {hints.slice(0, hintCount).map((h) => (
              <p key={h}>{h}</p>
            ))}
          </div>
        )}
        <details className="lesson-source">
          <summary>Fonte dei concetti</summary>
          <p>
            {lesson.source} I diagrammi originali sono indicati separatamente.
          </p>
        </details>
      </div>
      <div className="lesson-controls">
        <button
          className="secondary"
          disabled={index === 0}
          onClick={() => go(index - 1)}
        >
          ← Indietro
        </button>
        <button
          className="primary"
          disabled={
            !done && block.type !== "explanation" && block.type !== "summary"
          }
          onClick={next}
        >
          {index === lesson.blocks.length - 1 ? "Concludi" : "Continua"}{" "}
          <span>→</span>
        </button>
      </div>
    </main>
  );
}
