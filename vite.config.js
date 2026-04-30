import { defineConfig } from "vite";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Type declaration for process.env
const process = { env: { ENTRY: undefined } };

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
    },
  },
  root: __dirname,
  base: "/",
  build: {
    outDir: "./dist_hub",
    rollupOptions: {
      input: {
        home: resolve(__dirname, "home.html"),
        login: resolve(__dirname, "login.html"),
        spawn: resolve(__dirname, "spawn.html"),
        spawn_pending: resolve(__dirname, "spawn_pending.html"),
        not_running: resolve(__dirname, "not_running.html"),
        token: resolve(__dirname, "token.html"),
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
  // html: {
  //   transformIndexHtml(html) {
  //     if (process.env.NODE_ENV === "development") {
  //       return html.replace(
  //         "</head>",
  //         '</head><script "src="/dev-mode.js"></script>',
  //       );
  //     }
  //     return html;
  //   },
  // },
  plugins: [react(), tailwindcss()],
  server: {
    open: process.env?.ENTRY,
    proxy: {
      "/api": {
        target: "https://kuba-mon-int.cloud.e-infra.cz",
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },
});
