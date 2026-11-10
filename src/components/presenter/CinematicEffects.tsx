import type { CSSProperties } from 'react';
import { EFFECT_NAMES } from '@/lib/presenter/cinematic';
import type { ActiveSequence } from '@/lib/presenter/use-cinematic';
export function CinematicEffects({ sequence }: { sequence: ActiveSequence }) {
  const { job, profile, phase } = sequence;
  const effect = profile.effect;
  const glyphs = { fire: ['🔥', '✦', '🔥'], lightning: ['ϟ', '⚡', 'ϟ'], ice: ['❄', '◇', '❄'], explosion: ['✦', '▰', '✧'], gravity: ['▤', '✉', '▱'], portal: ['✧', '◇', '✦'], dance: ['▰', '✦', '▱'], shy: ['♥', '♡', '♥'], hearts: ['♥', '♡', '♥'], stars: ['★', '✧', '✦'], confetti: ['▰', '▱', '✦'], energy: ['🪙', '★', '✦'] }[effect];
  return <div className="cinematic-layer" data-effect={effect} data-phase={phase} data-intensity={profile.intensity} data-enabled={profile.enabled} data-lighting={profile.lighting} aria-hidden="true">
    <div className="cine-light" />
    <div className="cine-ring" />
    <div className="cine-wave" />
    <div className="cine-smoke"><span /><span /><span /></div>
    <div className="cine-floor" />
    {profile.particles && Array.from({ length: profile.intensity * 10 }, (_, i) => <span key={i} className="cine-particle" style={{ '--p': i, '--x': `${(i * 37 + 7) % 96}%`, '--delay': `${(i % 8) * 110}ms` } as CSSProperties}>{glyphs[i % glyphs.length]}</span>)}
    {profile.catEnabled && profile.cat === 'papers' && <div className="cine-papers">{'▤\u3000▱\u3000✉'}</div>}
    <div className="cine-caption">{EFFECT_NAMES[job.effect]}{job.effect === 'dance' ? ` · ${job.variant + 1}/5` : job.effect === 'shy' ? ` · nível ${job.likeLevel}` : ''}<small>{job.event.source === 'demo' ? 'PRÉ-VISUALIZAÇÃO · NÃO É EVENTO REAL' : `TikTok LIVE · ${job.event.user || 'espectador'}`}</small></div>
  </div>;
}
