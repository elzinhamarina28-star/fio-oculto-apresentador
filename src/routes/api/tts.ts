import { createFileRoute } from "@tanstack/react-router";

/**
 * Presenter voice (ElevenLabs). The API key stays on the server.
 * Default voice: premade male voice with the multilingual model speaking pt-BR.
 * Library voices (e.g. a native Brazilian voice) need a paid ElevenLabs plan;
 * set ELEVENLABS_VOICE_ID to switch without code changes.
 */
const DEFAULT_VOICE = "TX3LPaxmHKxFdv7VOQHJ";
const MAX_CHARS = 600;

export const Route = createFileRoute("/api/tts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env["ELEVENLABS_API_KEY"];
        if (!key) return Response.json({ error: "Voz não conectada" }, { status: 503 });
        let text = "";
        try {
          const body = (await request.json()) as { text?: unknown };
          text = typeof body.text === "string" ? body.text.trim() : "";
        } catch {
          return Response.json({ error: "Pedido inválido" }, { status: 400 });
        }
        if (!text || text.length > MAX_CHARS)
          return Response.json({ error: "Texto vazio ou longo demais" }, { status: 400 });

        const voice = process.env["ELEVENLABS_VOICE_ID"] || DEFAULT_VOICE;
        const res = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`,
          {
            method: "POST",
            signal: request.signal,
            headers: { "xi-api-key": key, "Content-Type": "application/json" },
            body: JSON.stringify({
              text,
              model_id: "eleven_multilingual_v2",
              language_code: "pt",
              voice_settings: { stability: 0.4, similarity_boost: 0.75, style: 0.45, use_speaker_boost: true },
            }),
          },
        );
        if (!res.ok) {
          const detail = await res.text();
          console.error(`ElevenLabs TTS failed [${res.status}]: ${detail}`);
          return Response.json({ error: `Falha na voz (${res.status})`, detail }, { status: 502 });
        }
        return new Response(res.body, {
          headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
        });
      },
    },
  },
});
