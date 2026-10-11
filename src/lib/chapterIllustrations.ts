import type { Chapter, Novel, PageData } from "../types/novel";
import { characterWorks, characterWorkId } from "../data/characters";
import { chapterIllustrations } from "../data/chapterIllustrations";

/** 保存済みの人物画像を、プロフィール文を添えずに章末へ載せる。 */
export function withCharacterIllustrations(novelId: string, chapters: Chapter[]): Chapter[] {
  const placements = chapterIllustrations[novelId];
  if (!placements) return chapters;
  const work = characterWorks.find((item) => item.id === characterWorkId(novelId));
  return chapters.map((chapter) => {
    const ids = placements[chapter.id];
    if (!ids) return chapter;
    const additions: PageData[] = ids.map((id) => {
      const character = work?.characters.find((item) => item.id === id);
      if (!character) throw new Error(`人物画像がありません: ${novelId}/${id}`);
      // 花の結婚前後など、章によって変わる姓を画像の説明として固定しない。
      const name = ({ saki: "咲", hana: "花", edward: "エドワード" } as Record<string, string>)[id] ?? character.name;
      return {
        type: "image",
        src: character.image,
        caption: name,
        alt: `${name}の${id === "soldier-robot" ? "世界観資料" : "イメージイラスト"}`,
        generatedWithAI: true,
      };
    });
    return { ...chapter, pages: [...chapter.pages, ...additions] };
  });
}

const REMOVED_OPENING_IMAGES = [
  "/assets/novels/hanachiru/illustrations/edward.webp",
  "/assets/novels/hanachiru/illustrations/saki.webp",
];

/** 画像を1回だけ掲載し、削除で空いた元ページ番号をしおり用に保持する。 */
export function withUniqueIllustrations(novels: Novel[]): Novel[] {
  const used = new Set(REMOVED_OPENING_IMAGES);
  return novels.map((novel) => ({
    ...novel,
    chapters: novel.chapters.map((chapter) => {
      const kept = chapter.pages.map((page, index) => ({ page, index })).filter(({ page }) => {
        if (page.type !== "image") return true;
        if (used.has(page.src)) return false;
        used.add(page.src);
        return true;
      });
      if (kept.length === chapter.pages.length) return chapter;
      return {
        ...chapter,
        pages: kept.map(({ page, index }) => ({ ...page, sourcePageIndex: page.sourcePageIndex ?? index })),
      };
    }),
  }));
}
