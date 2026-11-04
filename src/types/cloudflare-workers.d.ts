declare module "cloudflare:workers" {
  export const env: {
    ELEVENLABS_API_KEY?: string;
    ELEVENLABS_VOICE_ID?: string;
    ELEVENLABS_MODEL_ID?: string;
    FIO_OPERATOR_TOKEN?: string;
  };
}
