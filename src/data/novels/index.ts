import type { Novel } from "../../types/novel";
import { echoshion } from "./echoshion";
import { hanachiru } from "./hanachiru";
import { hanachiru2 } from "./hanachiru2";
import { hanachiru3 } from "./hanachiru3";
import { hoshi } from "./hoshi";
import { withCharacterIllustrations, withUniqueIllustrations } from "../../lib/chapterIllustrations";

/**
 * 本棚に並ぶ作品の一覧。
 * 『星の終わりに君は生きる』旧特別編（./hoshi2）は完成稿と設定が矛盾するため本棚から外している（ファイルは保存）。
 * 新しい小説を追加するときは src/data/novels/<id>/ を作り、ここに追加するだけで本棚に並びます。
 */
export const novels: Novel[] = withUniqueIllustrations(
  [echoshion, hanachiru, hanachiru2, hanachiru3, hoshi].map((novel) => ({
    ...novel,
    chapters: withCharacterIllustrations(novel.id, novel.chapters),
  })),
);

export function findNovel(id: string): Novel | undefined {
  return novels.find((n) => n.id === id);
}
