interface Props {
  chapterTitle: string;
  onRestart: () => void;
  onExit: () => void;
}

export function EndContent({ chapterTitle, onRestart, onExit }: Props) {
  return (
    <div className="end-page">
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
