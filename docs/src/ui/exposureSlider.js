import { getUISlot } from "./uiRoot.js";
const DEFAULT_MIN = 0.2;
const DEFAULT_MAX = 2.0;
const DEFAULT_STEP = 0.01;
const DEFAULT_KEY = "F9";
const DEFAULT_STORAGE_KEY = "toneMappingExposure";
// Minimal UI overlay for tone mapping exposure (F9 toggles). No deps.
export function mountExposureSlider(renderer, opts = {}) {
    if (!renderer || typeof document === "undefined") {
        return null;
    }
    const min = Number.isFinite(opts.min) ? Number(opts.min) : DEFAULT_MIN;
    const max = Number.isFinite(opts.max) ? Number(opts.max) : DEFAULT_MAX;
    const step = Number.isFinite(opts.step) ? Number(opts.step) : DEFAULT_STEP;
    const keyToggle = typeof opts.key === "string" && opts.key.trim().length > 0 ? opts.key : DEFAULT_KEY;
    const storageKey = typeof opts.storageKey === "string" && opts.storageKey.trim().length > 0
        ? opts.storageKey
        : DEFAULT_STORAGE_KEY;
    const slot = getUISlot("topRight");
    if (!slot) {
        return null;
    }
    const wrap = document.createElement("div");
    wrap.id = "tmx-wrap";
    Object.assign(wrap.style, {
        padding: "10px 12px",
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(4px)",
        borderRadius: "10px",
        font: "12px/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
        color: "#fff",
        userSelect: "none",
    });
    const label = document.createElement("div");
    label.textContent = "Exposure";
    label.style.marginBottom = "6px";
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.alignItems = "center";
    const input = document.createElement("input");
    input.type = "range";
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.style.width = "140px";
    const value = document.createElement("span");
    value.style.marginLeft = "8px";
    value.style.opacity = "0.8";
    const stored = typeof window !== "undefined" ? Number(window.localStorage?.getItem(storageKey)) : NaN;
    const initial = Number.isFinite(stored) ? stored : renderer.toneMappingExposure ?? 1.0;
    const clamp = (x) => Math.min(max, Math.max(min, x));
    const setExposure = (x) => {
        const v = clamp(Number(x));
        renderer.toneMappingExposure = v;
        input.value = String(v);
        value.textContent = v.toFixed(2);
    };
    setExposure(initial);
    input.addEventListener("input", (event) => {
        const target = event.target;
        if (target) {
            setExposure(target.value);
        }
    });
    input.addEventListener("change", () => {
        if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
            window.localStorage.setItem(storageKey, input.value);
        }
    });
    row.appendChild(input);
    row.appendChild(value);
    wrap.appendChild(label);
    wrap.appendChild(row);
    slot.appendChild(wrap);
    const handleKeydown = (event) => {
        if (event.key === keyToggle) {
            wrap.style.display = wrap.style.display !== "none" ? "none" : "block";
            event.preventDefault();
        }
    };
    if (typeof window !== "undefined") {
        window.addEventListener("keydown", handleKeydown);
    }
    return {
        element: wrap,
        input,
        get value() {
            return Number(input.value);
        },
        set value(v) {
            setExposure(v);
        },
        dispose() {
            if (typeof window !== "undefined") {
                window.removeEventListener("keydown", handleKeydown);
            }
            wrap.remove();
        },
    };
}
