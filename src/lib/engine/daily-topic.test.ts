import { describe, expect, it } from "vitest";
import { topicForDate } from "./daily-topic";

describe("daily topic draw", () => {
  it("keeps the same topic throughout one São Paulo calendar day", () => {
    const morning = new Date("2026-11-06T12:00:00.000Z");
    const evening = new Date("2026-11-06T23:00:00.000Z");
    expect(topicForDate(morning)).toEqual(topicForDate(evening));
  });

  it("changes the topic on the next São Paulo day", () => {
    const beforeMidnight = new Date("2026-11-06T23:30:00.000Z");
    const afterMidnight = new Date("2026-11-07T03:30:00.000Z");
    expect(topicForDate(beforeMidnight)).not.toEqual(topicForDate(afterMidnight));
  });
});
