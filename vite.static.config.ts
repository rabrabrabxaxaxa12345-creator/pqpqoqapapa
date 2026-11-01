import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  root: "/tmp/ogonyok-host",
  plugins: [tailwindcss(), react()],
  resolve: { alias: { "@": "/workspace/src" } },
  base: "./",
  build: { outDir: "/tmp/ogonyok-host/dist", emptyOutDir: true, assetsDir: "assets" },
});
