import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";
import fs from "fs";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: [
          "/icons/favicon/favicon.svg",
          "/icons/favicon/favicon.ico",
          "/icons/pwa/apple-touch-icon.png",
          "/icons/logos/linkle-icon.svg",
        ],
        devOptions: {
          enabled: true,
        },
        workbox: {
          // workbox 콘솔창 로그 제거 및 캐싱 설정 (성능 개선용)
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/(?:[a-z0-9-]+\.)?daumcdn\.net\//,
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "daum-tiles",
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 7, // 7일동안 유지
                },
              },
            },
          ],
        },
        manifest: {
          id: "/",
          name: "LINKLE",
          short_name: "LINKLE",
          description: "Link People and LINKLE",
          start_url: "/",
          display: "standalone",
          theme_color: "#ffffff",
          background_color: "#ffffff",
          icons: [
            {
              src: "/icons/pwa/linkle-icon-192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "/icons/pwa/linkle-icon-512x512.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: env.VITE_HOST || "0.0.0.0",
      port: Number(env.VITE_PORT) || 3000,
      https: {
        key: fs.readFileSync(env.VITE_SSL_KEY),
        cert: fs.readFileSync(env.VITE_SSL_CERT),
      },
      proxy: {
        "/api": {
          target: env.VITE_API_SERVER,
          changeOrigin: true,
          secure: false,
        },
        "/ws-stomp": {
          target: env.VITE_API_SERVER,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },
  };
});
