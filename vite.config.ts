import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/auth": { target: "http://localhost:5250", changeOrigin: true },
      "/cases": { target: "http://localhost:5135", changeOrigin: true },
    },
  },
});
