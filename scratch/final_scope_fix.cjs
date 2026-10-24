const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/world/cityPlan.js');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Lift cellRot scope to the main cell loop
// Find the start of the loop: for (const cell of grid) {
if (content.includes('for (const cell of grid) {')) {
    content = content.replace(
        'for (const cell of grid) {',
        'for (const cell of grid) {\n    let cellRot = 0;'
    );
    console.log('Lifted cellRot scope to main cell loop');
}

// 2. Remove the inner declaration to avoid issues (optional but cleaner)
content = content.replace('let cellRot = 0;\n            for (let i = 0; i < numSubBuildings; i++) {', 'for (let i = 0; i < numSubBuildings; i++) {');

// 3. One last surgical console log nuke
const consoleRegex = /^\s*(if\s*\(IS_DEV\)\s*)?console\.(log|warn|error)\(.*?\);?\s*$/gm;
content = content.replace(consoleRegex, '');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Final cleanup and scope fix applied to cityPlan.js');
