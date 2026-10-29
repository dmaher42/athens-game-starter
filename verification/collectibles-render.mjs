import {chromium} from 'playwright';
import {createServer} from 'vite';
import assert from 'node:assert/strict';
const html=`<!doctype html><html><body><script type="module">
import * as THREE from '/node_modules/three/build/three.module.js';
import {CollectiblesManager} from '/src/world/collectibles.js';
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(55,1,0.1,100),renderer=new THREE.WebGLRenderer();renderer.setSize(400,400);document.body.appendChild(renderer.domElement);camera.position.set(0,4,9);camera.lookAt(0,0,0);scene.add(new THREE.AmbientLight(0xffffff,1));
const floor=new THREE.Mesh(new THREE.PlaneGeometry(20,20),new THREE.MeshStandardMaterial({color:0xc7bb8c}));floor.rotation.x=-Math.PI/2;scene.add(floor);
const manager=new CollectiblesManager(scene);for(const x of [-3,0,3])manager.spawnAt(x,0,0);let notifications=0;manager.onScoreChange=()=>notifications++;
for(let i=0;i<4;i++)renderer.render(scene,camera);
const programs=renderer.info.programs.length,gl=renderer.getContext(),compiles=[];
for(const method of ['compileShader','linkProgram']){const original=gl[method].bind(gl);gl[method]=(...args)=>{compiles.push(method);return original(...args);};}
const scores=[];for(const x of [-3,0,3]){manager.update(1/60,new THREE.Vector3(x,1.2,0));renderer.render(scene,camera);scores.push(manager.score);for(let n=0;n<3;n++){manager.update(1/60,new THREE.Vector3(8,1.2,0));manager.update(1/60,new THREE.Vector3(x,1.2,0));renderer.render(scene,camera);}}
window.pickupResult={programsBefore:programs,programsAfter:renderer.info.programs.length,compiles,notifications,scores,score:manager.score,collected:manager.items.every(item=>item.userData.collected)};
</script></body></html>`;
const server=await createServer({configFile:false,base:'/',server:{host:'127.0.0.1',port:0},logLevel:'error',plugins:[{name:'pickup-render-regression',configureServer(server){server.middlewares.use('/pickup-regression',(req,res)=>{res.setHeader('Content-Type','text/html');res.end(html);});}}]});await server.listen();const browser=await chromium.launch();
try{const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/pickup-regression`);await page.waitForFunction(()=>window.pickupResult,null,{timeout:30000}).catch(error=>{throw new Error(error.message+'; page errors: '+JSON.stringify(errors));});const result=await page.evaluate(()=>window.pickupResult);assert.deepEqual(errors,[]);assert.deepEqual(result.scores,[1,2,3]);assert.equal(result.notifications,3);assert.equal(result.score,3);assert.equal(result.collected,true);assert.equal(result.programsAfter,result.programsBefore);assert.deepEqual(result.compiles,[],'Proximity collection must not trigger lighting shader compilation.');console.log(JSON.stringify({pickupRenderRegression:result}));}finally{await browser.close();await server.close();}
