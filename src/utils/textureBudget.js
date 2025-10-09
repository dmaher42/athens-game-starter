import * as THREE from "three";

const DEFAULT_HARDWARE_LIMIT = 8;
const LOW_TIER_LIMIT = 10;
const processedMaterials = new WeakSet();

const CORE_TEXTURE_SLOTS = ["map", "normalMap", "roughnessMap"];

const OPTIONAL_TEXTURE_PRIORITY = [
  "aoMap",
  "emissiveMap",
  "lightMap",
  "specularIntensityMap",
  "specularColorMap",
  "clearcoatMap",
  "clearcoatRoughnessMap",
  "clearcoatNormalMap",
  "sheenColorMap",
  "sheenRoughnessMap",
  "transmissionMap",
  "thicknessMap",
  "iridescenceMap",
  "iridescenceThicknessMap",
  "anisotropyMap",
  "metalnessMap",
  "bumpMap",
  "displacementMap",
  "alphaMap",
  "envMap",
];

const MAP_RESETTERS = {
  aoMap: (material) => {
    if ("aoMapIntensity" in material) {
      material.aoMapIntensity = 0;
    }
  },
  emissiveMap: (material) => {
    if ("emissiveIntensity" in material) {
      material.emissiveIntensity = 0;
    }
  },
  lightMap: (material) => {
    if ("lightMapIntensity" in material) {
      material.lightMapIntensity = 0;
    }
  },
  clearcoatMap: (material) => {
    if ("clearcoat" in material) {
      material.clearcoat = 0;
    }
  },
  clearcoatNormalMap: (material) => {
    if ("clearcoat" in material) {
      material.clearcoat = 0;
    }
  },
  clearcoatRoughnessMap: (material) => {
    if ("clearcoat" in material) {
      material.clearcoat = 0;
    }
    if ("clearcoatRoughness" in material) {
      material.clearcoatRoughness = 0;
    }
  },
  sheenColorMap: (material) => {
    if ("sheen" in material) {
      material.sheen = 0;
    }
    if (material.sheenColor?.isColor) {
      material.sheenColor.setRGB(0, 0, 0);
    }
  },
  sheenRoughnessMap: (material) => {
    if ("sheen" in material) {
      material.sheen = 0;
    }
  },
  transmissionMap: (material) => {
    if ("transmission" in material) {
      material.transmission = 0;
    }
  },
  thicknessMap: (material) => {
    if ("thickness" in material) {
      material.thickness = 0;
    }
  },
  specularIntensityMap: (material) => {
    if ("specularIntensity" in material) {
      material.specularIntensity = 1;
    }
  },
  specularColorMap: (material) => {
    if (material.specularColor?.isColor) {
      material.specularColor.setRGB(1, 1, 1);
    }
  },
  iridescenceMap: (material) => {
    if ("iridescence" in material) {
      material.iridescence = 0;
    }
  },
  iridescenceThicknessMap: (material) => {
    if ("iridescence" in material) {
      material.iridescence = 0;
    }
  },
  anisotropyMap: (material) => {
    if ("anisotropy" in material) {
      material.anisotropy = 0;
    }
  },
};

function isTexture(value) {
  return Boolean(value && typeof value === "object" && value.isTexture);
}

function resolveRenderer(options) {
  if (!options) return null;
  if (options.renderer) {
    return options.renderer;
  }
  if (options.scene?.userData?.renderer) {
    return options.scene.userData.renderer;
  }
  return null;
}

function resolveTextureLimit(options) {
  const renderer = resolveRenderer(options);
  if (Number.isFinite(options?.maxTextures)) {
    return Math.max(1, Math.floor(options.maxTextures));
  }
  const capabilities = renderer?.capabilities;
  if (capabilities) {
    const maxTextures =
      capabilities.maxTextures ??
      capabilities.maxTextureUnits ??
      capabilities.maxFragmentTextures ??
      capabilities.maxFragmentUniforms;
    if (Number.isFinite(maxTextures)) {
      return Math.max(1, Math.floor(maxTextures));
    }
  }
  return DEFAULT_HARDWARE_LIMIT;
}

function gatherTextureSlots(material) {
  const slots = new Set(CORE_TEXTURE_SLOTS.concat(OPTIONAL_TEXTURE_PRIORITY));
  for (const key in material) {
    if (key && key.endsWith("Map")) {
      slots.add(key);
    }
  }
  return Array.from(slots);
}

function getActiveTextureSlots(material) {
  const slots = gatherTextureSlots(material);
  const active = [];
  for (const slot of slots) {
    if (isTexture(material[slot])) {
      active.push(slot);
    }
  }
  return active;
}

function removeTexture(material, slot) {
  if (!slot || !isTexture(material[slot])) {
    return false;
  }
  material[slot] = null;
  const reset = MAP_RESETTERS[slot];
  if (reset) {
    reset(material);
  }
  if (material.needsUpdate !== true) {
    material.needsUpdate = true;
  }
  return true;
}

