import type { ViewportSize } from "./useViewport";

/** 読書画面で使う本のサイズ */
export interface BookLayout {
  /** 見開き表示（PC・横長タブレット）かどうか */
  spread: boolean;
  pageWidth: number;
  pageHeight: number;
}

/** 読書画面の上下バーの高さ（CSS の --reader-bar-h 等と揃える） */
export const READER_TOP_BAR = 52;
export const READER_BOTTOM_BAR = 40;
const SIDE_MARGIN = 12;

/**
 * 画面サイズから本のページサイズを決める。
 * 文庫本（約 105×148mm）に近い縦長比率を基本に、スマホでは画面を広く使う。
 */
export function computeBookLayout({ width, height }: ViewportSize): BookLayout {
  const availW = Math.max(240, width - SIDE_MARGIN * 2);
  const availH = Math.max(320, height - READER_TOP_BAR - READER_BOTTOM_BAR - 8);

  const spread = width >= 860 && width > height * 1.15;

  if (spread) {
    let pageW = Math.min(availW / 2, 540, availH * 0.72);
    let pageH = pageW / 0.7;
    if (pageH > availH) {
      pageH = availH;
      pageW = pageH * 0.7;
    }
    return { spread, pageWidth: Math.floor(pageW), pageHeight: Math.floor(pageH) };
  }

  const pageW = Math.min(availW, 560);
  // 縦長スマホでは少し縦に伸ばして 1 ページの情報量を確保する
  const pageH = Math.min(availH, Math.max(pageW / 0.72, Math.min(pageW / 0.56, availH)));
  return { spread, pageWidth: Math.floor(pageW), pageHeight: Math.floor(pageH) };
}

export function layoutKey(layout: BookLayout): string {
  return `${layout.spread ? "s" : "p"}-${layout.pageWidth}x${layout.pageHeight}`;
}
