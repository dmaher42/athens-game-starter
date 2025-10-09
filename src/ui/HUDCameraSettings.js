// HUDCameraSettings: lightweight HUD panel for camera tuning
import {
  loadSettings,
  saveSettings,
  subscribe,
  defaultCameraSettings,
} from "../state/settingsStore.js";

const RANGE_CONFIG = {
  yawSpeed: { min: 0.1, max: 2.0, step: 0.05, label: "Yaw Speed", suffix: "rad/s" },
  pitchSpeed: { min: 0.1, max: 2.0, step: 0.05, label: "Pitch Speed", suffix: "rad/s" },
  zoomSpeed: { min: 0.5, max: 8.0, step: 0.1, label: "Zoom Speed", suffix: "u/s" },
  minPitch: { min: -1.0, max: 0.0, step: 0.01, label: "Min Pitch", suffix: "rad" },
  maxPitch: { min: 0.0, max: 1.0, step: 0.01, label: "Max Pitch", suffix: "rad" },
  minDist: { min: 1.5, max: 6.0, step: 0.1, label: "Min Distance", suffix: "m" },
  maxDist: { min: 4.0, max: 12.0, step: 0.1, label: "Max Distance", suffix: "m" },
};

const formatValue = (value, suffix = "") => {
  if (!Number.isFinite(value)) return `0${suffix ? " " + suffix : ""}`;
  const abs = Math.abs(value);
  const decimals = abs >= 10 ? 1 : 2;
  const text = value.toFixed(decimals);
  return suffix ? `${text} ${suffix}` : text;
};

function createSlider(key, config, onInput) {
  const wrapper = document.createElement("div");
  Object.assign(wrapper.style, {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  });

  const labelRow = document.createElement("div");
  Object.assign(labelRow.style, {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    opacity: "0.85",
  });

  const label = document.createElement("span");
  label.textContent = config.label;
  labelRow.appendChild(label);

  const valueEl = document.createElement("span");
  valueEl.style.fontVariantNumeric = "tabular-nums";
  valueEl.style.opacity = "0.9";
  labelRow.appendChild(valueEl);

  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = String(config.min);
  slider.max = String(config.max);
  slider.step = String(config.step);
  slider.name = key;
  slider.setAttribute("aria-label", config.label);
  Object.assign(slider.style, {
    width: "100%",
  });

  slider.addEventListener("input", () => {
    const value = Number.parseFloat(slider.value);
    valueEl.textContent = formatValue(value, config.suffix);
    onInput(key, value);
  });

  wrapper.appendChild(labelRow);
  wrapper.appendChild(slider);

  return { wrapper, slider, valueEl };
}

function createCheckbox(labelText, key, onChange) {
  const wrapper = document.createElement("label");
  Object.assign(wrapper.style, {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    fontSize: "12px",
    opacity: "0.9",
  });

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.name = key;
  checkbox.addEventListener("change", () => {
    onChange(key, checkbox.checked);
  });

  const text = document.createElement("span");
  text.textContent = labelText;

  wrapper.appendChild(checkbox);
  wrapper.appendChild(text);

  return { wrapper, checkbox };
}

export function mount(rootEl) {
  if (!(rootEl instanceof HTMLElement)) {
    return { dispose() {} };
  }

  const state = {
    settings: loadSettings(),
    disposed: false,
  };

  const section = document.createElement("section");
  section.className = "hud-camera-settings";
  Object.assign(section.style, {
    marginTop: "8px",
    paddingTop: "8px",
    borderTop: "1px solid rgba(255,255,255,0.15)",
    pointerEvents: "auto",
  });

  const header = document.createElement("div");
  Object.assign(header.style, {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
  });

  const title = document.createElement("span");
  title.textContent = "Camera";
  Object.assign(title.style, {
    fontWeight: 600,
    letterSpacing: "0.08em",
    fontSize: "11px",
    textTransform: "uppercase",
    opacity: "0.85",
  });

  const toggleButton = document.createElement("button");
  toggleButton.type = "button";
  toggleButton.setAttribute("aria-expanded", "false");
  toggleButton.title = "Camera settings";
  toggleButton.setAttribute("aria-label", "Camera settings");
  toggleButton.textContent = "⚙";
  Object.assign(toggleButton.style, {
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.4)",
    background: "rgba(0,0,0,0.35)",
    color: "inherit",
    fontSize: "12px",
    lineHeight: "1",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
    padding: "0",
  });

  const panel = document.createElement("div");
  Object.assign(panel.style, {
    marginTop: "8px",
    padding: "8px",
    borderRadius: "6px",
    background: "rgba(0,0,0,0.35)",
    backdropFilter: "blur(4px)",
    maxHeight: "260px",
    overflowY: "auto",
    display: "none",
  });

  const controls = {};
  const slidersContainer = document.createElement("div");
  Object.assign(slidersContainer.style, {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  });

  const onSliderInput = (key, value) => {
    if (state.disposed) return;
    saveSettings({ [key]: value });
  };

  for (const key of [
    "yawSpeed",
    "pitchSpeed",
    "zoomSpeed",
    "minPitch",
    "maxPitch",
    "minDist",
    "maxDist",
  ]) {
    const config = RANGE_CONFIG[key];
    const slider = createSlider(key, config, onSliderInput);
    controls[key] = slider;
    slidersContainer.appendChild(slider.wrapper);
  }

  const toggles = document.createElement("div");
  Object.assign(toggles.style, {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "8px",
  });

  const enableCheckbox = createCheckbox(
    "Enable Arrow Orbit",
    "enableArrowOrbit",
    (key, checked) => {
      if (state.disposed) return;
      saveSettings({ [key]: checked });
    }
  );
  const invertCheckbox = createCheckbox(
    "Invert Pitch",
    "invertPitch",
    (key, checked) => {
      if (state.disposed) return;
      saveSettings({ [key]: checked });
    }
  );

  toggles.appendChild(enableCheckbox.wrapper);
  toggles.appendChild(invertCheckbox.wrapper);

  panel.appendChild(toggles);
  panel.appendChild(slidersContainer);

  header.appendChild(title);
  header.appendChild(toggleButton);

  section.appendChild(header);
  section.appendChild(panel);

  const applySettingsToUI = (settings) => {
    state.settings = settings;
    enableCheckbox.checkbox.checked = settings.enableArrowOrbit;
    invertCheckbox.checkbox.checked = settings.invertPitch;

    for (const key of Object.keys(RANGE_CONFIG)) {
      const control = controls[key];
      if (!control) continue;
      const value = settings[key] ?? defaultCameraSettings[key];
      control.slider.value = String(value);
      control.valueEl.textContent = formatValue(value, RANGE_CONFIG[key].suffix);
    }
  };

  const togglePanel = () => {
    const isVisible = panel.style.display !== "none";
    if (isVisible) {
      panel.style.display = "none";
      toggleButton.setAttribute("aria-expanded", "false");
    } else {
      panel.style.display = "block";
      toggleButton.setAttribute("aria-expanded", "true");
    }
  };

  const onToggleClick = (event) => {
    event.preventDefault();
    togglePanel();
  };
  toggleButton.addEventListener("click", onToggleClick);

  const unsubscribe = subscribe((next) => {
    if (state.disposed) return;
    applySettingsToUI(next);
  });

  applySettingsToUI(state.settings);

  rootEl.appendChild(section);

  return {
    dispose() {
      if (state.disposed) return;
      state.disposed = true;
      unsubscribe?.();
      toggleButton.removeEventListener("click", onToggleClick);
      section.remove();
    },
  };
}

export default { mount };
