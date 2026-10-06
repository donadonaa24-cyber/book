import type { BgmMood } from "../../types/novel";
import type { Chord, MoodSpec } from "./moods";
import { MOODS } from "./moods";

/**
 * BGM の演奏エンジン（Web Audio）。
 * - 曲は moods.ts の設計図からその場で演奏する。雰囲気が変わると数秒かけてクロスフェードする
 * - ブラウザは操作の前に音を出せないため、最初のタップ・クリック・キー操作で AudioContext を作る
 * - タブが裏に回ったら止め、戻ったら再開する
 */

const LOOKAHEAD = 1.2; // 秒。これだけ先まで音を予約しておく
const TICK_MS = 150;
/** 音量スライダー 1.0 のときの実際の音量。BGM は本文の邪魔にならない小さめを基準にする */
const MAX_GAIN = 4;

const mtof = (n: number) => 440 * Math.pow(2, (n - 69) / 12);
const rand = (a: number, b: number) => a + Math.random() * (b - a);

function makeImpulse(ctx: AudioContext, seconds: number): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.8);
  }
  return buf;
}

/** 1つの雰囲気の演奏。止めるときはフェードアウトしてから後片付けする */
class Track {
  private out: GainNode;
  private dry: GainNode;
  private wet: GainNode;
  private timer = 0;
  private beat = 0;
  private nextTime: number;
  private startedAt: number;

  constructor(
    private ctx: AudioContext,
    private spec: MoodSpec,
    bus: AudioNode,
    reverb: AudioNode,
  ) {
    this.out = ctx.createGain();
    this.out.gain.value = 0;
    this.dry = ctx.createGain();
    this.wet = ctx.createGain();
    this.dry.gain.value = 1 - spec.reverb * 0.5;
    this.wet.gain.value = spec.reverb;
    this.out.connect(this.dry).connect(bus);
    this.out.connect(this.wet).connect(reverb);
    const now = ctx.currentTime;
    this.out.gain.setTargetAtTime(1, now + 0.3, 1.6);
    this.nextTime = now + 0.15;
    this.startedAt = now;
    this.timer = window.setInterval(() => this.schedule(), TICK_MS);
    this.schedule();
  }

  stop(fadeSeconds = 3) {
    const now = this.ctx.currentTime;
    this.out.gain.cancelScheduledValues(now);
    this.out.gain.setValueAtTime(this.out.gain.value, now);
    this.out.gain.setTargetAtTime(0, now, fadeSeconds / 4);
    window.clearInterval(this.timer);
    window.setTimeout(() => this.out.disconnect(), (fadeSeconds + 6) * 1000);
  }

  /** 0〜1。高揚は鳴り始めから少しずつ盛り上げる */
  private intensity(t: number) {
    const b = this.spec.buildSeconds;
    if (!b) return 1;
    return 0.55 + 0.45 * Math.min(1, (t - this.startedAt) / b);
  }

  private schedule() {
    const now = this.ctx.currentTime;
    // 処理が止まっていた（端末のスリープなど）ときは、過去の拍を一気に鳴らさず今から再開する
    if (this.nextTime < now - 0.2) this.nextTime = now + 0.05;
    const beatLen = 60 / this.spec.bpm;
    while (this.nextTime < now + LOOKAHEAD) {
      this.playBeat(this.beat, this.nextTime, beatLen);
      this.beat++;
      this.nextTime += beatLen;
    }
  }

