import * as THREE from "three";
import { getResidentialPalette } from "./residentialFacades.js";
import { resolveBaseUrl, joinPath } from "../utils/baseUrl.js";

const textureLoader = new THREE.TextureLoader();
const baseUrl = resolveBaseUrl();

/**
 * Helper to load and configure a texture with tiling
 */
function loadTexture(path, tilingX = 1, tilingY = 1) {
  const url = joinPath(baseUrl, path);
  const texture = textureLoader.load(url);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(tilingX, tilingY);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function makeMarbleMaterial() {
  // Generic civic prefabs use restrained limestone. Reuse the existing quiet
  // mineral grain; the Parthenon's hero materials have a separate owner.
  const material = new THREE.MeshStandardMaterial({
    color: 0xbeb9aa,
    map: getResidentialPalette().plaster[0].map,
    roughness: 0.95,
    metalness: 0,
    envMapIntensity: 0.25,
  });
  material.name = 'QuietCivicLimestone';
  material.userData.materialType = 'civic-limestone';
  return material;
}
export function makeBronzeMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: 0x8d6e63,
    metalness: 0.85,
    roughness: 0.35,
    envMapIntensity: 1.0,
    clearcoat: 0.05,
    clearcoatRoughness: 0.6,
  });
}

export function makeMediterraneanPlasterMaterial() {
  const texture = loadTexture("textures/plaster_rough.jpg", 4, 4);
  return new THREE.MeshPhysicalMaterial({
    map: texture,
    roughnessMap: texture,
    roughness: 0.82,
    metalness: 0.02,
    envMapIntensity: 1.1,
    bumpMap: texture,
    bumpScale: 0.08,
    sheen: 0.4, // Stronger sheen for sun-bleaching
    sheenRoughness: 0.9,
    sheenColor: new THREE.Color(0xffffff),
  });
}

export function makeMonumentalStoneMaterial() {
  const texture = loadTexture("textures/stone_rough.jpg", 2, 2);
  return new THREE.MeshPhysicalMaterial({
    map: texture,
    roughnessMap: texture,
    roughness: 0.85,
    metalness: 0.0,
    envMapIntensity: 0.7,
    bumpMap: texture,
    bumpScale: 0.1,
  });
}

export function makeAncientWoodMaterial() {
  const texture = loadTexture("textures/wood_weathered.jpg", 3, 3);
  return new THREE.MeshPhysicalMaterial({
    map: texture,
    roughnessMap: texture,
    roughness: 0.9,
    metalness: 0.0,
    envMapIntensity: 0.6,
    bumpMap: texture,
    bumpScale: 0.12,
  });
}

export function makeTerracottaRoofMaterial() {
  const texture = loadTexture("textures/roof_tiles_terracotta.jpg", 5, 5);
  return new THREE.MeshPhysicalMaterial({
    map: texture,
    roughnessMap: texture,
    roughness: 0.75,
    metalness: 0.02,
    envMapIntensity: 1.2,
    bumpMap: texture,
    bumpScale: 0.18,
    sheen: 0.2,
    sheenRoughness: 0.85,
  });
}

export function makeTreeMaterials() {
  const leafMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x4f7f3b,
    roughness: 0.65,
    metalness: 0.05,
    sheen: 0.5, // Significant sheen for sunlight scattering through canopy
    sheenRoughness: 0.8,
    envMapIntensity: 1.1,
  });
  leafMaterial.name = "TreeLeaves";

  const barkMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x7b5e42,
    roughness: 0.88,
    metalness: 0.0,
    bumpScale: 0.15,
    envMapIntensity: 0.8,
  });
  barkMaterial.name = "TreeBark";

  return {
    leaf: leafMaterial,
    bark: barkMaterial,
  };
}

// Shared restrained market timber; code-native texture, no extra plank geometry.
let marketTimber;
export function getMarketCounterMaterial(){
 if(marketTimber)return marketTimber;
 let map=null;if(typeof document!=='undefined'){
  const c=document.createElement('canvas');c.width=128;c.height=64;const ctx=c.getContext('2d');
  const pixels=ctx.createImageData(128,64);for(let y=0;y<64;y++)for(let x=0;x<128;x++){const i=(y*128+x)*4;
   const grain=Math.round(Math.sin(y*2.1+Math.sin(x*.045)) *2+Math.sin(x*.2+y*9)*1.5);
   const seam=(y%16===0)?-9:0;pixels.data.set([126+grain+seam,97+grain+seam,72+grain+seam,255],i);
  }ctx.putImageData(pixels,0,0);map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;map.name='Quiet market timber grain';
 }
 marketTimber=new THREE.MeshStandardMaterial({name:'AgoraCounterTimber',color:0xffffff,map,roughness:1,metalness:0,envMapIntensity:.08});marketTimber.userData.materialType='marketTimber';return marketTimber;
}


