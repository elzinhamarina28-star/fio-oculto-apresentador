import { describe, expect, it } from "vitest";
import { crossedMilestones, validateEvent } from "@/lib/engine/events";
import { EventQueue } from "@/lib/engine/event-queue";
import type { LiveEvent } from "@/lib/engine/events";

const event = (overrides: Partial<LiveEvent> = {}): LiveEvent => ({
  id: "event-1",
  kind: "comment",
  source: "demo",
  at: 1_000,
  user: "Investigador",
  text: "Tenho uma pista!",
  ...overrides,
});

describe("Live event validation", () => {
  it("accepts a valid demonstration comment", () => {
    expect(validateEvent(event()).ok).toBe(true);
  });

  it("rejects oversized comments and unknown sources", () => {
    expect(validateEvent(event({ text: "x".repeat(301) })).ok).toBe(false);
    expect(validateEvent({ ...event(), source: "unknown" }).ok).toBe(false);
  });

  it("returns every crossed like milestone in ascending order", () => {
    expect(crossedMilestones(10, 65, [50, 20, 100, 40])).toEqual([20, 40, 50]);
  });
});

describe("EventQueue", () => {
  it("prioritizes follows over comments and preserves FIFO within a priority", () => {
    const queue = new EventQueue({
      dedupeWindowMs: 10_000,
      minIntervalMs: {},
      maxSize: 10,
    });
    queue.enqueue(event({ id: "comment-1" }), 1_000);
    queue.enqueue(event({ id: "follow-1", kind: "follow", text: undefined }), 1_001);
    queue.enqueue(event({ id: "comment-2" }), 1_002);

    expect(queue.next()?.id).toBe("follow-1");
    expect(queue.next()?.id).toBe("comment-1");
    expect(queue.next()?.id).toBe("comment-2");
  });

  it("rejects duplicates and throttles repeated comments", () => {
    const queue = new EventQueue();
    expect(queue.enqueue(event(), 1_000)).toBe("accepted");
    expect(queue.enqueue(event(), 1_001)).toBe("duplicate");
    expect(queue.enqueue(event({ id: "comment-2" }), 1_500)).toBe("throttled");
  });

  it("drops a lower-priority queued event when a higher-priority event arrives at capacity", () => {
    const queue = new EventQueue({
      dedupeWindowMs: 10_000,
      minIntervalMs: {},
      maxSize: 1,
    });
    expect(queue.enqueue(event({ id: "comment-1" }), 1_000)).toBe("accepted");
    expect(queue.enqueue(event({ id: "follow-1", kind: "follow", text: undefined }), 1_001)).toBe(
      "accepted",
    );
    expect(queue.next()?.id).toBe("follow-1");
  });
});
