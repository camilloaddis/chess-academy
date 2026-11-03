import { it, expect } from "vitest";
import { Chess } from "chess.js";
import {
  linePositions,
  referenceAnnotations,
  referenceHash,
} from "../src/annotations/model";
it("validates lines and restores canonical starting position", () => {
  const l = linePositions(new Chess().fen(), ["e2e4", "e7e5", "Nf3"]);
  expect(l.san).toEqual(["e4", "e5", "Nf3"]);
  expect(l.positions).toHaveLength(4);
  expect(() => linePositions(new Chess().fen(), ["e2e5"])).toThrow();
});
it("binds verified reconstructions only to exact PDF edition", () => {
  expect(referenceAnnotations("other")).toEqual([]);
  const a = referenceAnnotations(referenceHash);
  expect(a.map((x) => x.page)).toEqual([14, 41, 42]);
  expect(new Chess(a[1].fen).isCheckmate()).toBe(true);
  expect(new Chess(a[2].fen).isCheckmate()).toBe(true);
  expect(
    a.every((x) => !x.moves.length && x.provenance === "reconstructed"),
  ).toBe(true);
});
