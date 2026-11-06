import { createFileRoute } from "@tanstack/react-router";

/**
 * Presenter voice (ElevenLabs). The API key stays on the server.
 * Default voice: premade male voice with the multilingual model speaking pt-BR.
 * Library voices (e.g. a native Brazilian voice) need a paid ElevenLabs plan;
 * set ELEVENLABS_VOICE_ID to switch without code changes.
 */
const DEFAULT_VOICE = "TX3LPaxmHKxFdv7VOQHJ";
const MAX_CHARS = 600;
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 30;
const requests = new Map<string, { startedAt: number; count: number }>();

export const Route = createFileRoute("/api/tts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const requestUrl = new URL(request.url);
        const origin = request.headers.get("origin");
        if (origin) {
          try {
            if (new URL(origin).origin !== requestUrl.origin) {
              return Response.json({ error: "Origem não autorizada." }, { status: 403 });
            }
          } catch {
            return Response.json({ error: "Origem inválida." }, { status: 403 });
          }
        }
        const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
        const now = Date.now();
        const current = requests.get(ip);
        if (!current || now - current.startedAt >= RATE_WINDOW_MS) {
          requests.set(ip, { startedAt: now, count: 1 });
        } else if (current.count >= RATE_LIMIT) {
          return Response.json({ error: "Limite temporário de falas atingido. Aguarde um minuto." }, { status: 429 });
        } else {
          current.count += 1;
        }
        if (requests.size > 1000) {
          for (const [key, value] of requests) if (now - value.startedAt >= RATE_WINDOW_MS) requests.delete(key);
        }

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
          console.error(`ElevenLabs TTS failed [${res.status}]`);
          return Response.json({ error: "Não foi possível gerar a fala agora." }, { status: 502 });
        }
        return new Response(res.body, {
          headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
        });
      },
    },
  },
});
