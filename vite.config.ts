import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
const base = "/chess-academy/";
export default defineConfig({
  base,
  publicDir: "work/public",
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "prompt",
      scope: base,
      includeAssets: ["icon.svg", "icon-192.png", "icon-512.png"],
      manifest: {
        name: "Chess Academy",
        short_name: "Chess Academy",
        description: "Lettore personale di libri di scacchi",
        lang: "it",
        theme_color: "#142e29",
        background_color: "#f7f7f0",
        display: "standalone",
        id: base,
        scope: base,
        start_url: base,
        icons: [
          {
            src: "icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        clientsClaim: true,
        globPatterns: [
          "**/*.{js,mjs,css,html,svg,png,woff2,bcmap,ttf,pfb,wasm}",
        ],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        navigateFallback: `${base}index.html`,
        navigateFallbackAllowlist: [/^\/chess-academy\//],
      },
    }),
  ],
});
