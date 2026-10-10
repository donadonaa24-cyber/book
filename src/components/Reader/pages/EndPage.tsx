import type { Novel } from "../../../types/novel";
import { ImageContent } from "./ImagePage";

interface Props {
  chapterTitle: string;
  onRestart: () => void;
  onExit: () => void;
  illustration?: Novel["endIllustration"];
}

export function EndContent({ chapterTitle, onRestart, onExit, illustration }: Props) {
  return (
    <div className={`end-page${illustration ? " end-page--illustrated" : ""}`}>
      {illustration && <ImageContent {...illustration} />}
      <div className="end-page__mark">{chapterTitle}　了</div>
      <div className="end-page__next">つづく</div>
      <div className="end-page__actions" data-no-flip>
        <button type="button" className="btn btn--paper" onClick={onExit}>
          本棚へ戻る
        </button>
        <button type="button" className="btn btn--paper btn--ghost" onClick={onRestart}>
          最初から読む
        </button>
      </div>
    </div>
  );
}
