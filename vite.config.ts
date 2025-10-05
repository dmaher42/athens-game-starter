import { defineConfig } from 'vite';

export default defineConfig({
  base: '/athens-game-starter/',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      // Explicit alias prevents accidental externalisation of the "three" dependency.
      three: 'three',
    },
  },
});
