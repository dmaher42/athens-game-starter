const fs = require('fs');

const path = 'src/world/cityPlan.js';
let content = fs.readFileSync(path, 'utf8');

const anchorStart = "       const detailLevel = resolveBuildingDetailLevel(cell);";
const anchorEndLiteral = "           buildingGroup.rotation.y = rot;";

const indexStart = content.indexOf(anchorStart);
const indexEnd = content.indexOf(anchorEndLiteral);
if (indexStart === -1 || indexEnd === -1) {
    console.error("Anchors not found:", indexStart, indexEnd);
    process.exit(1);
}

// Keep advancing indexEnd until we capture the full group.add(buildingGroup); } blocks
let trueEnd = indexEnd;
const closingSignature = "group.add(buildingGroup);";
const closingIndex = content.indexOf(closingSignature, indexEnd);
if(closingIndex !== -1) {
    trueEnd = closingIndex + closingSignature.length;
    // skip the remaining bracket if any
    let rest = content.substring(trueEnd);
    if(rest.trimStart().startsWith('}')) {
        trueEnd += rest.indexOf('}') + 1;
    }
} else {
    trueEnd = indexEnd + anchorEndLiteral.length;
}


const replacement = `       const detailLevel = resolveBuildingDetailLevel(cell);
       
       const isClusterable = (cell.district === 'residential' || cell.district === 'commercial') && !isAgoraEdgeBuildingCell(cell.gridX, cell.gridZ);
       const numSubBuildings = isClusterable ? Math.floor(rng() * 3) + 1 : 1;

       for (let i = 0; i < numSubBuildings; i++) {
           const buildingGroup = spawnBuilding({
             district: cell.district,
             rng: rng,
             districtRules: resolveDistrictRuleForCell(cell.district, districtRules, cell),
             detailLevel,
             preferRowhouseMass:
               isHarborLaneFrontageCell(cell.gridX, cell.gridZ) ||
               isAgoraEdgeBuildingCell(cell.gridX, cell.gridZ) ||
               (numSubBuildings > 1),
           });

           if (buildingGroup) {
               if (cell.district === 'harbor') {
                 if (i === 0 && rng() < 0.12) {
                   const lowAccent = createHarborFrontAccent(rng);
                   lowAccent.position.set(localX, localY, localZ);
                   lowAccent.rotation.y = Math.floor(rng() * 4) * (Math.PI / 2);
                   group.add(lowAccent);
                 }
                 continue;
               }

               let subX = localX;
               let subZ = localZ;

               if (numSubBuildings > 1) {
                   subX += (rng() - 0.5) * 14.5;
                   subZ += (rng() - 0.5) * 14.5;
               }

               const subY = sampleLocalHeight(subX, subZ, localY);
               const subCell = { ...cell, position: { x: subX, y: subY, z: subZ } };

               applyAgoraScalePass(buildingGroup, subCell);
               applyBuildingShadowProfile(buildingGroup, subCell, detailLevel);
               buildingGroup.position.set(subX, subY, subZ);

               let rot = Math.floor(rng() * 4) * (Math.PI / 2);

               let nearestTarget = null;
               let nearestDist = Infinity;
               for (const targetCell of grid) {
                   if (targetCell.type === 'road' || targetCell.type === 'plaza') {
                       const dist = Math.hypot(targetCell.position.x - subX, targetCell.position.z - subZ);
                       if (dist < nearestDist) {
                           nearestDist = dist;
                           nearestTarget = targetCell;
                       }
                   }
               }

               if (nearestTarget && nearestDist <= BLOCK_SIZE * 1.5) {
                   const dx = nearestTarget.position.x - subX;
                   const dz = nearestTarget.position.z - subZ;
                   rot = Math.atan2(dx, dz);

                   if (cell.district === 'civic' || cell.district === 'commercial') {
                       const snapped = Math.round(rot / (Math.PI / 2)) * (Math.PI / 2);
                       rot = rot * 0.65 + snapped * 0.35;
                   }
               } else if (cell.slope > SLOPE_THRESHOLDS.FLAT) {
                   const north = sampleLocalHeight(subX, subZ + 5, subY);
                   const south = sampleLocalHeight(subX, subZ - 5, subY);
                   const east = sampleLocalHeight(subX + 5, subZ, subY);
                   const west = sampleLocalHeight(subX - 5, subZ, subY);

                   const dz = south - north;
                   const dx = west - east;

                   rot = Math.atan2(dx, dz);
               }

               if (cell.district !== 'civic' && cell.district !== 'sacred') {
                   rot += (rng() - 0.5) * (Math.PI / 5.0);
               }

               buildingGroup.rotation.y = rot;
               group.add(buildingGroup);
           }
       }`;

const newContent = content.substring(0, indexStart) + replacement + content.substring(trueEnd);
fs.writeFileSync(path, newContent, 'utf8');
console.log("Successfully injected Phase 2 High Density Clustering.");
