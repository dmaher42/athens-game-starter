// src/utils/baseUrl.js
// We serve with Vite `base: "./"`. Use relative paths only; never hard-code
// "/athens-game-starter" or other absolute prefixes so we can deploy anywhere.
export function resolveBaseUrl() {
  return ""; // relative from app root
}

// Join parts like URL paths, trimming leading/trailing slashes to avoid "//"
// and duplicated prefixes when concatenating.
export function joinPath(...parts) {
  return parts
    .filter(Boolean)
    .map((p) => String(p).replace(/(^\/+|\/+$)/g, ""))
    .join("/");
}
