import { createFileRoute } from "@tanstack/react-router";
import { ChristmasLive } from "@/components/presenter/ChristmasLive";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Natal Interativo · Fio Oculto" },
      { name: "description", content: "Uma sala natalina interativa para TikTok LIVE." },
    ],
  }),
  component: ChristmasLive,
});
