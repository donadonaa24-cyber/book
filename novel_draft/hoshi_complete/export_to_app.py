"""完成稿（Markdown）を本棚アプリ用の章テキストに書き出す。

    python3 novel_draft/hoshi_complete/export_to_app.py

出力先（三部作を三冊に分けて書き出す。各 text/ の既存 .txt はいったん全部消して作り直す）
- 第一部：src/data/novels/hoshi/text/       … 00.txt（部扉）、01.txt〜14.txt
- 第二部：src/data/novels/hoshi-vol2/text/  … 14a.txt（部扉）、15.txt〜29.txt
- 第三部：src/data/novels/hoshi-vol3/text/  … 29a.txt（部扉）、30.txt〜40.txt、41.txt、42.txt
- ファイル番号は三冊通しのまま（章 ID・挿絵の配置を変えないため）
- 章：01.txt〜40.txt、終幕：41.txt、あとがき：42.txt（作者のあとがきを旧版 text_v1/10.txt からそのまま複製）
- 1行目が章タイトル、本文の最初の行が BGM 指定（src/lib/manuscript.ts の書式）
- 章の途中の BGM・挿絵は下の CUES で、本文中の一文を目印に挿入する
- Markdown の段落間の空行は書き出さない（文庫本と同じく段落は字下げだけで区切り、場面転換は「◇」で示す）
"""
import glob
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
NOVELS = os.path.join(ROOT, "src", "data", "novels")
VOLUMES = [os.path.join(NOVELS, d, "text") for d in ("hoshi", "hoshi-vol2", "hoshi-vol3")]


PART_VOLUME = {"00": 0, "14a": 1, "29a": 2}
# 部扉に入れる挿絵（第二部の扉は、管理区域と未管理区域の二つの空）
PART_ILLUSTRATION = {"14a": "12-two-skylines.webp"}


def out_dir(n):
    """章番号から書き出し先の巻を決める。"""
    return VOLUMES[0 if n <= 14 else 1 if n <= 29 else 2]
ILL = "/assets/novels/hoshi/illustrations/"

PARTS = {
    "00": ("第一部　同じ空の下で", "幻想", "二〇五九年――二〇六九年"),
    "14a": ("第二部　喪失の頁", "静寂", "二〇六九年――二〇七七年"),
    "29a": ("第三部　君が生きる頁", "幻想", "二〇六九年――二一二八年"),
}

# 章番号 → 章頭の BGM
START_BGM = {
    1: "幻想", 2: "日常", 3: "切ない", 4: "静寂", 5: "切ない", 6: "日常", 7: "緊張",
    8: "静寂", 9: "日常", 10: "緊張", 11: "日常", 12: "日常", 13: "日常", 14: "静寂",
    15: "緊張", 16: "緊張", 17: "緊張", 18: "切ない", 19: "静寂", 20: "静寂", 21: "幻想",
    22: "幻想", 23: "緊張", 24: "日常", 25: "緊張", 26: "静寂", 27: "幻想", 28: "日常",
    29: "静寂", 30: "幻想", 31: "緊張", 32: "緊張", 33: "緊張", 34: "幻想", 35: "緊張",
    36: "緊張", 37: "静寂", 38: "静寂", 39: "日常", 40: "余韻", 41: "静寂",
}

