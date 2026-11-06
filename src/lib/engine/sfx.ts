import type { SfxName } from "./gifts";

/** Short synthesized sound effects (no files, no cost). */
let ctx: AudioContext | null = null;

function tone(c: AudioContext, freq: number, start: number, dur: number, type: OscillatorType = "sine", gain = 0.15, slideTo?: number) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, c.currentTime + start);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, c.currentTime + start + dur);
  g.gain.setValueAtTime(gain, c.currentTime + start);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + start + dur);
  o.connect(g).connect(c.destination);
  o.start(c.currentTime + start);
  o.stop(c.currentTime + start + dur);
}

/** Call from the operator's activation click so later LIVE events can play effects. */
export function unlockSfx() {
  if (typeof AudioContext === "undefined") return;
  ctx ??= new AudioContext();
  void ctx.resume();
}

export function playSfx(name: SfxName) {
  if (typeof AudioContext === "undefined") return;
  ctx ??= new AudioContext();
  const c = ctx;
  void c.resume();
  switch (name) {
    case "pop": tone(c, 600, 0, 0.12, "triangle", 0.2, 1200); break;
    case "chime": [880, 1320, 1760].forEach((f, i) => tone(c, f, i * 0.08, 0.5)); break;
    case "fanfare": [523, 659, 784, 1047].forEach((f, i) => tone(c, f, i * 0.12, 0.45, "square", 0.08)); break;
    case "boom": tone(c, 160, 0, 0.9, "sawtooth", 0.25, 40); break;
    case "meow": tone(c, 700, 0, 0.18, "sawtooth", 0.08, 1100); tone(c, 1100, 0.18, 0.3, "sawtooth", 0.08, 500); break;
    case "whoosh": tone(c, 200, 0, 0.6, "sine", 0.15, 1600); break;
  }
}
