/**
 * 作品データの型定義。
 * 本文・メタデータ・挿絵パスはすべて src/data/novels/ 以下のデータとして管理し、
 * 画面側のコンポーネントはこの型だけを見て描画する。
 */

/** LINE などのメッセージ（枠で囲んで表示する） */
export interface MessageLine {
  /** 送信者名（原稿の「澪：〜」の「澪」）。省略可 */
  from?: string;
  text: string;
}

export interface MessageBlock {
  type: "message";
  lines: MessageLine[];
}

/** 場面転換（◇） */
export interface SceneBreak {
  type: "break";
}

/**
 * BGM の雰囲気。原稿の「［BGM：切ない］」の行で切り替える（音は src/lib/bgm/ で自動生成）。
 * 無音 = BGM を止める。
 */
export type BgmMood = "静寂" | "日常" | "切ない" | "緊張" | "高揚" | "余韻" | "幻想" | "無音";

/** BGM の切り替え位置（表示はされない） */
export interface BgmCue {
  type: "bgm";
  mood: BgmMood;
}

/**
 * 本文の1行（段落）。
 * 文字列は書いたとおりに表示する（字下げは原稿の全角スペースをそのまま使う）。
 * 空文字 "" は空行になる。特殊な表示が必要なときだけオブジェクトを使う。
 */
export type Paragraph = string | MessageBlock | SceneBreak | BgmCue;

/** 章扉（タイトルページ） */
export interface TitlePageData {
  type: "title";
  title: string;
  subtitle?: string;
}

/**
 * 本文ページ。
 * 1つの text ページは必ず新しいページから始まる。
 * 画面サイズによって収まりきらない場合は、自動で次のページへ送られる。
 */
export interface TextPageData {
  type: "text";
  paragraphs: Paragraph[];
}

/** 挿絵ページ */
export interface ImagePageData {
  type: "image";
  /** 例: "/assets/novels/echoshion/illustrations/xxx.png"（public/ からのパス） */
  src: string;
  caption?: string;
  alt?: string;
  generatedWithAI?: boolean;
}

export type PageData = TitlePageData | TextPageData | ImagePageData;

export interface Chapter {
  id: string;
  title: string;
  /** 章の頭（章扉）から流す BGM。本文の最初の行が「［BGM：〜］」ならそれが入る */
  bgm?: BgmMood;
  pages: PageData[];
}

export interface Novel {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  /** public/ からのパス。画像が無い・読み込めない場合は themeColor から表紙を自動生成する */
  coverImage: string;
  /** 表紙画像にタイトル文字が描き込まれている場合は true（文字の重ね表示をしない） */
  coverHasTitle?: boolean;
  /** 表紙のタイトル文字を縦書きにする（長い和文タイトル向け。「、」の後で改行する） */
  coverTitleVertical?: boolean;
  /** 縦書きタイトルの列の分け方を指定する（「、」を含まない題名向け。例: ["星の終わりに", "君は生きる"]） */
  coverTitleLines?: string[];
  /** 上巻・下巻など。本棚の名札と表紙に小さく表示する */
  volume?: string;
  themeColor: string;
  /** 表紙・背表紙のアクセント色（省略時は白系） */
  accentColor?: string;
  description: string;
  /** 書字方向。vertical = 縦書き・右綴じ（左へページをめくる）。省略時は横書き */
  writingMode?: WritingMode;
  chapters: Chapter[];
  /** 最終ページに添えるイラスト（本文・章末の挿絵とは別） */
  endIllustration?: Omit<ImagePageData, "type">;
}

export type WritingMode = "horizontal" | "vertical";
