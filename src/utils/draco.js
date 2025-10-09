import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { resolveBaseUrl } from "./baseUrl.js";

export const DEFAULT_DRACO_DECODER_PATH =
  "https://www.gstatic.com/draco/versioned/decoders/1.5.7/";

const LOCAL_DRACO_SUBPATH = "draco/";
const ABSOLUTE_PROTOCOL_REGEX = /^[a-zA-Z][a-zA-Z\d+.-]*:/;
const PROTOCOL_RELATIVE_REGEX = /^\/\//;

function ensureTrailingSlash(value) {
  if (typeof value !== "string" || value.length === 0) {
    return value;
  }
  return value.endsWith("/") ? value : `${value}/`;
}

function normaliseCandidate(candidate, baseUrl) {
  if (typeof candidate !== "string") {
    return null;
  }

  const trimmed = candidate.trim();
  if (!trimmed) {
    return null;
  }

  if (ABSOLUTE_PROTOCOL_REGEX.test(trimmed) || PROTOCOL_RELATIVE_REGEX.test(trimmed)) {
    try {
      const origin =
        typeof window !== "undefined" && window.location?.origin
          ? window.location.origin
          : "https://example.com";
      const resolved = new URL(trimmed, origin);
      return ensureTrailingSlash(resolved.href);
    } catch {
      return ensureTrailingSlash(trimmed);
    }
  }

  if (trimmed.startsWith("./") || trimmed.startsWith("../")) {
    return ensureTrailingSlash(trimmed);
  }

  if (trimmed.startsWith("/")) {
    return ensureTrailingSlash(trimmed);
  }

  const base = ensureTrailingSlash(baseUrl || resolveBaseUrl());
  return ensureTrailingSlash(`${base}${trimmed}`);
}

export function resolveDracoDecoderPath() {
  const baseUrl = resolveBaseUrl();
  const candidates = [];

  const meta = typeof import.meta !== "undefined" ? import.meta : null;
  const env = meta?.env;
  if (env && typeof env.VITE_DRACO_DECODER_PATH === "string") {
    candidates.push(env.VITE_DRACO_DECODER_PATH);
  }

  if (typeof window !== "undefined") {
    const globalPath = window.__DRACO_DECODER_PATH__;
    if (typeof globalPath === "string") {
      candidates.push(globalPath);
    }
  }

  candidates.push(DEFAULT_DRACO_DECODER_PATH);
  candidates.push(`${baseUrl}${LOCAL_DRACO_SUBPATH}`);
  candidates.push(LOCAL_DRACO_SUBPATH);

  for (const candidate of candidates) {
    const normalised = normaliseCandidate(candidate, baseUrl);
    if (normalised) {
      return normalised;
    }
  }

  return DEFAULT_DRACO_DECODER_PATH;
}

let sharedDracoLoader = null;
let currentDecoderPath = null;

export function createDracoLoader() {
  if (!sharedDracoLoader) {
    sharedDracoLoader = new DRACOLoader();
  }

  const path = resolveDracoDecoderPath();
  if (path && path !== currentDecoderPath) {
    sharedDracoLoader.setDecoderPath(path);
    try {
      sharedDracoLoader.preload();
    } catch (error) {
      console.warn("DRACOLoader.preload failed; continuing with lazy decoding", error);
    }
    currentDecoderPath = path;
  }

  return sharedDracoLoader;
}
