import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

// 判斷是否為開發模式
const isDev = process.env.NODE_ENV !== "production";

export default defineConfig({
  plugins: [react()],
  server: isDev
    ? {
        https: {
          key: fs.readFileSync(path.resolve(__dirname, "cert/server.key")),
          cert: fs.readFileSync(path.resolve(__dirname, "cert/server.crt")),
        },
        host: "0.0.0.0",
      }
    : undefined,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
