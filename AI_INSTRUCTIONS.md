# AI Task Instructions (Codex & Codespaces AI)

This project uses AI to help implement game features. Use the prompts below to apply changes safely.

---

## 🔆 Lighting

> **Prompt:**
> "Adjust the directional light intensity to [VALUE] and position to simulate [TIME_OF_DAY]"

**Files to check:**
- `src/config/LightingConfig.js`
- `src/core/Scene.js`

**Example:**
```
"Set directional light to intensity 1.2 and position (50, 100, 50) for late afternoon"
```

---

## 🌊 Water & Ocean

> **Prompt:**
> "Adjust water color to [HEX_COLOR] and wave scale to [VALUE]"

**Files to check:**
- `src/world/ocean.js`
- `src/world/seaLevelState.js`

**Example:**
```
"Change water to deep blue (#1a4d7a) with wave scale 4.0"
```

---

## 🏔️ Terrain

> **Prompt:**
> "Modify terrain amplitude to [VALUE] and frequency to [VALUE] for [DESCRIPTION]"

**Files to check:**
- `src/world/terrain.js`
- `src/world/coastalZones.js`

**Example:**
```
"Reduce terrain amplitude to 20 and increase frequency to 0.05 for gentler hills"
```

**⚠️ Warning:** Changing terrain affects:
- Building placement
- Harbor positioning
- Walkability grid
- Coastal zones

Always test after terrain changes.

---

## 🏛️ Buildings & Landmarks

> **Prompt:**
> "Add a new landmark at grid position ([X], [Z]) with model [PATH]"

**Files to check:**
- `src/world/LandmarkManager.js`
- `src/features/buildingKit.js`
- `public/config/districts.json`

**Example:**
```
"Place Parthenon landmark at (-64, 25) using models/landmarks/parthenon.glb"
```

---

## 🎮 Controls & Camera

> **Prompt:**
> "Adjust camera [PARAMETER] to [VALUE] for [REASON]"

**Files to check:**
- `src/controls/ThirdPersonCamera.js`
- `src/controls/PlayerController.js`

**Example:**
```
"Increase camera follow distance to 12 and smooth factor to 0.1 for smoother movement"
```

---

## 🎨 Materials & Textures

> **Prompt:**
> "Set [MATERIAL_TYPE] roughness to [VALUE] and metalness to [VALUE]"

**Files to check:**
- `src/materials/pbr-utils.js`
- `src/world/groundTextures.js`
- `src/features/buildingKit.js`

**Example:**
```
"Set marble roughness to 0.3 and metalness to 0.1 for more realistic stone"
```

---

## 🚢 Harbor & Coastal Features

> **Prompt:**
> "Adjust harbor placement algorithm to [DESCRIPTION]"

**Files to check:**
- `src/world/harbor.js`
- `src/world/coastalZones.js`

**Example:**
```
"Move harbor center 10 units north and add 5 more pier slots"
```

---

## 📦 Asset Loading

> **Prompt:**
> "Add fallback candidates for [ASSET_NAME] at [PATHS]"

**Files to check:**
- `src/config/AssetConfig.js`
- `src/core/AssetLoader.js`

**Example:**
```
"Add fallback for temple at models/buildings/temple.glb and models/landmarks/temple_alt.glb"
```

---

## ⚡ Performance

> **Prompt:**
> "Enable [OPTIMIZATION] for [REASON]"

**Files to check:**
- `src/config/EngineConfig.js`
- `src/utils/textureBudget.js`

**Example:**
```
"Enable instancing for repeated building models to improve FPS"
```

---

## 🐛 Debug & Development

> **Prompt:**
> "Add debug visualization for [SYSTEM]"

**Files to check:**
- `src/debug/flags.js`
- `src/core/Application.js`

**Example:**
```
"Add debug overlay showing current player position and nearby buildings"
```

---

## 🎯 Best Practices for AI Changes

1. **Read before writing**: Always check current file contents first
2. **Test incrementally**: Make one change at a time
3. **Preserve vision**: Follow the mainland coastal city concept (see README.md)
4. **Check dependencies**: Changes to terrain affect buildings, harbor, etc.
5. **Commit often**: Use descriptive commit messages
6. **Build & test**: Run `npm run build` before pushing

---

## 🔄 Common Workflows

### Adding a New Landmark
```
1. Add model to public/models/landmarks/
2. Update src/config/AssetConfig.js with path candidates
3. Place in LandmarkManager or districts.json
4. Test: npm run dev
5. Commit: "feat: add [landmark name] to [location]"
```

### Adjusting Visual Quality
```
1. Check src/config/LightingConfig.js for light settings
2. Check src/world/groundTextures.js for texture resolution
3. Check src/materials/pbr-utils.js for material properties
4. Test in different lighting conditions
5. Commit: "chore: improve visual quality for [aspect]"
```

### Fixing Asset 404s
```
1. Check browser console for missing paths
2. Verify file exists in public/ or docs/
3. Update AssetConfig.js fallback candidates
4. Check AssetLoader.js URL normalization
5. Rebuild: npm run build
6. Commit: "fix: resolve 404s for [asset type]"
```

---

## 📝 Commit Message Format

Use conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `chore:` Maintenance (textures, assets, config)
- `docs:` Documentation only
- `refactor:` Code restructuring
- `perf:` Performance improvement

**Examples:**
```
feat: add lighthouse landmark to harbor
fix: prevent double base-path in asset URLs
chore: increase ground texture anisotropy
docs: add Codespaces setup instructions
```

---

## 🛑 What NOT to Change

- **Island logic**: This is a mainland city, not an island
- **Radial terrain**: Terrain should be directional (sea → inland hills)
- **Core architecture**: Don't rewrite Application.js or Scene.js without discussion
- **Build config**: vite.config.ts changes should be minimal

---

## 🆘 When Stuck

1. Check README.md for project vision
2. Read relevant file comments
3. Search for similar existing code
4. Test locally before committing
5. Ask for clarification if the task conflicts with project goals
