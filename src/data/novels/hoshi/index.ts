import type { Novel } from "../../../types/novel";
import { chaptersFromTextFiles } from "../../../lib/manuscript";
import { withChapterDesignSheets } from "../../../lib/designSheets";

/**
 * 『星の終わりに君は生きる』の作品メタデータ。
 *
 * 本文は text/ フォルダのテキストファイル（1ファイル＝1章）。ファイル名の順に並ぶ。
 * 完成稿（novel_draft/hoshi_complete/ の Markdown）から export_to_app.py で書き出したもの。本文を直すときは
 * Markdown を直して書き出し直す。旧版の改稿本文は text_v1/、作者の元原稿は original/ に残している（読み込まない）。
 * - 00.txt = 第一部扉、01.txt〜14.txt = 第一部、14a.txt = 第二部扉、15.txt〜29.txt = 第二部、
 *   29a.txt = 第三部扉、30.txt〜40.txt = 第三部、41.txt = 終幕、42.txt = あとがき「宇宙と意識フィールド」
 * - 挿絵は「［挿絵：パス］」の行で入れる（画像は public/assets/novels/hoshi/illustrations/）
 * - 1行目が話タイトル、2行目以降が本文（書式は src/lib/manuscript.ts）
 */
const texts = import.meta.glob<string>("./text/*.txt", { query: "?raw", import: "default", eager: true });

const chapters = withChapterDesignSheets(chaptersFromTextFiles(texts), "hoshi", {
  "ch-01": [{ file: "touma-design.png", name: "透真" }],
  "ch-02": [{ file: "rena-design.png", name: "玲奈" }],
  "ch-03": [{ file: "haru-design.png", name: "ハル" }],
  "ch-04": [{ file: "sara-design.png", name: "紗良" }],
  "ch-05": [{ file: "minato-design.png", name: "湊" }],
  "ch-06": [{ file: "sumi-design.png", name: "澄" }],
  "ch-08": [{ file: "shiro-design.png", name: "シロ" }],
  "ch-10": [{ file: "sota-design.png", name: "颯太" }],
  "ch-11": [{ file: "ritsu-design.png", name: "律" }, { file: "tetsu-design.png", name: "テツ" }],
  "ch-18": [{ file: "alma-design.png", name: "アルマ" }],
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
  description: "管理AIに守られた二〇五九年、雪の夜に引き裂かれた兄・透真と弟・湊。同じ空の下の十年、喪失の頁と、君が生きる頁。三部構成で終幕まで描く完成稿。",
  writingMode: "vertical",
  chapters,
};
