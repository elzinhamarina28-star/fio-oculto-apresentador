import type { Command } from "@/lib/presenter/types";

/**
 * Broadcast bus — panel (/) drives the clean OBS output (/broadcast) in the same browser
 * profile via BroadcastChannel. Cross-machine sync will need the backend later.
 */
export type BusMessage =
  | { type: "command"; cmd: Command }
  | { type: "scene"; sceneId: string }
  | { type: "caption"; text: string | null }
  | { type: "hello" };

const NAME = "fio-oculto-broadcast";

export function openBus(onMessage?: (m: BusMessage) => void) {
  if (typeof BroadcastChannel === "undefined") return { post: (_m: BusMessage) => {}, close: () => {} };
  const ch = new BroadcastChannel(NAME);
  if (onMessage) ch.onmessage = (ev) => onMessage(ev.data as BusMessage);
  return { post: (m: BusMessage) => ch.postMessage(m), close: () => ch.close() };
}

export function publishScene(sceneId: string) {
  const bus = openBus();
  bus.post({ type: "scene", sceneId });
  bus.close();
}
