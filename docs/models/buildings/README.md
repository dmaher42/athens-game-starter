# Building Models

Add GLB building assets (e.g., Parthenon) to this directory.

To pull the "Aristotle's Tomb" landmark from Sketchfab run:

```
SKETCHFAB_TOKEN=<your token> npm run download:aristotle
```

The script writes `aristotle-tomb.glb` into this folder so the game can load it
at runtime. Tokens are available from https://sketchfab.com/settings/password.

No binary fallback is committed – when this directory is empty the runtime now
spawns a lightweight placeholder monument so the scene still has a focal point.
