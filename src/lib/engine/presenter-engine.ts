import type { Command, Expression, ReactionKind } from "@/lib/presenter/types";
import type { GiftTier, LiveEvent } from "./events";

/**
 * Presenter Engine — personality + event-to-behavior mapping.
 * Persona: Brazilian Portuguese, mysterious, smart, playful, spontaneous.
 * Lines are script templates, never fabricated viewer data.
 */
export interface GiftReactionConfig {
  expression: Expression;
  gesture: "nod" | "tilt";
  label: string;
}

export type GiftConfig = Record<GiftTier, GiftReactionConfig>;

export const DEFAULT_GIFT_CONFIG: GiftConfig = {
  common: { expression: "happy", gesture: "nod", label: "Presente" },
  special: { expression: "surprised", gesture: "tilt", label: "Presente especial" },
  legendary: { expression: "surprised", gesture: "tilt", label: "Presente lendário" },
};

const LINES: Record<string, string[]> = {
  comment: ["{user} disse: \"{text}\". Hm… anotado no dossiê.", "Interessante, {user}. \"{text}\"… isso muda alguma coisa."],
  likes: ["{count} curtidas. O fio está ficando mais visível.", "Chegamos a {count} curtidas. Alguém está prestando atenção."],
  follow: ["{user}, bem-vindo ao Fio Oculto. Agora você também sabe demais.", "Mais um investigador na sala: {user}."],
  "gift:common": ["Obrigado pelo presente, {user}. Vou guardar como prova.", "{user}, gentileza registrada."],
  "gift:special": ["{user}! Isso não estava nos meus arquivos…", "Um presente especial de {user}. Suspeito… e generoso."],
  "gift:legendary": ["{user}… um presente lendário. O caso acaba de mudar de nível.", "Pausa tudo. {user} acabou de abrir uma porta secreta."],
};

export const SPONTANEOUS_LINES = [
  "Vocês já repararam que todo mistério começa com um detalhe que ninguém quis ver?",
  "Fiquem atentos aos detalhes. Eu sempre fico.",
  "Comentem o que vocês acham. Eu leio tudo… ou quase tudo.",
];

function fill(t: string, e: LiveEvent) {
  return t
    .replace("{user}", e.user || "alguém")
    .replace("{text}", e.text ?? "")
    .replace("{count}", String(e.count ?? ""));
}

export interface PresenterReaction {
  commands: Command[];
  speech: string;
}

export function reactTo(e: LiveEvent, gifts: GiftConfig, pick = Math.random): PresenterReaction {
  const key = e.kind === "gift" ? `gift:${e.tier}` : e.kind;
  const options = LINES[key] ?? [""];
  const speech = fill(options[Math.floor(pick() * options.length) % options.length] ?? "", e);
  const source = e.source === "demo" ? "demo" : "live";
  const commands: Command[] = [];
  const reaction = (kind: ReactionKind, label: string) =>
    commands.push({ type: "reaction", kind, source, label });

  switch (e.kind) {
    case "comment":
      commands.push({ type: "tilt" });
      break;
    case "likes":
      reaction("like", `${e.count ?? ""} curtidas`);
      break;
    case "follow":
      reaction("follow", e.user ? `Novo seguidor · ${e.user}` : "Novo seguidor");
      break;
    case "gift": {
      const g = gifts[e.tier ?? "common"];
      reaction("gift", e.user ? `${g.label} · ${e.user}` : g.label);
      commands.push({ type: g.gesture }, { type: "expression", value: g.expression, durationMs: e.tier === "legendary" ? 4000 : 2200 });
      break;
    }
  }
  return { commands, speech };
}
