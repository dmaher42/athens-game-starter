// src/utils/baseUrl.js

const REPO_SEGMENT = "athens-game-starter";
const REPO_BASE = `/${REPO_SEGMENT}/`;
const DOUBLE_SEGMENT = `${REPO_SEGMENT}/${REPO_SEGMENT}`;
export const REPO_BASE_PATH = REPO_BASE;

function normalizeBase(path) {
  if (!path) return "/";
  // If it's a full URL, just ensure trailing slash
  if (/^(?:[a-z]+:)?\/\//i.test(path)) {
    return path.endsWith("/") ? path : `${path}/`;
  }

  let normalized = path;
  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }
  return normalized.endsWith("/") ? normalized : `${normalized}/`;
}

function isGithubPagesHost() {
  if (typeof window === "undefined" || !window.location?.hostname) return false;
  return /github\.io$/i.test(window.location.hostname);
}

function hasDoubleRepo(base) {
  return typeof base === "string" && base.includes(DOUBLE_SEGMENT);
}

export function resolveBaseUrl() {
  const envBase =
    (typeof import.meta !== "undefined" &&
      import.meta.env &&
      typeof import.meta.env.BASE_URL === "string" &&
      import.meta.env.BASE_URL) ||
    null;
  const globalBase =
    typeof window !== "undefined" && typeof window.__BASE_URL__ === "string"
      ? window.__BASE_URL__
      : null;

  let base = normalizeBase(globalBase || envBase || "/");

  if (hasDoubleRepo(base)) {
    if (import.meta.env?.DEV) {
      console.error(
        `[baseUrl] Detected double repo segment in base (${base}); normalizing to ${REPO_BASE}`,
      );
    }
    base = REPO_BASE;
  }

  const onGithubPages = isGithubPagesHost();
  if (onGithubPages) {
    // Always serve from the repo base when hosted on GitHub Pages.
    base = REPO_BASE;
  } else if (typeof window !== "undefined" && !globalBase && !envBase) {
    // Local dev or non-GitHub Pages hosts should resolve from root when no explicit base is provided.
    base = "/";
  }

  return normalizeBase(base);
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
  const b = base.endsWith("/") ? base : `${base}/`;
  const r = String(rel).replace(/^\/+/, "");
  return b + r;
}
