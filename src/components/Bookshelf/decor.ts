/**
 * 本棚の飾り（選択できない背表紙）を、行ごとに決まった並びで生成する。
 * 毎回同じ見た目になるよう疑似乱数のシードを固定している。
 */
export interface Decor {
  width: number;
  /** 棚の高さに対する割合（%） */
  height: number;
  color: string;
  band: string;
  lean?: number;
}

const SPINE_COLORS = ["#5b3a2e", "#3d4a3a", "#2f3b52", "#6b5a3e", "#4a2f3a", "#3a3530", "#594437", "#28343f", "#6e4b3a"];

function rng(seed: number) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

export function decorFor(row: number, count: number): Decor[] {
  const r = rng(row + 3);
  const items: Decor[] = [];
  for (let i = 0; i < count; i++) {
    items.push({
      width: Math.round(14 + r() * 14),
      height: Math.round(62 + r() * 30),
      color: SPINE_COLORS[Math.floor(r() * SPINE_COLORS.length)],
      band: r() < 0.5 ? "rgba(214, 186, 132, 0.55)" : "rgba(233, 220, 198, 0.25)",
    });
  }
  // 最後の1冊を少し傾ける
  if (items.length > 2) {
    items[items.length - 1].lean = -8 - Math.round(r() * 6);
  }
  return items;
}
