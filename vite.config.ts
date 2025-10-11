import { defineConfig } from "vite";

export default defineConfig({
  // Base set to "/" for direct docs/ publishing to GitHub Pages
  base: "/",
  build: {
    outDir: "docs",
    emptyOutDir: true,
  },
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __BUILD_SHA__: JSON.stringify(process.env.GITHUB_SHA || ""),
  },
});
