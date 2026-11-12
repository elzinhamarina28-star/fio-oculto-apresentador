import { useEffect, useRef } from "react";
import { onMouthLevel } from "@/lib/engine/voice-provider";

const MODEL_URL =
  "https://cdn.jsdelivr.net/gh/vrm-c/vrm-specification@d8d08d785e68a5db7318ae9caa8837e7ae02aaed/samples/Seed-san/vrm/Seed-san.vrm";

type Vector3Like = { set: (x: number, y: number, z: number) => void };
type CameraLike = {
  position: Vector3Like;
  lookAt: (x: number, y: number, z: number) => void;
  updateProjectionMatrix: () => void;
};
type SceneLike = { add: (...objects: unknown[]) => void; background: unknown };
type RendererLike = {
  domElement: HTMLCanvasElement;
  setPixelRatio: (ratio: number) => void;
  setSize: (width: number, height: number) => void;
  render: (scene: SceneLike, camera: CameraLike) => void;
  dispose: () => void;
};
type ClockLike = { getDelta: () => number };
type ThreeApi = {
  Scene: new () => SceneLike;
  PerspectiveCamera: new (fov: number, aspect: number, near: number, far: number) => CameraLike;
  WebGLRenderer: new (options: { canvas: HTMLCanvasElement; alpha: boolean; antialias: boolean }) => RendererLike;
  Color: new (color: string) => unknown;
  AmbientLight: new (color: number, intensity: number) => unknown;
  DirectionalLight: new (color: number, intensity: number) => { position: Vector3Like };
  Clock: new () => ClockLike;
};
type VrmLike = {
  scene: {
    position: Vector3Like;
    scale: Vector3Like;
    traverse: (callback: (node: { frustumCulled: boolean }) => void) => void;
  };
  expressionManager?: { setValue: (name: string, value: number) => void };
  update: (delta: number) => void;
};
type LoaderApi = {
  GLTFLoader: new () => {
    register: (plugin: (parser: unknown) => unknown) => void;
    loadAsync: (url: string) => Promise<{ userData: { vrm?: VrmLike } }>;
  };
};
type VrmApi = { VRMLoaderPlugin: new (parser: unknown) => unknown };

async function loadModule<T>(url: string): Promise<T> {
  return (await import(/* @vite-ignore */ url)) as T;
}

export function SkeletalRig({
  expression,
  blinkKey,
  onReady,
}: {
  expression: "neutral" | "happy" | "surprised";
  blinkKey: number;
  onReady: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const vrmRef = useRef<VrmLike | null>(null);
  const mouthRef = useRef(0);
  const expressionRef = useRef(expression);
  expressionRef.current = expression;

  useEffect(() => {
    const manager = vrmRef.current?.expressionManager;
    if (!manager) return;
    manager.setValue("blink", 1);
    const timer = window.setTimeout(() => manager.setValue("blink", 0), 140);
    return () => window.clearTimeout(timer);
  }, [blinkKey]);

  useEffect(() => {
    const manager = vrmRef.current?.expressionManager;
    if (!manager) return;
    manager.setValue("happy", expression === "happy" ? 1 : 0);
    manager.setValue("surprised", expression === "surprised" ? 1 : 0);
  }, [expression]);

  useEffect(() => onMouthLevel((level) => {
    mouthRef.current = Math.max(0, Math.min(1, level));
    vrmRef.current?.expressionManager?.setValue("aa", mouthRef.current);
  }), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false;
    let frame = 0;
    let renderer: RendererLike | null = null;
    let resizeObserver: ResizeObserver | null = null;

    const start = async () => {
      try {
        const [three, loaderModule, vrmModule] = await Promise.all([
          loadModule<ThreeApi>("https://esm.sh/three@0.180.0"),
          loadModule<LoaderApi>("https://esm.sh/three@0.180.0/examples/jsm/loaders/GLTFLoader.js"),
          loadModule<VrmApi>("https://esm.sh/@pixiv/three-vrm@3.5.5?deps=three@0.180.0"),
        ]);
        if (disposed) return;

        const host = canvas.parentElement;
        if (!host) return;
        const scene = new three.Scene();
        scene.background = null;
        const camera = new three.PerspectiveCamera(30, 1, 0.1, 30);
        camera.position.set(0, 1.12, 3.25);
        camera.lookAt(0, 0.92, 0);

        renderer = new three.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
        const resize = () => {
          const width = Math.max(1, host.clientWidth);
          const height = Math.max(1, host.clientHeight);
          camera.updateProjectionMatrix();
          renderer?.setSize(width, height);
        };
        resize();
        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(host);

        scene.add(new three.AmbientLight(0xffffff, 1.45));
        const keyLight = new three.DirectionalLight(0xffffff, 2.1);
        keyLight.position.set(1.5, 2.5, 3);
        scene.add(keyLight);
        const fillLight = new three.DirectionalLight(0x8fa8ff, 0.65);
        fillLight.position.set(-2, 1, -2);
        scene.add(fillLight);

        const loader = new loaderModule.GLTFLoader();
        loader.register((parser) => new vrmModule.VRMLoaderPlugin(parser));
        const gltf = await loader.loadAsync(MODEL_URL);
        if (disposed) return;
        const vrm = gltf.userData.vrm;
        if (!vrm) throw new Error("O arquivo carregou, mas não contém um personagem VRM válido.");

        vrm.scene.position.set(0, 0, 0);
        vrm.scene.scale.set(1, 1, 1);
        vrm.scene.traverse((node) => { node.frustumCulled = false; });
        scene.add(vrm.scene);
        vrmRef.current = vrm;
        vrm.expressionManager?.setValue("happy", expressionRef.current === "happy" ? 1 : 0);
        vrm.expressionManager?.setValue("surprised", expressionRef.current === "surprised" ? 1 : 0);
        vrm.expressionManager?.setValue("aa", mouthRef.current);
        onReady();

        const clock = new three.Clock();
        const animate = () => {
          if (disposed || !renderer) return;
          const delta = Math.min(clock.getDelta(), 0.05);
          vrm.update(delta);
          renderer.render(scene, camera);
          frame = window.requestAnimationFrame(animate);
        };
        animate();
      } catch (error) {
        if (!disposed) {
          console.error("[Fio Oculto] Não foi possível carregar o Seed-san:", error);
          canvas.dataset.loadError = "true";
          canvas.parentElement?.setAttribute("data-load-error", "true");
        }
      }
    };

    void start();
    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      vrmRef.current = null;
      renderer?.dispose();
    };
  }, [onReady]);

  return (
    <div className="seed-san-layer" aria-label="Apresentador 3D Seed-san">
      <canvas ref={canvasRef} className="seed-san-canvas" />
      <span className="seed-san-credit">Seed-san model by VirtualCast, Inc. · VRM Public License 1.0</span>
    </div>
  );
}
