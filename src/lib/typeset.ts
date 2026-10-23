/**
 * 縦書き用の組版補助。
 * 1〜2文字の半角英数字（「AI」など）や「7.5」のような短い数字は縦中横（文字を横に並べて1マスに収める）にする。
 * 「2011」のような3〜4桁の数字は、横倒しにせず1文字ずつ正立させる。
 * 傍点の付いた文字（原稿の《《〜》》）は bouten の class で囲む。
 * 計測用 DOM と React 描画の両方からこの関数で分割するので、割り付けと表示が一致する。
 */
export interface TextSegment {
  text: string;
  /** 付ける class（tcy = 縦中横, upright = 正立, bouten = 傍点）。null は通常の文字 */
  cls: "tcy" | "upright" | "bouten" | null;
}

/**
 * 傍点の目印。原稿の《《〜》》は、読み込み時に1文字ずつこの目印を前に付けた形に変える。
 * 文字単位で付けておくので、ページの途中で段落が分かれても傍点が崩れない。
 */
export const BOUTEN_MARK = "\uE000";

/** 「《《三回》》」→ 目印付きの「三回」 */
export function markBouten(text: string): string {
  return text.replace(/《《(.+?)》》/g, (_, inner: string) => [...inner].map((c) => BOUTEN_MARK + c).join(""));
}

// 1〜2文字の英数字、「7.5」のような短い小数（縦中横）、または3〜4桁の数字（正立）
const TCY = /(?<![A-Za-z0-9.])(?:[0-9]\.[0-9]|[A-Za-z0-9]{1,2}|([0-9]{3,4}))(?![A-Za-z0-9.])/g;

export function segmentText(text: string): TextSegment[] {
  if (!text.includes(BOUTEN_MARK)) return segmentPlain(text);
  // 傍点の付いた文字の並びと、それ以外の並びに分ける
  const out: TextSegment[] = [];
  const re = new RegExp(`((?:${BOUTEN_MARK}.)+)`, "gu");
  let last = 0;
  for (const m of text.matchAll(re)) {
    const at = m.index ?? 0;
    if (at > last) out.push(...segmentPlain(text.slice(last, at).replaceAll(BOUTEN_MARK, "")));
    out.push({ text: m[0].replaceAll(BOUTEN_MARK, ""), cls: "bouten" });
    last = at + m[0].length;
  }
  if (last < text.length) out.push(...segmentPlain(text.slice(last).replaceAll(BOUTEN_MARK, "")));
  return out;
}

function segmentPlain(text: string): TextSegment[] {
  const out: TextSegment[] = [];
  let last = 0;
  for (const m of text.matchAll(TCY)) {
    const at = m.index ?? 0;
    if (at > last) out.push({ text: text.slice(last, at), cls: null });
    out.push({ text: m[0], cls: m[1] ? "upright" : "tcy" });
    last = at + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), cls: null });
  return out;
}

/** 計測用 DOM に、React 側（RichText）と同じ構造で文字を流し込む */
export function fillText(el: HTMLElement, text: string): void {
  el.replaceChildren(
    ...segmentText(text).map((seg) => {
      if (!seg.cls) return document.createTextNode(seg.text);
      const span = document.createElement("span");
      span.className = seg.cls;
      span.textContent = seg.text;
      return span;
    }),
  );
}
