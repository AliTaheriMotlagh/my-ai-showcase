import { int, mulberry32, pick } from "./random";

/**
 * Plays a short, seed-determined melody with the Web Audio API so "music" posts
 * have a real preview without shipping audio files. Only one track plays at a time.
 */

export interface SynthHandle {
  ctx: AudioContext;
  startedAt: number;
  duration: number;
  stop: () => void;
}

const SCALES = [
  [0, 2, 4, 7, 9],
  [0, 3, 5, 7, 10],
  [0, 2, 3, 7, 8],
  [0, 2, 4, 5, 7, 9, 11],
];

let current: SynthHandle | null = null;

export function playSynth({ seed, bpm, seconds, onEnd }: { seed: number; bpm: number; seconds: number; onEnd: () => void }): SynthHandle {
  current?.stop();
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctx();
  const r = mulberry32(seed);
  const scale = pick(r, SCALES);
  const root = 196 * 2 ** (int(r, 0, 7) / 12);
  const step = 60 / bpm / 2;
  const steps = Math.floor(seconds / step);

  const master = ctx.createGain();
  master.gain.value = 0.16;
  master.connect(ctx.destination);
  const delay = ctx.createDelay();
  delay.delayTime.value = step * 3;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.28;
  delay.connect(feedback).connect(delay);
  delay.connect(master);

  const lead = Array.from({ length: 16 }, () => (r() < 0.65 ? scale[int(r, 0, scale.length - 1)] + (r() < 0.25 ? 12 : 0) : null));
  const chords = Array.from({ length: 4 }, () => scale[int(r, 0, scale.length - 1)]);
  const t0 = ctx.currentTime + 0.05;

  const note = (freq: number, t: number, len: number, type: OscillatorType, vol: number) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.connect(g);
    g.connect(master);
    g.connect(delay);
    o.start(t);
    o.stop(t + len + 0.05);
  };

  const kick = (t: number) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.15);
    g.gain.setValueAtTime(0.7, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    o.connect(g);
    g.connect(master);
    o.start(t);
    o.stop(t + 0.25);
  };

  for (let i = 0; i < steps; i++) {
    const t = t0 + i * step;
    const n = lead[i % 16];
    if (n !== null) note(root * 2 ** (n / 12), t, step * 1.6, "triangle", 0.5);
    if (i % 8 === 0) note((root / 2) * 2 ** (chords[Math.floor(i / 8) % 4] / 12), t, step * 7, "sine", 0.6);
    if (bpm > 90 && i % 4 === 0) kick(t);
  }

  const duration = steps * step;
  let stopped = false;
  const handle: SynthHandle = {
    ctx,
    startedAt: t0,
    duration,
    stop: () => {
      if (stopped) return;
      stopped = true;
      window.clearTimeout(timer);
      ctx.close().catch(() => {});
      if (current === handle) current = null;
      onEnd();
    },
  };
  const timer = window.setTimeout(() => handle.stop(), (duration + 1.2) * 1000);
  current = handle;
  return handle;
}
