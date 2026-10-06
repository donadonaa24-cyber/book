import type { BgmMood, MessageBlock, Novel, Paragraph, WritingMode } from "../types/novel";
import type { ReadingAnchor } from "./progress";
import { compareAnchor } from "./progress";
import { fillText } from "./typeset";

/**
 * 作品データ（章 → ページ → 段落）を、実際の画面サイズに合わせた「表示ページ」に割り付ける。
 *
 * - データ上の text ページは必ず改ページして始まる
 * - 1ページに収まらない段落は、実際の DOM で文字数を測って途中で分割する（簡易禁則処理あり）
 * - 計測は画面に表示されるページと同じクラス・同じ CSS で行うので、フォントサイズや余白を
 *   CSS 側で変えても自動で追従する。縦書き（writing-mode: vertical-rl）では横方向のあふれで判定する
 */

export type LayoutBlock =
  | {
      kind: "para";
      text: string;
      paragraphIndex: number;
      charOffset: number;
      /** 前のページから続いている段落 */
      continued: boolean;
    }
  | {
      kind: "message";
      /** 長いメッセージはページをまたいで分割されるので、このページに載る行だけを持つ */
      message: MessageBlock;
      paragraphIndex: number;
      /** 行番号 × MSG_LINE_STRIDE + 行内の文字位置（読書位置の保存用） */
      charOffset: number;
    }
  | { kind: "break"; paragraphIndex: number };

interface PageBase {
  key: string;
  /** このページから切り替える BGM（原稿の「［BGM：〜］」・章の bgm） */
  bgm?: BgmMood;
  /** 表示上のページ番号（空白ページは null） */
  number: number | null;
  anchor: ReadingAnchor;
  chapterTitle: string;
}

export type LayoutPage =
  | (PageBase & { kind: "blank" })
  | (PageBase & { kind: "title"; novelTitle: string; title: string; subtitle?: string; author: string })
  | (PageBase & { kind: "text"; blocks: LayoutBlock[] })
  | (PageBase & { kind: "image"; src: string; caption?: string; alt?: string })
  | (PageBase & { kind: "end"; novelTitle: string });

export interface PaginateOptions {
  pageWidth: number;
  pageHeight: number;
  /** 見開き表示。章扉が奇数ページ側（横書きは右・縦書きは左）に来るよう白紙を入れ、総ページ数を偶数に揃える */
  spread: boolean;
  writingMode: WritingMode;
}

// ── 計測用 DOM（TextPage コンポーネントと同じ構造・クラス名） ─────────────

/** 空行は全角スペース1文字の段落として組む（1行分の高さ・幅を確保するため） */
export const BLANK_LINE = "\u3000";

export function paraClassName(text: string): string {
  return text === "" ? "tp-para tp-para--blank" : "tp-para";
}

function buildPara(text: string): HTMLElement {
  const p = document.createElement("p");
  p.className = paraClassName(text);
  fillText(p, text || BLANK_LINE);
  return p;
}

function buildMessage(m: MessageBlock): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "tp-msg";
  for (const line of m.lines) {
    const p = document.createElement("p");
    p.className = "tp-msg__line";
    if (line.from) {
      const from = document.createElement("span");
      from.className = "tp-msg__from";
      from.textContent = line.from;
      p.appendChild(from);
    }
    const text = document.createElement("span");
    fillText(text, line.text || BLANK_LINE);
    p.appendChild(text);
    wrap.appendChild(p);
  }
  return wrap;
}

function buildBreak(): HTMLElement {
  const d = document.createElement("div");
  d.className = "tp-break";
  d.textContent = "◇";
  return d;
}

function createMeasureHost(opts: PaginateOptions) {
  const page = document.createElement("div");
  page.className = `book-page book-page--text book-page--${opts.writingMode}`;
  page.setAttribute("aria-hidden", "true");
  Object.assign(page.style, {
    position: "fixed",
    left: "-10000px",
    top: "0",
    visibility: "hidden",
    pointerEvents: "none",
    width: `${opts.pageWidth}px`,
    height: `${opts.pageHeight}px`,
  });
  page.innerHTML =
    `<div class="book-page__inner" style="--page-w:${opts.pageWidth}px;--page-h:${opts.pageHeight}px">` +
    '<div class="book-page__header">&nbsp;</div>' +
    '<div class="book-page__body tp"></div>' +
    '<div class="book-page__footer"><span class="book-page__number">000</span></div>' +
    "</div>";
  document.body.appendChild(page);
  const body = page.querySelector<HTMLElement>(".book-page__body")!;
  const fits =
    opts.writingMode === "vertical"
      ? () => body.scrollWidth <= body.clientWidth + 1
      : () => body.scrollHeight <= body.clientHeight + 1;
  return { page, body, fits, dispose: () => page.remove() };
}

// ── 簡易禁則処理 ──────────────────────────────

