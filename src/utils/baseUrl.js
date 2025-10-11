const VITE_BASE = (import.meta?.env?.BASE_URL) || "/";

function ensureSlash(s) {
  return s.endsWith("/") ? s : s + "/";
}

// Optional explicit override before app boots:
// <script>window.__BASE_URL__="/athens-game-starter/";</script>
export function resolveBaseUrl() {
  const override =
    (typeof window !== "undefined" && window.__BASE_URL__) || "";
  const base = (override && typeof override === "string") ? override : VITE_BASE;
  return ensureSlash(base);
}

// Join a relative path to base. If rel is absolute, leave it untouched.
export function joinPath(base, rel) {
  if (/^(https?:)?\/\//i.test(rel) || rel.startsWith("/")) return rel;
  return ensureSlash(base) + String(rel).replace(/^\/+/, "");
}
