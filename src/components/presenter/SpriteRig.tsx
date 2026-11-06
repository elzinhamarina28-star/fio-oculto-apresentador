import { useEffect } from "react";
import studio from "@/assets/presenter/studio.jpg.asset.json";
import desk from "@/assets/presenter/desk.png.asset.json";
import head from "@/assets/presenter/head.png.asset.json";
import torso from "@/assets/presenter/torso.png.asset.json";
import type { PresenterRendererProps, Reaction } from "@/lib/presenter/types";

/**
 * Layered-sprite renderer. Only animates what exists in the artwork:
 * whole-head transforms, torso breathing, eyelids over the drawn eyes,
 * and overlay effects. Swap this component for a Live2D renderer later.
 */
export function SpriteRig({ state, onReactionDone }: PresenterRendererProps) {
  const gesture = state.headGesture.kind;
  return (
    <div className="presenter-stage">
      <img src={studio.url} alt="Estúdio Fio Oculto" className="presenter-bg" />

      <div
        className="presenter-character"
        data-expression={state.expression}
        data-breathing={state.breathing}
        data-reaction={state.reactions[state.reactions.length - 1]?.kind ?? ""}
      >
        <div className="presenter-torso-wrap">
          <img src={torso.url} alt="" className="presenter-torso" />
        </div>
        <div className="presenter-head-anchor" data-idle={state.idleHead}>
          <div key={`g${state.headGesture.key}`} className="presenter-head" data-gesture={gesture ?? ""}>
            <img src={head.url} alt="Apresentador Fio Oculto" />
            <span key={`b${state.blinkKey}`} className="presenter-eyelid left" data-blink={state.blinkKey > 0} />
            <span key={`c${state.blinkKey}`} className="presenter-eyelid right" data-blink={state.blinkKey > 0} />
            {state.expression === "happy" && <span className="presenter-blush" />}
            {state.expression === "surprised" && <span className="presenter-exclaim">!</span>}
          </div>
        </div>
      </div>

      <img src={desk.url} alt="" className="presenter-desk" />

      <div className="presenter-fx">
        {state.reactions.map((r) => (
          <ReactionFx key={r.id} reaction={r} onDone={onReactionDone} />
        ))}
      </div>
    </div>
  );
}

const FX: Record<Reaction["kind"], { icons: string[]; label: string }> = {
  like: { icons: ["♥", "♡", "✦", "♥", "✧"], label: "Curtida recebida!" },
  follow: { icons: ["👋", "✨", "🎈", "👋", "⭐"], label: "CHEGOU GENTE NOVA!" },
  gift: { icons: ["🎁", "✨", "💎", "🎊", "⭐", "🎁"], label: "PRESENTE MISTERIOSO!" },
  wow: { icons: ["💥", "‼️", "⚡", "💫", "💥"], label: "QUE CHEGADA É ESSA?!" },
  laugh: { icons: ["😂", "🤣", "💧", "😂", "💨"], label: "PERDI A POSTURA!" },
  dance: { icons: ["🪩", "🎉", "💃", "🕺", "✨", "🎊"], label: "ATIVANDO O MODO FESTA!" },
  detective: { icons: ["🔎", "🕵️", "❓", "🗂️", "💡"], label: "PAUSA! TEMOS UMA PISTA!" },
  suspicious: { icons: ["🧐", "👀", "🤨", "❗", "👁️"], label: "HUM... ISSO ESTÁ SUSPEITO!" },
  catbite: { icons: ["🐈", "😾", "💢", "🩹", "🐾"], label: "SOCORRO! O GATO VIROU ATRAÇÃO!" },
  challenge: { icons: ["🏆", "⏱️", "🔥", "🎯", "🏆"], label: "DESAFIO ACEITO!" },
  profile: { icons: ["🔎", "🗂️", "🕵️", "📌", "💡"], label: "DOSSIÊ DE BRINCADEIRA ABERTO!" },
};

function ReactionFx({ reaction, onDone }: { reaction: Reaction; onDone: (id: number) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDone(reaction.id), 2600);
    return () => clearTimeout(t);
  }, [reaction.id, onDone]);
  const fx = FX[reaction.kind];
  return (
    <div className={`fx fx-${reaction.kind}`}>
      {Array.from({ length: fx.icons.length }).map((_, i) => (
        <span key={i} className="fx-particle" style={{ ["--i" as string]: i }}>
          {fx.icons[i]}
        </span>
      ))}
      <span className="fx-label">
        {reaction.label || fx.label} {reaction.source === "demo" ? <em>· demonstração</em> : null}
      </span>
    </div>
  );
}
