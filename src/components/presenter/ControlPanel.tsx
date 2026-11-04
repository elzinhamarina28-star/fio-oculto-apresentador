import type { Command, PresenterState } from "@/lib/presenter/types";

interface Props {
  state: PresenterState;
  dispatch: (c: Command) => void;
  toggle: (k: "breathing" | "autoBlink" | "idleHead") => void;
}

export function ControlPanel({ state, dispatch, toggle }: Props) {
  return (
    <aside className="control-panel">
      <header>
        <h2>Painel de teste</h2>
        <p>Acionamento manual. Nenhum evento real do TikTok está conectado.</p>
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
        <Btn variant="hot" onClick={() => dispatch({ type: "reaction", kind: "gift" })}>✦ Presente</Btn>
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
function Btn({ children, onClick, variant }: { children: React.ReactNode; onClick: () => void; variant?: "hot" }) {
  return (
    <button type="button" className="cp-btn" data-variant={variant} onClick={onClick}>
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