const NO_LINE_START = "、。，．,.・：；？！?!ー〜」』）)】〉》…‥ぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮヵヶ";
const NO_LINE_END = "「『（(【〈《";
/** これより短い断片しか前ページに残らないなら、段落ごと次ページへ送る */
const MIN_FRAGMENT = 6;
/** メッセージ枠内の位置を1つの数値で表すための係数（1行がこれより長くなることはない想定） */
const MSG_LINE_STRIDE = 100_000;

const ALNUM = /[A-Za-z0-9]/;

function adjustSplit(text: string, n: number): number {
  while (n > 1 && NO_LINE_START.includes(text[n] ?? "")) n--;
  while (n > 1 && NO_LINE_END.includes(text[n - 1] ?? "")) n--;
  // 英単語（縦中横を含む）の途中では切らない
  while (n > 1 && ALNUM.test(text[n - 1]) && ALNUM.test(text[n] ?? "")) n--;
  return n;
}

// ── 割り付け本体 ──────────────────────────────

export function paginateNovel(novel: Novel, opts: PaginateOptions): LayoutPage[] {
  const host = createMeasureHost(opts);
  const pages: LayoutPage[] = [];
  let number = 0;
  let blankCount = 0;
  /** 次に置くページに付ける BGM 指定 */
  let cue: BgmMood | undefined;
  const takeCue = () => {
    const c = cue;
    cue = undefined;
    return c ? { bgm: c } : {};
  };

  const blank = (anchor: ReadingAnchor, chapterTitle: string): LayoutPage => ({
    kind: "blank",
    key: `blank-${blankCount++}`,
    number: null,
    anchor,
    chapterTitle,
  });

  try {
    if (opts.spread) {
      pages.push(blank({ chapterIndex: 0, pageIndex: 0, paragraphIndex: 0, charOffset: 0 }, ""));
    }

    novel.chapters.forEach((chapter, ci) => {
      chapter.pages.forEach((src, pi) => {
        const baseAnchor: ReadingAnchor = { chapterIndex: ci, pageIndex: pi, paragraphIndex: 0, charOffset: 0 };

        if (src.type === "title") {
          if (chapter.bgm) cue = chapter.bgm;
          // 見開きでは章扉を奇数インデックス（横書きは右ページ・縦書きは左ページ）に置く
          if (opts.spread && pages.length % 2 === 0) pages.push(blank(baseAnchor, chapter.title));
          pages.push({
            kind: "title",
            key: `${chapter.id}-${pi}`,
            number: ++number,
            anchor: baseAnchor,
            chapterTitle: chapter.title,
            ...takeCue(),
            novelTitle: novel.title,
            title: src.title,
            subtitle: src.subtitle,
            author: novel.author,
          });
          return;
        }

        if (src.type === "image") {
          pages.push({
            kind: "image",
            key: `${chapter.id}-${pi}`,
            number: ++number,
            anchor: baseAnchor,
            chapterTitle: chapter.title,
            ...takeCue(),
            src: src.src,
            caption: src.caption,
            alt: src.alt,
          });
          return;
        }

        // text
        let blocks: LayoutBlock[] = [];
        let part = 0;
        host.body.replaceChildren();

        const flush = () => {
          if (blocks.length === 0) return;
          const first = blocks[0];
          pages.push({
            kind: "text",
            key: `${chapter.id}-${pi}-${part++}`,
            number: ++number,
            anchor: {
              chapterIndex: ci,
              pageIndex: pi,
              paragraphIndex: first.paragraphIndex,
              charOffset: first.kind === "break" ? 0 : first.charOffset,
            },
            chapterTitle: chapter.title,
            ...takeCue(),
            blocks,
          });
          blocks = [];
          host.body.replaceChildren();
        };

        /**
         * メッセージ枠を置く。入りきらなければ行単位で次のページへ送り、
         * 1行すら入らない場合だけ行の途中で分割する。
         */
        const placeMessage = (msg: MessageBlock, idx: number) => {
          const lines = msg.lines;
          let li = 0;
          let co = 0;
          const push = (part: MessageBlock["lines"], el: HTMLElement) => {
            host.body.appendChild(el);
            blocks.push({
              kind: "message",
              message: { type: "message", lines: part },
              paragraphIndex: idx,
              charOffset: li * MSG_LINE_STRIDE + co,
            });
          };
          for (;;) {
            if (li < lines.length && co >= lines[li].text.length && co > 0) {
              li++;
              co = 0;
            }
            // ページ先頭に来た枠内の空行は詰める
            if (blocks.length === 0 && co === 0) while (li < lines.length && lines[li].text === "") li++;
            if (li >= lines.length) return;

            const first = lines[li];
            const rest = [co > 0 ? { text: first.text.slice(co) } : first, ...lines.slice(li + 1)];
            const whole = buildMessage({ type: "message", lines: rest });
            host.body.appendChild(whole);
            if (host.fits()) {
              whole.remove();
              push(rest, whole);
              return;
            }
            whole.remove();

            // このページに何行入るか（二分探索）
            let lo = 0;
            let hi = rest.length - 1;
            while (lo < hi) {
              const mid = Math.ceil((lo + hi) / 2);
              const el = buildMessage({ type: "message", lines: rest.slice(0, mid) });
              host.body.appendChild(el);
              const ok = host.fits();
              el.remove();
              if (ok) lo = mid;
              else hi = mid - 1;
            }
            if (lo > 0) {
              const part = rest.slice(0, lo);
              push(part, buildMessage({ type: "message", lines: part }));
              li += lo;
              co = 0;
              flush();
              continue;
            }
            if (blocks.length > 0) {
              flush();
              continue;
            }

            // 空のページに1行も入らない長い行は、文字の途中で分割する
            const line = rest[0];
            let a = 1;
            let b = Math.max(1, line.text.length - 1);
            while (a < b) {
              const mid = Math.ceil((a + b) / 2);
              const el = buildMessage({ type: "message", lines: [{ ...line, text: line.text.slice(0, mid) }] });
              host.body.appendChild(el);
              const ok = host.fits();
              el.remove();
              if (ok) a = mid;
              else b = mid - 1;
            }
            const n = Math.max(1, adjustSplit(line.text, a));
            const part = [{ ...line, text: line.text.slice(0, n) }];
            push(part, buildMessage({ type: "message", lines: part }));
            co += n;
            flush();
          }
        };

        src.paragraphs.forEach((para: Paragraph, idx) => {
          if (typeof para !== "string") {
            if (para.type === "bgm") {
              cue = para.mood;
              return;
            }
            if (para.type === "message") {
              placeMessage(para, idx);
              return;
            }
            const el = buildBreak();
            host.body.appendChild(el);
            if (!host.fits() && blocks.length > 0) {
              el.remove();
              flush();
              host.body.appendChild(el);
            }
            blocks.push({ kind: "break", paragraphIndex: idx });
            return;
          }

          // ページ先頭の空行は詰める
          if (para === "" && blocks.length === 0) return;

          let offset = 0;
          // 段落が収まるまで、収まる分だけ切り出してページを送る
          for (;;) {
            const rest = para.slice(offset);
            const continued = offset > 0;
            const el = buildPara(rest);
            host.body.appendChild(el);
            if (host.fits()) {
              blocks.push({ kind: "para", text: rest, paragraphIndex: idx, charOffset: offset, continued });
              return;
            }
            if (para === "") {
              // 空行が入りきらない＝ページ末尾。空行は捨てて改ページする
              el.remove();
              flush();
              return;
            }

            // 二分探索で、このページに入る最大文字数を求める
            let lo = 0;
            let hi = rest.length;
            while (lo < hi) {
              const mid = Math.ceil((lo + hi) / 2);
              fillText(el, rest.slice(0, mid));
              if (host.fits()) lo = mid;
              else hi = mid - 1;
            }
            el.remove();

            let n = lo > 0 ? adjustSplit(rest, lo) : 0;
            if (n < MIN_FRAGMENT && blocks.length > 0) n = 0;
            if (n === 0 && blocks.length === 0) n = Math.max(1, lo); // 1ページに1文字も入らない極端なケースの保険

            if (n > 0) {
              const text = rest.slice(0, n);
              host.body.appendChild(buildPara(text));
              blocks.push({ kind: "para", text, paragraphIndex: idx, charOffset: offset, continued });
              offset += n;
            }
            flush();
            if (offset >= para.length) return;
          }
        });
        flush();
      });
    });

    const lastChapter = novel.chapters[novel.chapters.length - 1];
    pages.push({
      kind: "end",
      key: "end",
      number: ++number,
      anchor: {
        chapterIndex: novel.chapters.length - 1,
        pageIndex: lastChapter ? lastChapter.pages.length : 0,
        paragraphIndex: 0,
        charOffset: 0,
      },
      chapterTitle: lastChapter?.title ?? "",
      ...takeCue(),
      novelTitle: novel.title,
    });

    if (opts.spread && pages.length % 2 === 1) {
      pages.push(blank(pages[pages.length - 1].anchor, ""));
    }
  } finally {
    host.dispose();
  }

  return pages;
}

/** 保存したアンカーを含む表示ページのインデックスを探す */
export function findPageIndex(pages: LayoutPage[], anchor: ReadingAnchor): number {
  let found = -1;
  pages.forEach((p, i) => {
    if (p.kind === "blank") return;
    if (compareAnchor(p.anchor, anchor) <= 0) found = i;
  });
  if (found === -1) found = pages.findIndex((p) => p.kind !== "blank");
  return Math.max(0, found);
}

/** 総ページ数（空白ページを除く） */
export function countNumberedPages(pages: LayoutPage[]): number {
  return pages.reduce((n, p) => (p.number != null ? n + 1 : n), 0);
}
