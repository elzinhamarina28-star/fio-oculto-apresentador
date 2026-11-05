import { describe, expect, it } from "vitest";
import type { LiveEvent } from "./events";
import {
  createConversationReply,
  createEventInteraction,
  DEFAULT_CONVERSATION_SETTINGS,
} from "./conversation";

const gift: LiveEvent = {
  id: "demo-gift-1",
  kind: "gift",
  source: "demo",
  at: 10000,
  user: "Lia",
  tier: "common",
};

describe("conversation layer", () => {
  it("creates a localized contextual reply without external services", () => {
    expect(createConversationReply(gift, "acolhedor", () => 0)).toContain("Lia");
  });

  it("keeps comments enabled as free participation", () => {
    const event: LiveEvent = {
      id: "demo-comment-1",
      kind: "comment",
      source: "demo",
      at: 10000,
      user: "Rafa",
      text: "Tenho uma teoria",
    };
    const result = createEventInteraction(event, DEFAULT_CONVERSATION_SETTINGS, 10000);
    expect(result.accepted).toBe(true);
    expect(result.speech).toContain("Rafa");
    expect(result.commands).toContainEqual({ type: "tilt" });
  });

  it("does not respond when disabled or during cooldown", () => {
    expect(createEventInteraction(gift, { ...DEFAULT_CONVERSATION_SETTINGS, enabled: false }).reason).toBe("disabled");
    expect(createEventInteraction(gift, DEFAULT_CONVERSATION_SETTINGS, 10000, 9000).reason).toBe("cooldown");
  });

  it("does not store viewer information", () => {
    const result = createEventInteraction(gift, DEFAULT_CONVERSATION_SETTINGS, 10000);
    expect(JSON.stringify(result)).not.toContain("Lia");
  });
});
