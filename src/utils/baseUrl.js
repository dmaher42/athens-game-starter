// Centralized path helpers to avoid double-prefix bugs.
export function resolveBaseUrl() {
  // With Vite base:"./", we should use relative URLs only.
  // Returning "" keeps everything relative to the app root.
  return "";
}

// Join path segments without leading/trailing slashes piling up.
export function joinPath(...parts) {
  return parts
    .filter(Boolean)
    .map(p => String(p).replace(/(^\/+|\/+$/g, ""))
    .join("/");
}
