const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/world/cityPlan.js');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix Global TypeError: Convert all cell.position to THREE.Vector3
// Find: position: { x: worldX, y: 0, z: worldZ },
content = content.replace(
  /position:\s*\{\s*x:\s*worldX,\s*y:\s*0,\s*z:\s*worldZ\s*\}/g,
  'position: new THREE.Vector3(worldX, 0, worldZ)'
);

// 2. Fix ReferenceError: cellRot is not defined
// Find the loop starting line and inject let cellRot = 0;
// We look for: for (let i = 0; i < numSubBuildings; i++) {
if (content.includes('for (let i = 0; i < numSubBuildings; i++) {')) {
  content = content.replace(
    'for (let i = 0; i < numSubBuildings; i++) {',
    'let cellRot = 0;\n            for (let i = 0; i < numSubBuildings; i++) {'
  );
  console.log('Fixed cellRot ReferenceError declaration');
}

// 3. One more pass on console logs (just in case)
const consoleRegex = /^\s*(if\s*\(IS_DEV\)\s*)?console\.(log|warn|error)\(.*?\);?\s*$/gm;
content = content.replace(consoleRegex, '');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Applied final structural fixes to cityPlan.js');
