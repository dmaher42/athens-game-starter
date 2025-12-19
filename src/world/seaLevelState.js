export const DEFAULT_SEA_LEVEL_Y = 4.5;

const parseValidNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const detectExistingSeaLevel = () => {
  if (typeof globalThis !== "undefined") {
    if (typeof globalThis.SEA_LEVEL_Y !== "undefined") {
      const override = parseValidNumber(globalThis.SEA_LEVEL_Y);
      if (typeof override !== "undefined") {
        return override;
      }
    }

    const location = globalThis.location;
    if (location && typeof location === "object") {
      const { search } = location;
      if (typeof search === "string" && search.length > 0) {
        try {
          const params = new URLSearchParams(
            search.startsWith("?") ? search : `?${search}`,
          );
          const paramValue = params.get("sea");
          const parsedParam = parseValidNumber(paramValue);
          if (typeof parsedParam !== "undefined") {
            return parsedParam;
          }
        } catch (error) {
          // Ignore malformed query strings or missing URLSearchParams
        }
      }
    }
  }

  return undefined;
};

const listeners = new Set();
const existing = detectExistingSeaLevel();
export const SEA_LEVEL_Y =
  typeof existing !== "undefined" ? existing : DEFAULT_SEA_LEVEL_Y;

let seaLevelY = SEA_LEVEL_Y;

if (typeof globalThis !== "undefined") {
  globalThis.SEA_LEVEL_Y = seaLevelY;
}

export function getSeaLevelY() {
  return seaLevelY;
}

export function setSeaLevelY(nextValue, options = {}) {
  const parsed = Number(nextValue);
  if (!Number.isFinite(parsed)) {
    return false;
  }

  if (parsed === seaLevelY) {
    return false;
  }

  const previous = seaLevelY;
  seaLevelY = parsed;
  if (typeof globalThis !== "undefined") {
    globalThis.SEA_LEVEL_Y = parsed;
  }

  listeners.forEach((listener) => {
    try {
      listener(parsed, previous, options);
    } catch (error) {
      if (import.meta.env?.DEV) {
        console.warn("[seaLevel] listener error", error);
      }
    }
  });

  if (import.meta.env?.DEV) {
    const reason = options?.reason ? ` (${options.reason})` : "";
    console.info(
      `[seaLevel] level changed from ${previous.toFixed(3)} to ${parsed.toFixed(3)}${reason}`,
    );
  }

  return true;
}

export function subscribeSeaLevelChange(listener) {
  if (typeof listener !== "function") {
    return () => {};
  }

  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export { DEFAULT_SEA_LEVEL_Y };
