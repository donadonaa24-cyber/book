import type { Novel } from "../../../types/novel";
import { chaptersFromTextFiles } from "../../../lib/manuscript";
import { withChapterDesignSheets } from "../../../lib/designSheets";

/**
 * 『星の終わりに君は生きる』特別編（本編の続き）の作品メタデータ。
 *
 * 火星へ渡った湊とシロのその後と、紗良・透真・ハルとの再会を描く。
 * 本文は text/ フォルダのテキストファイル（1ファイル＝1話）。ファイル名の順に並ぶ。
 * - 01.txt〜04.txt = 第一話〜第四話、05.txt = 最終話
 * - 1行目が話タイトル、2行目以降が本文（書式は src/lib/manuscript.ts）
 */
const texts = import.meta.glob<string>("./text/*.txt", { query: "?raw", import: "default", eager: true });

const chapters = withChapterDesignSheets(chaptersFromTextFiles(texts), "hoshi", {
  "ch-01": [{ file: "minato-design.png", name: "湊" }],
  "ch-02": [{ file: "touma-design.png", name: "透真" }],
  "ch-03": [{ file: "shiro-design.png", name: "シロ" }],
  "ch-04": [{ file: "haru-design.png", name: "ハル" }],
  "ch-05": [{ file: "sara-design.png", name: "紗良" }],
});

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
  description: "兄の遺した研究を抱え、シロと火星へ渡った湊。死のなくなった星で、それでも人として生き、還るまでの物語。",
  writingMode: "vertical",
  chapters,
};
