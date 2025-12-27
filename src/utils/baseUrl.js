// src/utils/baseUrl.js

// This constant is preserved for compatibility if other files import it,
// but it is no longer used for base URL resolution logic.
export const REPO_SEGMENT = "athens-game-starter";

export function resolveBaseUrl() {
  if (
    typeof import.meta !== "undefined" &&
    import.meta.env &&
    typeof import.meta.env.BASE_URL === "string"
  ) {
    return import.meta.env.BASE_URL;
  }
  return "/";
}

export function normalizeBaseUrl(base) {
  const b = base || resolveBaseUrl();
  return b.endsWith("/") ? b : `${b}/`;
}

export function joinPath(base, rel) {
  const effectiveBase = base || resolveBaseUrl();
  if (!rel) return effectiveBase;

  // If rel is absolute URL, return it
  if (/^(?:[a-z]+:)?\/\//i.test(rel)) {
    return rel;
  }

  // Ensure base ends with slash
  const baseSlash = effectiveBase.endsWith("/")
    ? effectiveBase
    : `${effectiveBase}/`;

  // Remove leading slash from rel to avoid breaking out of base
  const relClean = rel.replace(/^\/+/, "");

  return `${baseSlash}${relClean}`;
}
