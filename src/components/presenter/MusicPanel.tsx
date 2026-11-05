import { useEffect, useRef, useState } from "react";
import { DEFAULT_MIX, MusicEngine, type MixState } from "@/lib/engine/music-engine";
import { TRACKS } from "@/lib/engine/tracks";

export function MusicPanel() {
  const engine = useRef<MusicEngine | null>(null);
  const [mix, setMix] = useState<MixState>(DEFAULT_MIX);
  const [playing, setPlaying] = useState<string | null>(null);
  const [vols, setVols] = useState<Record<string, number>>({});

  useEffect(() => {
    const e = new MusicEngine();
    TRACKS.forEach((t) => e.register({ ...t }));
    engine.current = e;
    return () => e.stop();
  }, []);

  useEffect(() => engine.current?.setMix(mix), [mix]);

  const toggle = (id: string) => {
    const e = engine.current;
    if (!e) return;
    if (playing === id) { e.stop(); setPlaying(null); }
    else { e.playTrack(id); setPlaying(id); }
  };

  return (
    <section className="music-panel">
      <h3>Músicas · {TRACKS.length} faixas</h3>
      <div className="cp-row">
        <label className="mp-vol">Geral
          <input type="range" min={0} max={1} step={0.05} value={mix.master}
            onChange={(e) => setMix({ ...mix, master: Number(e.target.value) })} />
        </label>
        <button type="button" className="cp-btn" data-on={mix.muted} onClick={() => setMix({ ...mix, muted: !mix.muted })}>
          {mix.muted ? "Silenciado" : "Silenciar"}
        </button>
      </div>
      <ul className="mp-list">
        {TRACKS.map((t, i) => (
          <li key={t.id} data-playing={playing === t.id}>
            <button type="button" className="cp-btn" aria-label={`Tocar ${t.name}`} onClick={() => toggle(t.id)}>
              {playing === t.id ? "■" : "▶"}
            </button>
            <span className="mp-name">{i + 1}. {t.name}</span>
            <input type="range" min={0} max={1} step={0.05} aria-label={`Volume ${t.name}`}
              value={vols[t.id] ?? 1}
              onChange={(e) => {
                const v = Number(e.target.value);
                setVols((s) => ({ ...s, [t.id]: v }));
                engine.current?.setTrackVolume(t.id, v);
              }} />
          </li>
        ))}
      </ul>
    </section>
  );
}
