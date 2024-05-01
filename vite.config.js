import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/main.ts", // Path to your entry file
      name: "StreamPageScroller", // Global variable when included as a script tag
      fileName: (format) => `sps.${format}.js`,
    },
    rollupOptions: {
      // Externalize peer dependencies
      external: [], // Example of externalizing dependencies
      output: {
        globals: {},
      },
    },
  },
});
