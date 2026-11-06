import { describe, expect, it } from "vitest";
import { validateEvent } from "./events";

describe("gift event validation", () => {
  it("preserves gift identity after validation", () => {
    const result = validateEvent({
      id: "gift-1", kind: "gift", source: "tiktok-live", at: 100,
      tier: "special", giftId: "galaxy-1", giftName: "Galaxy", user: "Lia",
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.event).toMatchObject({ giftId: "galaxy-1", giftName: "Galaxy", user: "Lia" });
  });

  it("rejects oversized or non-string gift identities", () => {
    expect(validateEvent({
      id: "gift-2", kind: "gift", source: "demo", at: 100, tier: "common", giftName: "x".repeat(81),
    }).ok).toBe(false);
    expect(validateEvent({
      id: "gift-3", kind: "gift", source: "demo", at: 100, tier: "common", giftId: 42,
    }).ok).toBe(false);
  });
});
