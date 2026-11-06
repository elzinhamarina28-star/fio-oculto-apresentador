import { describe, expect, it } from "vitest";
import { getDailySegment, getGiftShow } from "./daily-show";

describe("daily show segments", () => {
  it("keeps the same topic throughout one Sao Paulo calendar day", () => {
    const morning = getDailySegment(new Date("2026-11-05T10:00:00-03:00"));
    const evening = getDailySegment(new Date("2026-11-05T22:00:00-03:00"));
    expect(morning).toEqual(evening);
  });
  it("changes topic on a different day", () => {
    expect(getDailySegment(new Date("2026-11-05T12:00:00-03:00")).date)
      .not.toBe(getDailySegment(new Date("2026-11-06T12:00:00-03:00")).date);
  });
  it("maps named gifts to distinct show moments", () => {
    expect(getGiftShow("Rose").kind).toBe("dance");
    expect(getGiftShow("Galaxy").kind).toBe("detective");
    expect(getGiftShow("Cat Paw").kind).toBe("catbite");
  });
  it("provides a deterministic playful fallback for unknown gifts", () => {
    expect(getGiftShow("MysteryGift", "x")).toEqual(getGiftShow("MysteryGift", "x"));
  });
});
