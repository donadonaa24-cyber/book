import type { Novel } from "../../../types/novel";
import { chaptersFromTextFiles } from "../../../lib/manuscript";

/**
 * 『EchoShion』の作品メタデータ。
 *
 * 本文は text/ フォルダのテキストファイル（1ファイル＝1章）。改稿版を収録している。
 * - ファイル名の順に並ぶ（00.txt = プロローグ, 01.txt = 第一章, …, 24.txt = エピローグ）
 * - 1行目が章タイトル、2行目以降が本文（書式は src/lib/manuscript.ts）
 * 作者による原稿は original/ に残している（本棚には読み込まない）。
 */
const texts = import.meta.glob<string>("./text/*.txt", { query: "?raw", import: "default", eager: true });

export const echoshion: Novel = {
  id: "echoshion",
  title: "EchoShion",
  subtitle: "みたらしとおはぎ",
  author: "あにあに",
  coverImage: "/assets/novels/echoshion/cover.svg",
  coverHasTitle: false,
  themeColor: "#0f1a2e",
  accentColor: "#9cc7ff",
  description: "記憶と声をめぐる近未来の物語。",
  writingMode: "vertical",
  chapters: chaptersFromTextFiles(texts),
};