  private playBeat(beat: number, t: number, beatLen: number) {
    const s = this.spec;
    const prog = s.progression;
    const inChord = beat % s.beatsPerChord;
    const chord = prog[Math.floor(beat / s.beatsPerChord) % prog.length];
    const k = this.intensity(t);

    if (inChord === 0) {
      this.pad(chord, t, s.beatsPerChord * beatLen, k);
      if (s.bass) this.bassNote(chord.bass, t, s.beatsPerChord * beatLen, s.bass.level * k);
    }
    if (s.bass?.pulse && inChord % 2 === 0 && inChord > 0) {
      this.bassNote(chord.bass + (inChord % 4 === 2 ? 12 : 0), t, beatLen * 1.5, s.bass.level * 0.6 * k);
    }

    if (s.arp) {
      const a = s.arp;
      const notes = this.arpNotes(chord, a.base);
      for (let i = 0; i < a.steps; i++) {
        const step = inChord * a.steps + i;
        // 和音の変わり目の1音目は必ず弾き、それ以外はときどき休む（毎回同じに聞こえないように）
        if (step !== 0 && Math.random() > a.prob * (0.7 + 0.3 * k)) continue;
        const idx = a.pattern[step % a.pattern.length];
        const st = t + (i * beatLen) / a.steps + rand(0, 0.018);
        this.keys(notes[idx % notes.length], st, a.level * rand(0.75, 1) * k, beatLen * 3);
      }
    }

    if (s.melody && inChord !== 0 && Math.random() < s.melody.prob) {
      const m = s.melody;
      const n = m.base + this.pickInScale(m.scale, chord);
      this.keys(n, t + rand(0, 0.05), m.level * rand(0.7, 1), beatLen * 4);
    }

    if (s.bells && Math.random() < s.bells.prob) {
      const b = s.bells;
      const n = b.base + b.scale[Math.floor(Math.random() * b.scale.length)] + (Math.random() < 0.3 ? 12 : 0);
      this.bell(n, t + rand(0, beatLen * 0.5), b.level * rand(0.6, 1));
    }

    if (s.ostinato) {
      for (let i = 0; i < 2; i++) this.pluck(chord.bass + 12, t + (i * beatLen) / 2, s.ostinato.level * (i ? 0.6 : 1));
    }

    if (s.heartbeat && beat % s.heartbeat.everyBeats === 0) {
      this.thump(t, s.heartbeat.level);
      this.thump(t + 0.24, s.heartbeat.level * 0.6);
    }
  }

  /** 和音の構成音を、base から上へ2オクターブ分並べる */
  private arpNotes(chord: Chord, base: number): number[] {
    const notes: number[] = [];
    for (let oct = 0; oct < 3; oct++) {
      for (const tone of chord.tones) {
        const n = chord.root + tone + 12 * oct;
        let m = n;
        while (m < base) m += 12;
        if (!notes.includes(m)) notes.push(m);
      }
    }
    return notes.sort((a, b) => a - b).slice(0, 6);
  }

  /** 音階の中から、今の和音に合う音を選びやすくする */
  private pickInScale(scale: number[], chord: Chord): number {
    const chordPcs = chord.tones.map((t) => (chord.root + t) % 12);
    const pool = scale.flatMap((n) => (chordPcs.includes(((n % 12) + 12) % 12) ? [n, n, n] : [n]));
    return pool[Math.floor(Math.random() * pool.length)];
  }

  private pad(chord: Chord, t: number, dur: number, k: number) {
    const { ctx } = this;
    const p = this.spec.pad;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = p.cutoff * (0.8 + 0.3 * k);
    filter.Q.value = 0.4;
    const g = ctx.createGain();
    const level = (p.level * 0.09 * k) / Math.sqrt(chord.tones.length);
    const attack = Math.min(2.2, dur * 0.35);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(level, t + attack);
    g.gain.setValueAtTime(level, t + dur - 0.2);
    g.gain.linearRampToValueAtTime(0, t + dur + 1.8);
    filter.connect(g).connect(this.out);
    const end = t + dur + 2;
    for (const tone of chord.tones) {
      let n = chord.root + tone + 48;
      while (n < 52) n += 12;
      while (n > 72) n -= 12;
      for (const det of [-7, 7]) {
        const o = ctx.createOscillator();
        o.type = p.wave;
        o.frequency.value = mtof(n);
        o.detune.value = det + rand(-2, 2);
        if (p.vibrato) {
          const lfo = ctx.createOscillator();
          const depth = ctx.createGain();
          lfo.frequency.value = rand(4.5, 5.5);
          depth.gain.value = p.vibrato;
          lfo.connect(depth).connect(o.detune);
          lfo.start(t);
          lfo.stop(end);
        }
        o.connect(filter);
        o.start(t);
        o.stop(end);
      }
    }
  }

