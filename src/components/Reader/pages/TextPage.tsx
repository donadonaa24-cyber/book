import type { LayoutBlock } from "../../../lib/paginate";
import { BLANK_LINE, paraClassName } from "../../../lib/paginate";
import { segmentText } from "../../../lib/typeset";

/** 縦中横などを適用した文字列。lib/typeset.ts の fillText と同じ構造で描画する */
export function RichText({ text }: { text: string }) {
  return (
    <>
      {segmentText(text).map((seg, i) =>
        seg.tcy ? (
          <span key={i} className="tcy">
            {seg.text}
          </span>
        ) : (
          seg.text
        ),
      )}
    </>
  );
}

/** 本文。マークアップは lib/paginate.ts の計測用 DOM と同じにすること */
export function TextBlocks({ blocks }: { blocks: LayoutBlock[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        if (b.kind === "para") {
          return (
            <p key={i} className={paraClassName(b.text)}>
              <RichText text={b.text || BLANK_LINE} />
            </p>
          );
        }
        if (b.kind === "message") {
          return (
            <div key={i} className="tp-msg">
              {b.message.lines.map((line, j) => (
                <p key={j} className="tp-msg__line">
                  {line.from && <span className="tp-msg__from">{line.from}</span>}
                  <span>
                    <RichText text={line.text || BLANK_LINE} />
                  </span>
                </p>
              ))}
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
