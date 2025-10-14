const envFlag =
  (typeof import.meta !== "undefined" && import.meta.env?.DEBUG_HARBOR === "1") ||
  (typeof process !== "undefined" && process.env?.DEBUG_HARBOR === "1");

const urlFlag =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).get("DEBUG_HARBOR") === "1";

export const DEBUG_FLAGS = {
  harbor: Boolean(envFlag || urlFlag),
};
