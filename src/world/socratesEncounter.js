import * as THREE from 'three';
import {createSocratesModel} from './npcs.js';
import {createLabelSprite} from './demoTour.js';
import '../ui/harborActivity.css';
const ID='socrates-lost-purse';
export function mountSocratesEncounter({scene,terrain,questManager,interactor,player,canvas}){
 const actor=createSocratesModel();actor.position.set(-47,terrain.userData.getHeightAt(-47,27)+.05,27);actor.rotation.y=Math.PI/2;
 const label=createLabelSprite('SOCRATES',0xcbbf9e,{x:2.1,y:.45});label.position.y=2.25;actor.add(label);
 actor.userData.interactable=true;actor.userData.preferAimedUse=true;actor.userData.interactionRange=3.5;actor.userData.onUse=open;scene.add(actor);interactor.registerInteractable(actor);
 let saved=questManager.getActivityRecord(ID)||{},step=0,choice=['return','verify','need'].includes(saved.choice)?saved.choice:null,completed=!!saved.completed;
 const overlay=document.createElement('div');overlay.className='harbor-activity-backdrop';overlay.hidden=true;const panel=document.createElement('section');panel.className='harbor-activity';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','socrates-title');panel.tabIndex=-1;overlay.append(panel);document.body.append(overlay);
 function el(tag,text){const e=document.createElement(tag);e.textContent=text;return e;}
 function button(text,action,fn){const b=el('button',text);b.type='button';b.dataset.action=action;b.onclick=fn;return b;}
 function save(){questManager.saveActivityRecord(ID,{version:1,choice,completed});}
 function close(){overlay.hidden=true;player.input.resetKeys?.();player.input.consumeInteract?.();if(canvas.tabIndex<0)canvas.tabIndex=0;canvas.focus({preventScroll:true});}
 function open(){if(!overlay.hidden)return;step=completed?3:choice?2:0;overlay.hidden=false;player.input.resetKeys?.();render();}
 function render(){panel.replaceChildren();const header=el('header',''),title=el('h2','Socrates — Whose purse?');title.id='socrates-title';header.append(title,button('Return to the Agora [Esc]','close',close));panel.append(header);
 if(step===0){panel.append(el('p','Socrates: A purse lies beside a market bench. A stranger says it is theirs. Before we act, what would make our action just?'),el('p','An imagined conversation, not a quotation or a real lost-property quest. Nothing will be taken from your inventory.'),button('Consider the stranger’s claim','begin',()=>{step=1;render();}));}
 if(step===1){panel.append(el('p','What would you do first? Each choice has a cost worth examining.'));
 for(const[key,text]of [['return','Return it to the person who claims it'],['verify','Ask for details only its owner would know'],['need','First ask whether someone urgently needs help']])panel.append(button(text,key,()=>{choice=key;completed=false;save();step=2;render();}));}
 if(step===2){const questions={return:'Socrates: Trust can honour a neighbour. But if confident words are enough, could the honest owner lose twice? What would distinguish trust from carelessness?',verify:'Socrates: You seek evidence. Yet an anxious owner may forget a detail. How much certainty is enough before caution becomes another injustice?',need:'Socrates: Need deserves attention. But does another person’s need give us the right to spend what is not ours? Could we offer help without deciding ownership?'};panel.append(el('p',questions[choice]),el('p','A reason can be sincere and still need testing. Whose interests did your first answer leave out?'),button('Keep this question in mind','reflect',()=>{completed=true;save();step=3;render();}),button('Reconsider my first action','reconsider',()=>{step=1;render();}));}
 if(step===3){panel.append(el('p','Socrates: Then we have gained something: a clearer question. Seek the owner fairly, hear the people affected, and be willing to revise your reason.'),el('p','Reflection remembered. No answer is graded and no coins or quest rewards have changed.'),button('Explore another approach','replay',()=>{step=1;render();}));}
 panel.append(el('p','Creative time blend: Socrates lived in the fifth century BCE and died in 399 BCE, before this city’s Hellenistic setting. This original encounter brings his questioning spirit into the imagined world.'),el('p',questManager.activityStorageAvailable?'Your chosen approach is remembered in this browser at this game address.':'This conversation is session-only because browser saving is unavailable.'));panel.querySelector('button')?.focus();}
 function keys(e){e.stopPropagation();if(e.key==='Escape'){e.preventDefault();close();}if(e.key==='Tab'){const b=[...panel.querySelectorAll('button')],first=b[0],last=b.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}}
 overlay.addEventListener('keydown',keys);for(const event of ['keyup','pointerdown','pointerup','wheel'])overlay.addEventListener(event,e=>e.stopPropagation());
 return{actor,open,snapshot:()=>({location:actor.position.toArray(),choice,completed,panelOpen:!overlay.hidden,budget:actor.userData.assetBudget}),update(){if(!overlay.hidden)player.input.resetKeys?.();},dispose(){interactor.unregisterInteractable(actor);actor.removeFromParent();overlay.remove();}};
}
