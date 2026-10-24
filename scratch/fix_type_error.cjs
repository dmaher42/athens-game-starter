const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/world/cityPlan.js');
let content = fs.readFileSync(filePath, 'utf8');

// Fix TypeError: _e.position.distanceTo is not a function
// Replace plain object with new THREE.Vector3
content = content.replace(
  'const subCell = { ...cell, position: { x: subX, y: subY, z: subZ } };',
  'const subCell = { ...cell, position: new THREE.Vector3(subX, subY, subZ) };'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed position distanceTo TypeError in cityPlan.js');
