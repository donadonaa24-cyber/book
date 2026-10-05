import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { Novel } from "../../types/novel";
import type { BookLayout } from "../../lib/bookLayout";
import { prefersReducedMotion } from "../../lib/motion";
import { BookCover } from "../BookCover/BookCover";
import "./opening.css";

interface Props {
  novel: Novel;
  layout: BookLayout;
  /** 下の読書画面の準備ができるまでは最後のフェードアウトを待つ */
  readerReady: boolean;
  onDone: () => void;
}

/** 自動でめくれるページの枚数 */
const LEAVES = 7;
const COVER_DELAY = 250;
const COVER_DURATION = 900;
const LEAF_START = 850;
const LEAF_STAGGER = 150;
const LEAF_DURATION = 620;
const FADE = 450;
const TOTAL = LEAF_START + (LEAVES - 1) * LEAF_STAGGER + LEAF_DURATION + 200;

/**
 * 本を開いたときのオープニング演出。
 * 表紙が開き、数ページがぺらぺらと自動でめくれたあと、読書画面へフェードする。
 * CSS アニメーションのみで実装（タップでスキップ可能）。
 */
export function OpeningAnimation({ novel, layout, readerReady, onDone }: Props) {
  const [animDone, setAnimDone] = useState(() => prefersReducedMotion());
  const [leaving, setLeaving] = useState(false);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (animDone) return;
    const t = window.setTimeout(() => setAnimDone(true), TOTAL);
    return () => window.clearTimeout(t);
  }, [animDone]);

  useEffect(() => {
    if (!animDone || !readerReady) return;
    setLeaving(true);
    const t = window.setTimeout(() => doneRef.current(), FADE);
    return () => window.clearTimeout(t);
  }, [animDone, readerReady]);

  const { pageWidth, pageHeight, spread } = layout;
  const style = {
    "--pw": `${pageWidth}px`,
    "--ph": `${pageHeight}px`,
    "--cover-delay": `${COVER_DELAY}ms`,
    "--cover-duration": `${COVER_DURATION}ms`,
    "--leaf-duration": `${LEAF_DURATION}ms`,
    "--fade": `${FADE}ms`,
  } as CSSProperties;

  return (
    <div
      className={`opening ${spread ? "opening--spread" : "opening--single"} ${leaving ? "opening--leaving" : ""}`}
      style={style}
      onClick={() => setAnimDone(true)}
      role="presentation"
    >
      <div className="opening__book">
        <div className="opening__left" aria-hidden="true" />
        <div className="opening__right">
          <div className="opening__stack" aria-hidden="true" />
          {Array.from({ length: LEAVES }, (_, i) => (
            <div
              key={i}
              className="opening__leaf"
              style={
                {
                  animationDelay: `${LEAF_START + (LEAVES - 1 - i) * LEAF_STAGGER}ms`,
                  // 重なり順は z 方向のわずかなずらしで表現（めくった後は左側に逆順で積まれる）
                  "--z0": `${i + 1}px`,
                  "--z1": `${-(LEAVES - i + 1)}px`,
                } as CSSProperties
              }
              aria-hidden="true"
            >
              <div className="opening__face opening__face--front" />
              <div className="opening__face opening__face--back" />
            </div>
          ))}
          <div className="opening__cover" style={{ "--z0": `${LEAVES + 2}px`, "--z1": "-1px" } as CSSProperties}>
            <div className="opening__face opening__face--front">
              <BookCover novel={novel} />
            </div>
            <div
              className="opening__face opening__face--back opening__endpaper"
              style={{ "--cover-theme": novel.themeColor } as CSSProperties}
            />
          </div>
        </div>
      </div>
      <p className="opening__hint">タップでスキップ</p>
    </div>
  );
}
