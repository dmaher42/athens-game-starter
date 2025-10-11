import { defineConfig } from "vite";
export default defineConfig({
  base: "/athens-game-starter/",
  build: { outDir: "docs", emptyOutDir: true },
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __BUILD_SHA__: JSON.stringify(process.env.GITHUB_SHA || ""),
  },
});
