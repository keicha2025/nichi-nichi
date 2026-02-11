import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true, // 預設開啟對外連線
    port: 5173, // 固定使用 5173 埠號
    strictPort: true, // 若 5173 被佔用則報錯，而不自動切換
  }
});
