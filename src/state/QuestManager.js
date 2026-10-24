export const QuestStatus = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};

export class QuestManager {
  constructor() {
    this.currentQuest = {
      title: null,
      objective: null,
      status: QuestStatus.NOT_STARTED,
      progress: 0,
      target: 0,
    };

    this.listeners = new Set();
  }

  startQuest(title, firstObjective, target = 0) {
    this.currentQuest.title = title;
    this.currentQuest.objective = firstObjective;
    this.currentQuest.status = QuestStatus.IN_PROGRESS;
    this.currentQuest.progress = 0;
    this.currentQuest.target = target;
    this.notify();
  }

  updateObjective(newObjective) {
    if (this.currentQuest.status !== QuestStatus.IN_PROGRESS) return;
    this.currentQuest.objective = newObjective;
    this.notify();
  }

  updateProgress(value) {
    if (this.currentQuest.status !== QuestStatus.IN_PROGRESS) return;
    this.currentQuest.progress = value;
    
    // Auto-complete if progress reaches target (if target > 0)
    if (this.currentQuest.target > 0 && this.currentQuest.progress >= this.currentQuest.target) {
      this.completeQuest();
    } else {
      this.notify();
    }
  }

  setTarget(value) {
    this.currentQuest.target = value;
    this.notify();
  }

  completeQuest() {
    if (this.currentQuest.status !== QuestStatus.IN_PROGRESS) return;
    this.currentQuest.status = QuestStatus.COMPLETED;
    this.currentQuest.objective = "Quest Completed";
    this.notify();
  }

  clear() {
    this.currentQuest = {
        title: null,
        objective: null,
        status: QuestStatus.NOT_STARTED,
        progress: 0,
        target: 0,
    };
    this.notify();
  }

  // Listener pattern for UI
  subscribe(callback) {
    this.listeners.add(callback);
    callback(this.currentQuest); // Immediate update
    return () => this.listeners.delete(callback);
  }

  notify() {
    for (const cb of this.listeners) {
      cb(this.currentQuest);
    }
  }
}
