import { getGiftShow } from "./daily-show";
import type { LiveEvent } from "./events";
import type { Command } from "@/lib/presenter/types";

/**
 * Conversational layer for Fio Oculto LIVE.
 * This first stage is deterministic and runs without external credentials.
 * It prepares contextual replies and presenter commands; it does NOT claim to
 * be an LLM or a real TikTok connection. A server-side AI provider can replace
 * the reply strategy later without changing the event contract.
 */
export type ConversationSettings = {
  enabled: boolean;
  personality: "misterioso" | "bem-humorado" | "acolhedor";
  respondToComments: boolean;
  respondToGifts: boolean;
  respondToFollows: boolean;
  respondToLikes: boolean;
  minGapMs: number;
};

export const DEFAULT_CONVERSATION_SETTINGS: ConversationSettings = {
  enabled: true,
  personality: "misterioso",
  respondToComments: true,
  respondToGifts: true,
  respondToFollows: true,
  respondToLikes: false,
  minGapMs: 4500,
};

export type ConversationResult = {
  accepted: boolean;
  reason?: "disabled" | "event-disabled" | "cooldown" | "empty";
  speech?: string;
  caption?: string;
  commands: Command[];
};

const reactions: Record<ConversationSettings["personality"], Record<string, string[]>> = {
  misterioso: {
    comment: ["{user}, essa observação merece entrar no nosso arquivo: {text}", "Interessante, {user}... tem algo nessa mensagem que merece investigação."],
    gift: ["Obrigado pelo presente, {user}. Uma nova pista acaba de chegar ao nosso arquivo."],
    follow: ["Bem-vindo ao Fio Oculto, {user}. A investigação acaba de ganhar companhia."],
    likes: ["Estamos recebendo sinais por aqui. Obrigado pelas curtidas!"],
  },
  "bem-humorado": {
    comment: ["{user}, essa foi direto para o mural de teorias: {text}", "Anotado, {user}! Meu quadro de investigação já está ficando cheio."],
    gift: ["Valeu pelo presente, {user}! Até o mistério ficou mais animado."],
    follow: ["Chegou mais alguém para investigar comigo! Bem-vindo, {user}."],
    likes: ["Esse painel de pistas está ficando movimentado. Obrigado pelas curtidas!"],
  },
  acolhedor: {
    comment: ["Obrigado por participar, {user}. Quero saber mais sobre sua ideia: {text}", "Que bom ter sua voz na conversa, {user}!"],
    gift: ["Muito obrigado pelo carinho, {user}. Que bom ter você com a gente."],
    follow: ["Seja muito bem-vindo, {user}. Fique à vontade para participar!"],
    likes: ["Obrigado por acompanhar e interagir com a live!"],
  },
};

function eventKey(event: LiveEvent) {
  return event.kind;
}

function isEnabled(event: LiveEvent, settings: ConversationSettings) {
  switch (event.kind) {
    case "comment": return settings.respondToComments;
    case "gift": return settings.respondToGifts;
    case "follow": return settings.respondToFollows;
    case "likes": return settings.respondToLikes;
  }
}

function clean(value: string, max = 110) {
  return value.replace(/[\u0000-\u001f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

/** Creates a short, safe, contextual line. No viewer profile/history is persisted. */
export function createConversationReply(
  event: LiveEvent,
  personality: ConversationSettings["personality"] = "misterioso",
  pick: () => number = Math.random,
): string {
  const options = reactions[personality][eventKey(event)];
  const template = options[Math.floor(Math.max(0, Math.min(0.999999, pick())) * options.length)] ?? options[0] ?? "";
  const user = clean(event.user ?? "pessoal", 32) || "pessoal";
  const text = clean(event.text ?? "", 90);
  return template.replaceAll("{user}", user).replaceAll("{text}", text);
}

export function createEventInteraction(
  event: LiveEvent,
  settings: ConversationSettings,
  now = event.at,
  lastSpokenAt = Number.NEGATIVE_INFINITY,
): ConversationResult {
  if (!settings.enabled) return { accepted: false, reason: "disabled", commands: [] };
  if (!isEnabled(event, settings)) return { accepted: false, reason: "event-disabled", commands: [] };
  if (now - lastSpokenAt < settings.minGapMs) return { accepted: false, reason: "cooldown", commands: [] };

  const speech = createConversationReply(event, settings.personality, () => 0);
  if (!speech.trim()) return { accepted: false, reason: "empty", commands: [] };

  const commands: Command[] = [];
  if (event.kind === "comment") commands.push({ type: "tilt" }, { type: "reaction", kind: "detective", source: event.source === "demo" ? "demo" : "live", label: "A investigação do chat começou!" });
  if (event.kind === "gift") {
    const show = getGiftShow(event.giftName ?? "", event.giftId ?? "");
    commands.push(
      { type: "reaction", kind: show.kind, source: event.source === "demo" ? "demo" : "live", label: show.line },
      { type: "expression", value: "happy", durationMs: 2200 },
    );
  }
  if (event.kind === "follow") {
    commands.push({ type: "reaction", kind: "follow", source: event.source === "demo" ? "demo" : "live", label: "Novo seguidor" });
  }
  if (event.kind === "likes") {
    commands.push({ type: "reaction", kind: "like", source: event.source === "demo" ? "demo" : "live", label: "Curtidas" });
  }
  return { accepted: true, speech, caption: speech, commands };
}
