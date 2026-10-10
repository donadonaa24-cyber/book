import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// GitHub Pages では "/<リポジトリ名>/" 配下で配信されるため、
// ビルド時に BASE_PATH で公開パスを切り替えられるようにしている。
const base = process.env.BASE_PATH || "/";

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/icon.svg", "icons/apple-touch-icon.png"],
      manifest: {
        name: "デジタル本棚",
        short_name: "本棚",
        description: "本棚から小説を選び、ページをめくって読むデジタル本棚",
        lang: "ja",
        start_url: ".",
        scope: ".",
        display: "standalone",
        orientation: "any",
        background_color: "#17110d",
        theme_color: "#17110d",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,jpg,jpeg,webp}"],
        // 人物画像は閲覧時に既存の novel-images キャッシュへ保存する。
        // 初回に全13枚をダウンロードしない。
        globIgnores: ["**/characters/*.png"],
        navigateFallback: "index.html",
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts",
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // 後から追加される挿絵・表紙画像
            urlPattern: /\/assets\/novels\/.*\.(png|jpe?g|webp|svg)$/i,
            handler: "StaleWhileRevalidate",
            options: { cacheName: "novel-images" },
          },
        ],
      },
    }),
  ],
});
