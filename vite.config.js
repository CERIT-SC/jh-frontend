import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";

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
    },
  },
  plugins: [react()],
  server: {
    open: process.env.ENTRY,
  },
});
