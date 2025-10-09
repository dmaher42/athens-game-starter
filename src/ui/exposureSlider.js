import { getUISlot } from "./uiRoot.js";

// Minimal UI overlay for tone mapping exposure (F9 toggles). No deps.
export function mountExposureSlider(renderer, opts = {}) {
  const MIN = opts.min ?? 0.2;
  const MAX = opts.max ?? 2.0;
  const STEP = opts.step ?? 0.01;
  const KEY_TOGGLE = opts.key ?? 'F9';
  const LS_KEY = opts.storageKey ?? 'toneMappingExposure';

  const wrap = document.createElement('div');
  wrap.id = 'tmx-wrap';
  Object.assign(wrap.style, {
    padding: '10px 12px',
    background: 'rgba(0,0,0,0.55)',
    backdropFilter: 'blur(4px)',
    borderRadius: '10px',
    font: '12px/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial',
    color: '#fff',
    userSelect: 'none'
  });

  const label = document.createElement('div');
  label.textContent = 'Exposure';
  label.style.marginBottom = '6px';

  const row = document.createElement('div');
  row.style.display = 'flex';
  row.style.alignItems = 'center';

  const input = document.createElement('input');
  input.type = 'range';
  input.min = String(MIN);
  input.max = String(MAX);
  input.step = String(STEP);
  input.style.width = '140px';

  const value = document.createElement('span');
  value.style.marginLeft = '8px';
  value.style.opacity = '0.8';

  const stored = Number(localStorage.getItem(LS_KEY));
  const initial = Number.isFinite(stored) ? stored : (renderer.toneMappingExposure ?? 1.0);
  const clamp = (x) => Math.min(MAX, Math.max(MIN, x));
  const setExposure = (x) => {
    const v = clamp(Number(x));
    renderer.toneMappingExposure = v;
    input.value = String(v);
    value.textContent = v.toFixed(2);
  };

  setExposure(initial);

  input.addEventListener('input', (e) => setExposure(e.target.value));
  input.addEventListener('change', () => localStorage.setItem(LS_KEY, input.value));

  row.appendChild(input);
  row.appendChild(value);
  wrap.appendChild(label);
  wrap.appendChild(row);
  getUISlot("topRight").appendChild(wrap);

  const onKey = (e) => {
    if (e.key === KEY_TOGGLE) {
      wrap.style.display = wrap.style.display !== 'none' ? 'none' : 'block';
      e.preventDefault();
    }
  };
  window.addEventListener('keydown', onKey);

  return {
    element: wrap, input,
    get value() { return Number(input.value); },
    set value(v) { setExposure(v); },
    dispose() { window.removeEventListener('keydown', onKey); wrap.remove(); }
  };
}
