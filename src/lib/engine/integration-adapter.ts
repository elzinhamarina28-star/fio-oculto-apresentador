import { validateEvent, type EventSource, type LiveEvent } from "./events";

/**
 * Integration Adapter — isolates event providers from the rest of the app.
 * A future TikTok LIVE provider must run through the backend (credentials never in the
 * browser) and implement `LiveEventProvider`. No real provider is connected yet.
 */
export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "reconnecting" | "error";

export interface LiveEventProvider {
  readonly id: string;
  readonly source: EventSource;
  connect(emit: (raw: unknown) => void): Promise<void>;
  disconnect(): Promise<void>;
}

export interface AdapterLogEntry {
  at: number;
  level: "info" | "warn" | "error";
  message: string;
}

export interface AdapterOptions {
  maxRetries: number;
  baseDelayMs: number;
}

export class IntegrationAdapter {
  status: ConnectionStatus = "disconnected";
  log: AdapterLogEntry[] = [];
  private retries = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private manualStop = false;

  constructor(
    private provider: LiveEventProvider,
    private onEvent: (e: LiveEvent) => void,
    private onChange: () => void,
    private opts: AdapterOptions = { maxRetries: 5, baseDelayMs: 1000 },
  ) {}

  async connect() {
    this.manualStop = false;
    this.setStatus(this.retries ? "reconnecting" : "connecting");
    try {
      await this.provider.connect((raw) => this.receive(raw));
      this.retries = 0;
      this.setStatus("connected");
      this.write("info", `Conectado: ${this.provider.id}`);
    } catch (err) {
      this.write("error", `Falha ao conectar: ${err instanceof Error ? err.message : "erro"}`);
      this.scheduleReconnect();
    }
  }

  async disconnect() {
    this.manualStop = true;
    if (this.timer) clearTimeout(this.timer);
    await this.provider.disconnect();
    this.setStatus("disconnected");
    this.write("info", "Desconectado");
  }

  /** Providers call this when the connection drops unexpectedly. */
  connectionLost(reason: string) {
    this.write("warn", `Conexão perdida: ${reason}`);
    if (!this.manualStop) this.scheduleReconnect();
  }

  private scheduleReconnect() {
    if (this.retries >= this.opts.maxRetries) {
      this.setStatus("error");
      this.write("error", "Limite de tentativas atingido");
      return;
    }
    const delay = this.opts.baseDelayMs * 2 ** this.retries++;
    this.setStatus("reconnecting");
    this.timer = setTimeout(() => void this.connect(), delay);
  }

  receive(raw: unknown) {
    const r = validateEvent(raw);
    if (!r.ok) return this.write("warn", `Evento rejeitado: ${r.error}`);
    if (r.event.source !== this.provider.source)
      return this.write("warn", "Evento rejeitado: origem não corresponde ao provedor");
    this.onEvent(r.event);
  }

  private setStatus(s: ConnectionStatus) { this.status = s; this.onChange(); }
  private write(level: AdapterLogEntry["level"], message: string) {
    this.log = [{ at: Date.now(), level, message }, ...this.log].slice(0, 100);
    this.onChange();
  }
}

/** Demo provider: only emits what the operator triggers in the panel; always source "demo". */
export class DemoProvider implements LiveEventProvider {
  readonly id = "demonstracao";
  readonly source = "demo" as const;
  private emit: ((raw: unknown) => void) | null = null;
  private n = 0;
  async connect(emit: (raw: unknown) => void) { this.emit = emit; }
  async disconnect() { this.emit = null; }
  trigger(e: Omit<LiveEvent, "id" | "source" | "at">) {
    this.emit?.({ ...e, id: `demo-${Date.now()}-${this.n++}`, source: "demo", at: Date.now() });
  }
}
