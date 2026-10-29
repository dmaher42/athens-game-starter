export const THEATRE_ACTIVITY_ID='great-theatre-opening';
export const THEATRE_ACTIVITY_TITLE='An Opening for the City';
export const THEATRE_PIECES={
 chorus:{title:'Call and response',lines:['Caller: Before these gates, a stranger waits.','Chorus: Then open them — a city is made by those it welcomes.','Caller: Bring a cup, a bench, a place among us.']},
 story:{title:'The potter’s bowl',lines:['A potter carried an empty bowl into the square.','By dusk it held bread, news, and three names she had not known.','No treasure stayed in the bowl; the neighbours stayed.']},
};
export class TheatreRehearsal {
 constructor(quests){this.quests=quests;this.listeners=new Set();const saved=quests.getActivityRecord?.(THEATRE_ACTIVITY_ID);this.s={version:1,started:!!saved?.started,propsReady:!!saved?.propsReady,viewReady:!!saved?.viewReady,style:THEATRE_PIECES[saved?.style]?saved.style:null,lastStyle:THEATRE_PIECES[saved?.lastStyle]?saved.lastStyle:null,completed:!!saved?.completed,feedback:''};this.running=false;this.elapsed=0;this.lineIndex=0;}
 get active(){return this.quests.activityId===THEATRE_ACTIVITY_ID;}
 get objective(){return this.running?'The opening is being rehearsed. Watch the orchestra and read the three short lines.':!this.s.propsReady?'Set out the masks and woven cloth on the stage. Use the graded central apron.':!this.s.viewReady?'Walk up a graded aisle to the upper listening place. Look back towards the stage.':'Return to the guide or entrance cue and choose an opening to rehearse.';}
 begin(){if(!this.quests.beginActivity(THEATRE_ACTIVITY_ID,THEATRE_ACTIVITY_TITLE,this.objective)){this.s.feedback='Leave or finish the other activity first. Your theatre preparations are kept.';this.emit();return false;}this.s.started=true;this.s.feedback='Prepare the stage, find a listening place, then choose how the opening should feel.';this.sync();return true;}
 requireActive(){if(this.active)return true;this.s.feedback='Begin or resume with the chorus guide or theatre entrance cue.';this.emit();return false;}
 dress(){if(!this.requireActive())return false;this.s.propsReady=true;this.s.feedback='Masks from the clay workers and cloth from the weaving yard are set out. The stage is ready for its people.';this.sync();return true;}
 listen(){if(!this.requireActive())return false;this.s.viewReady=true;this.s.feedback='From here the orchestra, stage and other listeners belong to one space. Choose an opening you would like the gathering to hear together.';this.sync();return true;}
 play(style){if(!THEATRE_PIECES[style])return false;if(!this.active&&!this.begin())return false;if(!this.s.propsReady||!this.s.viewReady){this.s.feedback='Set out the stage props and visit the upper listening place before beginning.';this.emit();return false;}this.s.style=style;this.s.completed=false;this.running=true;this.elapsed=0;this.lineIndex=0;this.s.feedback='The troupe takes its places. Close the panel and watch the orchestra.';this.sync();return true;}
 tick(dt){if(!this.running||!this.active||!Number.isFinite(dt)||dt<=0)return;this.elapsed+=dt;const index=Math.min(2,Math.floor(this.elapsed/6));if(this.elapsed>=18){this.running=false;this.s.completed=true;this.s.lastStyle=this.s.style;this.s.feedback='The opening is rehearsed. The masks and cloth stay in place, and the troupe will rehearse either piece again when you return.';this.save();this.quests.completeQuest(THEATRE_ACTIVITY_ID);this.quests.endActivity(THEATRE_ACTIVITY_ID);this.emit();}else if(index!==this.lineIndex){this.lineIndex=index;this.emit();}}
 leave(){this.running=false;this.elapsed=0;this.quests.endActivity(THEATRE_ACTIVITY_ID);this.s.feedback='Rehearsal paused. Your stage preparation and listening visit are saved; the short piece can begin again when you return.';this.save();this.emit();}
 save(){this.quests.saveActivityRecord?.(THEATRE_ACTIVITY_ID,this.s);}
 sync(){this.save();if(this.active)this.quests.updateObjective(this.objective,THEATRE_ACTIVITY_ID);this.emit();}
 snapshot(){return{...this.s,active:this.active,running:this.running,elapsed:Number(this.elapsed.toFixed(2)),line:this.running?THEATRE_PIECES[this.s.style].lines[this.lineIndex]:'',objective:this.objective,saved:!!this.quests.activityStorageAvailable};}
 subscribe(fn){this.listeners.add(fn);fn(this.snapshot());return()=>this.listeners.delete(fn);}
 emit(){const s=this.snapshot();for(const fn of this.listeners)fn(s);}
}
