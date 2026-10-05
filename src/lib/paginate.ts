import type { MessageBlock, Novel, Paragraph, WritingMode } from "../types/novel";
import type { ReadingAnchor } from "./progress";
import { compareAnchor } from "./progress";

/**
 * 作品データ（章 → ページ → 段落）を、実際の画面サイズに合わせた「表示ページ」に割り付ける。
 *
 * - データ上の text ページは必ず改ページして始まる
 * - 1ページに収まらない段落は、実際の DOM で文字数を測って途中で分割する（簡易禁則処理あり）
 * - 計測は画面に表示されるページと同じクラス・同じ CSS で行うので、フォントサイズや余白を
 *   CSS 側で変えても自動で追従する。縦書き（writing-mode: vertical-rl）でも同じ仕組みで計測できる
 */

export type LayoutBlock =
  | {
      kind: "para";
      text: string;
      paragraphIndex: number;
      charOffset: number;
      /** 前のページから続いている段落（字下げしない） */
      continued: boolean;
      dialogue: boolean;
    }
  | { kind: "message"; message: MessageBlock; paragraphIndex: number }
  | { kind: "break"; paragraphIndex: number };

interface PageBase {
  key: string;
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
  /** 見開き表示。タイトルページが右側に来るよう先頭に白紙を入れ、総ページ数を偶数に揃える */
  spread: boolean;
  writingMode: WritingMode;
}

// ── 計測用 DOM（TextPage コンポーネントと同じ構造・クラス名） ─────────────

const DIALOGUE_START = /^[「『（(〈《【]/;

export function isDialogue(text: string): boolean {
  return DIALOGUE_START.test(text);
}

export function paraClassName(continued: boolean, dialogue: boolean): string {
  return ["tp-para", continued && "tp-para--cont", dialogue && !continued && "tp-para--dialogue"]
    .filter(Boolean)
    .join(" ");
}

function buildPara(text: string, continued: boolean, dialogue: boolean): HTMLElement {
  const p = document.createElement("p");
  p.className = paraClassName(continued, dialogue);
  p.textContent = text;
  return p;
}

function buildMessage(m: MessageBlock): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = `tp-msg tp-msg--${m.side}`;
  if (m.side === "left") {
    const from = document.createElement("span");
    from.className = "tp-msg__from";
    from.textContent = m.from;
    wrap.appendChild(from);
  }
  const bubble = document.createElement("p");
  bubble.className = "tp-msg__bubble";
  bubble.textContent = m.text;
  wrap.appendChild(bubble);
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

function adjustSplit(text: string, n: number): number {
  while (n > 1 && NO_LINE_START.includes(text[n] ?? "")) n--;
  while (n > 1 && NO_LINE_END.includes(text[n - 1] ?? "")) n--;
  return n;
}

// ── 割り付け本体 ──────────────────────────────

export function paginateNovel(novel: Novel, opts: PaginateOptions): LayoutPage[] {
  const host = createMeasureHost(opts);
  const pages: LayoutPage[] = [];
  let number = 0;
  let blankCount = 0;

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
          // 見開きでは章扉を右ページ（奇数インデックス）に置く
          if (opts.spread && pages.length % 2 === 0) pages.push(blank(baseAnchor, chapter.title));
          pages.push({
            kind: "title",
            key: `${chapter.id}-${pi}`,
            number: ++number,
            anchor: baseAnchor,
            chapterTitle: chapter.title,
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
              charOffset: first.kind === "para" ? first.charOffset : 0,
            },
            chapterTitle: chapter.title,
            blocks,
          });
          blocks = [];
          host.body.replaceChildren();
        };

        src.paragraphs.forEach((para: Paragraph, idx) => {
          if (typeof para !== "string") {
            const el = para.type === "message" ? buildMessage(para) : buildBreak();
            host.body.appendChild(el);
            if (!host.fits() && blocks.length > 0) {
              el.remove();
              flush();
              host.body.appendChild(el);
            }
            blocks.push(
              para.type === "message"
                ? { kind: "message", message: para, paragraphIndex: idx }
                : { kind: "break", paragraphIndex: idx },
            );
            return;
          }

          const dialogue = isDialogue(para);
          let offset = 0;
          // 段落が収まるまで、収まる分だけ切り出してページを送る
          for (;;) {
            const rest = para.slice(offset);
            const continued = offset > 0;
            const el = buildPara(rest, continued, dialogue);
            host.body.appendChild(el);
            if (host.fits()) {
              blocks.push({ kind: "para", text: rest, paragraphIndex: idx, charOffset: offset, continued, dialogue });
              return;
            }

            // 二分探索で、このページに入る最大文字数を求める
            let lo = 0;
            let hi = rest.length;
            while (lo < hi) {
              const mid = Math.ceil((lo + hi) / 2);
              el.textContent = rest.slice(0, mid);
              if (host.fits()) lo = mid;
              else hi = mid - 1;
            }
            el.remove();

            let n = lo > 0 ? adjustSplit(rest, lo) : 0;
            if (n < MIN_FRAGMENT && blocks.length > 0) n = 0;
            if (n === 0 && blocks.length === 0) n = Math.max(1, lo); // 1ページに1文字も入らない極端なケースの保険

            if (n > 0) {
              const text = rest.slice(0, n);
              host.body.appendChild(buildPara(text, continued, dialogue));
              blocks.push({ kind: "para", text, paragraphIndex: idx, charOffset: offset, continued, dialogue });
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
