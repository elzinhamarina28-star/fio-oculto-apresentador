import type { SpeechProvider } from "./speech-engine";

/** Mouth level 0..1, read by the renderer every frame (kept outside React state). */
type Listener = (level: number) => void;
const listeners = new Set<Listener>();
export function onMouthLevel(fn: Listener) {
  listeners.add(fn);
  return () => void listeners.delete(fn);
}
function setMouth(level: number) {
  for (const l of listeners) l(level);
}

/**
 * Real voice: asks our server for ElevenLabs audio and plays it.
 * Abort cancels the in-flight request AND stops playback. Mouth follows the audio volume.
 */
export class ElevenLabsVoice implements SpeechProvider {
  readonly name = "ElevenLabs";
  readonly producesAudio = true;
  private ctx: AudioContext | null = null;
  volume = 1;
  onError: ((msg: string) => void) | null = null;

  /** Must be called from a click so the browser allows audio. */
  unlock() {
    if (!this.ctx) this.ctx = new AudioContext();
    void this.ctx.resume();
  }

  async speak(text: string, signal: AbortSignal) {
    if (signal.aborted) return;
    let res: Response;
    try {
      res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        signal,
      });
    } catch (e) {
      if (signal.aborted) return;
      throw e;
    }
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      const msg = j.error ?? `Falha na voz (${res.status})`;
      this.onError?.(msg);
      throw new Error(msg);
    }
    const blob = await res.blob();
    if (signal.aborted) return;
    await this.play(blob, signal);
  }

  private play(blob: Blob, signal: AbortSignal) {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.volume = this.volume;
    this.unlock();
    const ctx = this.ctx!;
    const src = ctx.createMediaElementSource(audio);
    const an = ctx.createAnalyser();
    an.fftSize = 512;
    src.connect(an);
    an.connect(ctx.destination);
    const buf = new Uint8Array(an.fftSize);
    let raf = 0;
    let smooth = 0;
    const tick = () => {
      an.getByteTimeDomainData(buf);
      let sum = 0;
      for (const v of buf) sum += ((v - 128) / 128) ** 2;
      const rms = Math.sqrt(sum / buf.length);
      smooth = smooth * 0.5 + Math.min(1, rms * 5) * 0.5;
      setMouth(smooth < 0.05 ? 0 : smooth);
      raf = requestAnimationFrame(tick);
    };
    return new Promise<void>((resolve) => {
      const done = () => {
        cancelAnimationFrame(raf);
        setMouth(0);
        audio.pause();
        src.disconnect();
        an.disconnect();
        URL.revokeObjectURL(url);
        signal.removeEventListener("abort", done);
        resolve();
      };
      signal.addEventListener("abort", done);
      audio.onended = done;
      audio.onerror = done;
      audio.play().then(() => { raf = requestAnimationFrame(tick); }, done);
    });
  }
}
