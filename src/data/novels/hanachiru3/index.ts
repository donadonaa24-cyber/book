import type { Novel } from "../../../types/novel";
import { chaptersFromTextFiles } from "../../../lib/manuscript";
import { withChapterDesignSheets } from "../../../lib/designSheets";

/**
 * 『花散るさきの、幸せのかたち』別巻（アナザールート：もうひとつの第二部）の作品メタデータ。
 *
 * 上巻（第一部）の結末から分岐する、下巻とは別の第二部。花が生きる結末を描く。
 * 本文は text/ フォルダのテキストファイル（1ファイル＝1話）。ファイル名の順に並ぶ。
 * - 00.txt = 第一部あらすじ、24.txt = 序、25.txt〜40.txt = 第二十五話〜第四十話、41.txt = 最終話
 * - 1行目が話タイトル、2行目以降が本文（書式は src/lib/manuscript.ts）
 */
const texts = import.meta.glob<string>("./text/*.txt", { query: "?raw", import: "default", eager: true });

const chapters = withChapterDesignSheets(chaptersFromTextFiles(texts), "hanachiru", {
  "ch-25": [{ file: "hana-design.png", name: "花" }],
  "ch-26": [{ file: "saki-design.png", name: "咲" }],
  "ch-27": [{ file: "edward-design.png", name: "エドワード" }],
});

export const hanachiru3: Novel = {
  id: "hanachiru3",
  title: "花散るさきの、幸せのかたち",
  subtitle: "別巻　もうひとつの第二部",
  volume: "別巻",
  author: "あにあに",
  coverImage: "/assets/novels/hanachiru3/cover.svg",
  coverHasTitle: false,
  coverTitleVertical: true,
  themeColor: "#3d4c86",
  accentColor: "#fbe7b8",
  description: "もし、あのとき——。花が生きる、もうひとつの第二部。",
  writingMode: "vertical",
  chapters,
};
