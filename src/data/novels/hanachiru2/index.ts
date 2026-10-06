import type { Novel } from "../../../types/novel";
import { chaptersFromTextFiles } from "../../../lib/manuscript";

/**
 * 『花散るさきの、幸せのかたち』下巻（第二部）の作品メタデータ。
 *
 * 本文は text/ フォルダのテキストファイル（1ファイル＝1話）。ファイル名の順に並ぶ。
 * - 00.txt = 第一部あらすじ、25.txt〜44.txt = 第二十五話〜第四十四話、45.txt = 最終話
 * - 46.txt〜49.txt = 番外編①〜④、50.txt = 終章
 * - 1行目が話タイトル、2行目以降が本文（書式は src/lib/manuscript.ts）
 */
const texts = import.meta.glob<string>("./text/*.txt", { query: "?raw", import: "default", eager: true });

export const hanachiru2: Novel = {
  id: "hanachiru2",
  title: "花散るさきの、幸せのかたち",
  subtitle: "下巻　第二部",
  volume: "下巻",
  author: "あにあに",
  coverImage: "/assets/novels/hanachiru2/cover.svg",
  coverHasTitle: false,
  coverTitleVertical: true,
  themeColor: "#161a33",
  accentColor: "#f3d36b",
  description: "出所した花と、咲を想い続けた男。第二部と番外編、終章を収録。",
  writingMode: "vertical",
  chapters: chaptersFromTextFiles(texts),
};
