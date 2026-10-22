"""章ファイルを順に結合して 完成稿_全編.md を生成する（python3 build.py）。"""
import glob, os
here = os.path.dirname(os.path.abspath(__file__))
files = sorted(glob.glob(os.path.join(here, "0[1-4]_*", "*.md")))
parts = ["# 星の終わりに君は生きる\n\n作：あにあに\n"]
for f in files:
    parts.append(open(f, encoding="utf-8").read().strip() + "\n")
out = os.path.join(here, "完成稿_全編.md")
open(out, "w", encoding="utf-8").write("\n\n".join(parts))
body = "".join(open(f, encoding="utf-8").read() for f in files)
print(f"{len(files)} files -> 完成稿_全編.md ({len(body)} chars)")
