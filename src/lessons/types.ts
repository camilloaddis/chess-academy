export type MoveActivity = {
  fen: string;
  orientation: "white" | "black";
  /** One accepted UCI alternative list per ply, including the promotion suffix. */
  moves: string[][];
  comments?: string[];
  hints: string[];
  completion: "sequence" | "checkmate";
};
type Base = {
  id: string;
  title: string;
  text: string;
  feedback?: string;
  diagram?: { fen: string; orientation: "white" | "black"; provenance: string };
};
export type Block =
  | (Base & { type: "explanation" | "summary" })
  | (Base & {
      type: "multiple_choice";
      choices: string[];
      answer: number;
      hints: string[];
    })
  | (Base & {
      type: "guided_move" | "find_move" | "practice";
      activity: MoveActivity;
    });
export type Lesson = {
  id: string;
  version: number;
  title: string;
  subtitle: string;
  minutes: number;
  icon: string;
  kind: string;
  concepts: string[];
  source: string;
  blocks: Block[];
};
export const isBoardBlock = (
  b: Block,
): b is Extract<Block, { activity: MoveActivity }> => "activity" in b;
