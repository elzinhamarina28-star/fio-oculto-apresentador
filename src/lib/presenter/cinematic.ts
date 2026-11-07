import type { LiveEvent } from '@/lib/engine/events';
import { findGift, type SfxName } from '@/lib/engine/gifts';

export const EFFECTS = ['fire', 'lightning', 'ice', 'explosion', 'gravity', 'portal', 'dance', 'shy', 'hearts', 'stars', 'confetti', 'energy'] as const;
export type CinematicEffect = typeof EFFECTS[number];
export const EFFECT_NAMES: Record<CinematicEffect, string> = { fire: 'Fogo', lightning: 'Raio', ice: 'Gelo', explosion: 'Explosão mágica', gravity: 'Gravidade invertida', portal: 'Portal misterioso', dance: 'Dança de seguidor', shy: 'Vergonha por curtidas', hearts: 'Corações', stars: 'Estrelas', confetti: 'Confetes', energy: 'Energia e moedas fictícias' };
export const CAT_ACTIONS = ['flee', 'catch', 'papers', 'climb', 'bite', 'sleep', 'surprise', 'dance', 'watch'] as const;
export type CatAction = typeof CAT_ACTIONS[number];
export const CAT_NAMES: Record<CatAction, string> = { flee: 'Fugir', catch: 'Pegar partículas', papers: 'Derrubar papéis', climb: 'Subir no apresentador', bite: 'Morder a roupa', sleep: 'Dormir', surprise: 'Aparecer de surpresa', dance: 'Dançar', watch: 'Observar' };
export interface ReactionProfile { effect: CinematicEffect; motion: CinematicEffect; duration: number; intensity: number; cat: CatAction; sound: SfxName | 'none'; line: string; enabled: boolean; particles: boolean; lighting: boolean; character: boolean; catEnabled: boolean; voice: boolean; }
export type Profiles = Record<CinematicEffect, ReactionProfile>;
export const DEFAULT_PROFILES: Profiles = Object.fromEntries(EFFECTS.map(effect => [effect, {
  effect, motion: effect, duration: effect === 'shy' ? 4500 : 6500, intensity: 2,
  cat: ({ fire: 'flee', lightning: 'surprise', ice: 'sleep', explosion: 'papers', gravity: 'climb', portal: 'surprise', dance: 'dance', shy: 'watch', hearts: 'catch', stars: 'catch', confetti: 'bite', energy: 'papers' } as Record<CinematicEffect, CatAction>)[effect],
  sound: effect === 'shy' ? 'none' : effect === 'explosion' ? 'boom' : effect === 'dance' ? 'fanfare' : 'whoosh',
  line: ({ fire: '{user}, o estúdio virou uma churrasqueira mágica! Sobrevivi à brincadeira!', lightning: '{user}, agora sou o super-herói das pistas perdidas!', ice: '{user}, congelei! Gato, traz um cobertor!', explosion: 'Cadê meus arquivos? {user}, você explodiu minha organização!', gravity: '{user}, até a papelada resolveu tirar férias da gravidade!', portal: 'Voltei! {user}, do outro lado também tinha boleto!', dance: '{user}, obrigado por seguir! Essa dança é oficialmente suspeita!', shy: 'Tantas curtidas! Vou me esconder um pouquinho, mas estou vendo tudo!', hearts: 'Obrigado pelo carinho, {user}! O gato ficou com ciúmes!', stars: '{user}, essa pista merece uma estrela!', confetti: '{user}, o gato vai ter que ajudar na faxina!', energy: '{user}, essas moedas são de brincadeira, mas a comemoração é real!' } as Record<CinematicEffect, string>)[effect],
  enabled: true, particles: true, lighting: true, character: true, catEnabled: true, voice: true,
}])) as Profiles;
export interface CinematicJob { id: string; event: LiveEvent; effect: CinematicEffect; priority: number; variant: number; likeLevel: 1 | 2 | 3; aggregated: number; }
export function likeLevel(count: number): 1 | 2 | 3 { return count >= 1000 ? 3 : count >= 100 ? 2 : 1; }
export function effectForEvent(event: LiveEvent, bindings: Record<string, CinematicEffect>): CinematicEffect {
  if (event.kind === 'follow') return 'dance';
  if (event.kind === 'likes') return 'shy';
  if (event.giftId && bindings[event.giftId]) return bindings[event.giftId] ?? 'stars';
  const gift = findGift(event.giftName, event.diamonds ?? 1);
  if (gift.id === 'galaxy') return 'gravity';
  if (gift.id === 'universe') return 'portal';
  if (gift.id === 'lion') return 'explosion';
  if (gift.effect === 'hearts') return 'hearts';
  if (event.tier === 'legendary') return 'energy';
  if (event.tier === 'special') return 'energy';
  return gift.effect === 'confetti' ? 'confetti' : 'stars';
}
const SPECIAL: CinematicEffect[] = ['fire', 'lightning', 'ice', 'explosion', 'gravity', 'portal'];
/** Session queue: never evicts accepted events and never preempts an active sequence. */
export class CinematicQueue {
  private pending: CinematicJob[] = [];
  private seen = new Set<string>();
  private dance = 0;
  enqueue(event: LiveEvent, effect: CinematicEffect): boolean {
    if (this.seen.has(event.id)) return false;
    this.seen.add(event.id);
    if (event.kind === 'likes') {
      const existing = this.pending.find(job => job.event.kind === 'likes' && job.event.source === event.source && job.effect === effect);
      if (existing) {
        const count = Math.max(existing.event.count ?? 0, event.count ?? 0);
        existing.event = { ...existing.event, count, delta: (existing.event.delta ?? 0) + (event.delta ?? 0) };
        existing.likeLevel = likeLevel(count); existing.aggregated++; return true;
      }
    }
    this.pending.push({ id: event.id, event, effect, priority: SPECIAL.includes(effect) ? 100 : event.kind === 'follow' ? 60 : event.kind === 'gift' ? 50 : 20, variant: effect === 'dance' ? this.dance++ % 5 : 0, likeLevel: likeLevel(event.count ?? 0), aggregated: 1 });
    return true;
  }
  next(): CinematicJob | undefined {
    const best = this.pending.reduce((index, job, i, all) => job.priority > (all[index]?.priority ?? -1) ? i : index, 0);
    return this.pending.splice(best, 1)[0];
  }
  snapshot() { return [...this.pending]; }
}