function usesPhysicalExtensions(material) {
  if (!material?.isMeshPhysicalMaterial) {
    return false;
  }
  const clearcoatActive =
    (material.clearcoat ?? 0) > 0.001 ||
    isTexture(material.clearcoatMap) ||
    isTexture(material.clearcoatNormalMap) ||
    isTexture(material.clearcoatRoughnessMap);
  const sheenActive =
    (material.sheen ?? 0) > 0.001 ||
    (material.sheenColor?.isColor && material.sheenColor.getHex() !== 0) ||
    isTexture(material.sheenColorMap) ||
    isTexture(material.sheenRoughnessMap);
  const transmissionActive =
    (material.transmission ?? 0) > 0.001 ||
    isTexture(material.transmissionMap) ||
    (material.thickness ?? 0) > 0.001 ||
    isTexture(material.thicknessMap);
  const iridescenceActive =
    (material.iridescence ?? 0) > 0.001 ||
    isTexture(material.iridescenceMap) ||
    isTexture(material.iridescenceThicknessMap);

  return clearcoatActive || sheenActive || transmissionActive || iridescenceActive;
}

function maybeDowngradePhysicalMaterial(material, options, trimmed) {
  if (!material?.isMeshPhysicalMaterial) {
    return null;
  }

  const limit = resolveTextureLimit(options);
  const lowTierDevice = limit <= LOW_TIER_LIMIT;
  if (!trimmed && !lowTierDevice) {
    return null;
  }

  if (usesPhysicalExtensions(material)) {
    return null;
  }

  const downgraded = new THREE.MeshStandardMaterial();
  downgraded.copy(material);
  downgraded.name = material.name;
  downgraded.userData = { ...(material.userData || {}) };
  downgraded.onBeforeCompile = material.onBeforeCompile;
  if (typeof material.customProgramCacheKey === "function") {
    downgraded.customProgramCacheKey = () =>
      material.customProgramCacheKey.call(downgraded);
  }
  downgraded.needsUpdate = true;
  return downgraded;
}

function budgetSingleMaterial(material, options) {
  if (!material || processedMaterials.has(material)) {
    return material;
  }
  if (material.userData?.textureBudget === "skip" || material.userData?.textureBudgetSkip) {
    processedMaterials.add(material);
    return material;
  }

  const activeSlots = getActiveTextureSlots(material);
  const limit = Math.max(3, resolveTextureLimit(options));

  if (activeSlots.length <= limit) {
    processedMaterials.add(material);
    return material;
  }

  const active = new Set(activeSlots);
  let trimmed = false;

  for (const slot of OPTIONAL_TEXTURE_PRIORITY) {
    if (!active.has(slot)) continue;
    if (CORE_TEXTURE_SLOTS.includes(slot)) continue;
    if (removeTexture(material, slot)) {
      active.delete(slot);
      trimmed = true;
      if (active.size <= limit) {
        break;
      }
    }
  }

  if (active.size > limit) {
    for (const slot of activeSlots) {
      if (!active.has(slot)) continue;
      if (CORE_TEXTURE_SLOTS.includes(slot)) {
        continue;
      }
      if (removeTexture(material, slot)) {
        active.delete(slot);
        trimmed = true;
        if (active.size <= limit) {
          break;
        }
      }
    }
  }

  if (active.size > limit) {
    for (const slot of CORE_TEXTURE_SLOTS.filter((name) => name !== "map")) {
      if (!active.has(slot)) continue;
      if (removeTexture(material, slot)) {
        active.delete(slot);
        trimmed = true;
        if (active.size <= limit) {
          break;
        }
      }
    }
  }

  processedMaterials.add(material);

  if (active.size > limit) {
    return material;
  }

  const replacement = maybeDowngradePhysicalMaterial(material, options, trimmed);
  if (replacement && replacement !== material) {
    processedMaterials.add(replacement);
    return replacement;
  }

  return material;
}

export function applyTextureBudgetToMaterial(material, options = {}) {
  if (!material) return material;
  if (Array.isArray(material)) {
    return material.map((mat) => applyTextureBudgetToMaterial(mat, options));
  }
  return budgetSingleMaterial(material, options);
}

export function applyTextureBudgetToObject(object, options = {}) {
  if (!object || typeof object.traverse !== "function") {
    return;
  }

  object.traverse((node) => {
    const materials = node.material;
    if (!materials) return;

    if (Array.isArray(materials)) {
      let replaced = false;
      const updated = materials.map((material) => {
        const result = applyTextureBudgetToMaterial(material, options);
        if (result && result !== material) {
          replaced = true;
        }
        return result;
      });
      if (replaced) {
        node.material = updated;
      }
    } else {
      const result = applyTextureBudgetToMaterial(materials, options);
      if (result && result !== materials) {
        node.material = result;
      }
    }
  });
}

export function resetTextureBudgetCache() {
  processedMaterials.clear();
}
