import type { LoadingScreenOptions } from "@app/types";

const STYLE_ID = "athens-loading-style" as const;
const ROOT_ID = "athens-loading-screen" as const;
const FACT_INTERVAL_MS = 6000;

const DEFAULT_FACTS: readonly string[] = [
  "The Parthenon crowned the Acropolis as a temple to Athena Parthenos, the city's patron goddess.",
  "Citizens of Athens met in the Agora to debate policy, trade goods, and celebrate civic festivals.",
  "Classical Athenian democracy let eligible citizens vote directly on laws in the Ekklesia assembly.",
  "Swift trireme warships helped Athens command the Aegean Sea during the Delian League era.",
  "The Panathenaic Festival honored Athena with torch races, music, and a grand procession to the Acropolis.",
  "Playwrights like Sophocles and Euripides premiered tragedies for thousands in Athens' Theater of Dionysus.",
  "The philosopher Socrates spent his life in Athens asking probing questions about virtue and wisdom.",
  "Stone-cut terraces of the Acropolis blended natural rock with human craftsmanship to elevate sacred spaces.",
];

let rootEl: HTMLElement | null = null;
let statusEl: HTMLElement | null = null;
let factEl: HTMLElement | null = null;
let factLabelEl: HTMLElement | null = null;
let factTimer: number | null = null;
let facts: readonly string[] = DEFAULT_FACTS;
let factIndex = 0;

function ensureStyles(): void {
  if (typeof document === "undefined") {
    return;
  }
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    #${ROOT_ID} {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at center, rgba(15, 22, 43, 0.95), rgba(6, 9, 18, 0.98));
      color: #f1f5ff;
      z-index: 2000;
      transition: opacity 0.4s ease;
      font-family: "Segoe UI", "Helvetica Neue", sans-serif;
    }
    #${ROOT_ID}.is-hidden {
      opacity: 0;
      pointer-events: none;
    }
    #${ROOT_ID} .athens-loading__panel {
      max-width: min(480px, 92vw);
      text-align: center;
      padding: clamp(20px, 4vw, 36px);
      border-radius: 18px;
      background: rgba(7, 10, 22, 0.75);
      box-shadow: 0 28px 80px rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(6px);
      display: grid;
      gap: clamp(12px, 3vw, 20px);
      justify-items: center;
    }
    #${ROOT_ID} .athens-loading__spinner {
      width: clamp(46px, 10vw, 64px);
      height: clamp(46px, 10vw, 64px);
      border-radius: 999px;
      border: 4px solid rgba(255, 255, 255, 0.18);
      border-top-color: #f7d774;
      animation: athens-spin 1.1s linear infinite;
    }
    #${ROOT_ID}.is-error .athens-loading__spinner {
      border-top-color: #ffb4a2;
    }
    #${ROOT_ID} .athens-loading__title {
      font-size: clamp(20px, 5vw, 28px);
      margin: 0;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    #${ROOT_ID} .athens-loading__status {
      margin: 0;
      font-size: clamp(16px, 4vw, 18px);
      line-height: 1.5;
      color: rgba(240, 244, 255, 0.92);
    }
    #${ROOT_ID}.is-error .athens-loading__status {
      color: #ffd9d0;
    }
    #${ROOT_ID} .athens-loading__fact-label {
      text-transform: uppercase;
      letter-spacing: 0.2em;
      font-size: 12px;
      color: rgba(240, 244, 255, 0.6);
    }
    #${ROOT_ID}.is-error .athens-loading__fact-label {
      color: rgba(255, 217, 208, 0.75);
    }
    #${ROOT_ID} .athens-loading__fact {
      margin: 0;
      font-size: clamp(15px, 4vw, 17px);
      line-height: 1.6;
      color: rgba(241, 245, 255, 0.85);
    }
    @keyframes athens-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

