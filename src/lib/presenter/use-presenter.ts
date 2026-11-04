import { useCallback, useEffect, useRef, useState } from "react";
import type { Command, Expression, PresenterState, ReactionKind } from "./types";

const REACTION_EXPRESSION: Record<ReactionKind, Expression> = {
  like: "happy",
  follow: "happy",
  gift: "surprised",
};

export function usePresenter() {
  const [state, setState] = useState<PresenterState>({
    expression: "neutral",
    breathing: true,
    autoBlink: true,
    idleHead: true,
    blinkKey: 0,
    headGesture: { kind: null, key: 0 },
    reactions: [],
  });
  const exprTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextId = useRef(1);

  const setExpression = useCallback((value: Expression, durationMs = 2200) => {
    if (exprTimer.current) clearTimeout(exprTimer.current);
    setState((s) => ({ ...s, expression: value }));
    if (value !== "neutral" && durationMs > 0) {
      exprTimer.current = setTimeout(
        () => setState((s) => ({ ...s, expression: "neutral" })),
        durationMs,
      );
    }
  }, []);

  const dispatch = useCallback(
    (cmd: Command) => {
      switch (cmd.type) {
        case "blink":
          setState((s) => ({ ...s, blinkKey: s.blinkKey + 1 }));
          break;
        case "nod":
        case "tilt":
          setState((s) => ({
            ...s,
            headGesture: { kind: cmd.type as "nod" | "tilt", key: s.headGesture.key + 1 },
          }));
          break;
        case "expression":
          setExpression(cmd.value, cmd.durationMs);
          break;
        case "reaction": {
          const id = nextId.current++;
          setState((s) => ({
            ...s,
            reactions: [...s.reactions, { id, kind: cmd.kind, source: "manual-test" }],
            headGesture: {
              kind: cmd.kind === "gift" ? "tilt" : "nod",
              key: s.headGesture.key + 1,
            },
          }));
          setExpression(REACTION_EXPRESSION[cmd.kind]);
          break;
        }
      }
    },
    [setExpression],
  );

  // Natural random blinking
  useEffect(() => {
    if (!state.autoBlink) return;
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(() => {
        dispatch({ type: "blink" });
        loop();
      }, 2500 + Math.random() * 3500);
    };
    loop();
    return () => clearTimeout(t);
  }, [state.autoBlink, dispatch]);

  useEffect(() => () => {
    if (exprTimer.current) clearTimeout(exprTimer.current);
  }, []);

  const toggle = useCallback((key: "breathing" | "autoBlink" | "idleHead") => {
    setState((s) => ({ ...s, [key]: !s[key] }));
  }, []);

  const removeReaction = useCallback((id: number) => {
    setState((s) => ({ ...s, reactions: s.reactions.filter((r) => r.id !== id) }));
  }, []);

  return { state, dispatch, toggle, removeReaction };
}
