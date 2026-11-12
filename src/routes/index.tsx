import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SpriteRig } from "@/components/presenter/SpriteRig";
import { ControlPanel } from "@/components/presenter/ControlPanel";
import { MusicPanel } from "@/components/presenter/MusicPanel";
import { LiveAssistantPanel } from "@/components/presenter/LiveAssistantPanel";
import { usePresenter } from "@/lib/presenter/use-presenter";
import { useCinematic } from "@/lib/presenter/use-cinematic";
import { CinematicPanel } from "@/components/presenter/CinematicPanel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fio Oculto — Apresentador da Live" },
      { name: "description", content: "Apresentador animado da live interativa Fio Oculto com painel de teste de animações." },
      { property: "og:title", content: "Fio Oculto — Apresentador da Live" },
      { property: "og:description", content: "Apresentador animado da live interativa Fio Oculto." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { state, dispatch, toggle, removeReaction } = usePresenter();
  const [useVrm, setUseVrm] = useState(true);
  const cinematic = useCinematic();
  return (
    <main className="presenter-page">
      <SpriteRig state={state} onReactionDone={removeReaction} sequence={cinematic.active} useVrm={useVrm} />
      <div className="side-col">
        <button type="button" className="cp-btn seed-san-toggle" data-on={useVrm} onClick={() => setUseVrm((current) => !current)}>
          {useVrm ? "Voltar ao apresentador antigo" : "Experimentar Seed-san 3D"}
        </button>
        <CinematicPanel controller={cinematic} />
        <ControlPanel state={state} dispatch={dispatch} toggle={toggle} />
        <LiveAssistantPanel dispatch={dispatch} />
        <MusicPanel />
      </div>
    </main>
  );
}
