import type { Expression } from "@/lib/presenter/types";
import type { GiftTier } from "./events";

/**
 * Gift registry. To add a TikTok gift, add one entry here — nothing else changes.
 * `match` lists the gift names as they arrive from TikTok (case-insensitive).
 * Unknown gifts fall back by diamond value to a tier default.
 */
export type GiftAnimation = "nod" | "tilt" | "jump" | "spin" | "shake";
export type StageEffect = "confetti" | "hearts" | "stars" | "rain" | "spotlight" | "cat-bite" | "cat-walk" | "clues-fall";
export type SfxName = "pop" | "chime" | "fanfare" | "boom" | "meow" | "whoosh";

export interface GiftReaction {
  id: string;
  name: string;
  match: string[];
  tier: GiftTier;
  icon: string;
  animation: GiftAnimation;
  expression: Expression;
  effect: StageEffect;
  sfx?: SfxName;
  /** Guidance for the AI line (never shown as fact). */
  hint: string;
  /** Used when the AI is unavailable. {user} is replaced. */
  fallback: string;
}

export const GIFTS: GiftReaction[] = [
  { id: "rose", name: "Rosa", match: ["rose", "rosa"], tier: "common", icon: "🌹", animation: "nod", expression: "happy", effect: "hearts", sfx: "pop",
    hint: "fique romântico de forma exagerada e cômica", fallback: "Uma rosa de {user}! Vou guardar como prova de afeto." },
  { id: "tiktok", name: "TikTok", match: ["tiktok"], tier: "common", icon: "♪", animation: "nod", expression: "happy", effect: "stars", sfx: "pop",
    hint: "agradeça como se fosse uma pista secreta", fallback: "{user} mandou um sinal. Anotado no dossiê." },
  { id: "finger-heart", name: "Coração com os dedos", match: ["finger heart", "coração com os dedos"], tier: "common", icon: "🫰", animation: "tilt", expression: "happy", effect: "hearts", sfx: "chime",
    hint: "fique tímido e derretido, de brincadeira", fallback: "{user}, assim eu fico sem graça… o gato está com ciúmes." },
  { id: "doughnut", name: "Rosquinha", match: ["doughnut", "donut", "rosquinha"], tier: "common", icon: "🍩", animation: "jump", expression: "happy", effect: "cat-walk", sfx: "meow",
    hint: "o gato tenta roubar a rosquinha", fallback: "Obrigado pela rosquinha, {user}! Ei, gato, larga isso!" },
  { id: "cat-paw", name: "Patinha", match: ["cat paw", "paw", "pata de gato", "patinha"], tier: "common", icon: "🐾", animation: "shake", expression: "surprised", effect: "cat-bite", sfx: "meow",
    hint: "o gato interrompe o apresentador e tenta roubar o presente", fallback: "{user}, você chamou o gato?! Ele já está mordendo meu braço!" },
  { id: "perfume", name: "Perfume", match: ["perfume"], tier: "special", icon: "✧", animation: "spin", expression: "surprised", effect: "spotlight", sfx: "chime",
    hint: "diga que o perfume revelou uma pista misteriosa", fallback: "Perfume de {user}… esse cheiro é de mistério resolvido." },
  { id: "galaxy", name: "Galáxia", match: ["galaxy", "galáxia"], tier: "special", icon: "🌌", animation: "shake", expression: "surprised", effect: "stars", sfx: "whoosh",
    hint: "reaja como se tivesse sido abduzido", fallback: "{user} mandou uma galáxia! Estou vendo o universo inteiro daqui." },
  { id: "lion", name: "Leão", match: ["lion", "leão"], tier: "legendary", icon: "🦁", animation: "shake", expression: "surprised", effect: "confetti", sfx: "fanfare",
    hint: "reação extremamente exagerada, o gato se assusta e derruba as pistas", fallback: "UM LEÃO?! {user}, você acabou de virar lenda do Fio Oculto!" },
  { id: "universe", name: "Universo", match: ["universe", "universo", "tiktok universe"], tier: "legendary", icon: "🪐", animation: "spin", expression: "surprised", effect: "confetti", sfx: "boom",
    hint: "o caso inteiro muda de nível, reação dramática de filme", fallback: "Pausa tudo. {user} mandou o UNIVERSO. O caso mudou de nível." },
];

export const TIER_DEFAULTS: Record<GiftTier, Omit<GiftReaction, "id" | "name" | "match">> = {
  common: { tier: "common", icon: "✦", animation: "nod", expression: "happy", effect: "stars", sfx: "pop",
    hint: "agradeça com carinho e uma piada", fallback: "Obrigado pelo presente, {user}!" },
  special: { tier: "special", icon: "✦", animation: "tilt", expression: "surprised", effect: "spotlight", sfx: "chime",
    hint: "fique surpreso e generoso nos elogios", fallback: "{user}, isso não estava nos meus arquivos!" },
  legendary: { tier: "legendary", icon: "✦", animation: "shake", expression: "surprised", effect: "confetti", sfx: "fanfare",
    hint: "reação exagerada e teatral", fallback: "{user}… um presente lendário! O estúdio inteiro tremeu." },
};

/** TikTok diamond value → tier. */
export function tierForDiamonds(diamonds: number): GiftTier {
  if (diamonds >= 1000) return "legendary";
  if (diamonds >= 100) return "special";
  return "common";
}

function normalizeGiftName(value: string): string {
  return value.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").trim().toLowerCase().replace(/\\s+/g, " ");
}

export function findGift(name: string | undefined, diamonds = 1): GiftReaction {
  const n = normalizeGiftName(name ?? "");
  const hit = n ? GIFTS.find((g) => g.match.some((m) => normalizeGiftName(m) === n)) : undefined;
  if (hit) return hit;
  const tier = tierForDiamonds(diamonds);
  return { id: `unknown:${n || tier}`, name: name?.trim() || "Presente", match: [], ...TIER_DEFAULTS[tier] };
}
