# デジタル本棚

本棚から小説を選び、本を手に取って、ページをめくりながら読む Web アプリ（PWA 対応）。
第一弾として『EchoShion』第一話「みたらしとおはぎ」を収録しています。

- React + TypeScript + Vite
- ページめくり: [react-pageflip](https://github.com/Nodlik/react-pageflip)（StPageFlip）
- PWA: vite-plugin-pwa（オフライン閲覧・ホーム画面に追加）
- 3D エンジン不使用。演出は CSS アニメーションとページめくりライブラリのみ

## 起動

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # dist/ に静的ファイルを出力
npm run preview    # ビルド結果の確認（PWA の動作確認はこちら）
```

## 操作

| 操作 | 動作 |
| --- | --- |
| 画面の右半分をクリック／タップ、左スワイプ、→ キー | 次のページ |
| 画面の左半分をクリック／タップ、右スワイプ、← キー | 前のページ |
| 右上「本棚へ戻る」、Esc キー | 本棚へ戻る |

読書位置は localStorage に自動保存され、次に同じ本を手に取ると「続きから読む」を選べます。
（ページ番号ではなく「章・元ページ・段落・文字位置」で保存するため、画面サイズが変わっても同じ場所から再開できます）

## ディレクトリ構成

```
public/assets/novels/echoshion/
  cover.svg                 表紙アート（タイトル文字なし）
  illustrations/            挿絵を置く場所
src/
  data/novels/
    index.ts                本棚に並ぶ作品の一覧
    echoshion/
      index.ts              作品メタデータ（タイトル・著者・表紙・テーマ色など）
      chapter1.ts           第一話の本文
  types/novel.ts            作品データの型
  lib/
    paginate.ts             画面サイズに合わせたページ割り付け
    progress.ts             読書位置の保存
    bookLayout.ts           画面サイズ → 本のサイズ
  components/
    Bookshelf/              本棚画面
    CoverStage/             本を手に取る演出・表紙画面
    OpeningAnimation/       本を開いてページがぺらぺらめくれる演出
    Reader/                 読書画面（FlipBook.tsx がページめくりライブラリのラッパー）
      pages/                章扉・本文・挿絵・終わりのページ
  styles/page.css           紙面のデザイン（文字サイズ・余白・行間）
```

## 本文を差し替える

`src/data/novels/echoshion/chapter1.ts` を編集します。

```ts
{
  type: "text",
  paragraphs: [
    "1つの文字列が1段落です。段落頭は自動で字下げされます。",
    "「会話文は字下げしません」",
    { type: "message", from: "志遠", text: "おわた、かえる", side: "right" }, // LINE 風の吹き出し
    { type: "break" },                                                      // 場面転換（◇）
  ],
},
{ type: "image", src: "/assets/novels/echoshion/illustrations/xxx.png", caption: "キャプション" },
```

- `text` ページの区切りは「必ず改ページする位置」です。1 ページに入りきらない分は、画面サイズに合わせて自動で次のページへ送られます。
- ページの種類は `title`（章扉）/ `text`（本文）/ `image`（挿絵）の 3 つで、自由に並べられます。

## 挿絵を追加する

`public/assets/novels/echoshion/illustrations/` に画像を置くだけで反映されます。
第一話では `mitarashi-ohagi.png` を参照しており、ファイルが無い間は「挿絵（準備中）」のプレースホルダーが表示されます。

## 表紙を差し替える

`src/data/novels/echoshion/index.ts` の `coverImage` を変更します。
画像にタイトル文字が入っている場合は `coverHasTitle: true` にすると、アプリ側でのタイトル文字の重ね表示が消えます。
画像が無い・読み込めない場合は `themeColor` から表紙を自動生成します。

## 小説を追加する

1. `src/data/novels/<作品ID>/` を作り、`index.ts`（メタデータ）と章ファイルを置く
2. `src/data/novels/index.ts` の `novels` 配列に追加する
3. 表紙・挿絵は `public/assets/novels/<作品ID>/` に置く

本棚には配列の順に並びます。読書位置は作品 ID ごとに保存されます。

## GitHub Pages で公開する

`.github/workflows/deploy.yml` で、`main` ブランチへの push 時に自動でビルド・公開します。

1. リポジトリの Settings → Pages → Build and deployment の Source を **GitHub Actions** にする
2. `main` に push（または Actions タブから手動実行）

公開パスはリポジトリ名から自動で決まります（`BASE_PATH=/<repo>/`）。
ユーザーサイト（`<user>.github.io`）として公開する場合は、ワークフローの `BASE_PATH` を `/` にしてください。

## 今後の拡張ポイント

- **縦書き**: `ReadingSession` の `writingMode` に `"vertical"` を渡すと、紙面が `writing-mode: vertical-rl` になり、割り付けも縦方向で計測されます（CSS は `styles/page.css` の `.book-page--vertical`）。右綴じのページめくり方向への対応は今後の課題です。
- **ページめくりライブラリの差し替え**: `components/Reader/FlipBook.tsx` だけを書き換えれば済むようにしています。
- **演出の強化**: 本棚・表紙・オープニング・読書画面はそれぞれ独立したコンポーネントです。
