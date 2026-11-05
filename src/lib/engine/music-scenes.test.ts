import { describe, expect, it } from "vitest";
import { getMusicForScene, SCENE_MUSIC } from "./music-scenes";

describe("scene music routing", () => {
  it("maps every planned live scene to a catalog track", () => {
    expect(Object.keys(SCENE_MUSIC)).toHaveLength(8);
    expect(getMusicForScene("investigacao")?.trackNumber).toBe(11);
    expect(getMusicForScene("conversa")?.trackNumber).toBe(13);
    expect(getMusicForScene("gato")?.trackNumber).toBe(15);
    expect(getMusicForScene("dossie")?.trackNumber).toBe(12);
    expect(getMusicForScene("modo-caos")?.trackNumber).toBe(14);
  });

  it("marks transition and discovery stingers as non-looping", () => {
    expect(getMusicForScene("transicao")?.loop).toBe(false);
    expect(getMusicForScene("descoberta")?.loop).toBe(false);
  });

  it("returns null for unknown scenes instead of guessing a track", () => {
    expect(getMusicForScene("unknown-scene")).toBeNull();
  });
});
