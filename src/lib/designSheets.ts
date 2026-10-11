import type { Chapter, ImagePageData } from "../types/novel";

export interface DesignSheet {
  file: string;
  name: string;
}

/** 本文の元ページを動かさず、指定した章末に設定資料を追加する。 */
export function withChapterDesignSheets(
  chapters: Chapter[],
  assetWork: string,
  sheets: Record<string, readonly DesignSheet[]>,
): Chapter[] {
  return chapters.map((chapter) => {
    const additions = sheets[chapter.id];
    if (!additions) return chapter;
    const pages: ImagePageData[] = additions.map((sheet) => ({
      type: "image",
      src: `/assets/novels/${assetWork}/illustrations/${sheet.file}`,
      caption: sheet.name,
      alt: `${sheet.name}の設定資料`,
      generatedWithAI: true,
    }));
    return { ...chapter, pages: [...chapter.pages, ...pages] };
  });
}
