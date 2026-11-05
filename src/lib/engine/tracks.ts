import type { MusicTrack } from "./music-engine";

/**
 * Original sound pack (Fio Oculto). Names and order follow the uploaded files.
 * The three ~0.08 s WA0047 files were broken and are intentionally excluded.
 * Identical copies (e.g. WA0015 and WA0015(1)) are kept on purpose.
 */
const pointers = import.meta.glob<{ url: string; original_filename: string }>(
  "../../assets/audio/*.mp3.asset.json",
  { eager: true, import: "default" },
);

function sortKey(name: string): [number, number] {
  const m = name.match(/WA(\d+)(?:\((\d+)\))?\.mp3$/);
  return m ? [Number(m[1]), m[2] ? Number(m[2]) : 0] : [Infinity, 0];
}

export const TRACKS: MusicTrack[] = Object.values(pointers)
  .map((p) => ({
    id: p.original_filename,
    name: p.original_filename.replace(/\.mp3$/, ""),
    url: p.url,
    loop: true,
    volume: 1,
  }))
  .sort((a, b) => {
    const [x1, y1] = sortKey(a.id), [x2, y2] = sortKey(b.id);
    return x1 - x2 || y1 - y2;
  });
