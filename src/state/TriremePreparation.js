export const TRIREME_PREPARATION_ID='trireme-ready-the-ship';
export const PREPARATION_TASKS={water:'Secure the stern water jar',rigging:'Check the port-side lashings',rowing:'Agree the stroke with the caller'};
export class TriremePreparation{
 constructor(quests){this.quests=quests;this.listeners=new Set();const a=quests?.getActivityRecord?.(TRIREME_PREPARATION_ID);this.s={version:1,started:!!a?.started,water:!!a?.water,rigging:!!a?.rigging,rowing:!!a?.rowing,ready:!!a?.ready};this.feedback='';}
 begin(){this.s.started=true;this.feedback='Water, lashings, then a common stroke. You can leave and return to finish.';this.sync();}
 check(id){if(!Object.hasOwn(PREPARATION_TASKS,id)||!this.s.started)return false;this.s[id]=true;this.feedback={water:'The jar is lashed against the hull. Its water belongs to the whole crew.',rigging:'Damon tests the line, then answers: firm, without a twist.',rowing:'Lysias hears your answer: one stroke, together. The rowing places are ready; the oars remain at rest.'}[id];this.sync();return true;}
 finish(){if(!this.s.started||!Object.keys(PREPARATION_TASKS).every(k=>this.s[k])){this.feedback='The captain needs all three preparations checked.';this.emit();return false;}this.s.ready=true;this.feedback='Nikandros: Ready is a promise to the people beside you. Keep the lines fast; we remain in harbour until a voyage is chosen.';this.sync();return true;}
 reset(){this.s={version:1,started:false,water:false,rigging:false,rowing:false,ready:false};this.feedback='A fresh preparation round. Other activities and rewards are unchanged.';this.sync();}
 snapshot(){const done=Object.keys(PREPARATION_TASKS).filter(k=>this.s[k]).length;return{...this.s,done,feedback:this.feedback,saved:!!this.quests?.activityStorageAvailable,objective:this.s.ready?'Ship ready — still moored. Revisit the captain or prepare again.':!this.s.started?'Speak to Captain Nikandros on the stern deck.':done<3?`${done}/3 preparations checked. Report to the captain when all are ready.`:'Report to Captain Nikandros on the stern deck.'};}
 sync(){this.quests?.saveActivityRecord?.(TRIREME_PREPARATION_ID,this.s);this.emit();}
 subscribe(fn){this.listeners.add(fn);fn(this.snapshot());return()=>this.listeners.delete(fn);}
 emit(){for(const f of this.listeners)f(this.snapshot());}
}
