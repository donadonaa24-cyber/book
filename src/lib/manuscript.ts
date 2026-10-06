import type { BgmMood, Chapter, ImagePageData, MessageLine, Paragraph, TextPageData } from "../types/novel";

const BGM_MOODS: readonly BgmMood[] = ["静寂", "日常", "切ない", "緊張", "高揚", "余韻", "幻想", "無音"];
const BGM_LINE = /^[［\[]BGM[：:]\s*(.+?)\s*[］\]]$/i;

/** 「［BGM：切ない］」の行なら雰囲気を返す（知らない名前は null） */
function parseBgmLine(bare: string): BgmMood | null | undefined {
  const m = BGM_LINE.exec(bare);
  if (!m) return undefined;
  const mood = m[1] as BgmMood;
  if (BGM_MOODS.includes(mood)) return mood;
  console.warn(`不明な BGM 指定: ${bare}（使えるのは ${BGM_MOODS.join("・")}）`);
  return null;
}

/**
 * テキスト原稿をページデータに変換する。原稿をそのまま貼り付けられるようにするためのもの。
 *
 * 書式
 * - 1行 = 1段落。行頭の全角スペースや「」は書いたとおりに表示する
 * - 空行はそのまま空行になる（ページの先頭に来た空行は自動で詰める）
 * - «〜» で囲んだ部分は LINE などのメッセージとして枠付きで表示する（複数行・空行可。長い場合は次のページへ続く）
 *     «澪：明日ゴミの日やで
 *     志遠：知ってる»
 *   のように「名前：」で始まる行は送信者名付きで表示する
 * - 「◇」や「＊＊＊」だけの行は場面転換の記号になる
 * - 「［改ページ］」だけの行で強制的に改ページする
 * - 「［挿絵：/assets/novels/〜.webp］」だけの行で、その位置に挿絵のページを入れる
 *   「［挿絵：パス｜キャプション］」のように「｜」の後にキャプションも書ける
 * - 「［BGM：切ない］」だけの行で、そのページから BGM を切り替える（表示はされない）
 *   使える雰囲気: 静寂・日常・切ない・緊張・高揚・余韻・幻想・無音（無音で止める）
 *   章の本文の最初の行に書くと、章扉から流れる。指定がなければ前の曲が続く
 */
export function parseManuscript(raw: string): (TextPageData | ImagePageData)[] {
  const lines = raw.replace(/\r\n?/g, "\n").split("\n");
  const pages: (TextPageData | ImagePageData)[] = [];
  let paragraphs: Paragraph[] = [];

  const pushBlank = () => {
    if (paragraphs.length > 0 && paragraphs[paragraphs.length - 1] !== "") paragraphs.push("");
  };
  const flush = () => {
    while (paragraphs[paragraphs.length - 1] === "") paragraphs.pop();
    if (paragraphs.length > 0) pages.push({ type: "text", paragraphs });
    paragraphs = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trimEnd();
    const bare = line.trim();

    if (bare === "") {
      pushBlank();
    } else if (bare === "［改ページ］" || bare === "[改ページ]") {
      flush();
    } else if (/^[［\[]挿絵[：:].+[］\]]$/.test(bare)) {
      const [src, caption] = bare.slice(4, -1).split(/[｜|]/).map((s) => s.trim());
      flush();
      pages.push({ type: "image", src, ...(caption ? { caption } : {}) });
    } else if (BGM_LINE.test(bare)) {
      const mood = parseBgmLine(bare);
      if (mood) paragraphs.push({ type: "bgm", mood });
    } else if (bare === "◇" || /^[＊*※]{3}$/.test(bare.replace(/\s/g, ""))) {
      paragraphs.push({ type: "break" });
    } else if (bare.startsWith("«")) {
      // メッセージブロック：» が出てくるまでを1つの枠にまとめる
      const body: string[] = [];
      let cur = bare.slice(1);
      for (;;) {
        const end = cur.indexOf("»");
        if (end >= 0) {
          body.push(cur.slice(0, end));
          break;
        }
        body.push(cur);
        if (++i >= lines.length) break;
        cur = lines[i].trim();
      }
      // 枠の中の空行も残す（連続する空行は1つにまとめ、前後の空行は落とす）
      const trimmed = body.map((s) => s.trim()).filter((s, j, arr) => s !== "" || arr[j - 1] !== "");
      while (trimmed[0] === "") trimmed.shift();
      while (trimmed[trimmed.length - 1] === "") trimmed.pop();
      if (trimmed.length) paragraphs.push({ type: "message", lines: trimmed.map(parseMessageLine) });
    } else {
      paragraphs.push(line);
    }
  }
  flush();
  return pages;
}

function parseMessageLine(text: string): MessageLine {
  if (text === "") return { text: "" };
  const m = /^([^\s：:]{1,8})[：:](.+)$/.exec(text);
  return m ? { from: m[1], text: m[2] } : { text };
}

/**
 * テキストファイル（1ファイル＝1章）から章の一覧を作る。
 * - ファイル名の順に並ぶ（00.txt, 01.txt, …）
 * - 1行目が章タイトル（扉に表示）、2行目以降が本文（書式は parseManuscript と同じ）
 */
export function chaptersFromTextFiles(files: Record<string, string>): Chapter[] {
  return Object.keys(files)
    .sort()
    .map((path) => {
      const raw = files[path].replace(/\r\n?/g, "\n").replace(/^\uFEFF/, "");
      const nl = raw.indexOf("\n");
      const title = (nl < 0 ? raw : raw.slice(0, nl)).trim();
      let body = nl < 0 ? "" : raw.slice(nl + 1);
      // 本文の最初の行が BGM 指定なら、章扉から流す
      const head = /^\s*(\S[^\n]*)/.exec(body);
      const bgm = head ? parseBgmLine(head[1].trim()) : undefined;
      if (head && bgm !== undefined) body = body.slice(head[0].length);
      const name = (path.split("/").pop() ?? path).replace(/\.txt$/, "");
      return {
        id: `ch-${name}`,
        title,
        ...(bgm ? { bgm } : {}),
        pages: [{ type: "title" as const, title }, ...parseManuscript(body)],
      };
    });
}
