/**
 * Scene-to-music routing for Fio Oculto.
 *
 * Audio files are intentionally not referenced until the final MP3 assets are
 * committed under public/audio. This keeps the OBS output from requesting
 * missing files while preserving the agreed scene plan.
 */
export type LiveSceneId =
  | "investigacao"
  | "conversa"
  | "gato"
  | "dossie"
  | "modo-caos"
  | "transicao"
  | "descoberta"
  | "encerramento";

export interface SceneMusic {
  sceneId: LiveSceneId;
  trackNumber: number;
  trackId: string;
  title: string;
  loop: boolean;
  duckDuringSpeech: boolean;
}

export const SCENE_MUSIC: Record<LiveSceneId, SceneMusic> = {
  investigacao: {
    sceneId: "investigacao",
    trackNumber: 11,
    trackId: "sala-de-investigacao",
    title: "Sala de Investigação",
    loop: true,
    duckDuringSpeech: true,
  },
  conversa: {
    sceneId: "conversa",
    trackNumber: 13,
    trackId: "cafe-com-suspeita",
    title: "Café com Suspeita",
    loop: true,
    duckDuringSpeech: true,
  },
  gato: {
    sceneId: "gato",
    trackNumber: 15,
    trackId: "o-gato-esta-observando",
    title: "O Gato Está Observando",
    loop: true,
    duckDuringSpeech: true,
  },
  dossie: {
    sceneId: "dossie",
    trackNumber: 12,
    trackId: "arquivo-secreto",
    title: "Arquivo Secreto",
    loop: true,
    duckDuringSpeech: true,
  },
  "modo-caos": {
    sceneId: "modo-caos",
    trackNumber: 14,
    trackId: "teoria-maluca",
    title: "Teoria Maluca",
    loop: true,
    duckDuringSpeech: true,
  },
  transicao: {
    sceneId: "transicao",
    trackNumber: 19,
    trackId: "intervalo-curioso",
    title: "Intervalo Curioso",
    loop: false,
    duckDuringSpeech: true,
  },
  descoberta: {
    sceneId: "descoberta",
    trackNumber: 17,
    trackId: "pista-encontrada",
    title: "Pista Encontrada",
    loop: false,
    duckDuringSpeech: true,
  },
  encerramento: {
    sceneId: "encerramento",
    trackNumber: 20,
    trackId: "encerramento-em-aberto",
    title: "Encerramento em Aberto",
    loop: false,
    duckDuringSpeech: true,
  },
};

export function getMusicForScene(sceneId: string): SceneMusic | null {
  return Object.prototype.hasOwnProperty.call(SCENE_MUSIC, sceneId)
    ? SCENE_MUSIC[sceneId as LiveSceneId]
    : null;
}
