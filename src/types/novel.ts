/**
 * 作品データの型定義。
 * 本文・メタデータ・挿絵パスはすべて src/data/novels/ 以下のデータとして管理し、
 * 画面側のコンポーネントはこの型だけを見て描画する。
 */

/** LINE などのメッセージ画面を模した吹き出し */
export interface MessageBlock {
  type: "message";
  /** 送信者名（左側の吹き出しの上に小さく表示） */
  from: string;
  text: string;
  /** right = 視点人物が送ったメッセージ / left = 受け取ったメッセージ */
  side: "left" | "right";
}

/** 場面転換（◇） */
export interface SceneBreak {
  type: "break";
}

/**
 * 本文の1段落。
 * 通常は文字列をそのまま書けばよく、特殊な表示が必要なときだけオブジェクトを使う。
 */
export type Paragraph = string | MessageBlock | SceneBreak;

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
}

export type PageData = TitlePageData | TextPageData | ImagePageData;

export interface Chapter {
  id: string;
  title: string;
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
  themeColor: string;
  /** 表紙・背表紙のアクセント色（省略時は白系） */
  accentColor?: string;
  description: string;
  chapters: Chapter[];
}

/** 将来の縦書き対応のための書字方向 */
export type WritingMode = "horizontal" | "vertical";
