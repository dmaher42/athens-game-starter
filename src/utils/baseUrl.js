let cachedBaseUrl;

// Preserve the configured public base URL from the environment or document.
export function resolveBaseUrl() {
  if (typeof cachedBaseUrl === "string") {
    return cachedBaseUrl;
  }

  let baseUrl = "";

  if (
    typeof import.meta !== "undefined" &&
    import.meta &&
    import.meta.env &&
    typeof import.meta.env.BASE_URL === "string"
  ) {
    baseUrl = import.meta.env.BASE_URL;
  }

  if (!baseUrl && typeof document !== "undefined") {
    const baseEl = document.querySelector("base[href]");
    if (baseEl) {
      baseUrl = baseEl.getAttribute("href") || "";
    }

    if (!baseUrl && document.baseURI) {
      try {
        baseUrl = new URL(".", document.baseURI).href;
      } catch {
        baseUrl = "";
      }
    }
  }

  if (typeof baseUrl === "string") {
    baseUrl = baseUrl.trim();
  }

  cachedBaseUrl = baseUrl || "";
  return cachedBaseUrl;
}

// Join path segments while respecting absolute prefixes like https:// or /.
export function joinPath(...parts) {
  const filtered = parts.filter((part) => part !== undefined && part !== null && part !== "");
  if (filtered.length === 0) {
    return "";
  }

  let first = String(filtered[0]);
  const rest = filtered.slice(1).map((part) => String(part));

  const protocolMatch = first.match(/^([a-zA-Z][a-zA-Z0-9+.-]*:)(\/\/)?/);
  let prefix = "";

  if (protocolMatch) {
    prefix = protocolMatch[0];
    first = first.slice(prefix.length);
  } else if (first.startsWith("//")) {
    prefix = "//";
    first = first.slice(2);
  } else if (first.startsWith("/")) {
    prefix = "/";
    first = first.replace(/^\/+/, "");
  }

  const segments = [first, ...rest]
    .filter((segment) => segment !== undefined && segment !== null && segment !== "")
    .map((segment) =>
      segment
        .replace(/^\/+/, "")
        .replace(/\/+$/, "")
    )
    .filter((segment) => segment.length > 0);

  if (segments.length === 0) {
    return prefix || "";
  }

  const joined = segments.join("/");
  if (prefix === "/") {
    return `/${joined}`;
  }

  return `${prefix}${joined}`;
}
