import type { LayoutBlock } from "../../../lib/paginate";
import { paraClassName } from "../../../lib/paginate";

/** 本文。マークアップは lib/paginate.ts の計測用 DOM と同じにすること */
export function TextBlocks({ blocks }: { blocks: LayoutBlock[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        if (b.kind === "para") {
          return (
            <p key={i} className={paraClassName(b.continued, b.dialogue)}>
              {b.text}
            </p>
          );
        }
        if (b.kind === "message") {
          return (
            <div key={i} className={`tp-msg tp-msg--${b.message.side}`}>
              {b.message.side === "left" && <span className="tp-msg__from">{b.message.from}</span>}
              <p className="tp-msg__bubble">{b.message.text}</p>
            </div>
          );
        }
        return (
          <div key={i} className="tp-break" aria-label="場面転換">
            ◇
          </div>
        );
      })}
    </>
  );
}
