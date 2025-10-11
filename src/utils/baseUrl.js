export function resolveBaseUrl() {
  return "";
}

export function joinPath(...parts) {
  return parts
    .filter(Boolean)
    .map((p) => String(p).replace(/(^\/+|\/+$)/g, ""))
    .join("/");
}

export function normalizeAssetPath(path) {
  if (typeof path !== "string") return "";
  const withoutQuery = path.replace(/[?#].*$/, "");
  const stripped = withoutQuery
    .replace(/^public\//i, "")
    .replace(/^\.\//, "")
    .replace(/^athens-game-starter\//i, "")
    .replace(/^docs\//i, "")
    .replace(/^\//, "");
  return joinPath(stripped);
}
