import {residentialDoorX} from './residentialFacades.js';
import {isCountrysideReserved} from './countrysideLayout.js';
import {AGORA_LAYOUT,agoraPoint,agoraXZ} from './cityCivicLayout.js';
import {ACROPOLIS} from './acropolisLayout.js';
// Authored places and street control points for the existing city-plan renderer.
// Keep these on dry city ground; the harbour's layout and water own the coast.
import { CatmullRomCurve3, Vector3 } from 'three';
export const NEIGHBOURHOODS = [
  { id: 'potters', label: "Potters' Court", x: -165, z: 66, kind: 'pottery', width: 26, depth: 22, color: 0xc79668 },
  { id: 'olive', label: 'Olive Court', x: -80, z: 126, kind: 'residential', width: 28, depth: 24, color: 0xc5ba94 },
  { id: 'weavers', label: "Weavers' Yard", x: -180, z: -78, kind: 'weaving', width: 28, depth: 22, color: 0xc2a383 },
  { id: 'garden', label: 'North Garden', x: -85, z: 210, kind: 'garden', width: 30, depth: 26, color: 0xb8b49a },
  { id: 'traders', label: 'Trading Court', x: -20, z: 135, kind: 'trade', width: 28, depth: 24, color: 0xc8b18c },
];

export function neighbourhoodFrontages(place) {
  const north = place.depth / 2 + 5;
  const west = -place.width / 2 - 6;
  return [
    { x: -8, z: north, w: 11, d: 6, rotation: Math.PI },
    { x: 8, z: north, w: 11, d: 6, rotation: Math.PI },
    { x: -8, z: -north, w: 11, d: 6, rotation: 0 },
    { x: west, z: -8, w: 10, d: 6, rotation: Math.PI / 2 },
    { x: west, z: 8, w: 10, d: 6, rotation: Math.PI / 2 },
    { x: -west, z: 8, w: 10, d: 6, rotation: -Math.PI / 2 },
  ].map((f) => ({ ...f, x: f.x + place.x, z: f.z + place.z }))
    .filter(f=>place.id!=='garden'||f.z<place.z+place.depth/2)
    .filter((f) => isCourtyardHomeFrontage(place,f) || !streetSamples.some((p) => Math.hypot(p.x - f.x, p.z - f.z) < Math.hypot(f.w, f.d) / 2 + 3.5));
}

const n=id=>{const p=NEIGHBOURHOODS.find(p=>p.id===id);return[p.x,p.z];};
export const NEIGHBOURHOOD_STREETS=[
{id:'potters-olive',points:[n('potters'),[-145,66],[-133,92],[-104,105],n('olive')]},
{id:'olive-garden',points:[n('olive'),[-110,166],n('garden')]},
{id:'garden-traders',points:[n('garden'),[-35,200],[-12,171],n('traders')]},
{id:'traders-city',points:[n('traders'),[-39,110],[-84,104]]},
{id:'olive-traders',points:[n('olive'),[-50,120],n('traders')]},
{id:'weavers-city',points:[[-170,8],[-184,-8],[-184,-55],n('weavers')]},
{id:'weavers-potters',points:[n('weavers'),[-194,-30],[-186,24],n('potters')]},
];

