// src/utils/baseUrl.js

function normaliseEnvBase(base) {
  if (typeof base !== "string" || base.trim().length === 0) {
    return null;
  }

  const trimmed = base.trim();

  // Absolute URLs (e.g. CDN buckets) should retain their origin.
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      if (!url.pathname.endsWith("/")) {
        const lastSlash = url.pathname.lastIndexOf("/");
        url.pathname = lastSlash >= 0 ? url.pathname.slice(0, lastSlash + 1) : "/";
      }
      return url.toString();
    } catch (_error) {
      // Fall back to treating the value as a plain path when parsing fails.
    }
  }

  // Relative base values like "./" or "/repo/" should resolve to a clean path.
  let relative = trimmed
    .replace(/^\.\/?/, "") // drop leading "./"
    .replace(/^\/+/, ""); // and leading slashes

  if (relative.endsWith("index.html")) {
    relative = relative.slice(0, -"index.html".length);
  }

  if (relative.length > 0 && !relative.endsWith("/")) {
    relative += "/";
  }

  return relative;
}

function resolveFromLocation(loc) {
  if (!loc) return "";

  let path = "";

  if (typeof loc === "string") {
    try {
      const parsed = new URL(loc, typeof window !== "undefined" ? window.location.href : "http://localhost/");
      path = parsed.pathname;
    } catch (_error) {
      path = loc;
    }
  } else if (typeof loc.pathname === "string") {
    path = loc.pathname;
  } else if (typeof loc.href === "string") {
    try {
      const parsed = new URL(loc.href, typeof window !== "undefined" ? window.location.href : "http://localhost/");
      path = parsed.pathname;
    } catch (_error) {
      path = loc.href;
    }
  }

  if (!path) return "";

  // Remove query/hash fragments if a full URL string slipped through.
  const hashIndex = path.indexOf("#");
  if (hashIndex >= 0) {
    path = path.slice(0, hashIndex);
  }
  const queryIndex = path.indexOf("?");
  if (queryIndex >= 0) {
    path = path.slice(0, queryIndex);
  }

  path = path.replace(/^\/+/, "");

  if (path.endsWith("index.html")) {
    path = path.slice(0, -"index.html".length);
  }

  if (path.length > 0 && !path.endsWith("/")) {
    path += "/";
  }

  return path;
}

export function resolveBaseUrl({ env, documentObj, locationObj } = {}) {
  const metaEnv = typeof import.meta !== "undefined" ? import.meta.env : undefined;
  const baseFromEnv = normaliseEnvBase(env?.BASE_URL ?? metaEnv?.BASE_URL);
  if (baseFromEnv !== null) {
    return baseFromEnv;
  }

  const docBase = documentObj?.baseURI ?? (typeof document !== "undefined" ? document.baseURI : undefined);
  const fromDocument = docBase ? resolveFromLocation(docBase) : "";
  if (fromDocument) {
    return fromDocument;
  }

  const loc = locationObj ?? (typeof window !== "undefined" ? window.location : undefined);
  return resolveFromLocation(loc);
}

// Join parts safely without leading/trailing slash duplication.
export function joinPath(...parts) {
  if (!parts || parts.length === 0) return "";

  const cleaned = [];
  let prefix = "";

  parts.forEach((part, index) => {
    if (!part && part !== 0) return;
    let segment = String(part);

    if (index === 0) {
      const absoluteMatch = segment.match(/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//);
      if (absoluteMatch) {
        prefix = absoluteMatch[0];
        segment = segment.slice(prefix.length);
        if (segment.startsWith("/")) {
          prefix += "/";
          segment = segment.replace(/^\/+/, "");
        }
      } else if (segment.startsWith("/")) {
        prefix = "/";
        segment = segment.replace(/^\/+/, "");
      }
    }

    const trimmed = segment.replace(/(^\/+|\/+$)/g, "");
    if (trimmed.length > 0) {
      cleaned.push(trimmed);
    }
  });

  if (cleaned.length === 0) {
    return prefix;
  }

  return `${prefix}${cleaned.join("/")}`;
}
