import type { Novel } from "../../types/novel";
import { echoshion } from "./echoshion";

/**
 * 本棚に並ぶ作品の一覧。
 * 新しい小説を追加するときは src/data/novels/<id>/ を作り、ここに追加するだけで本棚に並びます。
 */
export const novels: Novel[] = [echoshion];

export function findNovel(id: string): Novel | undefined {
  return novels.find((n) => n.id === id);
}
