/**
 * 読書位置の保存（localStorage）。
 * ページ番号は画面サイズで変わるため、「どの章の・どの元ページの・何段落目の・何文字目か」という
 * アンカーで保存し、次回はレイアウト後にそのアンカーを含むページを探して復元する。
 */

export interface ReadingAnchor {
  chapterIndex: number;
  pageIndex: number;
  paragraphIndex: number;
  charOffset: number;
}

export interface ReadingProgress {
  anchor: ReadingAnchor;
  /** 保存時点での表示ページ番号（目安表示用） */
  pageNumber: number;
  totalPages: number;
  finished: boolean;
  updatedAt: number;
}

const KEY_PREFIX = "digital-bookshelf:progress:";

export function loadProgress(novelId: string): ReadingProgress | null {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + novelId);
    if (!raw) return null;
    const data = JSON.parse(raw) as ReadingProgress;
    if (!data?.anchor || typeof data.anchor.chapterIndex !== "number") return null;
    return data;
  } catch {
    return null;
  }
}

export function saveProgress(novelId: string, progress: ReadingProgress): void {
  try {
    localStorage.setItem(KEY_PREFIX + novelId, JSON.stringify(progress));
  } catch {
    // プライベートモード等で保存できない場合は何もしない
  }
}

export function clearProgress(novelId: string): void {
  try {
    localStorage.removeItem(KEY_PREFIX + novelId);
  } catch {
    // noop
  }
}

export function compareAnchor(a: ReadingAnchor, b: ReadingAnchor): number {
  return (
    a.chapterIndex - b.chapterIndex ||
    a.pageIndex - b.pageIndex ||
    a.paragraphIndex - b.paragraphIndex ||
    a.charOffset - b.charOffset
  );
}

/** 本文の冒頭（章扉）にいるかどうか。ここなら「続きから」を出す必要はない */
export function isAtBeginning(anchor: ReadingAnchor): boolean {
  return anchor.chapterIndex === 0 && anchor.pageIndex === 0;
}
