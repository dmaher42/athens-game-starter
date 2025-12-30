function isDebugRenderEnabled() {
  const isDev = typeof import.meta !== "undefined" && Boolean(false);
  if (!isDev) return false;
  try {
    if (typeof window !== "undefined" && window.location && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      if (params.has("debugRender")) {
        const v = params.get("debugRender");
        return v === null || String(v) === "1" || String(v).toLowerCase() === "true";
      }
    }
  } catch {
  }
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const stored = window.localStorage.getItem("debugRender");
      if (stored != null) {
        return stored === "1" || String(stored).toLowerCase() === "true";
      }
    }
  } catch {
  }
  try {
    if (typeof window !== "undefined" && typeof window.DEBUG_RENDER === "boolean") {
      return window.DEBUG_RENDER;
    }
  } catch {
  }
  return false;
}
function enableDebugRenderPersistent(value = true) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem("debugRender", value ? "1" : "0");
    }
  } catch {
  }
}
export {
  enableDebugRenderPersistent,
  isDebugRenderEnabled
};
//# sourceMappingURL=debugFlags-Injbs8ne.js.map
