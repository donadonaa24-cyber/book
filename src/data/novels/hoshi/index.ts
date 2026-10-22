import type { Novel } from "../../../types/novel";
import { chaptersFromTextFiles } from "../../../lib/manuscript";
import { withChapterDesignSheets } from "../../../lib/designSheets";

/**
 * 『星の終わりに君は生きる』第一部の作品メタデータ（三部作を三冊に分けた一冊目）。
 *
 * 本文は text/ フォルダのテキストファイル（1ファイル＝1章）。ファイル名の順に並ぶ。
 * 完成稿（novel_draft/hoshi_complete/ の Markdown）から export_to_app.py で書き出したもの。本文を直すときは
 * Markdown を直して書き出し直す。旧版の改稿本文は text_v1/、作者の元原稿は original/ に残している（読み込まない）。
 * - 00.txt = 第一部扉、01.txt〜14.txt = 第一部
 * - 第二部は ../hoshi-vol2/、第三部・終幕・あとがきは ../hoshi-vol3/（章番号は三冊通し）
 * - 挿絵は「［挿絵：パス］」の行で入れる（画像は public/assets/novels/hoshi/illustrations/）
 * - 1行目が話タイトル、2行目以降が本文（書式は src/lib/manuscript.ts）
 */
const texts = import.meta.glob<string>("./text/*.txt", { query: "?raw", import: "default", eager: true });

const chapters = withChapterDesignSheets(chaptersFromTextFiles(texts), "hoshi", {
  "ch-02": [{ file: "rena-design.png", name: "玲奈" }],
  "ch-03": [{ file: "haru-design.png", name: "ハル" }],
  "ch-04": [{ file: "sara-design.png", name: "紗良" }],
  "ch-05": [{ file: "minato-design.png", name: "湊" }],
  "ch-06": [{ file: "sumi-design.png", name: "澄" }],
  "ch-08": [{ file: "shiro-design.png", name: "シロ" }],
  "ch-10": [{ file: "sota-design.png", name: "颯太" }],
  // 透真の設定画は大人の姿なので、二十歳前後になる第十一章に置く
  "ch-11": [
    { file: "touma-design.png", name: "透真" },
    { file: "ritsu-design.png", name: "律" },
    { file: "tetsu-design.png", name: "テツ" },
  ],
});

export const hoshi: Novel = {
  id: "hoshi",
  title: "星の終わりに君は生きる",
  subtitle: "第一部　同じ空の下で",
  volume: "第一部",
  author: "あにあに",
  coverImage: "/assets/novels/hoshi/cover.svg",
  coverHasTitle: false,
  coverTitleVertical: true,
  coverTitleLines: ["星の終わりに", "君は生きる"],
  themeColor: "#1c2a3a",
  accentColor: "#cfe3ee",
  description: "管理AIに守られた二〇五九年、雪の夜に引き裂かれた兄・透真と弟・湊。同じ空の下で別々に生きた十年。第一部（第一章〜第十四章）。",
  writingMode: "vertical",
  chapters,
};
