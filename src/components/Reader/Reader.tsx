import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Novel, WritingMode } from "../../types/novel";
import type { BookLayout } from "../../lib/bookLayout";
import type { LayoutPage } from "../../lib/paginate";
import { countNumberedPages } from "../../lib/paginate";
import { FlipBook } from "./FlipBook";
import type { FlipBookHandle } from "./FlipBook";
import { PageFrame } from "./pages/PageFrame";
import { TextBlocks } from "./pages/TextPage";
import { TitleContent } from "./pages/TitlePage";
import { ImageContent } from "./pages/ImagePage";
import { EndContent } from "./pages/EndPage";
import "./reader.css";

interface Props {
  novel: Novel;
  pages: LayoutPage[];
  layout: BookLayout;
  writingMode: WritingMode;
  startIndex: number;
  /** 操作を受け付けるか（オープニング演出中は false） */
  interactive: boolean;
  onPageChange: (index: number) => void;
  onExit: () => void;
}

const SWIPE_MIN = 40;

/**
 * 読書画面。
 * 横書き（左綴じ）: 画面の右半分をクリック／タップで次ページ、左半分で前ページ。
 * 縦書き（右綴じ）: 本物の縦書きの本と同じく、左半分で次ページ、右半分で前ページ。
 * スマホでは左右スワイプ（紙を引く方向）にも対応。
 */
