import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  base: "/athens-game-starter/",
  resolve: {
    alias: {
      "@app/types": fileURLToPath(new URL("./src/types", import.meta.url)),
    },
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  server: {
    port: 8000,
    fs: {
      strict: false,
    },
  },
  build: {
    outDir: "docs",
    emptyOutDir: true,
    sourcemap: true,
    minify: false,
    rollupOptions: {
      treeshake: false,
      // Ensure no externals that would leave bare imports at runtime
      external: [], // keep empty unless you have a good reason
      plugins: [
        visualizer({
          filename: "docs/stats.html",
          open: false,
          gzipSize: true,
          brotliSize: true,
          template: "treemap", // or "sunburst", "network"
        }),
      ],
    },
  },
  optimizeDeps: {
    include: ["three", "three-mesh-bvh"],
  },
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __BUILD_SHA__: JSON.stringify(process.env["GITHUB_SHA"] || ""),
  },
});
