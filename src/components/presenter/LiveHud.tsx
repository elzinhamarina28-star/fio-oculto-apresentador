import { useEffect, useState } from "react";
import type { LiveEvent } from "@/lib/engine/events";

const FOLLOWER_GOAL = 20_000;
const GIFT_GOAL = 5_000;
type HudState = { comments: LiveEvent[]; likes: number; followers: number; diamonds: number; likers: Record<string, number>; latestFollower: string };
const initial: HudState = { comments: [], likes: 0, followers: 0, diamonds: 0, likers: {}, latestFollower: "" };
const compact = (n: number) => Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 }).format(n);

export function LiveHud() {
  const [data, setData] = useState<HudState>(initial);
  useEffect(() => {
    const receive = (event: Event) => {
      const item = (event as CustomEvent<LiveEvent>).detail;
      if (!item || item.source !== "tiktok-live") return;
      setData((old) => {
        const next = { ...old, comments: [...old.comments], likers: { ...old.likers } };
        if (item.kind === "comment") next.comments = [...next.comments, item].slice(-5);
        if (item.kind === "likes") {
          const amount = Math.max(1, item.count ?? 1);
          next.likes = Math.max(next.likes, item.count ?? (next.likes + (item.delta ?? amount)));
          if (item.user) next.likers[item.user] = (next.likers[item.user] ?? 0) + (item.delta ?? amount);
        }
        if (item.kind === "follow") { next.followers += 1; next.latestFollower = item.user || "Novo seguidor"; }
        if (item.kind === "gift") next.diamonds += (item.diamonds ?? 0) * Math.max(1, item.count ?? 1);
        return next;
      });
    };
    window.addEventListener("fio:live-event", receive);
    return () => window.removeEventListener("fio:live-event", receive);
  }, []);
  useEffect(() => {
    if (!data.latestFollower) return;
    const timer = window.setTimeout(() => setData((old) => ({ ...old, latestFollower: "" })), 6000);
    return () => window.clearTimeout(timer);
  }, [data.latestFollower]);
  const top = Object.entries(data.likers).sort((a,b) => b[1]-a[1]).slice(0,3);
  return <div className="live-hud" aria-live="polite">
    <div className="live-hud-brand"><span className="live-hud-eye">◉</span><strong>@FioOculto</strong><em>Desvende o inexplicável... juntos!</em></div>
    <div className="live-hud-goals">
      <div className="live-hud-card live-hud-goal-line"><span>✦ Seguidores</span><b>{compact(data.followers)} / {compact(FOLLOWER_GOAL)}</b></div>
      <div className="live-hud-card live-hud-goal-line"><span>🎁 Presentes</span><b>{compact(data.diamonds)} / {compact(GIFT_GOAL)} diamantes</b></div>
    </div>
    <div className="live-hud-likes live-hud-card"><strong>♥ Curtidas</strong><b>{compact(data.likes)}</b><small>{top.length ? top.map(([name,count])=>`${name} · ${compact(count)}`).join(" | ") : "Sem curtidas ainda"}</small></div>
    <div className="live-hud-comments live-hud-card"><strong>💬 Chat</strong>{data.comments.length ? data.comments.map((c)=><p key={c.id}><b>{c.user || "Visitante"}</b><span>{c.text}</span></p>) : <p>Aguardando mensagens...</p>}</div>
    {data.latestFollower && <div className="live-hud-follow-alert"><strong>✦ Novo seguidor</strong><b>{data.latestFollower}</b><span>Bem-vindo!</span></div>}
    <div className="live-hud-actions"><span>☆<small>Seguir</small></span><span>♡<small>Curtir</small></span><span>♙<small>Presente</small></span><span>↗<small>Compartilhar</small></span></div>
  </div>;
}
