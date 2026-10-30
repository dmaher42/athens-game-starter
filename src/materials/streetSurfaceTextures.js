import * as THREE from 'three';
const cache=new Map();
// Original compact 4 m tiles. Shared by existing road/court meshes, not decals.
export function getStreetSurfaceTexture(paved){
 const key=paved?'stone':'earth';if(cache.has(key))return cache.get(key);
 const size=256,data=new Uint8Array(size*size*4),hash=(x,y)=>{const a=Math.sin(x*127.1+y*311.7)*43758.5453;return a-Math.floor(a);};
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const row=Math.floor(y/32),offset=(row%2)*32,col=Math.floor((x+offset)/64),grain=(hash(x,y)-.5)*7;
  let r,g,b;if(paved){const tone=(hash(col,row)-.5)*15,seam=y%32<1||(x+offset)%64<1,v=174+tone+grain-(seam?25:0);r=v+5;g=v+1;b=v-10;}
  else{const broad=Math.sin(x*.049)*Math.cos(y*.061)*3,pebble=hash(x+710,y+37)>.991?10:0,v=158+broad+grain+pebble;r=v+5;g=v-1;b=v-17;}
  const i=(y*size+x)*4;data[i]=r;data[i+1]=g;data[i+2]=b;data[i+3]=255;
 }
 const map=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);map.name=paved?'QuietWornLimestone':'FinePackedEarth';map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.magFilter=THREE.LinearFilter;map.minFilter=THREE.LinearMipmapLinearFilter;map.generateMipmaps=true;map.anisotropy=4;map.needsUpdate=true;cache.set(key,map);return map;
}
