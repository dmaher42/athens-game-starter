import { defineConfig } from 'vite';

export default defineConfig({
  base: '/athens-game-starter/',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
  // Ensure “three” is *not* external so it gets bundled
  // If you added external in the past, remove it.
});
