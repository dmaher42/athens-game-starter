export const HOUSEHOLD_ID='olive-house-evening-water';
export const HOUSEHOLD_TITLE='Water for the Evening';
export const HOUSEHOLD_PLANS={courtyard:{label:'Welcome neighbours in the courtyard',outcome:'The water is set beside the courtyard seats. There is room for a neighbour returning from the square.'},room:{label:'A quiet drink in the workroom',outcome:'The water waits by the workroom table. The porter can sit in the shade and the household can finish its work quietly.'}};
const fresh=()=>({version:1,started:false,jar:'shelf',completed:false,lastPlan:null,feedback:''});
export class HouseholdWater{
 constructor(quests){this.quests=quests;this.listeners=new Set();this.s=fresh();const saved=quests.getActivityRecord?.(HOUSEHOLD_ID);if(saved?.version===1){this.s={...this.s,started:!!saved.started,jar:['shelf','empty','full'].includes(saved.jar)?saved.jar:'shelf',completed:!!saved.completed,lastPlan:HOUSEHOLD_PLANS[saved.lastPlan]?saved.lastPlan:null};if(this.s.completed)this.s.jar='shelf';}}
 get active(){return this.quests.activityId===HOUSEHOLD_ID;}
 get objective(){return this.s.completed?'The household has water. Visit the home or arrange another evening.':!this.s.started?'Meet the householder inside Olive Court’s open courtyard.':this.s.jar==='shelf'?'Take the empty household jar from the workroom shelf.':this.s.jar==='empty'?'Carry the jar to Olive Court’s existing fountain, just outside the home.':'Bring the filled jar home. Choose a place for the evening water with the householder.';}
 begin(){if(this.s.completed)return true;if(!this.quests.beginActivity(HOUSEHOLD_ID,HOUSEHOLD_TITLE,this.objective)){this.s.feedback='Pause your current activity first. The household can wait and your progress is safe.';this.emit();return false;}this.s.started=true;this.s.feedback='The gate stays open. You can leave or pause this favour at any time.';this.sync();return true;}
 requireActive(){if(this.active&&!this.s.completed)return true;this.s.feedback='Accept or resume the household favour first.';this.emit();return false;}
 take(){if(!this.requireActive()||this.s.jar!=='shelf')return false;this.s.jar='empty';this.s.feedback='Empty household jar carried. The fountain is in Olive Court, outside the open gate.';this.sync();return true;}
 fill(){if(!this.requireActive())return false;if(this.s.jar!=='empty'){this.s.feedback=this.s.jar==='full'?'The jar is already full. Take it home.':'Take the household jar before filling it.';this.emit();return false;}this.s.jar='full';this.s.feedback='The jar is full. The householder can set it in the courtyard or the covered workroom.';this.sync();return true;}
 deliver(plan){if(!this.requireActive()||!HOUSEHOLD_PLANS[plan])return false;if(this.s.jar!=='full'){this.s.feedback='Bring the filled household jar home first.';this.emit();return false;}this.s.completed=true;this.s.jar='shelf';this.s.lastPlan=plan;this.s.feedback=HOUSEHOLD_PLANS[plan].outcome;this.save();this.quests.completeQuest(HOUSEHOLD_ID);this.quests.endActivity(HOUSEHOLD_ID);this.emit();return true;}
 leave(){this.quests.endActivity(HOUSEHOLD_ID);this.s.feedback='Favour paused. Your jar and preparations are kept; return to the household to resume.';this.save();this.emit();}
 replay(){if(this.quests.activityId&&!this.active)return false;const lastPlan=this.s.lastPlan;this.quests.endActivity(HOUSEHOLD_ID);this.s={...fresh(),lastPlan};this.save();this.emit();return true;}
 save(){this.quests.saveActivityRecord?.(HOUSEHOLD_ID,this.s);}
 sync(){this.save();if(this.active)this.quests.updateObjective(this.objective,HOUSEHOLD_ID);this.emit();}
 snapshot(){return{...this.s,active:this.active,objective:this.objective,saved:!!this.quests.activityStorageAvailable,carrying:this.s.jar==='empty'?'Empty household jar':this.s.jar==='full'?'Filled household jar':null};}
 subscribe(fn){this.listeners.add(fn);fn(this.snapshot());return()=>this.listeners.delete(fn);}
 emit(){const s=this.snapshot();for(const fn of this.listeners)fn(s);}
}
