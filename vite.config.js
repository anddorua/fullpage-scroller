import { defineConfig } from "vite";

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
    },
    publicDir: command === "serve" ? "public" : false,
    server: {
      open: "/index.html",
    },
  };
});
