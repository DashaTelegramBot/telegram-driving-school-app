// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import TanStackRouterVite from "@tanstack/router-plugin/vite"; // ✅ Правильное имя и путь для импорта
import path from "path";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  plugins: [
    react(),
    TanStackRouterVite(), // ✅ Используется как функция
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});