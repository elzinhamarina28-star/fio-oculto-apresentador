import { describe, expect, it } from "vitest";
import {
  handleElevenLabsSpeech,
  isAuthorizedSpeechRequest,
  isSameOriginRequest,
  validateSpeechText,
} from "@/lib/engine/elevenlabs";

const baseUrl = "https://fio-oculto.example/api/speech";
const token = "test-operator-token";

function request(
  headers: Record<string, string> = {},
  body = JSON.stringify({ text: "Olá, investigadores!" }),
) {
  return new Request(baseUrl, {
    method: "POST",
    headers: {
      origin: "https://fio-oculto.example",
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
      ...headers,
    },
    body,
  });
}

describe("ElevenLabs speech gateway validation", () => {
  it("accepts and trims valid speech text", () => {
    expect(validateSpeechText("  Olá!  ")).toEqual({ ok: true, text: "Olá!" });
  });

  it("rejects empty and overlong speech text", () => {
    expect(validateSpeechText("   ").ok).toBe(false);
    expect(validateSpeechText("x".repeat(601)).ok).toBe(false);
  });

  it("requires a same-origin browser request", () => {
    expect(isSameOriginRequest(request())).toBe(true);
    expect(isSameOriginRequest(request({ origin: "https://other.example" }))).toBe(false);
    expect(isSameOriginRequest(request({ origin: "" }))).toBe(false);
  });

  it("requires the configured operator bearer token", () => {
    expect(isAuthorizedSpeechRequest(request(), token)).toBe(true);
    expect(isAuthorizedSpeechRequest(request(), "another-token")).toBe(false);
    expect(isAuthorizedSpeechRequest(request(), undefined)).toBe(false);
  });

  it("rejects requests before contacting ElevenLabs when credentials are missing", async () => {
    const response = await handleElevenLabsSpeech(request(), {
      operatorToken: token,
    });
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: "A voz ainda não foi configurada no servidor.",
    });
  });

  it("rejects malformed JSON and invalid text", async () => {
    const malformed = await handleElevenLabsSpeech(request({}, "{"), {
      operatorToken: token,
      apiKey: "not-used",
      voiceId: "not-used",
    });
    expect(malformed.status).toBe(400);

    const empty = await handleElevenLabsSpeech(request({}, JSON.stringify({ text: " " })), {
      operatorToken: token,
      apiKey: "not-used",
      voiceId: "not-used",
    });
    expect(empty.status).toBe(400);
  });
});
