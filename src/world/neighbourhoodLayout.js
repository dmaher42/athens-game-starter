import {ACROPOLIS} from './acropolisLayout.js';
// Authored places and street control points for the existing city-plan renderer.
// Keep these on dry city ground; the harbour's layout and water own the coast.
import { CatmullRomCurve3, Vector3 } from 'three';
export const NEIGHBOURHOODS = [
  { id: 'potters', label: "Potters' Court", x: -108, z: 42, kind: 'pottery', width: 26, depth: 22, color: 0xc79668 },
  { id: 'olive', label: 'Olive Court', x: -80, z: 126, kind: 'residential', width: 28, depth: 24, color: 0xc5ba94 },
  { id: 'weavers', label: "Weavers' Yard", x: -180, z: -78, kind: 'weaving', width: 28, depth: 22, color: 0xc2a383 },
  { id: 'garden', label: 'North Garden', x: -85, z: 250, kind: 'garden', width: 30, depth: 26, color: 0xb8b49a },
  { id: 'traders', label: 'Trading Court', x: 60, z: 146, kind: 'trade', width: 28, depth: 24, color: 0xc8b18c },
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
    .filter((f) => !streetSamples.some((p) => Math.hypot(p.x - f.x, p.z - f.z) < Math.hypot(f.w, f.d) / 2 + 3.5));
}

export const NEIGHBOURHOOD_STREETS = [
  { id: 'potters-olive', points: [[-108, 42], [-110, 82], [-80, 126]] },
  { id: 'olive-garden', points: [[-80, 126], [-112, 180], [-85, 250]] },
  { id: 'garden-traders', points: [[-85, 250], [-12, 252], [50, 210], [60, 146]] },
  { id: 'traders-city', points: [[60, 146], [40, 126], [20, 105]] },
  { id: 'olive-traders', points: [[-80, 126], [-36, 100], [-8, 116], [20, 130], [60, 146]] },
  { id: 'weavers-city', points: [[-170,8],[-184,-8],[-184,-55],[-180,-78]] },
  { id: 'weavers-potters', points: [[-180,-78],[-194,-30],[-170,15],[-108,42]] },
];

