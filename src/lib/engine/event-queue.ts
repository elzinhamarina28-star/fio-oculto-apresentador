import { priorityOf, type LiveEvent } from "./events";

/** Event Queue — priority ordering, de-duplication and per-kind rate limiting. */
export interface QueueOptions {
  dedupeWindowMs: number;
  /** Minimum gap between accepted events of the same kind (and tier). */
  minIntervalMs: Partial<Record<string, number>>;
  maxSize: number;
}

export const DEFAULT_QUEUE_OPTIONS: QueueOptions = {
  dedupeWindowMs: 10_000,
  minIntervalMs: { comment: 1500, likes: 3000, follow: 500 },
  maxSize: 50,
};

export type EnqueueResult = "accepted" | "duplicate" | "throttled" | "full";

export class EventQueue {
  private items: { e: LiveEvent; seq: number }[] = [];
  private seen = new Map<string, number>();
  private lastByKey = new Map<string, number>();
  private seq = 0;
  constructor(private opts: QueueOptions = DEFAULT_QUEUE_OPTIONS) {}

  enqueue(e: LiveEvent, now = Date.now()): EnqueueResult {
    for (const [id, t] of this.seen) if (now - t > this.opts.dedupeWindowMs) this.seen.delete(id);
    if (this.seen.has(e.id)) return "duplicate";
    const key = e.kind === "gift" ? `gift:${e.tier}` : e.kind;
    const gap = this.opts.minIntervalMs[key] ?? 0;
    const last = this.lastByKey.get(key);
    if (gap && last !== undefined && now - last < gap) return "throttled";
    if (this.items.length >= this.opts.maxSize) {
      // Drop the lowest-priority item if the newcomer outranks it.
      const lowest = this.items.reduce((a, b) => (priorityOf(a.e) <= priorityOf(b.e) ? a : b));
      if (priorityOf(lowest.e) >= priorityOf(e)) return "full";
      this.items = this.items.filter((x) => x !== lowest);
    }
    this.seen.set(e.id, now);
    this.lastByKey.set(key, now);
    this.items.push({ e, seq: this.seq++ });
    return "accepted";
  }

  next(): LiveEvent | undefined {
    if (!this.items.length) return undefined;
    let best = 0;
    for (let i = 1; i < this.items.length; i++) {
      const a = this.items[i], b = this.items[best];
      if (priorityOf(a.e) > priorityOf(b.e) || (priorityOf(a.e) === priorityOf(b.e) && a.seq < b.seq)) best = i;
    }
    return this.items.splice(best, 1)[0].e;
  }

  snapshot(): LiveEvent[] {
    return [...this.items]
      .sort((a, b) => priorityOf(b.e) - priorityOf(a.e) || a.seq - b.seq)
      .map((x) => x.e);
  }

  clear() {
    this.items = [];
  }

  get size() {
    return this.items.length;
  }
}
