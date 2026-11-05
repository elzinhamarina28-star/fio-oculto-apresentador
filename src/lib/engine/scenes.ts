import studio from "@/assets/presenter/studio.jpg.asset.json";

/** Scene Manager — scenes are configuration; add new ones here when real artwork exists. */
export interface Scene {
  id: string;
  name: string;
  background: string;
  /** Music Engine track id; null until an original track is provided. */
  musicTrackId: string | null;
}

export const SCENES: Scene[] = [
  { id: "estudio", name: "Estúdio", background: studio.url, musicTrackId: null },
];

export const DEFAULT_SCENE_ID = SCENES[0]!.id;

export function getScene(id: string): Scene {
  return SCENES.find((s) => s.id === id) ?? SCENES[0]!;
}