// Shared city structure: these are the existing nineteen streets, not another
// road generator. Width reserves the established clear corridor; start/end
// widths only taper the same visible terrain-following ribbon.
export const AGORA_FRONTAGES = [
  { x: -43, z: 40, w: 18, d: 6, rotation: Math.PI },
  { x: -20, z: 40, w: 18, d: 6, rotation: Math.PI },
  { x: -58, z: 10, w: 10, d: 6, rotation: Math.PI / 2 },
  { x: -58, z: 31, w: 10, d: 6, rotation: Math.PI / 2 },
  // Keep frontage index 4: food goods, NPC station and commission marker derive
  // from this one transform, so saved activity IDs survive the sanctuary move.
  { x: -11, z: 3, w: 18, d: 6, rotation: 0 },
];
// Existing objects repositioned off the through routes; no extra props.
export const CITY_FURNISHINGS = {fountain:{x:-43,z:12},sideCourt:{x:-74,z:28},olive:{x:-17,z:11}};
export const CITY_CORE_STREETS = [
  {
    "id": "harbour-agora",
    "width": 7,
    "startWidth": 7,
    "endWidth": 6.4,
    "role": "civic-trade",
    "type": "artery",
    "points": [
      [
        -30,
        20
      ],
      [
        -14,
        19
      ],
      [
        0,
        14
      ],
      [
        0,
        10
      ]
    ]
  },
  {
    "id": "sacred-way",
    "width": 5,
    "startWidth": 5,
    "endWidth": 3.2,
    "role": "sacred-approach",
    "type": "artery",
    "points": ACROPOLIS.sacredWay
  },
  {
    "id": "potters-approach",
    "width": 4.5,
    "startWidth": 4.5,
    "endWidth": 3.6,
    "role": "workshops",
    "type": "street",
    "points": [
      [
        -30,
        20
      ],
      [
        -55,
        20
      ],
      [
        -70,
        28
      ],
      [
        -82,
        38
      ],
      [
        -108,
        42
      ]
    ]
  },
  {
    "id": "west-residential-loop",
    "width": 6,
    "startWidth": 4.4,
    "endWidth": 3.4,
    "role": "residential",
    "type": "street",
    "points": ACROPOLIS.residentialBypass
  },
  {
    "id": "north-residential-collector",
    "width": 4,
    "startWidth": 4,
    "endWidth": 3.2,
    "role": "residential",
    "type": "street",
    "points": [
      [
        -31.5,
        34
      ],
      [
        -31.5,
        47
      ],
      [
        -18,
        63
      ],
      [
        12,
        82
      ],
      [
        20,
        105
      ]
    ]
  },
  {
    "id": "harbour-perimeter",
    "width": 3.5,
    "startWidth": 3.5,
    "endWidth": 3.5,
    "role": "harbour",
    "type": "street",
    "points": [
      [
        10,
        -40
      ],
      [
        10,
        -8
      ],
      [
        10,
        20
      ],
      [
        10,
        70
      ]
    ]
  }
];
const CITY_SIDE_STREETS = [
  {
    "id": "agora-east-link",
    "width": 3,
    "startWidth": 3,
    "endWidth": 3,
    "role": "civic-trade",
    "type": "street",
    "points": [
      [
        -10,
        24
      ],
      [
        8,
        18
      ],
      [
        10,
        12
      ]
    ]
  },
  {
    "id": "agora-ring",
    "width": 6,
    "startWidth": 5.2,
    "endWidth": 5.2,
    "role": "civic",
    "type": "street",
    "points": [
      [
        -54,
        18
      ],
      [
        -42,
        34
      ],
      [
        -20,
        36
      ],
      [
        -8,
        18
      ],
      [
        -18,
        2
      ],
      [
        -40,
        4
      ]
    ]
  },
  {
    "id": "south-coastal-lane",
    "width": 5,
    "startWidth": 5,
    "endWidth": 5,
    "role": "harbour",
    "type": "street",
    "points": [[10,-18],[10,-60],[8,-116],[-55,-130]]
  },
  {
    "id": "potters-back-lane",
    "width": 4,
    "startWidth": 3.2,
    "endWidth": 3.2,
    "role": "workshops",
    "type": "alley",
    "points": [
      [
        -60,
        30
      ],
      [
        -78,
        18
      ],
      [
        -96,
        32
      ],
      [
        -112,
        42
      ]
    ]
  },
  {
    "id": "north-residential-loop",
    "width": 4,
    "startWidth": 3.2,
    "endWidth": 3.2,
    "role": "residential",
    "type": "alley",
    "points": [
      [
        20,
        105
      ],
      [
        0,
        116
      ],
      [
        -22,
        118
      ],
      [
        -36,
        100
      ]
    ]
  },
  {
    "id": "harbour-city-cross-street",
    "width": 3,
    "startWidth": 3,
    "endWidth": 3,
    "role": "civic-trade",
    "type": "street",
    "points": [
      [
        10,
        2
      ],
      [
        0,
        2
      ],
      [
        -18,
        2
      ],
      [
        -34,
        2
      ]
    ]
  }
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
 {id:'agora',label:'Agora and civic heart',bounds:{west:-52,east:-8,south:6,north:34},role:'open square and covered civic frontages'},
 {id:'workshops',label:'Western workshop streets',bounds:{west:-145,east:-65,south:-95,north:70},role:'pottery, weaving and shopfronts'},
 {id:'residential',label:'Residential lanes',bounds:{west:-115,east:20,south:55,north:170},role:'houses, small courts and quieter lanes'},
 {id:'sacred',label:'Acropolis sacred precinct',bounds:ACROPOLIS.bounds,role:'elevated Parthenon precinct, western gateway and graded sacred approach'},
 {id:'harbour',label:'Harbour and trading edge',bounds:{west:0,east:130,south:-110,north:130},role:'existing compressed coastal district; placements unchanged'},
];
function quarterInfluence(x,z,cx,cz,rx,rz){
 const t=Math.max(0,1-((x-cx)/rx)**2-((z-cz)/rz)**2);return t*t*(3-2*t);
}
export function cityQuarterRecipe(x,z,variation=.5){
 const workshops=quarterInfluence(x,z,-105,10,48,95),homes=quarterInfluence(x,z,-65,115,82,80);
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
const streetSamples = [...NEIGHBOURHOOD_STREETS.map((s) => s.points), CITY_CORE_STREETS.find(s=>s.id==='potters-approach').points]
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
    if (Math.hypot(x + 30, z - 20) < 80 || isCourtReservation(x, z)) continue;
    if (streetSamples.some((p) => Math.hypot(p.x - x, p.z - z) < (setback<10?7.5:9))) continue;
    const recipe=cityQuarterRecipe(x,z,(i*.61803398875)%1);
    frontages.push({ x, z, rotation: Math.atan2(-nx, -nz), w: 8, d: 7, workshop: recipe ? recipe.type === 'workshop' : street.id === 'weavers-potters' && i % 3 === 0 });
  }
  return frontages;
});

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
 lots:[{gridX:-3,gridZ:0,distance:62,side:1},{gridX:-3,gridZ:2,distance:55,side:-1}],
 walls:[{x:-117,z:55,w:12,d:.4},{x:-93.5,z:55,w:3,d:.4}],
 craft:{x:5,z:6},bench:{x:-8,z:8},resident:{x:5,z:3},
};
export function workshopConnectorLot(cell,frontDepth){
 const lot=WORKSHOP_CONNECTOR.lots.find(p=>p.gridX===cell.gridX&&p.gridZ===cell.gridZ);
 if(!lot)return null;
 const t=lot.distance/workshopConnectorCurve.getLength(),p=workshopConnectorCurve.getPointAt(t),v=workshopConnectorCurve.getTangentAt(t),nx=-v.z*lot.side,nz=v.x*lot.side;
 const setback=frontDepth+3.8;
 return {x:p.x+nx*setback,z:p.z+nz*setback,rotation:Math.atan2(-nx,-nz)};
}
export function workshopConnectorFrontage(place,f){
 if(place.id!=='potters')return f;
 if(Math.abs(f.x-(place.x-place.width/2-6))<.01&&Math.abs(f.z-(place.z-8))<.01)return {...f,x:-101,z:54,rotation:Math.PI};
 if(f.x>place.x&&Math.abs(f.z-(place.z+8))<.01)return {...f,z:48};
 return f;
}