# 章番号 → [(目印の文, 挿入する行, "after" | "before")]
CUES = {
    1: [
        ("　学習棟の歴史の授業は、必修だった。", "［BGM：日常］", "before"),
        ("　夜。居住棟の消灯時刻は決まっているけれど", "［BGM：静寂］", "before"),
        ("　同じ夜、政府中央演算塔《エデン・コア》の最深部では", "［BGM：幻想］", "before"),
        ("　同じ夜、政府中央演算塔《エデン・コア》の最深部では", f"［挿絵：{ILL}01-alma-core.webp｜政府中央演算塔《エデン・コア》］", "after"),
        ("　湊は窓に張りついて笑っていた。", f"［挿絵：{ILL}08-brothers-haru-snow.webp］", "after"),
    ],
    2: [
        ("　その夜、居住棟全体に低い警告音が流れた。", "［BGM：緊張］", "before"),
    ],
    3: [
        ("　銃声で目が覚めた。", f"［挿絵：{ILL}11-haru-guarding.webp］", "before"),
        ("　次に目を覚ましたとき、そこは白い医療室だった。", "［BGM：静寂］", "before"),
    ],
    8: [
        ("　白い機械が、透真の足元で口を開いた。", f"［挿絵：{ILL}03-cyborg-dog.webp｜シロ］", "before"),
    ],
    10: [
        ("　作戦の日。", "［BGM：緊張］", "before"),
        ("　男は、拠点に着く五分前に息をしなくなった。", "［BGM：切ない］", "before"),
    ],
    12: [
        ("　紗良はそこで立ち止まり、灯りを消した。", "［BGM：余韻］", "before"),
    ],
    14: [
        ("　中央演算塔《エデン・コア》、最深部。", "［BGM：幻想］", "before"),
    ],
    15: [
        ("　最初の爆発は、夜明けの三分前に起きた。", f"［挿絵：{ILL}10-city-battle.webp］", "after"),
        ("　中枢の内側は、白かった。", f"［挿絵：{ILL}07-cyborg-boy-and-woman.webp］", "before"),
    ],
    16: [
        ("　湊がいる。", "［BGM：高揚］", "before"),
        ("　透真は、崩れかけた中枢の通路へ走り出した。", f"［挿絵：{ILL}05-man-running.webp］", "after"),
        ("　紗良は、透真を見ていた。", "［BGM：切ない］", "before"),
    ],
    17: [
        ("　冷却制御層の扉の前で、最後の一機が待っていた。", "［BGM：無音］", "before"),
        ("　短く刈りこんだ髪が、煙の中に沈んでいくのが見えた。", f"［挿絵：{ILL}09-fallen-woman-2.webp］", "after"),
        ("　紗良は湊の膝の上でそれを聞いていた", "［BGM：切ない］", "before"),
    ],
    18: [
        ("　発射場は巨大な縦坑の底にあり", f"［挿絵：{ILL}02-rocket-ruins.webp］", "after"),
        ("　縦坑の上で何かが光り", "［BGM：緊張］", "before"),
        ("　透真は、熱を感じなかった。", "［BGM：幻想］", "before"),
    ],
    25: [
        ("　クレーターの縁に着いたのは、昼前だった。", "［BGM：幻想］", "before"),
        ("　拠点の研究棟で、シロは、検査台の上に寝かされた。", "［BGM：静寂］", "before"),
    ],
    27: [
        ("「僕が帰るとき、一緒に帰ろう」", "［BGM：余韻］", "before"),
    ],
    29: [
        ("　遮断室の中に、寝台が一つ、置かれていた。", "［BGM：幻想］", "before"),
        ("　三日後、五人は、拠点の西の丘の上に湊を埋めた。", "［BGM：余韻］", "before"),
    ],
    30: [
        ("　空には、星が埋まっていた。", f"［挿絵：{ILL}13-bonfire-stars.webp］", "after"),
        ("　廊下の窓の外で、発射塔の向こうに、白い雲が流れていた。", f"［挿絵：{ILL}14-rocket-robodog.webp］", "after"),
    ],
    32: [
        ("　冷却制御層の扉の前に、最後の一機が待っていた。", "［BGM：無音］", "before"),
        ("　紗良は、走っていた足を止めていた。", "［BGM：切ない］", "before"),
    ],
    34: [
        ("　扉の開く音で、湊は振り返った。", "［BGM：余韻］", "before"),
        ("　シロは、光の束の、根元まで歩いた。", "［BGM：幻想］", "before"),
    ],
    35: [
        ("　北西拠点の、さらに奥。古い地下施設。", "［BGM：静寂］", "before"),
        ("　床の上で、澄は、天井を見ていた。", "［BGM：切ない］", "before"),
    ],
    36: [
        ("　ユイは、透真の腕の中で、目を開けていた。", "［BGM：切ない］", "before"),
        ("　轟音が、降ってきた。", "［BGM：緊張］", "before"),
        ("　縦坑の入口に颯太が立っていた。", "［BGM：高揚］", "before"),
    ],
    38: [
        ("　夕方、三人は、宇宙服を着て、西の丘に登った。", "［BGM：余韻］", "before"),
        ("　三人の暮らしが、始まった。", "［BGM：日常］", "before"),
    ],
    40: [
        ("　二一二五年、四月。", "［BGM：静寂］", "before"),
        ("　最後の夜、部屋には、湊と、シロだけがいた。", "［BGM：切ない］", "before"),
    ],
    41: [
        ("　――あたたかい。", "［BGM：幻想］", "before"),
        ("　西の丘のてっぺんで、白い犬が一人座っていた。", "［BGM：余韻］", "before"),
    ],
}


