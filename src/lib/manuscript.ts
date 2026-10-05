import type { MessageLine, Paragraph, TextPageData } from "../types/novel";

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
 * - 「◇」だけの行は場面転換の記号になる
 * - 「［改ページ］」だけの行で強制的に改ページする
 */
export function parseManuscript(raw: string): TextPageData[] {
  const lines = raw.replace(/\r\n?/g, "\n").split("\n");
  const pages: TextPageData[] = [];
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
    } else if (bare === "◇") {
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
