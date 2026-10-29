import assert from 'node:assert/strict';
import {cityInfillDecision,CITY_INFILL_CONSOLIDATION,CITY_STREETS,NEIGHBOURHOODS,AGORA_FRONTAGES} from '../src/world/neighbourhoodLayout.js';
const cell=(gridX,gridZ,x,z,district='residential')=>({gridX,gridZ,position:{x,z},district});
assert.equal(cityInfillDecision(cell(-8,0,-192.7,-3.75)).retire,true,'Unserved far western lot retires');
assert.equal(cityInfillDecision(cell(-6,-1,-147.71,-20.66)).retire,false,'Connected workshop lane infill stays');
assert.equal(cityInfillDecision(cell(-3,2,-75.6,43.5)).retire,false,'Authored connector lot remains protected');
assert.equal(cityInfillDecision(cell(99,99,-190,-190,'sacred')).retire,false,'Sacred owner is never retired by infill policy');
assert.equal(CITY_INFILL_CONSOLIDATION.moves.length,4);
for(const move of CITY_INFILL_CONSOLIDATION.moves){assert.ok(CITY_STREETS.some(r=>r.id===move.route));assert.ok([move.x,move.z,move.rotation].every(Number.isFinite));const [x,z]=move.id.split(':').map(Number);assert.equal(cityInfillDecision(cell(x,z,-190,-190)).move,move);}
assert.equal(CITY_STREETS.length,19);assert.equal(NEIGHBOURHOODS.length,5);assert.deepEqual([AGORA_FRONTAGES[4].x,AGORA_FRONTAGES[4].z],[-11,3]);
console.log('PASS: unserved infill retirement, protected owners, four canonical street-facing moves, unchanged district anchors.');
