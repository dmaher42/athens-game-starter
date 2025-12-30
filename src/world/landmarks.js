import * as THREE from "three";
import { LOD } from "three";
import { IS_DEV } from "../utils/env.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import {
  resolveKTX2TranscoderPath,
  DEFAULT_BASIS_TRANSCODER_PATH,
} from "../utils/ktx2.js";
import { createGLTFLoader } from "../utils/glbSafeLoader.js";

const ENABLE_GLB_MODE = true;

let loader = null;
let ktx2Loader = null;
let supportsKTX2 = false;
let hasWarnedUnsupportedKTX2 = false;
let currentTranscoderPath = null;
let hasLoggedCdnFallback = false;

/**
 * Initialise everything related to asset transcoding (generic, not just landmarks).
 */
export async function initializeAssetTranscoders(renderer) {
  if (!ENABLE_GLB_MODE) return null;
  if (!renderer || typeof renderer.getContext !== "function") {
    return;
  }

  // Lazy-load GLTFLoader if not already created
  if (!loader) {
    loader = await createGLTFLoader(renderer);
  }

  const transcoderPath = resolveKTX2TranscoderPath();

  if (!ktx2Loader) {
    const { KTX2Loader } = await import("three/examples/jsm/loaders/KTX2Loader.js");
    ktx2Loader = new KTX2Loader();
  }

  if (transcoderPath && transcoderPath !== currentTranscoderPath) {
    ktx2Loader.setTranscoderPath(transcoderPath);
    currentTranscoderPath = transcoderPath;

    if (
      !hasLoggedCdnFallback &&
      transcoderPath === DEFAULT_BASIS_TRANSCODER_PATH
    ) {
      if (IS_DEV) console.info(
        "KTX2 transcoder path not configured; falling back to the three.js CDN."
      );
      hasLoggedCdnFallback = true;
    }
  }

  try {
    ktx2Loader.detectSupport(renderer);
    const supportFlags = ktx2Loader.workerConfig || {};
    supportsKTX2 = Object.values(supportFlags).some(Boolean);

    if (!supportsKTX2) {
      if (!hasWarnedUnsupportedKTX2) {
        if (IS_DEV) console.warn(
          "KTX2 is not supported on this GPU/driver combo. Falling back to standard textures."
        );
        hasWarnedUnsupportedKTX2 = true;
      }
      loader.setKTX2Loader(null);
    } else {
      loader.setKTX2Loader(ktx2Loader);
      hasWarnedUnsupportedKTX2 = false;
    }

    loader.setMeshoptDecoder(MeshoptDecoder);
  } catch (error) {
    supportsKTX2 = false;
    hasWarnedUnsupportedKTX2 = true;
    console.warn(
      "KTX2 not supported in this browser. Falling back to standard textures.",
      error
    );
    loader.setKTX2Loader(null);
  }
}

export const HARBOR_LANDMARKS = [];

export function createHarborLandmarkFallback(type, THREE) {
  return new THREE.Group();
}

export function placeHarborLandmarks(options) {
  // No-op
}

export function initLandmarks(scene, renderer) {
  initializeAssetTranscoders(renderer);
  return scene;
}

export function disposeLandmarks() {
  // No-op
}

export function generateTempleGeometry(width, length, height, columnCountFront, columnCountSide) {
    // Return empty geometry to satisfy imports if any
    return new THREE.BufferGeometry();
}

export function generateTheaterGeometry(radius, tierCount) {
    return new THREE.BufferGeometry();
}

export function createParthenon() {
    return new THREE.Mesh();
}

export function createTempleOfZeus() {
    return new THREE.Mesh();
}

export function createTheater() {
    return new THREE.Mesh();
}

export async function spawnProceduralFallback(options) {
    return null;
}

export async function loadLandmark() {
  throw new Error("Landmarks are disabled in this project");
}
