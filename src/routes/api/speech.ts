import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import { handleElevenLabsSpeech } from "@/lib/engine/elevenlabs";

export const Route = createFileRoute("/api/speech")({
  server: {
    handlers: {
      POST: async ({ request }) =>
        handleElevenLabsSpeech(request, {
          apiKey: env.ELEVENLABS_API_KEY,
          voiceId: env.ELEVENLABS_VOICE_ID,
          operatorToken: env.FIO_OPERATOR_TOKEN,
          modelId: env.ELEVENLABS_MODEL_ID,
        }),
    },
  },
});