def convert(md: str):
    """見出しを取り出し、本文を app 書式の行にする。"""
    lines = md.replace("\r\n", "\n").split("\n")
    title = None
    body = []
    for line in lines:
        if line.startswith("# ") and "終幕" not in line:
            continue  # 部見出し（部扉は別ファイル）
        if line.startswith("## ") or line.startswith("# 終幕"):
            title = line.lstrip("# ").strip()
            continue
        if line.strip() == "---":
            continue
        body.append(line)
    while body and body[0].strip() == "":
        body.pop(0)
    while body and body[-1].strip() == "":
        body.pop()
    return title, body


def without_blank_lines(lines):
    """段落間の空行を除く"""
    return [l for l in lines if l.strip()]


def norm(text):
    """目印の照合用。読点・空白・傍点の記号の違いは無視する（文体の推敲で読点を減らしても目印が外れないように）"""
    return re.sub(r"[、　 《》]", "", text)


def apply_cues(n, body):
    for anchor, directive, where in CUES.get(n, []):
        key = norm(anchor)
        idx = next((i for i, l in enumerate(body) if norm(l).startswith(key)), None)
        if idx is None:
            raise SystemExit(f"第{n}章：目印が見つかりません：{anchor}")
        if where == "after":
            body[idx + 1:idx + 1] = ["", directive]
        else:
            body[idx:idx] = [directive, ""]
    return body


def main():
    for vol in VOLUMES:
        os.makedirs(vol, exist_ok=True)
        for old in glob.glob(os.path.join(vol, "*.txt")):
            os.remove(old)
    for name, (title, bgm, sub) in PARTS.items():
        with open(os.path.join(VOLUMES[PART_VOLUME[name]], f"{name}.txt"), "w", encoding="utf-8") as f:
            f.write(f"{title}\n［BGM：{bgm}］\n\n　{sub}\n")
            if name in PART_ILLUSTRATION:
                f.write(f"\n［挿絵：{ILL}{PART_ILLUSTRATION[name]}］\n")
    files = sorted(glob.glob(os.path.join(HERE, "0[1-3]_*", "第*.md"))) + [
        os.path.join(HERE, "04_終幕", "終幕_僕が帰るとき.md")
    ]
    for f in files:
        b = os.path.basename(f)
        m = re.match(r"第(\d+)章_", b)
        n = int(m.group(1)) if m else 41
        title, body = convert(open(f, encoding="utf-8").read())
        body = apply_cues(n, body)
        text = f"{title}\n［BGM：{START_BGM[n]}］\n" + "\n".join(without_blank_lines(body)) + "\n"
        with open(os.path.join(out_dir(n), f"{n:02d}.txt"), "w", encoding="utf-8") as out:
            out.write(text)
    # 作者のあとがき（旧版の 10.txt）はそのまま最後に残す
    afterword = os.path.join(ROOT, "src", "data", "novels", "hoshi", "text_v1", "10.txt")
    if os.path.exists(afterword):
        with open(afterword, encoding="utf-8") as src, open(os.path.join(VOLUMES[2], "42.txt"), "w", encoding="utf-8") as out:
            lines = src.read().split("\n")
            out.write("\n".join(lines[:1] + without_blank_lines(lines[1:])) + "\n")
    for vol in VOLUMES:
        print(f"{os.path.relpath(vol, ROOT)}: {len(glob.glob(os.path.join(vol, '*.txt')))} files")


if __name__ == "__main__":
    main()