// Shared city structure: these are the existing nineteen streets, not another
// road generator. Width reserves the established clear corridor; start/end
// widths only taper the same visible terrain-following ribbon.
export const AGORA_FRONTAGES=[
{x:-13,z:20,w:18,d:6,rotation:Math.PI},{x:10,z:20,w:18,d:6,rotation:Math.PI},
{x:-28,z:-10,w:10,d:6,rotation:Math.PI/2},{x:-28,z:11,w:10,d:6,rotation:Math.PI/2},
{x:19,z:-17,w:18,d:6,rotation:0},
].map(f=>({...f,...agoraPoint(f.x,f.z)}));
// Existing objects repositioned off the through routes; no extra props.
export const CITY_FURNISHINGS={fountain:agoraPoint(-13,-8),olive:agoraPoint(13,-9)};
export const CITY_CORE_STREETS = [
{id:"harbour-agora",width:7,startWidth:7,endWidth:6.4,role:"civic-trade",type:"artery",points:[[-105,36],[-70,24],[-30,20],[-14,19],[0,14],[0,10]]},
{id:"sacred-way",width:5,startWidth:5,endWidth:3.2,role:"sacred-approach",type:"artery",points:ACROPOLIS.sacredWay},
{id:"potters-approach",width:4.5,startWidth:4.5,endWidth:3.6,role:"workshops",type:"street",points:[[-105,36],[-132,36],[-145,47],[-152,60],[-165,66]]},
{id:"west-residential-loop",width:6,startWidth:4.4,endWidth:3.4,role:"residential",type:"street",points:ACROPOLIS.residentialBypass},
{id:"north-residential-collector",width:4,startWidth:4,endWidth:3.2,role:"residential",type:"street",points:[[-106.5,50],[-106.5,63],[-92,82],[-84,104],[-80,126]]},
{id:"harbour-perimeter",width:3.5,startWidth:3.5,endWidth:3.5,role:"harbour",type:"street",points:[[10,-40],[10,-8],[10,20],[10,70]]}
];
const CITY_SIDE_STREETS = [
{id:"agora-east-link",width:3,startWidth:3,endWidth:3,role:"civic-trade",type:"street",points:[[-85,40],[-65,32],[-30,20]]},
{id:"agora-ring",width:6,startWidth:5.2,endWidth:5.2,role:"civic",type:"street",points:[[-129,34],[-117,48],[-95,48],[-83,34],[-96,34],[-115,34]]},
{id:"south-coastal-lane",width:5,startWidth:5,endWidth:5,role:"harbour",type:"street",points:[[10,-18],[10,-60],[8,-116],[-55,-130]]},
{id:"potters-back-lane",width:4,startWidth:3.2,endWidth:3.2,role:"workshops",type:"alley",points:[[-133,66],[-145,82],[-174,88],[-165,66]]},
{id:"north-residential-loop",width:4,startWidth:3.2,endWidth:3.2,role:"residential",type:"alley",points:[[-80,126],[-90,147],[-55,158],[-50,135],[-20,135],[-39,110],[-70,102],[-84,104]]},
{id:"harbour-city-cross-street",width:3,startWidth:3,endWidth:3,role:"civic-trade",type:"street",points:[[10,2],[0,2],[-30,10],[-70,24]]}
];
export const CITY_STREETS = [
 ...CITY_CORE_STREETS,
 ...NEIGHBOURHOOD_STREETS.map(street=>({...street,width:4,startWidth:4,endWidth:4,type:'street',role:'neighbourhood'})),
 ...CITY_SIDE_STREETS,
];

// Fuzzy influences guide existing lot recipes; they are not physical district
// boundaries, a save model, or a second placement engine. Harbour/landmarks stay
// with their existing owners. Coordinates are this world's compressed scale.
export const CITY_QUARTERS = [
 {id:'agora',label:'Agora and civic heart',bounds:{west:AGORA_LAYOUT.x-22,east:AGORA_LAYOUT.x+22,south:AGORA_LAYOUT.z-14,north:AGORA_LAYOUT.z+14},role:'open square and covered civic frontages'},
 {id:'workshops',label:'Western workshop streets',bounds:{west:-205,east:-130,south:-100,north:100},role:'pottery, weaving and shopfronts'},
 {id:'residential',label:'Residential lanes',bounds:{west:-115,east:20,south:55,north:170},role:'houses, small courts and quieter lanes'},
 {id:'sacred',label:'Acropolis sacred precinct',bounds:ACROPOLIS.bounds,role:'elevated Parthenon precinct, western gateway and graded sacred approach'},
 {id:'harbour',label:'Harbour and trading edge',bounds:{west:0,east:130,south:-110,north:130},role:'existing compressed coastal district; placements unchanged'},
];
function quarterInfluence(x,z,cx,cz,rx,rz){
 const t=Math.max(0,1-((x-cx)/rx)**2-((z-cz)/rz)**2);return t*t*(3-2*t);
}
export function cityQuarterRecipe(x,z,variation=.5){
 const workshops=quarterInfluence(x,z,-170,38,38,105),homes=quarterInfluence(x,z,-65,115,82,80);
 const total=workshops+homes,influence=Math.min(1,total);
 const sample=Math.max(0,Math.min(.999999,Number.isFinite(variation)?variation:.5));
 if(total<.001||sample>=influence)return null;
 const w=workshops/total,choice=sample/influence;
 const choices=[['house',.72-.5*w],['workshop',.06+.56*w],['courtyard',.16-.1*w],['shop',.06+.04*w]];
 let cumulative=0,type='house';for(const [candidate,weight]of choices){cumulative+=weight;if(choice<cumulative){type=candidate;break;}}
 return {id:w>.5?'workshops':'residential',type,workshopWeight:w,influence,heightRange:[3.1+.1*w,4.7-.5*w]};
}

