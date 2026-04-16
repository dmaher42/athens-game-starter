const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/world/cityPlan.js');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix ReferenceError: isRoad is not defined
// Find the nearestSeg assignment and inject isRoad
if (content.includes('const nearestSeg = roadNetwork.find(seg => seg.isNear(cell.position));')) {
  content = content.replace(
    'const nearestSeg = roadNetwork.find(seg => seg.isNear(cell.position));',
    'const nearestSeg = roadNetwork.find(seg => seg.isNear(cell.position));\n      const isRoad = !!nearestSeg;'
  );
  console.log('Fixed isRoad reference error');
} else {
    console.error('FAILED to find nearestSeg assignment');
}

// 2. Surgical removal of ALL console calls to prevent the "primitive conversion" crash
// We use a regex that handles various indentation and template literals
const consoleRegex = /^\s*if\s*\(IS_DEV\)\s*console\.(log|warn|error)\(.*?\);?\s*$/gm;
content = content.replace(consoleRegex, '');

// Also handle console calls without the IS_DEV check
const simpleConsoleRegex = /^\s*console\.(log|warn|error)\(.*?\);?\s*$/gm;
content = content.replace(simpleConsoleRegex, '');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Cleaned all console logs from cityPlan.js');
