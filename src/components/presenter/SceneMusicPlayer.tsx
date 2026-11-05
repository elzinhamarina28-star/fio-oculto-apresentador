import { useEffect, useRef, useState } from "react";
import { openBus } from "@/lib/engine/bus";
import { getMusicForScene } from "@/lib/engine/music-scenes";

/**
 * OBS-side music player. Add approved MP3 files under public/audio
 * using the exact file names in AUDIO_FILES.
 */
const AUDIO_FILES: Record<string, string> = {
  "sala-de-investigacao": "/audio/11-sala-de-investigacao.mp3",
  "arquivo-secreto": "/audio/12-arquivo-secreto.mp3",
  "cafe-com-suspeita": "/audio/13-cafe-com-suspeita.mp3",
  "teoria-maluca": "/audio/14-teoria-maluca.mp3",
  "o-gato-esta-observando": "/audio/15-o-gato-esta-observando.mp3",
  "virada-de-roteiro": "/audio/16-virada-de-roteiro.mp3",
  "pista-encontrada": "/audio/17-pista-encontrada.mp3",
  "modo-conversa": "/audio/18-modo-conversa.mp3",
  "intervalo-curioso": "/audio/19-intervalo-curioso.mp3",
  "encerramento-em-aberto": "/audio/20-encerramento-em-aberto.mp3",
};

export function SceneMusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [activeTitle, setActiveTitle] = useState("Aguardando cena");
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    let generation = 0;
    const bus = openBus((message) => {
      if (message.type !== "scene") return;
      const track = getMusicForScene(message.sceneId);
      const source = track ? AUDIO_FILES[track.trackId] : undefined;
      if (!track || !source) {
        audio.pause();
        audio.removeAttribute("src");
        setAvailable(false);
        setActiveTitle("Sem trilha para esta cena");
        return;
      }
      const currentGeneration = ++generation;
      setActiveTitle(track.title);
      setAvailable(true);
      if (audio.src.endsWith(source)) {
        audio.loop = track.loop;
        void audio.play().catch(() => setAvailable(false));
        return;
      }
      audio.pause();
      audio.src = source;
      audio.loop = track.loop;
      audio.volume = 0.18;
      audio.load();
      audio.oncanplay = () => {
        if (currentGeneration === generation) void audio.play().catch(() => setAvailable(false));
      };
      audio.onerror = () => {
        if (currentGeneration === generation) {
          setAvailable(false);
          setActiveTitle(track.title + " · arquivo não encontrado");
        }
      };
    });
    return () => {
      bus.close();
      audio.pause();
      audio.removeAttribute("src");
    };
  }, []);

  return (
    <div className="scene-music-status" aria-live="polite" data-available={available}>
      <audio ref={audioRef} preload="none" />
      <span>{activeTitle}</span>
    </div>
  );
}
