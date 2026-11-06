/**
 * Presenter rig contract.
 * The renderer keeps animation lightweight and uses CSS + layered image assets.
 */
export type Expression = "neutral" | "happy" | "surprised";

export type ReactionKind =
  | "like" | "follow" | "gift" | "wow" | "laugh" | "dance"
  | "detective" | "suspicious" | "catbite" | "catwalk" | "challenge"
  | "profile" | "hearts" | "confetti" | "spotlight" | "stars" | "rain" | "clues";

export interface Reaction {
  id: number;
  kind: ReactionKind;
  source: "manual-test" | "demo" | "live";
  label?: string;
}

export type Command =
  | { type: "blink" }
  | { type: "nod" }
  | { type: "tilt" }
  | { type: "expression"; value: Expression; durationMs?: number }
  | { type: "reaction"; kind: ReactionKind; source?: "demo" | "live"; label?: string };

export interface PresenterState {
  expression: Expression;
  breathing: boolean;
  autoBlink: boolean;
  idleHead: boolean;
  blinkKey: number;
  headGesture: { kind: "nod" | "tilt" | null; key: number };
  reactions: Reaction[];
}

export interface PresenterRendererProps {
  state: PresenterState;
  onReactionDone: (id: number) => void;
}
