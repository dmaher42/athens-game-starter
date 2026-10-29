import * as THREE from 'three';
import { CITY_STREETS, NEIGHBOURHOODS } from '../world/neighbourhoodLayout.js';

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
  const civic=1-Math.exp(-(((wx+30)/40)**2+((wz-20)/35)**2));
  const i=(y*SIZE+x)*4;
  image.data[i]=Math.round(65+dry*165);
  image.data[i+1]=Math.round((20+100*north)*quiet*civic);
  image.data[i+2]=128;image.data[i+3]=255;
 }
 ctx.putImageData(image,0,0);
 const px=x=>(x-AREA.west)/AREA.width*SIZE,py=z=>(1-(z-AREA.south)/AREA.depth)*SIZE;
 // Soft trampled shoulders derive from the canonical street centre lines, not
 // an independently maintained road map. No geometry or walking support added.
 for(const street of CITY_STREETS){
  const curve=new THREE.CatmullRomCurve3(street.points.map(([x,z])=>new THREE.Vector3(x,0,z)),false,'catmullrom',.25);
  const points=curve.getPoints(Math.max(24,Math.ceil(curve.getLength()/2)));
  ctx.lineCap='round';ctx.lineJoin='round';
  for(const[extra,alpha]of [[5,.13],[2.5,.2],[.5,.55]]){
   ctx.strokeStyle=`rgba(208,0,128,${alpha})`;ctx.lineWidth=((street.width??4)+extra)*SIZE/AREA.width;
   ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(px(p.x),py(p.z)):ctx.moveTo(px(p.x),py(p.z)));ctx.stroke();
  }
 }
 // Doorstep and gathering wear belongs to existing courts. The irregular atlas
 // still reads through it, preventing hard new rectangular paving patches.
 for(const p of NEIGHBOURHOODS){
  if(p.kind==='garden')continue;
  const radius=Math.max(p.width,p.depth)*.72*SIZE/AREA.width;
  const g=ctx.createRadialGradient(px(p.x),py(p.z),0,px(p.x),py(p.z),radius);
  g.addColorStop(0,'rgba(220,0,128,.65)');g.addColorStop(1,'rgba(220,0,128,0)');ctx.fillStyle=g;ctx.fillRect(px(p.x)-radius,py(p.z)-radius,radius*2,radius*2);
 }
 const texture=new THREE.CanvasTexture(canvas);texture.name='City soil variation and street wear';
 texture.colorSpace=THREE.NoColorSpace;texture.wrapS=texture.wrapT=THREE.ClampToEdgeWrapping;
 return texture;
}

export function applyCityGroundVariation(material){
 if(typeof document==='undefined')return;
 atlas??=createAtlas();
 material.userData.citySurface={version:1,atlasSize:SIZE,appearanceOnly:true};
 material.onBeforeCompile=(shader,renderer)=>{
  // Retain the game's existing standard-material AO and lighting enhancements.
  THREE.MeshStandardMaterial.prototype.onBeforeCompile.call(material,shader,renderer);
  shader.uniforms.citySoilAtlas={value:atlas};
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vCitySoilWorld;').replace('#include <project_vertex>','#include <project_vertex>\nvCitySoilWorld=(modelMatrix*vec4(transformed,1.0)).xz;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 vCitySoilWorld;\nuniform sampler2D citySoilAtlas;').replace('#include <map_fragment>',`#include <map_fragment>
   vec2 soilUV=(vCitySoilWorld-vec2(${AREA.west.toFixed(1)},${AREA.south.toFixed(1)}))/vec2(${AREA.width.toFixed(1)},${AREA.depth.toFixed(1)});
   vec3 soil=texture2D(citySoilAtlas,soilUV).rgb;
   float mineral=dot(diffuseColor.rgb,vec3(.299,.587,.114));
   diffuseColor.rgb=mix(diffuseColor.rgb,vec3(mineral)*vec3(1.07,1.035,.94),.56);
   diffuseColor.rgb*=mix(vec3(.72,.77,.68),vec3(1.14,1.12,1.04),soil.r);
   diffuseColor.rgb=mix(diffuseColor.rgb,vec3(mineral)*vec3(.64,.78,.40),soil.g*.9);
  `);
 };
 material.customProgramCacheKey=()=> THREE.MeshStandardMaterial.prototype.customProgramCacheKey.call(material)+'|city-soil-variation-v1';
}
