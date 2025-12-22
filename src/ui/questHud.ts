import { createHudPanel } from "./hudShared.js";
import { getUISlot } from "./uiRoot.js";

// Basic interface for what we expect from QuestManager (avoiding circular imports or complex types for now)
interface QuestState {
  title: string | null;
  objective: string | null;
  status: string;
}

interface QuestManager {
  subscribe(callback: (state: QuestState) => void): () => void;
}

export class QuestHud {
  private root: HTMLElement;
  private titleEl: HTMLElement;
  private objectiveEl: HTMLElement;

  constructor(questManager: QuestManager) {
    ensureQuestStyles();

    const panel = createHudPanel({
      title: "Active Quest",
      className: "quest-hud",
      toggleLabels: { expanded: "Hide", collapsed: "Show" },
    });

    this.root = panel.root;
    this.root.style.display = "none"; // Hidden by default until a quest starts

    this.titleEl = document.createElement("div");
    this.titleEl.className = "quest-hud__title";
    panel.content.appendChild(this.titleEl);

    this.objectiveEl = document.createElement("div");
    this.objectiveEl.className = "quest-hud__objective";
    panel.content.appendChild(this.objectiveEl);

    const slot = getUISlot("topLeft");
    if (slot) slot.appendChild(this.root);

    // Subscribe to updates
    if (questManager) {
      questManager.subscribe(this.update.bind(this));
    }
  }

  update(questState: QuestState) {
    if (!questState || questState.status === 'Not Started' || !questState.title) {
      this.root.style.display = "none";
      return;
    }

    this.root.style.display = "block";
    this.titleEl.textContent = questState.title || "";
    this.objectiveEl.textContent = questState.objective || "";

    if (questState.status === 'Completed') {
        this.root.classList.add("quest-hud--completed");
    } else {
        this.root.classList.remove("quest-hud--completed");
    }
  }
}

function ensureQuestStyles(): void {
  if (typeof document === "undefined") return;
  const existing = document.getElementById("quest-hud-style");
  if (existing) return;
  const style = document.createElement("style");
  style.id = "quest-hud-style";
  style.textContent = `
    .quest-hud { min-width: 220px; }
    .quest-hud__title {
      font-weight: 700;
      font-size: 14px;
      margin-bottom: 4px;
      color: #fbbf24;
    }
    .quest-hud__objective {
      font-size: 13px;
      line-height: 1.4;
      opacity: 0.9;
    }
    .quest-hud--completed .quest-hud__title { color: #4ade80; }
  `;
  document.head.appendChild(style);
}
