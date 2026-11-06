import { useState } from "react";
import { getDailySegment } from "@/lib/engine/daily-show";
import type { Command, PresenterState } from "@/lib/presenter/types";

interface Props {
  state: PresenterState;
  dispatch: (c: Command) => void;
  toggle: (k: "breathing" | "autoBlink" | "idleHead") => void;
}

export function ControlPanel({ state, dispatch, toggle }: Props) {
  const daily = getDailySegment();
  const [voiceStatus, setVoiceStatus] = useState("Voz ElevenLabs pronta para teste");
  const [speaking, setSpeaking] = useState(false);
  const speak = async (text: string) => {
    if (speaking) return;
    setSpeaking(true);
    setVoiceStatus("Gerando voz com ElevenLabs...");
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(error.error ?? "Falha ao gerar áudio.");
      }
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.onended = () => { URL.revokeObjectURL(audioUrl); setSpeaking(false); setVoiceStatus("Voz ElevenLabs pronta para teste"); };
      audio.onerror = () => { URL.revokeObjectURL(audioUrl); setSpeaking(false); setVoiceStatus("Não foi possível reproduzir o áudio."); };
      await audio.play();
      setVoiceStatus("Apresentador falando com ElevenLabs");
    } catch (error) {
      setSpeaking(false);
      setVoiceStatus(error instanceof Error ? error.message : "Erro ao conectar à voz.");
    }
  };
  return (
    <aside className="control-panel">
      <header>
        <h2>Painel de teste</h2>
        <p>Voz neural ElevenLabs · Moutella (português brasileiro). A captura de eventos do TikTok ainda não foi configurada.</p>
        <p className="daily-show-copy" role="status">{voiceStatus}</p>
      </header>

      <Section title="Ciclo ocioso">
        <Toggle on={state.breathing} onClick={() => toggle("breathing")}>Respiração</Toggle>
        <Toggle on={state.autoBlink} onClick={() => toggle("autoBlink")}>Piscadas auto</Toggle>
        <Toggle on={state.idleHead} onClick={() => toggle("idleHead")}>Cabeça ociosa</Toggle>
      </Section>

      <Section title="Gestos">
        <Btn onClick={() => dispatch({ type: "blink" })}>Piscar</Btn>
        <Btn onClick={() => dispatch({ type: "nod" })}>Acenar</Btn>
        <Btn onClick={() => dispatch({ type: "tilt" })}>Inclinar</Btn>
      </Section>

      <Section title={`Expressão · ${label(state.expression)}`}>
        <Btn onClick={() => dispatch({ type: "expression", value: "neutral" })}>Neutra</Btn>
        <Btn onClick={() => dispatch({ type: "expression", value: "happy" })}>Feliz</Btn>
        <Btn onClick={() => dispatch({ type: "expression", value: "surprised" })}>Surpresa</Btn>
      </Section>

      <Section title="Simular reação">
        <Btn variant="hot" onClick={() => dispatch({ type: "reaction", kind: "like" })}>♥ Curtida</Btn>
        <Btn variant="hot" onClick={() => dispatch({ type: "reaction", kind: "follow" })}>✚ Seguidor</Btn>
        <Btn variant="hot" onClick={() => dispatch({ type: "reaction", kind: "gift", label: "Presente recebido!" })}>✦ Presente</Btn>
        <Btn variant="hot" onClick={() => dispatch({ type: "reaction", kind: "wow", label: "QUE CHEGADA!" })}>💥 Espanto</Btn>
        <Btn variant="hot" onClick={() => dispatch({ type: "reaction", kind: "laugh", label: "EU NÃO AGUENTO!" })}>😂 Risada</Btn>
        <Btn variant="hot" onClick={() => dispatch({ type: "reaction", kind: "dance", label: "BORA COMEMORAR!" })}>🎉 Dança</Btn>
        <Btn variant="hot" onClick={() => dispatch({ type: "reaction", kind: "detective", label: "TEMOS UMA PISTA!" })}>🔎 Detetive</Btn>
        <Btn variant="hot" onClick={() => dispatch({ type: "reaction", kind: "suspicious", label: "ESTOU DE OLHO..." })}>🧐 Desconfiado</Btn>
      </Section>

      <Section title="Atrações do dia">
        <p className="daily-show-copy"><strong>Assunto:</strong> {daily.topic}</p>
        <p className="daily-show-copy"><strong>Desafio:</strong> {daily.challenge}</p>
        <p className="daily-show-copy"><strong>História-relâmpago:</strong> {daily.storyStarter}</p>
        <Btn variant="hot" onClick={() => speak("O assunto de hoje é: " + daily.topic + " " + daily.challenge + " " + daily.storyStarter)} disabled={speaking}>🔊 Ouvir atrações do dia</Btn>
        <Btn variant="hot" onClick={() => dispatch({ type: "reaction", kind: "challenge", label: "VALENDO! O CHAT DECIDE SE ELE CONSEGUE!" })}>🏆 Lançar desafio</Btn>
        <Btn variant="hot" onClick={() => dispatch({ type: "reaction", kind: "profile", label: "ABRINDO DOSSIÊ PÚBLICO... SÓ VALE O QUE VOCÊ COMPARTILHAR!" })}>🔎 Investigação divertida</Btn>
        <Btn variant="hot" onClick={() => dispatch({ type: "reaction", kind: "catbite", label: "SOCORRO! O GATO ATACOU O APRESENTADOR!" })}>🐈 Gato mordendo</Btn>
        <Btn onClick={() => speak("Alô, chat! Cheguei para investigar, contar histórias e descobrir quem está aprontando por aqui!")} disabled={speaking}>🎙️ Testar voz</Btn>
      </Section>
    </aside>
  );
}

const label = (e: string) => ({ neutral: "neutra", happy: "feliz", surprised: "surpresa" })[e] ?? e;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3>{title}</h3>
      <div className="cp-row">{children}</div>
    </section>
  );
}
function Btn({ children, onClick, variant, disabled }: { children: React.ReactNode; onClick: () => void; variant?: "hot"; disabled?: boolean }) {
  return (
    <button type="button" className="cp-btn" data-variant={variant} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
function Toggle({ on, children, onClick }: { on: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" className="cp-btn" aria-pressed={on} data-on={on} onClick={onClick}>
      {children}
    </button>
  );
}
