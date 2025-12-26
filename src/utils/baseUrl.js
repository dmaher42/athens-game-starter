// src/utils/baseUrl.js

const REPO_SEGMENT = "athens-game-starter";
const REPO_BASE = `/${REPO_SEGMENT}/`;
const DOUBLE_SEGMENT = `${REPO_SEGMENT}/${REPO_SEGMENT}`;
export const REPO_BASE_PATH = REPO_BASE;

function normalizeBase(path) {
  if (!path) return REPO_BASE;
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

  let base = normalizeBase(globalBase || envBase || REPO_BASE);

  if (hasDoubleRepo(base)) {
    base = REPO_BASE;
  }

  const onGithubPages = isGithubPagesHost();
  if (onGithubPages) {
    // Always serve from the repo base when hosted on GitHub Pages.
    base = REPO_BASE;
  }

  return normalizeBase(base);
}

export function stripRepoSegment(path) {
  if (!path || typeof path !== "string") return path;
  // Remove leading repo segment(s) to avoid double-prefixing
  return path
    .replace(new RegExp(`^/?${REPO_SEGMENT}/`, "i"), "")
    .replace(/^\/+/, "");
}

export function joinPath(base, rel) {
  if (!base) base = REPO_BASE;
  if (!rel) return base;
  // If rel is a full URL, return it as-is.
  if (/^(?:[a-z]+:)?\/\//i.test(rel)) return rel;
  let relValue = String(rel);
  const baseValue = String(base);
  const repoToken = `/${REPO_SEGMENT}/`;
  if (baseValue.toLowerCase().includes(repoToken)) {
    const hadLeadingSlash = relValue.startsWith("/");
    const stripped = stripRepoSegment(relValue);
    if (stripped !== relValue) {
      relValue = hadLeadingSlash ? `/${stripped}` : stripped;
    }
  }
  if (relValue.startsWith("/")) {
    if (/^(?:[a-z]+:)?\/\//i.test(base)) {
      try {
        return new URL(relValue, base).toString();
      } catch {
        return relValue;
      }
    }
    return relValue;
  }
  const trimmedRel = relValue.startsWith("/") ? relValue.replace(/^\/+/, "") : relValue;
  const b = base.endsWith("/") ? base : `${base}/`;
  const r = String(trimmedRel).replace(/^\/+/, "");
  return b + r;
}
