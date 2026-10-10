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
const chapters = chaptersFromTextFiles(texts);
const designSheets: Record<string, { file: string; name: string }> = {
  "ch-01": { file: "shion-design.png", name: "志遠" },
  "ch-02": { file: "mio-design.png", name: "澪" },
};

// 章末に追加し、既存の本文の元ページ番号（読書位置のアンカー）を保つ。
for (const chapter of chapters) {
  const sheet = designSheets[chapter.id];
  if (sheet) chapter.pages.push({
    type: "image",
    src: `/assets/novels/echoshion/illustrations/${sheet.file}`,
    caption: sheet.name,
    alt: `${sheet.name}の設定資料`,
    generatedWithAI: true,
  });
}

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
  chapters,
  endIllustration: {
    src: "/assets/novels/echoshion/illustrations/shion-mio-ending.png",
    alt: "窓の外が夕暮れに染まる部屋で、お茶とおはぎ、みたらし団子を前に並んで座る澪と志遠",
    generatedWithAI: true,
  },
};
