// src/utils/baseUrl.js
export function resolveBaseUrl() {
  const viteBase =
    (typeof import.meta !== "undefined" &&
      import.meta.env &&
      import.meta.env.BASE_URL) ||
    "/";
  const globalBase =
    (typeof window !== "undefined" && window.__BASE_URL__) || null;
  const base = globalBase || viteBase || "/";
  return base.endsWith("/") ? base : base + "/";
}

export function joinPath(base, rel) {
  if (!base) base = "/";
  if (!rel) return base;
  // If rel is a full URL, return it as-is.
  if (/^(?:[a-z]+:)?\/\//i.test(rel)) return rel;
  // Treat root-absolute rels as absolute (don't re-join).
  if (rel.startsWith("/")) {
    return rel;
  }
  const b = base.endsWith("/") ? base : base + "/";
  const r = String(rel).replace(/^\/+/, "");
  return b + r;
}