  /** ピアノに近い減衰音 */
  private keys(n: number, t: number, level: number, decay: number) {
    const { ctx } = this;
    const g = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 2600;
    const peak = level * 0.12;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.006);
    g.gain.exponentialRampToValueAtTime(peak * 0.35, t + 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(1.6, decay));
    filter.connect(g).connect(this.out);
    const f = mtof(n);
    const partials: [number, OscillatorType, number][] = [
      [1, "triangle", 1],
      [2, "sine", 0.35],
      [3, "sine", 0.12],
    ];
    for (const [mul, type, amp] of partials) {
      const o = ctx.createOscillator();
      const pg = ctx.createGain();
      o.type = type;
      o.frequency.value = f * mul * (mul === 1 ? 1 : 1.0015);
      pg.gain.value = amp;
      o.connect(pg).connect(filter);
      o.start(t);
      o.stop(t + Math.max(1.6, decay) + 0.1);
    }
  }

  /** 鈴・オルゴール（倍音がずれた長い余韻） */
  private bell(n: number, t: number, level: number) {
    const { ctx } = this;
    const f = mtof(n);
    for (const [mul, amp, dec] of [
      [1, 1, 4.5],
      [2.76, 0.28, 2.2],
      [5.4, 0.08, 1.1],
    ]) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = f * mul;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(level * 0.07 * amp, t + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dec);
      o.connect(g).connect(this.out);
      o.start(t);
      o.stop(t + dec + 0.05);
    }
  }

  private bassNote(n: number, t: number, dur: number, level: number) {
    const { ctx } = this;
    const o = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o2.type = "triangle";
    o.frequency.value = mtof(n);
    o2.frequency.value = mtof(n);
    const peak = level * 0.16;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.04);
    g.gain.exponentialRampToValueAtTime(peak * 0.5, t + dur * 0.6);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.4);
    const g2 = ctx.createGain();
    g2.gain.value = 0.25;
    o.connect(g).connect(this.out);
    o2.connect(g2).connect(g);
    for (const x of [o, o2]) {
      x.start(t);
      x.stop(t + dur + 0.5);
    }
  }

  /** こもった短い刻み */
  private pluck(n: number, t: number, level: number) {
    const { ctx } = this;
    const o = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const g = ctx.createGain();
    o.type = "sawtooth";
    o.frequency.value = mtof(n);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(700, t);
    filter.frequency.exponentialRampToValueAtTime(180, t + 0.25);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(level * 0.1, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    o.connect(filter).connect(g).connect(this.out);
    o.start(t);
    o.stop(t + 0.35);
  }

  /** 心音のような低い鼓動 */
  private thump(t: number, level: number) {
    const { ctx } = this;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(72, t);
    o.frequency.exponentialRampToValueAtTime(38, t + 0.18);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(level * 0.35, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
    o.connect(g).connect(this.out);
    o.start(t);
    o.stop(t + 0.3);
  }
}

type Listener = () => void;

export interface BgmSettings {
  enabled: boolean;
  /** 0〜1 */
  volume: number;
}

const SETTINGS_KEY = "digital-bookshelf:bgm";
const DEFAULT_SETTINGS: BgmSettings = { enabled: true, volume: 0.5 };

function loadSettings(): BgmSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const d = JSON.parse(raw) as Partial<BgmSettings>;
    return {
      enabled: typeof d.enabled === "boolean" ? d.enabled : DEFAULT_SETTINGS.enabled,
      volume: typeof d.volume === "number" ? Math.min(1, Math.max(0, d.volume)) : DEFAULT_SETTINGS.volume,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

class BgmEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private bus: GainNode | null = null;
  private reverb: ConvolverNode | null = null;
  private track: Track | null = null;
  private playingMood: BgmMood | null = null;
  /** 読書画面が求めている雰囲気（null = 読書画面の外） */
  private wanted: BgmMood | null = null;
  private listeners = new Set<Listener>();
  settings: BgmSettings = loadSettings();

  constructor() {
    if (typeof window === "undefined") return;
    // 音はユーザー操作の中でしか鳴らし始められないので、操作のたびに再開を試みる
    const unlock = () => this.unlock();
    for (const ev of ["pointerdown", "touchend", "keydown"]) window.addEventListener(ev, unlock, { capture: true, passive: true });
    document.addEventListener("visibilitychange", () => this.onVisibility());
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => void this.listeners.delete(fn);
  }

  private emit() {
    for (const fn of this.listeners) fn();
  }

  /** いま流している（流そうとしている）雰囲気 */
  get mood(): BgmMood | null {
    return this.wanted;
  }

  /** ブラウザに止められていて、まだ音が出ていない */
  get blocked(): boolean {
    return !!this.ctx && this.ctx.state !== "running" && !document.hidden;
  }

  private ensureContext(): AudioContext | null {
    if (this.ctx) return this.ctx;
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    try {
      // iPhone のマナーモードでも BGM を鳴らせるようにする（対応ブラウザのみ）
      const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
      if (session) session.type = "playback";
    } catch {
      /* 未対応 */
    }
    const ctx = new AC();
    const master = ctx.createGain();
    master.gain.value = this.targetGain();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20;
    comp.ratio.value = 3;
    master.connect(comp).connect(ctx.destination);
    const bus = ctx.createGain();
    bus.connect(master);
    const reverb = ctx.createConvolver();
    reverb.buffer = makeImpulse(ctx, 3.6);
    reverb.connect(master);
    this.ctx = ctx;
    this.master = master;
    this.bus = bus;
    this.reverb = reverb;
    ctx.addEventListener("statechange", () => this.emit());
    return ctx;
  }

  private targetGain() {
    const v = this.settings.volume;
    return v * v * MAX_GAIN;
  }

  private unlock() {
    if (!this.wanted || !this.settings.enabled) return;
    const ctx = this.ensureContext();
    if (ctx && ctx.state !== "running" && !document.hidden) void ctx.resume().catch(() => {});
    this.sync();
  }

  private onVisibility() {
    if (!this.ctx) return;
    if (document.hidden) void this.ctx.suspend().catch(() => {});
    else if (this.wanted && this.settings.enabled) void this.ctx.resume().catch(() => {});
  }

  /** 読書画面から、今のページの雰囲気を伝える。null で BGM を止める（本を閉じたとき） */
  setMood(mood: BgmMood | null) {
    if (mood === this.wanted) return;
    this.wanted = mood;
    if (mood && this.settings.enabled) {
      const ctx = this.ensureContext();
      if (ctx && ctx.state !== "running" && !document.hidden) void ctx.resume().catch(() => {});
    }
    this.sync();
    this.emit();
  }

  /** 求められている雰囲気と、実際に流している曲を揃える */
  private sync() {
    const target = this.settings.enabled && this.wanted && this.wanted !== "無音" ? this.wanted : null;
    if (target === this.playingMood) return;
    this.track?.stop(target ? 4 : 2.5);
    this.track = null;
    this.playingMood = null;
    if (!target || !this.ctx || !this.bus || !this.reverb) return;
    this.track = new Track(this.ctx, MOODS[target], this.bus, this.reverb);
    this.playingMood = target;
  }

  private save() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch {
      /* 保存できない環境でも動作は続ける */
    }
  }

  setEnabled(enabled: boolean) {
    this.settings = { ...this.settings, enabled };
    this.save();
    if (enabled && this.wanted) {
      const ctx = this.ensureContext();
      if (ctx && ctx.state !== "running") void ctx.resume().catch(() => {});
    }
    this.sync();
    this.emit();
  }

  setVolume(volume: number) {
    this.settings = { ...this.settings, volume: Math.min(1, Math.max(0, volume)) };
    this.save();
    if (this.ctx && this.master) this.master.gain.setTargetAtTime(this.targetGain(), this.ctx.currentTime, 0.08);
    this.emit();
  }
}

export const bgm = new BgmEngine();
