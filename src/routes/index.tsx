import { createFileRoute } from "@tanstack/react-router";
import { SpriteRig } from "@/components/presenter/SpriteRig";
import { ControlPanel } from "@/components/presenter/ControlPanel";
import { MusicPanel } from "@/components/presenter/MusicPanel";
import { usePresenter } from "@/lib/presenter/use-presenter";

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
  return (
    <main className="presenter-page">
      <SpriteRig state={state} onReactionDone={removeReaction} />
      <div className="side-col">
        <ControlPanel state={state} dispatch={dispatch} toggle={toggle} />
        <MusicPanel />
      </div>
    </main>
  );
}