function createRoot(): HTMLElement | null {
  if (typeof document === "undefined") {
    return null;
  }
  ensureStyles();
  const root = document.createElement("div");
  root.id = ROOT_ID;
  root.setAttribute("role", "status");
  root.setAttribute("aria-live", "polite");
  root.innerHTML = `
    <div class="athens-loading__panel">
      <div class="athens-loading__spinner" aria-hidden="true"></div>
      <h1 class="athens-loading__title">Exploring Ancient Athens</h1>
      <p class="athens-loading__status">Preparing the experience...</p>
      <div class="athens-loading__fact-label">Did you know?</div>
      <p class="athens-loading__fact"></p>
    </div>
  `;
  document.body.appendChild(root);
  rootEl = root;
  statusEl = root.querySelector<HTMLElement>(".athens-loading__status");
  factEl = root.querySelector<HTMLElement>(".athens-loading__fact");
  factLabelEl = root.querySelector<HTMLElement>(".athens-loading__fact-label");
  return root;
}

function stopFactRotation(): void {
  if (factTimer !== null && typeof window !== "undefined") {
    window.clearInterval(factTimer);
    factTimer = null;
  }
}

function setFactText(text: string): void {
  if (!factEl) return;
  factEl.textContent = text;
}

function nextFact(): void {
  if (!facts.length) {
    setFactText("");
    return;
  }
  factIndex = (factIndex + 1) % facts.length;
  const next = facts[factIndex] ?? "";
  setFactText(next);
}

function startFactRotation(): void {
  stopFactRotation();
  if (typeof window === "undefined") {
    setFactText(facts[0] || "");
    return;
  }
  if (!factEl || facts.length <= 1) {
    setFactText(facts[0] || "");
    return;
  }
  const current = facts[factIndex] ?? "";
  setFactText(current);
  factTimer = window.setInterval(() => {
    nextFact();
  }, FACT_INTERVAL_MS);
}

function ensureFactList(customFacts: LoadingScreenOptions["facts"]): void {
  if (Array.isArray(customFacts) && customFacts.length) {
    facts = customFacts.filter(
      (fact): fact is string => typeof fact === "string" && fact.trim().length > 0,
    );
  } else {
    facts = DEFAULT_FACTS;
  }
  if (!facts.length) {
    facts = DEFAULT_FACTS;
  }
  if (typeof Math.random === "function") {
    factIndex = Math.floor(Math.random() * facts.length);
  } else {
    factIndex = 0;
  }
}

export function showLoadingScreen({ facts: customFacts, initialStatus }: LoadingScreenOptions = {}): void {
  if (typeof document === "undefined") {
    return;
  }
  if (!rootEl) {
    createRoot();
  }
  ensureFactList(customFacts);
  if (initialStatus) {
    updateLoadingStatus(initialStatus);
  } else {
    updateLoadingStatus("Preparing the experience...");
  }
  if (rootEl) {
    rootEl.classList.remove("is-hidden", "is-error");
    rootEl.style.opacity = "1";
  }
  startFactRotation();
}

export function updateLoadingStatus(message: string): void {
  if (!rootEl || !statusEl) return;
  if (typeof message === "string" && message.trim().length) {
    statusEl.textContent = message;
  }
}

export function showLoadingError(message?: string): void {
  if (typeof document === "undefined") {
    return;
  }
  if (!rootEl) {
    showLoadingScreen();
  }
  if (!rootEl) return;
  stopFactRotation();
  rootEl.classList.add("is-error");
  updateLoadingStatus(message || "We couldn't finish loading Athens. Please refresh to try again.");
  if (factLabelEl) {
    factLabelEl.textContent = "What went wrong?";
  }
  if (factEl) {
    factEl.textContent = "Check your connection and reload the page to continue exploring.";
  }
}

export function hideLoadingScreen(): void {
  if (!rootEl) return;
  rootEl.classList.add("is-hidden");
  stopFactRotation();
  const elementToRemove = rootEl;
  rootEl = null;
  statusEl = null;
  factEl = null;
  factLabelEl = null;
  if (typeof window !== "undefined") {
    window.setTimeout(() => {
      elementToRemove.remove();
    }, 400);
  } else {
    elementToRemove.remove();
  }
}
