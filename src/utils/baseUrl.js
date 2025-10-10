// src/utils/baseUrl.js
// With Vite base:"./" on GitHub Pages, relative paths are correct.
export function resolveBaseUrl() {
  return "";
}

const ABSOLUTE_URL_REGEX = /^(?:[a-z]+:)?\/\//i;

export function normalizeAssetPath(path) {
  if (typeof path !== "string") return "";
  const trimmed = path.trim();
  if (!trimmed) return "";
  if (ABSOLUTE_URL_REGEX.test(trimmed) || trimmed.startsWith("data:")) {
    return trimmed;
  }

  let normalized = trimmed;
  while (normalized.startsWith("./")) {
    normalized = normalized.slice(2);
  }
  normalized = normalized.replace(/^\/+/, "");
  normalized = normalized.replace(/\/+$/g, "");

  const LEGACY_PREFIXES = ["public/", "athens-game-starter/"];
  for (const prefix of LEGACY_PREFIXES) {
    if (normalized.startsWith(prefix)) {
      normalized = normalized.slice(prefix.length);
    }
  }

  return normalized;
}

export function joinPath(...parts) {
  const filtered = parts.filter((part) => part !== undefined && part !== null && part !== "");
  if (!filtered.length) return "";

  const [head, ...rest] = filtered;
  const headStr = String(head).trim();
  const headIsAbsolute = ABSOLUTE_URL_REGEX.test(headStr) || headStr.startsWith("data:");
  const segments = [headIsAbsolute ? headStr.replace(/\/+$|\s+$/g, "") : normalizeAssetPath(headStr)];

  for (const segment of rest) {
    const normalized = normalizeAssetPath(String(segment));
    if (normalized) {
      segments.push(normalized);
    }
  }

  return segments
    .filter(Boolean)
    .join("/")
    .replace(/\/+$/g, "");
}
