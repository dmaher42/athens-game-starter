import {THEATRE_SANCTUARY} from '../world/greatTheatreLayout.js';
import {COUNTRYSIDE_TRAILS,cultivatedWeight} from '../world/countrysideLayout.js';
import {AGORA_LAYOUT} from '../world/cityCivicLayout.js';
import {ACROPOLIS,acropolisBoundaryDistance} from '../world/acropolisLayout.js';
import {PRECINCT_LIFE} from '../world/precinctLifeLayout.js';
import * as THREE from 'three';
import { CITY_STREETS, NEIGHBOURHOODS,RESIDENTIAL_STREET_POCKETS,residentialPocketPoint } from '../world/neighbourhoodLayout.js';

// Appearance only: the existing terrain, height sampler and street layout remain
// authoritative. One static atlas gives dirt a world-scale pattern, rather than
// repeating the same small photograph uniformly across every district.
const AREA = { west: -380, south: -380, width: 760, depth: 980 };
const SIZE = 1024;
const smooth = t => t * t * (3 - 2 * t);
function hash(x,z){const v=Math.sin(x*127.1+z*311.7+47.2)*43758.5453;return v-Math.floor(v);}
function noise(x,z){const ix=Math.floor(x),iz=Math.floor(z),u=smooth(x-ix),v=smooth(z-iz);return THREE.MathUtils.lerp(THREE.MathUtils.lerp(hash(ix,iz),hash(ix+1,iz),u),THREE.MathUtils.lerp(hash(ix,iz+1),hash(ix+1,iz+1),u),v);}
let atlas;
function createAtlas(){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=SIZE;
 const ctx=canvas.getContext('2d'),image=ctx.createImageData(SIZE,SIZE);
 for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){
  const wx=AREA.west+x/SIZE*AREA.width,wz=AREA.south+(1-y/SIZE)*AREA.depth;
  const broad=noise(wx*.035,wz*.035),small=noise(wx*.17,wz*.17),dry=0.7*broad+0.3*small;
  // Muted scrub survives in irregular pockets, especially the quieter northern
  // yards. Central civic surfaces stay predominantly worn, mineral soil.
  const north=THREE.MathUtils.smoothstep(wz,70,220),quiet=THREE.MathUtils.smoothstep(broad,.43,.78);
  const civic=1-Math.exp(-(((wx-AGORA_LAYOUT.x)/40)**2+((wz-AGORA_LAYOUT.z)/35)**2));
  const cultivated=cultivatedWeight(wx,wz);
  const i=(y*SIZE+x)*4;
  image.data[i]=Math.round(65+dry*165);
  image.data[i+1]=Math.round(Math.max((20+100*north)*quiet*civic,cultivated*(48+small*32)));
  const edge=acropolisBoundaryDistance(wx,wz);
  const precinct=THREE.MathUtils.smoothstep(edge,0,3);
  image.data[i+2]=Math.round(precinct*(210+small*12));image.data[i+3]=255;
 }
 ctx.putImageData(image,0,0);
 const px=x=>(x-AREA.west)/AREA.width*SIZE,py=z=>(1-(z-AREA.south)/AREA.depth)*SIZE;
 // Soft trampled shoulders derive from the canonical street centre lines, not
 // an independently maintained road map. No geometry or walking support added.
 for(const street of [...CITY_STREETS,...COUNTRYSIDE_TRAILS,{points:THEATRE_SANCTUARY.approach,width:1.8}]){
  const curve=new THREE.CatmullRomCurve3(street.points.map(([x,z])=>new THREE.Vector3(x,0,z)),false,'catmullrom',.25);
  const points=curve.getPoints(Math.max(24,Math.ceil(curve.getLength()/2)));
  ctx.lineCap='round';ctx.lineJoin='round';
  for(const[extra,alpha]of [[5,.13],[2.5,.2],[.5,.55]]){
   ctx.strokeStyle=`rgba(208,0,0,${alpha})`;ctx.lineWidth=((street.width??4)+extra)*SIZE/AREA.width;
   ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(px(p.x),py(p.z)):ctx.moveTo(px(p.x),py(p.z)));ctx.stroke();
  }
 }
 // Doorstep and gathering wear belongs to existing courts. The irregular atlas
 // still reads through it, preventing hard new rectangular paving patches.
 for(const p of NEIGHBOURHOODS){
  if(p.kind==='garden')continue;
  const radius=Math.max(p.width,p.depth)*.72*SIZE/AREA.width;
  const g=ctx.createRadialGradient(px(p.x),py(p.z),0,px(p.x),py(p.z),radius);
  g.addColorStop(0,'rgba(220,0,0,.65)');g.addColorStop(1,'rgba(220,0,0,0)');ctx.fillStyle=g;ctx.fillRect(px(p.x)-radius,py(p.z)-radius,radius*2,radius*2);
 }
 // Small doorstep wear uses the same forecourt data; no floating ground quads.
 for(const f of RESIDENTIAL_STREET_POCKETS){const p=residentialPocketPoint(f,f.doorX,4.7),radius=3.5*SIZE/AREA.width,g=ctx.createRadialGradient(px(p.x),py(p.z),0,px(p.x),py(p.z),radius);g.addColorStop(0,'rgba(215,0,0,.55)');g.addColorStop(1,'rgba(215,0,0,0)');ctx.fillStyle=g;ctx.fillRect(px(p.x)-radius,py(p.z)-radius,radius*2,radius*2);}
 // Optional worn detours connect the new gathering pockets on the same surface.
 for(const trail of PRECINCT_LIFE.trails){const curve=new THREE.CatmullRomCurve3(trail.map(([x,z])=>new THREE.Vector3(x,0,z)),false,'catmullrom',.2);const points=curve.getPoints(40);for(const [width,alpha]of[[4,.12],[2,.35]]){ctx.lineWidth=width*SIZE/AREA.width;ctx.strokeStyle=`rgba(195,0,40,${alpha})`;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(px(p.x),py(p.z)):ctx.moveTo(px(p.x),py(p.z)));ctx.stroke();}}
 const texture=new THREE.CanvasTexture(canvas);texture.name='City soil variation and street wear';
 texture.colorSpace=THREE.NoColorSpace;texture.wrapS=texture.wrapT=THREE.ClampToEdgeWrapping;
 return texture;
}

