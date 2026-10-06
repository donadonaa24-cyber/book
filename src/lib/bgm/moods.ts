import type { BgmMood } from "../../types/novel";

/**
 * BGM の曲の設計図。音源ファイルは使わず、ここに書いたコード進行とパラメータから
 * Web Audio で毎回その場で演奏する（著作権・容量・費用の心配がない）。
 * 演奏はランダムに揺らぐので、同じ雰囲気でも毎回少しずつ違うフレーズになる。
 */

const NOTE: Record<string, number> = { C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11 };
const QUALITY: Record<string, number[]> = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  "7": [0, 4, 7, 10],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  add9: [0, 4, 7, 14],
  madd9: [0, 3, 7, 14],
  m6: [0, 3, 7, 9],
  "maj7#11": [0, 4, 7, 11, 18],
};

export interface Chord {
  /** ベース音（MIDI ノート番号、C2〜B2 あたり） */
  bass: number;
  /** 和音の構成音（ルートからの半音数） */
  tones: number[];
  /** ルート（0〜11） */
  root: number;
}

/** "F:maj7" や "E/D:maj"（分数コード）を和音にする */
function chord(spec: string): Chord {
  const [name, quality = "maj"] = spec.split(":");
  const [rootName, bassName] = name.split("/");
  const root = NOTE[rootName];
  const bassPc = bassName ? NOTE[bassName] : root;
  return { root, bass: 36 + bassPc, tones: QUALITY[quality] };
}

export interface MoodSpec {
  bpm: number;
  /** 1つの和音を何拍鳴らすか */
  beatsPerChord: number;
  progression: Chord[];
  /** 柔らかい和音の持続音 */
  pad: { wave: OscillatorType; cutoff: number; level: number; vibrato?: number };
  /** ピアノのような分散和音。steps は1拍あたりの音数、pattern は和音の何番目の音を弾くか */
  arp?: { steps: number; pattern: number[]; prob: number; level: number; base: number };
  /** 音階から気まぐれに拾う、高い音の旋律 */
  melody?: { scale: number[]; prob: number; level: number; base: number };
  /** 鈴やオルゴールのような、余韻の長い高音 */
  bells?: { scale: number[]; prob: number; level: number; base: number };
  bass?: { level: number; pulse?: boolean };
  /** 低い同じ音の刻み（緊張感） */
  ostinato?: { level: number };
  /** 心音のような低い鼓動 */
  heartbeat?: { everyBeats: number; level: number };
  /** 残響の量（0〜1） */
  reverb: number;
  /** 鳴り始めてから最大の盛り上がりに達するまでの秒数（高揚用。省略時は最初から一定） */
  buildSeconds?: number;
}

// 音階は C を 0 とした半音数（melody / bells の base は C の音にする）
const MAJOR = [0, 2, 4, 5, 7, 9, 11];
const A_MINOR = [9, 11, 12, 14, 16, 17, 19];
const D_LYDIAN = [2, 4, 6, 8, 9, 11, 13];
const PENTA = [0, 2, 4, 7, 9];

export const MOODS: Record<Exclude<BgmMood, "無音">, MoodSpec> = {
  // 物語の入り口・独白。和音がゆっくり移り変わり、ときどき高い音がひとつ落ちる
  静寂: {
    bpm: 54,
    beatsPerChord: 8,
    progression: ["C:add9", "A:madd9", "F:maj7", "G:sus2"].map(chord),
    pad: { wave: "triangle", cutoff: 950, level: 0.55 },
    melody: { scale: PENTA, prob: 0.22, level: 0.32, base: 72 },
    bass: { level: 0.25 },
    reverb: 0.55,
  },
  // 何気ない日々。王道進行（IV–V–iii–vi）をピアノの分散和音で
  日常: {
    bpm: 76,
    beatsPerChord: 8,
    progression: ["F:maj7", "G:maj", "E:min7", "A:min7", "D:min7", "G:sus4", "C:add9", "C:add9"].map(chord),
    pad: { wave: "triangle", cutoff: 1100, level: 0.32 },
    arp: { steps: 2, pattern: [0, 2, 1, 3, 2, 1, 4, 2], prob: 0.72, level: 0.36, base: 60 },
    melody: { scale: MAJOR, prob: 0.1, level: 0.26, base: 72 },
    bass: { level: 0.38 },
    reverb: 0.35,
  },
  // 喪失・回想。イ短調のゆっくりしたピアノ
  切ない: {
    bpm: 60,
    beatsPerChord: 8,
    progression: ["A:madd9", "F:maj7", "D:min7", "E:sus4", "A:min7", "F:maj7", "C:add9", "E:7"].map(chord),
    pad: { wave: "triangle", cutoff: 900, level: 0.42 },
    arp: { steps: 1, pattern: [0, 2, 1, 3, 4, 2, 3, 1], prob: 0.85, level: 0.4, base: 57 },
    melody: { scale: A_MINOR, prob: 0.2, level: 0.3, base: 60 },
    bass: { level: 0.34 },
    reverb: 0.5,
  },
  // 不穏・対峙。低い持続音、刻み、心音
  緊張: {
    bpm: 72,
    beatsPerChord: 8,
    progression: ["D:min", "Bb:maj", "D:min", "A:sus4", "D:min", "G:min", "Bb/D:maj", "A:7"].map(chord),
    pad: { wave: "sawtooth", cutoff: 520, level: 0.4 },
    melody: { scale: [2, 3, 9, 10], prob: 0.08, level: 0.2, base: 72 },
    bass: { level: 0.42 },
    ostinato: { level: 0.3 },
    heartbeat: { everyBeats: 2, level: 0.55 },
    reverb: 0.4,
  },
  // クライマックス。vi–IV–I–V を弦のような和音と速い分散和音で。鳴り始めから少しずつ盛り上がる
  高揚: {
    bpm: 74,
    beatsPerChord: 4,
    progression: ["A:min", "F:maj", "C:maj", "G:maj", "A:min", "F:maj7", "G:sus4", "G:maj"].map(chord),
    pad: { wave: "sawtooth", cutoff: 1500, level: 0.48, vibrato: 4 },
    arp: { steps: 2, pattern: [0, 1, 2, 3, 4, 3, 2, 1], prob: 0.95, level: 0.36, base: 57 },
    melody: { scale: A_MINOR, prob: 0.16, level: 0.3, base: 60 },
    bass: { level: 0.5, pulse: true },
    reverb: 0.45,
    buildSeconds: 45,
  },
  // 結末のあと。IV から iv へ沈む、あたたかい終止
  余韻: {
    bpm: 58,
    beatsPerChord: 8,
    progression: ["C:maj7", "A:min7", "F:maj7", "F:m6"].map(chord),
    pad: { wave: "triangle", cutoff: 1000, level: 0.45 },
    arp: { steps: 1, pattern: [4, 3, 2, 1, 2, 3], prob: 0.55, level: 0.32, base: 60 },
    bells: { scale: MAJOR, prob: 0.12, level: 0.18, base: 84 },
    bass: { level: 0.3 },
    reverb: 0.6,
  },
  // 宇宙・意識・夢。リディアンの浮遊する和音と鈴
  幻想: {
    bpm: 52,
    beatsPerChord: 8,
    progression: ["D:add9", "E/D:maj", "B:madd9", "G:maj7#11"].map(chord),
    pad: { wave: "sine", cutoff: 1500, level: 0.6, vibrato: 2 },
    bells: { scale: D_LYDIAN, prob: 0.3, level: 0.22, base: 72 },
    bass: { level: 0.25 },
    reverb: 0.75,
  },
};
