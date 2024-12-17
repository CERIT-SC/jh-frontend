import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  build: {
    outDir: "../../dist_bioconductor",
    rollupOptions: {
      input: {
        form: resolve(__dirname, "bioconductor_form.html"),
        login: resolve(__dirname, "login.html"),
      },
      output: {
        entryFileNames: "static/js/[name]-[hash].js",
        chunkFileNames: "static/js/[name]-[hash].js",
        assetFileNames: ({ name }) => {
          if (/\.(css)$/.test(name ?? "")) {
            return "static/css/[name]-[hash][extname]";
          } else if (/\.(png|jpe?g|gif|svg)$/.test(name ?? "")) {
            return "static/css/[name]-[hash][extname]";
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
