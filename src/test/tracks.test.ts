import { describe, expect, it } from "vitest";
import { TRACKS } from "@/lib/engine/tracks";

describe("sound pack", () => {
  const ids = TRACKS.map((t) => t.id);
  it("has the 47 valid tracks", () => expect(TRACKS).toHaveLength(47));
  it("excludes the three broken WA0047 files", () => expect(ids.some((i) => i.includes("WA0047"))).toBe(false));
  it("keeps identical copies", () => {
    for (const n of ["0015", "0018", "0037", "0039"]) {
      expect(ids).toContain(`AUD-20261105-WA${n}.mp3`);
      expect(ids).toContain(`AUD-20261105-WA${n}(1).mp3`);
    }
  });
  it("follows the original order", () => {
    expect(ids[0]).toBe("AUD-20261105-WA0000.mp3");
    expect(ids.at(-1)).toBe("AUD-20261105-WA0052.mp3");
    expect(ids.indexOf("AUD-20261105-WA0015.mp3")).toBe(ids.indexOf("AUD-20261105-WA0015(1).mp3") - 1);
  });
});
