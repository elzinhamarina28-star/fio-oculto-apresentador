import { useCallback, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SpriteRig } from "@/components/presenter/SpriteRig";
import { usePresenter } from "@/lib/presenter/use-presenter";

export const Route = createFileRoute("/broadcast")({
  head: () => ({
    meta: [
      { title: "Fio Oculto — OBS Broadcast" },
      { name: "description", content: "Cena limpa do apresentador Fio Oculto para transmissão." },
    ],
  }),
  component: Broadcast,
});

function Broadcast() {
  const { state, removeReaction } = usePresenter();
  const [audioReady, setAudioReady] = useState(false);
  const enableAudio = useCallback(() => {
    window.dispatchEvent(new Event("fio:tv-enable-voice"));
    setAudioReady(true);
  }, []);

  return (
    <main className="broadcast-page">
      <SpriteRig state={state} onReactionDone={removeReaction} useVrm />
      {!audioReady && (
        <button className="broadcast-audio" type="button" onClick={enableAudio}>
          Ativar áudio da transmissão
        </button>
      )}
    </main>
  );
}