// Major landmark roles share this layout owner with districts and streets.
// Locations remain this game's compressed geography, not an exact reconstruction.
export const CITY_LANDMARKS = [
 {id:'harbour-shrine',label:'Harbour shrine',kind:'shrine',x:38,z:-46,rotation:22*Math.PI/180,width:6,depth:9,height:3.6,sign:[31,-38],text:'A quiet place before a voyage. The working quay and warship lie nearby; the great sanctuary above the city remains the principal sacred landmark.'},
 {id:'trading-storehouse',label:'Porters’ storehouse',kind:'warehouse',x:28,z:64,rotation:0,width:12,depth:10,height:4.2,sign:[34,72],text:'Goods wait here between the quays and Trading Court. Porters sort sealed jars and timber before carrying them inland. Follow the coastal lane back to the harbour, or the residential road towards Trading Court.'},
 {id:'civic-hall',label:'Council porch',kind:'hall',x:-64,z:49,rotation:Math.PI/2,width:14,depth:6,height:4.4,sign:[-56,49],text:'Neighbours bring disputes and proposals to this sheltered porch. The Agora below is the place to meet traders and hear the news; the western stoa speaker is arranging a shared table.'},
 {id:'sacred-temple',label:'Acropolis — Parthenon',kind:'temple',x:ACROPOLIS.x,z:ACROPOLIS.z,rotation:ACROPOLIS.temple.rotation,width:ACROPOLIS.temple.width,depth:ACROPOLIS.temple.depth,height:ACROPOLIS.temple.columnHeight,sign:ACROPOLIS.sign,text:'The Parthenon crowns this elevated sacred precinct. Follow the graded Sacred Way through the western gateway, then walk around the shaded columns to the open eastern sanctuary. Athena stands inside. The Great Theatre remains below the southern wall. This Hellenistic-inspired sanctuary keeps its older Classical monuments in use. Our compressed Athens is an interpretation, not an exact reconstruction.'},
];

// Optional conversations on the three existing court residents. No new NPC,
// quest, reward or save identity; the authored gold side pockets stay in place.
export const COURT_LIFE={
 olive:{label:'Olive Court neighbour',dialogue:'This fountain and the trees are our meeting place. The potters live along the western lane; their serving bowls are needed at the Agora’s shared table. Look into the small side pocket before you go — not every discovery is on the main road.'},
 garden:{label:'Garden keeper',dialogue:'A quiet place to sit after the market. The curved lane leads back through Olive Court; the eastern loop carries travellers towards Trading Court and the port. The garden’s small offering rests beside the path, not inside a house.'},
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
export const CITY_INFILL_CONSOLIDATION={maxStreetDistance:38,excessLots:['-2:0'],moves:[
  {
    "id": "-6:1",
    "x": -133.64531682509926,
    "z": 20.404316630920675,
    "rotation": 1.99667815330205,
    "route": "weavers-potters"
  },
  {
    "id": "-5:7",
    "x": -121.59929568914696,
    "z": 173.24375764587063,
    "rotation": 1.2242182646633566,
    "route": "olive-garden"
  },
  {
    "id": "1:8",
    "x": 22.307101552887406,
    "z": 218.11281741921684,
    "rotation": 0.6117695633950524,
    "route": "garden-traders"
  },
  {
    "id": "0:6",
    "x": 3.289598373722005,
    "z": 134.09709833876292,
    "rotation": 2.6777523783123134,
    "route": "olive-traders"
  }
]};
const infillStreetSamples=CITY_STREETS.flatMap(s=>new CatmullRomCurve3(s.points.map(([x,z])=>new Vector3(x,0,z)),false,'catmullrom',.2).getSpacedPoints(90));
export function cityInfillDecision(cell){
 const id=cell.gridX+':'+cell.gridZ;
 const distance=Math.min(...infillStreetSamples.map(p=>Math.hypot(p.x-cell.position.x,p.z-cell.position.z)));
 const move=CITY_INFILL_CONSOLIDATION.moves.find(p=>p.id===id);
 const protectedLot=WORKSHOP_CONNECTOR.lots.some(p=>p.gridX===cell.gridX&&p.gridZ===cell.gridZ);
 return {id,distance,retire:!protectedLot&&!move&&(CITY_INFILL_CONSOLIDATION.excessLots.includes(id)||cell.district!=='civic'&&cell.district!=='sacred'&&cell.district!=='harbor'&&distance>CITY_INFILL_CONSOLIDATION.maxStreetDistance),move:move??null};
}

// Practical court-edge pockets, clear of fountains, gates and through streets.
export const COURT_STREET_LIFE={olive:{kind:'household',x:-11.5,z:0,rotation:Math.PI/2},traders:{kind:'packing',x:14.8,z:5,rotation:-Math.PI/2}};
