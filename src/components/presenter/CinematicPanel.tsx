import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EFFECTS, EFFECT_NAMES, CAT_ACTIONS, CAT_NAMES, type CinematicEffect, type ReactionProfile } from '@/lib/presenter/cinematic';
import type { useCinematic } from '@/lib/presenter/use-cinematic';
import { useState } from 'react';
export function CinematicPanel({ controller }: { controller: ReturnType<typeof useCinematic> }) {
  const [selected, setSelected] = useState<CinematicEffect>('fire');
  const [giftId, setGiftId] = useState('');
  const [count, setCount] = useState(500);
  const { profiles, setProfiles, preview, active, pending, bindings, setBindings, lastGift } = controller;
  const profile = profiles[selected];
  const update = (patch: Partial<ReactionProfile>) => setProfiles(previous => ({ ...previous, [selected]: { ...previous[selected], ...patch } }));
  return <section className="cinematic-panel">
    <header><h2>Direção de reações</h2><p role="status">{active ? `${EFFECT_NAMES[active.job.effect]} · ${active.phase === 'intro' ? 'Entrada' : active.phase === 'main' ? 'Em cena' : 'Retorno'}` : 'Estúdio em repouso'} · {pending.length} na fila</p></header>
    <div className="cine-preview-grid">{EFFECTS.slice(0, 8).map(effect => <Button key={effect} variant="ghost" className="cp-btn" aria-label={`Pré-visualizar ${EFFECT_NAMES[effect]}`} onClick={() => preview(effect, count)}><Play />{EFFECT_NAMES[effect]}</Button>)}</div>
    <label>Reação<select value={selected} onChange={e => setSelected(e.target.value as CinematicEffect)}>{EFFECTS.map(effect => <option key={effect} value={effect}>{EFFECT_NAMES[effect]}</option>)}</select></label>
    <label>Personagem<select aria-label="Modelo de personagem" value="original" onChange={() => {}}><option value="original">Fio Oculto · desenho atual</option></select></label>
    <label>Movimento<select value={profile.motion} onChange={e => update({ motion: e.target.value as CinematicEffect })}>{EFFECTS.map(effect => <option key={effect} value={effect}>{EFFECT_NAMES[effect]}</option>)}</select></label>
    <label>Efeito visual<select value={profile.effect} onChange={e => update({ effect: e.target.value as CinematicEffect })}>{EFFECTS.map(effect => <option key={effect} value={effect}>{EFFECT_NAMES[effect]}</option>)}</select></label>
    <label>Duração · {profile.duration / 1000}s<input type="range" min="2000" max="12000" step="500" value={profile.duration} onChange={e => update({ duration: Number(e.target.value) })} /></label>
    <label>Intensidade · {profile.intensity}<input type="range" min="1" max="3" value={profile.intensity} onChange={e => update({ intensity: Number(e.target.value) })} /></label>
    <label>Som<select value={profile.sound} onChange={e => update({ sound: e.target.value as ReactionProfile['sound'] })}>{['none', 'pop', 'chime', 'fanfare', 'boom', 'meow', 'whoosh'].map(sound => <option key={sound} value={sound}>{sound === 'none' ? 'Sem som' : sound}</option>)}</select></label>
    <label>Gato<select value={profile.cat} onChange={e => update({ cat: e.target.value as ReactionProfile['cat'] })}>{CAT_ACTIONS.map(cat => <option key={cat} value={cat}>{CAT_NAMES[cat]}</option>)}</select></label>
    <label>Fala ElevenLabs<textarea rows={3} value={profile.line} onChange={e => update({ line: e.target.value })} /></label>
    <div className="cine-toggles">{([['enabled', 'Reação'], ['particles', 'Partículas'], ['lighting', 'Luzes'], ['character', 'Movimento'], ['catEnabled', 'Gato'], ['voice', 'Voz']] as const).map(([key, name]) => <label key={key}><input type="checkbox" checked={profile[key]} onChange={e => update({ [key]: e.target.checked })} />{name}</label>)}</div>
    <label>Curtidas · nível 1: 1–99 / 2: 100–999 / 3: 1.000+<input aria-label="Quantidade de curtidas" type="number" min="1" value={count} onChange={e => setCount(Math.max(1, Number(e.target.value)))} /></label>
    <Button className="cp-btn" variant="ghost" onClick={() => preview(selected, count)}><Play />Pré-visualizar seleção</Button>
    <fieldset><legend>Associar ao ID recebido do TikFinity</legend>{lastGift && <p>Último presente real: {lastGift.name} · ID {lastGift.id}</p>}<label>ID do presente<input value={giftId} onChange={e => setGiftId(e.target.value)} maxLength={80} /></label><Button className="cp-btn" variant="ghost" disabled={!giftId.trim()} onClick={() => { setBindings(previous => ({ ...previous, [giftId.trim()]: selected })); setGiftId(''); }}>Associar a {EFFECT_NAMES[selected]}</Button>{Object.entries(bindings).map(([id, effect]) => <div className="cine-binding" key={id}><span>{id} → {EFFECT_NAMES[effect]}</span><Button variant="ghost" size="sm" aria-label={`Remover associação ${id}`} onClick={() => setBindings(previous => Object.fromEntries(Object.entries(previous).filter(([key]) => key !== id)))}>×</Button></div>)}</fieldset>
    {pending.length > 0 && <details><summary>Fila · {pending.length}</summary><ol>{pending.map(job => <li key={job.id}>{EFFECT_NAMES[job.effect]} · {job.event.user}{job.aggregated > 1 ? ` · ${job.aggregated} grupos de curtidas` : ''}</li>)}</ol></details>}
  </section>;
}
