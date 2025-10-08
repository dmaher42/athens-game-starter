function getImportMeta() {
  try {
    return import.meta;
  } catch (error) {
    console.debug("import.meta is not available in this environment", error);
    return undefined;
  }
}

function ensureTrailingSlash(value) {
  if (typeof value !== "string" || value.length === 0) return value;
  return value.endsWith("/") ? value : `${value}/`;
}

function deriveBundledBaseUrl() {
  const importMeta = getImportMeta();
  if (!importMeta || typeof importMeta.url !== "string") {
    return null;
  }

  try {
    const bundleUrl = new URL(importMeta.url);
    const { pathname } = bundleUrl;
    const assetsIndex = pathname.lastIndexOf("/assets/");
    if (assetsIndex >= 0) {
      const basePath = pathname.slice(0, assetsIndex + 1);
      return ensureTrailingSlash(basePath);
    }
  } catch (error) {
    console.debug("Failed to derive bundled base URL from import.meta.url", error);
  }

  return null;
}

export function resolveBaseUrl() {
  const importMeta = getImportMeta();
  const envBase = importMeta && importMeta.env ? importMeta.env.BASE_URL : undefined;
  if (typeof envBase === "string" && envBase.length > 0 && envBase !== "/") {
    return ensureTrailingSlash(envBase);
  }

  const bundledBase = deriveBundledBaseUrl();
  if (bundledBase) {
    return bundledBase;
  }

  if (typeof envBase === "string" && envBase.length > 0) {
    return ensureTrailingSlash(envBase);
  }

  if (typeof window !== "undefined" && typeof window.location?.pathname === "string") {
    const { pathname } = window.location;
    if (pathname && pathname !== "") {
      const lastSlash = pathname.lastIndexOf("/");
      if (lastSlash >= 0) {
        return ensureTrailingSlash(pathname.slice(0, lastSlash + 1));
      }
    }
  }

  return "/";
}

export function resolveAbsoluteBaseUrl() {
  const baseUrl = resolveBaseUrl();
  if (typeof window === "undefined" || !window.location?.origin) {
    return new URL(baseUrl, "http://localhost");
  }

  try {
    return new URL(baseUrl, window.location.origin);
  } catch {
    return new URL("/", window.location.origin);
  }
}

