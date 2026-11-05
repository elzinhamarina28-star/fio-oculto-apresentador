import { createFileRoute } from "@tanstack/react-router";
import { handleElevenLabsSpeech } from "@/lib/engine/elevenlabs";

function getRuntimeSecrets() {
  // Nitro exposes Cloudflare secrets through process.env during the request lifecycle.
  // Read them inside the handler, never at module initialization.
  const runtime = globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  };
  return runtime.process?.env ?? {};
}

export const Route = createFileRoute("/api/speech")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secrets = getRuntimeSecrets();
        return handleElevenLabsSpeech(request, {
          apiKey: secrets.ELEVENLABS_API_KEY,
          voiceId: secrets.ELEVENLABS_VOICE_ID,
          operatorToken: secrets.FIO_OPERATOR_TOKEN,
          modelId: secrets.ELEVENLABS_MODEL_ID,
        });
      },
    },
  },
});
