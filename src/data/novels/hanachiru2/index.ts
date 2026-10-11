import type { Novel } from "../../../types/novel";
import { chaptersFromTextFiles } from "../../../lib/manuscript";
import { withChapterDesignSheets } from "../../../lib/designSheets";

/**
 * 『花散るさきの、幸せのかたち』下巻（第二部）の作品メタデータ。
 *
 * 本文は text/ フォルダのテキストファイル（1ファイル＝1話）。ファイル名の順に並ぶ。
 * 作者の原稿をもとに改稿した版で、作者の元原稿は original/ に残している（読み込まない）。
 * - 00.txt = 第一部あらすじ、24.txt〜41.txt = 第二十四話〜第四十一話、42.txt = 最終話
 * - 43.txt〜44.txt = 番外編、45.txt = あとがき、46.txt = 別巻（アナザールート）への案内
 * - 1行目が話タイトル、2行目以降が本文（書式は src/lib/manuscript.ts）
 */
const texts = import.meta.glob<string>("./text/*.txt", { query: "?raw", import: "default", eager: true });

const chapters = withChapterDesignSheets(chaptersFromTextFiles(texts), "hanachiru", {
  "ch-25": [{ file: "hana-design.png", name: "花" }],
  "ch-27": [{ file: "edward-design.png", name: "エドワード" }],
  "ch-44": [{ file: "saki-design.png", name: "咲" }],
});

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
  description: "出所した花と、咲を想い続けた男。第二部と番外編、あとがきを収録。",
  writingMode: "vertical",
  chapters,
};
