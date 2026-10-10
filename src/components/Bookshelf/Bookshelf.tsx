import { useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { Novel } from "../../types/novel";
import { BookCover } from "../BookCover/BookCover";
import { useViewport } from "../../lib/useViewport";
import { prefersReducedMotion } from "../../lib/motion";
import { decorFor } from "./decor";
import type { Decor } from "./decor";
import "./bookshelf.css";

interface Props {
  novels: Novel[];
  /** 表紙画面に取り出し中の本（本棚上では空きスペースとして描画） */
  pickedId: string | null;
  onSelect: (novel: Novel, rect: DOMRect) => void;
  onCharacters: () => void;
}

const MIN_ROWS = 3;
const LIFT_MS = 320;

/** 本棚画面。作品は表紙を見せる形で並べ、余白には飾りの背表紙を置く */
export function Bookshelf({ novels, pickedId, onSelect, onCharacters }: Props) {
  const { width } = useViewport();
  const [lifting, setLifting] = useState<string | null>(null);
  const busy = useRef(false);

  const perRow = width < 560 ? 2 : width < 960 ? 3 : 4;
  const rows: Novel[][] = [];
  for (let i = 0; i < novels.length; i += perRow) rows.push(novels.slice(i, i + perRow));
  while (rows.length < MIN_ROWS) rows.push([]);

  const handlePick = (novel: Novel, el: HTMLElement) => {
    if (busy.current) return;
    busy.current = true;
    setLifting(novel.id);
    const delay = prefersReducedMotion() ? 0 : LIFT_MS;
    window.setTimeout(() => {
      const coverEl = el.querySelector<HTMLElement>(".book-cover") ?? el;
      onSelect(novel, coverEl.getBoundingClientRect());
      setLifting(null);
      busy.current = false;
    }, delay);
  };

  return (
    <div className="shelf-room">
      <div className="shelf-room__lamp" aria-hidden="true" />
      <header className="shelf-room__header">
        <p className="shelf-room__eyebrow">BOOKSHELF</p>
        <h1 className="shelf-room__title">本棚</h1>
        <p className="shelf-room__hint">読みたい本を手に取ってください</p>
        <button type="button" className="btn btn--bar shelf-room__characters" onClick={onCharacters}>登場人物をみる</button>
      </header>

      <div className="bookcase">
        <div className="bookcase__crown" aria-hidden="true" />
        {rows.map((row, ri) => {
          const decorCount = Math.max(0, (perRow - row.length) * 3 + (row.length ? 2 : 4));
          const decor = decorFor(ri, decorCount);
          const split = ri % 2 === 0 ? 0 : Math.ceil(decor.length / 2);
          return (
            <div className="bookcase__row" key={ri}>
              <div className="bookcase__books">
                {decor.slice(0, split).map((d, i) => (
                  <DecorItem key={`a${i}`} decor={d} />
                ))}
                {row.map((novel) => (
                  <ShelfBook
                    key={novel.id}
                    novel={novel}
                    picked={pickedId === novel.id}
                    lifting={lifting === novel.id}
                    onPick={handlePick}
                  />
                ))}
                {decor.slice(split).map((d, i) => (
                  <DecorItem key={`b${i}`} decor={d} />
                ))}
                {ri === 0 && <span className="decor-bookend" aria-hidden="true" />}
                {ri === MIN_ROWS - 1 && <span className="decor-plant" aria-hidden="true" />}
              </div>
              <div className="bookcase__board" aria-hidden="true" />
            </div>
          );
        })}
      </div>

      <p className="shelf-room__footer">作品は順次追加予定です</p>
    </div>
  );
}

function ShelfBook({
  novel,
  picked,
  lifting,
  onPick,
}: {
  novel: Novel;
  picked: boolean;
  lifting: boolean;
  onPick: (novel: Novel, el: HTMLElement) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <div className={`shelf-slot ${picked ? "shelf-slot--empty" : ""}`}>
      <button
        ref={ref}
        type="button"
        className={`shelf-book ${lifting ? "shelf-book--lifting" : ""}`}
        style={{ "--theme": novel.themeColor, "--accent": novel.accentColor ?? "#fff" } as CSSProperties}
        onClick={() => ref.current && onPick(novel, ref.current)}
        aria-label={`『${novel.title}』${novel.author}　を手に取る`}
        tabIndex={picked ? -1 : 0}
      >
        <span className="shelf-book__glow" aria-hidden="true" />
        <BookCover novel={novel} />
      </button>
      <div className="shelf-slot__plaque">
        <span className="shelf-slot__plaque-title">{novel.title}</span>
        {novel.volume && <span className="shelf-slot__plaque-volume">{novel.volume}</span>}
      </div>
    </div>
  );
}

function DecorItem({ decor }: { decor: Decor }) {
  return (
    <span
      className="decor-spine"
      aria-hidden="true"
      style={
        {
          "--w": `${decor.width}px`,
          "--h": `${decor.height}%`,
          "--c": decor.color,
          "--band": decor.band,
          "--lean": `${decor.lean ?? 0}deg`,
        } as CSSProperties
      }
    />
  );
}
