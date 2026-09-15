import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm";
import path from "path";

export default defineConfig({
  plugins: [react(), wasm()],
  build: {
    target: "esnext",
  },
  resolve: {
    alias: {
      "isomorphic-ws": path.resolve(__dirname, "./src/lib/isomorphic-ws-browser-shim.ts"),
    }
  },
  test: {
    environment: "jsdom",
    globals: true,
  },
});
