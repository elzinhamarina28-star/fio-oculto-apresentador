import { useEffect, useRef } from "react";

import studio from "@/assets/presenter/studio.jpg.asset.json";
import desk from "@/assets/presenter/desk.png.asset.json";
import head from "@/assets/presenter/head.png.asset.json";
import torso from "@/assets/presenter/torso.png.asset.json";
import cat from "@/assets/presenter/cat.png";
import { StudioTelevision } from "./StudioTelevision";
import { LiveHud } from "./LiveHud";
import { onMouthLevel } from "@/lib/engine/voice-provider";
import type { PresenterRendererProps, Reaction } from "@/lib/presenter/types";
import { CinematicEffects } from "./CinematicEffects";
import type { ActiveSequence } from "@/lib/presenter/use-cinematic";
import type { CSSProperties } from "react";

/** Lightweight layered presenter: CSS gestures, voice-driven mouth and the studio cat. */
export function SpriteRig({ state, onReactionDone, sequence }: PresenterRendererProps & { sequence?: ActiveSequence | null }) {
  const gesture = state.headGesture.kind;
  const latestReaction = state.reactions[state.reactions.length - 1];
  const headAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => onMouthLevel((level) => {
    headAnchorRef.current?.style.setProperty("--voice-level", String(Math.max(0, Math.min(1, level))));
  }), []);

  return (
    <div className="presenter-stage" data-reaction={latestReaction?.kind ?? "idle"}
      data-cinematic={sequence?.profile.enabled ? sequence.profile.effect : "idle"}
      data-motion={sequence?.profile.enabled && sequence.profile.character ? sequence.profile.motion : "idle"}
      data-phase={sequence?.phase ?? "idle"}
      data-dance={sequence?.job.variant ?? 0}
      data-shy={sequence?.job.likeLevel ?? 1}
      data-cat-action={sequence?.profile.enabled && sequence.profile.catEnabled ? sequence.profile.cat : "idle"}
      style={{ "--cine-duration": `${sequence?.profile.duration ?? 6500}ms` } as CSSProperties}>
      <img src={studio.url} alt="Estúdio Fio Oculto" className="presenter-bg" />
      <StudioTelevision />
      <LiveHud />
      <div className="presenter-character" key={sequence?.job.id ?? "idle"} data-expression={state.expression} data-breathing={!sequence && state.breathing} data-reaction={latestReaction?.kind ?? "idle"}>
        <div className="presenter-torso-wrap"><img src={torso.url} alt="" className="presenter-torso" /></div>
        <div ref={headAnchorRef} className="presenter-head-anchor" data-idle={state.idleHead}>
          <div key={`g${state.headGesture.key}`} className="presenter-head" data-gesture={gesture ?? ""}>
            <img src={head.url} alt="Apresentador Fio Oculto" />
            <span className="presenter-mouth-mask" aria-hidden="true" />
            <svg className="presenter-mouth-live" viewBox="0 0 120 54" aria-hidden="true">
              <path className="mouth-closed" d="M8 10 Q60 48 112 10 Q91 53 60 48 Q29 53 8 10Z" />
              <path className="mouth-open" d="M8 8 Q60 50 112 8 Q110 50 60 52 Q10 50 8 8Z" />
              <path className="mouth-tongue" d="M38 39 Q60 31 82 39 Q74 51 60 50 Q46 50 38 39Z" />
            </svg>
            <span key={`b${state.blinkKey}`} className="presenter-eyelid left" data-blink={state.blinkKey > 0} />
            <span key={`c${state.blinkKey}`} className="presenter-eyelid right" data-blink={state.blinkKey > 0} />
            {state.expression === "happy" && <span className="presenter-blush" />}
            {state.expression === "surprised" && <span className="presenter-exclaim">!</span>}
          </div>
        </div>
      </div>

      <div className="presenter-cat-rest" key={`cat-${sequence?.job.id ?? "idle"}`} aria-hidden="true"><span className="presenter-cat-shadow" /><img src={cat} alt="" className="presenter-cat" /><span className="cine-cat-sleep">z Z z</span></div>
      <div className="channel-glitch" aria-label="Canal Fio Oculto">FIO OCULTO</div>
      <img src={desk.url} alt="" className="presenter-desk" />
      {sequence && <CinematicEffects key={sequence.job.id} sequence={sequence} />}
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
