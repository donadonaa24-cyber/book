import { forwardRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { WritingMode } from "../../../types/novel";

interface Props {
  variant: "text" | "title" | "image" | "blank" | "end";
  pageWidth: number;
  pageHeight: number;
  writingMode: WritingMode;
  header?: string;
  number?: number | null;
  children?: ReactNode;
}

/**
 * 1ページ分の紙。react-pageflip は子要素の DOM を直接扱うため forwardRef が必須。
 * 構造とクラス名は lib/paginate.ts の計測用 DOM と揃えること。
 */
export const PageFrame = forwardRef<HTMLDivElement, Props>(function PageFrame(
  { variant, pageWidth, pageHeight, writingMode, header, number, children },
  ref,
) {
  const style = { "--page-w": `${pageWidth}px`, "--page-h": `${pageHeight}px` } as CSSProperties;
  return (
    <div ref={ref} className={`book-page book-page--${variant} book-page--${writingMode}`} data-density="soft">
      <div className="book-page__paper" aria-hidden="true" />
      {/* ページ外枠の style はライブラリに上書きされるため、サイズ変数は内側に持たせる */}
      <div className="book-page__inner" style={style}>
        <div className="book-page__header">{header || " "}</div>
        <div className={`book-page__body ${variant === "text" ? "tp" : ""}`}>{children}</div>
        <div className="book-page__footer">
          {number != null && <span className="book-page__number">{number}</span>}
        </div>
      </div>
    </div>
  );
});
