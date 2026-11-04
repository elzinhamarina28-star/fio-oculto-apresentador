/**
 * Music Engine — original tracks per scene. No tracks are bundled yet
 * (no commercial music). Register a track with `register()` once an original file exists.
 */
export interface MusicTrack {
  id: string;
  name: string;
  url: string;
  loop: boolean;
  volume: number; // 0..1
}

export interface MixState {
  master: number;
  music: number;
  voice: number;
  muted: boolean;
  duckLevel: number; // music multiplier while presenter speaks
}

export const DEFAULT_MIX: MixState = { master: 0.8, music: 0.6, voice: 1, muted: false, duckLevel: 0.3 };

export function effectiveMusicVolume(mix: MixState, trackVolume: number, ducked: boolean) {
  if (mix.muted) return 0;
  return mix.master * mix.music * trackVolume * (ducked ? mix.duckLevel : 1);
}

export function effectiveVoiceVolume(mix: MixState) {
  return mix.muted ? 0 : mix.master * mix.voice;
}

export class MusicEngine {
  private tracks = new Map<string, MusicTrack>();
  private audio: HTMLAudioElement | null = null;
  private currentId: string | null = null;
  private mix: MixState = DEFAULT_MIX;
  private ducked = false;
  private fadeTimer: ReturnType<typeof setInterval> | null = null;

  register(t: MusicTrack) { this.tracks.set(t.id, t); }
  list() { return [...this.tracks.values()]; }

  setMix(mix: MixState) { this.mix = mix; this.apply(); }
  setDucked(d: boolean) { this.ducked = d; this.apply(); }
  setTrackVolume(id: string, v: number) {
    const t = this.tracks.get(id);
    if (t) { t.volume = v; this.apply(); }
  }

  /** Smoothly switches to the scene's track (or silence when null). */
  playScene(trackId: string | null, fadeMs = 1200) {
    if (trackId === this.currentId) return;
    const old = this.audio;
    this.currentId = trackId;
    this.audio = null;
    if (old) this.fade(old, 0, fadeMs, () => old.pause());
    const t = trackId ? this.tracks.get(trackId) : undefined;
    if (!t || typeof Audio === "undefined") return;
    const a = new Audio(t.url);
    a.loop = t.loop;
    a.volume = 0;
    void a.play().catch(() => {});
    this.audio = a;
    this.fade(a, this.target(), fadeMs);
  }

  private target() {
    const t = this.currentId ? this.tracks.get(this.currentId) : undefined;
    return t ? effectiveMusicVolume(this.mix, t.volume, this.ducked) : 0;
  }

  private apply() { if (this.audio) this.fade(this.audio, this.target(), 300); }

  private fade(a: HTMLAudioElement, to: number, ms: number, done?: () => void) {
    if (this.fadeTimer && a === this.audio) clearInterval(this.fadeTimer);
    const from = a.volume, steps = Math.max(1, Math.round(ms / 50));
    let i = 0;
    const timer = setInterval(() => {
      i++;
      a.volume = Math.min(1, Math.max(0, from + ((to - from) * i) / steps));
      if (i >= steps) { clearInterval(timer); done?.(); }
    }, 50);
    if (a === this.audio) this.fadeTimer = timer;
  }
}
