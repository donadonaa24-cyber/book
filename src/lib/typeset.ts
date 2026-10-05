/**
 * 縦書き用の組版補助。
 * 1〜2文字の半角英数字（「AI」など）や「7.5」のような短い数字は縦中横（文字を横に並べて1マスに収める）にする。
 * 計測用 DOM と React 描画の両方からこの関数で分割するので、割り付けと表示が一致する。
 */
export interface TextSegment {
  text: string;
  tcy: boolean;
}

// 1〜2文字の英数字、または「7.5」のような短い小数
const TCY = /(?<![A-Za-z0-9.])(?:[0-9]\.[0-9]|[A-Za-z0-9]{1,2})(?![A-Za-z0-9.])/g;

export function segmentText(text: string): TextSegment[] {
  const out: TextSegment[] = [];
  let last = 0;
  for (const m of text.matchAll(TCY)) {
    const at = m.index ?? 0;
    if (at > last) out.push({ text: text.slice(last, at), tcy: false });
    out.push({ text: m[0], tcy: true });
    last = at + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), tcy: false });
  return out;
}

/** 計測用 DOM に、React 側（RichText）と同じ構造で文字を流し込む */
export function fillText(el: HTMLElement, text: string): void {
  el.replaceChildren(
    ...segmentText(text).map((seg) => {
      if (!seg.tcy) return document.createTextNode(seg.text);
      const span = document.createElement("span");
      span.className = "tcy";
      span.textContent = seg.text;
      return span;
    }),
  );
}
