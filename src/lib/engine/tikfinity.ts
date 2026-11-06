import type { LiveEventProvider } from "./integration-adapter";
import { findGift } from "./gifts";

/**
 * TikFinity provider (real events, no simulation).
 * TikFinity Desktop exposes a local WebSocket on the same computer as the overlay.
 * Messages follow { event, data }; payloads may use top-level or nested user fields.
 */
export const TIKFINITY_DEFAULT_URL = "ws://localhost:21213/";

type Raw = { event?: string; data?: Record<string, unknown> };
const str = (value: unknown) => (typeof value === "string" ? value : undefined);
const num = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : undefined);
const asId = (value: unknown) => {
  if (typeof value === "string" && value.length) return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return undefined;
};

let seq = 0;
let accumulatedLikes = 0;

/** Converts one TikFinity message into a raw LiveEvent (validated later by the adapter). */
export function mapTikfinity(msg: Raw, now = Date.now()): Record<string, unknown> | null {
  const data = msg.data ?? {};
  const nestedUser =
    data["user"] && typeof data["user"] === "object"
      ? (data["user"] as Record<string, unknown>)
      : {};
  const user =
    str(data["nickname"]) ||
    str(data["uniqueId"]) ||
    str(nestedUser["nickname"]) ||
    str(nestedUser["uniqueId"]);
  const base = { source: "tiktok-live", at: now, user: user?.slice(0, 64) };
  const id = (kind: string) => "tt-" + kind + "-" + (asId(data["msgId"]) ?? now + "-" + seq++);

  switch (msg.event) {
    case "chat": {
      const text = str(data["comment"]);
      return text ? { ...base, id: id("c"), kind: "comment", text: text.slice(0, 300) } : null;
    }
    case "like": {
      const total =
        num(data["totalLikeCount"]) ??
        num(data["totalLikes"]) ??
        num(data["totalCount"]);
      const count = num(data["likeCount"]) ?? num(data["count"]) ?? 1;
      accumulatedLikes = total ?? accumulatedLikes + count;
      return { ...base, id: id("l"), kind: "likes", count: accumulatedLikes };
    }
    case "follow":
      return { ...base, id: id("f"), kind: "follow" };
    case "social": {
      const action = (str(data["action"]) ?? str(data["displayType"]) ?? "").toLowerCase();
      return action.includes("follow") ? { ...base, id: id("f"), kind: "follow" } : null;
    }
    case "gift": {
      // Streakable gifts send many updates; react only when the streak ends.
      if (num(data["giftType"]) === 1 && data["repeatEnd"] === false) return null;
      const name = str(data["giftName"]);
      const diamonds = num(data["diamondCount"]) ?? 1;
      const gift = findGift(name, diamonds);
      return {
        ...base,
        id: id("g"),
        kind: "gift",
        tier: gift.tier,
        count: num(data["repeatCount"]) ?? 1,
        giftId: asId(data["giftId"]) ?? gift.id,
        giftName: name?.slice(0, 60) ?? gift.name,
        diamonds,
      };
    }
    default:
      return null;
  }
}

export class TikfinityProvider implements LiveEventProvider {
  readonly id = "tikfinity";
  readonly source = "tiktok-live" as const;
  private ws: WebSocket | null = null;
  onLost: ((reason: string) => void) | null = null;

  constructor(private url = TIKFINITY_DEFAULT_URL) {}

  connect(emit: (raw: unknown) => void) {
    return new Promise<void>((resolve, reject) => {
      let opened = false;
      const ws = new WebSocket(this.url);
      const timeout = setTimeout(() => {
        if (!opened && this.ws === ws) {
          this.ws = null;
          ws.close();
          reject(new Error("Tempo esgotado ao procurar o TikFinity em localhost:21213."));
        }
      }, 8000);
      this.ws = ws;
      ws.onopen = () => {
        opened = true;
        clearTimeout(timeout);
        resolve();
      };
      ws.onerror = () => {
        if (!opened) {
          clearTimeout(timeout);
          reject(new Error("TikFinity não encontrado neste computador."));
        }
      };
      ws.onclose = () => {
        clearTimeout(timeout);
        if (this.ws !== ws) return;
        this.ws = null;
        if (opened) this.onLost?.("TikFinity fechou a conexão");
      };
      ws.onmessage = (event) => {
        try {
          const mapped = mapTikfinity(JSON.parse(String(event.data)) as Raw);
          if (mapped) emit(mapped);
        } catch {
          // Ignore malformed frames and TikFinity's non-event handshake messages.
        }
      };
    });
  }

  async disconnect() {
    const ws = this.ws;
    this.ws = null;
    ws?.close();
  }
}
