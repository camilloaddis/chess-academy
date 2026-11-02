import { describe, it, expect } from "vitest";
import { Chess } from "chess.js";
import { lessons } from "../src/content/unit";
import { evaluateMove } from "../src/engine/chess";
import { isBoardBlock, type MoveActivity } from "../src/lessons/types";
import {
  completeLesson,
  freshProgress,
  keyFor,
  recordAttempt,
  lessonReady,
} from "../src/persistence/progress";
const activity = (
  fen: string,
  moves: string[][],
  completion: "sequence" | "checkmate" = "sequence",
): MoveActivity => ({
  fen,
  moves,
  completion,
  orientation: "white",
  hints: [],
});
describe("contenuti", () => {
  it("ha ID stabili univoci e tutte le sequenze e alternative legali", () => {
    const ids = new Set<string>();
    for (const l of lessons)
      for (const b of l.blocks) {
        expect(ids.has(b.id)).toBe(false);
        ids.add(b.id);
        if (b.diagram) {
          expect(new Chess(b.diagram.fen).isCheckmate()).toBe(true);
        }
        if (!isBoardBlock(b)) continue;
        const activity = b.activity;
        function walk(fen: string, ply: number) {
          for (const u of activity.moves[ply]) {
            const g = new Chess(fen);
            expect(() =>
              g.move({
                from: u.slice(0, 2),
                to: u.slice(2, 4),
                promotion: u[4],
              }),
            ).not.toThrow();
            if (ply + 1 < activity.moves.length) walk(g.fen(), ply + 1);
            else if (activity.completion === "checkmate")
              expect(g.isCheckmate()).toBe(true);
          }
        }
        walk(b.activity.fen, 0);
      }
  });
});
describe("motore", () => {
  const fen = new Chess().fen(),
    a = activity(fen, [["e2e4"]]);
  it("rifiuta le mosse illegali e conserva la posizione", () => {
    expect(evaluateMove(fen, "e2", "e5", "q", a, 0).kind).toBe("illegal");
    expect(new Chess(fen).fen()).toBe(fen);
  });
  it("distingue una mossa legale fuori obiettivo", () => {
    expect(evaluateMove(fen, "d2", "d4", "q", a, 0).kind).toBe("incorrect");
  });
  it("accetta alternative esplicite", () => {
    expect(
      evaluateMove(fen, "d2", "d4", "q", activity(fen, [["e2e4", "d2d4"]]), 0)
        .kind,
    ).toBe("correct");
  });
  it.each([
    ["arrocco", "r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1", "e1g1"],
    ["en passant", "7k/8/8/3pP3/8/8/8/4K3 w - d6 0 2", "e5d6"],
    ["promozione", "7k/P7/8/8/8/8/8/4K3 w - - 0 1", "a7a8q"],
    ["sottopromozione", "7k/P7/8/8/8/8/8/4K3 w - - 0 1", "a7a8n"],
  ])("gestisce %s", (_, f, u) => {
    const r = evaluateMove(
      f,
      u.slice(0, 2),
      u.slice(2, 4),
      (u[4] ?? "q") as "q" | "n",
      activity(f, [[u]]),
      0,
    );
    expect(r.kind).toBe("correct");
    if (r.kind === "correct") expect(r.complete).toBe(true);
  });
  it("impedisce di lasciare il re sotto scacco", () => {
    const f = "k3r3/8/8/8/8/8/8/4K3 w - - 0 1";
    expect(
      evaluateMove(f, "e1", "e2", "q", activity(f, [["e1e2"]]), 0).kind,
    ).toBe("illegal");
  });
  it("verifica davvero il matto", () => {
    const f = "7k/8/5KQ1/8/8/8/8/8 w - - 0 1";
    expect(
      evaluateMove(f, "g6", "g7", "q", activity(f, [["g6g7"]], "checkmate"), 0)
        .kind,
    ).toBe("correct");
    expect(
      evaluateMove(f, "g6", "g5", "q", activity(f, [["g6g5"]], "checkmate"), 0)
        .kind,
    ).toBe("incorrect");
  });
});
describe("progressione", () => {
  it("non completa lezioni solo visualizzate o parziali", () => {
    let p = freshProgress();
    const l = lessons[0];
    expect(completeLesson(p, l).completed).toEqual({});
    p = recordAttempt(p, keyFor(l, l.blocks[0].id), true);
    expect(lessonReady(p, l)).toBe(false);
  });
  it("conta errori e tentativi e aggiunge il ripasso una sola volta", () => {
    let p = freshProgress();
    p = recordAttempt(p, "test", false);
    p = recordAttempt(p, "test", false);
    p = recordAttempt(p, "test", true);
    expect(p.results.test).toMatchObject({
      attempts: 3,
      errors: 2,
      done: true,
    });
    expect(p.review).toEqual(["test"]);
  });
  it("non segna errore una semimossa corretta di una sequenza incompleta", () => {
    const p = recordAttempt(freshProgress(), "multi", true, false);
    expect(p.results.multi).toMatchObject({
      attempts: 1,
      errors: 0,
      done: false,
    });
  });
  it("rimuove dal ripasso solo una nuova soluzione senza errori", () => {
    let p = recordAttempt(freshProgress(), "r", false);
    p = recordAttempt(p, "r", true);
    expect(p.review).toEqual(["r"]);
    p = { ...p, results: {} };
    p = recordAttempt(p, "r", true);
    expect(p.review).toEqual([]);
  });
  it("completa solo tutte le attività della stessa versione", () => {
    let p = freshProgress();
    const l = lessons[0];
    for (const b of l.blocks) p = recordAttempt(p, keyFor(l, b.id), true);
    expect(completeLesson(p, l).completed.board).toBe(1);
    expect(lessonReady(p, { ...l, version: 2 })).toBe(false);
  });
});

