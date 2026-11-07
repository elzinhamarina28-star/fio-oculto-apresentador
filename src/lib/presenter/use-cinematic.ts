import { useCallback, useEffect, useRef, useState } from 'react';
import type { LiveEvent } from '@/lib/engine/events';
import { playSfx } from '@/lib/engine/sfx';
import { CinematicQueue, DEFAULT_PROFILES, effectForEvent, type CinematicEffect, type CinematicJob, type Profiles, type ReactionProfile } from './cinematic';
export interface ActiveSequence { job: CinematicJob; profile: ReactionProfile; phase: 'intro' | 'main' | 'outro'; }
export function useCinematic() {
  const [profiles, setProfiles] = useState<Profiles>(DEFAULT_PROFILES);
  const [bindings, setBindings] = useState<Record<string, CinematicEffect>>({});
  const [active, setActive] = useState<ActiveSequence | null>(null);
  const [pending, setPending] = useState<CinematicJob[]>([]);
  const [lastGift, setLastGift] = useState<{ id: string; name: string } | null>(null);
  const queue = useRef(new CinematicQueue());
  const playing = useRef(false);
  const settings = useRef({ profiles, bindings });
  settings.current = { profiles, bindings };
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const pump = useRef<() => void>(() => {});
  pump.current = () => {
    if (playing.current) return;
    const job = queue.current.next();
    setPending(queue.current.snapshot());
    if (!job) return;
    const profile = { ...settings.current.profiles[job.effect] };
    playing.current = true;
    setActive({ job, profile, phase: 'intro' });
    if (profile.enabled && profile.sound !== 'none') window.dispatchEvent(new CustomEvent('fio:cinematic-sound', { detail: profile.sound }));
    const duration = Math.max(2000, Math.min(12000, profile.duration));
    timers.current = [
      setTimeout(() => setActive({ job, profile, phase: 'main' }), duration * .2),
      setTimeout(() => setActive({ job, profile, phase: 'outro' }), duration * .8),
      setTimeout(() => {
        if (profile.voice) window.dispatchEvent(new CustomEvent('fio:cinematic-finish', { detail: { event: job.event, line: profile.line.replaceAll('{user}', job.event.user || 'pessoal') } }));
        setActive(null); playing.current = false;
        timers.current = [setTimeout(() => pump.current(), 240)];
      }, duration),
    ];
  };
  const enqueue = useCallback((event: LiveEvent, override?: CinematicEffect) => {
    if (event.kind === 'comment') return;
    if (event.kind === 'gift' && event.source === 'tiktok-live' && event.giftId) setLastGift({ id: event.giftId, name: event.giftName || 'Presente' });
    queue.current.enqueue(event, override ?? effectForEvent(event, settings.current.bindings));
    setPending(queue.current.snapshot()); pump.current();
  }, []);
  useEffect(() => {
    const listener = (event: Event) => enqueue((event as CustomEvent<LiveEvent>).detail);
    window.addEventListener('fio:live-event', listener);
    return () => { window.removeEventListener('fio:live-event', listener); timers.current.forEach(clearTimeout); };
  }, [enqueue]);
  const preview = useCallback((effect: CinematicEffect, count = 500) => enqueue({ id: `preview-${crypto.randomUUID()}`, kind: effect === 'dance' ? 'follow' : effect === 'shy' ? 'likes' : 'gift', source: 'demo', at: Date.now(), user: 'Pré-visualização', count, tier: 'legendary' }, effect), [enqueue]);
  // SFX ownership remains in the existing audio-unlock panel.
  void playSfx;
  return { active, pending, profiles, setProfiles, bindings, setBindings, lastGift, preview, enqueue };
}
