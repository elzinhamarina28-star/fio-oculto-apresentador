/**
 * Presenter rig contract.
 * The current implementation (SpriteRig) animates static image layers with CSS.
 * A future rigged / Live2D renderer only needs to implement `PresenterRenderer`
 * props, consuming the same state + commands, without touching the control panel.
 */
export type Expression = "neutral" | "happy" | "surprised";

export type ReactionKind = "like" | "follow" | "gift";

export interface Reaction {
  id: number;
  kind: ReactionKind;
  /** Origin of the reaction. Only "manual-test" exists until a real live integration is connected. */
  source: "manual-test";
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
  /** Incremented to retrigger one-shot animations. */
  blinkKey: number;
  headGesture: { kind: "nod" | "tilt" | null; key: number };
  reactions: Reaction[];
}

export interface PresenterRendererProps {
  state: PresenterState;
  onReactionDone: (id: number) => void;
}
