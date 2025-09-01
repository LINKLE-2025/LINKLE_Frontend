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
        includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
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
          theme_color: "#414141",
          background_color: "#ffffff",
          icons: [
            {
              src: "linkle-icon-192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "linkle-icon-512x512.png",
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
    },
  };
});
