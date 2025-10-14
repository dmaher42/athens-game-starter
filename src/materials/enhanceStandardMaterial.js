// src/materials/enhanceStandardMaterial.js
// Global patches for MeshStandardMaterial to provide consistent ambient occlusion
// behaviour even when AO textures are absent.

import { MeshStandardMaterial } from "three";

const DEFAULT_FALLBACK = 0.8;
const DEFAULT_EDGE_INNER = 0.08;
const DEFAULT_EDGE_OUTER = 0.32;
const AO_CHUNK_SENTINEL = "ENHANCED_AO_CHUNK";

function clamp01(value) {
  if (!Number.isFinite(value)) return 0;
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

function applyDefaults(material) {
  if (!material) return;
  if (!material.userData) material.userData = {};
  if (typeof material.userData.fallbackAO !== "number") {
    material.userData.fallbackAO = DEFAULT_FALLBACK;
  } else {
    material.userData.fallbackAO = clamp01(material.userData.fallbackAO);
  }
  if (typeof material.userData.aoEdgeInner !== "number") {
    material.userData.aoEdgeInner = DEFAULT_EDGE_INNER;
  } else {
    material.userData.aoEdgeInner = Math.max(0, material.userData.aoEdgeInner);
  }
  if (typeof material.userData.aoEdgeOuter !== "number") {
    material.userData.aoEdgeOuter = DEFAULT_EDGE_OUTER;
  } else {
    material.userData.aoEdgeOuter = Math.max(material.userData.aoEdgeInner, material.userData.aoEdgeOuter);
  }
  if (typeof material.aoMapIntensity !== "number") {
    material.aoMapIntensity = 1.0;
  }
}

let patched = false;

function installAmbientOcclusionPatch() {
  if (patched) return;
  patched = true;

  const originalSetValues = MeshStandardMaterial.prototype.setValues;
  MeshStandardMaterial.prototype.setValues = function setValues(values) {
    originalSetValues.call(this, values);
    applyDefaults(this);
  };

  const originalClone = MeshStandardMaterial.prototype.clone;
  MeshStandardMaterial.prototype.clone = function clone() {
    const cloned = originalClone.call(this);
    applyDefaults(cloned);
    return cloned;
  };

  const originalCopy = MeshStandardMaterial.prototype.copy;
  MeshStandardMaterial.prototype.copy = function copy(source) {
    originalCopy.call(this, source);
    applyDefaults(this);
    if (source?.userData) {
      if (typeof source.userData.fallbackAO === "number") {
        this.userData.fallbackAO = clamp01(source.userData.fallbackAO);
      }
      if (typeof source.userData.aoEdgeInner === "number") {
        this.userData.aoEdgeInner = Math.max(0, source.userData.aoEdgeInner);
      }
      if (typeof source.userData.aoEdgeOuter === "number") {
        this.userData.aoEdgeOuter = Math.max(this.userData.aoEdgeInner, source.userData.aoEdgeOuter);
      }
    }
    return this;
  };

  const originalCustomProgramCacheKey = MeshStandardMaterial.prototype.customProgramCacheKey;
  MeshStandardMaterial.prototype.customProgramCacheKey = function customProgramCacheKey() {
    const base = typeof originalCustomProgramCacheKey === "function"
      ? originalCustomProgramCacheKey.call(this)
      : "";
    applyDefaults(this);
    const ao = this.userData.fallbackAO;
    const inner = this.userData.aoEdgeInner;
    const outer = this.userData.aoEdgeOuter;
    return `${base}|ao:${ao.toFixed(4)}:${inner.toFixed(4)}:${outer.toFixed(4)}`;
  };

  const originalOnBeforeCompile = MeshStandardMaterial.prototype.onBeforeCompile;
  MeshStandardMaterial.prototype.onBeforeCompile = function onBeforeCompile(shader, renderer) {
    if (typeof originalOnBeforeCompile === "function") {
      originalOnBeforeCompile.call(this, shader, renderer);
    }

    if (!shader || !shader.fragmentShader || !shader.uniforms) {
      return;
    }

    applyDefaults(this);

    shader.uniforms.uFallbackAO = shader.uniforms.uFallbackAO || { value: this.userData.fallbackAO };
    shader.uniforms.uAoEdgeInner = shader.uniforms.uAoEdgeInner || { value: this.userData.aoEdgeInner };
    shader.uniforms.uAoEdgeOuter = shader.uniforms.uAoEdgeOuter || { value: this.userData.aoEdgeOuter };

    if (!shader.fragmentShader.includes(AO_CHUNK_SENTINEL)) {
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <aomap_fragment>",
        `#define ${AO_CHUNK_SENTINEL}\n` +
          "float ambientOcclusion = 1.0;\n" +
          "#ifdef USE_AOMAP\n" +
          "\tambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;\n" +
          "#else\n" +
          "\tfloat vertexAO = 1.0;\n" +
          "\t#ifdef USE_VERTEX_COLORS\n" +
          "\t\tvertexAO = clamp( dot( vColor.rgb, vec3( 0.299, 0.587, 0.114 ) ), 0.0, 1.0 );\n" +
          "\t#endif\n" +
          "\tvec2 aoUv = vec2( 0.5 );\n" +
          "\t#if defined( USE_AOMAP )\n" +
          "\t\taoUv = vAoMapUv;\n" +
          "\t#elif defined( USE_UV ) || defined( USE_ANISOTROPY )\n" +
          "\t\taoUv = vUv;\n" +
          "\t#endif\n" +
          "\tfloat aoEdge = min( min( aoUv.x, 1.0 - aoUv.x ), min( aoUv.y, 1.0 - aoUv.y ) );\n" +
          "\tfloat concavity = 1.0 - smoothstep( uAoEdgeInner, uAoEdgeOuter, aoEdge );\n" +
          "\tfloat fallbackAO = mix( 1.0, uFallbackAO, concavity );\n" +
          "\tambientOcclusion = min( vertexAO, fallbackAO );\n" +
          "#endif\n" +
          "reflectedLight.indirectDiffuse *= ambientOcclusion;\n" +
          "#if defined( USE_CLEARCOAT )\n" +
          "\tclearcoatSpecularIndirect *= ambientOcclusion;\n" +
          "#endif\n" +
          "#if defined( USE_SHEEN )\n" +
          "\tsheenSpecularIndirect *= ambientOcclusion;\n" +
          "#endif\n" +
          "#if defined( USE_ENVMAP ) && defined( STANDARD )\n" +
          "\tfloat dotNV = saturate( dot( geometryNormal, geometryViewDir ) );\n" +
          "\treflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );\n" +
          "#else\n" +
          "\treflectedLight.indirectSpecular *= mix( 1.0, ambientOcclusion, 0.85 );\n" +
          "#endif\n" +
          "totalEmissiveRadiance *= ambientOcclusion;\n"
      );
    }

    shader.uniforms.uFallbackAO.value = this.userData.fallbackAO;
    shader.uniforms.uAoEdgeInner.value = this.userData.aoEdgeInner;
    shader.uniforms.uAoEdgeOuter.value = this.userData.aoEdgeOuter;
  };
}

installAmbientOcclusionPatch();

export function setMaterialAmbientOcclusion(material, { fallback = DEFAULT_FALLBACK, edgeInner = DEFAULT_EDGE_INNER, edgeOuter = DEFAULT_EDGE_OUTER } = {}) {
  if (!(material instanceof MeshStandardMaterial)) return;
  applyDefaults(material);
  material.userData.fallbackAO = clamp01(fallback);
  material.userData.aoEdgeInner = Math.max(0, edgeInner);
  material.userData.aoEdgeOuter = Math.max(material.userData.aoEdgeInner, edgeOuter);
  material.needsUpdate = true;
}

export function getMaterialAmbientOcclusion(material) {
  if (!(material instanceof MeshStandardMaterial)) {
    return {
      fallback: DEFAULT_FALLBACK,
      edgeInner: DEFAULT_EDGE_INNER,
      edgeOuter: DEFAULT_EDGE_OUTER,
    };
  }
  applyDefaults(material);
  return {
    fallback: material.userData.fallbackAO,
    edgeInner: material.userData.aoEdgeInner,
    edgeOuter: material.userData.aoEdgeOuter,
  };
}
