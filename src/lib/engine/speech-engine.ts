/**
 * Speech Engine — text-to-speech contract + speech queue.
 * A real provider (server-side, credentials protected) will implement `SpeechProvider`.
 * Until then `CaptionOnlyProvider` shows the line as a caption for an estimated duration —
 * it is NOT voice and the UI says so.
 */
export interface SpeechProvider {
  readonly name: string;
  readonly producesAudio: boolean;
  speak(text: string, signal: AbortSignal): Promise<void>;
}

export class CaptionOnlyProvider implements SpeechProvider {
  readonly name = "Somente legenda (voz ainda não conectada)";
  readonly producesAudio = false;
  speak(text: string, signal: AbortSignal) {
    const ms = Math.min(9000, 1200 + text.length * 55);
    return new Promise<void>((resolve) => {
      const t = setTimeout(resolve, ms);
      signal.addEventListener("abort", () => {
        clearTimeout(t);
        resolve();
      });
    });
  }
}

export interface SpeechItem {
  id: number;
  text: string;
  priority: number;
}

export interface SpeechState {
  current: SpeechItem | null;
  pending: SpeechItem[];
  paused: boolean;
}

export class SpeechQueue {
  private pending: SpeechItem[] = [];
  private current: SpeechItem | null = null;
  private abort: AbortController | null = null;
  private paused = false;
  private nextId = 1;
  constructor(
    private provider: SpeechProvider,
    private onChange: (s: SpeechState) => void,
  ) {}

  say(text: string, priority = 0) {
    const item = { id: this.nextId++, text, priority };
    const i = this.pending.findIndex((p) => p.priority < priority);
    if (i === -1) this.pending.push(item);
    else this.pending.splice(i, 0, item);
    this.emit();
    void this.pump();
  }

  pause() { this.paused = true; this.emit(); }
  resume() { this.paused = false; this.emit(); void this.pump(); }
  /** Stops the current line; queued lines continue. */
  skip() { this.abort?.abort(); }
  /** Stops everything and clears the queue. */
  interrupt() { this.pending = []; this.abort?.abort(); this.emit(); }

  private async pump() {
    if (this.current || this.paused) return;
    const item = this.pending.shift();
    if (!item) return;
    this.current = item;
    this.abort = new AbortController();
    this.emit();
    try { await this.provider.speak(item.text, this.abort.signal); } catch { /* provider error: skip line */ }
    this.current = null;
    this.abort = null;
    this.emit();
    void this.pump();
  }

  private emit() {
    this.onChange({ current: this.current, pending: [...this.pending], paused: this.paused });
  }
}
