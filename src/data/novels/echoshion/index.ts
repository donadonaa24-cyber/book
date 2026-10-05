import type { Novel } from "../../../types/novel";
import { chapter1 } from "./chapter1";

/**
 * 『EchoShion』の作品メタデータ。
 * 章を追加するときは chapter2.ts などを作り、chapters 配列に足してください。
 */
export const echoshion: Novel = {
  id: "echoshion",
  title: "EchoShion",
  subtitle: "みたらしとおはぎ",
  author: "あにあに",
  coverImage: "/assets/novels/echoshion/cover.svg",
  coverHasTitle: false,
  themeColor: "#0f1a2e",
  accentColor: "#9cc7ff",
  description: "記憶と声をめぐる近未来の物語。",
  chapters: [chapter1],
};
