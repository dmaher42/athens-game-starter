## GLB Mode Behavior

GLB model loading is globally disabled to avoid performance issues. However, the player character model (`hero.glb`) is always allowed to load.

This is implemented via an exception in `loadGLBWithFallbacks()` where `allowHero: true` enables loading that specific file regardless of GLB mode.
