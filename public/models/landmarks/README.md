# Landmark Models

Place landmark GLB files here. `npm run download:aristotle` fetches
`aristotle_tomb.glb` into this folder so the game can load Aristotle's Tomb in
both development and production builds.

Additional canonical uploads live alongside it:

- `poseidon_temple.glb` (fallback: `poseidon_temple_at_sounion_greece.glb`)
- `akropol.glb` (fallback: `Akropol.glb`)

Keep the legacy files around if you rely on the older names; the runtime looks
for canonical models first and then falls back to those historical filenames.
