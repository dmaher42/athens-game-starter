// Read-only cartography derived from the same owners that place the world.
// No independent street coordinates or invented districts belong here.
import {COUNTRYSIDE,COUNTRYSIDE_TRAILS} from './countrysideLayout.js';
import {CatmullRomCurve3,Vector3} from 'three';
import {CITY_STREETS,NEIGHBOURHOODS,CITY_LANDMARKS,neighbourhoodFrontages,isCourtyardHomeFrontage} from './neighbourhoodLayout.js';
import {GREAT_THEATRE,THEATRE_SANCTUARY} from './greatTheatreLayout.js';
import {ACROPOLIS} from './acropolisLayout.js';
import {AGORA_CENTER_3D,HARBOR_CENTER_3D} from './locations.js';
const point=(id,name,x,z,type='district')=>({id,name,position:{x,z},type});
const olive=NEIGHBOURHOODS.find(p=>p.id==='olive');
const home=neighbourhoodFrontages(olive).find(f=>isCourtyardHomeFrontage(olive,f));
export const CITY_MAP_FEATURES=[
 point('garden-field','Field walk',...COUNTRYSIDE.cue,'landmark'),
 point('agora','Agora - shared table',AGORA_CENTER_3D.x,AGORA_CENTER_3D.z,'activity'),
 point('harbour','Harbour - ships',HARBOR_CENTER_3D.x,HARBOR_CENTER_3D.z,'activity'),
 point('parthenon','Parthenon',ACROPOLIS.x,ACROPOLIS.z,'landmark'),
 point('gateway','Propylaia gateway',ACROPOLIS.gatewayAsset.originX,ACROPOLIS.gatewayAsset.originZ,'landmark'),
 point('dionysos-sanctuary','Dionysos sanctuary',THEATRE_SANCTUARY.x,THEATRE_SANCTUARY.z,'landmark'),
 point('theatre','Great Theatre',GREAT_THEATRE.x,GREAT_THEATRE.z,'activity'),
 ...NEIGHBOURHOODS.map(p=>point(p.id,p.label,p.x,p.z)),
 ...CITY_LANDMARKS.filter(p=>p.id!=='sacred-temple').map(p=>point(p.id,p.label,p.x,p.z,'landmark')),
 ...(home?[point('courtyard-home','Courtyard home',home.x,home.z,'activity')]:[]),
];
export const CITY_MAP_ROUTES=CITY_STREETS.map(s=>({id:s.id,type:s.type,width:s.width,
 points:new CatmullRomCurve3(s.points.map(([x,z])=>new Vector3(x,0,z)),false,'catmullrom',.2)
 .getSpacedPoints(90).map(p=>({x:p.x,z:p.z}))}));
// The theatre's short footpath is owned by its landmark, not CITY_STREETS.
for(const s of COUNTRYSIDE_TRAILS)CITY_MAP_ROUTES.push({...s,points:new CatmullRomCurve3(s.points.map(([x,z])=>new Vector3(x,0,z)),false,'catmullrom',.2).getSpacedPoints(60).map(p=>({x:p.x,z:p.z}))});
CITY_MAP_ROUTES.push({id:'theatre-entry',type:'path',width:2,points:GREAT_THEATRE.approach.map(([x,z])=>({x,z}))});



CITY_MAP_ROUTES.push({id:'theatre-sanctuary',type:'path',width:1.8,points:THEATRE_SANCTUARY.approach.map(([x,z])=>({x,z}))});
