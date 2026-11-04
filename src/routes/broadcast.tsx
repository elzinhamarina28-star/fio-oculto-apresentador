import { createFileRoute } from "@tanstack/react-router";
import { SpriteRig } from "@/components/presenter/SpriteRig";
import { usePresenter } from "@/lib/presenter/use-presenter";

export const Route = createFileRoute("/broadcast")({
  head: () => ({
    meta: [{ title: "Fio Oculto — Saída OBS" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: Broadcast,
});

function Broadcast() {
  const { state, removeReaction } = usePresenter("receive");

  return (
    <main className="broadcast-page" aria-label="Saída visual do Fio Oculto para OBS">
      <SpriteRig state={state} onReactionDone={removeReaction} />
    </main>
  );
}
