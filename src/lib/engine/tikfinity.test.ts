import { describe, expect, it } from "vitest";
import { mapTikfinity } from "./tikfinity";

describe("TikFinity event mapping", () => {
  it("maps chat events with nested user data", () => {
    const event = mapTikfinity(
      {
        event: "chat",
        data: { user: { nickname: "Lia", uniqueId: "lia123" }, comment: "Olá, pessoal!" },
      },
      1234,
    );
    expect(event).toMatchObject({
      kind: "comment",
      source: "tiktok-live",
      user: "Lia",
      text: "Olá, pessoal!",
      at: 1234,
    });
  });

  it("maps follow events from the social action field", () => {
    expect(mapTikfinity({ event: "social", data: { action: "follow", nickname: "Lia" } })).toMatchObject({
      kind: "follow",
      user: "Lia",
    });
  });

  it("preserves gift name and numeric provider ID for unique reactions", () => {
    const event = mapTikfinity(
      {
        event: "gift",
        data: {
          giftName: "Rose",
          giftId: 5655,
          diamondCount: 1,
          nickname: "Lia",
          repeatCount: 1,
          giftType: 0,
        },
      },
      1234,
    );
    expect(event).toMatchObject({
      kind: "gift",
      source: "tiktok-live",
      user: "Lia",
      giftName: "Rose",
      giftId: "5655",
      diamonds: 1,
      at: 1234,
    });
  });

  it("ignores unfinished streak frames to avoid repeated reactions", () => {
    expect(
      mapTikfinity({
        event: "gift",
        data: { giftName: "Rose", diamondCount: 1, giftType: 1, repeatEnd: false },
      }),
    ).toBeNull();
  });

  it("keeps an unknown high-value gift identifiable", () => {
    const event = mapTikfinity({
      event: "gift",
      data: { giftName: "Mystery Crown", diamondCount: 1200, giftId: 9001, giftType: 0 },
    });
    expect(event).toMatchObject({
      giftName: "Mystery Crown",
      giftId: "9001",
      tier: "legendary",
      diamonds: 1200,
    });
  });

  it("uses cumulative likes when the provider sends only per-event counts", () => {
    const first = mapTikfinity({ event: "like", data: { likeCount: 12 } });
    const second = mapTikfinity({ event: "like", data: { likeCount: 8 } });
    expect(first).toMatchObject({ kind: "likes", count: 12 });
    expect(second).toMatchObject({ kind: "likes", count: 20 });
  });
});
