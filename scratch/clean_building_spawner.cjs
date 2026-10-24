const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/world/buildingSpawner.js');
let content = fs.readFileSync(filePath, 'utf8');

// Surgical removal of ALL console calls
const consoleRegex = /^\s*console\.(log|warn|error)\(.*?\);?\s*$/gm;
content = content.replace(consoleRegex, '');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Cleaned all console logs from buildingSpawner.js');
