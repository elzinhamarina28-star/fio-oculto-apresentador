/**
 * Event Manager — event model + validation.
 * Every event carries an explicit `source`. "demo" events are produced only by the
 * demonstration panel and must never be presented as real TikTok LIVE events.
 */
export type EventSource = "demo" | "tiktok-live";
export type GiftTier = "common" | "special" | "legendary";
export type LiveEventKind = "comment" | "likes" | "follow" | "gift";

export interface LiveEvent {
  id: string;
  kind: LiveEventKind;
  source: EventSource;
  at: number;
  user?: string | undefined;
  text?: string | undefined;
  /** likes: milestone reached; gift: amount */
  count?: number | undefined;
  tier?: GiftTier | undefined;
  /** Provider gift identity; used to select a unique reaction per gift. */
  giftId?: string | undefined;
  giftName?: string | undefined;
}

export const PRIORITY: Record<string, number> = {
  "gift:legendary": 100,
  "gift:special": 80,
  follow: 60,
  "gift:common": 50,
  comment: 30,
  likes: 20,
};

export function priorityOf(e: LiveEvent): number {
  const key = e.kind === "gift" ? `gift:${e.tier ?? "common"}` : e.kind;
  return PRIORITY[key] ?? 0;
}

export type ValidationResult = { ok: true; event: LiveEvent } | { ok: false; error: string };

const KINDS: LiveEventKind[] = ["comment", "likes", "follow", "gift"];
const TIERS: GiftTier[] = ["common", "special", "legendary"];
const SOURCES: EventSource[] = ["demo", "tiktok-live"];

/** Validates untrusted input (from a provider or the demo panel). */
export function validateEvent(input: unknown): ValidationResult {
  if (!input || typeof input !== "object") return { ok: false, error: "evento inválido" };
  const e = input as { [K in "id"|"kind"|"source"|"at"|"user"|"text"|"count"|"tier"|"giftId"|"giftName"]?: unknown };
  if (typeof e.id !== "string" || !e.id) return { ok: false, error: "id ausente" };
  if (!KINDS.includes(e.kind as LiveEventKind)) return { ok: false, error: "tipo desconhecido" };
  if (!SOURCES.includes(e.source as EventSource)) return { ok: false, error: "origem ausente ou desconhecida" };
  if (typeof e.at !== "number" || !Number.isFinite(e.at)) return { ok: false, error: "data inválida" };
  if (e.user !== undefined && (typeof e.user !== "string" || e.user.length > 64))
    return { ok: false, error: "usuário inválido" };
  if (e.text !== undefined && (typeof e.text !== "string" || e.text.length > 300))
    return { ok: false, error: "texto inválido" };
  if (e.count !== undefined && (typeof e.count !== "number" || e.count < 0))
    return { ok: false, error: "quantidade inválida" };
  if (e.giftId !== undefined && (typeof e.giftId !== "string" || e.giftId.length > 80)) return { ok: false, error: "id do presente inválido" };
  if (e.giftName !== undefined && (typeof e.giftName !== "string" || e.giftName.length > 80)) return { ok: false, error: "nome do presente inválido" };
  if (e.kind === "gift" && !TIERS.includes(e.tier as GiftTier)) return { ok: false, error: "nível do presente inválido" };
  if (e.kind === "comment" && !(typeof e.text === "string" && e.text.trim())) return { ok: false, error: "comentário vazio" };
  return {
    ok: true,
    event: {
      id: e.id,
      kind: e.kind as LiveEventKind,
      source: e.source as EventSource,
      at: e.at,
      user: e.user as string | undefined,
      text: (e.text as string | undefined)?.trim(),
      count: e.count as number | undefined,
      tier: e.tier as GiftTier | undefined,
      giftId: e.giftId as string | undefined,
      giftName: e.giftName as string | undefined,
    },
  };
}

/** Returns the like milestones crossed when the total goes from `prev` to `next`. */
export function crossedMilestones(prev: number, next: number, milestones: number[]): number[] {
  return [...milestones].sort((a, b) => a - b).filter((m) => m > prev && m <= next);
}

export const sourceLabel = (s: EventSource) => (s === "demo" ? "Demonstração" : "TikTok LIVE");
