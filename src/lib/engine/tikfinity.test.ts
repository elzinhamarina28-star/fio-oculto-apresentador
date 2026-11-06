import { describe, expect, it } from "vitest";
import { mapTikfinity } from "./tikfinity";

describe("TikFinity gift mapping", () => {
  it("preserves gift name and provider ID for unique reactions", () => {
    const event = mapTikfinity({
      event: "gift",
      data: { giftName: "Rose", giftId: 5655, diamondCount: 1, nickname: "Lia", repeatCount: 1, giftType: 0 },
    }, 1234);
    expect(event).toMatchObject({
      kind: "gift", source: "tiktok-live", user: "Lia", giftName: "Rose", giftId: "5655", at: 1234,
    });
  });

  it("ignores unfinished streak frames to avoid repeated reactions", () => {
    expect(mapTikfinity({
      event: "gift",
      data: { giftName: "Rose", diamondCount: 1, giftType: 1, repeatEnd: false },
    })).toBeNull();
  });

  it("keeps an unknown high-value gift identifiable", () => {
    const event = mapTikfinity({
      event: "gift",
      data: { giftName: "Mystery Crown", diamondCount: 1200, giftId: 9001, giftType: 0 },
    });
    expect(event).toMatchObject({ giftName: "Mystery Crown", giftId: "9001", tier: "legendary" });
  });
});
