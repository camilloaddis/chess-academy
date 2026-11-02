import { openDB } from "idb";
import type { Lesson } from "../lessons/types";
export type Result = {
  attempts: number;
  errors: number;
  done: boolean;
  hints: number;
};
export type Progress = {
  schemaVersion: 1;
  contentVersion: number;
  currentLesson: string;
  positions: Record<string, number>;
  completed: Record<string, number>;
  results: Record<string, Result>;
  review: string[];
};
export const freshProgress = (): Progress => ({
  schemaVersion: 1,
  contentVersion: 1,
  currentLesson: "board",
  positions: {},
  completed: {},
  results: {},
  review: [],
});
export const keyFor = (lesson: Lesson, blockId: string) =>
  `${lesson.id}@${lesson.version}/${blockId}`;
export function recordAttempt(
  p: Progress,
  key: string,
  correct: boolean,
  completed = correct,
): Progress {
  const old = p.results[key] ?? {
    attempts: 0,
    errors: 0,
    done: false,
    hints: 0,
  };
  return {
    ...p,
    results: {
      ...p.results,
      [key]: {
        ...old,
        attempts: old.attempts + 1,
        errors: old.errors + (correct ? 0 : 1),
        done: old.done || completed,
      },
    },
    review: correct
      ? completed && old.errors === 0
        ? p.review.filter((k) => k !== key)
        : p.review
      : p.review.includes(key)
        ? p.review
        : [...p.review, key],
  };
}
export function lessonReady(p: Progress, lesson: Lesson) {
  return lesson.blocks.every((b) => p.results[keyFor(lesson, b.id)]?.done);
}
export function completeLesson(p: Progress, l: Lesson): Progress {
  if (!lessonReady(p, l)) return p;
  return { ...p, completed: { ...p.completed, [l.id]: l.version } };
}
function decode(raw: unknown): Progress {
  if (!raw || typeof raw !== "object") return freshProgress();
  const p = raw as Partial<Progress>;
  if (p.schemaVersion !== 1)
    throw new Error(
      "Versione dei progressi non supportata. I dati sono stati conservati.",
    );
  if (!p.results || !p.positions || !p.completed || !Array.isArray(p.review))
    throw new Error("Progressi non leggibili. I dati sono stati conservati.");
  return p as Progress;
}
const db = () =>
  openDB("chess-academy", 1, {
    upgrade(db) {
      db.createObjectStore("state");
    },
  });
export async function loadProgress() {
  const d = await db();
  return decode(await d.get("state", "progress"));
}
export async function saveProgress(p: Progress) {
  const d = await db();
  await d.put("state", p, "progress");
}
