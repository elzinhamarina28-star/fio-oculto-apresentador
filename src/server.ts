import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

async function handleSpeech(request: Request, env: unknown): Promise<Response> {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const bindings = (env ?? {}) as Record<string, unknown>;
  const apiKey = typeof bindings.ELEVENLABS_API_KEY === "string" ? bindings.ELEVENLABS_API_KEY : "";
  if (!apiKey) return Response.json({ error: "ElevenLabs não configurado. Adicione ELEVENLABS_API_KEY como secret no ambiente de deploy." }, { status: 503 });
  let payload: { text?: unknown };
  try { payload = await request.json() as { text?: unknown }; }
  catch { return Response.json({ error: "JSON inválido." }, { status: 400 }); }
  if (typeof payload.text !== "string" || !payload.text.trim() || payload.text.length > 700) {
    return Response.json({ error: "Envie um texto entre 1 e 700 caracteres." }, { status: 400 });
  }
  const voiceId = "X3j2R63Qu4Gdv6dsU2hB";
  const upstream = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "content-type": "application/json", accept: "audio/mpeg" },
    body: JSON.stringify({
      text: payload.text.trim(),
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.42, similarity_boost: 0.78, style: 0.35, use_speaker_boost: true },
    }),
  });
  if (!upstream.ok) {
    const detail = (await upstream.text()).slice(0, 500);
    console.error("ElevenLabs TTS error", upstream.status, detail);
    return Response.json({ error: "Não foi possível gerar a fala no ElevenLabs.", providerStatus: upstream.status }, { status: 502 });
  }
  return new Response(upstream.body, { headers: { "content-type": "audio/mpeg", "cache-control": "no-store" } });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const url = new URL(request.url);
    if (url.pathname === "/api/tts") return handleSpeech(request, env);
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