// Reserve complete building footprints at curved entrances, not just a narrow
// gap at each street's centre. Include the existing Agora approach.
const streetSamples = CITY_STREETS.map(s=>s.points)
  .flatMap((points) => new CatmullRomCurve3(points.map(([x, z]) => new Vector3(x, 0, z)), false, 'catmullrom', 0.2).getSpacedPoints(400));

// Homes follow the same curves as the roads. Staggered frontages join the
// courts into neighbourhoods, with room at bends and intersections.
export const NEIGHBOURHOOD_STREET_FRONTAGES = NEIGHBOURHOOD_STREETS.flatMap((street) => {
  const curve = new CatmullRomCurve3(street.points.map(([x, z]) => new Vector3(x, 0, z)), false, 'catmullrom', 0.2);
  const length = curve.getLength(); const frontages = [];
  for (let distance = 28, i = 0; distance < length - 28; distance += 18, i++) {
    const point = curve.getPointAt(distance / length), tangent = curve.getTangentAt(distance / length);
    const side = i % 2 ? 1 : -1;
    const nx = -tangent.z * side, nz = tangent.x * side;
    const setback=['potters-olive','weavers-potters','olive-traders'].includes(street.id)?8.25:10.5;
    const x = point.x + nx * setback, z = point.z + nz * setback;
    if (Math.hypot(x-AGORA_LAYOUT.x,z-AGORA_LAYOUT.z) < 35 || isCourtReservation(x, z)) continue;
    if (streetSamples.some((p) => Math.hypot(p.x - x, p.z - z) < (setback<10?7.5:9))) continue;
    const recipe=cityQuarterRecipe(x,z,(i*.61803398875)%1);
    frontages.push({ streetId:street.id, x, z, rotation: Math.atan2(-nx, -nz), w: 8, d: 7, workshop: recipe ? recipe.type === 'workshop' : street.id === 'weavers-potters' && i % 3 === 0 });
  }
  return frontages;
});

// Two existing frontages receive bounded forecourts; no new house placement.
export const RESIDENTIAL_STREET_POCKETS=NEIGHBOURHOOD_STREET_FRONTAGES.map((f,index)=>({...f,index,kind:index%2?'herbs':'shade',doorX:residentialDoorX(f.w,index%3)})).filter(f=>f.streetId==='olive-garden');
export function residentialPocketPoint(f,x,z){const c=Math.cos(f.rotation),s=Math.sin(f.rotation);return{x:f.x+c*x+s*z,z:f.z-s*x+c*z};}

export function neighbourhoodAt(x, z) {
  return NEIGHBOURHOODS.find((p) => Math.abs(x - p.x) <= p.width / 2 && Math.abs(z - p.z) <= p.depth / 2);
}

function isCourtReservation(x, z) {
  return NEIGHBOURHOODS.some((p) =>
    Math.abs(x - p.x) <= p.width / 2 + 17 && Math.abs(z - p.z) <= p.depth / 2 + 16);
}

export function isNeighbourhoodLotReserved(x, z) {
  return isCourtReservation(x, z) || NEIGHBOURHOOD_STREET_FRONTAGES.some((f) => Math.hypot(x - f.x, z - f.z) < 11);
}

// These edge pockets reuse existing stoa frontages; the court and street map stay unchanged.
export const AGORA_LIFE_POCKETS=[
 {id:'bread-and-olives',kind:'food',frontage:4,label:'Food seller',role:'merchant',dialogue:'Bread for the road, olives for the table. The harbour brings grain; these jars carry the oil from the countryside.'},
 {id:'pottery-counter',kind:'pottery',frontage:0,label:'Potter',role:'artisan',dialogue:'A small cup for drinking, a broad bowl for supper, a sealed jar for travel. Shape tells you what each vessel is meant to do.'},
 {id:'stoa-gathering',kind:'shade',frontage:3,label:'Stoa speaker',role:'scholar',dialogue:'Stay in the shade a moment. News from the port, a disputed price, a question for the assembly: the square is where stories meet.'},
];

