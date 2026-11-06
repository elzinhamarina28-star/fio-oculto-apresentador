import type { LiveEventProvider } from "./integration-adapter";
import { findGift } from "./gifts";

/**
 * TikFinity provider (real events, no simulation).
 * TikFinity's desktop app, logged in to the streamer's TikTok account and connected
 * to the LIVE, exposes events on a local WebSocket (default ws://localhost:21213/).
 * This browser page connects to it directly — no credentials leave the PC.
 * Messages follow the TikTok-Live-Connector shape: { event, data }.
 */
export const TIKFINITY_DEFAULT_URL = "ws://localhost:21213/";

type Raw = { event?: string; data?: Record<string, unknown> };
const str = (v: unknown) => (typeof v === "string" ? v : undefined);
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);

let seq = 0;

/** Converts one TikFinity message into a raw LiveEvent (validated later by the adapter). */
export function mapTikfinity(msg: Raw, now = Date.now()): Record<string, unknown> | null {
  const d = msg.data ?? {};
  const user = str(d["nickname"]) || str(d["uniqueId"]);
  const base = { source: "tiktok-live", at: now, user: user?.slice(0, 64) };
  const id = (k: string) => `tt-${k}-${str(d["msgId"]) ?? `${now}-${seq++}`}`;
  switch (msg.event) {
    case "chat": {
      const text = str(d["comment"]);
      return text ? { ...base, id: id("c"), kind: "comment", text: text.slice(0, 300) } : null;
    }
    case "like": {
      const total = num(d["totalLikeCount"]);
      return total === undefined ? null : { ...base, id: id("l"), kind: "likes", count: total };
    }
    case "follow":
      return { ...base, id: id("f"), kind: "follow" };
    case "social":
      return str(d["displayType"])?.includes("follow") ? { ...base, id: id("f"), kind: "follow" } : null;
    case "gift": {
      // Streakable gifts (giftType 1) send many updates; react only when the streak ends.
      if (num(d["giftType"]) === 1 && d["repeatEnd"] === false) return null;
      const name = str(d["giftName"]);
      const diamonds = num(d["diamondCount"]) ?? 1;
      const g = findGift(name, diamonds);
      return { ...base, id: id("g"), kind: "gift", tier: g.tier, count: num(d["repeatCount"]) ?? 1, text: name?.slice(0, 60) };
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
      this.ws = ws;
      ws.onopen = () => { opened = true; resolve(); };
      ws.onerror = () => { if (!opened) reject(new Error("TikFinity não encontrado neste computador")); };
      ws.onclose = () => {
        if (this.ws !== ws) return;
        this.ws = null;
        if (opened) this.onLost?.("TikFinity fechou a conexão");
      };
      ws.onmessage = (ev) => {
        try {
          const ev2 = mapTikfinity(JSON.parse(String(ev.data)) as Raw);
          if (ev2) emit(ev2);
        } catch { /* ignore malformed frames */ }
      };
    });
  }

  async disconnect() {
    const ws = this.ws;
    this.ws = null;
    ws?.close();
  }
}
