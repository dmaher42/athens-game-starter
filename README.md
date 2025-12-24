Overview

This project is an experimental, walkable 3D interpretation of Athens as a coastal mainland city.

The goal is not to build a large open-world game or a technical terrain demo.
The goal is to create a place — a city that feels enjoyable to walk around, explore, and return to.

If someone remembers this project, the ideal outcome is simple:

They remember how much they enjoyed walking around — and they want to come back.

This repository serves as both:

a living world-building experiment, and

a testbed for AI-assisted development using tools like Codex and Jules.

Core Vision (Authoritative)

This is NOT an island

This is a mainland coastal city with a harbour, similar in spirit to Athens

The sea is open on one side

The land rises inland behind the city

Hills and mountains define the skyline and form natural boundaries

The world should feel contained and intentional, not infinite or flat

Design Priorities (In Order)

Walking feels good

Movement should be smooth, readable, and inviting

Terrain should guide the player naturally, not trap or punish

Views feel intentional

No empty horizons, voids, or visible seams

Every direction should offer visual interest

Natural boundaries

Coastline + sea = open boundary

Inland hills/mountains = soft physical boundary

No circular rims, bowls, or “disk world” artifacts

Atmosphere over spectacle

Mood, light, and silhouette matter more than scale

Illusions are acceptable if they improve the experience

World Geography Rules

Terrain is directional, not radial

One defined sea-facing direction (harbour)

Inland terrain rises progressively into hills and mountains

Mountains exist to:

break the skyline

catch light and cast shadows

visually anchor the city

Skybox mountains are supportive only — real geometry defines the world

AI-Assisted Development Rules

This project is actively developed with AI tools.

AI tools must:

Treat the vision in this README as authoritative

Avoid introducing island logic, radial bowls, or circular terrain rims

Prefer incremental changes over wholesale rewrites

Optimize for how the world feels to walk around, not mathematical purity

When unsure:

Favor comfort, clarity, and atmosphere over technical cleverness.

Controls

W / A / S / D – Move

Shift – Sprint

Space – Jump / ascend while flying

Ctrl – Descend while flying

F – Interact

G – Toggle fly mode (dev/debug only)

Development & Deployment
Quick Start (Local)
npm install
npm run dev

Preview-First Workflow (Recommended)

Edit files directly in GitHub → create a PR

Wait for the GitHub Pages preview

Play the build

Merge if it feels right — or close the PR

No local dev environment is required for this flow.

Assets Overview
Models

public/models/character/hero.glb

public/models/landmarks/

Procedural fallbacks exist if assets are missing

Textures

Ground textures: public/textures/ground/

Skyboxes: public/assets/skyboxes/

Water normals auto-load if present

Audio

Ambient soundscape lives under public/audio/

Missing files are safely ignored

Technical Notes

Built with Three.js + Vite

Static build outputs to docs/ for GitHub Pages

Draco and KTX2 loaders are supported and configurable

Terrain, lighting, and materials are designed to be tunable and experimental

HUD & Overlays

- Overlays are off by default in production and on in development.
- Enable via query params or window flags:
	- Audio Mixer: `?audio=1` or `window.SHOW_AUDIO_MIXER = true`
	- Hotkey Reference: set `window.SHOW_HOTKEYS = true`
	- Dev HUD: enable via engine debug overlays or set `engineConfig.debug.overlays.devHud.defaultValue=true` at build time
	- Camera Settings HUD: same pattern as Dev HUD (`cameraSettings`)
- Update cadence: HUD components should use the shared UI update loop in `src/ui/updateLoop.ts`:
	- `registerUIUpdate("devHud", (dt)=>{ /* ... */ }, 10)` to update ~10 times/second
	- Prefer event-driven updates when possible; only register loops for dynamic readouts
	- Unregister updates in component `dispose()` to avoid leaks

What This Project Is Not

Not a procedural survival world

Not an infinite sandbox

Not an island map

Not a realism simulation

Not aiming for AAA production

This is a crafted walking experience.

Success Criteria

A change is successful if:

Walking feels better

Views feel more complete

The city feels grounded and believable

The player wants to keep exploring

A change should be questioned if:

It adds scale without purpose

It harms walkability

It exposes seams or technical artifacts