// A bounded adjustment of existing lot/frontage owners along potters-approach.
// Keep street centre lines, civic opening, neighbourhood rewards and coast fixed.
const workshopConnectorCurve=new CatmullRomCurve3(CITY_CORE_STREETS.find(s=>s.id==='potters-approach').points.map(([x,z])=>new Vector3(x,0,z)),false,'catmullrom',.2);
export const WORKSHOP_CONNECTOR={
 lots:[],
 walls:[],
 craft:{x:5,z:6},bench:{x:-8,z:8},resident:{x:5,z:3},
};
export function workshopConnectorLot(cell,frontDepth){
 const lot=WORKSHOP_CONNECTOR.lots.find(p=>p.gridX===cell.gridX&&p.gridZ===cell.gridZ);
 if(!lot)return null;
 const t=lot.distance/workshopConnectorCurve.getLength(),p=workshopConnectorCurve.getPointAt(t),v=workshopConnectorCurve.getTangentAt(t),nx=-v.z*lot.side,nz=v.x*lot.side;
 const setback=frontDepth+3.8;
 return {x:p.x+nx*setback,z:p.z+nz*setback,rotation:Math.atan2(-nx,-nz)};
}
export function workshopConnectorFrontage(place,f){return f;} // Old fixed connector overrides retired; court/street frontages own placement.


// Major landmark roles share this layout owner with districts and streets.
// Locations remain this game's compressed geography, not an exact reconstruction.
export const CITY_LANDMARKS = [
 {id:'harbour-shrine',label:'Harbour shrine',kind:'shrine',x:38,z:-46,rotation:22*Math.PI/180,width:6,depth:9,height:3.6,sign:[31,-38],text:'A quiet place before a voyage. The working quay and warship lie nearby; the great sanctuary above the city remains the principal sacred landmark.'},
 {id:'trading-storehouse',label:'Porters’ storehouse',kind:'warehouse',x:28,z:64,rotation:0,width:12,depth:10,height:4.2,sign:[34,72],text:'Goods wait here between the quays and Trading Court. Porters sort sealed jars and timber before carrying them inland. Follow the coastal lane back to the harbour, or the residential road towards Trading Court.'},
 {id:'civic-hall',label:'Council porch',kind:'hall',...agoraPoint(31,16),rotation:-Math.PI/2,width:14,depth:6,height:4.4,sign:agoraXZ(23,16),text:'Neighbours bring disputes and proposals to this sheltered porch. The Agora beside the porch is the place to meet traders and hear the news; the western stoa speaker is arranging a shared table.'},
 {id:'sacred-temple',label:'Acropolis — Parthenon',kind:'temple',x:ACROPOLIS.x,z:ACROPOLIS.z,rotation:ACROPOLIS.temple.rotation,width:ACROPOLIS.temple.width,depth:ACROPOLIS.temple.depth,height:ACROPOLIS.temple.columnHeight,sign:ACROPOLIS.sign,text:'The Parthenon crowns this elevated sacred precinct. Follow the graded Sacred Way through the western gateway, then walk around the shaded columns to the open eastern sanctuary. Athena stands inside. The Great Theatre remains below the southern wall. This Hellenistic-inspired sanctuary keeps its older Classical monuments in use. Our compressed Athens is an interpretation, not an exact reconstruction.'},
];

// Optional conversations on the three existing court residents. No new NPC,
// quest, reward or save identity; the authored gold side pockets stay in place.
export const COURT_LIFE={
 olive:{label:'Olive Court neighbour',dialogue:'This fountain and the trees are our meeting place. The potters live along the western lane; their serving bowls are needed at the Agora’s shared table. Look into the small side pocket before you go — not every discovery is on the main road.'},
 garden:{label:'Garden keeper',dialogue:'A quiet place to sit after the market. The narrow northern path passes olive trees and a working field; the city loosens into countryside here. The curved lane leads back through Olive Court; the eastern loop carries travellers towards Trading Court and the port. The garden’s small offering rests beside the path, not inside a house.'},
 traders:{label:'Trading Court porter',dialogue:'These counters are for goods arriving from the water. Sealed jars wait at the porters’ storehouse closer to the quays. Follow the inland lane to the Agora for bread and pottery; the working pier is where you can compare the two ships.'},
};

