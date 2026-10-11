import type { Novel } from "../../../types/novel";
import { chaptersFromTextFiles } from "../../../lib/manuscript";
import { withChapterDesignSheets } from "../../../lib/designSheets";

/**
 * 『星の終わりに君は生きる』の作品メタデータ。
 *
 * 本文は text/ フォルダのテキストファイル（1ファイル＝1話）。ファイル名の順に並ぶ。
 * 作者の原稿をもとに改稿した版で、作者の元原稿は original/ に残している（読み込まない）。続編は ../hoshi2（特別編）。
 * - 01.txt〜08.txt = 第一話〜第八話、09.txt = 最終話、10.txt = あとがき「宇宙と意識フィールド」
 * - 挿絵は「［挿絵：パス］」の行で入れる（画像は public/assets/novels/hoshi/illustrations/）
 * - 1行目が話タイトル、2行目以降が本文（書式は src/lib/manuscript.ts）
 */
const texts = import.meta.glob<string>("./text/*.txt", { query: "?raw", import: "default", eager: true });

const chapters = withChapterDesignSheets(chaptersFromTextFiles(texts), "hoshi", {
  "ch-01": [{ file: "touma-design.png", name: "透真" }],
  "ch-02": [{ file: "minato-design.png", name: "湊" }, { file: "rena-design.png", name: "玲奈" }],
  "ch-03": [{ file: "haru-design.png", name: "ハル" }],
  "ch-04": [{ file: "shiro-design.png", name: "シロ" }],
  "ch-05": [{ file: "sara-design.png", name: "紗良" }],
  "ch-06": [{ file: "sumi-design.png", name: "澄" }],
  "ch-07": [{ file: "ritsu-design.png", name: "律" }, { file: "tetsu-design.png", name: "テツ" }],
  "ch-08": [{ file: "sota-design.png", name: "颯太" }],
  "ch-09": [{ file: "alma-design.png", name: "アルマ" }],
});

export const hoshi: Novel = {
  id: "hoshi",
  title: "星の終わりに君は生きる",
  subtitle: "",
  author: "あにあに",
  coverImage: "/assets/novels/hoshi/cover.svg",
  coverHasTitle: false,
  coverTitleVertical: true,
  coverTitleLines: ["星の終わりに", "君は生きる"],
  themeColor: "#1c2a3a",
  accentColor: "#cfe3ee",
  description: "管理AIに守られた二〇五九年。兄の透真、弟の湊、そして犬のハル。違う空の下で、違う正義を抱えた兄弟の物語。",
  writingMode: "vertical",
  chapters,
};
