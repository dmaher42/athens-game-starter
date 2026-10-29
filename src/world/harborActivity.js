import * as THREE from 'three';
import { HarborEvidenceActivity, HARBOR_EVIDENCE, HARBOR_ACTIVITY_TITLE } from '../state/HarborActivity.js';
import { createLabelSprite } from './demoTour.js';
import { getSeaLevelY } from './locations.js';
import '../ui/harborActivity.css';

export function mountHarborActivity({scene,harbor,questManager,interactor,player,collider,interactionHud,canvas}={}) {
 if(typeof window==='undefined'||typeof document==='undefined'||!harbor)return null;
 const model=new HarborEvidenceActivity(questManager),markers=[];
 const root=new THREE.Group();root.name='HarborLearningEvidence';root.userData.noCollision=true;scene.add(root);
 const postMaterial=new THREE.MeshStandardMaterial({color:0x69513a,roughness:1});
 const plateMaterial=new THREE.MeshStandardMaterial({color:0x264f60,roughness:0.95});
 const ray=new THREE.Raycaster();ray.firstHitOnly=true;
 function floorAt(x,z){ray.set(new THREE.Vector3(x,getSeaLevelY()+25,z),new THREE.Vector3(0,-1,0));return ray.intersectObject(collider.mesh)[0]?.point.y ?? getSeaLevelY()+2.2;}
 function marker(id,label,x,z){
  const group=new THREE.Group();group.name='HarborEvidence_'+id;group.position.set(x,floorAt(x,z),z);group.userData.noCollision=true;group.userData.interactable=true;group.userData.interactionRange=4;group.userData.harborEvidence=id;group.userData.onUse=()=>open(id);
  const post=new THREE.Mesh(new THREE.BoxGeometry(.12,1.45,.12),postMaterial);post.position.y=.72;group.add(post);
  const plate=new THREE.Mesh(new THREE.BoxGeometry(1.55,.75,.12),plateMaterial);plate.position.y=1.2;group.add(plate);
  const labelSprite=createLabelSprite(label,0xcfa45b,{x:3.4,y:1.05});labelSprite.position.y=2.05;labelSprite.userData.noCollision=true;group.add(labelSprite);
  root.add(group);interactor.registerInteractable(group);markers.push(group);
 }
 const merchant=harbor.getObjectByName('HarborHeroShip'),trireme=harbor.getObjectByName('HarborTrireme');harbor.updateWorldMatrix(true,true);
 marker('board','PIRAEUS · START',12,12.5);
 if(merchant){const point=merchant.localToWorld(new THREE.Vector3(-5,0,-5.2));marker('merchant','1 · MERCHANT CARGO',point.x,point.z);}
 if(trireme){const point=trireme.localToWorld(new THREE.Vector3(-4,0,-6));marker('trireme','2 · TRIREME EVIDENCE',point.x,point.z);}
 const overlay=document.createElement('div');overlay.className='harbor-activity-backdrop';overlay.hidden=true;
 const dialog=document.createElement('section');dialog.className='harbor-activity';dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-labelledby','harbor-activity-title');dialog.tabIndex=-1;overlay.appendChild(dialog);document.body.appendChild(overlay);
 let currentEvidence='board',prompt='',focusBefore=null;
 function element(tag,text,className){const el=document.createElement(tag);if(text)el.textContent=text;if(className)el.className=className;return el;}
 function button(text,action,{disabled=false,id}={}){const el=element('button',text);el.type='button';el.disabled=disabled;if(id)el.dataset.action=id;el.addEventListener('click',action);return el;}
 function close(){overlay.hidden=true;player.input.resetKeys?.();const focus=focusBefore?.isConnected?focusBefore:canvas;focus?.focus?.({preventScroll:true});}
 function open(id){currentEvidence=id;focusBefore=document.activeElement;if(id==='board')model.start();else model.inspect(id);overlay.hidden=false;player.input.resetKeys?.();render(model.snapshot());dialog.querySelector('button')?.focus();}
 function render(state){
  const focusedAction=dialog.contains(document.activeElement)?document.activeElement?.dataset?.action:null;dialog.replaceChildren();
  const header=element('header');header.appendChild(element('p','PIRAEUS — PORT OF ATHENS','harbor-activity__eyebrow'));const title=element('h2',HARBOR_ACTIVITY_TITLE);title.id='harbor-activity-title';header.appendChild(title);header.appendChild(button('Close and walk [Esc]',close,{id:'close'}));dialog.appendChild(header);
  dialog.appendChild(element('p','Use ship features as evidence to explain how sea trade helped feed Athens.'));
  dialog.appendChild(element('p','This compressed game map brings the port close to Athens. It is a teaching interpretation, not a scale reconstruction.','harbor-activity__note'));
  if(currentEvidence!=='board'&&HARBOR_EVIDENCE[currentEvidence]){
   const evidence=HARBOR_EVIDENCE[currentEvidence],card=element('article',null,'harbor-activity__evidence');card.appendChild(element('h3',evidence.title));
   for(const [label,text] of [['Observe',evidence.observed],['Historical context',evidence.history],['Infer',evidence.inference]]){const p=element('p');p.appendChild(element('strong',label+': '));p.appendChild(document.createTextNode(text));card.appendChild(p);}
   card.appendChild(element('p',evidence.caution,'harbor-activity__note'));dialog.appendChild(card);
  }
  const progress=element('p',`Evidence inspected: ${state.observed.length}/2. ${state.objective}`,'harbor-activity__progress');progress.dataset.testid='activity-progress';dialog.appendChild(progress);
  const review=element('nav',null,'harbor-activity__actions');review.setAttribute('aria-label','Review inspected evidence');
  for(const id of state.observed)review.appendChild(button('Review '+(id==='merchant'?'merchant cargo':'trireme'),()=>{currentEvidence=id;render(model.snapshot());},{id:'review-'+id}));dialog.appendChild(review);
  if(!state.completed){
   const choices=element('fieldset');choices.appendChild(element('legend','Which ship is better suited to carrying a grain shipment?'));
   choices.appendChild(button('Broad merchant ship',()=>model.chooseShip('merchant'),{disabled:state.observed.length<2,id:'choose-merchant'}));choices.appendChild(button('Narrow trireme',()=>model.chooseShip('trireme'),{disabled:state.observed.length<2,id:'choose-trireme'}));dialog.appendChild(choices);
   if(state.ship==='merchant'){
    const why=element('fieldset');why.appendChild(element('legend','Why did sea trade matter to Athens?'));
    why.appendChild(button('Roomy cargo ships brought imported grain that helped feed Athens.',()=>model.explain('food-supply'),{id:'explain-food'}));
    why.appendChild(button('Triremes were built mainly for the biggest grain cargoes.',()=>model.explain('cargo-warship'),{id:'explain-warship'}));
    why.appendChild(button('Sea trade mattered only for winning battles.',()=>model.explain('only-war'),{id:'explain-war'}));dialog.appendChild(why);
   }
  }
  const feedback=element('p',state.feedback||'Walk along the loading pier to the merchant cargo. Then follow the stone quay north to the trireme. Return to either evidence marker to decide.',state.completed?'harbor-activity__success':'harbor-activity__feedback');feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');feedback.dataset.testid='activity-feedback';dialog.appendChild(feedback);
  if(state.completed)dialog.appendChild(element('h3','Activity complete — evidence and explanation connected.','harbor-activity__success'));
  const actions=element('footer',null,'harbor-activity__actions');actions.appendChild(button(state.completed?'Replay activity':'Reset evidence',()=>{currentEvidence='board';model.reset();},{id:'reset'}));actions.appendChild(button('Return to exploring',()=>{model.leave();close();},{id:'explore'}));dialog.appendChild(actions);
  const details=element('details');details.appendChild(element('summary','Historical sources and reconstruction notes'));
  for(const [label,url] of [['Piraeus and its commercial harbour — National Hellenic Research Foundation','https://archaeologia.eie.gr/archaeologia/gr/02_deltia/piraeus.html'],['Trireme evidence — Acropolis Museum','https://www.theacropolismuseum.gr/en/relief-depicting-trireme-lenormant-relief'],['Athens and imported grain — Penn Museum','https://www.penn.museum/sites/expedition/traders-and-trading/']]){const p=element('p'),a=element('a',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';p.appendChild(a);details.appendChild(p);}
  details.appendChild(element('p','Ship forms, stone quays, cargo and timber boarding details are schematic. No exact excavated dimensions or ancient cargo document are claimed.'));dialog.appendChild(details);
  if(focusedAction)(dialog.querySelector(`[data-action="${focusedAction}"]`)||dialog.querySelector('[data-action="explore"]')||dialog.querySelector('button'))?.focus();
 }
 const unsubscribe=model.subscribe(state=>{if(!overlay.hidden)render(state);});
 overlay.addEventListener('keydown',event=>{
  event.stopPropagation();
  if(event.key==='Escape'){event.preventDefault();close();return;}
  if(event.key==='Tab'){
   const focusable=[...dialog.querySelectorAll('button:not([disabled]),a[href],summary')].filter(el=>{const closed=el.closest('details:not([open])');return el.getClientRects().length&&(!closed||el===closed.querySelector('summary'));}),first=focusable[0],last=focusable.at(-1);
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
  }
 });
 for(const type of ['keyup','pointerdown','pointerup','wheel'])overlay.addEventListener(type,event=>event.stopPropagation());
 return {
  model,markers,
  snapshot(){return {...model.snapshot(),panelOpen:!overlay.hidden,markers:markers.map(m=>({id:m.userData.harborEvidence,position:m.position.toArray()}))};},
  update(){
   const hover=interactor.getCurrentHover(),id=hover?.userData?.harborEvidence;
   const next=overlay.hidden&&id?(id==='board'?'Begin or resume: Which ship feeds Athens?':id==='merchant'?'Inspect merchant cargo':'Inspect trireme oars and ram'):'';
   if(next!==prompt){if(next)interactionHud.show(next);else if(prompt)interactionHud.hide();prompt=next;}
   if(!overlay.hidden)player.input.resetKeys?.();
  },
  dispose(){unsubscribe();model.leave();for(const marker of markers)interactor.unregisterInteractable(marker);root.removeFromParent();overlay.remove();root.traverse(object=>{if(object.isSprite){object.material.map?.dispose();object.material.dispose();}else object.geometry?.dispose();});postMaterial.dispose();plateMaterial.dispose();}
 };
}