export function Reader({ novel, pages, layout, writingMode, startIndex, interactive, onPageChange, onExit }: Props) {
  const bookRef = useRef<FlipBookHandle>(null);
  // 見開きでは左ページのインデックスで管理する（ライブラリの onFlip と同じ基準）
  const [current, setCurrent] = useState(layout.spread ? startIndex - (startIndex % 2) : startIndex);
  const touchStart = useRef<{ x: number; y: number; t: number } | null>(null);
  const suppressClickUntil = useRef(0);

  const { pageWidth, pageHeight, spread } = layout;
  /** 右綴じ（縦書き）。ページは左へ向かって進む */
  const rtl = writingMode === "vertical";
  const total = useMemo(() => countNumberedPages(pages), [pages]);

  const next = useCallback(() => bookRef.current?.api()?.flipNext("bottom"), []);
  const prev = useCallback(() => bookRef.current?.api()?.flipPrev("bottom"), []);

  const restart = useCallback(() => {
    const api = bookRef.current?.api();
    if (!api) return;
    api.turnToPage(0);
    setCurrent(0);
    onPageChange(0);
  }, [onPageChange]);

  const handleFlip = useCallback(
    (index: number) => {
      setCurrent(index);
      onPageChange(index);
    },
    [onPageChange],
  );

  // ページ要素は参照を固定しておく（再生成されるとライブラリが全ページを読み直すため）
  const pageElements = useMemo(
    () =>
      pages.map((p) => {
        const common = {
          pageWidth,
          pageHeight,
          writingMode,
          number: p.kind === "title" || p.kind === "blank" ? null : p.number,
        };
        switch (p.kind) {
          case "text":
            return (
              <PageFrame key={p.key} {...common} variant="text" header={p.chapterTitle}>
                <TextBlocks blocks={p.blocks} />
              </PageFrame>
            );
          case "title":
            return (
              <PageFrame key={p.key} {...common} variant="title">
                <TitleContent novelTitle={p.novelTitle} title={p.title} subtitle={p.subtitle} author={p.author} />
              </PageFrame>
            );
          case "image":
            return (
              <PageFrame key={p.key} {...common} variant="image" header={p.chapterTitle}>
                <ImageContent src={p.src} caption={p.caption} alt={p.alt} />
              </PageFrame>
            );
          case "end":
            return (
              <PageFrame key={p.key} {...common} variant="end">
                <EndContent chapterTitle={p.chapterTitle} onRestart={restart} onExit={onExit} />
              </PageFrame>
            );
          default:
            return <PageFrame key={p.key} {...common} variant="blank" />;
        }
      }),
    [pages, pageWidth, pageHeight, writingMode, restart, onExit],
  );

  // キーボード操作
  useEffect(() => {
    if (!interactive) return;
    const onKey = (e: KeyboardEvent) => {
      const forwardKey = rtl ? "ArrowLeft" : "ArrowRight";
      const backKey = rtl ? "ArrowRight" : "ArrowLeft";
      if (e.key === forwardKey || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        next();
      } else if (e.key === backKey || e.key === "PageUp") {
        e.preventDefault();
        prev();
      } else if (e.key === "Escape") {
        onExit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [interactive, rtl, next, prev, onExit]);

  const isControl = (target: EventTarget | null) =>
    target instanceof Element && !!target.closest("button, a, [data-no-flip]");

  const onStageClick = (e: React.MouseEvent) => {
    if (!interactive || isControl(e.target)) return;
    if (Date.now() < suppressClickUntil.current) return;
    const rightSide = e.clientX >= window.innerWidth / 2;
    if (rightSide !== rtl) next();
    else prev();
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY, t: Date.now() };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || !interactive || isControl(e.target)) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) >= SWIPE_MIN && Math.abs(dx) > Math.abs(dy) * 1.2) {
      // 横書きは左へ、縦書きは右へ紙を引くと次のページ
      suppressClickUntil.current = Date.now() + 500;
      if (dx < 0 !== rtl) next();
      else prev();
    }
  };

  // 表示中のページ番号（見開きなら左右2ページ分）
  const visible = (spread ? [pages[current], pages[current + 1]] : [pages[current]]).filter(Boolean);
  const numbers = visible.map((p) => p.number).filter((n): n is number => n != null);
  const currentChapter = visible.find((p) => p.chapterTitle)?.chapterTitle ?? "";
  const lastNumber = numbers.length ? numbers[numbers.length - 1] : 1;
  const pageLabel = numbers.length > 1 ? `${numbers[0]}–${numbers[1]}` : `${numbers[0] ?? 1}`;

  return (
    <div className={`reader ${rtl ? "reader--rtl" : ""} ${interactive ? "" : "reader--locked"}`}>
      <header className="reader__bar reader__bar--top">
        <div className="reader__heading">
          <span className="reader__novel">{novel.title}</span>
          {currentChapter && <span className="reader__chapter">{currentChapter}</span>}
        </div>
        <button type="button" className="btn btn--bar" onClick={onExit}>
          <span aria-hidden="true">←</span> 本棚へ戻る
        </button>
      </header>

      <main
        className="reader__stage"
        onClick={onStageClick}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        aria-label={`本文。画面の${rtl ? "左" : "右"}側をタップで次のページ、${rtl ? "右" : "左"}側で前のページ`}
      >
        <div
          className={`reader__book ${spread ? "reader__book--spread" : "reader__book--single"} ${rtl ? "reader__book--rtl" : ""}`}
        >
          <FlipBook
            ref={bookRef}
            pageWidth={pageWidth}
            pageHeight={pageHeight}
            spread={spread}
            startPage={startIndex}
            pages={pageElements}
            onFlip={handleFlip}
          />
        </div>
      </main>

      <footer className="reader__bar reader__bar--bottom">
        <button
          type="button"
          className="reader__nav"
          onClick={rtl ? next : prev}
          aria-label={rtl ? "次のページ" : "前のページ"}
          disabled={!interactive}
        >
          ‹
        </button>
        <div className="reader__progress">
          <div className="reader__progress-track">
            <div className="reader__progress-fill" style={{ width: `${(lastNumber / Math.max(total, 1)) * 100}%` }} />
          </div>
          <span className="reader__page-label">
            {pageLabel} / {total}
          </span>
        </div>
        <button
          type="button"
          className="reader__nav"
          onClick={rtl ? prev : next}
          aria-label={rtl ? "前のページ" : "次のページ"}
          disabled={!interactive}
        >
          ›
        </button>
      </footer>
    </div>
  );
}
