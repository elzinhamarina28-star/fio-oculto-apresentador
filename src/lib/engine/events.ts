/**
 * Event Manager — event model + validation.
 * Every event carries an explicit source. "demo" events are produced only by the
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
  giftId?: string | undefined;
  giftName?: string | undefined;
  diamonds?: number | undefined;
}

export const PRIORITY: Record<string, number> = {
  "gift:legendary": 100,
  "gift:special": 80,
  follow: 60,
  "gift:common": 50,
  comment: 30,
  likes: 20,
};

export function priorityOf(event: LiveEvent): number {
  const key = event.kind === "gift" ? `gift:${event.tier ?? "common"}` : event.kind;
  return PRIORITY[key] ?? 0;
}

export type ValidationResult =
  | { ok: true; event: LiveEvent }
  | { ok: false; error: string };

const KINDS: LiveEventKind[] = ["comment", "likes", "follow", "gift"];
const TIERS: GiftTier[] = ["common", "special", "legendary"];
const SOURCES: EventSource[] = ["demo", "tiktok-live"];

type EventInput = {
  id?: unknown;
  kind?: unknown;
  source?: unknown;
  at?: unknown;
  user?: unknown;
  text?: unknown;
  count?: unknown;
  tier?: unknown;
  giftId?: unknown;
  giftName?: unknown;
  diamonds?: unknown;
};

/** Validates untrusted input (from a provider or the demo panel). */
export function validateEvent(input: unknown): ValidationResult {
  if (!input || typeof input !== "object") return { ok: false, error: "evento inválido" };
  const event = input as EventInput;
  if (typeof event.id !== "string" || !event.id) return { ok: false, error: "id ausente" };
  if (!KINDS.includes(event.kind as LiveEventKind))
    return { ok: false, error: "tipo desconhecido" };
  if (!SOURCES.includes(event.source as EventSource))
    return { ok: false, error: "origem ausente ou desconhecida" };
  if (typeof event.at !== "number" || !Number.isFinite(event.at))
    return { ok: false, error: "data inválida" };
  if (event.user !== undefined && (typeof event.user !== "string" || event.user.length > 64))
    return { ok: false, error: "usuário inválido" };
  if (event.text !== undefined && (typeof event.text !== "string" || event.text.length > 300))
    return { ok: false, error: "texto inválido" };
  if (event.count !== undefined && (typeof event.count !== "number" || event.count < 0))
    return { ok: false, error: "quantidade inválida" };
  if (event.kind === "gift" && !TIERS.includes(event.tier as GiftTier))
    return { ok: false, error: "nível do presente inválido" };
  if (
    event.giftId !== undefined &&
    (typeof event.giftId !== "string" || event.giftId.length > 80)
  )
    return { ok: false, error: "id do presente inválido" };
  if (
    event.giftName !== undefined &&
    (typeof event.giftName !== "string" || event.giftName.length > 80)
  )
    return { ok: false, error: "nome do presente inválido" };
  if (
    event.diamonds !== undefined &&
    (typeof event.diamonds !== "number" ||
      !Number.isFinite(event.diamonds) ||
      event.diamonds < 0 ||
      event.diamonds > 1_000_000)
  )
    return { ok: false, error: "valor do presente inválido" };
  if (event.kind === "comment" && !(typeof event.text === "string" && event.text.trim()))
    return { ok: false, error: "comentário vazio" };

  return {
    ok: true,
    event: {
      id: event.id,
      kind: event.kind as LiveEventKind,
      source: event.source as EventSource,
      at: event.at,
      user: event.user as string | undefined,
      text: (event.text as string | undefined)?.trim(),
      count: event.count as number | undefined,
      tier: event.tier as GiftTier | undefined,
      giftId: event.giftId as string | undefined,
      giftName: event.giftName as string | undefined,
      diamonds: event.diamonds as number | undefined,
    },
  };
}

/** Returns the like milestones crossed when the total goes from prev to next. */
export function crossedMilestones(prev: number, next: number, milestones: number[]): number[] {
  return [...milestones]
    .sort((a, b) => a - b)
    .filter((milestone) => milestone > prev && milestone <= next);
}

export const sourceLabel = (source: EventSource) =>
  source === "demo" ? "Demonstração" : "TikTok LIVE";
