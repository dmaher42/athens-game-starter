import { defineConfig } from "vite";
export default defineConfig({
  base: "/athens-game-starter/",
  build: {
    outDir: "docs",
    emptyOutDir: true,
    rollupOptions: {
      // Ensure no externals that would leave bare imports at runtime
      external: [], // keep empty unless you have a good reason
    },
  },
  optimizeDeps: {
    include: ["three", "three-mesh-bvh"],
  },
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __BUILD_SHA__: JSON.stringify(process.env.GITHUB_SHA || ""),
  },
});
