export const QuestStatus = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};

export class QuestManager {
  constructor(options = {}) {
    this.activityRecords = {};
    this.rewardRecords = {};
    this.activityStorage = null;
    this.activityStorageAvailable = false;
    try {
      this.activityStorage = options.storage ?? (typeof window !== 'undefined' ? window.localStorage : null);
      const raw=this.activityStorage?.getItem('athens.activities.v1');
      const saved=raw&&raw.length<100000?JSON.parse(raw):null;
      if(saved?.version===1){
        this.activityRecords=saved.activities&&typeof saved.activities==='object'?saved.activities:{};
        this.rewardRecords=Object.fromEntries(Object.entries(saved.rewards||{}).filter(([id,r])=>/^[a-z0-9-]+$/.test(id)&&r?.type==='gold'&&r?.amount===1));
      }
      this.activityStorageAvailable=!!this.activityStorage;
    } catch { this.activityStorageAvailable=false; }
    this.currentQuest = {
      title: null,
      objective: null,
      status: QuestStatus.NOT_STARTED,
      progress: 0,
      target: 0,
    };

    this.listeners = new Set();
    this.activityId = null;
    this.suspendedQuest = null;
    this.queuedQuest = null;
  }

  startQuest(title, firstObjective, target = 0) {
    // Preserve delayed legacy follow-ups while an evidence activity owns the HUD.
    if (this.activityId) {
      this.queuedQuest = { title, objective: firstObjective, target, progress: 0, status: QuestStatus.IN_PROGRESS };
      return;
    }
    this.currentQuest.title = title;
    this.currentQuest.objective = firstObjective;
    this.currentQuest.status = QuestStatus.IN_PROGRESS;
    this.currentQuest.progress = 0;
    this.currentQuest.target = target;
    this.notify();
  }

  updateObjective(newObjective, owner = null) {
    if (!this.canWrite(owner)) return;
    if (this.currentQuest.status !== QuestStatus.IN_PROGRESS) return;
    this.currentQuest.objective = newObjective;
    this.notify();
  }

  updateProgress(value, owner = null) {
    if (!this.canWrite(owner)) return;
    if (this.currentQuest.status !== QuestStatus.IN_PROGRESS) return;
    this.currentQuest.progress = value;
    
    // Auto-complete if progress reaches target (if target > 0)
    if (this.currentQuest.target > 0 && this.currentQuest.progress >= this.currentQuest.target) {
      this.completeQuest(owner);
    } else {
      this.notify();
    }
  }

  // Collecting an existing quest item during an activity must still count.
  // Update its suspended/queued quest without changing the displayed activity.
  recordProgress(title, value) {
    const quest = this.activityId
      ? [this.queuedQuest, this.suspendedQuest].find(entry => entry?.title === title)
      : this.currentQuest;
    if (!quest || quest.title !== title || quest.status !== QuestStatus.IN_PROGRESS) return false;
    const completed = quest.target > 0 && value >= quest.target;
    if (quest === this.currentQuest) this.updateProgress(value);
    else {
      quest.progress = value;
      if (completed) { quest.status = QuestStatus.COMPLETED; quest.objective = 'Quest Completed'; }
    }
    return completed;
  }
  setTarget(value, owner = null) {
    if (!this.canWrite(owner)) return;
    this.currentQuest.target = value;
    this.notify();
  }

  completeQuest(owner = null) {
    if (!this.canWrite(owner)) return;
    if (this.currentQuest.status !== QuestStatus.IN_PROGRESS) return;
    this.currentQuest.status = QuestStatus.COMPLETED;
    this.currentQuest.objective = "Quest Completed";
    this.notify();
  }

  clear(owner = null) {
    if (!this.canWrite(owner)) return;
    this.currentQuest = {
        title: null,
        objective: null,
        status: QuestStatus.NOT_STARTED,
        progress: 0,
        target: 0,
    };
    this.notify();
  }

  // One objective owner at a time. Activity evidence remains domain state;
  // suspension/restoration of the previous quest remains here.
  canWrite(owner) {
    return !this.activityId || this.activityId === owner;
  }

  beginActivity(id, title, objective) {
    if (!id || (this.activityId && this.activityId !== id)) return false;
    if (!this.activityId) this.suspendedQuest = { ...this.currentQuest };
    this.activityId = id;
    this.currentQuest = { title, objective, status: QuestStatus.IN_PROGRESS, progress: 0, target: 0 };
    this.notify();
    return true;
  }

  endActivity(id) {
    if (this.activityId !== id) return false;
    this.activityId = null;
    this.currentQuest = this.queuedQuest || this.suspendedQuest || {
      title: null, objective: null, status: QuestStatus.NOT_STARTED, progress: 0, target: 0,
    };
    this.queuedQuest = null;
    this.suspendedQuest = null;
    this.notify();
    return true;
  }
  // Optional activity progress belongs to the existing quest owner. Legacy
  // quests/collectibles are not silently turned into a new global save format.
  getActivityRecord(id) { return this.activityRecords[id] ? JSON.parse(JSON.stringify(this.activityRecords[id])) : null; }
  saveActivityRecord(id, data) {
    if(!/^[a-z0-9-]+$/.test(id))return false;
    this.activityRecords[id]=JSON.parse(JSON.stringify(data));return this.persistActivities();
  }
  persistActivities(){
    try{if(!this.activityStorage)return false;this.activityStorage.setItem('athens.activities.v1',JSON.stringify({version:1,activities:this.activityRecords,rewards:this.rewardRecords}));this.activityStorageAvailable=true;return true;}
    catch{this.activityStorageAvailable=false;return false;}
  }
  claimActivityReward(id){
    if(!/^[a-z0-9-]+$/.test(id)||this.rewardRecords[id])return false;
    this.rewardRecords[id]={type:'gold',amount:1};this.persistActivities();return true;
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
