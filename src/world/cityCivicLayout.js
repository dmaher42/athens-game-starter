// The civic anchor is separate only to avoid terrain/layout import cycles.
// Existing terrain, streets, frontages, actors and map consume this one contract.
export const AGORA_LAYOUT=Object.freeze({x:-105,z:36,width:44,depth:28});
export const agoraPoint=(x,z)=>({x:AGORA_LAYOUT.x+x,z:AGORA_LAYOUT.z+z});
export const agoraXZ=(x=0,z=0)=>[AGORA_LAYOUT.x+x,AGORA_LAYOUT.z+z];

// One grade on the existing terrain includes covered frontages, not just the open square.
export const AGORA_GRADE_BOUNDS={west:AGORA_LAYOUT.x-35,east:AGORA_LAYOUT.x+35,south:AGORA_LAYOUT.z-25,north:AGORA_LAYOUT.z+27};