export function applyCityGroundVariation(material){
 if(typeof document==='undefined')return;
 atlas??=createAtlas();
 material.userData.citySurface={version:9,atlasSize:SIZE,appearanceOnly:true};
 material.onBeforeCompile=(shader,renderer)=>{
  // Retain the game's existing standard-material AO and lighting enhancements.
  THREE.MeshStandardMaterial.prototype.onBeforeCompile.call(material,shader,renderer);
  shader.uniforms.citySoilAtlas={value:atlas};
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vCitySoilWorld;\nvarying vec2 vCityRock;').replace('#include <project_vertex>','#include <project_vertex>\nvCitySoilWorld=(modelMatrix*vec4(transformed,1.0)).xz;\nvCityRock=vec2((modelMatrix*vec4(transformed,1.0)).y,abs(normalize(mat3(modelMatrix)*objectNormal).y));');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 vCitySoilWorld;\nvarying vec2 vCityRock;\nuniform sampler2D citySoilAtlas;').replace('#include <map_fragment>',`#include <map_fragment>
   vec2 soilUV=(vCitySoilWorld-vec2(${AREA.west.toFixed(1)},${AREA.south.toFixed(1)}))/vec2(${AREA.width.toFixed(1)},${AREA.depth.toFixed(1)});
   vec3 soil=texture2D(citySoilAtlas,soilUV).rgb;
   float mineral=dot(diffuseColor.rgb,vec3(.299,.587,.114));
   diffuseColor.rgb=mix(diffuseColor.rgb,vec3(mineral)*vec3(1.16,1.07,.95),.82);
   diffuseColor.rgb*=mix(vec3(.84,.85,.79),vec3(1.10,1.08,1.01),soil.r);
   diffuseColor.rgb=mix(diffuseColor.rgb,vec3(mineral)*vec3(.64,.78,.40),soil.g*.9);
   vec3 wornLimestone=vec3(.20,.185,.15)*mix(.97,1.03,soil.r);
   diffuseColor.rgb=mix(diffuseColor.rgb,wornLimestone,soil.b*.84);
   float hillArea=step(-181.,vCitySoilWorld.x)*step(vCitySoilWorld.x,16.)*step(-128.,vCitySoilWorld.y)*step(vCitySoilWorld.y,4.);
   float bedrock=hillArea*smoothstep(3.5,7.,vCityRock.x)*(1.-smoothstep(.65,.94,vCityRock.y));
   diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.30,.29,.265)*mix(.9,1.10,soil.r),bedrock*.82);
  `);
 };
 material.customProgramCacheKey=()=> THREE.MeshStandardMaterial.prototype.customProgramCacheKey.call(material)+'|city-soil-variation-v9';
}

