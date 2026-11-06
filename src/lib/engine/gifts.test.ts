import { describe, expect, it } from "vitest";
import { findGift } from "./gifts";

describe("gift reaction registry", () => {
  it.each([
    ["Rose", "hearts", "pop"],
    ["Doughnut", "cat-walk", "meow"],
    ["Cat Paw", "cat-bite", "meow"],
    ["Galaxy", "stars", "whoosh"],
    ["Lion", "confetti", "fanfare"],
    ["Universe", "confetti", "boom"],
  ] as const)("maps %s to its own stage effect and sound", (name, effect, sfx) => {
    const gift = findGift(name);
    expect(gift.effect).toBe(effect);
    expect(gift.sfx).toBe(sfx);
  });

  it("falls back safely for a gift not in the registry", () => {
    expect(findGift("Mystery Crown", 1500).tier).toBe("legendary");
  });
});
