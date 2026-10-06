import { useState } from "react";
import type { CSSProperties } from "react";
import type { Novel } from "../../types/novel";
import { assetUrl } from "../../lib/assets";
import "./bookCover.css";

interface Props {
  novel: Novel;
  className?: string;
  /** 大きく表示するとき（表紙画面）は著者名なども表示 */
  detailed?: boolean;
  /** 綴じ側。縦書きの本は右綴じ。省略時は作品の書字方向から決める */
  binding?: "left" | "right";
}

/**
 * 本の表紙。coverImage を表示し、読み込めない場合は themeColor から表紙を自動生成する。
 * タイトル文字は coverHasTitle が false のとき重ねて表示する。
 */
export function BookCover({ novel, className, detailed = false, binding }: Props) {
  const side = binding ?? (novel.writingMode === "vertical" ? "right" : "left");
  const [failed, setFailed] = useState(false);
  const showText = failed || !novel.coverHasTitle;

  const style = {
    "--cover-theme": novel.themeColor,
    "--cover-accent": novel.accentColor ?? "#f3f4f6",
  } as CSSProperties;

  return (
    <div
      className={`book-cover book-cover--bind-${side} ${novel.coverTitleVertical ? "book-cover--vtitle" : ""} ${failed ? "book-cover--fallback" : ""} ${className ?? ""}`}
      style={style}
    >
      {!failed && (
        <img
          className="book-cover__image"
          src={assetUrl(novel.coverImage)}
          alt=""
          draggable={false}
          onError={() => setFailed(true)}
        />
      )}
      {showText && (
        <div className="book-cover__text">
          <div className="book-cover__title">
            {novel.coverTitleVertical
              ? novel.title.split(/(?<=、)/).map((line, i) => <span key={i}>{line}</span>)
              : novel.title}
          </div>
          <div className="book-cover__rule" />
          {detailed && <div className="book-cover__subtitle">{novel.subtitle}</div>}
          <div className="book-cover__author">{novel.author}</div>
        </div>
      )}
      <div className="book-cover__hinge" aria-hidden="true" />
      <div className="book-cover__gloss" aria-hidden="true" />
    </div>
  );
}
