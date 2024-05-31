// vite.examples.config.js
import { defineConfig } from "vite";

export default defineConfig({
  root: "examples",
  build: {
    outDir: "../dist/examples",
    rollupOptions: {
      input: ["examples/as-module/index.html", "examples/as-umd/index.html"],
    },
    emptyOutDir: true,
  },
  server: {},
});
