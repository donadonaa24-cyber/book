import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Novel, WritingMode } from "../../types/novel";
import { computeBookLayout, layoutKey } from "../../lib/bookLayout";
import { useViewport } from "../../lib/useViewport";
import { preloadNovelFonts } from "../../lib/fonts";
import { findPageIndex, paginateNovel, countNumberedPages } from "../../lib/paginate";
import type { ReadingAnchor } from "../../lib/progress";
import { loadProgress, saveProgress } from "../../lib/progress";
import { OpeningAnimation } from "../OpeningAnimation/OpeningAnimation";
import { Reader } from "./Reader";

interface Props {
  novel: Novel;
  mode: "start" | "resume";
  /** 省略時は作品データの writingMode に従う */
  writingMode?: WritingMode;
  onExit: () => void;
}

const BEGINNING: ReadingAnchor = { chapterIndex: 0, pageIndex: 0, paragraphIndex: 0, charOffset: 0 };

/**
 * 1冊を読んでいる間の状態をまとめるコンポーネント。
 * フォント読み込み → 画面サイズに合わせたページ割り付け → オープニング演出 → 読書画面、の順に進む。
 * 画面サイズが変わったら割り付け直し、読んでいた位置（アンカー）を保ったまま本を作り直す。
 */
export function ReadingSession({ novel, mode, writingMode = novel.writingMode ?? "horizontal", onExit }: Props) {
  const viewport = useViewport();
  const layout = useMemo(() => computeBookLayout(viewport), [viewport]);
  const [fontsReady, setFontsReady] = useState(false);
  const [openingDone, setOpeningDone] = useState(false);

  const anchorRef = useRef<ReadingAnchor>(
    mode === "resume" ? (loadProgress(novel.id)?.anchor ?? BEGINNING) : BEGINNING,
  );

  useEffect(() => {
    let alive = true;
    preloadNovelFonts(novel).then(() => alive && setFontsReady(true));
    return () => {
      alive = false;
    };
  }, [novel]);

  const pages = useMemo(
    () =>
      fontsReady
        ? paginateNovel(novel, {
            pageWidth: layout.pageWidth,
            pageHeight: layout.pageHeight,
            spread: layout.spread,
            writingMode,
          })
        : null,
    [fontsReady, novel, layout, writingMode],
  );

  // レイアウトが変わるたびに、保持しているアンカーから開始ページを求め直す
  const startIndex = useMemo(() => (pages ? findPageIndex(pages, anchorRef.current) : 0), [pages]);

  const handlePageChange = useCallback(
    (index: number) => {
      if (!pages) return;
      // 見開きの左が白紙なら右ページを基準にする
      const page = pages[index]?.kind === "blank" && pages[index + 1] ? pages[index + 1] : pages[index];
      if (!page) return;
      anchorRef.current = page.anchor;
      const lastVisible = layout.spread ? pages[index + 1] ?? page : page;
      saveProgress(novel.id, {
        anchor: page.anchor,
        pageNumber: page.number ?? 1,
        totalPages: countNumberedPages(pages),
        finished: lastVisible.kind === "end" || page.kind === "end",
        updatedAt: Date.now(),
      });
    },
    [pages, layout.spread, novel.id],
  );

  return (
    <>
      {pages ? (
        <Reader
          key={layoutKey(layout)}
          novel={novel}
          pages={pages}
          layout={layout}
          writingMode={writingMode}
          startIndex={startIndex}
          interactive={openingDone}
          onPageChange={handlePageChange}
          onExit={onExit}
        />
      ) : (
        <div className="reader__loading">本を開いています…</div>
      )}
      {!openingDone && (
        <OpeningAnimation
          novel={novel}
          layout={layout}
          rtl={writingMode === "vertical"}
          readerReady={!!pages}
          onDone={() => setOpeningDone(true)}
        />
      )}
    </>
  );
}
