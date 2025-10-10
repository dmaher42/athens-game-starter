// src/utils/baseUrl.js
export function resolveBaseUrl() {
  // With Vite base: "./" and GitHub Pages serving /athens-game-starter/,
  // relative URLs from app root are correct.
  return ""; // always return relative base
}

export function joinPath(...parts) {
  return parts
    .filter(Boolean)
    .map((p) => String(p).replace(/(^\/+|\/+$)/g, ""))
    .join("/");
}
