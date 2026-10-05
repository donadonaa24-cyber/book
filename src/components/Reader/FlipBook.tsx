import { forwardRef, memo, useImperativeHandle, useRef } from "react";
import type { ReactElement } from "react";
import HTMLFlipBook from "react-pageflip";

/** react-pageflip が内部で持つ PageFlip インスタンスのうち、使う API だけを型付けしたもの */
export interface PageFlipApi {
  flipNext(corner?: "top" | "bottom"): void;
  flipPrev(corner?: "top" | "bottom"): void;
  flip(page: number, corner?: "top" | "bottom"): void;
  turnToPage(page: number): void;
  getCurrentPageIndex(): number;
  getPageCount(): number;
}

export interface FlipBookHandle {
  api(): PageFlipApi | null;
}

interface Props {
  pageWidth: number;
  pageHeight: number;
  spread: boolean;
  startPage: number;
  /** ページ要素（forwardRef で DOM を返すコンポーネント）。参照が変わると再読込されるので useMemo すること */
  pages: ReactElement[];
  onFlip: (pageIndex: number) => void;
}

/**
 * ページめくりライブラリ（react-pageflip / StPageFlip）の薄いラッパー。
 * ライブラリ差し替え時はこのファイルだけ直せばよいようにしている。
 *
 * - クリック／スワイプの判定は Reader 側で行うため、ライブラリのマウス操作は無効化
 * - サイズは Reader 側で計算した固定サイズ（変わったら key を変えて作り直す）
 */
export const FlipBook = memo(
  forwardRef<FlipBookHandle, Props>(function FlipBook(
    { pageWidth, pageHeight, spread, startPage, pages, onFlip },
    ref,
  ) {
    const bookRef = useRef<{ pageFlip(): PageFlipApi | undefined } | null>(null);
    const onFlipRef = useRef(onFlip);
    onFlipRef.current = onFlip;

    useImperativeHandle(ref, () => ({
      api: () => bookRef.current?.pageFlip() ?? null,
    }));

    return (
      <HTMLFlipBook
        ref={bookRef}
        className="flipbook"
        style={{ width: spread ? pageWidth * 2 : pageWidth, height: pageHeight }}
        width={pageWidth}
        height={pageHeight}
        size="fixed"
        minWidth={pageWidth}
        maxWidth={pageWidth}
        minHeight={pageHeight}
        maxHeight={pageHeight}
        startPage={startPage}
        usePortrait={!spread}
        showCover={false}
        drawShadow
        maxShadowOpacity={0.35}
        flippingTime={650}
        startZIndex={0}
        autoSize={false}
        mobileScrollSupport={false}
        clickEventForward
        useMouseEvents={false}
        swipeDistance={30}
        showPageCorners={false}
        disableFlipByClick={false}
        onFlip={(e: { data: number }) => onFlipRef.current(e.data)}
      >
        {pages}
      </HTMLFlipBook>
    );
  }),
);
