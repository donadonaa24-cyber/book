import { useState } from "react";
import { assetUrl } from "../../../lib/assets";

interface Props {
  src: string;
  caption?: string;
  alt?: string;
  generatedWithAI?: boolean;
}

/**
 * 挿絵。画像が未用意（読み込み失敗）の場合はプレースホルダーを表示する。
 * public/assets/novels/<id>/illustrations/ に同名ファイルを置けば自動で差し替わる。
 */
export function ImageContent({ src, caption, alt, generatedWithAI }: Props) {
  const [failed, setFailed] = useState(false);
  const fileName = src.split("/").pop();

  return (
    <figure className="image-page">
      <div className="image-page__frame">
        {failed ? (
          <div className="image-page__placeholder" role="img" aria-label={alt ?? caption ?? "挿絵"}>
            <svg viewBox="0 0 120 90" aria-hidden="true">
              <rect x="1" y="1" width="118" height="88" rx="4" fill="none" stroke="currentColor" strokeDasharray="3 4" />
              <circle cx="86" cy="28" r="9" fill="none" stroke="currentColor" />
              <path d="M10 76 L42 42 L62 62 L76 50 L110 76" fill="none" stroke="currentColor" strokeLinejoin="round" />
            </svg>
            <span className="image-page__placeholder-label">挿絵（準備中）</span>
            <span className="image-page__placeholder-file">{fileName}</span>
          </div>
        ) : (
          <img
            className="image-page__img"
            src={assetUrl(src)}
            alt={alt ?? caption ?? ""}
            draggable={false}
            loading="lazy"
            onError={() => setFailed(true)}
          />
        )}
      </div>
      {caption && <figcaption className="image-page__caption">{caption}</figcaption>}
      {generatedWithAI && <p className="image-page__credit">生成AIを使用したイラスト</p>}
    </figure>
  );
}
