import type { Novel } from "../../../types/novel";
import { chaptersFromTextFiles } from "../../../lib/manuscript";

/**
 * 『星の終わりに君は生きる』特別編（本編の続き）の作品メタデータ。
 *
 * 火星へ渡った紗良とシロのその後と、兄弟との再会を描く。
 * 本文は text/ フォルダのテキストファイル（1ファイル＝1話）。ファイル名の順に並ぶ。
 * - 01.txt〜04.txt = 第一話〜第四話、05.txt = 最終話
 * - 1行目が話タイトル、2行目以降が本文（書式は src/lib/manuscript.ts）
 */
const texts = import.meta.glob<string>("./text/*.txt", { query: "?raw", import: "default", eager: true });

export const hoshi2: Novel = {
  id: "hoshi2",
  title: "星の終わりに君は生きる",
  subtitle: "特別編　星の海で、また会おう",
  volume: "特別編",
  author: "あにあに",
  coverImage: "/assets/novels/hoshi2/cover.svg",
  coverHasTitle: false,
  coverTitleVertical: true,
  coverTitleLines: ["星の終わりに", "君は生きる"],
  themeColor: "#1d2f52",
  accentColor: "#bfe3f5",
  description: "火星へ渡った紗良とシロ。青い夕焼けの星で、もう一度あの兄弟に会うまでの物語。",
  writingMode: "vertical",
  chapters: chaptersFromTextFiles(texts),
};
