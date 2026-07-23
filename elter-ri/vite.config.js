import { defineConfig } from "vite";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@routes": resolve(__dirname, "./src/routes"),
      "@components": resolve(__dirname, "./src/components"),
      "@pages": resolve(__dirname, "./src/pages"),
      "@hooks": resolve(__dirname, "./src/hooks"),
      "@api": resolve(__dirname, "./src/api"),
      "@utils": resolve(__dirname, "./src/utils"),
      "@assets": resolve(__dirname, "./src/assets"),
      "@data": resolve(__dirname, "./src/data"),
      "@src-types": resolve(__dirname, "./src/types"),
    },
  },
  root: __dirname,
  base: "/",
  build: {
    outDir: "../dist_elter-ri",
    rollupOptions: {
      input: {
        spawn: resolve(__dirname, "spawn.html"),
        login: resolve(__dirname, "login.html"),
        spawn_pending: resolve(__dirname, "spawn_pending.html"),
        stop_pending: resolve(__dirname, "stop_pending.html"),
        home: resolve(__dirname, "home.html"),
        not_running: resolve(__dirname, "not_running.html"),
        not_found: resolve(__dirname, "404.html"),
        token: resolve(__dirname, "token.html"),
        error: resolve(__dirname, "error.html"),
      },
      output: {
        entryFileNames: "static/custom-js/[name]-[hash].js",
        chunkFileNames: "static/custom-js/[name]-[hash].js",
        assetFileNames: ({ name }) => {
          if (/\.(css)$/.test(name ?? "")) {
            return "static/custom-css/[name]-[hash][extname]";
          } else if (/\.(png|jpe?g|gif|svg)$/.test(name ?? "")) {
            return "static/custom-css/[name]-[hash][extname]";
          }
          return "static/[ext]/[name]-[hash][extname]";
        },
      },
    },
  },
  plugins: [react(), tailwindcss()],
  server: {
    open: process.env.ENTRY,
    proxy: {
      "/api": {
        target: "https://kuba-mon-int.cloud.e-infra.cz",
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },
});
