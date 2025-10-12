// src/utils/baseUrl.js
const REPO_SEGMENT = "athens-game-starter";

function hasRepoSegment(path) {
  return typeof path === "string" && path.includes(`/${REPO_SEGMENT}/`);
}

function normalizeBase(path) {
  if (!path) return "/";
  return path.endsWith("/") ? path : path + "/";
}

function deriveBaseFromPath(path) {
  if (typeof path !== "string" || !path.length) return null;
  const idx = path.indexOf(`/${REPO_SEGMENT}/`);
  if (idx !== -1) {
    return path.slice(0, idx + REPO_SEGMENT.length + 2);
  }
  return path.endsWith("/") ? path : path.replace(/[^/]*$/, "/");
}

function findDerivedBase() {
  if (typeof document === "undefined" && typeof window === "undefined") {
    return null;
  }

  const candidates = [];

  if (typeof document !== "undefined") {
    const { currentScript, baseURI } = document;
    if (currentScript && currentScript.src) {
      try {
        const scriptUrl = new URL(
          currentScript.src,
          baseURI || (typeof window !== "undefined" && window.location ? window.location.href : undefined)
        );
        candidates.push(scriptUrl.pathname);
      } catch (err) {
        // Ignore resolution errors and keep trying other candidates.
      }
    }

    if (baseURI) {
      try {
        candidates.push(new URL(baseURI).pathname);
      } catch (err) {
        // Ignore and continue.
      }
    }
  }

  if (typeof window !== "undefined" && window.location) {
    candidates.push(window.location.pathname);
  }

  for (const candidate of candidates) {
    const base = deriveBaseFromPath(candidate);
    if (hasRepoSegment(base)) {
      return normalizeBase(base);
    }
  }

  return candidates.length ? normalizeBase(deriveBaseFromPath(candidates[0])) : null;
}

export function resolveBaseUrl() {
  const viteBase =
    (typeof import.meta !== "undefined" &&
      import.meta.env &&
      import.meta.env.BASE_URL) ||
    "/";
  const globalBase =
    (typeof window !== "undefined" && window.__BASE_URL__) || null;

  let base = globalBase || viteBase || "/";

  if (!hasRepoSegment(base)) {
    const derived = findDerivedBase();
    if (derived) {
      base = derived;
    }
  }

  const normalizedBase = normalizeBase(base);

  if (typeof window !== "undefined" && window.location) {
    const onGithubPages = /github\.io$/i.test(window.location.hostname);
    if (onGithubPages) {
      console.assert(
        hasRepoSegment(normalizedBase),
        `Expected base URL to include "/${REPO_SEGMENT}/" when hosted on GitHub Pages, but received "${normalizedBase}".`
      );
    }
  }

  return normalizedBase;
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
