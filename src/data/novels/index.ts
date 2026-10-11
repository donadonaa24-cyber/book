import type { Novel } from "../../types/novel";
import { echoshion } from "./echoshion";
import { hanachiru } from "./hanachiru";
import { hanachiru2 } from "./hanachiru2";
import { hanachiru3 } from "./hanachiru3";
import { hoshi } from "./hoshi";
import { hoshi2 } from "./hoshi2";
import { withCharacterIllustrations, withUniqueIllustrations } from "../../lib/chapterIllustrations";

/**
 * 本棚に並ぶ作品の一覧。
 * 新しい小説を追加するときは src/data/novels/<id>/ を作り、ここに追加するだけで本棚に並びます。
 */
export const novels: Novel[] = withUniqueIllustrations(
  [echoshion, hanachiru, hanachiru2, hanachiru3, hoshi, hoshi2].map((novel) => ({
    ...novel,
    chapters: withCharacterIllustrations(novel.id, novel.chapters),
  })),
);

export function findNovel(id: string): Novel | undefined {
  return novels.find((n) => n.id === id);
}
