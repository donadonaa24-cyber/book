# デジタル本棚

本棚から小説を選び、本を手に取って、ページをめくりながら読む Web アプリ（PWA 対応）。
『EchoShion』（プロローグ〜第六章、縦書き・右綴じ）を収録しています。

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

縦書きの本（右綴じ）は、紙の本と同じく左へ向かって読み進めます。

| 操作 | 縦書き（右綴じ） | 横書き（左綴じ） |
| --- | --- | --- |
| 次のページ | 画面の左半分をタップ／右へスワイプ／← キー | 画面の右半分をタップ／左へスワイプ／→ キー |
| 前のページ | 画面の右半分をタップ／左へスワイプ／→ キー | 画面の左半分をタップ／右へスワイプ／← キー |
| 本棚へ戻る | 右上「本棚へ戻る」／Esc キー | 同左 |

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
      text/00.txt 〜        本文（1ファイル＝1章、1行目が章タイトル）
  types/novel.ts            作品データの型
  lib/
    manuscript.ts           テキスト原稿 → ページデータの変換
    typeset.ts              縦中横（「AI」など）の処理
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

本文は `src/data/novels/echoshion/text/` のテキストファイルです（1ファイル＝1章）。

- ファイル名の順に並びます（`00.txt` = プロローグ、`01.txt` = 第一章 …）。話を足すときは次の番号のファイルを置くだけです。
- **1行目が章タイトル**（扉ページに表示）、2行目以降が本文です。

```
　地の文は行頭の全角スペースもそのまま表示されます。
「会話文」

　空行はそのまま空行になります。

«澪：明日ゴミの日やで
志遠：知ってる»          ← «〜» は LINE のメッセージ枠（「名前：」付きの行は送信者名を表示）

◇                        ← 場面転換
［改ページ］              ← 強制改ページ
```

- 1 ページに入りきらない分は、画面サイズに合わせて自動で次のページへ送られます（ページ先頭の空行は自動で詰めます）。
- 原稿を使わずに、ページデータ（`title` / `text` / `image`）を直接並べることもできます（型は `src/types/novel.ts`）。

## 挿絵を追加する

`public/assets/novels/echoshion/illustrations/` に画像を置くだけで反映されます。
章の `pages` 配列に `{ type: "image", src: "/assets/novels/echoshion/illustrations/xxx.png", caption: "…" }` を挟むと挿絵ページになります（現在は挿絵なし）。
ファイルが無い間は「挿絵（準備中）」のプレースホルダーが表示されます。

## 表紙を差し替える

`src/data/novels/echoshion/index.ts` の `coverImage` を変更します。
画像にタイトル文字が入っている場合は `coverHasTitle: true` にすると、アプリ側でのタイトル文字の重ね表示が消えます。
画像が無い・読み込めない場合は `themeColor` から表紙を自動生成します。

## 小説を追加する

1. `src/data/novels/<作品ID>/` を作り、`index.ts`（メタデータ）と章ファイルを置く
   （縦書きにする場合は `writingMode: "vertical"`。省略すると横書き）
2. `src/data/novels/index.ts` の `novels` 配列に追加する
3. 表紙・挿絵は `public/assets/novels/<作品ID>/` に置く

本棚には配列の順に並びます。読書位置は作品 ID ごとに保存されます。

## GitHub Pages で公開する

`.github/workflows/deploy.yml` で、`main` ブランチへの push 時に自動でビルド・公開します。

1. リポジトリの Settings → Pages → Build and deployment の Source を **GitHub Actions** にする
2. `main` に push（または Actions タブから手動実行）

公開パスはリポジトリ名から自動で決まります（`BASE_PATH=/<repo>/`）。
ユーザーサイト（`<user>.github.io`）として公開する場合は、ワークフローの `BASE_PATH` を `/` にしてください。

## 縦書き（右綴じ）の仕組み

- 紙面は `writing-mode: vertical-rl` で組み、割り付けも縦方向（横へのあふれ）で計測します。
- ページめくりライブラリは左綴じ専用のため、本全体を左右反転して右綴じにし、紙面の中身だけを反転し直しています（`components/Reader/reader.css`）。
- 見開きでは、右ページが白紙（見返し）、左ページが扉になります。

## 今後の拡張ポイント

- **ページめくりライブラリの差し替え**: `components/Reader/FlipBook.tsx` だけを書き換えれば済むようにしています。
- **演出の強化**: 本棚・表紙・オープニング・読書画面はそれぞれ独立したコンポーネントです。
