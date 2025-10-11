const VITE_BASE = (import.meta?.env?.BASE_URL) || "/";

function ensureSlash(s) {
  return s.endsWith("/") ? s : s + "/";
}

// Optional override before app boots:
// <script>window.__BASE_URL__="/athens-game-starter/";</script>
export function resolveBaseUrl() {
  const override =
    (typeof window !== "undefined" && window.__BASE_URL__) || "";
  const base = (override && typeof override === "string") ? override : VITE_BASE;
  return ensureSlash(base); // e.g., "/athens-game-starter/"
}

// If rel is absolute URL or starts with "/", leave it alone (caller’s intent).
// Otherwise, join to base without inserting an extra leading slash.
export function joinPath(base, rel) {
  const r = String(rel);
  if (/^(https?:)?\/\//i.test(r) || r.startsWith("/")) return r;
  return ensureSlash(base) + r.replace(/^\/+/, "");
}
