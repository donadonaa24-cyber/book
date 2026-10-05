import type { Novel } from "../types/novel";
import { wait } from "./motion";

export const BODY_FONT_FAMILY = '"Shippori Mincho"';

function collectText(novel: Novel): string {
  const chars = new Set<string>();
  const add = (s: string | undefined) => {
    if (s) for (const c of s) chars.add(c);
  };
  add(novel.title);
  add(novel.subtitle);
  add(novel.author);
  add("0123456789／了つづく本棚へ戻る");
  for (const ch of novel.chapters) {
    add(ch.title);
    for (const p of ch.pages) {
      if (p.type === "text") {
        for (const para of p.paragraphs) {
          if (typeof para === "string") add(para);
          else if (para.type === "message") {
            add(para.text);
            add(para.from);
          }
        }
      } else if (p.type === "title") {
        add(p.title);
        add(p.subtitle);
      } else {
        add(p.caption);
      }
    }
  }
  return [...chars].join("");
}

/**
 * 本文で使う文字を含むフォントのサブセットを先読みする。
 * （Google Fonts の日本語フォントは文字範囲ごとに分割配信されるため、
 *   ページ割り付けの前に必要な分を読み込んでおかないと計測がずれる）
 * ネットワークが遅い場合でもタイムアウト後は代替フォントで続行する。
 */
export async function preloadNovelFonts(novel: Novel, timeoutMs = 3500): Promise<void> {
  if (!("fonts" in document)) return;
  const text = collectText(novel);
  try {
    await Promise.race([
      Promise.all([
        document.fonts.load(`400 16px ${BODY_FONT_FAMILY}`, text),
        document.fonts.load(`600 16px ${BODY_FONT_FAMILY}`, text),
      ]).then(() => document.fonts.ready),
      wait(timeoutMs),
    ]);
  } catch {
    // フォントが読めなくても代替フォントで表示できる
  }
}
