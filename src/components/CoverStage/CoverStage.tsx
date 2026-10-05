import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Novel } from "../../types/novel";
import type { ReadingProgress } from "../../lib/progress";
import { isAtBeginning } from "../../lib/progress";
import { prefersReducedMotion } from "../../lib/motion";
import { BookCover } from "../BookCover/BookCover";
import "./coverStage.css";

export type OpenMode = "start" | "resume";

interface Props {
  novel: Novel;
  /** 本棚上の本の位置。ここから画面中央へ本が飛んでくる */
  fromRect: DOMRect | null;
  progress: ReadingProgress | null;
  onOpen: (mode: OpenMode) => void;
  onClose: () => void;
}

const FLY_MS = 620;

/**
 * 本を手に取って表紙を大きく見せる画面。
 * 本棚の位置から中央へ移動する演出（FLIP アニメーション）と、本を開く操作を担当する。
 */
export function CoverStage({ novel, fromRect, progress, onOpen, onClose }: Props) {
  const bookRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"enter" | "shown" | "leaving" | "opening">("enter");
  const finished = !!progress?.finished;
  const canResume = !!progress && !finished && !isAtBeginning(progress.anchor);

  /** 表紙の位置を本棚上の位置に合わせた transform を返す */
  const transformFromShelf = () => {
    const el = bookRef.current;
    if (!el || !fromRect) return null;
    const to = el.getBoundingClientRect();
    const sx = fromRect.width / to.width;
    const dx = fromRect.left - to.left;
    const dy = fromRect.top - to.top;
    return `translate(${dx}px, ${dy}px) scale(${sx})`;
  };

  // 本棚の位置 → 中央へ
  useLayoutEffect(() => {
    const el = bookRef.current;
    const from = transformFromShelf();
    if (!el || !from || prefersReducedMotion()) {
      setPhase("shown");
      return;
    }
    el.style.transition = "none";
    el.style.transform = from;
    el.getBoundingClientRect(); // reflow
    requestAnimationFrame(() => {
      el.style.transition = `transform ${FLY_MS}ms cubic-bezier(0.2, 0.75, 0.15, 1)`;
      el.style.transform = "";
    });
    const t = window.setTimeout(() => setPhase("shown"), FLY_MS);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = () => {
    if (phase !== "shown") return;
    setPhase("leaving");
    const el = bookRef.current;
    const back = transformFromShelf();
    if (!el || !back || prefersReducedMotion()) {
      onClose();
      return;
    }
    el.style.transition = `transform ${FLY_MS - 120}ms cubic-bezier(0.5, 0, 0.3, 1)`;
    el.style.transform = back;
    window.setTimeout(onClose, FLY_MS - 120);
  };

  const open = (mode: OpenMode) => {
    if (phase !== "shown") return;
    setPhase("opening");
    window.setTimeout(() => onOpen(mode), prefersReducedMotion() ? 0 : 380);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Enter") open(canResume ? "resume" : "start");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className={`cover-stage cover-stage--${phase}`} role="dialog" aria-modal="true" aria-label={`『${novel.title}』の表紙`}>
      <div className="cover-stage__backdrop" onClick={close} />

      <div className="cover-stage__content">
        <button
          type="button"
          className="cover-stage__book-button"
          onClick={() => open(canResume ? "resume" : "start")}
          aria-label={canResume ? "続きから読む" : "本を開く"}
        >
          <div
            ref={bookRef}
            className={`cover-stage__book ${novel.writingMode === "vertical" ? "cover-stage__book--bind-right" : ""}`}
          >
            <BookCover novel={novel} detailed />
            <div className="cover-stage__edge" aria-hidden="true" />
          </div>
        </button>

        <div className="cover-stage__info">
          <p className="cover-stage__desc">{novel.description}</p>
          <p className="cover-stage__tap">表紙をタップして本を開く</p>
          <div className="cover-stage__actions">
            {canResume ? (
              <>
                <button type="button" className="btn btn--primary" onClick={() => open("resume")}>
                  続きから読む
                  <span className="cover-stage__page">{progress!.pageNumber}ページ</span>
                </button>
                <button type="button" className="btn" onClick={() => open("start")}>
                  最初から読む
                </button>
              </>
            ) : (
              <button type="button" className="btn btn--primary" onClick={() => open("start")}>
                {finished ? "もう一度読む" : "本を開く"}
              </button>
            )}
            <button type="button" className="btn btn--quiet" onClick={close}>
              本棚に戻す
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
