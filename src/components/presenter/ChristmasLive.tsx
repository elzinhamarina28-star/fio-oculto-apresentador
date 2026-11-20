import { useEffect, useMemo, useRef, useState } from "react";

type Guest = { id: string; name: string; avatar?: string; diamonds: number; joinedAt: number };
type LivePacket = { event?: string; data?: Record<string, unknown> };
const text = (v: unknown) => typeof v === "string" ? v : "";
const number = (v: unknown) => typeof v === "number" && Number.isFinite(v) ? v : 0;

export function ChristmasLive() {
  const [status, setStatus] = useState("Desconectado · abra o TikFinity neste computador");
  const [guests, setGuests] = useState<Guest[]>([]);
  const [current, setCurrent] = useState<Guest | null>(null);
  const [leader, setLeader] = useState<Guest | null>(null);
  const [lastLine, setLastLine] = useState("Ho, ho, ho! A porta da nossa casa está aberta. Quem chegou para conversar?");
  const [events, setEvents] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const queueRef = useRef<Guest[]>([]);
  const seenRef = useRef(new Set<string>());

  const connect = () => {
    if (wsRef.current && wsRef.current.readyState < WebSocket.CLOSING) return;
    setStatus("Conectando ao TikFinity em localhost:21213…");
    const ws = new WebSocket("ws://localhost:21213/");
    wsRef.current = ws;
    ws.onopen = () => setStatus("Conectado ao TikFinity · aguardando eventos reais");
    ws.onerror = () => setStatus("Não foi possível conectar. Confirme TikFinity aberto neste mesmo computador.");
    ws.onclose = () => { if (wsRef.current === ws) { wsRef.current = null; setStatus("Desconectado do TikFinity"); } };
    ws.onmessage = (message) => {
      try {
        const packet = JSON.parse(String(message.data)) as LivePacket;
        const data = packet.data ?? {};
        const nested = (data.user && typeof data.user === "object" ? data.user : {}) as Record<string, unknown>;
        const name = text(data.nickname) || text(data.uniqueId) || text(nested.nickname) || text(nested.uniqueId) || "Visitante";
        const id = text(data.userId) || text(data.secUid) || text(nested.userId) || name;
        const avatar = text(data.profilePictureUrl) || text(data.avatarUrl) || text(nested.profilePictureUrl) || text(nested.avatarUrl);
        if (packet.event === "roomUser" || packet.event === "member") {
          const guest: Guest = { id, name, avatar, diamonds: 0, joinedAt: Date.now() };
          setGuests(prev => prev.some(g => g.id === id) ? prev : [guest, ...prev].slice(0, 30));
          queueRef.current.push(guest);
          setCurrent(prev => prev ?? guest);
          setLastLine(`Ho, ho, ho! Seja bem-vindo, ${name}! Puxe uma cadeira e me conte: o que você gostaria de ganhar neste Natal?`);
          setEvents(prev => [`${name} entrou na sala`, ...prev].slice(0, 8));
        }
        if (packet.event === "gift") {
          const giftName = text(data.giftName) || "presente";
          const diamonds = number(data.diamondCount) * Math.max(1, number(data.repeatCount) || 1);
          setGuests(prev => {
            const found = prev.find(g => g.id === id);
            const next = found
              ? prev.map(g => g.id === id ? { ...g, diamonds: g.diamonds + diamonds, avatar: avatar || g.avatar } : g)
              : [{ id, name, avatar, diamonds, joinedAt: Date.now() }, ...prev];
            const winner = [...next].sort((a,b) => b.diamonds - a.diamonds)[0];
            setLeader(winner ?? null);
            if (winner?.id === id) setLastLine(`OH, OH, OH! ${name} trouxe ${giftName}! Você está na liderança e pode se tornar meu ajudante!`);
            setEvents(old => [`${name} enviou ${giftName} · ${diamonds} diamantes`, ...old].slice(0,8));
            return next;
          });
        }
        if (packet.event === "chat") {
          const comment = text(data.comment);
          if (comment) {
            setCurrent({ id, name, avatar, diamonds: 0, joinedAt: Date.now() });
            setLastLine(`${name}, recebi sua mensagem: “${comment.slice(0,120)}”. O que mais você quer me contar?`);
            setEvents(prev => [`${name}: ${comment}`, ...prev].slice(0,8));
          }
        }
      } catch { /* ignora frames malformados do provedor */ }
    };
  };

  useEffect(() => () => wsRef.current?.close(), []);
  const sorted = useMemo(() => [...guests].sort((a,b) => b.diamonds - a.diamonds), [guests]);
  const seatNext = () => {
    const next = queueRef.current.shift();
    if (next) { setCurrent(next); setLastLine(`Que alegria receber você, ${next.name}! Sente-se pertinho da árvore. Como está sua noite?`); }
  };

  return <main className="xmas-app">
    <header className="xmas-top"><div><span className="xmas-eyebrow">FIO OCULTO APRESENTA</span><h1>Noite de Natal</h1><p>Uma visita especial à casa do Papai Noel</p></div><button className="xmas-connect" onClick={connect}>✦ Conectar TikFinity</button></header>
    <section className="xmas-room" aria-label="Sala de Natal interativa">
      <div className="xmas-window"><span>❄　❄　❄</span><small>NOITE DE NATAL</small></div>
      <div className="xmas-garland">✦ ❋ ✦ ❋ ✦ ❋ ✦ ❋ ✦</div>
      <div className="xmas-tree"><span className="tree-star">★</span><span className="tree-lights">●　●　●<br/>　●　●<br/>●　●　●</span><span className="tree-trunk"/></div>
      <div className="xmas-fire"><span>🔥</span><small>LAREIRA ACESA</small></div>
      <div className="xmas-santa"><div className="santa-hat">🎅</div><div className="santa-body"><span>🎅</span></div><div className="santa-label">PAPAI NOEL</div></div>
      <div className="xmas-guest-seat">{current ? <><div className="guest-avatar">{current.avatar ? <img src={current.avatar} alt="" /> : "👤"}</div><strong>{current.name}</strong><span>está conversando com Noel</span><button onClick={seatNext}>Próximo visitante</button></> : <><div className="empty-seat">🪑</div><strong>Poltrona do visitante</strong><span>Aguardando alguém entrar na live</span></>}</div>
      <div className="xmas-helper">{leader ? <><div className="helper-avatar">{leader.avatar ? <img src={leader.avatar} alt="" /> : "🎁"}</div><strong>{leader.name}</strong><span>AJUDANTE DO PAPAI NOEL</span></> : <><div className="helper-avatar">🎁</div><strong>Quem será o ajudante?</strong><span>Envie presentes para disputar a liderança</span></>}</div>
      <div className="xmas-snow">❄　　✦　　 ❄　　　✧　　❄</div>
    </section>
    <section className="xmas-bottom">
      <article className="xmas-card xmas-dialogue"><span className="xmas-eyebrow">PAPAI NOEL DIZ</span><p>{lastLine}</p><small>As falas são reações automáticas aos eventos recebidos.</small></article>
      <article className="xmas-card"><span className="xmas-eyebrow">CONEXÃO AO VIVO</span><p className="xmas-status">{status}</p><span className="xmas-eyebrow">ÚLTIMOS EVENTOS</span>{events.length ? events.map((e,i)=><p className="xmas-event" key={i}>{e}</p>) : <small>Nenhum evento recebido ainda.</small>}</article>
      <article className="xmas-card"><span className="xmas-eyebrow">RANKING DE PRESENTES</span>{sorted.slice(0,5).map((g,i)=><div className="xmas-rank" key={g.id}><b>{i+1}.</b><span>{g.name}</span><strong>{g.diamonds} 💎</strong></div>)}{!sorted.length && <small>O ranking aparece quando os presentes chegarem.</small>}</article>
    </section>
    <footer>Para receber eventos reais, mantenha o TikFinity aberto no mesmo computador que exibe esta página. A conexão local não funciona em celular remoto.</footer>
  </main>;
}
