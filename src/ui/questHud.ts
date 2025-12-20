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
    this.root = document.createElement("div");
    Object.assign(this.root.style, {
      background: "rgba(0, 0, 0, 0.6)",
      color: "#fff",
      padding: "12px",
      borderRadius: "8px",
      backdropFilter: "blur(4px)",
      fontFamily: "ui-sans-serif, system-ui, sans-serif",
      minWidth: "200px",
      display: "none" // Hidden by default until a quest starts
    });

    this.titleEl = document.createElement("div");
    Object.assign(this.titleEl.style, {
      fontWeight: "bold",
      fontSize: "14px",
      marginBottom: "4px",
      color: "#fbbf24" // Amber-400
    });
    this.root.appendChild(this.titleEl);

    this.objectiveEl = document.createElement("div");
    Object.assign(this.objectiveEl.style, {
      fontSize: "13px",
      lineHeight: "1.4",
      opacity: "0.9"
    });
    this.root.appendChild(this.objectiveEl);

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
        this.titleEl.style.color = "#4ade80"; // Green
    } else {
        this.titleEl.style.color = "#fbbf24";
    }
  }
}