// The dry city occupies one continuous terrain-material region. This does not
// flatten terrain, add a ground surface, or alter the harbour/ocean footprint.
export const CITY_GROUND_ENVELOPE={x:-20,z:80,radiusX:330,radiusZ:430};
export function isCityDryGround(x,z){const c=CITY_GROUND_ENVELOPE;return((x-c.x)/c.radiusX)**2+((z-c.z)/c.radiusZ)**2<=1;}

// One existing north-edge Olive Court frontage becomes an enterable home.
export function isCourtyardHomeFrontage(place,f){return place.id==='olive'&&Math.abs(f.x-(place.x+8))<.01&&Math.abs(f.z-(place.z+place.depth/2+5))<.01;}
export function homeCourtFrontage(place,f){if(place.id!=='olive')return f;if(Math.abs(f.x-(place.x-place.width/2-6))<.01)return{...f,x:f.x+2};if(f.x>place.x+place.width/2)return{...f,x:f.x-2};return f;}

// Consolidate only anonymous generated infill. Authored courts, landmarks and
// activity frontages are separate owners and never enter this policy.
// Retired lots remain recoverable in the source checkpoint/manifest; save IDs
// and the grid's logical path coordinates are unchanged.
export const CITY_INFILL_CONSOLIDATION={maxStreetDistance:28,excessLots:['-2:0','-4:4','-5:3'],moves:[{"id":"-5:7","x":-121.59929568914696,"z":173.24375764587063,"rotation":1.2242182646633566,"route":"olive-garden"}]};

// Relocate six retained anonymous buildings to form a clear residential street.
// Distances and sides refer to the existing collector, not another road owner.
export const CITY_STREET_EDGE_LOTS=[
 {id:'-5:10',distance:24,side:1},{id:'-5:11',distance:24,side:-1},
 {id:'-3:12',distance:40,side:1},{id:'-6:7',distance:40,side:-1},
 {id:'-6:8',distance:58,side:1},{id:'-5:9',distance:73,side:-1},
].map(s=>({...s,streetEdge:true,route:'north-residential-collector'}));
const collectorCurve=new CatmullRomCurve3(CITY_STREETS.find(s=>s.id==='north-residential-collector').points.map(([x,z])=>new Vector3(x,0,z)),false,'catmullrom',.2);
export function fitCityStreetLot(spec,frontDepth=6){const t=spec.distance/collectorCurve.getLength(),p=collectorCurve.getPointAt(t),v=collectorCurve.getTangentAt(t),nx=-v.z*spec.side,nz=v.x*spec.side,setback=frontDepth+3.8;return{...spec,x:p.x+nx*setback,z:p.z+nz*setback,rotation:Math.atan2(-nx,-nz)};}

const infillStreetSamples=CITY_STREETS.flatMap(s=>new CatmullRomCurve3(s.points.map(([x,z])=>new Vector3(x,0,z)),false,'catmullrom',.2).getSpacedPoints(90));
export function cityInfillDecision(cell){
 const id=cell.gridX+':'+cell.gridZ;
 const distance=Math.min(...infillStreetSamples.map(p=>Math.hypot(p.x-cell.position.x,p.z-cell.position.z)));
 const edge=CITY_STREET_EDGE_LOTS.find(p=>p.id===id);
 const move=edge?fitCityStreetLot(edge):CITY_INFILL_CONSOLIDATION.moves.find(p=>p.id===id);
 const protectedLot=WORKSHOP_CONNECTOR.lots.some(p=>p.gridX===cell.gridX&&p.gridZ===cell.gridZ);
 return {id,distance,retire:!protectedLot&&!move&&(isCountrysideReserved(cell.position.x,cell.position.z)||CITY_INFILL_CONSOLIDATION.excessLots.includes(id)||cell.district!=='civic'&&cell.district!=='sacred'&&cell.district!=='harbor'&&distance>CITY_INFILL_CONSOLIDATION.maxStreetDistance),move:move??null};
}

// Practical court-edge pockets, clear of fountains, gates and through streets.
export const COURT_STREET_LIFE={olive:{kind:'household',x:-11.5,z:0,rotation:Math.PI/2},traders:{kind:'packing',x:14.8,z:5,rotation:-Math.PI/2}};







