/**
 * データ内の "/assets/..." 形式のパスを、公開先のベースパスに合わせて解決する。
 * （GitHub Pages のサブディレクトリ配信でも画像が読めるようにするため）
 */
export function assetUrl(path: string): string {
  if (/^(https?:)?\/\//.test(path) || path.startsWith("data:")) return path;
  return import.meta.env.BASE_URL + path.replace(/^\//, "");
}
