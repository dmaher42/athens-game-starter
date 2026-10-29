import { chromium } from 'playwright';
import { createServer } from 'vite';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

// Test-only bridge. Shipped sources expose state through render_game_to_text,
// not a teleport control. This probe checks keyboard/UI/physics semantics;
// renderer calls are suppressed after startup and cannot supply FPS evidence.
const server=await createServer({server:{host:'127.0.0.1',port:0},logLevel:'error',plugins:[{
 name:'harbor-functional-test-bridge',enforce:'pre',async transform(code,id){
  if(process.env.ATHENS_MATRIX_BASELINE && id.replaceAll('\\','/').endsWith('/src/utils/staticRenderBatches.js'))return await fs.readFile(process.env.ATHENS_MATRIX_BASELINE,'utf8');
  if(id.replaceAll('\\','/').endsWith('/src/core/Application.ts'))return code.replace('const loop = this.gameLoop;','const loop = this.gameLoop; (window as any).__harborTest = {playerSystem, loop, renderer, scene};');
 }
}]});
await server.listen();const browser=await chromium.launch();const errors=[];
try{
 const page=await browser.newPage({viewport:{width:800,height:600}});
 if(process.env.ATHENS_ACTIVITY_SEED)await page.addInitScript(seed=>{let value=seed;Math.random=()=>((value=(value*1664525+1013904223)>>>0)/4294967296);},Number(process.env.ATHENS_ACTIVITY_SEED));
 page.on('pageerror',e=>errors.push(String(e)));
 page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
 await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/athens-game-starter/`,{waitUntil:'domcontentloaded'});
 await page.setViewportSize({width:900,height:650});
 await page.waitForFunction(()=>typeof window.render_game_to_text==='function'&&window.__harborTest,null,{timeout:120000});
 const state=()=>page.evaluate(()=>JSON.parse(render_game_to_text()));
 const step=()=>page.evaluate(()=>window.__harborTest.loop.advanceTime(160));
 await page.evaluate(()=>{window.__harborTest.loop.stop();window.__harborTest.renderer.render=()=>{};});
 assert.deepEqual(await page.evaluate(()=>[window.__harborTest.renderer.domElement.width,window.__harborTest.renderer.domElement.height]),[900,650]);
 assert.equal((await state()).activity.markers.length,3);
 const control=await page.evaluate(()=>{let frozen=0;window.__harborTest.scene.getObjectByName('Harbor').traverse(o=>{if(!o.matrixAutoUpdate)frozen++;});return{frozen,running:window.__harborTest.loop._running};});
 assert.equal(control.running,false,'Functional actions must use only the deterministic clock');
 if(process.env.ATHENS_MATRIX_BASELINE)assert.equal(control.frozen,0,'Prior-batcher control must actually be active');
 console.log(JSON.stringify({activityControl:{mode:process.env.ATHENS_MATRIX_BASELINE?'prior-batcher':'checkout',seed:process.env.ATHENS_ACTIVITY_SEED??'unseeded',...control}}));
 const previous=await page.evaluate(()=>({...window.questManager.currentQuest}));
 const approachReports=[];
 async function moveTo(id){
  const trace=await page.evaluate(async id=>{
   const {planHarborApproach,executeHarborApproach}=await import('/athens-game-starter/verification/harbor-approach.fixture.js');
   const q=window.__harborTest,p=q.playerSystem.player,marker=q.scene.getObjectByName('HarborEvidence_'+id),harbor=q.scene.getObjectByName('Harbor');
   const plan=planHarborApproach({harbor,marker:marker.getWorldPosition(new window.THREE.Vector3()),collider:p.env,height:p.height,radius:p.radius,terrainHeightSampler:p.terrainHeightSampler,interactionRange:marker.userData.interactionRange});
   const walk=executeHarborApproach(p,plan,{step:dt=>q.loop.advanceTime(dt*1000),setForward:value=>window.dispatchEvent(new KeyboardEvent(value?'keydown':'keyup',{key:'w',code:'KeyW'}))});
   return {plan,walk};
  },id);
  assert.ok(trace.walk.frames>0,'The evidence approach must be walked, not teleported');
  assert.ok(trace.walk.distance<=trace.plan.range,'The standing point must satisfy the actual interaction range');
  approachReports.push({id,frames:trace.walk.frames,minFootY:trace.walk.minFootY,distance:trace.walk.distance,range:trace.plan.range});
  const s=await state(),marker=s.activity.markers.find(m=>m.id===id);
  if(!s.player.grounded||s.player.flying||!(s.player.y>marker.position[1]+.75 && s.player.y<marker.position[1]+1.4))console.log(JSON.stringify({supportFailure:{id,trace,player:s.player,marker}}));
  assert.equal(await page.evaluate(()=>window.__harborTest.loop._running),false,'Clock must stay stopped across state reads');
  assert.equal(s.player.flying,false);assert.equal(s.player.grounded,true,`${id} marker must be reachable on a solid surface`);
  assert.ok(s.player.y>marker.position[1]+.75 && s.player.y<marker.position[1]+1.4,`${id} marker must be supported by quay/pier, not a floating label; player=${JSON.stringify(s.player)}; marker=${JSON.stringify(marker)}`);
 }
 async function use(id){await moveTo(id);await page.keyboard.press('e');await step();await page.getByRole('dialog').waitFor({state:'visible'});}
 await use('board');assert.equal((await state()).quest.title,'Which ship feeds Athens?');
 assert.equal(await page.locator('[data-action="choose-merchant"]').isDisabled(),true);
 const before=(await state()).player;await page.keyboard.press('w');await step();const after=(await state()).player;assert.ok(Math.hypot(before.x-after.x,before.z-after.z)<.001,'Dialog keyboard input must not move the player');
 await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'hidden'});
 await page.evaluate(()=>{const p=window.__harborTest.playerSystem.player;p.position.set(68,3.36,10);p.velocity.set(0,0,0);p.syncCapsuleToObject();window.__harborTest.loop.advanceTime(160);});
 assert.equal((await state()).quest.title,'Which ship feeds Athens?');assert.equal((await state()).activity.stage,'inspect');
 await use('merchant');assert.deepEqual((await state()).activity.observed,['merchant']);
 await page.keyboard.press('Escape');await use('trireme');assert.equal((await state()).activity.observed.length,2);
 await page.locator('[data-action="choose-trireme"]').click();assert.match(await page.locator('[data-testid="activity-feedback"]').innerText(),/warship/i);assert.equal((await state()).activity.completed,false);
 await page.locator('[data-action="choose-merchant"]').click();await page.locator('[data-action="explain-war"]').click();assert.equal((await state()).activity.completed,false);
 await page.locator('[data-action="explain-food"]').click();assert.equal((await state()).activity.completed,true);assert.equal((await state()).quest.status,'Completed');
 assert.equal(await page.evaluate(()=>document.activeElement.dataset.action),'explore','Completing the activity must retain keyboard focus inside the dialog');
 await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.tagName),'SUMMARY');
 await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.dataset.action),'close');
 await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>document.activeElement.tagName),'SUMMARY');
 assert.equal(await page.evaluate(()=>document.querySelector('.harbor-activity[role="dialog"]').contains(document.activeElement)),true);
 await fs.mkdir('outputs',{recursive:true});await page.screenshot({path:'outputs/harbor-activity-complete.png'});
 await page.locator('[data-action="reset"]').click();assert.equal((await state()).activity.observed.length,0);assert.equal((await state()).activity.completed,false);assert.equal(await page.locator('[data-action="choose-merchant"]').isDisabled(),true);
 await page.locator('[data-action="explore"]').click();assert.equal((await state()).activity.active,false);assert.deepEqual(await page.evaluate(()=>({...window.questManager.currentQuest})),previous);
 await page.evaluate(()=>{const p=window.__harborTest.playerSystem.player;p.position.set(68,3.36,10);p.velocity.set(0,0,0);p.syncCapsuleToObject();window.__harborTest.loop.advanceTime(160);});
 assert.notEqual((await state()).quest.objective,previous.objective,'The tour must resume its own stage after the activity, rather than having advanced invisibly');
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({harborActivity:{evidenceRequired:true,wrongAnswersRetry:true,explanationRequired:true,completed:true,reset:true,questRestored:true,tourResumed:true,keyboardFocus:true,solidEvidenceSurfaces:true,approaches:approachReports,initialCanvasSynchronized:true,renderingDisabledDuringFunctionalActions:true}}));
}finally{await browser.close();await server.close();}
