export interface ElevenLabsSpeechConfig {
  apiKey?: string;
  voiceId?: string;
  operatorToken?: string;
  modelId?: string;
}

export type SpeechTextResult =
  | { ok: true; text: string }
  | { ok: false; error: string };

const MAX_SPEECH_CHARACTERS = 600;
const MAX_REQUEST_BYTES = 8_192;

export function validateSpeechText(value: unknown): SpeechTextResult {
  if (typeof value !== "string") return { ok: false, error: "Texto inválido." };
  const text = value.trim();
  if (!text) return { ok: false, error: "Digite um texto para falar." };
  if (text.length > MAX_SPEECH_CHARACTERS) {
    return { ok: false, error: `O texto deve ter no máximo ${MAX_SPEECH_CHARACTERS} caracteres.` };
  }
  return { ok: true, text };
}

export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function constantTimeEquals(left: string, right: string): boolean {
  const a = new TextEncoder().encode(left);
  const b = new TextEncoder().encode(right);
  if (a.length !== b.length) return false;

  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a[i] ^ b[i];
  return mismatch === 0;
}

export function isAuthorizedSpeechRequest(request: Request, operatorToken?: string): boolean {
  if (!operatorToken) return false;
  const authorization = request.headers.get("authorization") ?? "";
  const prefix = "Bearer ";
  if (!authorization.startsWith(prefix)) return false;
  return constantTimeEquals(authorization.slice(prefix.length), operatorToken);
}

function jsonError(message: string, status: number): Response {
  return Response.json({ error: message }, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

/**
 * Server-side ElevenLabs proxy. The API key and operator token never reach the browser bundle.
 * Audio is streamed through without buffering the full response in memory.
 */
export async function handleElevenLabsSpeech(
  request: Request,
  config: ElevenLabsSpeechConfig,
): Promise<Response> {
  if (request.method !== "POST") return jsonError("Método não permitido.", 405);
  if (!isSameOriginRequest(request)) return jsonError("Origem não autorizada.", 403);
  if (!isAuthorizedSpeechRequest(request, config.operatorToken)) {
    return jsonError("Acesso não autorizado.", 401);
  }
  if (!config.apiKey || !config.voiceId) {
    return jsonError("A voz ainda não foi configurada no servidor.", 503);
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_REQUEST_BYTES) return jsonError("Solicitação muito grande.", 413);

  let payload: unknown;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_REQUEST_BYTES) {
      return jsonError("Solicitação muito grande.", 413);
    }
    payload = JSON.parse(raw);
  } catch {
    return jsonError("Corpo JSON inválido.", 400);
  }

  const text = validateSpeechText(
    payload && typeof payload === "object" ? (payload as { text?: unknown }).text : undefined,
  );
  if (!text.ok) return jsonError(text.error, 400);

  const endpoint = new URL(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(config.voiceId)}/stream`,
  );
  endpoint.searchParams.set("output_format", "mp3_44100_128");

  let upstream: Response;
  try {
    upstream = await fetch(endpoint, {
      method: "POST",
      headers: {
        "xi-api-key": config.apiKey,
        "content-type": "application/json",
        accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: text.text,
        model_id: config.modelId || "eleven_flash_v2_5",
        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.75,
          style: 0.15,
          use_speaker_boost: true,
        },
      }),
      signal: request.signal,
    });
  } catch {
    return jsonError("Não foi possível conectar ao serviço de voz.", 502);
  }

  if (!upstream.ok || !upstream.body) {
    // Do not forward upstream response bodies: they may contain provider details.
    return jsonError(
      upstream.status === 429
        ? "Limite de geração de voz atingido. Tente novamente mais tarde."
        : "O serviço de voz não conseguiu gerar o áudio.",
      upstream.status === 429 ? 429 : 502,
    );
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "content-type": upstream.headers.get("content-type") || "audio/mpeg",
      "cache-control": "no-store, no-cache, must-revalidate",
      "x-content-type-options": "nosniff",
    },
  });
}
