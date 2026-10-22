import type { Novel } from "../../../types/novel";
import { chaptersFromTextFiles } from "../../../lib/manuscript";

/**
 * 『星の終わりに君は生きる』第三部の作品メタデータ（三部作を三冊に分けた三冊目）。
 *
 * 本文は text/ フォルダのテキストファイル（1ファイル＝1章）。ファイル名の順に並ぶ。
 * 完成稿（novel_draft/hoshi_complete/ の Markdown）から export_to_app.py で書き出したもの。
 * - 29a.txt = 第三部扉、30.txt〜40.txt = 第三部、41.txt = 終幕、42.txt = あとがき「宇宙と意識フィールド」
 *   （章番号は三冊通し）
 */
const texts = import.meta.glob<string>("./text/*.txt", { query: "?raw", import: "default", eager: true });

export const hoshiVol3: Novel = {
  id: "hoshi-vol3",
  title: "星の終わりに君は生きる",
  subtitle: "第三部　君が生きる頁",
  volume: "第三部",
  author: "あにあに",
  coverImage: "/assets/novels/hoshi-vol3/cover.svg",
  coverHasTitle: false,
  coverTitleVertical: true,
  coverTitleLines: ["星の終わりに", "君は生きる"],
  themeColor: "#2a1a1e",
  accentColor: "#f2d2b0",
  description: "同じ二〇六九年十二月。覚えのない記憶を抱えた三人が、別の選択をする。第三部（第三十章〜第四十章）と終幕、あとがき。",
  writingMode: "vertical",
  chapters: chaptersFromTextFiles(texts),
};
