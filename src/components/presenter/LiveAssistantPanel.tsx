import { useCallback, useEffect, useRef, useState } from "react";
import { hostSpeak } from "@/lib/host-ai.functions";
import { topicForDate } from "@/lib/engine/daily-topic";
import { findGift, type SfxName } from "@/lib/engine/gifts";
import { playSfx, unlockSfx } from "@/lib/engine/sfx";
import { TikfinityProvider } from "@/lib/engine/tikfinity";
import { validateEvent, type LiveEvent } from "@/lib/engine/events";
import { ElevenLabsVoice } from "@/lib/engine/voice-provider";
import { SpeechQueue, type SpeechState } from "@/lib/engine/speech-engine";
import type { Command, ReactionKind } from "@/lib/presenter/types";

interface Props {
  dispatch: (command: Command) => void;
}

export function LiveAssistantPanel({ dispatch }: Props) {
  const topic = topicForDate();
  const [connection, setConnection] = useState("Desconectado · TikFinity ainda não foi iniciado");
  const [lastLiveEvent, setLastLiveEvent] = useState("Nenhum evento real recebido nesta sessão.");
  const [connected, setConnected] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("Voz pronta para ativação");
  const [lastLine, setLastLine] = useState("O apresentador está aguardando a primeira pista.");
  const [volume, setVolume] = useState(0.9);
  const [speechState, setSpeechState] = useState<SpeechState>({ current: null, pending: [], paused: false });
  const [busy, setBusy] = useState(false);
  const voiceRef = useRef<ElevenLabsVoice | null>(null);
  const queueRef = useRef<SpeechQueue | null>(null);
  const providerRef = useRef<TikfinityProvider | null>(null);
  const historyRef = useRef<string[]>([]);
  const lastCommentAt = useRef(0);
  const requestBusy = useRef(false);
  const processEventRef = useRef<(raw: unknown) => void>(() => {});

  if (!voiceRef.current) {
    const voice = new ElevenLabsVoice();
    voice.onError = (message) => setVoiceStatus(message);
    voiceRef.current = voice;
    queueRef.current = new SpeechQueue(voice, setSpeechState);
  }

  useEffect(() => () => {
    queueRef.current?.interrupt();
    void providerRef.current?.disconnect();
  }, []);

  useEffect(() => {
    const sound = (raw: Event) => {
      if (audioUnlocked) playSfx((raw as CustomEvent<SfxName>).detail);
    };
    const finish = (raw: Event) => {
      const { line, event } = (raw as CustomEvent<{ line: string; event: LiveEvent }>).detail;
      setLastLine(line);
      if (audioUnlocked && line.trim()) {
        // Cinematic effects own the visuals; all event speech goes through the shared AI voice path.
        void speakAIRef.current?.("event", event);
      } else {
        setVoiceStatus("Reação concluída. Ative o áudio para ouvir as próximas falas.");
      }
    };
    window.addEventListener("fio:cinematic-sound", sound);
    window.addEventListener("fio:cinematic-finish", finish);
    return () => {
      window.removeEventListener("fio:cinematic-sound", sound);
      window.removeEventListener("fio:cinematic-finish", finish);
    };
  }, [audioUnlocked]);

  const speakAI = useCallback(async (
    mode: "event" | "topic" | "story" | "question" | "challenge" | "investigate" | "surprise" | "free",
    event?: LiveEvent,
    prompt?: string,
  ) => {
    if (requestBusy.current) {
      setVoiceStatus("O apresentador está terminando uma resposta; esta fala ficou para a próxima rodada.");
      return;
    }
    requestBusy.current = true;
    setBusy(true);
    setVoiceStatus("A IA está preparando uma fala...");
    try {
      const result = await hostSpeak({
        data: {
          mode,
          topic: topic.title,
          history: historyRef.current.slice(-12),
          prompt,
          event: event ? {
            kind: event.kind,
            source: event.source,
            user: event.user,
            text: event.text,
            count: event.count,
            giftName: event.giftName,
            diamonds: event.diamonds,
            giftHint: event.kind === "gift" ? findGift(event.giftName, event.diamonds ?? 1).hint : undefined,
          } : undefined,
        },
      });
      if (!result.ok) {
        setVoiceStatus(result.error);
        return;
      }
      setLastLine(result.text);
      historyRef.current = [...historyRef.current, result.text].slice(-12);
      if (audioUnlocked) {
        queueRef.current?.say(result.text, event?.kind === "gift" ? 100 : event?.kind === "follow" ? 60 : 20);
        setVoiceStatus("Fala enviada para a fila de voz ElevenLabs.");
      } else {
        setVoiceStatus("Resposta pronta. Toque em Ativar áudio para o apresentador falar.");
      }
    } catch (error) {
      setVoiceStatus(error instanceof Error ? error.message : "Não foi possível consultar a IA.");
    } finally {
      requestBusy.current = false;
      setBusy(false);
    }
  }, [audioUnlocked, topic.title]);

  const firstCommentersRef = useRef(new Set<string>());

  const processEvent = useCallback((raw: unknown) => {
    const checked = validateEvent(raw);
    if (!checked.ok) {
      setConnection("Evento recebido, mas rejeitado pela validação.");
      return;
    }
    const event = checked.event;
    window.dispatchEvent(new CustomEvent("fio:live-event", { detail: event }));
    if (event.source === "tiktok-live") {
      const detail = event.kind === "gift" ? event.giftName : event.kind;
      setLastLiveEvent(`Evento real recebido: ${detail ?? event.kind}${event.user ? ` · ${event.user}` : ""}`);
    }
    const now = Date.now();
    if (event.kind === "comment") {
      const commenter = (event.user?.trim().toLocaleLowerCase("pt-BR") || event.id).slice(0, 80);
      if (!firstCommentersRef.current.has(commenter)) {
        firstCommentersRef.current.add(commenter);
        window.dispatchEvent(new CustomEvent("fio:tv-first-comment", {
          detail: { user: event.user || "Visitante", text: event.text || "" },
        }));
      }
      if (now - lastCommentAt.current < 4500) return;
      lastCommentAt.current = now;
    }
    // Non-comment events are owned by the cinematic queue, including their closing voice.
    if (event.kind !== "comment") return;
    dispatch({
      type: "reaction",
      kind: "detective",
      source: event.source === "demo" ? "demo" : "live",
      label: "O chat trouxe uma nova pista!",
    });
    void speakAI("event", event);
  }, [dispatch, speakAI]);

  processEventRef.current = processEvent;

  const activateAudio = () => {
    voiceRef.current?.unlock();
    window.dispatchEvent(new Event("fio:tv-enable-voice"));
    window.speechSynthesis?.resume();
    unlockSfx();
    setAudioUnlocked(true);
    setVoiceStatus("Áudio ativado. O apresentador já pode falar.");
  };

  const testVoice = () => {
    activateAudio();
    queueRef.current?.say("Alô, investigadores! O microfone está ligado. O gato já está tentando assumir a apresentação.", 50);
  };

  const connectTikfinity = async () => {
    if (providerRef.current) return;
    const provider = new TikfinityProvider();
    provider.onLost = (reason) => {
      setConnected(false);
      setConnection(`Conexão perdida: ${reason}`);
      providerRef.current = null;
    };
    providerRef.current = provider;
    setConnection("Procurando TikFinity em ws://localhost:21213/...");
    try {
      await provider.connect((raw) => processEventRef.current(raw));
      setConnected(true);
      setConnection("Conectado ao WebSocket local do TikFinity. Confirme que a LIVE está ativa no TikFinity.");
    } catch (error) {
      providerRef.current = null;
      setConnected(false);
      setConnection(error instanceof Error ? error.message : "Não foi possível conectar ao TikFinity.");
    }
  };

  const disconnectTikfinity = async () => {
    const provider = providerRef.current;
    providerRef.current = null;
    await provider?.disconnect();
    setConnected(false);
    setConnection("Desconectado pelo painel.");
  };

  const demoEvent = (kind: LiveEvent["kind"], extra: Partial<LiveEvent> = {}) => {
    const event: LiveEvent = {
      id: `demo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      kind,
      source: "demo",
      at: Date.now(),
      user: "Investigador do chat",
      ...(kind === "gift" ? { tier: "common" as const, giftName: "Rosa", giftId: "rose" } : {}),
      ...extra,
    };
    processEvent(event);
  };

  const investigateProfile = () => {
    dispatch({ type: "reaction", kind: "profile", source: "demo", label: "Dossiê fictício aberto!" });
    void speakAI("investigate", {
      id: "demo-profile", kind: "comment", source: "demo", at: Date.now(),
      user: "Detetive Curioso", text: "Investigue meu apelido",
    });
  };

  const challengeChat = () => {
    dispatch({ type: "reaction", kind: "challenge", source: "demo", label: "Desafio lançado!" });
    void speakAI("challenge");
  };

  const surpriseCat = () => {
    dispatch({ type: "reaction", kind: "catbite", source: "demo", label: "O gato atacou o apresentador!" });
    playSfx("meow");
    void speakAI("surprise", undefined, "O gato preto pulou na mesa, mordeu o apresentador e espalhou as pistas pelo estúdio.");
  };

  const stopSpeech = () => {
    queueRef.current?.interrupt();
    setVoiceStatus("Fila de fala interrompida.");
  };

  return (
    <section className="live-assistant-panel">
      <header>
        <h2>Central de inteligência · LIVE</h2>
        <p>IA conversacional, voz ElevenLabs e reações do personagem.</p>
        <p className="assistant-status" role="status">{voiceStatus}</p>
      </header>

      <section>
        <h3>Voz do apresentador</h3>
        <div className="cp-row">
          <button type="button" className="cp-btn" onClick={activateAudio}>{audioUnlocked ? "✓ Áudio ativado" : "🔊 Ativar áudio"}</button>
          <button type="button" className="cp-btn" data-variant="hot" onClick={testVoice}>🎙️ Testar voz</button>
          <button type="button" className="cp-btn" onClick={stopSpeech}>■ Parar fala</button>
        </div>
        <label className="assistant-volume">Volume da voz
          <input type="range" min={0} max={1} step={0.05} value={volume} onChange={(e) => {
            const next = Number(e.target.value);
            setVolume(next);
            if (voiceRef.current) voiceRef.current.volume = next;
          }} />
        </label>
        <p className="assistant-status">{speechState.current ? "Falando agora" : speechState.pending.length ? `${speechState.pending.length} fala(s) na fila` : "Fila de voz vazia"}</p>
      </section>

      <section>
        <h3>Conexão TikTok LIVE · TikFinity</h3>
        <p className="assistant-status">{connection}</p>
        <p className="assistant-status" role="status">{lastLiveEvent}</p>
        <div className="cp-row">
          <button type="button" className="cp-btn" data-variant="hot" onClick={() => void connectTikfinity()} disabled={connected || busy}>Conectar TikFinity</button>
          <button type="button" className="cp-btn" onClick={() => void disconnectTikfinity()} disabled={!providerRef.current}>Desconectar</button>
        </div>
        <p className="assistant-hint">Requer TikFinity aberto no mesmo computador, conectado à sua LIVE. A demonstração abaixo não representa eventos reais.</p>
      </section>

      <section>
        <h3>Assunto do dia · {topic.angle}</h3>
        <p className="assistant-topic">{topic.title}</p>
        <div className="cp-row">
          <button className="cp-btn" onClick={() => void speakAI("topic")}>🎬 Abrir debate</button>
          <button className="cp-btn" onClick={() => void speakAI("question")}>❓ Perguntar ao chat</button>
          <button className="cp-btn" onClick={() => void speakAI("story")}>📚 Inventar história</button>
          <button className="cp-btn" onClick={challengeChat}>🏆 Criar desafio</button>
          <button className="cp-btn" onClick={surpriseCat}>🐈 Surpresa do gato</button>
        </div>
      </section>

      <section>
        <h3>Reações · demonstração manual</h3>
        <div className="cp-row">
          <button className="cp-btn" onClick={() => demoEvent("comment", { text: "Tenho uma teoria sobre o gato!" })}>💬 Comentário</button>
          <button className="cp-btn" onClick={() => demoEvent("follow")}>✚ Seguidor</button>
          <button className="cp-btn" onClick={() => demoEvent("likes", { count: 500 })}>♥ 500 curtidas</button>
          <button className="cp-btn" onClick={() => demoEvent("gift", { giftName: "Rosa", giftId: "rose" })}>🌹 Rosa</button>
          <button className="cp-btn" onClick={() => demoEvent("gift", { giftName: "Galáxia", giftId: "galaxy", tier: "special" })}>🌌 Galáxia</button>
          <button className="cp-btn" onClick={() => demoEvent("gift", { giftName: "Leão", giftId: "lion", tier: "legendary" })}>🦁 Leão</button>
          <button className="cp-btn" onClick={() => demoEvent("gift", { giftName: "Pata de gato", giftId: "cat-paw" })}>🐈 Patinha</button>
          <button className="cp-btn" onClick={investigateProfile}>🕵️ Investigar apelido</button>
        </div>
      </section>

      <section className="assistant-caption" aria-live="polite">
        <h3>Última fala da IA</h3>
        <p>{lastLine}</p>
      </section>
    </section>
  );
}
