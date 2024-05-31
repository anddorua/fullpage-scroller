import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig(({ command }) => {
  return {
    build: {
      lib: {
        entry: "src/main.ts", // Path to your entry file
        name: "FullpageVerticalSlider", // Global variable when included as a script tag
        fileName: (format) => `fvs.${format}.js`,
      },
      rollupOptions: {
        // Externalize peer dependencies
        external: [], // Example of externalizing dependencies
        output: {
          globals: {},
        },
      },
      outDir: "dist",
      emptyOutDir: true,
    },
    publicDir: command === "serve" ? "public" : false,
    server: {
      open: "/index.html",
    },
    plugins: [dts({ rollupTypes: true })],
  };
});
