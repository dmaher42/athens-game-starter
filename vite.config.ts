import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // ✅ relative base — works locally AND on root-hosted Pages
  build: {
    outDir: 'docs',     // ✅ GH Pages expects the built site here
    emptyOutDir: true,  // ✅ clears old builds before rebuilding
  },
  resolve: {
    alias: {
      // Prevents accidental externalization of Three.js dependency
      three: 'three',
    },
  },
});
