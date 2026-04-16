import fs from 'fs';
import path from 'path';

const filePath = 'c:/Users/dmahe/OneDrive/Desktop/Codex/Athens/athens-game-starter/src/world/cityPlan.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Grid & Road Init
content = content.replace(
  /\/\/ Generate grid and road network\s+const \{ grid, roadNetwork \} = \(function\(\) \{/,
  '// Generate grid and road network\n  console.time("City: Grid & Road Init");\n  const { grid, roadNetwork } = (function() {'
);
content = content.replace(
  /grid: result.cells, roadNetwork: result.roadNetwork \};\s+\}\)\(\);/,
  'grid: result.cells, roadNetwork: result.roadNetwork };\n  })();\n  console.timeEnd("City: Grid & Road Init");'
);

// 2. Pathfinding
content = content.replace(
  /\/\/ Generate pedestrian paths\s+const pathTiles = generatePaths\(grid, \{/,
  '// Generate pedestrian paths\n  console.time("City: Pathfinding");\n  const pathTiles = generatePaths(grid, {'
);
content = content.replace(
  /connectAllDistricts: true,\s+\}\);/,
  'connectAllDistricts: true,\n  });\n  console.timeEnd("City: Pathfinding");'
);

// 3. Reachability
content = content.replace(
  /\/\/ Verify reachability to key buildings\s+const reachability = verifyReachability\(grid, pathTiles, \{/,
  '// Verify reachability to key buildings\n  console.time("City: Reachability Verify");\n  const reachability = verifyReachability(grid, pathTiles, {'
);
content = content.replace(
  /maxDistance: 60, \/\/ Max 60 tiles to key buildings\s+\}\);/,
  'maxDistance: 60, // Max 60 tiles to key buildings\n  });\n  console.timeEnd("City: Reachability Verify");'
);

// 4. Total Grid Render start and road search variables
content = content.replace(
  /group\.add\(civicFabric\);\s+for \(const cell of grid\) \{/,
  'group.add(civicFabric);\n\n  console.time("City: Total Grid Render");\n  let roadSearchCount = 0;\n  let roadSearchTimeTotal = 0;\n\n  for (const cell of grid) {'
);

// 5. Road Proximity Scan instrumentation
content = content.replace(
  /for \(const seg of roadNetwork\) \{\s+const closest = new THREE\.Vector3\(\);/,
  'const startSearch = performance.now();\n                for (const seg of roadNetwork) {\n                    const closest = new THREE.Vector3();'
);
content = content.replace(
  /nearestPoint\.copy\(closest\);\s+\}\s+\}/,
  'nearestPoint.copy(closest);\n                    }\n                }\n                roadSearchTimeTotal += (performance.now() - startSearch);\n                roadSearchCount++;'
);

// 6. Grid Render End & Reporting
content = content.replace(
  /const walkingLoops = \[walkingLoop, walkingLoopInner, walkingLoopOuter\];/,
  'console.timeEnd("City: Total Grid Render");\n  console.log(`City: Road proximity search executed ${roadSearchCount} times, total time: ${roadSearchTimeTotal.toFixed(2)}ms`);\n\n  const walkingLoops = [walkingLoop, walkingLoopInner, walkingLoopOuter];'
);

// 7. Geometry Merging
content = content.replace(
  /\/\/ Optimize: Batch all generated buildings, props, and paths into merged geometries\s+poolMaterialsAndMerge\(group\);/,
  '// Optimize: Batch all generated buildings, props, and paths into merged geometries\n  console.time("City: poolMaterialsAndMerge");\n  poolMaterialsAndMerge(group);\n  console.timeEnd("City: poolMaterialsAndMerge");'
);

// 8. Total Generation End
content = content.replace(
  /return \{\s+group,/,
  'console.timeEnd("City: Total Generation");\n\n  return {\n    group,'
);

fs.writeFileSync(filePath, content);
console.log('cityPlan.js instrumented successfully.');
