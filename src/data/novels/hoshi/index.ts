import type { Novel } from "../../../types/novel";
import { chaptersFromTextFiles } from "../../../lib/manuscript";

/**
 * 『星の終わりに君は生きる』の作品メタデータ。
 *
 * 本文は text/ フォルダのテキストファイル（1ファイル＝1話）。ファイル名の順に並ぶ。
 * - 01.txt〜08.txt = 第一話〜第八話、09.txt = 最終話、10.txt = あとがき「宇宙と意識フィールド」
 * - 挿絵は「［挿絵：パス］」の行で入れる（画像は public/assets/novels/hoshi/illustrations/）
 * - 1行目が話タイトル、2行目以降が本文（書式は src/lib/manuscript.ts）
 */
const texts = import.meta.glob<string>("./text/*.txt", { query: "?raw", import: "default", eager: true });

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
  chapters: chaptersFromTextFiles(texts),
};
