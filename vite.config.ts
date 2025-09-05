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
      https: {
        key: fs.readFileSync(env.VITE_SSL_KEY),
        cert: fs.readFileSync(env.VITE_SSL_CERT),
      },
      host: "0.0.0.0", // 외부에서도 접속 가능
      port: 3000, // 포트는 원하는 대로 설정 가능

      proxy: {
        "/api": {
          target: env.VITE_API_SERVER, // 예: https://localhost:7777
          changeOrigin: true,
          secure: false,
        },
        "/ws-stomp": { target: env.VITE_API_SERVER, changeOrigin: true, secure: false, ws: true },
      },
    },
  };
});
