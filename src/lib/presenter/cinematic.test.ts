import { describe, expect, it } from 'vitest';
import { CinematicQueue, DEFAULT_PROFILES, EFFECTS, effectForEvent, likeLevel, type CinematicEffect } from './cinematic';
import type { LiveEvent } from '@/lib/engine/events';
const event = (id: string, kind: LiveEvent['kind'] = 'gift', extra: Partial<LiveEvent> = {}): LiveEvent => ({ id, kind, source:'demo', at:0, tier:'common', ...extra });
describe('Cinematic event rules', () => {
  it('retains 200 accepted gift events without eviction', () => { const q = new CinematicQueue(); for(let i=0;i<200;i++) q.enqueue(event(String(i)), 'stars'); expect(q.snapshot()).toHaveLength(200); });
  it('special effects precede common pending events without losing them', () => { const q=new CinematicQueue(); q.enqueue(event('common'), 'hearts'); q.enqueue(event('special'), 'fire'); expect(q.next()?.id).toBe('special'); expect(q.next()?.id).toBe('common'); });
  it('an active sequence is never preempted', () => { const q=new CinematicQueue(); q.enqueue(event('active'), 'stars'); const active=q.next(); q.enqueue(event('later'), 'portal'); expect(active?.id).toBe('active'); expect(q.next()?.id).toBe('later'); });
  it('cycles through at least five follower dance variations', () => { const q=new CinematicQueue(); for(let i=0;i<5;i++)q.enqueue(event(String(i),'follow'),'dance'); expect(Array.from({length:5},()=>q.next()?.variant)).toEqual([0,1,2,3,4]); });
  it('defines three like levels with concrete boundaries', () => { expect([1,99,100,999,1000,5000].map(likeLevel)).toEqual([1,1,2,2,3,3]); });
  it('aggregates frequent likes preserving deltas and packet count', () => { const q=new CinematicQueue(); q.enqueue(event('a','likes',{count:50,delta:50}),'shy'); q.enqueue(event('b','likes',{count:150,delta:100}),'shy'); expect(q.snapshot()).toHaveLength(1); expect(q.next()).toMatchObject({ aggregated:2, likeLevel:2, event:{count:150,delta:150} }); });
  it('deduplicates a repeated packet',()=>{ const q=new CinematicQueue(); expect(q.enqueue(event('a'),'fire')).toBe(true); expect(q.enqueue(event('a'),'fire')).toBe(false); expect(q.snapshot()).toHaveLength(1); });
  it('uses incoming real gift ID associations before names',()=>{ expect(effectForEvent(event('a','gift',{giftId:'observed-123',giftName:'Rosa'}),{'observed-123':'ice'})).toBe('ice'); });
  it('has complete bounded profiles for all eight requested simulations',()=>{ const effects:CinematicEffect[]=['fire','lightning','ice','explosion','gravity','portal','dance','shy']; expect(effects.every(e=>EFFECTS.includes(e))).toBe(true); for(const e of effects) expect(DEFAULT_PROFILES[e].duration).toBeGreaterThanOrEqual(2000); });
  it('keeps demo like aggregates separate from real likes',()=>{ const q=new CinematicQueue(); q.enqueue(event('a','likes'),'shy'); q.enqueue(event('b','likes',{source:'tiktok-live'}),'shy'); expect(q.snapshot()).toHaveLength(2); });
});
