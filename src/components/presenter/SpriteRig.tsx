import { useEffect } from "react";

import studio from "@/assets/presenter/studio.jpg.asset.json";
import desk from "@/assets/presenter/desk.png.asset.json";
import head from "@/assets/presenter/head.png.asset.json";
import torso from "@/assets/presenter/torso.png.asset.json";
import cat from "@/assets/presenter/cat.png";
import { StudioTelevision } from "./StudioTelevision";
import type { PresenterRendererProps, Reaction } from "@/lib/presenter/types";

/** Lightweight layered presenter: CSS gestures, voice-driven mouth and the studio cat. */
export function SpriteRig({ state, onReactionDone }: PresenterRendererProps) {
  const gesture = state.headGesture.kind;
  const latestReaction = state.reactions[state.reactions.length - 1];

  return (
    <div className="presenter-stage" data-reaction={latestReaction?.kind ?? "idle"}>
      <img src={studio.url} alt="Estúdio Fio Oculto" className="presenter-bg" />
      <StudioTelevision />
      <div className="presenter-character" data-expression={state.expression} data-breathing={state.breathing} data-reaction={latestReaction?.kind ?? "idle"}>
        <div className="presenter-torso-wrap"><img src={torso.url} alt="" className="presenter-torso" /></div>
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

      <img src={cat} alt="" className="presenter-cat" aria-hidden="true" />
      <img src={desk.url} alt="" className="presenter-desk" />
      <div className="presenter-fx">
        {state.reactions.map((reaction) => (
          <ReactionFx key={reaction.id} reaction={reaction} onDone={onReactionDone} />
        ))}
      </div>
    </div>
  );
}

const FX: Record<Reaction["kind"], { icons: string[]; label: string }> = {
  like: { icons: ["♥", "♡", "✦", "♥", "✧"], label: "Curtida recebida!" },
  follow: { icons: ["👋", "✨", "🎈", "👋", "⭐"], label: "Chegou gente nova!" },
  gift: { icons: ["🎁", "✨", "💎", "🎊", "⭐"], label: "Presente recebido!" },
  wow: { icons: ["💥", "‼️", "⚡", "💫"], label: "Que chegada é essa?!" },
  laugh: { icons: ["😂", "🤣", "💧", "💨"], label: "Perdi a postura!" },
  dance: { icons: ["🪩", "🎉", "💃", "🕺", "✨"], label: "Modo festa!" },
  detective: { icons: ["🔎", "🕵️", "❓", "🗂️"], label: "Temos uma pista!" },
  suspicious: { icons: ["🧐", "👀", "🤨", "👁️"], label: "Isso está suspeito!" },
  catbite: { icons: ["🐈‍⬛", "😾", "💢", "🐾"], label: "SOCORRO, O GATO!" },
  catwalk: { icons: ["🐈‍⬛", "🐾", "🍩"], label: "O gato roubou a cena!" },
  challenge: { icons: ["🏆", "⏱️", "🔥", "🎯"], label: "Desafio aceito!" },
  profile: { icons: ["🔎", "🗂️", "🕵️", "📌"], label: "Dossiê de brincadeira!" },
  hearts: { icons: ["💗", "💖", "💕", "💘"], label: "Chuva de carinho!" },
  confetti: { icons: ["🎊", "🎉", "✨", "🥳"], label: "O estúdio entrou em festa!" },
  spotlight: { icons: ["🔦", "✨", "⭐", "💡"], label: "Holofote na pista!" },
  stars: { icons: ["⭐", "🌟", "✨", "💫"], label: "Pista brilhante!" },
  rain: { icons: ["☔", "💧", "🌧️", "💦"], label: "Chuva de surpresas!" },
  clues: { icons: ["📄", "🗝️", "🧩", "🔍"], label: "As pistas caíram!" },
};

function ReactionFx({ reaction, onDone }: { reaction: Reaction; onDone: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDone(reaction.id), 3000);
    return () => clearTimeout(timer);
  }, [reaction.id, onDone]);
  const fx = FX[reaction.kind];
  return (
    <div className={`fx fx-${reaction.kind}`}>
      {fx.icons.map((icon, index) => (
        <span key={index} className="fx-particle" style={{ ["--i" as string]: index }}>{icon}</span>
      ))}
      <span className="fx-label">
        {reaction.label || fx.label}
        {reaction.source === "demo" ? <em> · demonstração</em> : null}
      </span>
    </div>
  );
}
