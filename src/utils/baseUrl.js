// src/utils/baseUrl.js
export function resolveBaseUrl() {
  // With Vite base="./", we should use relative URLs from app root.
  return ""; // no hard-coded /athens-game-starter/
}

// join parts without // or leading/trailing slashes
export function joinPath(...parts) {
  return parts
    .filter(Boolean)
    .map((p) => String(p).replace(/(^\/+|\/+$)/g, ""))
    .join("/");
}
