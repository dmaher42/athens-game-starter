import * as THREE from 'three';

// Static moored ships: derive dry interiors once from the actual hull/sea
// intersection. No duplicate floor, ocean mesh or per-frame scene traversal.
export const MAX_WATER_HULLS=2;
export const MAX_HULL_EDGES=96;
export const HULL_WATER_INSET=.005;
const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
const key=p=>`${p.x.toFixed(6)}:${p.y.toFixed(6)}`;
function waterlinePolygon(segments){
 const graph=new Map();
 const node=p=>{const k=key(p);if(!graph.has(k))graph.set(k,{point:p,neighbours:new Set()});return k;};
 const connect=(a,b)=>{if(a===b)return;graph.get(a).neighbours.add(b);graph.get(b).neighbours.add(a);};
 for(const[a,b]of segments)connect(node(a),node(b));
 // The authored hull is open at its tiny bow/stern end sections. Close each
 // end at the sea plane, pairing nearest endpoints rather than an outer box.
 const ends=[...graph].filter(([,n])=>n.neighbours.size===1).map(([k])=>k);
 while(ends.length){let ai=0,bi=1,distance=Infinity;for(let a=0;a<ends.length;a++)for(let b=a+1;b<ends.length;b++){const d=graph.get(ends[a]).point.distanceToSquared(graph.get(ends[b]).point);if(d<distance){distance=d;ai=a;bi=b;}}if(ends.length<2)throw Error('Unpaired hull waterline');connect(ends[ai],ends[bi]);ends.splice(bi,1);ends.splice(ai,1);}
 if(!graph.size)return[];for(const n of graph.values())if(n.neighbours.size!==2)throw Error('Branched hull waterline');
 const start=graph.keys().next().value,polygon=[];let current=start,previous=null;
 do{const n=graph.get(current);polygon.push(n.point);const next=[...n.neighbours].find(k=>k!==previous);previous=current;current=next;if(polygon.length>graph.size)throw Error('Broken hull waterline loop');}while(current!==start);
 if(polygon.length!==graph.size)throw Error('Multiple hull waterline loops');
 let area=0;for(let i=0;i<polygon.length;i++){const a=polygon[i],b=polygon[(i+1)%polygon.length];area+=a.x*b.y-b.x*a.y;}if(area<0)polygon.reverse();
 // Preserve concave details. If necessary, remove only the smallest convex ears
 // (with no other boundary point in their triangles): replacement chords remain inside the measured footprint.
 while(polygon.length>MAX_HULL_EDGES){let best=-1,cost=Infinity;for(let i=0;i<polygon.length;i++){const a=polygon[(i+polygon.length-1)%polygon.length],b=polygon[i],c=polygon[(i+1)%polygon.length],turn=cross(a,b,c);if(turn>1e-12&&turn<cost){const previous=(i+polygon.length-1)%polygon.length,next=(i+1)%polygon.length,containsOther=polygon.some((p,j)=>j!==previous&&j!==i&&j!==next&&cross(a,b,p)>=-1e-12&&cross(b,c,p)>=-1e-12&&cross(c,a,p)>=-1e-12);if(!containsOther){cost=turn;best=i;}}}if(best<0)throw Error('Hull edge budget cannot be simplified safely');polygon.splice(best,1);}
 return polygon;
}
export function buildShipWaterExclusions(ships,waterY){
 const edges=Array.from({length:MAX_WATER_HULLS*MAX_HULL_EDGES},()=>new THREE.Vector4()),bounds=Array.from({length:MAX_WATER_HULLS},()=>new THREE.Vector4()),counts=new THREE.Vector2(),hulls=[];
 for(const ship of ships){if(hulls.length===MAX_WATER_HULLS)throw Error('Boardable ship water-mask budget exceeded');const hull=ship.getObjectByName('CurvedShipHull');if(!hull?.geometry)continue;hull.updateWorldMatrix(true,false);const geometry=hull.geometry,p=geometry.attributes.position,index=geometry.index,segments=[];
  for(let i=0;i<(index?.count??p.count);i+=3){const triangle=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,index?index.getX(i+j):i+j).applyMatrix4(hull.matrixWorld)),hits=[];for(let j=0;j<3;j++){const a=triangle[j],b=triangle[(j+1)%3],ay=a.y-waterY,by=b.y-waterY;if((ay<0)!==(by<0)){const t=-ay/(by-ay);hits.push(new THREE.Vector2(a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t));}}if(hits.length===2&&hits[0].distanceToSquared(hits[1])>1e-16)segments.push(hits);}
  const polygon=waterlinePolygon(segments);if(polygon.length<3)continue;const slot=hulls.length,min=new THREE.Vector2(Infinity,Infinity),max=new THREE.Vector2(-Infinity,-Infinity);
  for(let i=0;i<polygon.length;i++){const a=polygon[i],b=polygon[(i+1)%polygon.length];edges[slot*MAX_HULL_EDGES+i].set(a.x,a.y,b.x,b.y);min.min(a);max.max(a);}bounds[slot].set(min.x,min.y,max.x,max.y);counts.setComponent(slot,polygon.length);hulls.push({name:ship.name,polygon:polygon.map(p=>p.toArray()),edgeCount:polygon.length});
 }return{edges,bounds,counts,hulls,count:hulls.length,waterY};
}
export function isInsideShipWaterExclusion(data,x,z){
 for(let h=0;h<data.count;h++){const b=data.bounds[h];if(x<b.x||z<b.y||x>b.z||z>b.w)continue;let inside=false,boundary=false;
  for(let e=0;e<data.counts.getComponent(h);e++){const v=data.edges[h*MAX_HULL_EDGES+e],dx=v.z-v.x,dz=v.w-v.y,t=THREE.MathUtils.clamp(((x-v.x)*dx+(z-v.y)*dz)/(dx*dx+dz*dz),0,1);if((x-v.x-t*dx)**2+(z-v.y-t*dz)**2<HULL_WATER_INSET**2){boundary=true;break;}if((v.y>z)!==(v.w>z)&&x<(v.z-v.x)*(z-v.y)/(v.w-v.y)+v.x)inside=!inside;}
  if(inside&&!boundary)return true;
 }return false;
}
export function configureShipWaterExclusions(water,ships){
 if(!water?.material?.isShaderMaterial)return null;water.updateWorldMatrix(true,false);const material=water.material,data=buildShipWaterExclusions(ships,water.getWorldPosition(new THREE.Vector3()).y),uniforms={uWaterHullCount:{value:data.count},uWaterHullEdges:{value:data.edges},uWaterHullBounds:{value:data.bounds},uWaterHullEdgeCounts:{value:data.counts}};for(const [name,uniform]of Object.entries(uniforms)){if(material.uniforms[name])material.uniforms[name].value=uniform.value;else material.uniforms[name]=uniform;}water.userData.shipWaterExclusions=data;if(material.userData.shipWaterExclusionInstalled)return data;
 const previous=material.onBeforeCompile,previousKey=material.customProgramCacheKey();material.onBeforeCompile=function(shader,renderer){previous.call(this,shader,renderer);for(const name of Object.keys(uniforms))shader.uniforms[name]=material.uniforms[name];const anchor='void main() {';if(!shader.fragmentShader.includes(anchor))throw Error('Water shader main changed; hull exclusion could not be applied');
  const header=`uniform int uWaterHullCount;\nuniform vec4 uWaterHullEdges[${MAX_WATER_HULLS*MAX_HULL_EDGES}];\nuniform vec4 uWaterHullBounds[${MAX_WATER_HULLS}];\nuniform vec2 uWaterHullEdgeCounts;\n`;
  const discard=`\nfor(int h=0;h<${MAX_WATER_HULLS};h++){\n if(h>=uWaterHullCount)break;\n vec4 b=uWaterHullBounds[h];vec2 p=worldPosition.xz;\n if(p.x<b.x||p.y<b.y||p.x>b.z||p.y>b.w)continue;\n bool insideHull=false;bool onBoundary=false;int edgeCount=int(uWaterHullEdgeCounts[h]);\n for(int e=0;e<${MAX_HULL_EDGES};e++){\n  if(e>=edgeCount)break;\n  vec4 edge=uWaterHullEdges[h*${MAX_HULL_EDGES}+e];vec2 a=edge.xy;vec2 d=edge.zw-a;\n  float t=clamp(dot(p-a,d)/dot(d,d),0.0,1.0);vec2 gap=p-a-t*d;\n  if(dot(gap,gap)<${(HULL_WATER_INSET**2).toFixed(8)}){onBoundary=true;break;}\n  if((a.y>p.y)!=(edge.w>p.y)){float crossing=(edge.z-a.x)*(p.y-a.y)/(edge.w-a.y)+a.x;if(p.x<crossing)insideHull=!insideHull;}\n }\n if(insideHull&&!onBoundary) discard;\n}\n`;
  shader.fragmentShader=header+shader.fragmentShader.replace(anchor,anchor+discard);
 };material.customProgramCacheKey=()=>previousKey+':ship-water-exclusion-v2';material.userData.shipWaterExclusionInstalled=true;material.needsUpdate=true;return data;
}