describe('catalogo esteso', () => {
  it('mantiene le quattro lezioni originali e copre ogni unità senza duplicati', async () => {
    const { courseUnits } = await import('../src/content/course');
    expect(lessons).toHaveLength(60);
    expect(lessons.slice(0, 4).map(l => [l.id, l.version])).toEqual([
      ['board', 1], ['pieces', 1], ['check', 1], ['mate', 1],
    ]);
    const ids = courseUnits.flatMap(unit => unit.ids);
    expect(new Set(ids).size).toBe(lessons.length);
    expect(new Set(ids)).toEqual(new Set(lessons.map(l => l.id)));
    for (const lesson of lessons) {
      for (const block of lesson.blocks) {
        if (block.type === 'multiple_choice') {
          expect(block.answer).toBeGreaterThanOrEqual(0);
          expect(block.answer).toBeLessThan(block.choices.length);
        }
      }
    }
  });
  it('verifica i bersagli dichiarati negli esempi tattici e l’opposizione', () => {
    function result(id: string) {
      const lesson = lessons.find(l => l.id === id)!;
      const block = lesson.blocks.find(isBoardBlock)!;
      const game = new Chess(block.activity.fen);
      for (const alternatives of block.activity.moves) {
        const u = alternatives[0];
        game.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] });
      }
      return game;
    }
    const fork = result('fork');
    expect(fork.isAttacked('d8', 'w')).toBe(true);
    expect(fork.isAttacked('h8', 'w')).toBe(true);
    const pin = result('pin');
    expect(pin.moves({ square: 'f6' })).toEqual([]);
    expect(result('skewer').isCheck()).toBe(true);
    expect(result('discovered').isCheck()).toBe(true);
    const opposition = result('opposition');
    expect(opposition.get('e5')).toEqual({ type: 'k', color: 'w' });
    expect(opposition.get('e7')).toEqual({ type: 'k', color: 'b' });
    expect(opposition.turn()).toBe('b');
  });
});
