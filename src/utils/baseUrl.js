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

const headCache = new Map();

export async function headOk(url) {
  if (typeof url !== "string" || url.length === 0) {
    return false;
  }

  if (headCache.has(url)) {
    return headCache.get(url);
  }

  let ok = false;
  try {
    const response = await fetch(url, { method: "HEAD" });
    if (response.ok) {
      const contentType = response.headers.get("content-type") || "";
      ok = !contentType.toLowerCase().includes("text/html");
    }
  } catch (error) {
    ok = false;
  }

  headCache.set(url, ok);
  return ok;
}
