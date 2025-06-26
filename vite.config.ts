import path from "path";
import { defineConfig } from "vite";

// This is a simplified and more direct configuration for your project.
export default defineConfig({
  server: {
    proxy: {
      // This rule tells Vite: when you see a request to '/api',
      // forward it to your backend server running on port 3001.
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true, // This is important for the proxy to work correctly
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
