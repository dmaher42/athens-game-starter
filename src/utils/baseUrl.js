// src/utils/baseUrl.js
export function resolveBaseUrl() {
  // With Vite base = "./", use relative paths from app root.
  return "";
}

// Join parts safely without leading/trailing slash duplication.
export function joinPath(...parts) {
  return parts
    .filter(Boolean)
    .map((p) => String(p).replace(/(^\/+|\/+$)/g, ""))
    .join("/");
}
