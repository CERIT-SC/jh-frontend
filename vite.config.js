import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  build: {
    outDir: "./dist_hub",
    rollupOptions: {
      input: {
        spawn: resolve(__dirname, "spawn.html"),
        login: resolve(__dirname, "login.html"),
        spawn_pending: resolve(__dirname, "spawn_pending.html"),
        home: resolve(__dirname, "home.html"),
        not_running: resolve(__dirname, "not_running.html"),
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
      rollupOptions: {
        external: ["@e-infra/design-system", "lucide-react"],
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
