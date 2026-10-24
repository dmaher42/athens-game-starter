const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/core/Application.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Use literal strings for replacement to avoid regex issues
content = content.replace(
  'console.log("✅ THREE exposed:", threeLogTarget?.THREE);',
  'console.log("✅ THREE exposed globally for debugging");'
);

content = content.replace(
  'console.log("✅ TerrainMesh exposed:", terrainLogTarget?.terrainMesh);',
  'console.log("✅ TerrainMesh exposed for debugging");'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched Application.ts');
