// Restyle the existing GLB without touching mesh data, skeleton or animation.
import fs from 'node:fs/promises';
import { Color } from 'three';
const path = new URL('../public/models/character/hero.glb', import.meta.url);
const bytes = await fs.readFile(path);
if (bytes.readUInt32LE(0) !== 0x46546c67 || bytes.readUInt32LE(4) !== 2) throw new Error('Expected GLB v2');
const jsonLength = bytes.readUInt32LE(12);
const document = JSON.parse(bytes.subarray(20, 20 + jsonLength).toString());
const palettes = {
  Medieval_Body: { Black: ['Hero_Linen', 0xe0d1b2], LightBrown: ['Hero_TealTrim', 0x397778], DarkBrown: ['Hero_Leather', 0x79543a], Gold: ['Hero_Brass', 0xb39457] },
  Medieval_Legs: { Black: ['Hero_Indigo', 0x405b70] },
};
for (const mesh of document.meshes) {
  for (const primitive of mesh.primitives) {
    const original = document.materials[primitive.material];
    const variant = palettes[mesh.name]?.[original.name];
    if (!variant) continue;
    let index = document.materials.findIndex(m => m.name === variant[0]);
    if (index < 0) {
      const material = structuredClone(original);
      material.name = variant[0];
      material.pbrMetallicRoughness.baseColorFactor = [...new Color(variant[1]).toArray(), 1];
      material.pbrMetallicRoughness.roughnessFactor = 0.92;
      material.pbrMetallicRoughness.metallicFactor = 0;
      index = document.materials.push(material) - 1;
    }
    primitive.material = index;
  }
}
let json = Buffer.from(JSON.stringify(document));
json = Buffer.concat([json, Buffer.alloc((4 - json.length % 4) % 4, 0x20)]);
const remainder = bytes.subarray(20 + jsonLength);
const header = Buffer.alloc(20);
header.writeUInt32LE(0x46546c67, 0); header.writeUInt32LE(2, 4);
header.writeUInt32LE(20 + json.length + remainder.length, 8);
header.writeUInt32LE(json.length, 12); header.writeUInt32LE(0x4e4f534a, 16);
await fs.writeFile(path, Buffer.concat([header, json, remainder]));
console.log('Updated hero cloth palette; binary geometry and animation buffer preserved.');
