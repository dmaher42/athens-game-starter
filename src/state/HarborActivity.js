export const HARBOR_ACTIVITY_ID = 'harbor-food-supply';
export const HARBOR_ACTIVITY_TITLE = 'Which ship feeds Athens?';
export const HARBOR_EVIDENCE = {
 merchant: {
  title: 'Merchant ship: cargo and capacity',
  observed: 'Look at the broad hull, roomy cargo hold, sacks and amphoras.',
  history: 'Greek merchant ships transported goods. Athens imported grain to help feed its population.',
  inference: 'A broad cargo ship is suited to carrying bulky food supplies.',
  caution: 'The sacks and cargo arrangement are an invented teaching example, not an excavated manifest.'
 },
 trireme: {
  title: 'Trireme: oars and warfare',
  observed: 'Look for the narrow hull, bronze ram and three tiers of oars.',
  history: 'The ancient Lenormant Relief depicts a trireme with three rows of oars. Triremes served as warships.',
  inference: 'Oars and a ram support speed and fighting; they do not make this the best bulk cargo carrier.',
  caution: 'This is a schematic model. Its dimensions and moored arrangement are not an exact reconstruction.'
 }
};

// Domain evidence state feeds the existing QuestManager. It does not own a
// second quest engine, save system, input loop or rendering loop.
export class HarborEvidenceActivity {
 constructor(questManager) { this.quests=questManager;this.seen=new Set();this.ship=null;this.completed=false;this.feedback='';this.listeners=new Set(); }
 get active(){return this.quests.activityId===HARBOR_ACTIVITY_ID;}
 get stage(){return this.completed?'complete':this.seen.size<2?'inspect':this.ship!=='merchant'?'choose':'explain';}
 get objective(){return this.stage==='inspect'?`Inspect both ships (${this.seen.size}/2). Follow the pier to the merchant, then the stone quay to the trireme.`:this.stage==='choose'?'Choose the ship suited to an imported grain shipment.':this.stage==='explain'?'Explain why sea trade mattered to Athens.':'Evidence used: merchant capacity, trireme purpose and imported food supply.';}
 start(){
  if(!this.active && !this.quests.beginActivity(HARBOR_ACTIVITY_ID,HARBOR_ACTIVITY_TITLE,this.objective))return false;
  this.quests.updateObjective(this.objective,HARBOR_ACTIVITY_ID);
  if(this.completed)this.quests.completeQuest(HARBOR_ACTIVITY_ID);
  this.emit();return true;
 }
 inspect(id){if(!HARBOR_EVIDENCE[id]||!this.start())return false;this.seen.add(id);this.feedback=this.seen.size===2?'You have inspected both ships. Now use their features to choose.':'Evidence recorded. Inspect the other ship before deciding.';this.sync();return true;}
 chooseShip(id){
  if(!this.active)return false;
  if(this.seen.size<2){this.feedback='Inspect the merchant cargo and the trireme oars first. Your choice must use both pieces of evidence.';this.emit();return false;}
  this.ship=id;
  this.feedback=id==='merchant'?'The broad hold provides cargo space. Next explain why that matters for Athens.':'A trireme was a warship. Compare its narrow hull and ram with the merchant ship\'s cargo hold, then try again.';
  this.sync();return id==='merchant';
 }
 explain(id){
  if(!this.active||this.seen.size<2||this.ship!=='merchant'){this.feedback='First inspect both ships and choose the vessel suited to bulk cargo.';this.emit();return false;}
  if(id!=='food-supply'){this.feedback=id==='only-war'?'Warships mattered, but this question is about food. Which ship has cargo space, and why did Athens need grain imports?':'Try connecting the roomy hold to food supply. Imports brought grain that helped feed people in Athens.';this.emit();return false;}
  this.completed=true;this.feedback='Completed: you used ship features as evidence and explained that sea trade brought grain to help feed Athens.';this.quests.updateObjective(this.objective,HARBOR_ACTIVITY_ID);this.quests.completeQuest(HARBOR_ACTIVITY_ID);this.emit();return true;
 }
 leave(){this.quests.endActivity(HARBOR_ACTIVITY_ID);this.emit();}
 reset(){this.seen.clear();this.ship=null;this.completed=false;this.feedback='A fresh comparison: inspect both ships again.';this.quests.beginActivity(HARBOR_ACTIVITY_ID,HARBOR_ACTIVITY_TITLE,this.objective);this.sync();}
 sync(){this.quests.updateObjective(this.objective,HARBOR_ACTIVITY_ID);this.emit();}
 snapshot(){return {id:HARBOR_ACTIVITY_ID,title:HARBOR_ACTIVITY_TITLE,active:this.active,stage:this.stage,observed:[...this.seen],ship:this.ship,completed:this.completed,objective:this.objective,feedback:this.feedback};}
 subscribe(listener){this.listeners.add(listener);listener(this.snapshot());return()=>this.listeners.delete(listener);}
 emit(){const state=this.snapshot();for(const listener of this.listeners)listener(state);}
}