// ---- src/features/roads-gravel.js ----
import * as THREE from "three";
import { MATERIALS } from "../materials/materialRegistry.js";
import {
  GRASS_MIN_ELEV,
  SAND_MAX_ELEV,
  SLOPE_ROCK_MIN,
} from "../config/terrainMaterials.js";
import { getSeaLevelY } from "../world/locations.js";
import { getSlope } from "../world/terrainUtils.js";

/**
 * Applies gravel material to road meshes only.
 * Phase 3: Defer texture loading to requestAnimationFrame (5-8M deferral)
 * - Safe if textures missing (no-op).
 * - Idempotent: re-running won't double-apply.
 */
export async function applyGravelToRoads({ scene } = {}) {
  return new Promise((resolve) => {
    requestAnimationFrame(async () => {
      if (!scene) {
        resolve();
        return;
      }

      const tl = new THREE.TextureLoader();
      const seaLevel = getSeaLevelY();
      const terrainSampler =
        scene?.userData?.getHeightAt ||
        scene?.userData?.terrainHeightSampler ||
        null;
      let sandMap = null;
      let grassMap = null;
      let stoneMap = null;
      let dirtMap = null;
      try {
        sandMap = await tl.loadAsync(MATERIALS.sand.albedo);
        sandMap.wrapS = sandMap.wrapT = THREE.RepeatWrapping;
        sandMap.repeat.set(6, 6);
        sandMap.colorSpace = THREE.SRGBColorSpace;

        grassMap = await tl.loadAsync(MATERIALS.grass.albedo);
        grassMap.wrapS = grassMap.wrapT = THREE.RepeatWrapping;
        grassMap.repeat.set(6, 6);
        grassMap.colorSpace = THREE.SRGBColorSpace;

        stoneMap = await tl.loadAsync(MATERIALS.stoneFallback.albedo);
        stoneMap.wrapS = stoneMap.wrapT = THREE.RepeatWrapping;
        stoneMap.repeat.set(8, 8);
        stoneMap.colorSpace = THREE.SRGBColorSpace;

        if (MATERIALS.dirt && MATERIALS.dirt.albedo) {
          dirtMap = await tl.loadAsync(MATERIALS.dirt.albedo);
          dirtMap.wrapS = dirtMap.wrapT = THREE.RepeatWrapping;
          dirtMap.repeat.set(5, 5);
          dirtMap.colorSpace = THREE.SRGBColorSpace;
        }
      } catch (err) {
        console.warn("Texture loading failed in applyGravelToRoads", err);
      }

      const sandMaterial = new THREE.MeshStandardMaterial({
        map: sandMap || null,
        color: sandMap ? 0xc9a77f : 0xcdb89c,
        roughness: 0.85,
      });
      const grassMaterial = new THREE.MeshStandardMaterial({
        map: grassMap || null,
        color: grassMap ? 0xffffff : 0x7a8b62,
        roughness: 0.9,
      });
      const dirtMaterial = new THREE.MeshStandardMaterial({
        map: dirtMap || null,
        color: dirtMap ? 0x7f563a : 0x6f4e35,
        roughness: 0.92,
      });
      const cobbleMaterial = new THREE.MeshPhysicalMaterial({
        map: stoneMap || null,
        color: stoneMap ? 0x635e57 : 0x5e5953,
        roughness: 0.65,
        clearcoat: 0.1,
        clearcoatRoughness: 0.4,
        sheen: 0.2,
      });

      if (!sandMaterial || !grassMaterial || !cobbleMaterial) {
        resolve();
        return;
      }

      const pickRoad = (o) => {
        const name = (o.name || "").toLowerCase();
        const u = o.userData || {};
        return (
          name.includes("road") ||
          name.includes("street") ||
          name.includes("path") ||
          u.type === "road" ||
          u.kind === "road" ||
          u.category === "road" ||
          u.roadType
        );
      };

      const isMainRoad = (o) => {
        const name = (o.name || "").toLowerCase();
        const u = o.userData || {};
        return (
          name.includes("main") ||
          name.includes("plaza") ||
          u.kind === "plaza" ||
          u.category === "plaza" ||
          u.roadType === "artery"
        );
      };

      const chooseMaterial = (o) => {
        const roadType = o.userData?.roadType;
        if (roadType === "artery" || isMainRoad(o)) return cobbleMaterial;
        if (roadType === "street") return dirtMaterial;
        if (roadType === "alley") return sandMaterial;

        const pos = o.getWorldPosition(new THREE.Vector3());
        const elevation = Number.isFinite(pos.y) ? pos.y : 0;
        const slope = terrainSampler ? getSlope(terrainSampler, pos.x, pos.z) : 0;

        // Steep paths are always stone/cobble for traction
        if (slope >= SLOPE_ROCK_MIN) {
          return cobbleMaterial;
        }

        // Coastal paths use sand
        if (elevation <= seaLevel + SAND_MAX_ELEV) {
          return sandMaterial;
        }

        // Rural or high-elevation paths use dirt
        if (elevation >= seaLevel + GRASS_MIN_ELEV + 10) {
          return dirtMaterial;
        }

        // Neighborhood paths use dirt/grass mix
        if (elevation >= seaLevel + GRASS_MIN_ELEV) {
          return (Math.random() < 0.7) ? dirtMaterial : grassMaterial;
        }

        return cobbleMaterial;
      };

      let count = 0;
      scene.traverse((o) => {
        if (!o?.isMesh) return;
        if (!pickRoad(o)) return;
        if (o.material && o.material.userData?.__isGravel) return;
        o.material = chooseMaterial(o);
        o.material.userData = { ...(o.material.userData || {}), __isGravel: true };
        o.receiveShadow = true;
        count++;
      });

      console.info("[roads] Gravel textures applied in background");
      resolve();
    });
  });
}
