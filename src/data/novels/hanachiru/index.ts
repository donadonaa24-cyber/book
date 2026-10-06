import type { Novel } from "../../../types/novel";
import { chaptersFromTextFiles } from "../../../lib/manuscript";

/**
 * 『花散るさきの、幸せのかたち』の作品メタデータ。
 *
 * 本文は text/ フォルダのテキストファイル（1ファイル＝1話）。
 * - ファイル名の順に並ぶ（01.txt = 第一話, 02.txt = 第二話, …）
 * - 1行目が話タイトル、2行目以降が本文（書式は src/lib/manuscript.ts）
 * 話を追加するときは 06.txt のように次の番号でファイルを置くだけでよい。
 */
const texts = import.meta.glob<string>("./text/*.txt", { query: "?raw", import: "default", eager: true });

export const hanachiru: Novel = {
  id: "hanachiru",
  title: "花散るさきの、幸せのかたち",
  subtitle: "",
  author: "あにあに",
  coverImage: "/assets/novels/hanachiru/cover.svg",
  coverHasTitle: false,
  coverTitleVertical: true,
  themeColor: "#2a1430",
  accentColor: "#f6c9d3",
  description: "墓前で語られる、林家の姉妹と家族の物語。",
  writingMode: "vertical",
  chapters: chaptersFromTextFiles(texts),
};
