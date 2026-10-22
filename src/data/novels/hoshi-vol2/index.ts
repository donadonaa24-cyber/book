import type { Novel } from "../../../types/novel";
import { chaptersFromTextFiles } from "../../../lib/manuscript";
import { withChapterDesignSheets } from "../../../lib/designSheets";

/**
 * 『星の終わりに君は生きる』第二部の作品メタデータ（三部作を三冊に分けた二冊目）。
 *
 * 本文は text/ フォルダのテキストファイル（1ファイル＝1章）。ファイル名の順に並ぶ。
 * 完成稿（novel_draft/hoshi_complete/ の Markdown）から export_to_app.py で書き出したもの。
 * - 14a.txt = 第二部扉、15.txt〜29.txt = 第二部（章番号は三冊通し）
 * - 挿絵・設定画は第一部と同じ public/assets/novels/hoshi/ のものを使う
 */
const texts = import.meta.glob<string>("./text/*.txt", { query: "?raw", import: "default", eager: true });

const chapters = withChapterDesignSheets(chaptersFromTextFiles(texts), "hoshi", {
  "ch-18": [{ file: "alma-design.png", name: "アルマ" }],
});

export const hoshiVol2: Novel = {
  id: "hoshi-vol2",
  title: "星の終わりに君は生きる",
  subtitle: "第二部　喪失の頁",
  volume: "第二部",
  author: "あにあに",
  coverImage: "/assets/novels/hoshi-vol2/cover.svg",
  coverHasTitle: false,
  coverTitleVertical: true,
  coverTitleLines: ["星の終わりに", "君は生きる"],
  themeColor: "#141a2c",
  accentColor: "#e6c9b8",
  description: "革命の日、多くを失った湊は、シロとふたりで火星へ。九十日の航行、赤い星、宇宙の迷い子との約束。第二部（第十五章〜第二十九章）。",
  writingMode: "vertical",
  chapters,
};
