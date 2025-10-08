var uc=s=>{throw TypeError(s)};var Ed=(s,e,t)=>e.has(s)||uc("Cannot "+t);var dc=(s,e,t)=>e.has(s)?uc("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(s):e.set(s,t);var Pi=(s,e,t)=>(Ed(s,e,"access private method"),t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function t(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(i){if(i.ep)return;i.ep=!0;const r=t(i);fetch(i.href,r)}})();/**
 * @license
 * Copyright 2010-2023 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Fo="160",_d=0,fc=1,xd=2,qh=1,Xh=2,zn=3,Rn=0,$t=1,sn=2,ri=0,as=1,co=2,Ac=3,pc=4,yd=5,Ci=100,vd=101,Cd=102,gc=103,mc=104,Id=200,Sd=201,Md=202,wd=203,lo=204,ho=205,Bd=206,Td=207,Rd=208,Dd=209,Ld=210,Pd=211,Fd=212,Ud=213,Nd=214,Qd=0,Od=1,kd=2,Gr=3,Gd=4,Hd=5,zd=6,Vd=7,Yh=0,Wd=1,qd=2,ai=0,Xd=1,Yd=2,Kd=3,Kh=4,jd=5,Jd=6,bc="attached",Zd="detached",jh=300,Ti=301,us=302,uo=303,fo=304,Zr=306,Dn=1e3,ln=1001,Hr=1002,Ht=1003,Ao=1004,Pr=1005,Xt=1006,Jh=1007,ci=1008,Pt=1009,$d=1010,ef=1011,Uo=1012,Zh=1013,ii=1014,hn=1015,qn=1016,$h=1017,eu=1018,Mi=1020,tf=1021,Lt=1023,nf=1024,sf=1025,wi=1026,ds=1027,es=1028,tu=1029,ts=1030,nu=1031,iu=1033,Fr=33776,aa=33777,oa=33778,Ur=33779,po=35840,Ec=35841,go=35842,_c=35843,No=36196,mo=37492,bo=37496,Eo=37808,xc=37809,yc=37810,vc=37811,zr=37812,Cc=37813,Ic=37814,Sc=37815,Mc=37816,wc=37817,Bc=37818,Tc=37819,Rc=37820,Dc=37821,Nr=36492,Lc=36494,Pc=36495,rf=36283,Fc=36284,Uc=36285,Nc=36286,af=2200,of=2201,cf=2202,Hs=2300,fs=2301,ca=2302,ns=2400,is=2401,Vr=2402,Qo=2500,lf=2501,hf=0,su=1,_o=2,ru=3e3,Bi=3001,uf=3200,df=3201,au=0,ff=1,rn="",dt="srgb",Et="srgb-linear",$r="display-p3",Ws="display-p3-linear",Wr="linear",bt="srgb",qr="rec709",Xr="p3",Fi=7680,Qc=519,Af=512,pf=513,gf=514,ou=515,mf=516,bf=517,Ef=518,_f=519,xo=35044,Oc=35048,kc="300 es",yo=1035,Wn=2e3,Yr=2001;class Di{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const i=this._listeners[e];if(i!==void 0){const r=i.indexOf(t);r!==-1&&i.splice(r,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const n=this._listeners[e.type];if(n!==void 0){e.target=this;const i=n.slice(0);for(let r=0,a=i.length;r<a;r++)i[r].call(this,e);e.target=null}}}const Vt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let Gc=1234567;const Fs=Math.PI/180,As=180/Math.PI;function xn(){const s=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Vt[s&255]+Vt[s>>8&255]+Vt[s>>16&255]+Vt[s>>24&255]+"-"+Vt[e&255]+Vt[e>>8&255]+"-"+Vt[e>>16&15|64]+Vt[e>>24&255]+"-"+Vt[t&63|128]+Vt[t>>8&255]+"-"+Vt[t>>16&255]+Vt[t>>24&255]+Vt[n&255]+Vt[n>>8&255]+Vt[n>>16&255]+Vt[n>>24&255]).toLowerCase()}function Rt(s,e,t){return Math.max(e,Math.min(t,s))}function Oo(s,e){return(s%e+e)%e}function xf(s,e,t,n,i){return n+(s-e)*(i-n)/(t-e)}function yf(s,e,t){return s!==e?(t-s)/(e-s):0}function Us(s,e,t){return(1-t)*s+t*e}function vf(s,e,t,n){return Us(s,e,1-Math.exp(-t*n))}function Cf(s,e=1){return e-Math.abs(Oo(s,e*2)-e)}function If(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*(3-2*s))}function Sf(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*s*(s*(s*6-15)+10))}function Mf(s,e){return s+Math.floor(Math.random()*(e-s+1))}function wf(s,e){return s+Math.random()*(e-s)}function Bf(s){return s*(.5-Math.random())}function Tf(s){s!==void 0&&(Gc=s);let e=Gc+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Rf(s){return s*Fs}function Df(s){return s*As}function vo(s){return(s&s-1)===0&&s!==0}function Lf(s){return Math.pow(2,Math.ceil(Math.log(s)/Math.LN2))}function Kr(s){return Math.pow(2,Math.floor(Math.log(s)/Math.LN2))}function Pf(s,e,t,n,i){const r=Math.cos,a=Math.sin,o=r(t/2),c=a(t/2),l=r((e+n)/2),h=a((e+n)/2),u=r((e-n)/2),d=a((e-n)/2),f=r((n-e)/2),p=a((n-e)/2);switch(i){case"XYX":s.set(o*h,c*u,c*d,o*l);break;case"YZY":s.set(c*d,o*h,c*u,o*l);break;case"ZXZ":s.set(c*u,c*d,o*h,o*l);break;case"XZX":s.set(o*h,c*p,c*f,o*l);break;case"YXY":s.set(c*f,o*h,c*p,o*l);break;case"ZYZ":s.set(c*p,c*f,o*h,o*l);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+i)}}function Sn(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("Invalid component type.")}}function ht(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("Invalid component type.")}}const Ie={DEG2RAD:Fs,RAD2DEG:As,generateUUID:xn,clamp:Rt,euclideanModulo:Oo,mapLinear:xf,inverseLerp:yf,lerp:Us,damp:vf,pingpong:Cf,smoothstep:If,smootherstep:Sf,randInt:Mf,randFloat:wf,randFloatSpread:Bf,seededRandom:Tf,degToRad:Rf,radToDeg:Df,isPowerOfTwo:vo,ceilPowerOfTwo:Lf,floorPowerOfTwo:Kr,setQuaternionFromProperEuler:Pf,normalize:ht,denormalize:Sn};class oe{constructor(e=0,t=0){oe.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6],this.y=i[1]*t+i[4]*n+i[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Rt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),i=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*i+e.x,this.y=r*i+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Ye{constructor(e,t,n,i,r,a,o,c,l){Ye.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,i,r,a,o,c,l)}set(e,t,n,i,r,a,o,c,l){const h=this.elements;return h[0]=e,h[1]=i,h[2]=o,h[3]=t,h[4]=r,h[5]=c,h[6]=n,h[7]=a,h[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,r=this.elements,a=n[0],o=n[3],c=n[6],l=n[1],h=n[4],u=n[7],d=n[2],f=n[5],p=n[8],m=i[0],g=i[3],A=i[6],b=i[1],E=i[4],_=i[7],M=i[2],v=i[5],S=i[8];return r[0]=a*m+o*b+c*M,r[3]=a*g+o*E+c*v,r[6]=a*A+o*_+c*S,r[1]=l*m+h*b+u*M,r[4]=l*g+h*E+u*v,r[7]=l*A+h*_+u*S,r[2]=d*m+f*b+p*M,r[5]=d*g+f*E+p*v,r[8]=d*A+f*_+p*S,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],h=e[8];return t*a*h-t*o*l-n*r*h+n*o*c+i*r*l-i*a*c}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],h=e[8],u=h*a-o*l,d=o*c-h*r,f=l*r-a*c,p=t*u+n*d+i*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);const m=1/p;return e[0]=u*m,e[1]=(i*l-h*n)*m,e[2]=(o*n-i*a)*m,e[3]=d*m,e[4]=(h*t-i*c)*m,e[5]=(i*r-o*t)*m,e[6]=f*m,e[7]=(n*c-l*t)*m,e[8]=(a*t-n*r)*m,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,i,r,a,o){const c=Math.cos(r),l=Math.sin(r);return this.set(n*c,n*l,-n*(c*a+l*o)+a+e,-i*l,i*c,-i*(-l*a+c*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(la.makeScale(e,t)),this}rotate(e){return this.premultiply(la.makeRotation(-e)),this}translate(e,t){return this.premultiply(la.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<9;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const la=new Ye;function cu(s){for(let e=s.length-1;e>=0;--e)if(s[e]>=65535)return!0;return!1}function zs(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function Ff(){const s=zs("canvas");return s.style.display="block",s}const Hc={};function Ns(s){s in Hc||(Hc[s]=!0,console.warn(s))}const zc=new Ye().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),Vc=new Ye().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),js={[Et]:{transfer:Wr,primaries:qr,toReference:s=>s,fromReference:s=>s},[dt]:{transfer:bt,primaries:qr,toReference:s=>s.convertSRGBToLinear(),fromReference:s=>s.convertLinearToSRGB()},[Ws]:{transfer:Wr,primaries:Xr,toReference:s=>s.applyMatrix3(Vc),fromReference:s=>s.applyMatrix3(zc)},[$r]:{transfer:bt,primaries:Xr,toReference:s=>s.convertSRGBToLinear().applyMatrix3(Vc),fromReference:s=>s.applyMatrix3(zc).convertLinearToSRGB()}},Uf=new Set([Et,Ws]),rt={enabled:!0,_workingColorSpace:Et,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(s){if(!Uf.has(s))throw new Error(`Unsupported working color space, "${s}".`);this._workingColorSpace=s},convert:function(s,e,t){if(this.enabled===!1||e===t||!e||!t)return s;const n=js[e].toReference,i=js[t].fromReference;return i(n(s))},fromWorkingColorSpace:function(s,e){return this.convert(s,this._workingColorSpace,e)},toWorkingColorSpace:function(s,e){return this.convert(s,e,this._workingColorSpace)},getPrimaries:function(s){return js[s].primaries},getTransfer:function(s){return s===rn?Wr:js[s].transfer}};function os(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function ha(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}let Ui;class lu{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{Ui===void 0&&(Ui=zs("canvas")),Ui.width=e.width,Ui.height=e.height;const n=Ui.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=Ui}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=zs("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const i=n.getImageData(0,0,e.width,e.height),r=i.data;for(let a=0;a<r.length;a++)r[a]=os(r[a]/255)*255;return n.putImageData(i,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(os(t[n]/255)*255):t[n]=os(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let Nf=0;class hu{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Nf++}),this.uuid=xn(),this.data=e,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let r;if(Array.isArray(i)){r=[];for(let a=0,o=i.length;a<o;a++)i[a].isDataTexture?r.push(ua(i[a].image)):r.push(ua(i[a]))}else r=ua(i);n.url=r}return t||(e.images[this.uuid]=n),n}}function ua(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?lu.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let Qf=0;class Ft extends Di{constructor(e=Ft.DEFAULT_IMAGE,t=Ft.DEFAULT_MAPPING,n=ln,i=ln,r=Xt,a=ci,o=Lt,c=Pt,l=Ft.DEFAULT_ANISOTROPY,h=rn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Qf++}),this.uuid=xn(),this.name="",this.source=new hu(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=r,this.minFilter=a,this.anisotropy=l,this.format=o,this.internalFormat=null,this.type=c,this.offset=new oe(0,0),this.repeat=new oe(1,1),this.center=new oe(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ye,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,typeof h=="string"?this.colorSpace=h:(Ns("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=h===Bi?dt:rn),this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.needsPMREMUpdate=!1}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==jh)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Dn:e.x=e.x-Math.floor(e.x);break;case ln:e.x=e.x<0?0:1;break;case Hr:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Dn:e.y=e.y-Math.floor(e.y);break;case ln:e.y=e.y<0?0:1;break;case Hr:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}get encoding(){return Ns("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace===dt?Bi:ru}set encoding(e){Ns("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=e===Bi?dt:rn}}Ft.DEFAULT_IMAGE=null;Ft.DEFAULT_MAPPING=jh;Ft.DEFAULT_ANISOTROPY=1;class at{constructor(e=0,t=0,n=0,i=1){at.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,i){return this.x=e,this.y=t,this.z=n,this.w=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*i+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*i+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*i+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*i+a[15]*r,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,i,r;const c=e.elements,l=c[0],h=c[4],u=c[8],d=c[1],f=c[5],p=c[9],m=c[2],g=c[6],A=c[10];if(Math.abs(h-d)<.01&&Math.abs(u-m)<.01&&Math.abs(p-g)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+m)<.1&&Math.abs(p+g)<.1&&Math.abs(l+f+A-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const E=(l+1)/2,_=(f+1)/2,M=(A+1)/2,v=(h+d)/4,S=(u+m)/4,D=(p+g)/4;return E>_&&E>M?E<.01?(n=0,i=.707106781,r=.707106781):(n=Math.sqrt(E),i=v/n,r=S/n):_>M?_<.01?(n=.707106781,i=0,r=.707106781):(i=Math.sqrt(_),n=v/i,r=D/i):M<.01?(n=.707106781,i=.707106781,r=0):(r=Math.sqrt(M),n=S/r,i=D/r),this.set(n,i,r,t),this}let b=Math.sqrt((g-p)*(g-p)+(u-m)*(u-m)+(d-h)*(d-h));return Math.abs(b)<.001&&(b=1),this.x=(g-p)/b,this.y=(u-m)/b,this.z=(d-h)/b,this.w=Math.acos((l+f+A-1)/2),this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Of extends Di{constructor(e=1,t=1,n={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new at(0,0,e,t),this.scissorTest=!1,this.viewport=new at(0,0,e,t);const i={width:e,height:t,depth:1};n.encoding!==void 0&&(Ns("THREE.WebGLRenderTarget: option.encoding has been replaced by option.colorSpace."),n.colorSpace=n.encoding===Bi?dt:rn),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Xt,depthBuffer:!0,stencilBuffer:!1,depthTexture:null,samples:0},n),this.texture=new Ft(i,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.flipY=!1,this.texture.generateMipmaps=n.generateMipmaps,this.texture.internalFormat=n.internalFormat,this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}setSize(e,t,n=1){(this.width!==e||this.height!==t||this.depth!==n)&&(this.width=e,this.height=t,this.depth=n,this.texture.image.width=e,this.texture.image.height=t,this.texture.image.depth=n,this.dispose()),this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.texture=e.texture.clone(),this.texture.isRenderTargetTexture=!0;const t=Object.assign({},e.texture.image);return this.texture.source=new hu(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class li extends Of{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class uu extends Ft{constructor(e=null,t=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=Ht,this.minFilter=Ht,this.wrapR=ln,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class du extends Ft{constructor(e=null,t=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=Ht,this.minFilter=Ht,this.wrapR=ln,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class en{constructor(e=0,t=0,n=0,i=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=i}static slerpFlat(e,t,n,i,r,a,o){let c=n[i+0],l=n[i+1],h=n[i+2],u=n[i+3];const d=r[a+0],f=r[a+1],p=r[a+2],m=r[a+3];if(o===0){e[t+0]=c,e[t+1]=l,e[t+2]=h,e[t+3]=u;return}if(o===1){e[t+0]=d,e[t+1]=f,e[t+2]=p,e[t+3]=m;return}if(u!==m||c!==d||l!==f||h!==p){let g=1-o;const A=c*d+l*f+h*p+u*m,b=A>=0?1:-1,E=1-A*A;if(E>Number.EPSILON){const M=Math.sqrt(E),v=Math.atan2(M,A*b);g=Math.sin(g*v)/M,o=Math.sin(o*v)/M}const _=o*b;if(c=c*g+d*_,l=l*g+f*_,h=h*g+p*_,u=u*g+m*_,g===1-o){const M=1/Math.sqrt(c*c+l*l+h*h+u*u);c*=M,l*=M,h*=M,u*=M}}e[t]=c,e[t+1]=l,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,i,r,a){const o=n[i],c=n[i+1],l=n[i+2],h=n[i+3],u=r[a],d=r[a+1],f=r[a+2],p=r[a+3];return e[t]=o*p+h*u+c*f-l*d,e[t+1]=c*p+h*d+l*u-o*f,e[t+2]=l*p+h*f+o*d-c*u,e[t+3]=h*p-o*u-c*d-l*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,i){return this._x=e,this._y=t,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,i=e._y,r=e._z,a=e._order,o=Math.cos,c=Math.sin,l=o(n/2),h=o(i/2),u=o(r/2),d=c(n/2),f=c(i/2),p=c(r/2);switch(a){case"XYZ":this._x=d*h*u+l*f*p,this._y=l*f*u-d*h*p,this._z=l*h*p+d*f*u,this._w=l*h*u-d*f*p;break;case"YXZ":this._x=d*h*u+l*f*p,this._y=l*f*u-d*h*p,this._z=l*h*p-d*f*u,this._w=l*h*u+d*f*p;break;case"ZXY":this._x=d*h*u-l*f*p,this._y=l*f*u+d*h*p,this._z=l*h*p+d*f*u,this._w=l*h*u-d*f*p;break;case"ZYX":this._x=d*h*u-l*f*p,this._y=l*f*u+d*h*p,this._z=l*h*p-d*f*u,this._w=l*h*u+d*f*p;break;case"YZX":this._x=d*h*u+l*f*p,this._y=l*f*u+d*h*p,this._z=l*h*p-d*f*u,this._w=l*h*u-d*f*p;break;case"XZY":this._x=d*h*u-l*f*p,this._y=l*f*u-d*h*p,this._z=l*h*p+d*f*u,this._w=l*h*u+d*f*p;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,i=Math.sin(n);return this._x=e.x*i,this._y=e.y*i,this._z=e.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],i=t[4],r=t[8],a=t[1],o=t[5],c=t[9],l=t[2],h=t[6],u=t[10],d=n+o+u;if(d>0){const f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(h-c)*f,this._y=(r-l)*f,this._z=(a-i)*f}else if(n>o&&n>u){const f=2*Math.sqrt(1+n-o-u);this._w=(h-c)/f,this._x=.25*f,this._y=(i+a)/f,this._z=(r+l)/f}else if(o>u){const f=2*Math.sqrt(1+o-n-u);this._w=(r-l)/f,this._x=(i+a)/f,this._y=.25*f,this._z=(c+h)/f}else{const f=2*Math.sqrt(1+u-n-o);this._w=(a-i)/f,this._x=(r+l)/f,this._y=(c+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Rt(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const i=Math.min(1,t/n);return this.slerp(e,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,i=e._y,r=e._z,a=e._w,o=t._x,c=t._y,l=t._z,h=t._w;return this._x=n*h+a*o+i*l-r*c,this._y=i*h+a*c+r*o-n*l,this._z=r*h+a*l+n*c-i*o,this._w=a*h-n*o-i*c-r*l,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const n=this._x,i=this._y,r=this._z,a=this._w;let o=a*e._w+n*e._x+i*e._y+r*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=n,this._y=i,this._z=r,this;const c=1-o*o;if(c<=Number.EPSILON){const f=1-t;return this._w=f*a+t*this._w,this._x=f*n+t*this._x,this._y=f*i+t*this._y,this._z=f*r+t*this._z,this.normalize(),this}const l=Math.sqrt(c),h=Math.atan2(l,o),u=Math.sin((1-t)*h)/l,d=Math.sin(t*h)/l;return this._w=a*u+this._w*d,this._x=n*u+this._x*d,this._y=i*u+this._y*d,this._z=r*u+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=Math.random(),t=Math.sqrt(1-e),n=Math.sqrt(e),i=2*Math.PI*Math.random(),r=2*Math.PI*Math.random();return this.set(t*Math.cos(i),n*Math.sin(r),n*Math.cos(r),t*Math.sin(i))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class y{constructor(e=0,t=0,n=0){y.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Wc.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Wc.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,i=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*i,this.y=r[1]*t+r[4]*n+r[7]*i,this.z=r[2]*t+r[5]*n+r[8]*i,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*i+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*i+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*i+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*i+r[14])*a,this}applyQuaternion(e){const t=this.x,n=this.y,i=this.z,r=e.x,a=e.y,o=e.z,c=e.w,l=2*(a*i-o*n),h=2*(o*t-r*i),u=2*(r*n-a*t);return this.x=t+c*l+a*u-o*h,this.y=n+c*h+o*l-r*u,this.z=i+c*u+r*h-a*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,i=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*i,this.y=r[1]*t+r[5]*n+r[9]*i,this.z=r[2]*t+r[6]*n+r[10]*i,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,i=e.y,r=e.z,a=t.x,o=t.y,c=t.z;return this.x=i*c-r*o,this.y=r*a-n*c,this.z=n*o-i*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return da.copy(this).projectOnVector(e),this.sub(da)}reflect(e){return this.sub(da.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Rt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,i=this.z-e.z;return t*t+n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const i=Math.sin(t)*e;return this.x=i*Math.sin(n),this.y=Math.cos(t)*e,this.z=i*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),i=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=i,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=(Math.random()-.5)*2,t=Math.random()*Math.PI*2,n=Math.sqrt(1-e**2);return this.x=n*Math.cos(t),this.y=n*Math.sin(t),this.z=e,this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const da=new y,Wc=new en;class pn{constructor(e=new y(1/0,1/0,1/0),t=new y(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(mn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(mn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=mn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,mn):mn.fromBufferAttribute(r,a),mn.applyMatrix4(e.matrixWorld),this.expandByPoint(mn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Js.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Js.copy(n.boundingBox)),Js.applyMatrix4(e.matrixWorld),this.union(Js)}const i=e.children;for(let r=0,a=i.length;r<a;r++)this.expandByObject(i[r],t);return this}containsPoint(e){return!(e.x<this.min.x||e.x>this.max.x||e.y<this.min.y||e.y>this.max.y||e.z<this.min.z||e.z>this.max.z)}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return!(e.max.x<this.min.x||e.min.x>this.max.x||e.max.y<this.min.y||e.min.y>this.max.y||e.max.z<this.min.z||e.min.z>this.max.z)}intersectsSphere(e){return this.clampPoint(e.center,mn),mn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Cs),Zs.subVectors(this.max,Cs),Ni.subVectors(e.a,Cs),Qi.subVectors(e.b,Cs),Oi.subVectors(e.c,Cs),jn.subVectors(Qi,Ni),Jn.subVectors(Oi,Qi),fi.subVectors(Ni,Oi);let t=[0,-jn.z,jn.y,0,-Jn.z,Jn.y,0,-fi.z,fi.y,jn.z,0,-jn.x,Jn.z,0,-Jn.x,fi.z,0,-fi.x,-jn.y,jn.x,0,-Jn.y,Jn.x,0,-fi.y,fi.x,0];return!fa(t,Ni,Qi,Oi,Zs)||(t=[1,0,0,0,1,0,0,0,1],!fa(t,Ni,Qi,Oi,Zs))?!1:($s.crossVectors(jn,Jn),t=[$s.x,$s.y,$s.z],fa(t,Ni,Qi,Oi,Zs))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,mn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(mn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Un[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Un[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Un[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Un[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Un[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Un[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Un[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Un[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Un),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const Un=[new y,new y,new y,new y,new y,new y,new y,new y],mn=new y,Js=new pn,Ni=new y,Qi=new y,Oi=new y,jn=new y,Jn=new y,fi=new y,Cs=new y,Zs=new y,$s=new y,Ai=new y;function fa(s,e,t,n,i){for(let r=0,a=s.length-3;r<=a;r+=3){Ai.fromArray(s,r);const o=i.x*Math.abs(Ai.x)+i.y*Math.abs(Ai.y)+i.z*Math.abs(Ai.z),c=e.dot(Ai),l=t.dot(Ai),h=n.dot(Ai);if(Math.max(-Math.max(c,l,h),Math.min(c,l,h))>o)return!1}return!0}const kf=new pn,Is=new y,Aa=new y;class Ln{constructor(e=new y,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):kf.setFromPoints(e).getCenter(n);let i=0;for(let r=0,a=e.length;r<a;r++)i=Math.max(i,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(i),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Is.subVectors(e,this.center);const t=Is.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),i=(n-this.radius)*.5;this.center.addScaledVector(Is,i/n),this.radius+=i}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Aa.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Is.copy(e.center).add(Aa)),this.expandByPoint(Is.copy(e.center).sub(Aa))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const Nn=new y,pa=new y,er=new y,Zn=new y,ga=new y,tr=new y,ma=new y;class qs{constructor(e=new y,t=new y(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Nn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=Nn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Nn.copy(this.origin).addScaledVector(this.direction,t),Nn.distanceToSquared(e))}distanceSqToSegment(e,t,n,i){pa.copy(e).add(t).multiplyScalar(.5),er.copy(t).sub(e).normalize(),Zn.copy(this.origin).sub(pa);const r=e.distanceTo(t)*.5,a=-this.direction.dot(er),o=Zn.dot(this.direction),c=-Zn.dot(er),l=Zn.lengthSq(),h=Math.abs(1-a*a);let u,d,f,p;if(h>0)if(u=a*c-o,d=a*o-c,p=r*h,u>=0)if(d>=-p)if(d<=p){const m=1/h;u*=m,d*=m,f=u*(u+a*d+2*o)+d*(a*u+d+2*c)+l}else d=r,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*c)+l;else d=-r,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*c)+l;else d<=-p?(u=Math.max(0,-(-a*r+o)),d=u>0?-r:Math.min(Math.max(-r,-c),r),f=-u*u+d*(d+2*c)+l):d<=p?(u=0,d=Math.min(Math.max(-r,-c),r),f=d*(d+2*c)+l):(u=Math.max(0,-(a*r+o)),d=u>0?r:Math.min(Math.max(-r,-c),r),f=-u*u+d*(d+2*c)+l);else d=a>0?-r:r,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*c)+l;return n&&n.copy(this.origin).addScaledVector(this.direction,u),i&&i.copy(pa).addScaledVector(er,d),f}intersectSphere(e,t){Nn.subVectors(e.center,this.origin);const n=Nn.dot(this.direction),i=Nn.dot(Nn)-n*n,r=e.radius*e.radius;if(i>r)return null;const a=Math.sqrt(r-i),o=n-a,c=n+a;return c<0?null:o<0?this.at(c,t):this.at(o,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,i,r,a,o,c;const l=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return l>=0?(n=(e.min.x-d.x)*l,i=(e.max.x-d.x)*l):(n=(e.max.x-d.x)*l,i=(e.min.x-d.x)*l),h>=0?(r=(e.min.y-d.y)*h,a=(e.max.y-d.y)*h):(r=(e.max.y-d.y)*h,a=(e.min.y-d.y)*h),n>a||r>i||((r>n||isNaN(n))&&(n=r),(a<i||isNaN(i))&&(i=a),u>=0?(o=(e.min.z-d.z)*u,c=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,c=(e.min.z-d.z)*u),n>c||o>i)||((o>n||n!==n)&&(n=o),(c<i||i!==i)&&(i=c),i<0)?null:this.at(n>=0?n:i,t)}intersectsBox(e){return this.intersectBox(e,Nn)!==null}intersectTriangle(e,t,n,i,r){ga.subVectors(t,e),tr.subVectors(n,e),ma.crossVectors(ga,tr);let a=this.direction.dot(ma),o;if(a>0){if(i)return null;o=1}else if(a<0)o=-1,a=-a;else return null;Zn.subVectors(this.origin,e);const c=o*this.direction.dot(tr.crossVectors(Zn,tr));if(c<0)return null;const l=o*this.direction.dot(ga.cross(Zn));if(l<0||c+l>a)return null;const h=-o*Zn.dot(ma);return h<0?null:this.at(h/a,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Fe{constructor(e,t,n,i,r,a,o,c,l,h,u,d,f,p,m,g){Fe.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,i,r,a,o,c,l,h,u,d,f,p,m,g)}set(e,t,n,i,r,a,o,c,l,h,u,d,f,p,m,g){const A=this.elements;return A[0]=e,A[4]=t,A[8]=n,A[12]=i,A[1]=r,A[5]=a,A[9]=o,A[13]=c,A[2]=l,A[6]=h,A[10]=u,A[14]=d,A[3]=f,A[7]=p,A[11]=m,A[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Fe().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,n=e.elements,i=1/ki.setFromMatrixColumn(e,0).length(),r=1/ki.setFromMatrixColumn(e,1).length(),a=1/ki.setFromMatrixColumn(e,2).length();return t[0]=n[0]*i,t[1]=n[1]*i,t[2]=n[2]*i,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,i=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),c=Math.cos(i),l=Math.sin(i),h=Math.cos(r),u=Math.sin(r);if(e.order==="XYZ"){const d=a*h,f=a*u,p=o*h,m=o*u;t[0]=c*h,t[4]=-c*u,t[8]=l,t[1]=f+p*l,t[5]=d-m*l,t[9]=-o*c,t[2]=m-d*l,t[6]=p+f*l,t[10]=a*c}else if(e.order==="YXZ"){const d=c*h,f=c*u,p=l*h,m=l*u;t[0]=d+m*o,t[4]=p*o-f,t[8]=a*l,t[1]=a*u,t[5]=a*h,t[9]=-o,t[2]=f*o-p,t[6]=m+d*o,t[10]=a*c}else if(e.order==="ZXY"){const d=c*h,f=c*u,p=l*h,m=l*u;t[0]=d-m*o,t[4]=-a*u,t[8]=p+f*o,t[1]=f+p*o,t[5]=a*h,t[9]=m-d*o,t[2]=-a*l,t[6]=o,t[10]=a*c}else if(e.order==="ZYX"){const d=a*h,f=a*u,p=o*h,m=o*u;t[0]=c*h,t[4]=p*l-f,t[8]=d*l+m,t[1]=c*u,t[5]=m*l+d,t[9]=f*l-p,t[2]=-l,t[6]=o*c,t[10]=a*c}else if(e.order==="YZX"){const d=a*c,f=a*l,p=o*c,m=o*l;t[0]=c*h,t[4]=m-d*u,t[8]=p*u+f,t[1]=u,t[5]=a*h,t[9]=-o*h,t[2]=-l*h,t[6]=f*u+p,t[10]=d-m*u}else if(e.order==="XZY"){const d=a*c,f=a*l,p=o*c,m=o*l;t[0]=c*h,t[4]=-u,t[8]=l*h,t[1]=d*u+m,t[5]=a*h,t[9]=f*u-p,t[2]=p*u-f,t[6]=o*h,t[10]=m*u+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Gf,e,Hf)}lookAt(e,t,n){const i=this.elements;return an.subVectors(e,t),an.lengthSq()===0&&(an.z=1),an.normalize(),$n.crossVectors(n,an),$n.lengthSq()===0&&(Math.abs(n.z)===1?an.x+=1e-4:an.z+=1e-4,an.normalize(),$n.crossVectors(n,an)),$n.normalize(),nr.crossVectors(an,$n),i[0]=$n.x,i[4]=nr.x,i[8]=an.x,i[1]=$n.y,i[5]=nr.y,i[9]=an.y,i[2]=$n.z,i[6]=nr.z,i[10]=an.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,r=this.elements,a=n[0],o=n[4],c=n[8],l=n[12],h=n[1],u=n[5],d=n[9],f=n[13],p=n[2],m=n[6],g=n[10],A=n[14],b=n[3],E=n[7],_=n[11],M=n[15],v=i[0],S=i[4],D=i[8],x=i[12],C=i[1],R=i[5],U=i[9],O=i[13],T=i[2],F=i[6],Q=i[10],X=i[14],k=i[3],G=i[7],j=i[11],J=i[15];return r[0]=a*v+o*C+c*T+l*k,r[4]=a*S+o*R+c*F+l*G,r[8]=a*D+o*U+c*Q+l*j,r[12]=a*x+o*O+c*X+l*J,r[1]=h*v+u*C+d*T+f*k,r[5]=h*S+u*R+d*F+f*G,r[9]=h*D+u*U+d*Q+f*j,r[13]=h*x+u*O+d*X+f*J,r[2]=p*v+m*C+g*T+A*k,r[6]=p*S+m*R+g*F+A*G,r[10]=p*D+m*U+g*Q+A*j,r[14]=p*x+m*O+g*X+A*J,r[3]=b*v+E*C+_*T+M*k,r[7]=b*S+E*R+_*F+M*G,r[11]=b*D+E*U+_*Q+M*j,r[15]=b*x+E*O+_*X+M*J,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],i=e[8],r=e[12],a=e[1],o=e[5],c=e[9],l=e[13],h=e[2],u=e[6],d=e[10],f=e[14],p=e[3],m=e[7],g=e[11],A=e[15];return p*(+r*c*u-i*l*u-r*o*d+n*l*d+i*o*f-n*c*f)+m*(+t*c*f-t*l*d+r*a*d-i*a*f+i*l*h-r*c*h)+g*(+t*l*u-t*o*f-r*a*u+n*a*f+r*o*h-n*l*h)+A*(-i*o*h-t*c*u+t*o*d+i*a*u-n*a*d+n*c*h)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const i=this.elements;return e.isVector3?(i[12]=e.x,i[13]=e.y,i[14]=e.z):(i[12]=e,i[13]=t,i[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],h=e[8],u=e[9],d=e[10],f=e[11],p=e[12],m=e[13],g=e[14],A=e[15],b=u*g*l-m*d*l+m*c*f-o*g*f-u*c*A+o*d*A,E=p*d*l-h*g*l-p*c*f+a*g*f+h*c*A-a*d*A,_=h*m*l-p*u*l+p*o*f-a*m*f-h*o*A+a*u*A,M=p*u*c-h*m*c-p*o*d+a*m*d+h*o*g-a*u*g,v=t*b+n*E+i*_+r*M;if(v===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const S=1/v;return e[0]=b*S,e[1]=(m*d*r-u*g*r-m*i*f+n*g*f+u*i*A-n*d*A)*S,e[2]=(o*g*r-m*c*r+m*i*l-n*g*l-o*i*A+n*c*A)*S,e[3]=(u*c*r-o*d*r-u*i*l+n*d*l+o*i*f-n*c*f)*S,e[4]=E*S,e[5]=(h*g*r-p*d*r+p*i*f-t*g*f-h*i*A+t*d*A)*S,e[6]=(p*c*r-a*g*r-p*i*l+t*g*l+a*i*A-t*c*A)*S,e[7]=(a*d*r-h*c*r+h*i*l-t*d*l-a*i*f+t*c*f)*S,e[8]=_*S,e[9]=(p*u*r-h*m*r-p*n*f+t*m*f+h*n*A-t*u*A)*S,e[10]=(a*m*r-p*o*r+p*n*l-t*m*l-a*n*A+t*o*A)*S,e[11]=(h*o*r-a*u*r-h*n*l+t*u*l+a*n*f-t*o*f)*S,e[12]=M*S,e[13]=(h*m*i-p*u*i+p*n*d-t*m*d-h*n*g+t*u*g)*S,e[14]=(p*o*i-a*m*i-p*n*c+t*m*c+a*n*g-t*o*g)*S,e[15]=(a*u*i-h*o*i+h*n*c-t*u*c-a*n*d+t*o*d)*S,this}scale(e){const t=this.elements,n=e.x,i=e.y,r=e.z;return t[0]*=n,t[4]*=i,t[8]*=r,t[1]*=n,t[5]*=i,t[9]*=r,t[2]*=n,t[6]*=i,t[10]*=r,t[3]*=n,t[7]*=i,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],i=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,i))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),i=Math.sin(t),r=1-n,a=e.x,o=e.y,c=e.z,l=r*a,h=r*o;return this.set(l*a+n,l*o-i*c,l*c+i*o,0,l*o+i*c,h*o+n,h*c-i*a,0,l*c-i*o,h*c+i*a,r*c*c+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,i,r,a){return this.set(1,n,r,0,e,1,a,0,t,i,1,0,0,0,0,1),this}compose(e,t,n){const i=this.elements,r=t._x,a=t._y,o=t._z,c=t._w,l=r+r,h=a+a,u=o+o,d=r*l,f=r*h,p=r*u,m=a*h,g=a*u,A=o*u,b=c*l,E=c*h,_=c*u,M=n.x,v=n.y,S=n.z;return i[0]=(1-(m+A))*M,i[1]=(f+_)*M,i[2]=(p-E)*M,i[3]=0,i[4]=(f-_)*v,i[5]=(1-(d+A))*v,i[6]=(g+b)*v,i[7]=0,i[8]=(p+E)*S,i[9]=(g-b)*S,i[10]=(1-(d+m))*S,i[11]=0,i[12]=e.x,i[13]=e.y,i[14]=e.z,i[15]=1,this}decompose(e,t,n){const i=this.elements;let r=ki.set(i[0],i[1],i[2]).length();const a=ki.set(i[4],i[5],i[6]).length(),o=ki.set(i[8],i[9],i[10]).length();this.determinant()<0&&(r=-r),e.x=i[12],e.y=i[13],e.z=i[14],bn.copy(this);const l=1/r,h=1/a,u=1/o;return bn.elements[0]*=l,bn.elements[1]*=l,bn.elements[2]*=l,bn.elements[4]*=h,bn.elements[5]*=h,bn.elements[6]*=h,bn.elements[8]*=u,bn.elements[9]*=u,bn.elements[10]*=u,t.setFromRotationMatrix(bn),n.x=r,n.y=a,n.z=o,this}makePerspective(e,t,n,i,r,a,o=Wn){const c=this.elements,l=2*r/(t-e),h=2*r/(n-i),u=(t+e)/(t-e),d=(n+i)/(n-i);let f,p;if(o===Wn)f=-(a+r)/(a-r),p=-2*a*r/(a-r);else if(o===Yr)f=-a/(a-r),p=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=l,c[4]=0,c[8]=u,c[12]=0,c[1]=0,c[5]=h,c[9]=d,c[13]=0,c[2]=0,c[6]=0,c[10]=f,c[14]=p,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,i,r,a,o=Wn){const c=this.elements,l=1/(t-e),h=1/(n-i),u=1/(a-r),d=(t+e)*l,f=(n+i)*h;let p,m;if(o===Wn)p=(a+r)*u,m=-2*u;else if(o===Yr)p=r*u,m=-1*u;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=2*l,c[4]=0,c[8]=0,c[12]=-d,c[1]=0,c[5]=2*h,c[9]=0,c[13]=-f,c[2]=0,c[6]=0,c[10]=m,c[14]=-p,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<16;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const ki=new y,bn=new Fe,Gf=new y(0,0,0),Hf=new y(1,1,1),$n=new y,nr=new y,an=new y,qc=new Fe,Xc=new en;class Xs{constructor(e=0,t=0,n=0,i=Xs.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,i=this._order){return this._x=e,this._y=t,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const i=e.elements,r=i[0],a=i[4],o=i[8],c=i[1],l=i[5],h=i[9],u=i[2],d=i[6],f=i[10];switch(t){case"XYZ":this._y=Math.asin(Rt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(d,l),this._z=0);break;case"YXZ":this._x=Math.asin(-Rt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(Rt(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,l)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-Rt(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-a,l));break;case"YZX":this._z=Math.asin(Rt(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-h,l),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(o,f));break;case"XZY":this._z=Math.asin(-Rt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,l),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return qc.makeRotationFromQuaternion(e),this.setFromRotationMatrix(qc,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Xc.setFromEuler(this),this.setFromQuaternion(Xc,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Xs.DEFAULT_ORDER="XYZ";class ko{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let zf=0;const Yc=new y,Gi=new en,Qn=new Fe,ir=new y,Ss=new y,Vf=new y,Wf=new en,Kc=new y(1,0,0),jc=new y(0,1,0),Jc=new y(0,0,1),qf={type:"added"},Xf={type:"removed"};class Ze extends Di{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:zf++}),this.uuid=xn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Ze.DEFAULT_UP.clone();const e=new y,t=new Xs,n=new en,i=new y(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Fe},normalMatrix:{value:new Ye}}),this.matrix=new Fe,this.matrixWorld=new Fe,this.matrixAutoUpdate=Ze.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Ze.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new ko,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Gi.setFromAxisAngle(e,t),this.quaternion.multiply(Gi),this}rotateOnWorldAxis(e,t){return Gi.setFromAxisAngle(e,t),this.quaternion.premultiply(Gi),this}rotateX(e){return this.rotateOnAxis(Kc,e)}rotateY(e){return this.rotateOnAxis(jc,e)}rotateZ(e){return this.rotateOnAxis(Jc,e)}translateOnAxis(e,t){return Yc.copy(e).applyQuaternion(this.quaternion),this.position.add(Yc.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Kc,e)}translateY(e){return this.translateOnAxis(jc,e)}translateZ(e){return this.translateOnAxis(Jc,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Qn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?ir.copy(e):ir.set(e,t,n);const i=this.parent;this.updateWorldMatrix(!0,!1),Ss.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Qn.lookAt(Ss,ir,this.up):Qn.lookAt(ir,Ss,this.up),this.quaternion.setFromRotationMatrix(Qn),i&&(Qn.extractRotation(i.matrixWorld),Gi.setFromRotationMatrix(Qn),this.quaternion.premultiply(Gi.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.parent!==null&&e.parent.remove(e),e.parent=this,this.children.push(e),e.dispatchEvent(qf)):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Xf)),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Qn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Qn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Qn),this.add(e),e.updateWorldMatrix(!1,!0),this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,i=this.children.length;n<i;n++){const a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const i=this.children;for(let r=0,a=i.length;r<a;r++)i[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ss,e,Vf),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ss,Wf,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,i=t.length;n<i;n++){const r=t[n];(r.matrixWorldAutoUpdate===!0||e===!0)&&r.updateMatrixWorld(e)}}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.matrixWorldAutoUpdate===!0&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),t===!0){const i=this.children;for(let r=0,a=i.length;r<a;r++){const o=i[r];o.matrixWorldAutoUpdate===!0&&o.updateWorldMatrix(!1,!0)}}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const i={};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.castShadow===!0&&(i.castShadow=!0),this.receiveShadow===!0&&(i.receiveShadow=!0),this.visible===!1&&(i.visible=!1),this.frustumCulled===!1&&(i.frustumCulled=!1),this.renderOrder!==0&&(i.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(i.matrixAutoUpdate=!1),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.visibility=this._visibility,i.active=this._active,i.bounds=this._bounds.map(o=>({boxInitialized:o.boxInitialized,boxMin:o.box.min.toArray(),boxMax:o.box.max.toArray(),sphereInitialized:o.sphereInitialized,sphereRadius:o.sphere.radius,sphereCenter:o.sphere.center.toArray()})),i.maxGeometryCount=this._maxGeometryCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.geometryCount=this._geometryCount,i.matricesTexture=this._matricesTexture.toJSON(e),this.boundingSphere!==null&&(i.boundingSphere={center:i.boundingSphere.center.toArray(),radius:i.boundingSphere.radius}),this.boundingBox!==null&&(i.boundingBox={min:i.boundingBox.min.toArray(),max:i.boundingBox.max.toArray()}));function r(o,c){return o[c.uuid]===void 0&&(o[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=r(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const c=o.shapes;if(Array.isArray(c))for(let l=0,h=c.length;l<h;l++){const u=c[l];r(e.shapes,u)}else r(e.shapes,c)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let c=0,l=this.material.length;c<l;c++)o.push(r(e.materials,this.material[c]));i.material=o}else i.material=r(e.materials,this.material);if(this.children.length>0){i.children=[];for(let o=0;o<this.children.length;o++)i.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){i.animations=[];for(let o=0;o<this.animations.length;o++){const c=this.animations[o];i.animations.push(r(e.animations,c))}}if(t){const o=a(e.geometries),c=a(e.materials),l=a(e.textures),h=a(e.images),u=a(e.shapes),d=a(e.skeletons),f=a(e.animations),p=a(e.nodes);o.length>0&&(n.geometries=o),c.length>0&&(n.materials=c),l.length>0&&(n.textures=l),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),d.length>0&&(n.skeletons=d),f.length>0&&(n.animations=f),p.length>0&&(n.nodes=p)}return n.object=i,n;function a(o){const c=[];for(const l in o){const h=o[l];delete h.metadata,c.push(h)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const i=e.children[n];this.add(i.clone())}return this}}Ze.DEFAULT_UP=new y(0,1,0);Ze.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ze.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const En=new y,On=new y,ba=new y,kn=new y,Hi=new y,zi=new y,Zc=new y,Ea=new y,_a=new y,xa=new y;let sr=!1;class An{constructor(e=new y,t=new y,n=new y){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,i){i.subVectors(n,t),En.subVectors(e,t),i.cross(En);const r=i.lengthSq();return r>0?i.multiplyScalar(1/Math.sqrt(r)):i.set(0,0,0)}static getBarycoord(e,t,n,i,r){En.subVectors(i,t),On.subVectors(n,t),ba.subVectors(e,t);const a=En.dot(En),o=En.dot(On),c=En.dot(ba),l=On.dot(On),h=On.dot(ba),u=a*l-o*o;if(u===0)return r.set(0,0,0),null;const d=1/u,f=(l*c-o*h)*d,p=(a*h-o*c)*d;return r.set(1-f-p,p,f)}static containsPoint(e,t,n,i){return this.getBarycoord(e,t,n,i,kn)===null?!1:kn.x>=0&&kn.y>=0&&kn.x+kn.y<=1}static getUV(e,t,n,i,r,a,o,c){return sr===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),sr=!0),this.getInterpolation(e,t,n,i,r,a,o,c)}static getInterpolation(e,t,n,i,r,a,o,c){return this.getBarycoord(e,t,n,i,kn)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,kn.x),c.addScaledVector(a,kn.y),c.addScaledVector(o,kn.z),c)}static isFrontFacing(e,t,n,i){return En.subVectors(n,t),On.subVectors(e,t),En.cross(On).dot(i)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,i){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[i]),this}setFromAttributeAndIndices(e,t,n,i){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,i),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return En.subVectors(this.c,this.b),On.subVectors(this.a,this.b),En.cross(On).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return An.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return An.getBarycoord(e,this.a,this.b,this.c,t)}getUV(e,t,n,i,r){return sr===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),sr=!0),An.getInterpolation(e,this.a,this.b,this.c,t,n,i,r)}getInterpolation(e,t,n,i,r){return An.getInterpolation(e,this.a,this.b,this.c,t,n,i,r)}containsPoint(e){return An.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return An.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,i=this.b,r=this.c;let a,o;Hi.subVectors(i,n),zi.subVectors(r,n),Ea.subVectors(e,n);const c=Hi.dot(Ea),l=zi.dot(Ea);if(c<=0&&l<=0)return t.copy(n);_a.subVectors(e,i);const h=Hi.dot(_a),u=zi.dot(_a);if(h>=0&&u<=h)return t.copy(i);const d=c*u-h*l;if(d<=0&&c>=0&&h<=0)return a=c/(c-h),t.copy(n).addScaledVector(Hi,a);xa.subVectors(e,r);const f=Hi.dot(xa),p=zi.dot(xa);if(p>=0&&f<=p)return t.copy(r);const m=f*l-c*p;if(m<=0&&l>=0&&p<=0)return o=l/(l-p),t.copy(n).addScaledVector(zi,o);const g=h*p-f*u;if(g<=0&&u-h>=0&&f-p>=0)return Zc.subVectors(r,i),o=(u-h)/(u-h+(f-p)),t.copy(i).addScaledVector(Zc,o);const A=1/(g+m+d);return a=m*A,o=d*A,t.copy(n).addScaledVector(Hi,a).addScaledVector(zi,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const fu={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},ei={h:0,s:0,l:0},rr={h:0,s:0,l:0};function ya(s,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?s+(e-s)*6*t:t<1/2?e:t<2/3?s+(e-s)*6*(2/3-t):s}class Ae{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const i=e;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=dt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,rt.toWorkingColorSpace(this,t),this}setRGB(e,t,n,i=rt.workingColorSpace){return this.r=e,this.g=t,this.b=n,rt.toWorkingColorSpace(this,i),this}setHSL(e,t,n,i=rt.workingColorSpace){if(e=Oo(e,1),t=Rt(t,0,1),n=Rt(n,0,1),t===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=ya(a,r,e+1/3),this.g=ya(a,r,e),this.b=ya(a,r,e-1/3)}return rt.toWorkingColorSpace(this,i),this}setStyle(e,t=dt){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const a=i[1],o=i[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=i[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=dt){const n=fu[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=os(e.r),this.g=os(e.g),this.b=os(e.b),this}copyLinearToSRGB(e){return this.r=ha(e.r),this.g=ha(e.g),this.b=ha(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=dt){return rt.fromWorkingColorSpace(Wt.copy(this),e),Math.round(Rt(Wt.r*255,0,255))*65536+Math.round(Rt(Wt.g*255,0,255))*256+Math.round(Rt(Wt.b*255,0,255))}getHexString(e=dt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=rt.workingColorSpace){rt.fromWorkingColorSpace(Wt.copy(this),t);const n=Wt.r,i=Wt.g,r=Wt.b,a=Math.max(n,i,r),o=Math.min(n,i,r);let c,l;const h=(o+a)/2;if(o===a)c=0,l=0;else{const u=a-o;switch(l=h<=.5?u/(a+o):u/(2-a-o),a){case n:c=(i-r)/u+(i<r?6:0);break;case i:c=(r-n)/u+2;break;case r:c=(n-i)/u+4;break}c/=6}return e.h=c,e.s=l,e.l=h,e}getRGB(e,t=rt.workingColorSpace){return rt.fromWorkingColorSpace(Wt.copy(this),t),e.r=Wt.r,e.g=Wt.g,e.b=Wt.b,e}getStyle(e=dt){rt.fromWorkingColorSpace(Wt.copy(this),e);const t=Wt.r,n=Wt.g,i=Wt.b;return e!==dt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(e,t,n){return this.getHSL(ei),this.setHSL(ei.h+e,ei.s+t,ei.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(ei),e.getHSL(rr);const n=Us(ei.h,rr.h,t),i=Us(ei.s,rr.s,t),r=Us(ei.l,rr.l,t);return this.setHSL(n,i,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,i=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*i,this.g=r[1]*t+r[4]*n+r[7]*i,this.b=r[2]*t+r[5]*n+r[8]*i,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Wt=new Ae;Ae.NAMES=fu;let Yf=0;class wn extends Di{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Yf++}),this.uuid=xn(),this.name="",this.type="Material",this.blending=as,this.side=Rn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=lo,this.blendDst=ho,this.blendEquation=Ci,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ae(0,0,0),this.blendAlpha=0,this.depthFunc=Gr,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Qc,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Fi,this.stencilZFail=Fi,this.stencilZPass=Fi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBuild(){}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const i=this[t];if(i===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==as&&(n.blending=this.blending),this.side!==Rn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==lo&&(n.blendSrc=this.blendSrc),this.blendDst!==ho&&(n.blendDst=this.blendDst),this.blendEquation!==Ci&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Gr&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Qc&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Fi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Fi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Fi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(r){const a=[];for(const o in r){const c=r[o];delete c.metadata,a.push(c)}return a}if(t){const r=i(e.textures),a=i(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const i=t.length;n=new Array(i);for(let r=0;r!==i;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class Mn extends wn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ae(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=Yh,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Tt=new y,ar=new oe;class Ut{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=xo,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.gpuType=hn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}get updateRange(){return console.warn("THREE.BufferAttribute: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let i=0,r=this.itemSize;i<r;i++)this.array[e+i]=t.array[n+i];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)ar.fromBufferAttribute(this,t),ar.applyMatrix3(e),this.setXY(t,ar.x,ar.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Tt.fromBufferAttribute(this,t),Tt.applyMatrix3(e),this.setXYZ(t,Tt.x,Tt.y,Tt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Tt.fromBufferAttribute(this,t),Tt.applyMatrix4(e),this.setXYZ(t,Tt.x,Tt.y,Tt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Tt.fromBufferAttribute(this,t),Tt.applyNormalMatrix(e),this.setXYZ(t,Tt.x,Tt.y,Tt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Tt.fromBufferAttribute(this,t),Tt.transformDirection(e),this.setXYZ(t,Tt.x,Tt.y,Tt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Sn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=ht(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Sn(t,this.array)),t}setX(e,t){return this.normalized&&(t=ht(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Sn(t,this.array)),t}setY(e,t){return this.normalized&&(t=ht(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Sn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=ht(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Sn(t,this.array)),t}setW(e,t){return this.normalized&&(t=ht(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=ht(t,this.array),n=ht(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,i){return e*=this.itemSize,this.normalized&&(t=ht(t,this.array),n=ht(n,this.array),i=ht(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this}setXYZW(e,t,n,i,r){return e*=this.itemSize,this.normalized&&(t=ht(t,this.array),n=ht(n,this.array),i=ht(i,this.array),r=ht(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==xo&&(e.usage=this.usage),e}}class Au extends Ut{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class pu extends Ut{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class ft extends Ut{constructor(e,t,n){super(new Float32Array(e),t,n)}}let Kf=0;const dn=new Fe,va=new Ze,Vi=new y,on=new pn,Ms=new pn,kt=new y;class It extends Di{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Kf++}),this.uuid=xn(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(cu(e)?pu:Au)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new Ye().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}const i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(e),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return dn.makeRotationFromQuaternion(e),this.applyMatrix4(dn),this}rotateX(e){return dn.makeRotationX(e),this.applyMatrix4(dn),this}rotateY(e){return dn.makeRotationY(e),this.applyMatrix4(dn),this}rotateZ(e){return dn.makeRotationZ(e),this.applyMatrix4(dn),this}translate(e,t,n){return dn.makeTranslation(e,t,n),this.applyMatrix4(dn),this}scale(e,t,n){return dn.makeScale(e,t,n),this.applyMatrix4(dn),this}lookAt(e){return va.lookAt(e),va.updateMatrix(),this.applyMatrix4(va.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Vi).negate(),this.translate(Vi.x,Vi.y,Vi.z),this}setFromPoints(e){const t=[];for(let n=0,i=e.length;n<i;n++){const r=e[n];t.push(r.x,r.y,r.z||0)}return this.setAttribute("position",new ft(t,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new pn);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingBox.set(new y(-1/0,-1/0,-1/0),new y(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,i=t.length;n<i;n++){const r=t[n];on.setFromBufferAttribute(r),this.morphTargetsRelative?(kt.addVectors(this.boundingBox.min,on.min),this.boundingBox.expandByPoint(kt),kt.addVectors(this.boundingBox.max,on.max),this.boundingBox.expandByPoint(kt)):(this.boundingBox.expandByPoint(on.min),this.boundingBox.expandByPoint(on.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Ln);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingSphere.set(new y,1/0);return}if(e){const n=this.boundingSphere.center;if(on.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){const o=t[r];Ms.setFromBufferAttribute(o),this.morphTargetsRelative?(kt.addVectors(on.min,Ms.min),on.expandByPoint(kt),kt.addVectors(on.max,Ms.max),on.expandByPoint(kt)):(on.expandByPoint(Ms.min),on.expandByPoint(Ms.max))}on.getCenter(n);let i=0;for(let r=0,a=e.count;r<a;r++)kt.fromBufferAttribute(e,r),i=Math.max(i,n.distanceToSquared(kt));if(t)for(let r=0,a=t.length;r<a;r++){const o=t[r],c=this.morphTargetsRelative;for(let l=0,h=o.count;l<h;l++)kt.fromBufferAttribute(o,l),c&&(Vi.fromBufferAttribute(e,l),kt.add(Vi)),i=Math.max(i,n.distanceToSquared(kt))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=e.array,i=t.position.array,r=t.normal.array,a=t.uv.array,o=i.length/3;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Ut(new Float32Array(4*o),4));const c=this.getAttribute("tangent").array,l=[],h=[];for(let C=0;C<o;C++)l[C]=new y,h[C]=new y;const u=new y,d=new y,f=new y,p=new oe,m=new oe,g=new oe,A=new y,b=new y;function E(C,R,U){u.fromArray(i,C*3),d.fromArray(i,R*3),f.fromArray(i,U*3),p.fromArray(a,C*2),m.fromArray(a,R*2),g.fromArray(a,U*2),d.sub(u),f.sub(u),m.sub(p),g.sub(p);const O=1/(m.x*g.y-g.x*m.y);isFinite(O)&&(A.copy(d).multiplyScalar(g.y).addScaledVector(f,-m.y).multiplyScalar(O),b.copy(f).multiplyScalar(m.x).addScaledVector(d,-g.x).multiplyScalar(O),l[C].add(A),l[R].add(A),l[U].add(A),h[C].add(b),h[R].add(b),h[U].add(b))}let _=this.groups;_.length===0&&(_=[{start:0,count:n.length}]);for(let C=0,R=_.length;C<R;++C){const U=_[C],O=U.start,T=U.count;for(let F=O,Q=O+T;F<Q;F+=3)E(n[F+0],n[F+1],n[F+2])}const M=new y,v=new y,S=new y,D=new y;function x(C){S.fromArray(r,C*3),D.copy(S);const R=l[C];M.copy(R),M.sub(S.multiplyScalar(S.dot(R))).normalize(),v.crossVectors(D,R);const O=v.dot(h[C])<0?-1:1;c[C*4]=M.x,c[C*4+1]=M.y,c[C*4+2]=M.z,c[C*4+3]=O}for(let C=0,R=_.length;C<R;++C){const U=_[C],O=U.start,T=U.count;for(let F=O,Q=O+T;F<Q;F+=3)x(n[F+0]),x(n[F+1]),x(n[F+2])}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Ut(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,f=n.count;d<f;d++)n.setXYZ(d,0,0,0);const i=new y,r=new y,a=new y,o=new y,c=new y,l=new y,h=new y,u=new y;if(e)for(let d=0,f=e.count;d<f;d+=3){const p=e.getX(d+0),m=e.getX(d+1),g=e.getX(d+2);i.fromBufferAttribute(t,p),r.fromBufferAttribute(t,m),a.fromBufferAttribute(t,g),h.subVectors(a,r),u.subVectors(i,r),h.cross(u),o.fromBufferAttribute(n,p),c.fromBufferAttribute(n,m),l.fromBufferAttribute(n,g),o.add(h),c.add(h),l.add(h),n.setXYZ(p,o.x,o.y,o.z),n.setXYZ(m,c.x,c.y,c.z),n.setXYZ(g,l.x,l.y,l.z)}else for(let d=0,f=t.count;d<f;d+=3)i.fromBufferAttribute(t,d+0),r.fromBufferAttribute(t,d+1),a.fromBufferAttribute(t,d+2),h.subVectors(a,r),u.subVectors(i,r),h.cross(u),n.setXYZ(d+0,h.x,h.y,h.z),n.setXYZ(d+1,h.x,h.y,h.z),n.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)kt.fromBufferAttribute(e,t),kt.normalize(),e.setXYZ(t,kt.x,kt.y,kt.z)}toNonIndexed(){function e(o,c){const l=o.array,h=o.itemSize,u=o.normalized,d=new l.constructor(c.length*h);let f=0,p=0;for(let m=0,g=c.length;m<g;m++){o.isInterleavedBufferAttribute?f=c[m]*o.data.stride+o.offset:f=c[m]*h;for(let A=0;A<h;A++)d[p++]=l[f++]}return new Ut(d,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new It,n=this.index.array,i=this.attributes;for(const o in i){const c=i[o],l=e(c,n);t.setAttribute(o,l)}const r=this.morphAttributes;for(const o in r){const c=[],l=r[o];for(let h=0,u=l.length;h<u;h++){const d=l[h],f=e(d,n);c.push(f)}t.morphAttributes[o]=c}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,c=a.length;o<c;o++){const l=a[o];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const c=this.parameters;for(const l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const c in n){const l=n[c];e.data.attributes[c]=l.toJSON(e.data)}const i={};let r=!1;for(const c in this.morphAttributes){const l=this.morphAttributes[c],h=[];for(let u=0,d=l.length;u<d;u++){const f=l[u];h.push(f.toJSON(e.data))}h.length>0&&(i[c]=h,r=!0)}r&&(e.data.morphAttributes=i,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone(t));const i=e.attributes;for(const l in i){const h=i[l];this.setAttribute(l,h.clone(t))}const r=e.morphAttributes;for(const l in r){const h=[],u=r[l];for(let d=0,f=u.length;d<f;d++)h.push(u[d].clone(t));this.morphAttributes[l]=h}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let l=0,h=a.length;l<h;l++){const u=a[l];this.addGroup(u.start,u.count,u.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const $c=new Fe,pi=new qs,or=new Ln,el=new y,Wi=new y,qi=new y,Xi=new y,Ca=new y,cr=new y,lr=new oe,hr=new oe,ur=new oe,tl=new y,nl=new y,il=new y,dr=new y,fr=new y;class _e extends Ze{constructor(e=new It,t=new Mn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=i.length;r<a;r++){const o=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){const n=this.geometry,i=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(i,e);const o=this.morphTargetInfluences;if(r&&o){cr.set(0,0,0);for(let c=0,l=r.length;c<l;c++){const h=o[c],u=r[c];h!==0&&(Ca.fromBufferAttribute(u,e),a?cr.addScaledVector(Ca,h):cr.addScaledVector(Ca.sub(t),h))}t.add(cr)}return t}raycast(e,t){const n=this.geometry,i=this.material,r=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),or.copy(n.boundingSphere),or.applyMatrix4(r),pi.copy(e.ray).recast(e.near),!(or.containsPoint(pi.origin)===!1&&(pi.intersectSphere(or,el)===null||pi.origin.distanceToSquared(el)>(e.far-e.near)**2))&&($c.copy(r).invert(),pi.copy(e.ray).applyMatrix4($c),!(n.boundingBox!==null&&pi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,pi)))}_computeIntersections(e,t,n){let i;const r=this.geometry,a=this.material,o=r.index,c=r.attributes.position,l=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,d=r.groups,f=r.drawRange;if(o!==null)if(Array.isArray(a))for(let p=0,m=d.length;p<m;p++){const g=d[p],A=a[g.materialIndex],b=Math.max(g.start,f.start),E=Math.min(o.count,Math.min(g.start+g.count,f.start+f.count));for(let _=b,M=E;_<M;_+=3){const v=o.getX(_),S=o.getX(_+1),D=o.getX(_+2);i=Ar(this,A,e,n,l,h,u,v,S,D),i&&(i.faceIndex=Math.floor(_/3),i.face.materialIndex=g.materialIndex,t.push(i))}}else{const p=Math.max(0,f.start),m=Math.min(o.count,f.start+f.count);for(let g=p,A=m;g<A;g+=3){const b=o.getX(g),E=o.getX(g+1),_=o.getX(g+2);i=Ar(this,a,e,n,l,h,u,b,E,_),i&&(i.faceIndex=Math.floor(g/3),t.push(i))}}else if(c!==void 0)if(Array.isArray(a))for(let p=0,m=d.length;p<m;p++){const g=d[p],A=a[g.materialIndex],b=Math.max(g.start,f.start),E=Math.min(c.count,Math.min(g.start+g.count,f.start+f.count));for(let _=b,M=E;_<M;_+=3){const v=_,S=_+1,D=_+2;i=Ar(this,A,e,n,l,h,u,v,S,D),i&&(i.faceIndex=Math.floor(_/3),i.face.materialIndex=g.materialIndex,t.push(i))}}else{const p=Math.max(0,f.start),m=Math.min(c.count,f.start+f.count);for(let g=p,A=m;g<A;g+=3){const b=g,E=g+1,_=g+2;i=Ar(this,a,e,n,l,h,u,b,E,_),i&&(i.faceIndex=Math.floor(g/3),t.push(i))}}}}function jf(s,e,t,n,i,r,a,o){let c;if(e.side===$t?c=n.intersectTriangle(a,r,i,!0,o):c=n.intersectTriangle(i,r,a,e.side===Rn,o),c===null)return null;fr.copy(o),fr.applyMatrix4(s.matrixWorld);const l=t.ray.origin.distanceTo(fr);return l<t.near||l>t.far?null:{distance:l,point:fr.clone(),object:s}}function Ar(s,e,t,n,i,r,a,o,c,l){s.getVertexPosition(o,Wi),s.getVertexPosition(c,qi),s.getVertexPosition(l,Xi);const h=jf(s,e,t,n,Wi,qi,Xi,dr);if(h){i&&(lr.fromBufferAttribute(i,o),hr.fromBufferAttribute(i,c),ur.fromBufferAttribute(i,l),h.uv=An.getInterpolation(dr,Wi,qi,Xi,lr,hr,ur,new oe)),r&&(lr.fromBufferAttribute(r,o),hr.fromBufferAttribute(r,c),ur.fromBufferAttribute(r,l),h.uv1=An.getInterpolation(dr,Wi,qi,Xi,lr,hr,ur,new oe),h.uv2=h.uv1),a&&(tl.fromBufferAttribute(a,o),nl.fromBufferAttribute(a,c),il.fromBufferAttribute(a,l),h.normal=An.getInterpolation(dr,Wi,qi,Xi,tl,nl,il,new y),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const u={a:o,b:c,c:l,normal:new y,materialIndex:0};An.getNormal(Wi,qi,Xi,u.normal),h.face=u}return h}class Gt extends It{constructor(e=1,t=1,n=1,i=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:i,heightSegments:r,depthSegments:a};const o=this;i=Math.floor(i),r=Math.floor(r),a=Math.floor(a);const c=[],l=[],h=[],u=[];let d=0,f=0;p("z","y","x",-1,-1,n,t,e,a,r,0),p("z","y","x",1,-1,n,t,-e,a,r,1),p("x","z","y",1,1,e,n,t,i,a,2),p("x","z","y",1,-1,e,n,-t,i,a,3),p("x","y","z",1,-1,e,t,n,i,r,4),p("x","y","z",-1,-1,e,t,-n,i,r,5),this.setIndex(c),this.setAttribute("position",new ft(l,3)),this.setAttribute("normal",new ft(h,3)),this.setAttribute("uv",new ft(u,2));function p(m,g,A,b,E,_,M,v,S,D,x){const C=_/S,R=M/D,U=_/2,O=M/2,T=v/2,F=S+1,Q=D+1;let X=0,k=0;const G=new y;for(let j=0;j<Q;j++){const J=j*R-O;for(let ne=0;ne<F;ne++){const W=ne*C-U;G[m]=W*b,G[g]=J*E,G[A]=T,l.push(G.x,G.y,G.z),G[m]=0,G[g]=0,G[A]=v>0?1:-1,h.push(G.x,G.y,G.z),u.push(ne/S),u.push(1-j/D),X+=1}}for(let j=0;j<D;j++)for(let J=0;J<S;J++){const ne=d+J+F*j,W=d+J+F*(j+1),Z=d+(J+1)+F*(j+1),ce=d+(J+1)+F*j;c.push(ne,W,ce),c.push(W,Z,ce),k+=6}o.addGroup(f,k,x),f+=k,d+=X}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Gt(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function ps(s){const e={};for(const t in s){e[t]={};for(const n in s[t]){const i=s[t][n];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=i.clone():Array.isArray(i)?e[t][n]=i.slice():e[t][n]=i}}return e}function Zt(s){const e={};for(let t=0;t<s.length;t++){const n=ps(s[t]);for(const i in n)e[i]=n[i]}return e}function Jf(s){const e=[];for(let t=0;t<s.length;t++)e.push(s[t].clone());return e}function gu(s){return s.getRenderTarget()===null?s.outputColorSpace:rt.workingColorSpace}const jr={clone:ps,merge:Zt};var Zf=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,$f=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Xn extends wn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Zf,this.fragmentShader=$f,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={derivatives:!1,fragDepth:!1,drawBuffers:!1,shaderTextureLOD:!1,clipCullDistance:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=ps(e.uniforms),this.uniformsGroups=Jf(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const i in this.uniforms){const a=this.uniforms[i].value;a&&a.isTexture?t.uniforms[i]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[i]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[i]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[i]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[i]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[i]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[i]={type:"m4",value:a.toArray()}:t.uniforms[i]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class mu extends Ze{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Fe,this.projectionMatrix=new Fe,this.projectionMatrixInverse=new Fe,this.coordinateSystem=Wn}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}class Yt extends mu{constructor(e=50,t=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=As*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Fs*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return As*2*Math.atan(Math.tan(Fs*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}setViewOffset(e,t,n,i,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Fs*.5*this.fov)/this.zoom,n=2*t,i=this.aspect*n,r=-.5*i;const a=this.view;if(this.view!==null&&this.view.enabled){const c=a.fullWidth,l=a.fullHeight;r+=a.offsetX*i/c,t-=a.offsetY*n/l,i*=a.width/c,n*=a.height/l}const o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+i,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const Yi=-90,Ki=1;class eA extends Ze{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const i=new Yt(Yi,Ki,e,t);i.layers=this.layers,this.add(i);const r=new Yt(Yi,Ki,e,t);r.layers=this.layers,this.add(r);const a=new Yt(Yi,Ki,e,t);a.layers=this.layers,this.add(a);const o=new Yt(Yi,Ki,e,t);o.layers=this.layers,this.add(o);const c=new Yt(Yi,Ki,e,t);c.layers=this.layers,this.add(c);const l=new Yt(Yi,Ki,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,i,r,a,o,c]=t;for(const l of t)this.remove(l);if(e===Wn)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===Yr)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,a,o,c,l,h]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;const m=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,i),e.render(t,r),e.setRenderTarget(n,1,i),e.render(t,a),e.setRenderTarget(n,2,i),e.render(t,o),e.setRenderTarget(n,3,i),e.render(t,c),e.setRenderTarget(n,4,i),e.render(t,l),n.texture.generateMipmaps=m,e.setRenderTarget(n,5,i),e.render(t,h),e.setRenderTarget(u,d,f),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}}class bu extends Ft{constructor(e,t,n,i,r,a,o,c,l,h){e=e!==void 0?e:[],t=t!==void 0?t:Ti,super(e,t,n,i,r,a,o,c,l,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class tA extends li{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},i=[n,n,n,n,n,n];t.encoding!==void 0&&(Ns("THREE.WebGLCubeRenderTarget: option.encoding has been replaced by option.colorSpace."),t.colorSpace=t.encoding===Bi?dt:rn),this.texture=new bu(i,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:Xt}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},i=new Gt(5,5,5),r=new Xn({name:"CubemapFromEquirect",uniforms:ps(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:$t,blending:ri});r.uniforms.tEquirect.value=t;const a=new _e(i,r),o=t.minFilter;return t.minFilter===ci&&(t.minFilter=Xt),new eA(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t,n,i){const r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,i);e.setRenderTarget(r)}}const Ia=new y,nA=new y,iA=new Ye;class cn{constructor(e=new y(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,i){return this.normal.set(e,t,n),this.constant=i,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const i=Ia.subVectors(n,t).cross(nA.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(i,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta(Ia),i=this.normal.dot(n);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const r=-(e.start.dot(this.normal)+this.constant)/i;return r<0||r>1?null:t.copy(e.start).addScaledVector(n,r)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||iA.getNormalMatrix(e),i=this.coplanarPoint(Ia).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const gi=new Ln,pr=new y;class Go{constructor(e=new cn,t=new cn,n=new cn,i=new cn,r=new cn,a=new cn){this.planes=[e,t,n,i,r,a]}set(e,t,n,i,r,a){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(i),o[4].copy(r),o[5].copy(a),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Wn){const n=this.planes,i=e.elements,r=i[0],a=i[1],o=i[2],c=i[3],l=i[4],h=i[5],u=i[6],d=i[7],f=i[8],p=i[9],m=i[10],g=i[11],A=i[12],b=i[13],E=i[14],_=i[15];if(n[0].setComponents(c-r,d-l,g-f,_-A).normalize(),n[1].setComponents(c+r,d+l,g+f,_+A).normalize(),n[2].setComponents(c+a,d+h,g+p,_+b).normalize(),n[3].setComponents(c-a,d-h,g-p,_-b).normalize(),n[4].setComponents(c-o,d-u,g-m,_-E).normalize(),t===Wn)n[5].setComponents(c+o,d+u,g+m,_+E).normalize();else if(t===Yr)n[5].setComponents(o,u,m,E).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),gi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),gi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(gi)}intersectsSprite(e){return gi.center.set(0,0,0),gi.radius=.7071067811865476,gi.applyMatrix4(e.matrixWorld),this.intersectsSphere(gi)}intersectsSphere(e){const t=this.planes,n=e.center,i=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<i)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const i=t[n];if(pr.x=i.normal.x>0?e.max.x:e.min.x,pr.y=i.normal.y>0?e.max.y:e.min.y,pr.z=i.normal.z>0?e.max.z:e.min.z,i.distanceToPoint(pr)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function Eu(){let s=null,e=!1,t=null,n=null;function i(r,a){t(r,a),n=s.requestAnimationFrame(i)}return{start:function(){e!==!0&&t!==null&&(n=s.requestAnimationFrame(i),e=!0)},stop:function(){s.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){s=r}}}function sA(s,e){const t=e.isWebGL2,n=new WeakMap;function i(l,h){const u=l.array,d=l.usage,f=u.byteLength,p=s.createBuffer();s.bindBuffer(h,p),s.bufferData(h,u,d),l.onUploadCallback();let m;if(u instanceof Float32Array)m=s.FLOAT;else if(u instanceof Uint16Array)if(l.isFloat16BufferAttribute)if(t)m=s.HALF_FLOAT;else throw new Error("THREE.WebGLAttributes: Usage of Float16BufferAttribute requires WebGL2.");else m=s.UNSIGNED_SHORT;else if(u instanceof Int16Array)m=s.SHORT;else if(u instanceof Uint32Array)m=s.UNSIGNED_INT;else if(u instanceof Int32Array)m=s.INT;else if(u instanceof Int8Array)m=s.BYTE;else if(u instanceof Uint8Array)m=s.UNSIGNED_BYTE;else if(u instanceof Uint8ClampedArray)m=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+u);return{buffer:p,type:m,bytesPerElement:u.BYTES_PER_ELEMENT,version:l.version,size:f}}function r(l,h,u){const d=h.array,f=h._updateRange,p=h.updateRanges;if(s.bindBuffer(u,l),f.count===-1&&p.length===0&&s.bufferSubData(u,0,d),p.length!==0){for(let m=0,g=p.length;m<g;m++){const A=p[m];t?s.bufferSubData(u,A.start*d.BYTES_PER_ELEMENT,d,A.start,A.count):s.bufferSubData(u,A.start*d.BYTES_PER_ELEMENT,d.subarray(A.start,A.start+A.count))}h.clearUpdateRanges()}f.count!==-1&&(t?s.bufferSubData(u,f.offset*d.BYTES_PER_ELEMENT,d,f.offset,f.count):s.bufferSubData(u,f.offset*d.BYTES_PER_ELEMENT,d.subarray(f.offset,f.offset+f.count)),f.count=-1),h.onUploadCallback()}function a(l){return l.isInterleavedBufferAttribute&&(l=l.data),n.get(l)}function o(l){l.isInterleavedBufferAttribute&&(l=l.data);const h=n.get(l);h&&(s.deleteBuffer(h.buffer),n.delete(l))}function c(l,h){if(l.isGLBufferAttribute){const d=n.get(l);(!d||d.version<l.version)&&n.set(l,{buffer:l.buffer,type:l.type,bytesPerElement:l.elementSize,version:l.version});return}l.isInterleavedBufferAttribute&&(l=l.data);const u=n.get(l);if(u===void 0)n.set(l,i(l,h));else if(u.version<l.version){if(u.size!==l.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");r(u.buffer,l,h),u.version=l.version}}return{get:a,remove:o,update:c}}class Yn extends It{constructor(e=1,t=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:i};const r=e/2,a=t/2,o=Math.floor(n),c=Math.floor(i),l=o+1,h=c+1,u=e/o,d=t/c,f=[],p=[],m=[],g=[];for(let A=0;A<h;A++){const b=A*d-a;for(let E=0;E<l;E++){const _=E*u-r;p.push(_,-b,0),m.push(0,0,1),g.push(E/o),g.push(1-A/c)}}for(let A=0;A<c;A++)for(let b=0;b<o;b++){const E=b+l*A,_=b+l*(A+1),M=b+1+l*(A+1),v=b+1+l*A;f.push(E,_,v),f.push(_,M,v)}this.setIndex(f),this.setAttribute("position",new ft(p,3)),this.setAttribute("normal",new ft(m,3)),this.setAttribute("uv",new ft(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Yn(e.width,e.height,e.widthSegments,e.heightSegments)}}var rA=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,aA=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,oA=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,cA=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,lA=`#ifdef USE_ALPHATEST
	if ( diffuseColor.a < alphaTest ) discard;
#endif`,hA=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,uA=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,dA=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,fA=`#ifdef USE_BATCHING
	attribute float batchId;
	uniform highp sampler2D batchingTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,AA=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( batchId );
#endif`,pA=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,gA=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,mA=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,bA=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,EA=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,_A=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#pragma unroll_loop_start
	for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
		plane = clippingPlanes[ i ];
		if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
	}
	#pragma unroll_loop_end
	#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
		bool clipped = true;
		#pragma unroll_loop_start
		for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
		}
		#pragma unroll_loop_end
		if ( clipped ) discard;
	#endif
#endif`,xA=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,yA=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,vA=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,CA=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,IA=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,SA=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	varying vec3 vColor;
#endif`,MA=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif`,wA=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
float luminance( const in vec3 rgb ) {
	const vec3 weights = vec3( 0.2126729, 0.7151522, 0.0721750 );
	return dot( weights, rgb );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,BA=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,TA=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,RA=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,DA=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,LA=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,PA=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,FA="gl_FragColor = linearToOutputTexel( gl_FragColor );",UA=`
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}
vec4 LinearToLinear( in vec4 value ) {
	return value;
}
vec4 LinearTosRGB( in vec4 value ) {
	return sRGBTransferOETF( value );
}`,NA=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,QA=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,OA=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,kA=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,GA=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,HA=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,zA=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,VA=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,WA=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,qA=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,XA=`#ifdef USE_LIGHTMAP
	vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
	vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
	reflectedLight.indirectDiffuse += lightMapIrradiance;
#endif`,YA=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,KA=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,jA=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,JA=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	#if defined ( LEGACY_LIGHTS )
		if ( cutoffDistance > 0.0 && decayExponent > 0.0 ) {
			return pow( saturate( - lightDistance / cutoffDistance + 1.0 ), decayExponent );
		}
		return 1.0;
	#else
		float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
		if ( cutoffDistance > 0.0 ) {
			distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
		}
		return distanceFalloff;
	#endif
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,ZA=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,$A=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,ep=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,tp=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,np=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,ip=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,sp=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,rp=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,ap=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,op=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,cp=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,lp=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,hp=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		varying float vFragDepth;
		varying float vIsPerspective;
	#else
		uniform float logDepthBufFC;
	#endif
#endif`,up=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		vFragDepth = 1.0 + gl_Position.w;
		vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
	#else
		if ( isPerspectiveMatrix( projectionMatrix ) ) {
			gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
			gl_Position.z *= gl_Position.w;
		}
	#endif
#endif`,dp=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,fp=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Ap=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,pp=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,gp=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,mp=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,bp=`#if defined( USE_MORPHCOLORS ) && defined( MORPHTARGETS_TEXTURE )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Ep=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		objectNormal += morphNormal0 * morphTargetInfluences[ 0 ];
		objectNormal += morphNormal1 * morphTargetInfluences[ 1 ];
		objectNormal += morphNormal2 * morphTargetInfluences[ 2 ];
		objectNormal += morphNormal3 * morphTargetInfluences[ 3 ];
	#endif
#endif`,_p=`#ifdef USE_MORPHTARGETS
	uniform float morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
		uniform sampler2DArray morphTargetsTexture;
		uniform ivec2 morphTargetsTextureSize;
		vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
			int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
			int y = texelIndex / morphTargetsTextureSize.x;
			int x = texelIndex - y * morphTargetsTextureSize.x;
			ivec3 morphUV = ivec3( x, y, morphTargetIndex );
			return texelFetch( morphTargetsTexture, morphUV, 0 );
		}
	#else
		#ifndef USE_MORPHNORMALS
			uniform float morphTargetInfluences[ 8 ];
		#else
			uniform float morphTargetInfluences[ 4 ];
		#endif
	#endif
#endif`,xp=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		transformed += morphTarget0 * morphTargetInfluences[ 0 ];
		transformed += morphTarget1 * morphTargetInfluences[ 1 ];
		transformed += morphTarget2 * morphTargetInfluences[ 2 ];
		transformed += morphTarget3 * morphTargetInfluences[ 3 ];
		#ifndef USE_MORPHNORMALS
			transformed += morphTarget4 * morphTargetInfluences[ 4 ];
			transformed += morphTarget5 * morphTargetInfluences[ 5 ];
			transformed += morphTarget6 * morphTargetInfluences[ 6 ];
			transformed += morphTarget7 * morphTargetInfluences[ 7 ];
		#endif
	#endif
#endif`,yp=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,vp=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Cp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Ip=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Sp=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Mp=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,wp=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Bp=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Tp=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Rp=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Dp=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Lp=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;
const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );
const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );
const float ShiftRight8 = 1. / 256.;
vec4 packDepthToRGBA( const in float v ) {
	vec4 r = vec4( fract( v * PackFactors ), v );
	r.yzw -= r.xyz * ShiftRight8;	return r * PackUpscale;
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors );
}
vec2 packDepthToRG( in highp float v ) {
	return packDepthToRGBA( v ).yx;
}
float unpackRGToDepth( const in highp vec2 v ) {
	return unpackRGBAToDepth( vec4( v.xy, 0.0, 0.0 ) );
}
vec4 pack2HalfToRGBA( vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,Pp=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Fp=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Up=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Np=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Qp=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Op=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,kp=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return shadow;
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
		vec3 lightToPosition = shadowCoord.xyz;
		float dp = ( length( lightToPosition ) - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );		dp += shadowBias;
		vec3 bd3D = normalize( lightToPosition );
		#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
			vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
			return (
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
			) * ( 1.0 / 9.0 );
		#else
			return texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
		#endif
	}
#endif`,Gp=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Hp=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,zp=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Vp=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Wp=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,qp=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Xp=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Yp=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Kp=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,jp=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Jp=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 OptimizedCineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color *= toneMappingExposure;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	return color;
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Zp=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,$p=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
		vec3 refractedRayExit = position + transmissionRay;
		vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
		vec2 refractionCoords = ndcPos.xy / ndcPos.w;
		refractionCoords += 1.0;
		refractionCoords /= 2.0;
		vec4 transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
		vec3 transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,eg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,tg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,ng=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,ig=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const sg=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,rg=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,ag=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,og=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,lg=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,hg=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,ug=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#endif
}`,dg=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,fg=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,Ag=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,pg=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,gg=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,mg=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,bg=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Eg=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,_g=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,xg=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,yg=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,vg=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Cg=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Ig=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), opacity );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Sg=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Mg=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,wg=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Bg=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Tg=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Rg=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Dg=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Lg=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Pg=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Fg=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Ug=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
	vec2 scale;
	scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
	scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Ng=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Xe={alphahash_fragment:rA,alphahash_pars_fragment:aA,alphamap_fragment:oA,alphamap_pars_fragment:cA,alphatest_fragment:lA,alphatest_pars_fragment:hA,aomap_fragment:uA,aomap_pars_fragment:dA,batching_pars_vertex:fA,batching_vertex:AA,begin_vertex:pA,beginnormal_vertex:gA,bsdfs:mA,iridescence_fragment:bA,bumpmap_pars_fragment:EA,clipping_planes_fragment:_A,clipping_planes_pars_fragment:xA,clipping_planes_pars_vertex:yA,clipping_planes_vertex:vA,color_fragment:CA,color_pars_fragment:IA,color_pars_vertex:SA,color_vertex:MA,common:wA,cube_uv_reflection_fragment:BA,defaultnormal_vertex:TA,displacementmap_pars_vertex:RA,displacementmap_vertex:DA,emissivemap_fragment:LA,emissivemap_pars_fragment:PA,colorspace_fragment:FA,colorspace_pars_fragment:UA,envmap_fragment:NA,envmap_common_pars_fragment:QA,envmap_pars_fragment:OA,envmap_pars_vertex:kA,envmap_physical_pars_fragment:ZA,envmap_vertex:GA,fog_vertex:HA,fog_pars_vertex:zA,fog_fragment:VA,fog_pars_fragment:WA,gradientmap_pars_fragment:qA,lightmap_fragment:XA,lightmap_pars_fragment:YA,lights_lambert_fragment:KA,lights_lambert_pars_fragment:jA,lights_pars_begin:JA,lights_toon_fragment:$A,lights_toon_pars_fragment:ep,lights_phong_fragment:tp,lights_phong_pars_fragment:np,lights_physical_fragment:ip,lights_physical_pars_fragment:sp,lights_fragment_begin:rp,lights_fragment_maps:ap,lights_fragment_end:op,logdepthbuf_fragment:cp,logdepthbuf_pars_fragment:lp,logdepthbuf_pars_vertex:hp,logdepthbuf_vertex:up,map_fragment:dp,map_pars_fragment:fp,map_particle_fragment:Ap,map_particle_pars_fragment:pp,metalnessmap_fragment:gp,metalnessmap_pars_fragment:mp,morphcolor_vertex:bp,morphnormal_vertex:Ep,morphtarget_pars_vertex:_p,morphtarget_vertex:xp,normal_fragment_begin:yp,normal_fragment_maps:vp,normal_pars_fragment:Cp,normal_pars_vertex:Ip,normal_vertex:Sp,normalmap_pars_fragment:Mp,clearcoat_normal_fragment_begin:wp,clearcoat_normal_fragment_maps:Bp,clearcoat_pars_fragment:Tp,iridescence_pars_fragment:Rp,opaque_fragment:Dp,packing:Lp,premultiplied_alpha_fragment:Pp,project_vertex:Fp,dithering_fragment:Up,dithering_pars_fragment:Np,roughnessmap_fragment:Qp,roughnessmap_pars_fragment:Op,shadowmap_pars_fragment:kp,shadowmap_pars_vertex:Gp,shadowmap_vertex:Hp,shadowmask_pars_fragment:zp,skinbase_vertex:Vp,skinning_pars_vertex:Wp,skinning_vertex:qp,skinnormal_vertex:Xp,specularmap_fragment:Yp,specularmap_pars_fragment:Kp,tonemapping_fragment:jp,tonemapping_pars_fragment:Jp,transmission_fragment:Zp,transmission_pars_fragment:$p,uv_pars_fragment:eg,uv_pars_vertex:tg,uv_vertex:ng,worldpos_vertex:ig,background_vert:sg,background_frag:rg,backgroundCube_vert:ag,backgroundCube_frag:og,cube_vert:cg,cube_frag:lg,depth_vert:hg,depth_frag:ug,distanceRGBA_vert:dg,distanceRGBA_frag:fg,equirect_vert:Ag,equirect_frag:pg,linedashed_vert:gg,linedashed_frag:mg,meshbasic_vert:bg,meshbasic_frag:Eg,meshlambert_vert:_g,meshlambert_frag:xg,meshmatcap_vert:yg,meshmatcap_frag:vg,meshnormal_vert:Cg,meshnormal_frag:Ig,meshphong_vert:Sg,meshphong_frag:Mg,meshphysical_vert:wg,meshphysical_frag:Bg,meshtoon_vert:Tg,meshtoon_frag:Rg,points_vert:Dg,points_frag:Lg,shadow_vert:Pg,shadow_frag:Fg,sprite_vert:Ug,sprite_frag:Ng},re={common:{diffuse:{value:new Ae(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ye},alphaMap:{value:null},alphaMapTransform:{value:new Ye},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ye}},envmap:{envMap:{value:null},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ye}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ye}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ye},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ye},normalScale:{value:new oe(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ye},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ye}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ye}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ye}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ae(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ae(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ye},alphaTest:{value:0},uvTransform:{value:new Ye}},sprite:{diffuse:{value:new Ae(16777215)},opacity:{value:1},center:{value:new oe(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ye},alphaMap:{value:null},alphaMapTransform:{value:new Ye},alphaTest:{value:0}}},In={basic:{uniforms:Zt([re.common,re.specularmap,re.envmap,re.aomap,re.lightmap,re.fog]),vertexShader:Xe.meshbasic_vert,fragmentShader:Xe.meshbasic_frag},lambert:{uniforms:Zt([re.common,re.specularmap,re.envmap,re.aomap,re.lightmap,re.emissivemap,re.bumpmap,re.normalmap,re.displacementmap,re.fog,re.lights,{emissive:{value:new Ae(0)}}]),vertexShader:Xe.meshlambert_vert,fragmentShader:Xe.meshlambert_frag},phong:{uniforms:Zt([re.common,re.specularmap,re.envmap,re.aomap,re.lightmap,re.emissivemap,re.bumpmap,re.normalmap,re.displacementmap,re.fog,re.lights,{emissive:{value:new Ae(0)},specular:{value:new Ae(1118481)},shininess:{value:30}}]),vertexShader:Xe.meshphong_vert,fragmentShader:Xe.meshphong_frag},standard:{uniforms:Zt([re.common,re.envmap,re.aomap,re.lightmap,re.emissivemap,re.bumpmap,re.normalmap,re.displacementmap,re.roughnessmap,re.metalnessmap,re.fog,re.lights,{emissive:{value:new Ae(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Xe.meshphysical_vert,fragmentShader:Xe.meshphysical_frag},toon:{uniforms:Zt([re.common,re.aomap,re.lightmap,re.emissivemap,re.bumpmap,re.normalmap,re.displacementmap,re.gradientmap,re.fog,re.lights,{emissive:{value:new Ae(0)}}]),vertexShader:Xe.meshtoon_vert,fragmentShader:Xe.meshtoon_frag},matcap:{uniforms:Zt([re.common,re.bumpmap,re.normalmap,re.displacementmap,re.fog,{matcap:{value:null}}]),vertexShader:Xe.meshmatcap_vert,fragmentShader:Xe.meshmatcap_frag},points:{uniforms:Zt([re.points,re.fog]),vertexShader:Xe.points_vert,fragmentShader:Xe.points_frag},dashed:{uniforms:Zt([re.common,re.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Xe.linedashed_vert,fragmentShader:Xe.linedashed_frag},depth:{uniforms:Zt([re.common,re.displacementmap]),vertexShader:Xe.depth_vert,fragmentShader:Xe.depth_frag},normal:{uniforms:Zt([re.common,re.bumpmap,re.normalmap,re.displacementmap,{opacity:{value:1}}]),vertexShader:Xe.meshnormal_vert,fragmentShader:Xe.meshnormal_frag},sprite:{uniforms:Zt([re.sprite,re.fog]),vertexShader:Xe.sprite_vert,fragmentShader:Xe.sprite_frag},background:{uniforms:{uvTransform:{value:new Ye},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Xe.background_vert,fragmentShader:Xe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1}},vertexShader:Xe.backgroundCube_vert,fragmentShader:Xe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Xe.cube_vert,fragmentShader:Xe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Xe.equirect_vert,fragmentShader:Xe.equirect_frag},distanceRGBA:{uniforms:Zt([re.common,re.displacementmap,{referencePosition:{value:new y},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Xe.distanceRGBA_vert,fragmentShader:Xe.distanceRGBA_frag},shadow:{uniforms:Zt([re.lights,re.fog,{color:{value:new Ae(0)},opacity:{value:1}}]),vertexShader:Xe.shadow_vert,fragmentShader:Xe.shadow_frag}};In.physical={uniforms:Zt([In.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ye},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ye},clearcoatNormalScale:{value:new oe(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ye},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ye},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ye},sheen:{value:0},sheenColor:{value:new Ae(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ye},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ye},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ye},transmissionSamplerSize:{value:new oe},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ye},attenuationDistance:{value:0},attenuationColor:{value:new Ae(0)},specularColor:{value:new Ae(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ye},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ye},anisotropyVector:{value:new oe},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ye}}]),vertexShader:Xe.meshphysical_vert,fragmentShader:Xe.meshphysical_frag};const gr={r:0,b:0,g:0};function Qg(s,e,t,n,i,r,a){const o=new Ae(0);let c=r===!0?0:1,l,h,u=null,d=0,f=null;function p(g,A){let b=!1,E=A.isScene===!0?A.background:null;E&&E.isTexture&&(E=(A.backgroundBlurriness>0?t:e).get(E)),E===null?m(o,c):E&&E.isColor&&(m(E,1),b=!0);const _=s.xr.getEnvironmentBlendMode();_==="additive"?n.buffers.color.setClear(0,0,0,1,a):_==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(s.autoClear||b)&&s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil),E&&(E.isCubeTexture||E.mapping===Zr)?(h===void 0&&(h=new _e(new Gt(1,1,1),new Xn({name:"BackgroundCubeMaterial",uniforms:ps(In.backgroundCube.uniforms),vertexShader:In.backgroundCube.vertexShader,fragmentShader:In.backgroundCube.fragmentShader,side:$t,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(M,v,S){this.matrixWorld.copyPosition(S.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(h)),h.material.uniforms.envMap.value=E,h.material.uniforms.flipEnvMap.value=E.isCubeTexture&&E.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=A.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,h.material.toneMapped=rt.getTransfer(E.colorSpace)!==bt,(u!==E||d!==E.version||f!==s.toneMapping)&&(h.material.needsUpdate=!0,u=E,d=E.version,f=s.toneMapping),h.layers.enableAll(),g.unshift(h,h.geometry,h.material,0,0,null)):E&&E.isTexture&&(l===void 0&&(l=new _e(new Yn(2,2),new Xn({name:"BackgroundMaterial",uniforms:ps(In.background.uniforms),vertexShader:In.background.vertexShader,fragmentShader:In.background.fragmentShader,side:Rn,depthTest:!1,depthWrite:!1,fog:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=E,l.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,l.material.toneMapped=rt.getTransfer(E.colorSpace)!==bt,E.matrixAutoUpdate===!0&&E.updateMatrix(),l.material.uniforms.uvTransform.value.copy(E.matrix),(u!==E||d!==E.version||f!==s.toneMapping)&&(l.material.needsUpdate=!0,u=E,d=E.version,f=s.toneMapping),l.layers.enableAll(),g.unshift(l,l.geometry,l.material,0,0,null))}function m(g,A){g.getRGB(gr,gu(s)),n.buffers.color.setClear(gr.r,gr.g,gr.b,A,a)}return{getClearColor:function(){return o},setClearColor:function(g,A=1){o.set(g),c=A,m(o,c)},getClearAlpha:function(){return c},setClearAlpha:function(g){c=g,m(o,c)},render:p}}function Og(s,e,t,n){const i=s.getParameter(s.MAX_VERTEX_ATTRIBS),r=n.isWebGL2?null:e.get("OES_vertex_array_object"),a=n.isWebGL2||r!==null,o={},c=g(null);let l=c,h=!1;function u(T,F,Q,X,k){let G=!1;if(a){const j=m(X,Q,F);l!==j&&(l=j,f(l.object)),G=A(T,X,Q,k),G&&b(T,X,Q,k)}else{const j=F.wireframe===!0;(l.geometry!==X.id||l.program!==Q.id||l.wireframe!==j)&&(l.geometry=X.id,l.program=Q.id,l.wireframe=j,G=!0)}k!==null&&t.update(k,s.ELEMENT_ARRAY_BUFFER),(G||h)&&(h=!1,D(T,F,Q,X),k!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,t.get(k).buffer))}function d(){return n.isWebGL2?s.createVertexArray():r.createVertexArrayOES()}function f(T){return n.isWebGL2?s.bindVertexArray(T):r.bindVertexArrayOES(T)}function p(T){return n.isWebGL2?s.deleteVertexArray(T):r.deleteVertexArrayOES(T)}function m(T,F,Q){const X=Q.wireframe===!0;let k=o[T.id];k===void 0&&(k={},o[T.id]=k);let G=k[F.id];G===void 0&&(G={},k[F.id]=G);let j=G[X];return j===void 0&&(j=g(d()),G[X]=j),j}function g(T){const F=[],Q=[],X=[];for(let k=0;k<i;k++)F[k]=0,Q[k]=0,X[k]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:F,enabledAttributes:Q,attributeDivisors:X,object:T,attributes:{},index:null}}function A(T,F,Q,X){const k=l.attributes,G=F.attributes;let j=0;const J=Q.getAttributes();for(const ne in J)if(J[ne].location>=0){const Z=k[ne];let ce=G[ne];if(ce===void 0&&(ne==="instanceMatrix"&&T.instanceMatrix&&(ce=T.instanceMatrix),ne==="instanceColor"&&T.instanceColor&&(ce=T.instanceColor)),Z===void 0||Z.attribute!==ce||ce&&Z.data!==ce.data)return!0;j++}return l.attributesNum!==j||l.index!==X}function b(T,F,Q,X){const k={},G=F.attributes;let j=0;const J=Q.getAttributes();for(const ne in J)if(J[ne].location>=0){let Z=G[ne];Z===void 0&&(ne==="instanceMatrix"&&T.instanceMatrix&&(Z=T.instanceMatrix),ne==="instanceColor"&&T.instanceColor&&(Z=T.instanceColor));const ce={};ce.attribute=Z,Z&&Z.data&&(ce.data=Z.data),k[ne]=ce,j++}l.attributes=k,l.attributesNum=j,l.index=X}function E(){const T=l.newAttributes;for(let F=0,Q=T.length;F<Q;F++)T[F]=0}function _(T){M(T,0)}function M(T,F){const Q=l.newAttributes,X=l.enabledAttributes,k=l.attributeDivisors;Q[T]=1,X[T]===0&&(s.enableVertexAttribArray(T),X[T]=1),k[T]!==F&&((n.isWebGL2?s:e.get("ANGLE_instanced_arrays"))[n.isWebGL2?"vertexAttribDivisor":"vertexAttribDivisorANGLE"](T,F),k[T]=F)}function v(){const T=l.newAttributes,F=l.enabledAttributes;for(let Q=0,X=F.length;Q<X;Q++)F[Q]!==T[Q]&&(s.disableVertexAttribArray(Q),F[Q]=0)}function S(T,F,Q,X,k,G,j){j===!0?s.vertexAttribIPointer(T,F,Q,k,G):s.vertexAttribPointer(T,F,Q,X,k,G)}function D(T,F,Q,X){if(n.isWebGL2===!1&&(T.isInstancedMesh||X.isInstancedBufferGeometry)&&e.get("ANGLE_instanced_arrays")===null)return;E();const k=X.attributes,G=Q.getAttributes(),j=F.defaultAttributeValues;for(const J in G){const ne=G[J];if(ne.location>=0){let W=k[J];if(W===void 0&&(J==="instanceMatrix"&&T.instanceMatrix&&(W=T.instanceMatrix),J==="instanceColor"&&T.instanceColor&&(W=T.instanceColor)),W!==void 0){const Z=W.normalized,ce=W.itemSize,ge=t.get(W);if(ge===void 0)continue;const pe=ge.buffer,we=ge.type,Qe=ge.bytesPerElement,De=n.isWebGL2===!0&&(we===s.INT||we===s.UNSIGNED_INT||W.gpuType===Zh);if(W.isInterleavedBufferAttribute){const Je=W.data,z=Je.stride,zt=W.offset;if(Je.isInstancedInterleavedBuffer){for(let Se=0;Se<ne.locationSize;Se++)M(ne.location+Se,Je.meshPerAttribute);T.isInstancedMesh!==!0&&X._maxInstanceCount===void 0&&(X._maxInstanceCount=Je.meshPerAttribute*Je.count)}else for(let Se=0;Se<ne.locationSize;Se++)_(ne.location+Se);s.bindBuffer(s.ARRAY_BUFFER,pe);for(let Se=0;Se<ne.locationSize;Se++)S(ne.location+Se,ce/ne.locationSize,we,Z,z*Qe,(zt+ce/ne.locationSize*Se)*Qe,De)}else{if(W.isInstancedBufferAttribute){for(let Je=0;Je<ne.locationSize;Je++)M(ne.location+Je,W.meshPerAttribute);T.isInstancedMesh!==!0&&X._maxInstanceCount===void 0&&(X._maxInstanceCount=W.meshPerAttribute*W.count)}else for(let Je=0;Je<ne.locationSize;Je++)_(ne.location+Je);s.bindBuffer(s.ARRAY_BUFFER,pe);for(let Je=0;Je<ne.locationSize;Je++)S(ne.location+Je,ce/ne.locationSize,we,Z,ce*Qe,ce/ne.locationSize*Je*Qe,De)}}else if(j!==void 0){const Z=j[J];if(Z!==void 0)switch(Z.length){case 2:s.vertexAttrib2fv(ne.location,Z);break;case 3:s.vertexAttrib3fv(ne.location,Z);break;case 4:s.vertexAttrib4fv(ne.location,Z);break;default:s.vertexAttrib1fv(ne.location,Z)}}}}v()}function x(){U();for(const T in o){const F=o[T];for(const Q in F){const X=F[Q];for(const k in X)p(X[k].object),delete X[k];delete F[Q]}delete o[T]}}function C(T){if(o[T.id]===void 0)return;const F=o[T.id];for(const Q in F){const X=F[Q];for(const k in X)p(X[k].object),delete X[k];delete F[Q]}delete o[T.id]}function R(T){for(const F in o){const Q=o[F];if(Q[T.id]===void 0)continue;const X=Q[T.id];for(const k in X)p(X[k].object),delete X[k];delete Q[T.id]}}function U(){O(),h=!0,l!==c&&(l=c,f(l.object))}function O(){c.geometry=null,c.program=null,c.wireframe=!1}return{setup:u,reset:U,resetDefaultState:O,dispose:x,releaseStatesOfGeometry:C,releaseStatesOfProgram:R,initAttributes:E,enableAttribute:_,disableUnusedAttributes:v}}function kg(s,e,t,n){const i=n.isWebGL2;let r;function a(h){r=h}function o(h,u){s.drawArrays(r,h,u),t.update(u,r,1)}function c(h,u,d){if(d===0)return;let f,p;if(i)f=s,p="drawArraysInstanced";else if(f=e.get("ANGLE_instanced_arrays"),p="drawArraysInstancedANGLE",f===null){console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}f[p](r,h,u,d),t.update(u,r,d)}function l(h,u,d){if(d===0)return;const f=e.get("WEBGL_multi_draw");if(f===null)for(let p=0;p<d;p++)this.render(h[p],u[p]);else{f.multiDrawArraysWEBGL(r,h,0,u,0,d);let p=0;for(let m=0;m<d;m++)p+=u[m];t.update(p,r,1)}}this.setMode=a,this.render=o,this.renderInstances=c,this.renderMultiDraw=l}function Gg(s,e,t){let n;function i(){if(n!==void 0)return n;if(e.has("EXT_texture_filter_anisotropic")===!0){const S=e.get("EXT_texture_filter_anisotropic");n=s.getParameter(S.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else n=0;return n}function r(S){if(S==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";S="mediump"}return S==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}const a=typeof WebGL2RenderingContext<"u"&&s.constructor.name==="WebGL2RenderingContext";let o=t.precision!==void 0?t.precision:"highp";const c=r(o);c!==o&&(console.warn("THREE.WebGLRenderer:",o,"not supported, using",c,"instead."),o=c);const l=a||e.has("WEBGL_draw_buffers"),h=t.logarithmicDepthBuffer===!0,u=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),d=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),f=s.getParameter(s.MAX_TEXTURE_SIZE),p=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),m=s.getParameter(s.MAX_VERTEX_ATTRIBS),g=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),A=s.getParameter(s.MAX_VARYING_VECTORS),b=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),E=d>0,_=a||e.has("OES_texture_float"),M=E&&_,v=a?s.getParameter(s.MAX_SAMPLES):0;return{isWebGL2:a,drawBuffers:l,getMaxAnisotropy:i,getMaxPrecision:r,precision:o,logarithmicDepthBuffer:h,maxTextures:u,maxVertexTextures:d,maxTextureSize:f,maxCubemapSize:p,maxAttributes:m,maxVertexUniforms:g,maxVaryings:A,maxFragmentUniforms:b,vertexTextures:E,floatFragmentTextures:_,floatVertexTextures:M,maxSamples:v}}function Hg(s){const e=this;let t=null,n=0,i=!1,r=!1;const a=new cn,o=new Ye,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){const f=u.length!==0||d||n!==0||i;return i=d,n=u.length,f},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,d){t=h(u,d,0)},this.setState=function(u,d,f){const p=u.clippingPlanes,m=u.clipIntersection,g=u.clipShadows,A=s.get(u);if(!i||p===null||p.length===0||r&&!g)r?h(null):l();else{const b=r?0:n,E=b*4;let _=A.clippingState||null;c.value=_,_=h(p,d,E,f);for(let M=0;M!==E;++M)_[M]=t[M];A.clippingState=_,this.numIntersection=m?this.numPlanes:0,this.numPlanes+=b}};function l(){c.value!==t&&(c.value=t,c.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(u,d,f,p){const m=u!==null?u.length:0;let g=null;if(m!==0){if(g=c.value,p!==!0||g===null){const A=f+m*4,b=d.matrixWorldInverse;o.getNormalMatrix(b),(g===null||g.length<A)&&(g=new Float32Array(A));for(let E=0,_=f;E!==m;++E,_+=4)a.copy(u[E]).applyMatrix4(b,o),a.normal.toArray(g,_),g[_+3]=a.constant}c.value=g,c.needsUpdate=!0}return e.numPlanes=m,e.numIntersection=0,g}}function zg(s){let e=new WeakMap;function t(a,o){return o===uo?a.mapping=Ti:o===fo&&(a.mapping=us),a}function n(a){if(a&&a.isTexture){const o=a.mapping;if(o===uo||o===fo)if(e.has(a)){const c=e.get(a).texture;return t(c,a.mapping)}else{const c=a.image;if(c&&c.height>0){const l=new tA(c.height/2);return l.fromEquirectangularTexture(s,a),e.set(a,l),a.addEventListener("dispose",i),t(l.texture,a.mapping)}else return null}}return a}function i(a){const o=a.target;o.removeEventListener("dispose",i);const c=e.get(o);c!==void 0&&(e.delete(o),c.dispose())}function r(){e=new WeakMap}return{get:n,dispose:r}}class Ho extends mu{constructor(e=-1,t=1,n=1,i=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=i,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,i,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2;let r=n-e,a=n+e,o=i+t,c=i-t;if(this.view!==null&&this.view.enabled){const l=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,a=r+l*this.view.width,o-=h*this.view.offsetY,c=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,c,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}const ss=4,sl=[.125,.215,.35,.446,.526,.582],Ii=20,Sa=new Ho,rl=new Ae;let Ma=null,wa=0,Ba=0;const vi=(1+Math.sqrt(5))/2,ji=1/vi,al=[new y(1,1,1),new y(-1,1,1),new y(1,1,-1),new y(-1,1,-1),new y(0,vi,ji),new y(0,vi,-ji),new y(ji,0,vi),new y(-ji,0,vi),new y(vi,ji,0),new y(-vi,ji,0)];class ol{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,i=100){Ma=this._renderer.getRenderTarget(),wa=this._renderer.getActiveCubeFace(),Ba=this._renderer.getActiveMipmapLevel(),this._setSize(256);const r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(e,n,i,r),t>0&&this._blur(r,0,0,t),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=hl(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=ll(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Ma,wa,Ba),e.scissorTest=!1,mr(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Ti||e.mapping===us?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Ma=this._renderer.getRenderTarget(),wa=this._renderer.getActiveCubeFace(),Ba=this._renderer.getActiveMipmapLevel();const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Xt,minFilter:Xt,generateMipmaps:!1,type:qn,format:Lt,colorSpace:Et,depthBuffer:!1},i=cl(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=cl(e,t,n);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Vg(r)),this._blurMaterial=Wg(r,e,t)}return i}_compileMaterial(e){const t=new _e(this._lodPlanes[0],e);this._renderer.compile(t,Sa)}_sceneToCubeUV(e,t,n,i){const o=new Yt(90,1,t,n),c=[1,-1,1,1,1,1],l=[1,1,1,-1,-1,-1],h=this._renderer,u=h.autoClear,d=h.toneMapping;h.getClearColor(rl),h.toneMapping=ai,h.autoClear=!1;const f=new Mn({name:"PMREM.Background",side:$t,depthWrite:!1,depthTest:!1}),p=new _e(new Gt,f);let m=!1;const g=e.background;g?g.isColor&&(f.color.copy(g),e.background=null,m=!0):(f.color.copy(rl),m=!0);for(let A=0;A<6;A++){const b=A%3;b===0?(o.up.set(0,c[A],0),o.lookAt(l[A],0,0)):b===1?(o.up.set(0,0,c[A]),o.lookAt(0,l[A],0)):(o.up.set(0,c[A],0),o.lookAt(0,0,l[A]));const E=this._cubeSize;mr(i,b*E,A>2?E:0,E,E),h.setRenderTarget(i),m&&h.render(p,o),h.render(e,o)}p.geometry.dispose(),p.material.dispose(),h.toneMapping=d,h.autoClear=u,e.background=g}_textureToCubeUV(e,t){const n=this._renderer,i=e.mapping===Ti||e.mapping===us;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=hl()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=ll());const r=i?this._cubemapMaterial:this._equirectMaterial,a=new _e(this._lodPlanes[0],r),o=r.uniforms;o.envMap.value=e;const c=this._cubeSize;mr(t,0,0,3*c,2*c),n.setRenderTarget(t),n.render(a,Sa)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;for(let i=1;i<this._lodPlanes.length;i++){const r=Math.sqrt(this._sigmas[i]*this._sigmas[i]-this._sigmas[i-1]*this._sigmas[i-1]),a=al[(i-1)%al.length];this._blur(e,i-1,i,r,a)}t.autoClear=n}_blur(e,t,n,i,r){const a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,i,"latitudinal",r),this._halfBlur(a,e,n,n,i,"longitudinal",r)}_halfBlur(e,t,n,i,r,a,o){const c=this._renderer,l=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,u=new _e(this._lodPlanes[i],l),d=l.uniforms,f=this._sizeLods[n]-1,p=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*Ii-1),m=r/p,g=isFinite(r)?1+Math.floor(h*m):Ii;g>Ii&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${g} samples when the maximum is set to ${Ii}`);const A=[];let b=0;for(let S=0;S<Ii;++S){const D=S/m,x=Math.exp(-D*D/2);A.push(x),S===0?b+=x:S<g&&(b+=2*x)}for(let S=0;S<A.length;S++)A[S]=A[S]/b;d.envMap.value=e.texture,d.samples.value=g,d.weights.value=A,d.latitudinal.value=a==="latitudinal",o&&(d.poleAxis.value=o);const{_lodMax:E}=this;d.dTheta.value=p,d.mipInt.value=E-n;const _=this._sizeLods[i],M=3*_*(i>E-ss?i-E+ss:0),v=4*(this._cubeSize-_);mr(t,M,v,3*_,2*_),c.setRenderTarget(t),c.render(u,Sa)}}function Vg(s){const e=[],t=[],n=[];let i=s;const r=s-ss+1+sl.length;for(let a=0;a<r;a++){const o=Math.pow(2,i);t.push(o);let c=1/o;a>s-ss?c=sl[a-s+ss-1]:a===0&&(c=0),n.push(c);const l=1/(o-2),h=-l,u=1+l,d=[h,h,u,h,u,u,h,h,u,u,h,u],f=6,p=6,m=3,g=2,A=1,b=new Float32Array(m*p*f),E=new Float32Array(g*p*f),_=new Float32Array(A*p*f);for(let v=0;v<f;v++){const S=v%3*2/3-1,D=v>2?0:-1,x=[S,D,0,S+2/3,D,0,S+2/3,D+1,0,S,D,0,S+2/3,D+1,0,S,D+1,0];b.set(x,m*p*v),E.set(d,g*p*v);const C=[v,v,v,v,v,v];_.set(C,A*p*v)}const M=new It;M.setAttribute("position",new Ut(b,m)),M.setAttribute("uv",new Ut(E,g)),M.setAttribute("faceIndex",new Ut(_,A)),e.push(M),i>ss&&i--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function cl(s,e,t){const n=new li(s,e,t);return n.texture.mapping=Zr,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function mr(s,e,t,n,i){s.viewport.set(e,t,n,i),s.scissor.set(e,t,n,i)}function Wg(s,e,t){const n=new Float32Array(Ii),i=new y(0,1,0);return new Xn({name:"SphericalGaussianBlur",defines:{n:Ii,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:zo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:ri,depthTest:!1,depthWrite:!1})}function ll(){return new Xn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:zo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:ri,depthTest:!1,depthWrite:!1})}function hl(){return new Xn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:zo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:ri,depthTest:!1,depthWrite:!1})}function zo(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function qg(s){let e=new WeakMap,t=null;function n(o){if(o&&o.isTexture){const c=o.mapping,l=c===uo||c===fo,h=c===Ti||c===us;if(l||h)if(o.isRenderTargetTexture&&o.needsPMREMUpdate===!0){o.needsPMREMUpdate=!1;let u=e.get(o);return t===null&&(t=new ol(s)),u=l?t.fromEquirectangular(o,u):t.fromCubemap(o,u),e.set(o,u),u.texture}else{if(e.has(o))return e.get(o).texture;{const u=o.image;if(l&&u&&u.height>0||h&&u&&i(u)){t===null&&(t=new ol(s));const d=l?t.fromEquirectangular(o):t.fromCubemap(o);return e.set(o,d),o.addEventListener("dispose",r),d.texture}else return null}}}return o}function i(o){let c=0;const l=6;for(let h=0;h<l;h++)o[h]!==void 0&&c++;return c===l}function r(o){const c=o.target;c.removeEventListener("dispose",r);const l=e.get(c);l!==void 0&&(e.delete(c),l.dispose())}function a(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:a}}function Xg(s){const e={};function t(n){if(e[n]!==void 0)return e[n];let i;switch(n){case"WEBGL_depth_texture":i=s.getExtension("WEBGL_depth_texture")||s.getExtension("MOZ_WEBGL_depth_texture")||s.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":i=s.getExtension("EXT_texture_filter_anisotropic")||s.getExtension("MOZ_EXT_texture_filter_anisotropic")||s.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":i=s.getExtension("WEBGL_compressed_texture_s3tc")||s.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":i=s.getExtension("WEBGL_compressed_texture_pvrtc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:i=s.getExtension(n)}return e[n]=i,i}return{has:function(n){return t(n)!==null},init:function(n){n.isWebGL2?(t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance")):(t("WEBGL_depth_texture"),t("OES_texture_float"),t("OES_texture_half_float"),t("OES_texture_half_float_linear"),t("OES_standard_derivatives"),t("OES_element_index_uint"),t("OES_vertex_array_object"),t("ANGLE_instanced_arrays")),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture")},get:function(n){const i=t(n);return i===null&&console.warn("THREE.WebGLRenderer: "+n+" extension not supported."),i}}}function Yg(s,e,t,n){const i={},r=new WeakMap;function a(u){const d=u.target;d.index!==null&&e.remove(d.index);for(const p in d.attributes)e.remove(d.attributes[p]);for(const p in d.morphAttributes){const m=d.morphAttributes[p];for(let g=0,A=m.length;g<A;g++)e.remove(m[g])}d.removeEventListener("dispose",a),delete i[d.id];const f=r.get(d);f&&(e.remove(f),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function o(u,d){return i[d.id]===!0||(d.addEventListener("dispose",a),i[d.id]=!0,t.memory.geometries++),d}function c(u){const d=u.attributes;for(const p in d)e.update(d[p],s.ARRAY_BUFFER);const f=u.morphAttributes;for(const p in f){const m=f[p];for(let g=0,A=m.length;g<A;g++)e.update(m[g],s.ARRAY_BUFFER)}}function l(u){const d=[],f=u.index,p=u.attributes.position;let m=0;if(f!==null){const b=f.array;m=f.version;for(let E=0,_=b.length;E<_;E+=3){const M=b[E+0],v=b[E+1],S=b[E+2];d.push(M,v,v,S,S,M)}}else if(p!==void 0){const b=p.array;m=p.version;for(let E=0,_=b.length/3-1;E<_;E+=3){const M=E+0,v=E+1,S=E+2;d.push(M,v,v,S,S,M)}}else return;const g=new(cu(d)?pu:Au)(d,1);g.version=m;const A=r.get(u);A&&e.remove(A),r.set(u,g)}function h(u){const d=r.get(u);if(d){const f=u.index;f!==null&&d.version<f.version&&l(u)}else l(u);return r.get(u)}return{get:o,update:c,getWireframeAttribute:h}}function Kg(s,e,t,n){const i=n.isWebGL2;let r;function a(f){r=f}let o,c;function l(f){o=f.type,c=f.bytesPerElement}function h(f,p){s.drawElements(r,p,o,f*c),t.update(p,r,1)}function u(f,p,m){if(m===0)return;let g,A;if(i)g=s,A="drawElementsInstanced";else if(g=e.get("ANGLE_instanced_arrays"),A="drawElementsInstancedANGLE",g===null){console.error("THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}g[A](r,p,o,f*c,m),t.update(p,r,m)}function d(f,p,m){if(m===0)return;const g=e.get("WEBGL_multi_draw");if(g===null)for(let A=0;A<m;A++)this.render(f[A]/c,p[A]);else{g.multiDrawElementsWEBGL(r,p,0,o,f,0,m);let A=0;for(let b=0;b<m;b++)A+=p[b];t.update(A,r,1)}}this.setMode=a,this.setIndex=l,this.render=h,this.renderInstances=u,this.renderMultiDraw=d}function jg(s){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case s.TRIANGLES:t.triangles+=o*(r/3);break;case s.LINES:t.lines+=o*(r/2);break;case s.LINE_STRIP:t.lines+=o*(r-1);break;case s.LINE_LOOP:t.lines+=o*r;break;case s.POINTS:t.points+=o*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function i(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:i,update:n}}function Jg(s,e){return s[0]-e[0]}function Zg(s,e){return Math.abs(e[1])-Math.abs(s[1])}function $g(s,e,t){const n={},i=new Float32Array(8),r=new WeakMap,a=new at,o=[];for(let l=0;l<8;l++)o[l]=[l,0];function c(l,h,u){const d=l.morphTargetInfluences;if(e.isWebGL2===!0){const f=h.morphAttributes.position||h.morphAttributes.normal||h.morphAttributes.color,p=f!==void 0?f.length:0;let m=r.get(h);if(m===void 0||m.count!==p){let T=function(){U.dispose(),r.delete(h),h.removeEventListener("dispose",T)};m!==void 0&&m.texture.dispose();const b=h.morphAttributes.position!==void 0,E=h.morphAttributes.normal!==void 0,_=h.morphAttributes.color!==void 0,M=h.morphAttributes.position||[],v=h.morphAttributes.normal||[],S=h.morphAttributes.color||[];let D=0;b===!0&&(D=1),E===!0&&(D=2),_===!0&&(D=3);let x=h.attributes.position.count*D,C=1;x>e.maxTextureSize&&(C=Math.ceil(x/e.maxTextureSize),x=e.maxTextureSize);const R=new Float32Array(x*C*4*p),U=new uu(R,x,C,p);U.type=hn,U.needsUpdate=!0;const O=D*4;for(let F=0;F<p;F++){const Q=M[F],X=v[F],k=S[F],G=x*C*4*F;for(let j=0;j<Q.count;j++){const J=j*O;b===!0&&(a.fromBufferAttribute(Q,j),R[G+J+0]=a.x,R[G+J+1]=a.y,R[G+J+2]=a.z,R[G+J+3]=0),E===!0&&(a.fromBufferAttribute(X,j),R[G+J+4]=a.x,R[G+J+5]=a.y,R[G+J+6]=a.z,R[G+J+7]=0),_===!0&&(a.fromBufferAttribute(k,j),R[G+J+8]=a.x,R[G+J+9]=a.y,R[G+J+10]=a.z,R[G+J+11]=k.itemSize===4?a.w:1)}}m={count:p,texture:U,size:new oe(x,C)},r.set(h,m),h.addEventListener("dispose",T)}let g=0;for(let b=0;b<d.length;b++)g+=d[b];const A=h.morphTargetsRelative?1:1-g;u.getUniforms().setValue(s,"morphTargetBaseInfluence",A),u.getUniforms().setValue(s,"morphTargetInfluences",d),u.getUniforms().setValue(s,"morphTargetsTexture",m.texture,t),u.getUniforms().setValue(s,"morphTargetsTextureSize",m.size)}else{const f=d===void 0?0:d.length;let p=n[h.id];if(p===void 0||p.length!==f){p=[];for(let E=0;E<f;E++)p[E]=[E,0];n[h.id]=p}for(let E=0;E<f;E++){const _=p[E];_[0]=E,_[1]=d[E]}p.sort(Zg);for(let E=0;E<8;E++)E<f&&p[E][1]?(o[E][0]=p[E][0],o[E][1]=p[E][1]):(o[E][0]=Number.MAX_SAFE_INTEGER,o[E][1]=0);o.sort(Jg);const m=h.morphAttributes.position,g=h.morphAttributes.normal;let A=0;for(let E=0;E<8;E++){const _=o[E],M=_[0],v=_[1];M!==Number.MAX_SAFE_INTEGER&&v?(m&&h.getAttribute("morphTarget"+E)!==m[M]&&h.setAttribute("morphTarget"+E,m[M]),g&&h.getAttribute("morphNormal"+E)!==g[M]&&h.setAttribute("morphNormal"+E,g[M]),i[E]=v,A+=v):(m&&h.hasAttribute("morphTarget"+E)===!0&&h.deleteAttribute("morphTarget"+E),g&&h.hasAttribute("morphNormal"+E)===!0&&h.deleteAttribute("morphNormal"+E),i[E]=0)}const b=h.morphTargetsRelative?1:1-A;u.getUniforms().setValue(s,"morphTargetBaseInfluence",b),u.getUniforms().setValue(s,"morphTargetInfluences",i)}}return{update:c}}function em(s,e,t,n){let i=new WeakMap;function r(c){const l=n.render.frame,h=c.geometry,u=e.get(c,h);if(i.get(u)!==l&&(e.update(u),i.set(u,l)),c.isInstancedMesh&&(c.hasEventListener("dispose",o)===!1&&c.addEventListener("dispose",o),i.get(c)!==l&&(t.update(c.instanceMatrix,s.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,s.ARRAY_BUFFER),i.set(c,l))),c.isSkinnedMesh){const d=c.skeleton;i.get(d)!==l&&(d.update(),i.set(d,l))}return u}function a(){i=new WeakMap}function o(c){const l=c.target;l.removeEventListener("dispose",o),t.remove(l.instanceMatrix),l.instanceColor!==null&&t.remove(l.instanceColor)}return{update:r,dispose:a}}class _u extends Ft{constructor(e,t,n,i,r,a,o,c,l,h){if(h=h!==void 0?h:wi,h!==wi&&h!==ds)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===wi&&(n=ii),n===void 0&&h===ds&&(n=Mi),super(null,i,r,a,o,c,h,n,l),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=o!==void 0?o:Ht,this.minFilter=c!==void 0?c:Ht,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}const xu=new Ft,yu=new _u(1,1);yu.compareFunction=ou;const vu=new uu,Cu=new du,Iu=new bu,ul=[],dl=[],fl=new Float32Array(16),Al=new Float32Array(9),pl=new Float32Array(4);function bs(s,e,t){const n=s[0];if(n<=0||n>0)return s;const i=e*t;let r=ul[i];if(r===void 0&&(r=new Float32Array(i),ul[i]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,s[a].toArray(r,o)}return r}function Nt(s,e){if(s.length!==e.length)return!1;for(let t=0,n=s.length;t<n;t++)if(s[t]!==e[t])return!1;return!0}function Qt(s,e){for(let t=0,n=e.length;t<n;t++)s[t]=e[t]}function ea(s,e){let t=dl[e];t===void 0&&(t=new Int32Array(e),dl[e]=t);for(let n=0;n!==e;++n)t[n]=s.allocateTextureUnit();return t}function tm(s,e){const t=this.cache;t[0]!==e&&(s.uniform1f(this.addr,e),t[0]=e)}function nm(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Nt(t,e))return;s.uniform2fv(this.addr,e),Qt(t,e)}}function im(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(s.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Nt(t,e))return;s.uniform3fv(this.addr,e),Qt(t,e)}}function sm(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Nt(t,e))return;s.uniform4fv(this.addr,e),Qt(t,e)}}function rm(s,e){const t=this.cache,n=e.elements;if(n===void 0){if(Nt(t,e))return;s.uniformMatrix2fv(this.addr,!1,e),Qt(t,e)}else{if(Nt(t,n))return;pl.set(n),s.uniformMatrix2fv(this.addr,!1,pl),Qt(t,n)}}function am(s,e){const t=this.cache,n=e.elements;if(n===void 0){if(Nt(t,e))return;s.uniformMatrix3fv(this.addr,!1,e),Qt(t,e)}else{if(Nt(t,n))return;Al.set(n),s.uniformMatrix3fv(this.addr,!1,Al),Qt(t,n)}}function om(s,e){const t=this.cache,n=e.elements;if(n===void 0){if(Nt(t,e))return;s.uniformMatrix4fv(this.addr,!1,e),Qt(t,e)}else{if(Nt(t,n))return;fl.set(n),s.uniformMatrix4fv(this.addr,!1,fl),Qt(t,n)}}function cm(s,e){const t=this.cache;t[0]!==e&&(s.uniform1i(this.addr,e),t[0]=e)}function lm(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Nt(t,e))return;s.uniform2iv(this.addr,e),Qt(t,e)}}function hm(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Nt(t,e))return;s.uniform3iv(this.addr,e),Qt(t,e)}}function um(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Nt(t,e))return;s.uniform4iv(this.addr,e),Qt(t,e)}}function dm(s,e){const t=this.cache;t[0]!==e&&(s.uniform1ui(this.addr,e),t[0]=e)}function fm(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Nt(t,e))return;s.uniform2uiv(this.addr,e),Qt(t,e)}}function Am(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Nt(t,e))return;s.uniform3uiv(this.addr,e),Qt(t,e)}}function pm(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Nt(t,e))return;s.uniform4uiv(this.addr,e),Qt(t,e)}}function gm(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i);const r=this.type===s.SAMPLER_2D_SHADOW?yu:xu;t.setTexture2D(e||r,i)}function mm(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTexture3D(e||Cu,i)}function bm(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTextureCube(e||Iu,i)}function Em(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTexture2DArray(e||vu,i)}function _m(s){switch(s){case 5126:return tm;case 35664:return nm;case 35665:return im;case 35666:return sm;case 35674:return rm;case 35675:return am;case 35676:return om;case 5124:case 35670:return cm;case 35667:case 35671:return lm;case 35668:case 35672:return hm;case 35669:case 35673:return um;case 5125:return dm;case 36294:return fm;case 36295:return Am;case 36296:return pm;case 35678:case 36198:case 36298:case 36306:case 35682:return gm;case 35679:case 36299:case 36307:return mm;case 35680:case 36300:case 36308:case 36293:return bm;case 36289:case 36303:case 36311:case 36292:return Em}}function xm(s,e){s.uniform1fv(this.addr,e)}function ym(s,e){const t=bs(e,this.size,2);s.uniform2fv(this.addr,t)}function vm(s,e){const t=bs(e,this.size,3);s.uniform3fv(this.addr,t)}function Cm(s,e){const t=bs(e,this.size,4);s.uniform4fv(this.addr,t)}function Im(s,e){const t=bs(e,this.size,4);s.uniformMatrix2fv(this.addr,!1,t)}function Sm(s,e){const t=bs(e,this.size,9);s.uniformMatrix3fv(this.addr,!1,t)}function Mm(s,e){const t=bs(e,this.size,16);s.uniformMatrix4fv(this.addr,!1,t)}function wm(s,e){s.uniform1iv(this.addr,e)}function Bm(s,e){s.uniform2iv(this.addr,e)}function Tm(s,e){s.uniform3iv(this.addr,e)}function Rm(s,e){s.uniform4iv(this.addr,e)}function Dm(s,e){s.uniform1uiv(this.addr,e)}function Lm(s,e){s.uniform2uiv(this.addr,e)}function Pm(s,e){s.uniform3uiv(this.addr,e)}function Fm(s,e){s.uniform4uiv(this.addr,e)}function Um(s,e,t){const n=this.cache,i=e.length,r=ea(t,i);Nt(n,r)||(s.uniform1iv(this.addr,r),Qt(n,r));for(let a=0;a!==i;++a)t.setTexture2D(e[a]||xu,r[a])}function Nm(s,e,t){const n=this.cache,i=e.length,r=ea(t,i);Nt(n,r)||(s.uniform1iv(this.addr,r),Qt(n,r));for(let a=0;a!==i;++a)t.setTexture3D(e[a]||Cu,r[a])}function Qm(s,e,t){const n=this.cache,i=e.length,r=ea(t,i);Nt(n,r)||(s.uniform1iv(this.addr,r),Qt(n,r));for(let a=0;a!==i;++a)t.setTextureCube(e[a]||Iu,r[a])}function Om(s,e,t){const n=this.cache,i=e.length,r=ea(t,i);Nt(n,r)||(s.uniform1iv(this.addr,r),Qt(n,r));for(let a=0;a!==i;++a)t.setTexture2DArray(e[a]||vu,r[a])}function km(s){switch(s){case 5126:return xm;case 35664:return ym;case 35665:return vm;case 35666:return Cm;case 35674:return Im;case 35675:return Sm;case 35676:return Mm;case 5124:case 35670:return wm;case 35667:case 35671:return Bm;case 35668:case 35672:return Tm;case 35669:case 35673:return Rm;case 5125:return Dm;case 36294:return Lm;case 36295:return Pm;case 36296:return Fm;case 35678:case 36198:case 36298:case 36306:case 35682:return Um;case 35679:case 36299:case 36307:return Nm;case 35680:case 36300:case 36308:case 36293:return Qm;case 36289:case 36303:case 36311:case 36292:return Om}}class Gm{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=_m(t.type)}}class Hm{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=km(t.type)}}class zm{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const i=this.seq;for(let r=0,a=i.length;r!==a;++r){const o=i[r];o.setValue(e,t[o.id],n)}}}const Ta=/(\w+)(\])?(\[|\.)?/g;function gl(s,e){s.seq.push(e),s.map[e.id]=e}function Vm(s,e,t){const n=s.name,i=n.length;for(Ta.lastIndex=0;;){const r=Ta.exec(n),a=Ta.lastIndex;let o=r[1];const c=r[2]==="]",l=r[3];if(c&&(o=o|0),l===void 0||l==="["&&a+2===i){gl(t,l===void 0?new Gm(o,s,e):new Hm(o,s,e));break}else{let u=t.map[o];u===void 0&&(u=new zm(o),gl(t,u)),t=u}}}class Qr{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let i=0;i<n;++i){const r=e.getActiveUniform(t,i),a=e.getUniformLocation(t,r.name);Vm(r,a,this)}}setValue(e,t,n,i){const r=this.map[t];r!==void 0&&r.setValue(e,n,i)}setOptional(e,t,n){const i=t[n];i!==void 0&&this.setValue(e,n,i)}static upload(e,t,n,i){for(let r=0,a=t.length;r!==a;++r){const o=t[r],c=n[o.id];c.needsUpdate!==!1&&o.setValue(e,c.value,i)}}static seqWithValue(e,t){const n=[];for(let i=0,r=e.length;i!==r;++i){const a=e[i];a.id in t&&n.push(a)}return n}}function ml(s,e,t){const n=s.createShader(e);return s.shaderSource(n,t),s.compileShader(n),n}const Wm=37297;let qm=0;function Xm(s,e){const t=s.split(`
`),n=[],i=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=i;a<r;a++){const o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}function Ym(s){const e=rt.getPrimaries(rt.workingColorSpace),t=rt.getPrimaries(s);let n;switch(e===t?n="":e===Xr&&t===qr?n="LinearDisplayP3ToLinearSRGB":e===qr&&t===Xr&&(n="LinearSRGBToLinearDisplayP3"),s){case Et:case Ws:return[n,"LinearTransferOETF"];case dt:case $r:return[n,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",s),[n,"LinearTransferOETF"]}}function bl(s,e,t){const n=s.getShaderParameter(e,s.COMPILE_STATUS),i=s.getShaderInfoLog(e).trim();if(n&&i==="")return"";const r=/ERROR: 0:(\d+)/.exec(i);if(r){const a=parseInt(r[1]);return t.toUpperCase()+`

`+i+`

`+Xm(s.getShaderSource(e),a)}else return i}function Km(s,e){const t=Ym(e);return`vec4 ${s}( vec4 value ) { return ${t[0]}( ${t[1]}( value ) ); }`}function jm(s,e){let t;switch(e){case Xd:t="Linear";break;case Yd:t="Reinhard";break;case Kd:t="OptimizedCineon";break;case Kh:t="ACESFilmic";break;case Jd:t="AgX";break;case jd:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+s+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}function Jm(s){return[s.extensionDerivatives||s.envMapCubeUVHeight||s.bumpMap||s.normalMapTangentSpace||s.clearcoatNormalMap||s.flatShading||s.shaderID==="physical"?"#extension GL_OES_standard_derivatives : enable":"",(s.extensionFragDepth||s.logarithmicDepthBuffer)&&s.rendererExtensionFragDepth?"#extension GL_EXT_frag_depth : enable":"",s.extensionDrawBuffers&&s.rendererExtensionDrawBuffers?"#extension GL_EXT_draw_buffers : require":"",(s.extensionShaderTextureLOD||s.envMap||s.transmission)&&s.rendererExtensionShaderTextureLod?"#extension GL_EXT_shader_texture_lod : enable":""].filter(rs).join(`
`)}function Zm(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":""].filter(rs).join(`
`)}function $m(s){const e=[];for(const t in s){const n=s[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function e0(s,e){const t={},n=s.getProgramParameter(e,s.ACTIVE_ATTRIBUTES);for(let i=0;i<n;i++){const r=s.getActiveAttrib(e,i),a=r.name;let o=1;r.type===s.FLOAT_MAT2&&(o=2),r.type===s.FLOAT_MAT3&&(o=3),r.type===s.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:s.getAttribLocation(e,a),locationSize:o}}return t}function rs(s){return s!==""}function El(s,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return s.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function _l(s,e){return s.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const t0=/^[ \t]*#include +<([\w\d./]+)>/gm;function Co(s){return s.replace(t0,i0)}const n0=new Map([["encodings_fragment","colorspace_fragment"],["encodings_pars_fragment","colorspace_pars_fragment"],["output_fragment","opaque_fragment"]]);function i0(s,e){let t=Xe[e];if(t===void 0){const n=n0.get(e);if(n!==void 0)t=Xe[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return Co(t)}const s0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function xl(s){return s.replace(s0,r0)}function r0(s,e,t,n){let i="";for(let r=parseInt(e);r<parseInt(t);r++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return i}function yl(s){let e="precision "+s.precision+` float;
precision `+s.precision+" int;";return s.precision==="highp"?e+=`
#define HIGH_PRECISION`:s.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:s.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function a0(s){let e="SHADOWMAP_TYPE_BASIC";return s.shadowMapType===qh?e="SHADOWMAP_TYPE_PCF":s.shadowMapType===Xh?e="SHADOWMAP_TYPE_PCF_SOFT":s.shadowMapType===zn&&(e="SHADOWMAP_TYPE_VSM"),e}function o0(s){let e="ENVMAP_TYPE_CUBE";if(s.envMap)switch(s.envMapMode){case Ti:case us:e="ENVMAP_TYPE_CUBE";break;case Zr:e="ENVMAP_TYPE_CUBE_UV";break}return e}function c0(s){let e="ENVMAP_MODE_REFLECTION";if(s.envMap)switch(s.envMapMode){case us:e="ENVMAP_MODE_REFRACTION";break}return e}function l0(s){let e="ENVMAP_BLENDING_NONE";if(s.envMap)switch(s.combine){case Yh:e="ENVMAP_BLENDING_MULTIPLY";break;case Wd:e="ENVMAP_BLENDING_MIX";break;case qd:e="ENVMAP_BLENDING_ADD";break}return e}function h0(s){const e=s.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),7*16)),texelHeight:n,maxMip:t}}function u0(s,e,t,n){const i=s.getContext(),r=t.defines;let a=t.vertexShader,o=t.fragmentShader;const c=a0(t),l=o0(t),h=c0(t),u=l0(t),d=h0(t),f=t.isWebGL2?"":Jm(t),p=Zm(t),m=$m(r),g=i.createProgram();let A,b,E=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(A=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m].filter(rs).join(`
`),A.length>0&&(A+=`
`),b=[f,"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m].filter(rs).join(`
`),b.length>0&&(b+=`
`)):(A=[yl(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors&&t.isWebGL2?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )","	attribute vec3 morphTarget0;","	attribute vec3 morphTarget1;","	attribute vec3 morphTarget2;","	attribute vec3 morphTarget3;","	#ifdef USE_MORPHNORMALS","		attribute vec3 morphNormal0;","		attribute vec3 morphNormal1;","		attribute vec3 morphNormal2;","		attribute vec3 morphNormal3;","	#else","		attribute vec3 morphTarget4;","		attribute vec3 morphTarget5;","		attribute vec3 morphTarget6;","		attribute vec3 morphTarget7;","	#endif","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(rs).join(`
`),b=[f,yl(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+l:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==ai?"#define TONE_MAPPING":"",t.toneMapping!==ai?Xe.tonemapping_pars_fragment:"",t.toneMapping!==ai?jm("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Xe.colorspace_pars_fragment,Km("linearToOutputTexel",t.outputColorSpace),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(rs).join(`
`)),a=Co(a),a=El(a,t),a=_l(a,t),o=Co(o),o=El(o,t),o=_l(o,t),a=xl(a),o=xl(o),t.isWebGL2&&t.isRawShaderMaterial!==!0&&(E=`#version 300 es
`,A=[p,"precision mediump sampler2DArray;","#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+A,b=["precision mediump sampler2DArray;","#define varying in",t.glslVersion===kc?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===kc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+b);const _=E+A+a,M=E+b+o,v=ml(i,i.VERTEX_SHADER,_),S=ml(i,i.FRAGMENT_SHADER,M);i.attachShader(g,v),i.attachShader(g,S),t.index0AttributeName!==void 0?i.bindAttribLocation(g,0,t.index0AttributeName):t.morphTargets===!0&&i.bindAttribLocation(g,0,"position"),i.linkProgram(g);function D(U){if(s.debug.checkShaderErrors){const O=i.getProgramInfoLog(g).trim(),T=i.getShaderInfoLog(v).trim(),F=i.getShaderInfoLog(S).trim();let Q=!0,X=!0;if(i.getProgramParameter(g,i.LINK_STATUS)===!1)if(Q=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(i,g,v,S);else{const k=bl(i,v,"vertex"),G=bl(i,S,"fragment");console.error("THREE.WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(g,i.VALIDATE_STATUS)+`

Program Info Log: `+O+`
`+k+`
`+G)}else O!==""?console.warn("THREE.WebGLProgram: Program Info Log:",O):(T===""||F==="")&&(X=!1);X&&(U.diagnostics={runnable:Q,programLog:O,vertexShader:{log:T,prefix:A},fragmentShader:{log:F,prefix:b}})}i.deleteShader(v),i.deleteShader(S),x=new Qr(i,g),C=e0(i,g)}let x;this.getUniforms=function(){return x===void 0&&D(this),x};let C;this.getAttributes=function(){return C===void 0&&D(this),C};let R=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return R===!1&&(R=i.getProgramParameter(g,Wm)),R},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(g),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=qm++,this.cacheKey=e,this.usedTimes=1,this.program=g,this.vertexShader=v,this.fragmentShader=S,this}let d0=0;class f0{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,i=this._getShaderStage(t),r=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(i)===!1&&(a.add(i),i.usedTimes++),a.has(r)===!1&&(a.add(r),r.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new A0(e),t.set(e,n)),n}}class A0{constructor(e){this.id=d0++,this.code=e,this.usedTimes=0}}function p0(s,e,t,n,i,r,a){const o=new ko,c=new f0,l=[],h=i.isWebGL2,u=i.logarithmicDepthBuffer,d=i.vertexTextures;let f=i.precision;const p={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function m(x){return x===0?"uv":`uv${x}`}function g(x,C,R,U,O){const T=U.fog,F=O.geometry,Q=x.isMeshStandardMaterial?U.environment:null,X=(x.isMeshStandardMaterial?t:e).get(x.envMap||Q),k=X&&X.mapping===Zr?X.image.height:null,G=p[x.type];x.precision!==null&&(f=i.getMaxPrecision(x.precision),f!==x.precision&&console.warn("THREE.WebGLProgram.getParameters:",x.precision,"not supported, using",f,"instead."));const j=F.morphAttributes.position||F.morphAttributes.normal||F.morphAttributes.color,J=j!==void 0?j.length:0;let ne=0;F.morphAttributes.position!==void 0&&(ne=1),F.morphAttributes.normal!==void 0&&(ne=2),F.morphAttributes.color!==void 0&&(ne=3);let W,Z,ce,ge;if(G){const xe=In[G];W=xe.vertexShader,Z=xe.fragmentShader}else W=x.vertexShader,Z=x.fragmentShader,c.update(x),ce=c.getVertexShaderID(x),ge=c.getFragmentShaderID(x);const pe=s.getRenderTarget(),we=O.isInstancedMesh===!0,Qe=O.isBatchedMesh===!0,De=!!x.map,Je=!!x.matcap,z=!!X,zt=!!x.aoMap,Se=!!x.lightMap,Be=!!x.bumpMap,Ee=!!x.normalMap,At=!!x.displacementMap,Ge=!!x.emissiveMap,B=!!x.metalnessMap,I=!!x.roughnessMap,V=x.anisotropy>0,ie=x.clearcoat>0,ee=x.iridescence>0,se=x.sheen>0,Ce=x.transmission>0,ue=V&&!!x.anisotropyMap,me=ie&&!!x.clearcoatMap,Te=ie&&!!x.clearcoatNormalMap,Ve=ie&&!!x.clearcoatRoughnessMap,te=ee&&!!x.iridescenceMap,tt=ee&&!!x.iridescenceThicknessMap,We=se&&!!x.sheenColorMap,Le=se&&!!x.sheenRoughnessMap,ye=!!x.specularMap,be=!!x.specularColorMap,Oe=!!x.specularIntensityMap,nt=Ce&&!!x.transmissionMap,_t=Ce&&!!x.thicknessMap,qe=!!x.gradientMap,ae=!!x.alphaMap,P=x.alphaTest>0,le=!!x.alphaHash,he=!!x.extensions,L=!!F.attributes.uv1,K=!!F.attributes.uv2,$=!!F.attributes.uv3;let de=ai;return x.toneMapped&&(pe===null||pe.isXRRenderTarget===!0)&&(de=s.toneMapping),{isWebGL2:h,shaderID:G,shaderType:x.type,shaderName:x.name,vertexShader:W,fragmentShader:Z,defines:x.defines,customVertexShaderID:ce,customFragmentShaderID:ge,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:f,batching:Qe,instancing:we,instancingColor:we&&O.instanceColor!==null,supportsVertexTextures:d,outputColorSpace:pe===null?s.outputColorSpace:pe.isXRRenderTarget===!0?pe.texture.colorSpace:Et,map:De,matcap:Je,envMap:z,envMapMode:z&&X.mapping,envMapCubeUVHeight:k,aoMap:zt,lightMap:Se,bumpMap:Be,normalMap:Ee,displacementMap:d&&At,emissiveMap:Ge,normalMapObjectSpace:Ee&&x.normalMapType===ff,normalMapTangentSpace:Ee&&x.normalMapType===au,metalnessMap:B,roughnessMap:I,anisotropy:V,anisotropyMap:ue,clearcoat:ie,clearcoatMap:me,clearcoatNormalMap:Te,clearcoatRoughnessMap:Ve,iridescence:ee,iridescenceMap:te,iridescenceThicknessMap:tt,sheen:se,sheenColorMap:We,sheenRoughnessMap:Le,specularMap:ye,specularColorMap:be,specularIntensityMap:Oe,transmission:Ce,transmissionMap:nt,thicknessMap:_t,gradientMap:qe,opaque:x.transparent===!1&&x.blending===as,alphaMap:ae,alphaTest:P,alphaHash:le,combine:x.combine,mapUv:De&&m(x.map.channel),aoMapUv:zt&&m(x.aoMap.channel),lightMapUv:Se&&m(x.lightMap.channel),bumpMapUv:Be&&m(x.bumpMap.channel),normalMapUv:Ee&&m(x.normalMap.channel),displacementMapUv:At&&m(x.displacementMap.channel),emissiveMapUv:Ge&&m(x.emissiveMap.channel),metalnessMapUv:B&&m(x.metalnessMap.channel),roughnessMapUv:I&&m(x.roughnessMap.channel),anisotropyMapUv:ue&&m(x.anisotropyMap.channel),clearcoatMapUv:me&&m(x.clearcoatMap.channel),clearcoatNormalMapUv:Te&&m(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Ve&&m(x.clearcoatRoughnessMap.channel),iridescenceMapUv:te&&m(x.iridescenceMap.channel),iridescenceThicknessMapUv:tt&&m(x.iridescenceThicknessMap.channel),sheenColorMapUv:We&&m(x.sheenColorMap.channel),sheenRoughnessMapUv:Le&&m(x.sheenRoughnessMap.channel),specularMapUv:ye&&m(x.specularMap.channel),specularColorMapUv:be&&m(x.specularColorMap.channel),specularIntensityMapUv:Oe&&m(x.specularIntensityMap.channel),transmissionMapUv:nt&&m(x.transmissionMap.channel),thicknessMapUv:_t&&m(x.thicknessMap.channel),alphaMapUv:ae&&m(x.alphaMap.channel),vertexTangents:!!F.attributes.tangent&&(Ee||V),vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!F.attributes.color&&F.attributes.color.itemSize===4,vertexUv1s:L,vertexUv2s:K,vertexUv3s:$,pointsUvs:O.isPoints===!0&&!!F.attributes.uv&&(De||ae),fog:!!T,useFog:x.fog===!0,fogExp2:T&&T.isFogExp2,flatShading:x.flatShading===!0,sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:u,skinning:O.isSkinnedMesh===!0,morphTargets:F.morphAttributes.position!==void 0,morphNormals:F.morphAttributes.normal!==void 0,morphColors:F.morphAttributes.color!==void 0,morphTargetsCount:J,morphTextureStride:ne,numDirLights:C.directional.length,numPointLights:C.point.length,numSpotLights:C.spot.length,numSpotLightMaps:C.spotLightMap.length,numRectAreaLights:C.rectArea.length,numHemiLights:C.hemi.length,numDirLightShadows:C.directionalShadowMap.length,numPointLightShadows:C.pointShadowMap.length,numSpotLightShadows:C.spotShadowMap.length,numSpotLightShadowsWithMaps:C.numSpotLightShadowsWithMaps,numLightProbes:C.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:x.dithering,shadowMapEnabled:s.shadowMap.enabled&&R.length>0,shadowMapType:s.shadowMap.type,toneMapping:de,useLegacyLights:s._useLegacyLights,decodeVideoTexture:De&&x.map.isVideoTexture===!0&&rt.getTransfer(x.map.colorSpace)===bt,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===sn,flipSided:x.side===$t,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionDerivatives:he&&x.extensions.derivatives===!0,extensionFragDepth:he&&x.extensions.fragDepth===!0,extensionDrawBuffers:he&&x.extensions.drawBuffers===!0,extensionShaderTextureLOD:he&&x.extensions.shaderTextureLOD===!0,extensionClipCullDistance:he&&x.extensions.clipCullDistance&&n.has("WEBGL_clip_cull_distance"),rendererExtensionFragDepth:h||n.has("EXT_frag_depth"),rendererExtensionDrawBuffers:h||n.has("WEBGL_draw_buffers"),rendererExtensionShaderTextureLod:h||n.has("EXT_shader_texture_lod"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()}}function A(x){const C=[];if(x.shaderID?C.push(x.shaderID):(C.push(x.customVertexShaderID),C.push(x.customFragmentShaderID)),x.defines!==void 0)for(const R in x.defines)C.push(R),C.push(x.defines[R]);return x.isRawShaderMaterial===!1&&(b(C,x),E(C,x),C.push(s.outputColorSpace)),C.push(x.customProgramCacheKey),C.join()}function b(x,C){x.push(C.precision),x.push(C.outputColorSpace),x.push(C.envMapMode),x.push(C.envMapCubeUVHeight),x.push(C.mapUv),x.push(C.alphaMapUv),x.push(C.lightMapUv),x.push(C.aoMapUv),x.push(C.bumpMapUv),x.push(C.normalMapUv),x.push(C.displacementMapUv),x.push(C.emissiveMapUv),x.push(C.metalnessMapUv),x.push(C.roughnessMapUv),x.push(C.anisotropyMapUv),x.push(C.clearcoatMapUv),x.push(C.clearcoatNormalMapUv),x.push(C.clearcoatRoughnessMapUv),x.push(C.iridescenceMapUv),x.push(C.iridescenceThicknessMapUv),x.push(C.sheenColorMapUv),x.push(C.sheenRoughnessMapUv),x.push(C.specularMapUv),x.push(C.specularColorMapUv),x.push(C.specularIntensityMapUv),x.push(C.transmissionMapUv),x.push(C.thicknessMapUv),x.push(C.combine),x.push(C.fogExp2),x.push(C.sizeAttenuation),x.push(C.morphTargetsCount),x.push(C.morphAttributeCount),x.push(C.numDirLights),x.push(C.numPointLights),x.push(C.numSpotLights),x.push(C.numSpotLightMaps),x.push(C.numHemiLights),x.push(C.numRectAreaLights),x.push(C.numDirLightShadows),x.push(C.numPointLightShadows),x.push(C.numSpotLightShadows),x.push(C.numSpotLightShadowsWithMaps),x.push(C.numLightProbes),x.push(C.shadowMapType),x.push(C.toneMapping),x.push(C.numClippingPlanes),x.push(C.numClipIntersection),x.push(C.depthPacking)}function E(x,C){o.disableAll(),C.isWebGL2&&o.enable(0),C.supportsVertexTextures&&o.enable(1),C.instancing&&o.enable(2),C.instancingColor&&o.enable(3),C.matcap&&o.enable(4),C.envMap&&o.enable(5),C.normalMapObjectSpace&&o.enable(6),C.normalMapTangentSpace&&o.enable(7),C.clearcoat&&o.enable(8),C.iridescence&&o.enable(9),C.alphaTest&&o.enable(10),C.vertexColors&&o.enable(11),C.vertexAlphas&&o.enable(12),C.vertexUv1s&&o.enable(13),C.vertexUv2s&&o.enable(14),C.vertexUv3s&&o.enable(15),C.vertexTangents&&o.enable(16),C.anisotropy&&o.enable(17),C.alphaHash&&o.enable(18),C.batching&&o.enable(19),x.push(o.mask),o.disableAll(),C.fog&&o.enable(0),C.useFog&&o.enable(1),C.flatShading&&o.enable(2),C.logarithmicDepthBuffer&&o.enable(3),C.skinning&&o.enable(4),C.morphTargets&&o.enable(5),C.morphNormals&&o.enable(6),C.morphColors&&o.enable(7),C.premultipliedAlpha&&o.enable(8),C.shadowMapEnabled&&o.enable(9),C.useLegacyLights&&o.enable(10),C.doubleSided&&o.enable(11),C.flipSided&&o.enable(12),C.useDepthPacking&&o.enable(13),C.dithering&&o.enable(14),C.transmission&&o.enable(15),C.sheen&&o.enable(16),C.opaque&&o.enable(17),C.pointsUvs&&o.enable(18),C.decodeVideoTexture&&o.enable(19),x.push(o.mask)}function _(x){const C=p[x.type];let R;if(C){const U=In[C];R=jr.clone(U.uniforms)}else R=x.uniforms;return R}function M(x,C){let R;for(let U=0,O=l.length;U<O;U++){const T=l[U];if(T.cacheKey===C){R=T,++R.usedTimes;break}}return R===void 0&&(R=new u0(s,C,x,r),l.push(R)),R}function v(x){if(--x.usedTimes===0){const C=l.indexOf(x);l[C]=l[l.length-1],l.pop(),x.destroy()}}function S(x){c.remove(x)}function D(){c.dispose()}return{getParameters:g,getProgramCacheKey:A,getUniforms:_,acquireProgram:M,releaseProgram:v,releaseShaderCache:S,programs:l,dispose:D}}function g0(){let s=new WeakMap;function e(r){let a=s.get(r);return a===void 0&&(a={},s.set(r,a)),a}function t(r){s.delete(r)}function n(r,a,o){s.get(r)[a]=o}function i(){s=new WeakMap}return{get:e,remove:t,update:n,dispose:i}}function m0(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.material.id!==e.material.id?s.material.id-e.material.id:s.z!==e.z?s.z-e.z:s.id-e.id}function vl(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.z!==e.z?e.z-s.z:s.id-e.id}function Cl(){const s=[];let e=0;const t=[],n=[],i=[];function r(){e=0,t.length=0,n.length=0,i.length=0}function a(u,d,f,p,m,g){let A=s[e];return A===void 0?(A={id:u.id,object:u,geometry:d,material:f,groupOrder:p,renderOrder:u.renderOrder,z:m,group:g},s[e]=A):(A.id=u.id,A.object=u,A.geometry=d,A.material=f,A.groupOrder=p,A.renderOrder=u.renderOrder,A.z=m,A.group=g),e++,A}function o(u,d,f,p,m,g){const A=a(u,d,f,p,m,g);f.transmission>0?n.push(A):f.transparent===!0?i.push(A):t.push(A)}function c(u,d,f,p,m,g){const A=a(u,d,f,p,m,g);f.transmission>0?n.unshift(A):f.transparent===!0?i.unshift(A):t.unshift(A)}function l(u,d){t.length>1&&t.sort(u||m0),n.length>1&&n.sort(d||vl),i.length>1&&i.sort(d||vl)}function h(){for(let u=e,d=s.length;u<d;u++){const f=s[u];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:t,transmissive:n,transparent:i,init:r,push:o,unshift:c,finish:h,sort:l}}function b0(){let s=new WeakMap;function e(n,i){const r=s.get(n);let a;return r===void 0?(a=new Cl,s.set(n,[a])):i>=r.length?(a=new Cl,r.push(a)):a=r[i],a}function t(){s=new WeakMap}return{get:e,dispose:t}}function E0(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new y,color:new Ae};break;case"SpotLight":t={position:new y,direction:new y,color:new Ae,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new y,color:new Ae,distance:0,decay:0};break;case"HemisphereLight":t={direction:new y,skyColor:new Ae,groundColor:new Ae};break;case"RectAreaLight":t={color:new Ae,position:new y,halfWidth:new y,halfHeight:new y};break}return s[e.id]=t,t}}}function _0(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new oe};break;case"SpotLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new oe};break;case"PointLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new oe,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[e.id]=t,t}}}let x0=0;function y0(s,e){return(e.castShadow?2:0)-(s.castShadow?2:0)+(e.map?1:0)-(s.map?1:0)}function v0(s,e){const t=new E0,n=_0(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let h=0;h<9;h++)i.probe.push(new y);const r=new y,a=new Fe,o=new Fe;function c(h,u){let d=0,f=0,p=0;for(let U=0;U<9;U++)i.probe[U].set(0,0,0);let m=0,g=0,A=0,b=0,E=0,_=0,M=0,v=0,S=0,D=0,x=0;h.sort(y0);const C=u===!0?Math.PI:1;for(let U=0,O=h.length;U<O;U++){const T=h[U],F=T.color,Q=T.intensity,X=T.distance,k=T.shadow&&T.shadow.map?T.shadow.map.texture:null;if(T.isAmbientLight)d+=F.r*Q*C,f+=F.g*Q*C,p+=F.b*Q*C;else if(T.isLightProbe){for(let G=0;G<9;G++)i.probe[G].addScaledVector(T.sh.coefficients[G],Q);x++}else if(T.isDirectionalLight){const G=t.get(T);if(G.color.copy(T.color).multiplyScalar(T.intensity*C),T.castShadow){const j=T.shadow,J=n.get(T);J.shadowBias=j.bias,J.shadowNormalBias=j.normalBias,J.shadowRadius=j.radius,J.shadowMapSize=j.mapSize,i.directionalShadow[m]=J,i.directionalShadowMap[m]=k,i.directionalShadowMatrix[m]=T.shadow.matrix,_++}i.directional[m]=G,m++}else if(T.isSpotLight){const G=t.get(T);G.position.setFromMatrixPosition(T.matrixWorld),G.color.copy(F).multiplyScalar(Q*C),G.distance=X,G.coneCos=Math.cos(T.angle),G.penumbraCos=Math.cos(T.angle*(1-T.penumbra)),G.decay=T.decay,i.spot[A]=G;const j=T.shadow;if(T.map&&(i.spotLightMap[S]=T.map,S++,j.updateMatrices(T),T.castShadow&&D++),i.spotLightMatrix[A]=j.matrix,T.castShadow){const J=n.get(T);J.shadowBias=j.bias,J.shadowNormalBias=j.normalBias,J.shadowRadius=j.radius,J.shadowMapSize=j.mapSize,i.spotShadow[A]=J,i.spotShadowMap[A]=k,v++}A++}else if(T.isRectAreaLight){const G=t.get(T);G.color.copy(F).multiplyScalar(Q),G.halfWidth.set(T.width*.5,0,0),G.halfHeight.set(0,T.height*.5,0),i.rectArea[b]=G,b++}else if(T.isPointLight){const G=t.get(T);if(G.color.copy(T.color).multiplyScalar(T.intensity*C),G.distance=T.distance,G.decay=T.decay,T.castShadow){const j=T.shadow,J=n.get(T);J.shadowBias=j.bias,J.shadowNormalBias=j.normalBias,J.shadowRadius=j.radius,J.shadowMapSize=j.mapSize,J.shadowCameraNear=j.camera.near,J.shadowCameraFar=j.camera.far,i.pointShadow[g]=J,i.pointShadowMap[g]=k,i.pointShadowMatrix[g]=T.shadow.matrix,M++}i.point[g]=G,g++}else if(T.isHemisphereLight){const G=t.get(T);G.skyColor.copy(T.color).multiplyScalar(Q*C),G.groundColor.copy(T.groundColor).multiplyScalar(Q*C),i.hemi[E]=G,E++}}b>0&&(e.isWebGL2?s.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=re.LTC_FLOAT_1,i.rectAreaLTC2=re.LTC_FLOAT_2):(i.rectAreaLTC1=re.LTC_HALF_1,i.rectAreaLTC2=re.LTC_HALF_2):s.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=re.LTC_FLOAT_1,i.rectAreaLTC2=re.LTC_FLOAT_2):s.has("OES_texture_half_float_linear")===!0?(i.rectAreaLTC1=re.LTC_HALF_1,i.rectAreaLTC2=re.LTC_HALF_2):console.error("THREE.WebGLRenderer: Unable to use RectAreaLight. Missing WebGL extensions.")),i.ambient[0]=d,i.ambient[1]=f,i.ambient[2]=p;const R=i.hash;(R.directionalLength!==m||R.pointLength!==g||R.spotLength!==A||R.rectAreaLength!==b||R.hemiLength!==E||R.numDirectionalShadows!==_||R.numPointShadows!==M||R.numSpotShadows!==v||R.numSpotMaps!==S||R.numLightProbes!==x)&&(i.directional.length=m,i.spot.length=A,i.rectArea.length=b,i.point.length=g,i.hemi.length=E,i.directionalShadow.length=_,i.directionalShadowMap.length=_,i.pointShadow.length=M,i.pointShadowMap.length=M,i.spotShadow.length=v,i.spotShadowMap.length=v,i.directionalShadowMatrix.length=_,i.pointShadowMatrix.length=M,i.spotLightMatrix.length=v+S-D,i.spotLightMap.length=S,i.numSpotLightShadowsWithMaps=D,i.numLightProbes=x,R.directionalLength=m,R.pointLength=g,R.spotLength=A,R.rectAreaLength=b,R.hemiLength=E,R.numDirectionalShadows=_,R.numPointShadows=M,R.numSpotShadows=v,R.numSpotMaps=S,R.numLightProbes=x,i.version=x0++)}function l(h,u){let d=0,f=0,p=0,m=0,g=0;const A=u.matrixWorldInverse;for(let b=0,E=h.length;b<E;b++){const _=h[b];if(_.isDirectionalLight){const M=i.directional[d];M.direction.setFromMatrixPosition(_.matrixWorld),r.setFromMatrixPosition(_.target.matrixWorld),M.direction.sub(r),M.direction.transformDirection(A),d++}else if(_.isSpotLight){const M=i.spot[p];M.position.setFromMatrixPosition(_.matrixWorld),M.position.applyMatrix4(A),M.direction.setFromMatrixPosition(_.matrixWorld),r.setFromMatrixPosition(_.target.matrixWorld),M.direction.sub(r),M.direction.transformDirection(A),p++}else if(_.isRectAreaLight){const M=i.rectArea[m];M.position.setFromMatrixPosition(_.matrixWorld),M.position.applyMatrix4(A),o.identity(),a.copy(_.matrixWorld),a.premultiply(A),o.extractRotation(a),M.halfWidth.set(_.width*.5,0,0),M.halfHeight.set(0,_.height*.5,0),M.halfWidth.applyMatrix4(o),M.halfHeight.applyMatrix4(o),m++}else if(_.isPointLight){const M=i.point[f];M.position.setFromMatrixPosition(_.matrixWorld),M.position.applyMatrix4(A),f++}else if(_.isHemisphereLight){const M=i.hemi[g];M.direction.setFromMatrixPosition(_.matrixWorld),M.direction.transformDirection(A),g++}}}return{setup:c,setupView:l,state:i}}function Il(s,e){const t=new v0(s,e),n=[],i=[];function r(){n.length=0,i.length=0}function a(u){n.push(u)}function o(u){i.push(u)}function c(u){t.setup(n,u)}function l(u){t.setupView(n,u)}return{init:r,state:{lightsArray:n,shadowsArray:i,lights:t},setupLights:c,setupLightsView:l,pushLight:a,pushShadow:o}}function C0(s,e){let t=new WeakMap;function n(r,a=0){const o=t.get(r);let c;return o===void 0?(c=new Il(s,e),t.set(r,[c])):a>=o.length?(c=new Il(s,e),o.push(c)):c=o[a],c}function i(){t=new WeakMap}return{get:n,dispose:i}}class I0 extends wn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=uf,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class S0 extends wn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const M0=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,w0=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function B0(s,e,t){let n=new Go;const i=new oe,r=new oe,a=new at,o=new I0({depthPacking:df}),c=new S0,l={},h=t.maxTextureSize,u={[Rn]:$t,[$t]:Rn,[sn]:sn},d=new Xn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new oe},radius:{value:4}},vertexShader:M0,fragmentShader:w0}),f=d.clone();f.defines.HORIZONTAL_PASS=1;const p=new It;p.setAttribute("position",new Ut(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const m=new _e(p,d),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=qh;let A=this.type;this.render=function(v,S,D){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||v.length===0)return;const x=s.getRenderTarget(),C=s.getActiveCubeFace(),R=s.getActiveMipmapLevel(),U=s.state;U.setBlending(ri),U.buffers.color.setClear(1,1,1,1),U.buffers.depth.setTest(!0),U.setScissorTest(!1);const O=A!==zn&&this.type===zn,T=A===zn&&this.type!==zn;for(let F=0,Q=v.length;F<Q;F++){const X=v[F],k=X.shadow;if(k===void 0){console.warn("THREE.WebGLShadowMap:",X,"has no shadow.");continue}if(k.autoUpdate===!1&&k.needsUpdate===!1)continue;i.copy(k.mapSize);const G=k.getFrameExtents();if(i.multiply(G),r.copy(k.mapSize),(i.x>h||i.y>h)&&(i.x>h&&(r.x=Math.floor(h/G.x),i.x=r.x*G.x,k.mapSize.x=r.x),i.y>h&&(r.y=Math.floor(h/G.y),i.y=r.y*G.y,k.mapSize.y=r.y)),k.map===null||O===!0||T===!0){const J=this.type!==zn?{minFilter:Ht,magFilter:Ht}:{};k.map!==null&&k.map.dispose(),k.map=new li(i.x,i.y,J),k.map.texture.name=X.name+".shadowMap",k.camera.updateProjectionMatrix()}s.setRenderTarget(k.map),s.clear();const j=k.getViewportCount();for(let J=0;J<j;J++){const ne=k.getViewport(J);a.set(r.x*ne.x,r.y*ne.y,r.x*ne.z,r.y*ne.w),U.viewport(a),k.updateMatrices(X,J),n=k.getFrustum(),_(S,D,k.camera,X,this.type)}k.isPointLightShadow!==!0&&this.type===zn&&b(k,D),k.needsUpdate=!1}A=this.type,g.needsUpdate=!1,s.setRenderTarget(x,C,R)};function b(v,S){const D=e.update(m);d.defines.VSM_SAMPLES!==v.blurSamples&&(d.defines.VSM_SAMPLES=v.blurSamples,f.defines.VSM_SAMPLES=v.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),v.mapPass===null&&(v.mapPass=new li(i.x,i.y)),d.uniforms.shadow_pass.value=v.map.texture,d.uniforms.resolution.value=v.mapSize,d.uniforms.radius.value=v.radius,s.setRenderTarget(v.mapPass),s.clear(),s.renderBufferDirect(S,null,D,d,m,null),f.uniforms.shadow_pass.value=v.mapPass.texture,f.uniforms.resolution.value=v.mapSize,f.uniforms.radius.value=v.radius,s.setRenderTarget(v.map),s.clear(),s.renderBufferDirect(S,null,D,f,m,null)}function E(v,S,D,x){let C=null;const R=D.isPointLight===!0?v.customDistanceMaterial:v.customDepthMaterial;if(R!==void 0)C=R;else if(C=D.isPointLight===!0?c:o,s.localClippingEnabled&&S.clipShadows===!0&&Array.isArray(S.clippingPlanes)&&S.clippingPlanes.length!==0||S.displacementMap&&S.displacementScale!==0||S.alphaMap&&S.alphaTest>0||S.map&&S.alphaTest>0){const U=C.uuid,O=S.uuid;let T=l[U];T===void 0&&(T={},l[U]=T);let F=T[O];F===void 0&&(F=C.clone(),T[O]=F,S.addEventListener("dispose",M)),C=F}if(C.visible=S.visible,C.wireframe=S.wireframe,x===zn?C.side=S.shadowSide!==null?S.shadowSide:S.side:C.side=S.shadowSide!==null?S.shadowSide:u[S.side],C.alphaMap=S.alphaMap,C.alphaTest=S.alphaTest,C.map=S.map,C.clipShadows=S.clipShadows,C.clippingPlanes=S.clippingPlanes,C.clipIntersection=S.clipIntersection,C.displacementMap=S.displacementMap,C.displacementScale=S.displacementScale,C.displacementBias=S.displacementBias,C.wireframeLinewidth=S.wireframeLinewidth,C.linewidth=S.linewidth,D.isPointLight===!0&&C.isMeshDistanceMaterial===!0){const U=s.properties.get(C);U.light=D}return C}function _(v,S,D,x,C){if(v.visible===!1)return;if(v.layers.test(S.layers)&&(v.isMesh||v.isLine||v.isPoints)&&(v.castShadow||v.receiveShadow&&C===zn)&&(!v.frustumCulled||n.intersectsObject(v))){v.modelViewMatrix.multiplyMatrices(D.matrixWorldInverse,v.matrixWorld);const O=e.update(v),T=v.material;if(Array.isArray(T)){const F=O.groups;for(let Q=0,X=F.length;Q<X;Q++){const k=F[Q],G=T[k.materialIndex];if(G&&G.visible){const j=E(v,G,x,C);v.onBeforeShadow(s,v,S,D,O,j,k),s.renderBufferDirect(D,null,O,j,v,k),v.onAfterShadow(s,v,S,D,O,j,k)}}}else if(T.visible){const F=E(v,T,x,C);v.onBeforeShadow(s,v,S,D,O,F,null),s.renderBufferDirect(D,null,O,F,v,null),v.onAfterShadow(s,v,S,D,O,F,null)}}const U=v.children;for(let O=0,T=U.length;O<T;O++)_(U[O],S,D,x,C)}function M(v){v.target.removeEventListener("dispose",M);for(const D in l){const x=l[D],C=v.target.uuid;C in x&&(x[C].dispose(),delete x[C])}}}function T0(s,e,t){const n=t.isWebGL2;function i(){let P=!1;const le=new at;let he=null;const L=new at(0,0,0,0);return{setMask:function(K){he!==K&&!P&&(s.colorMask(K,K,K,K),he=K)},setLocked:function(K){P=K},setClear:function(K,$,de,ke,xe){xe===!0&&(K*=ke,$*=ke,de*=ke),le.set(K,$,de,ke),L.equals(le)===!1&&(s.clearColor(K,$,de,ke),L.copy(le))},reset:function(){P=!1,he=null,L.set(-1,0,0,0)}}}function r(){let P=!1,le=null,he=null,L=null;return{setTest:function(K){K?Qe(s.DEPTH_TEST):De(s.DEPTH_TEST)},setMask:function(K){le!==K&&!P&&(s.depthMask(K),le=K)},setFunc:function(K){if(he!==K){switch(K){case Qd:s.depthFunc(s.NEVER);break;case Od:s.depthFunc(s.ALWAYS);break;case kd:s.depthFunc(s.LESS);break;case Gr:s.depthFunc(s.LEQUAL);break;case Gd:s.depthFunc(s.EQUAL);break;case Hd:s.depthFunc(s.GEQUAL);break;case zd:s.depthFunc(s.GREATER);break;case Vd:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}he=K}},setLocked:function(K){P=K},setClear:function(K){L!==K&&(s.clearDepth(K),L=K)},reset:function(){P=!1,le=null,he=null,L=null}}}function a(){let P=!1,le=null,he=null,L=null,K=null,$=null,de=null,ke=null,xe=null;return{setTest:function(He){P||(He?Qe(s.STENCIL_TEST):De(s.STENCIL_TEST))},setMask:function(He){le!==He&&!P&&(s.stencilMask(He),le=He)},setFunc:function(He,$e,it){(he!==He||L!==$e||K!==it)&&(s.stencilFunc(He,$e,it),he=He,L=$e,K=it)},setOp:function(He,$e,it){($!==He||de!==$e||ke!==it)&&(s.stencilOp(He,$e,it),$=He,de=$e,ke=it)},setLocked:function(He){P=He},setClear:function(He){xe!==He&&(s.clearStencil(He),xe=He)},reset:function(){P=!1,le=null,he=null,L=null,K=null,$=null,de=null,ke=null,xe=null}}}const o=new i,c=new r,l=new a,h=new WeakMap,u=new WeakMap;let d={},f={},p=new WeakMap,m=[],g=null,A=!1,b=null,E=null,_=null,M=null,v=null,S=null,D=null,x=new Ae(0,0,0),C=0,R=!1,U=null,O=null,T=null,F=null,Q=null;const X=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let k=!1,G=0;const j=s.getParameter(s.VERSION);j.indexOf("WebGL")!==-1?(G=parseFloat(/^WebGL (\d)/.exec(j)[1]),k=G>=1):j.indexOf("OpenGL ES")!==-1&&(G=parseFloat(/^OpenGL ES (\d)/.exec(j)[1]),k=G>=2);let J=null,ne={};const W=s.getParameter(s.SCISSOR_BOX),Z=s.getParameter(s.VIEWPORT),ce=new at().fromArray(W),ge=new at().fromArray(Z);function pe(P,le,he,L){const K=new Uint8Array(4),$=s.createTexture();s.bindTexture(P,$),s.texParameteri(P,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(P,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let de=0;de<he;de++)n&&(P===s.TEXTURE_3D||P===s.TEXTURE_2D_ARRAY)?s.texImage3D(le,0,s.RGBA,1,1,L,0,s.RGBA,s.UNSIGNED_BYTE,K):s.texImage2D(le+de,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,K);return $}const we={};we[s.TEXTURE_2D]=pe(s.TEXTURE_2D,s.TEXTURE_2D,1),we[s.TEXTURE_CUBE_MAP]=pe(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),n&&(we[s.TEXTURE_2D_ARRAY]=pe(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),we[s.TEXTURE_3D]=pe(s.TEXTURE_3D,s.TEXTURE_3D,1,1)),o.setClear(0,0,0,1),c.setClear(1),l.setClear(0),Qe(s.DEPTH_TEST),c.setFunc(Gr),Ge(!1),B(fc),Qe(s.CULL_FACE),Ee(ri);function Qe(P){d[P]!==!0&&(s.enable(P),d[P]=!0)}function De(P){d[P]!==!1&&(s.disable(P),d[P]=!1)}function Je(P,le){return f[P]!==le?(s.bindFramebuffer(P,le),f[P]=le,n&&(P===s.DRAW_FRAMEBUFFER&&(f[s.FRAMEBUFFER]=le),P===s.FRAMEBUFFER&&(f[s.DRAW_FRAMEBUFFER]=le)),!0):!1}function z(P,le){let he=m,L=!1;if(P)if(he=p.get(le),he===void 0&&(he=[],p.set(le,he)),P.isWebGLMultipleRenderTargets){const K=P.texture;if(he.length!==K.length||he[0]!==s.COLOR_ATTACHMENT0){for(let $=0,de=K.length;$<de;$++)he[$]=s.COLOR_ATTACHMENT0+$;he.length=K.length,L=!0}}else he[0]!==s.COLOR_ATTACHMENT0&&(he[0]=s.COLOR_ATTACHMENT0,L=!0);else he[0]!==s.BACK&&(he[0]=s.BACK,L=!0);L&&(t.isWebGL2?s.drawBuffers(he):e.get("WEBGL_draw_buffers").drawBuffersWEBGL(he))}function zt(P){return g!==P?(s.useProgram(P),g=P,!0):!1}const Se={[Ci]:s.FUNC_ADD,[vd]:s.FUNC_SUBTRACT,[Cd]:s.FUNC_REVERSE_SUBTRACT};if(n)Se[gc]=s.MIN,Se[mc]=s.MAX;else{const P=e.get("EXT_blend_minmax");P!==null&&(Se[gc]=P.MIN_EXT,Se[mc]=P.MAX_EXT)}const Be={[Id]:s.ZERO,[Sd]:s.ONE,[Md]:s.SRC_COLOR,[lo]:s.SRC_ALPHA,[Ld]:s.SRC_ALPHA_SATURATE,[Rd]:s.DST_COLOR,[Bd]:s.DST_ALPHA,[wd]:s.ONE_MINUS_SRC_COLOR,[ho]:s.ONE_MINUS_SRC_ALPHA,[Dd]:s.ONE_MINUS_DST_COLOR,[Td]:s.ONE_MINUS_DST_ALPHA,[Pd]:s.CONSTANT_COLOR,[Fd]:s.ONE_MINUS_CONSTANT_COLOR,[Ud]:s.CONSTANT_ALPHA,[Nd]:s.ONE_MINUS_CONSTANT_ALPHA};function Ee(P,le,he,L,K,$,de,ke,xe,He){if(P===ri){A===!0&&(De(s.BLEND),A=!1);return}if(A===!1&&(Qe(s.BLEND),A=!0),P!==yd){if(P!==b||He!==R){if((E!==Ci||v!==Ci)&&(s.blendEquation(s.FUNC_ADD),E=Ci,v=Ci),He)switch(P){case as:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case co:s.blendFunc(s.ONE,s.ONE);break;case Ac:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case pc:s.blendFuncSeparate(s.ZERO,s.SRC_COLOR,s.ZERO,s.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",P);break}else switch(P){case as:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case co:s.blendFunc(s.SRC_ALPHA,s.ONE);break;case Ac:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case pc:s.blendFunc(s.ZERO,s.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",P);break}_=null,M=null,S=null,D=null,x.set(0,0,0),C=0,b=P,R=He}return}K=K||le,$=$||he,de=de||L,(le!==E||K!==v)&&(s.blendEquationSeparate(Se[le],Se[K]),E=le,v=K),(he!==_||L!==M||$!==S||de!==D)&&(s.blendFuncSeparate(Be[he],Be[L],Be[$],Be[de]),_=he,M=L,S=$,D=de),(ke.equals(x)===!1||xe!==C)&&(s.blendColor(ke.r,ke.g,ke.b,xe),x.copy(ke),C=xe),b=P,R=!1}function At(P,le){P.side===sn?De(s.CULL_FACE):Qe(s.CULL_FACE);let he=P.side===$t;le&&(he=!he),Ge(he),P.blending===as&&P.transparent===!1?Ee(ri):Ee(P.blending,P.blendEquation,P.blendSrc,P.blendDst,P.blendEquationAlpha,P.blendSrcAlpha,P.blendDstAlpha,P.blendColor,P.blendAlpha,P.premultipliedAlpha),c.setFunc(P.depthFunc),c.setTest(P.depthTest),c.setMask(P.depthWrite),o.setMask(P.colorWrite);const L=P.stencilWrite;l.setTest(L),L&&(l.setMask(P.stencilWriteMask),l.setFunc(P.stencilFunc,P.stencilRef,P.stencilFuncMask),l.setOp(P.stencilFail,P.stencilZFail,P.stencilZPass)),V(P.polygonOffset,P.polygonOffsetFactor,P.polygonOffsetUnits),P.alphaToCoverage===!0?Qe(s.SAMPLE_ALPHA_TO_COVERAGE):De(s.SAMPLE_ALPHA_TO_COVERAGE)}function Ge(P){U!==P&&(P?s.frontFace(s.CW):s.frontFace(s.CCW),U=P)}function B(P){P!==_d?(Qe(s.CULL_FACE),P!==O&&(P===fc?s.cullFace(s.BACK):P===xd?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):De(s.CULL_FACE),O=P}function I(P){P!==T&&(k&&s.lineWidth(P),T=P)}function V(P,le,he){P?(Qe(s.POLYGON_OFFSET_FILL),(F!==le||Q!==he)&&(s.polygonOffset(le,he),F=le,Q=he)):De(s.POLYGON_OFFSET_FILL)}function ie(P){P?Qe(s.SCISSOR_TEST):De(s.SCISSOR_TEST)}function ee(P){P===void 0&&(P=s.TEXTURE0+X-1),J!==P&&(s.activeTexture(P),J=P)}function se(P,le,he){he===void 0&&(J===null?he=s.TEXTURE0+X-1:he=J);let L=ne[he];L===void 0&&(L={type:void 0,texture:void 0},ne[he]=L),(L.type!==P||L.texture!==le)&&(J!==he&&(s.activeTexture(he),J=he),s.bindTexture(P,le||we[P]),L.type=P,L.texture=le)}function Ce(){const P=ne[J];P!==void 0&&P.type!==void 0&&(s.bindTexture(P.type,null),P.type=void 0,P.texture=void 0)}function ue(){try{s.compressedTexImage2D.apply(s,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function me(){try{s.compressedTexImage3D.apply(s,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function Te(){try{s.texSubImage2D.apply(s,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function Ve(){try{s.texSubImage3D.apply(s,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function te(){try{s.compressedTexSubImage2D.apply(s,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function tt(){try{s.compressedTexSubImage3D.apply(s,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function We(){try{s.texStorage2D.apply(s,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function Le(){try{s.texStorage3D.apply(s,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function ye(){try{s.texImage2D.apply(s,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function be(){try{s.texImage3D.apply(s,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function Oe(P){ce.equals(P)===!1&&(s.scissor(P.x,P.y,P.z,P.w),ce.copy(P))}function nt(P){ge.equals(P)===!1&&(s.viewport(P.x,P.y,P.z,P.w),ge.copy(P))}function _t(P,le){let he=u.get(le);he===void 0&&(he=new WeakMap,u.set(le,he));let L=he.get(P);L===void 0&&(L=s.getUniformBlockIndex(le,P.name),he.set(P,L))}function qe(P,le){const L=u.get(le).get(P);h.get(le)!==L&&(s.uniformBlockBinding(le,L,P.__bindingPointIndex),h.set(le,L))}function ae(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),n===!0&&(s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null)),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),d={},J=null,ne={},f={},p=new WeakMap,m=[],g=null,A=!1,b=null,E=null,_=null,M=null,v=null,S=null,D=null,x=new Ae(0,0,0),C=0,R=!1,U=null,O=null,T=null,F=null,Q=null,ce.set(0,0,s.canvas.width,s.canvas.height),ge.set(0,0,s.canvas.width,s.canvas.height),o.reset(),c.reset(),l.reset()}return{buffers:{color:o,depth:c,stencil:l},enable:Qe,disable:De,bindFramebuffer:Je,drawBuffers:z,useProgram:zt,setBlending:Ee,setMaterial:At,setFlipSided:Ge,setCullFace:B,setLineWidth:I,setPolygonOffset:V,setScissorTest:ie,activeTexture:ee,bindTexture:se,unbindTexture:Ce,compressedTexImage2D:ue,compressedTexImage3D:me,texImage2D:ye,texImage3D:be,updateUBOMapping:_t,uniformBlockBinding:qe,texStorage2D:We,texStorage3D:Le,texSubImage2D:Te,texSubImage3D:Ve,compressedTexSubImage2D:te,compressedTexSubImage3D:tt,scissor:Oe,viewport:nt,reset:ae}}function R0(s,e,t,n,i,r,a){const o=i.isWebGL2,c=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),h=new WeakMap;let u;const d=new WeakMap;let f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function p(B,I){return f?new OffscreenCanvas(B,I):zs("canvas")}function m(B,I,V,ie){let ee=1;if((B.width>ie||B.height>ie)&&(ee=ie/Math.max(B.width,B.height)),ee<1||I===!0)if(typeof HTMLImageElement<"u"&&B instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&B instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&B instanceof ImageBitmap){const se=I?Kr:Math.floor,Ce=se(ee*B.width),ue=se(ee*B.height);u===void 0&&(u=p(Ce,ue));const me=V?p(Ce,ue):u;return me.width=Ce,me.height=ue,me.getContext("2d").drawImage(B,0,0,Ce,ue),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+B.width+"x"+B.height+") to ("+Ce+"x"+ue+")."),me}else return"data"in B&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+B.width+"x"+B.height+")."),B;return B}function g(B){return vo(B.width)&&vo(B.height)}function A(B){return o?!1:B.wrapS!==ln||B.wrapT!==ln||B.minFilter!==Ht&&B.minFilter!==Xt}function b(B,I){return B.generateMipmaps&&I&&B.minFilter!==Ht&&B.minFilter!==Xt}function E(B){s.generateMipmap(B)}function _(B,I,V,ie,ee=!1){if(o===!1)return I;if(B!==null){if(s[B]!==void 0)return s[B];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+B+"'")}let se=I;if(I===s.RED&&(V===s.FLOAT&&(se=s.R32F),V===s.HALF_FLOAT&&(se=s.R16F),V===s.UNSIGNED_BYTE&&(se=s.R8)),I===s.RED_INTEGER&&(V===s.UNSIGNED_BYTE&&(se=s.R8UI),V===s.UNSIGNED_SHORT&&(se=s.R16UI),V===s.UNSIGNED_INT&&(se=s.R32UI),V===s.BYTE&&(se=s.R8I),V===s.SHORT&&(se=s.R16I),V===s.INT&&(se=s.R32I)),I===s.RG&&(V===s.FLOAT&&(se=s.RG32F),V===s.HALF_FLOAT&&(se=s.RG16F),V===s.UNSIGNED_BYTE&&(se=s.RG8)),I===s.RGBA){const Ce=ee?Wr:rt.getTransfer(ie);V===s.FLOAT&&(se=s.RGBA32F),V===s.HALF_FLOAT&&(se=s.RGBA16F),V===s.UNSIGNED_BYTE&&(se=Ce===bt?s.SRGB8_ALPHA8:s.RGBA8),V===s.UNSIGNED_SHORT_4_4_4_4&&(se=s.RGBA4),V===s.UNSIGNED_SHORT_5_5_5_1&&(se=s.RGB5_A1)}return(se===s.R16F||se===s.R32F||se===s.RG16F||se===s.RG32F||se===s.RGBA16F||se===s.RGBA32F)&&e.get("EXT_color_buffer_float"),se}function M(B,I,V){return b(B,V)===!0||B.isFramebufferTexture&&B.minFilter!==Ht&&B.minFilter!==Xt?Math.log2(Math.max(I.width,I.height))+1:B.mipmaps!==void 0&&B.mipmaps.length>0?B.mipmaps.length:B.isCompressedTexture&&Array.isArray(B.image)?I.mipmaps.length:1}function v(B){return B===Ht||B===Ao||B===Pr?s.NEAREST:s.LINEAR}function S(B){const I=B.target;I.removeEventListener("dispose",S),x(I),I.isVideoTexture&&h.delete(I)}function D(B){const I=B.target;I.removeEventListener("dispose",D),R(I)}function x(B){const I=n.get(B);if(I.__webglInit===void 0)return;const V=B.source,ie=d.get(V);if(ie){const ee=ie[I.__cacheKey];ee.usedTimes--,ee.usedTimes===0&&C(B),Object.keys(ie).length===0&&d.delete(V)}n.remove(B)}function C(B){const I=n.get(B);s.deleteTexture(I.__webglTexture);const V=B.source,ie=d.get(V);delete ie[I.__cacheKey],a.memory.textures--}function R(B){const I=B.texture,V=n.get(B),ie=n.get(I);if(ie.__webglTexture!==void 0&&(s.deleteTexture(ie.__webglTexture),a.memory.textures--),B.depthTexture&&B.depthTexture.dispose(),B.isWebGLCubeRenderTarget)for(let ee=0;ee<6;ee++){if(Array.isArray(V.__webglFramebuffer[ee]))for(let se=0;se<V.__webglFramebuffer[ee].length;se++)s.deleteFramebuffer(V.__webglFramebuffer[ee][se]);else s.deleteFramebuffer(V.__webglFramebuffer[ee]);V.__webglDepthbuffer&&s.deleteRenderbuffer(V.__webglDepthbuffer[ee])}else{if(Array.isArray(V.__webglFramebuffer))for(let ee=0;ee<V.__webglFramebuffer.length;ee++)s.deleteFramebuffer(V.__webglFramebuffer[ee]);else s.deleteFramebuffer(V.__webglFramebuffer);if(V.__webglDepthbuffer&&s.deleteRenderbuffer(V.__webglDepthbuffer),V.__webglMultisampledFramebuffer&&s.deleteFramebuffer(V.__webglMultisampledFramebuffer),V.__webglColorRenderbuffer)for(let ee=0;ee<V.__webglColorRenderbuffer.length;ee++)V.__webglColorRenderbuffer[ee]&&s.deleteRenderbuffer(V.__webglColorRenderbuffer[ee]);V.__webglDepthRenderbuffer&&s.deleteRenderbuffer(V.__webglDepthRenderbuffer)}if(B.isWebGLMultipleRenderTargets)for(let ee=0,se=I.length;ee<se;ee++){const Ce=n.get(I[ee]);Ce.__webglTexture&&(s.deleteTexture(Ce.__webglTexture),a.memory.textures--),n.remove(I[ee])}n.remove(I),n.remove(B)}let U=0;function O(){U=0}function T(){const B=U;return B>=i.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+B+" texture units while this GPU supports only "+i.maxTextures),U+=1,B}function F(B){const I=[];return I.push(B.wrapS),I.push(B.wrapT),I.push(B.wrapR||0),I.push(B.magFilter),I.push(B.minFilter),I.push(B.anisotropy),I.push(B.internalFormat),I.push(B.format),I.push(B.type),I.push(B.generateMipmaps),I.push(B.premultiplyAlpha),I.push(B.flipY),I.push(B.unpackAlignment),I.push(B.colorSpace),I.join()}function Q(B,I){const V=n.get(B);if(B.isVideoTexture&&At(B),B.isRenderTargetTexture===!1&&B.version>0&&V.__version!==B.version){const ie=B.image;if(ie===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(ie.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{ce(V,B,I);return}}t.bindTexture(s.TEXTURE_2D,V.__webglTexture,s.TEXTURE0+I)}function X(B,I){const V=n.get(B);if(B.version>0&&V.__version!==B.version){ce(V,B,I);return}t.bindTexture(s.TEXTURE_2D_ARRAY,V.__webglTexture,s.TEXTURE0+I)}function k(B,I){const V=n.get(B);if(B.version>0&&V.__version!==B.version){ce(V,B,I);return}t.bindTexture(s.TEXTURE_3D,V.__webglTexture,s.TEXTURE0+I)}function G(B,I){const V=n.get(B);if(B.version>0&&V.__version!==B.version){ge(V,B,I);return}t.bindTexture(s.TEXTURE_CUBE_MAP,V.__webglTexture,s.TEXTURE0+I)}const j={[Dn]:s.REPEAT,[ln]:s.CLAMP_TO_EDGE,[Hr]:s.MIRRORED_REPEAT},J={[Ht]:s.NEAREST,[Ao]:s.NEAREST_MIPMAP_NEAREST,[Pr]:s.NEAREST_MIPMAP_LINEAR,[Xt]:s.LINEAR,[Jh]:s.LINEAR_MIPMAP_NEAREST,[ci]:s.LINEAR_MIPMAP_LINEAR},ne={[Af]:s.NEVER,[_f]:s.ALWAYS,[pf]:s.LESS,[ou]:s.LEQUAL,[gf]:s.EQUAL,[Ef]:s.GEQUAL,[mf]:s.GREATER,[bf]:s.NOTEQUAL};function W(B,I,V){if(V?(s.texParameteri(B,s.TEXTURE_WRAP_S,j[I.wrapS]),s.texParameteri(B,s.TEXTURE_WRAP_T,j[I.wrapT]),(B===s.TEXTURE_3D||B===s.TEXTURE_2D_ARRAY)&&s.texParameteri(B,s.TEXTURE_WRAP_R,j[I.wrapR]),s.texParameteri(B,s.TEXTURE_MAG_FILTER,J[I.magFilter]),s.texParameteri(B,s.TEXTURE_MIN_FILTER,J[I.minFilter])):(s.texParameteri(B,s.TEXTURE_WRAP_S,s.CLAMP_TO_EDGE),s.texParameteri(B,s.TEXTURE_WRAP_T,s.CLAMP_TO_EDGE),(B===s.TEXTURE_3D||B===s.TEXTURE_2D_ARRAY)&&s.texParameteri(B,s.TEXTURE_WRAP_R,s.CLAMP_TO_EDGE),(I.wrapS!==ln||I.wrapT!==ln)&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping."),s.texParameteri(B,s.TEXTURE_MAG_FILTER,v(I.magFilter)),s.texParameteri(B,s.TEXTURE_MIN_FILTER,v(I.minFilter)),I.minFilter!==Ht&&I.minFilter!==Xt&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.")),I.compareFunction&&(s.texParameteri(B,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(B,s.TEXTURE_COMPARE_FUNC,ne[I.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){const ie=e.get("EXT_texture_filter_anisotropic");if(I.magFilter===Ht||I.minFilter!==Pr&&I.minFilter!==ci||I.type===hn&&e.has("OES_texture_float_linear")===!1||o===!1&&I.type===qn&&e.has("OES_texture_half_float_linear")===!1)return;(I.anisotropy>1||n.get(I).__currentAnisotropy)&&(s.texParameterf(B,ie.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(I.anisotropy,i.getMaxAnisotropy())),n.get(I).__currentAnisotropy=I.anisotropy)}}function Z(B,I){let V=!1;B.__webglInit===void 0&&(B.__webglInit=!0,I.addEventListener("dispose",S));const ie=I.source;let ee=d.get(ie);ee===void 0&&(ee={},d.set(ie,ee));const se=F(I);if(se!==B.__cacheKey){ee[se]===void 0&&(ee[se]={texture:s.createTexture(),usedTimes:0},a.memory.textures++,V=!0),ee[se].usedTimes++;const Ce=ee[B.__cacheKey];Ce!==void 0&&(ee[B.__cacheKey].usedTimes--,Ce.usedTimes===0&&C(I)),B.__cacheKey=se,B.__webglTexture=ee[se].texture}return V}function ce(B,I,V){let ie=s.TEXTURE_2D;(I.isDataArrayTexture||I.isCompressedArrayTexture)&&(ie=s.TEXTURE_2D_ARRAY),I.isData3DTexture&&(ie=s.TEXTURE_3D);const ee=Z(B,I),se=I.source;t.bindTexture(ie,B.__webglTexture,s.TEXTURE0+V);const Ce=n.get(se);if(se.version!==Ce.__version||ee===!0){t.activeTexture(s.TEXTURE0+V);const ue=rt.getPrimaries(rt.workingColorSpace),me=I.colorSpace===rn?null:rt.getPrimaries(I.colorSpace),Te=I.colorSpace===rn||ue===me?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,I.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,I.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,I.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,Te);const Ve=A(I)&&g(I.image)===!1;let te=m(I.image,Ve,!1,i.maxTextureSize);te=Ge(I,te);const tt=g(te)||o,We=r.convert(I.format,I.colorSpace);let Le=r.convert(I.type),ye=_(I.internalFormat,We,Le,I.colorSpace,I.isVideoTexture);W(ie,I,tt);let be;const Oe=I.mipmaps,nt=o&&I.isVideoTexture!==!0&&ye!==No,_t=Ce.__version===void 0||ee===!0,qe=M(I,te,tt);if(I.isDepthTexture)ye=s.DEPTH_COMPONENT,o?I.type===hn?ye=s.DEPTH_COMPONENT32F:I.type===ii?ye=s.DEPTH_COMPONENT24:I.type===Mi?ye=s.DEPTH24_STENCIL8:ye=s.DEPTH_COMPONENT16:I.type===hn&&console.error("WebGLRenderer: Floating point depth texture requires WebGL2."),I.format===wi&&ye===s.DEPTH_COMPONENT&&I.type!==Uo&&I.type!==ii&&(console.warn("THREE.WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture."),I.type=ii,Le=r.convert(I.type)),I.format===ds&&ye===s.DEPTH_COMPONENT&&(ye=s.DEPTH_STENCIL,I.type!==Mi&&(console.warn("THREE.WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture."),I.type=Mi,Le=r.convert(I.type))),_t&&(nt?t.texStorage2D(s.TEXTURE_2D,1,ye,te.width,te.height):t.texImage2D(s.TEXTURE_2D,0,ye,te.width,te.height,0,We,Le,null));else if(I.isDataTexture)if(Oe.length>0&&tt){nt&&_t&&t.texStorage2D(s.TEXTURE_2D,qe,ye,Oe[0].width,Oe[0].height);for(let ae=0,P=Oe.length;ae<P;ae++)be=Oe[ae],nt?t.texSubImage2D(s.TEXTURE_2D,ae,0,0,be.width,be.height,We,Le,be.data):t.texImage2D(s.TEXTURE_2D,ae,ye,be.width,be.height,0,We,Le,be.data);I.generateMipmaps=!1}else nt?(_t&&t.texStorage2D(s.TEXTURE_2D,qe,ye,te.width,te.height),t.texSubImage2D(s.TEXTURE_2D,0,0,0,te.width,te.height,We,Le,te.data)):t.texImage2D(s.TEXTURE_2D,0,ye,te.width,te.height,0,We,Le,te.data);else if(I.isCompressedTexture)if(I.isCompressedArrayTexture){nt&&_t&&t.texStorage3D(s.TEXTURE_2D_ARRAY,qe,ye,Oe[0].width,Oe[0].height,te.depth);for(let ae=0,P=Oe.length;ae<P;ae++)be=Oe[ae],I.format!==Lt?We!==null?nt?t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,ae,0,0,0,be.width,be.height,te.depth,We,be.data,0,0):t.compressedTexImage3D(s.TEXTURE_2D_ARRAY,ae,ye,be.width,be.height,te.depth,0,be.data,0,0):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):nt?t.texSubImage3D(s.TEXTURE_2D_ARRAY,ae,0,0,0,be.width,be.height,te.depth,We,Le,be.data):t.texImage3D(s.TEXTURE_2D_ARRAY,ae,ye,be.width,be.height,te.depth,0,We,Le,be.data)}else{nt&&_t&&t.texStorage2D(s.TEXTURE_2D,qe,ye,Oe[0].width,Oe[0].height);for(let ae=0,P=Oe.length;ae<P;ae++)be=Oe[ae],I.format!==Lt?We!==null?nt?t.compressedTexSubImage2D(s.TEXTURE_2D,ae,0,0,be.width,be.height,We,be.data):t.compressedTexImage2D(s.TEXTURE_2D,ae,ye,be.width,be.height,0,be.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):nt?t.texSubImage2D(s.TEXTURE_2D,ae,0,0,be.width,be.height,We,Le,be.data):t.texImage2D(s.TEXTURE_2D,ae,ye,be.width,be.height,0,We,Le,be.data)}else if(I.isDataArrayTexture)nt?(_t&&t.texStorage3D(s.TEXTURE_2D_ARRAY,qe,ye,te.width,te.height,te.depth),t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,te.width,te.height,te.depth,We,Le,te.data)):t.texImage3D(s.TEXTURE_2D_ARRAY,0,ye,te.width,te.height,te.depth,0,We,Le,te.data);else if(I.isData3DTexture)nt?(_t&&t.texStorage3D(s.TEXTURE_3D,qe,ye,te.width,te.height,te.depth),t.texSubImage3D(s.TEXTURE_3D,0,0,0,0,te.width,te.height,te.depth,We,Le,te.data)):t.texImage3D(s.TEXTURE_3D,0,ye,te.width,te.height,te.depth,0,We,Le,te.data);else if(I.isFramebufferTexture){if(_t)if(nt)t.texStorage2D(s.TEXTURE_2D,qe,ye,te.width,te.height);else{let ae=te.width,P=te.height;for(let le=0;le<qe;le++)t.texImage2D(s.TEXTURE_2D,le,ye,ae,P,0,We,Le,null),ae>>=1,P>>=1}}else if(Oe.length>0&&tt){nt&&_t&&t.texStorage2D(s.TEXTURE_2D,qe,ye,Oe[0].width,Oe[0].height);for(let ae=0,P=Oe.length;ae<P;ae++)be=Oe[ae],nt?t.texSubImage2D(s.TEXTURE_2D,ae,0,0,We,Le,be):t.texImage2D(s.TEXTURE_2D,ae,ye,We,Le,be);I.generateMipmaps=!1}else nt?(_t&&t.texStorage2D(s.TEXTURE_2D,qe,ye,te.width,te.height),t.texSubImage2D(s.TEXTURE_2D,0,0,0,We,Le,te)):t.texImage2D(s.TEXTURE_2D,0,ye,We,Le,te);b(I,tt)&&E(ie),Ce.__version=se.version,I.onUpdate&&I.onUpdate(I)}B.__version=I.version}function ge(B,I,V){if(I.image.length!==6)return;const ie=Z(B,I),ee=I.source;t.bindTexture(s.TEXTURE_CUBE_MAP,B.__webglTexture,s.TEXTURE0+V);const se=n.get(ee);if(ee.version!==se.__version||ie===!0){t.activeTexture(s.TEXTURE0+V);const Ce=rt.getPrimaries(rt.workingColorSpace),ue=I.colorSpace===rn?null:rt.getPrimaries(I.colorSpace),me=I.colorSpace===rn||Ce===ue?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,I.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,I.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,I.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,me);const Te=I.isCompressedTexture||I.image[0].isCompressedTexture,Ve=I.image[0]&&I.image[0].isDataTexture,te=[];for(let ae=0;ae<6;ae++)!Te&&!Ve?te[ae]=m(I.image[ae],!1,!0,i.maxCubemapSize):te[ae]=Ve?I.image[ae].image:I.image[ae],te[ae]=Ge(I,te[ae]);const tt=te[0],We=g(tt)||o,Le=r.convert(I.format,I.colorSpace),ye=r.convert(I.type),be=_(I.internalFormat,Le,ye,I.colorSpace),Oe=o&&I.isVideoTexture!==!0,nt=se.__version===void 0||ie===!0;let _t=M(I,tt,We);W(s.TEXTURE_CUBE_MAP,I,We);let qe;if(Te){Oe&&nt&&t.texStorage2D(s.TEXTURE_CUBE_MAP,_t,be,tt.width,tt.height);for(let ae=0;ae<6;ae++){qe=te[ae].mipmaps;for(let P=0;P<qe.length;P++){const le=qe[P];I.format!==Lt?Le!==null?Oe?t.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ae,P,0,0,le.width,le.height,Le,le.data):t.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ae,P,be,le.width,le.height,0,le.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Oe?t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ae,P,0,0,le.width,le.height,Le,ye,le.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ae,P,be,le.width,le.height,0,Le,ye,le.data)}}}else{qe=I.mipmaps,Oe&&nt&&(qe.length>0&&_t++,t.texStorage2D(s.TEXTURE_CUBE_MAP,_t,be,te[0].width,te[0].height));for(let ae=0;ae<6;ae++)if(Ve){Oe?t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0,0,0,te[ae].width,te[ae].height,Le,ye,te[ae].data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0,be,te[ae].width,te[ae].height,0,Le,ye,te[ae].data);for(let P=0;P<qe.length;P++){const he=qe[P].image[ae].image;Oe?t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ae,P+1,0,0,he.width,he.height,Le,ye,he.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ae,P+1,be,he.width,he.height,0,Le,ye,he.data)}}else{Oe?t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0,0,0,Le,ye,te[ae]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0,be,Le,ye,te[ae]);for(let P=0;P<qe.length;P++){const le=qe[P];Oe?t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ae,P+1,0,0,Le,ye,le.image[ae]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ae,P+1,be,Le,ye,le.image[ae])}}}b(I,We)&&E(s.TEXTURE_CUBE_MAP),se.__version=ee.version,I.onUpdate&&I.onUpdate(I)}B.__version=I.version}function pe(B,I,V,ie,ee,se){const Ce=r.convert(V.format,V.colorSpace),ue=r.convert(V.type),me=_(V.internalFormat,Ce,ue,V.colorSpace);if(!n.get(I).__hasExternalTextures){const Ve=Math.max(1,I.width>>se),te=Math.max(1,I.height>>se);ee===s.TEXTURE_3D||ee===s.TEXTURE_2D_ARRAY?t.texImage3D(ee,se,me,Ve,te,I.depth,0,Ce,ue,null):t.texImage2D(ee,se,me,Ve,te,0,Ce,ue,null)}t.bindFramebuffer(s.FRAMEBUFFER,B),Ee(I)?c.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,ie,ee,n.get(V).__webglTexture,0,Be(I)):(ee===s.TEXTURE_2D||ee>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&ee<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,ie,ee,n.get(V).__webglTexture,se),t.bindFramebuffer(s.FRAMEBUFFER,null)}function we(B,I,V){if(s.bindRenderbuffer(s.RENDERBUFFER,B),I.depthBuffer&&!I.stencilBuffer){let ie=o===!0?s.DEPTH_COMPONENT24:s.DEPTH_COMPONENT16;if(V||Ee(I)){const ee=I.depthTexture;ee&&ee.isDepthTexture&&(ee.type===hn?ie=s.DEPTH_COMPONENT32F:ee.type===ii&&(ie=s.DEPTH_COMPONENT24));const se=Be(I);Ee(I)?c.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,se,ie,I.width,I.height):s.renderbufferStorageMultisample(s.RENDERBUFFER,se,ie,I.width,I.height)}else s.renderbufferStorage(s.RENDERBUFFER,ie,I.width,I.height);s.framebufferRenderbuffer(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.RENDERBUFFER,B)}else if(I.depthBuffer&&I.stencilBuffer){const ie=Be(I);V&&Ee(I)===!1?s.renderbufferStorageMultisample(s.RENDERBUFFER,ie,s.DEPTH24_STENCIL8,I.width,I.height):Ee(I)?c.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,ie,s.DEPTH24_STENCIL8,I.width,I.height):s.renderbufferStorage(s.RENDERBUFFER,s.DEPTH_STENCIL,I.width,I.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.RENDERBUFFER,B)}else{const ie=I.isWebGLMultipleRenderTargets===!0?I.texture:[I.texture];for(let ee=0;ee<ie.length;ee++){const se=ie[ee],Ce=r.convert(se.format,se.colorSpace),ue=r.convert(se.type),me=_(se.internalFormat,Ce,ue,se.colorSpace),Te=Be(I);V&&Ee(I)===!1?s.renderbufferStorageMultisample(s.RENDERBUFFER,Te,me,I.width,I.height):Ee(I)?c.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,Te,me,I.width,I.height):s.renderbufferStorage(s.RENDERBUFFER,me,I.width,I.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function Qe(B,I){if(I&&I.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(s.FRAMEBUFFER,B),!(I.depthTexture&&I.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!n.get(I.depthTexture).__webglTexture||I.depthTexture.image.width!==I.width||I.depthTexture.image.height!==I.height)&&(I.depthTexture.image.width=I.width,I.depthTexture.image.height=I.height,I.depthTexture.needsUpdate=!0),Q(I.depthTexture,0);const ie=n.get(I.depthTexture).__webglTexture,ee=Be(I);if(I.depthTexture.format===wi)Ee(I)?c.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,ie,0,ee):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,ie,0);else if(I.depthTexture.format===ds)Ee(I)?c.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,ie,0,ee):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,ie,0);else throw new Error("Unknown depthTexture format")}function De(B){const I=n.get(B),V=B.isWebGLCubeRenderTarget===!0;if(B.depthTexture&&!I.__autoAllocateDepthBuffer){if(V)throw new Error("target.depthTexture not supported in Cube render targets");Qe(I.__webglFramebuffer,B)}else if(V){I.__webglDepthbuffer=[];for(let ie=0;ie<6;ie++)t.bindFramebuffer(s.FRAMEBUFFER,I.__webglFramebuffer[ie]),I.__webglDepthbuffer[ie]=s.createRenderbuffer(),we(I.__webglDepthbuffer[ie],B,!1)}else t.bindFramebuffer(s.FRAMEBUFFER,I.__webglFramebuffer),I.__webglDepthbuffer=s.createRenderbuffer(),we(I.__webglDepthbuffer,B,!1);t.bindFramebuffer(s.FRAMEBUFFER,null)}function Je(B,I,V){const ie=n.get(B);I!==void 0&&pe(ie.__webglFramebuffer,B,B.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),V!==void 0&&De(B)}function z(B){const I=B.texture,V=n.get(B),ie=n.get(I);B.addEventListener("dispose",D),B.isWebGLMultipleRenderTargets!==!0&&(ie.__webglTexture===void 0&&(ie.__webglTexture=s.createTexture()),ie.__version=I.version,a.memory.textures++);const ee=B.isWebGLCubeRenderTarget===!0,se=B.isWebGLMultipleRenderTargets===!0,Ce=g(B)||o;if(ee){V.__webglFramebuffer=[];for(let ue=0;ue<6;ue++)if(o&&I.mipmaps&&I.mipmaps.length>0){V.__webglFramebuffer[ue]=[];for(let me=0;me<I.mipmaps.length;me++)V.__webglFramebuffer[ue][me]=s.createFramebuffer()}else V.__webglFramebuffer[ue]=s.createFramebuffer()}else{if(o&&I.mipmaps&&I.mipmaps.length>0){V.__webglFramebuffer=[];for(let ue=0;ue<I.mipmaps.length;ue++)V.__webglFramebuffer[ue]=s.createFramebuffer()}else V.__webglFramebuffer=s.createFramebuffer();if(se)if(i.drawBuffers){const ue=B.texture;for(let me=0,Te=ue.length;me<Te;me++){const Ve=n.get(ue[me]);Ve.__webglTexture===void 0&&(Ve.__webglTexture=s.createTexture(),a.memory.textures++)}}else console.warn("THREE.WebGLRenderer: WebGLMultipleRenderTargets can only be used with WebGL2 or WEBGL_draw_buffers extension.");if(o&&B.samples>0&&Ee(B)===!1){const ue=se?I:[I];V.__webglMultisampledFramebuffer=s.createFramebuffer(),V.__webglColorRenderbuffer=[],t.bindFramebuffer(s.FRAMEBUFFER,V.__webglMultisampledFramebuffer);for(let me=0;me<ue.length;me++){const Te=ue[me];V.__webglColorRenderbuffer[me]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,V.__webglColorRenderbuffer[me]);const Ve=r.convert(Te.format,Te.colorSpace),te=r.convert(Te.type),tt=_(Te.internalFormat,Ve,te,Te.colorSpace,B.isXRRenderTarget===!0),We=Be(B);s.renderbufferStorageMultisample(s.RENDERBUFFER,We,tt,B.width,B.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+me,s.RENDERBUFFER,V.__webglColorRenderbuffer[me])}s.bindRenderbuffer(s.RENDERBUFFER,null),B.depthBuffer&&(V.__webglDepthRenderbuffer=s.createRenderbuffer(),we(V.__webglDepthRenderbuffer,B,!0)),t.bindFramebuffer(s.FRAMEBUFFER,null)}}if(ee){t.bindTexture(s.TEXTURE_CUBE_MAP,ie.__webglTexture),W(s.TEXTURE_CUBE_MAP,I,Ce);for(let ue=0;ue<6;ue++)if(o&&I.mipmaps&&I.mipmaps.length>0)for(let me=0;me<I.mipmaps.length;me++)pe(V.__webglFramebuffer[ue][me],B,I,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+ue,me);else pe(V.__webglFramebuffer[ue],B,I,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+ue,0);b(I,Ce)&&E(s.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(se){const ue=B.texture;for(let me=0,Te=ue.length;me<Te;me++){const Ve=ue[me],te=n.get(Ve);t.bindTexture(s.TEXTURE_2D,te.__webglTexture),W(s.TEXTURE_2D,Ve,Ce),pe(V.__webglFramebuffer,B,Ve,s.COLOR_ATTACHMENT0+me,s.TEXTURE_2D,0),b(Ve,Ce)&&E(s.TEXTURE_2D)}t.unbindTexture()}else{let ue=s.TEXTURE_2D;if((B.isWebGL3DRenderTarget||B.isWebGLArrayRenderTarget)&&(o?ue=B.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY:console.error("THREE.WebGLTextures: THREE.Data3DTexture and THREE.DataArrayTexture only supported with WebGL2.")),t.bindTexture(ue,ie.__webglTexture),W(ue,I,Ce),o&&I.mipmaps&&I.mipmaps.length>0)for(let me=0;me<I.mipmaps.length;me++)pe(V.__webglFramebuffer[me],B,I,s.COLOR_ATTACHMENT0,ue,me);else pe(V.__webglFramebuffer,B,I,s.COLOR_ATTACHMENT0,ue,0);b(I,Ce)&&E(ue),t.unbindTexture()}B.depthBuffer&&De(B)}function zt(B){const I=g(B)||o,V=B.isWebGLMultipleRenderTargets===!0?B.texture:[B.texture];for(let ie=0,ee=V.length;ie<ee;ie++){const se=V[ie];if(b(se,I)){const Ce=B.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:s.TEXTURE_2D,ue=n.get(se).__webglTexture;t.bindTexture(Ce,ue),E(Ce),t.unbindTexture()}}}function Se(B){if(o&&B.samples>0&&Ee(B)===!1){const I=B.isWebGLMultipleRenderTargets?B.texture:[B.texture],V=B.width,ie=B.height;let ee=s.COLOR_BUFFER_BIT;const se=[],Ce=B.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,ue=n.get(B),me=B.isWebGLMultipleRenderTargets===!0;if(me)for(let Te=0;Te<I.length;Te++)t.bindFramebuffer(s.FRAMEBUFFER,ue.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Te,s.RENDERBUFFER,null),t.bindFramebuffer(s.FRAMEBUFFER,ue.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+Te,s.TEXTURE_2D,null,0);t.bindFramebuffer(s.READ_FRAMEBUFFER,ue.__webglMultisampledFramebuffer),t.bindFramebuffer(s.DRAW_FRAMEBUFFER,ue.__webglFramebuffer);for(let Te=0;Te<I.length;Te++){se.push(s.COLOR_ATTACHMENT0+Te),B.depthBuffer&&se.push(Ce);const Ve=ue.__ignoreDepthValues!==void 0?ue.__ignoreDepthValues:!1;if(Ve===!1&&(B.depthBuffer&&(ee|=s.DEPTH_BUFFER_BIT),B.stencilBuffer&&(ee|=s.STENCIL_BUFFER_BIT)),me&&s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,ue.__webglColorRenderbuffer[Te]),Ve===!0&&(s.invalidateFramebuffer(s.READ_FRAMEBUFFER,[Ce]),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[Ce])),me){const te=n.get(I[Te]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,te,0)}s.blitFramebuffer(0,0,V,ie,0,0,V,ie,ee,s.NEAREST),l&&s.invalidateFramebuffer(s.READ_FRAMEBUFFER,se)}if(t.bindFramebuffer(s.READ_FRAMEBUFFER,null),t.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),me)for(let Te=0;Te<I.length;Te++){t.bindFramebuffer(s.FRAMEBUFFER,ue.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Te,s.RENDERBUFFER,ue.__webglColorRenderbuffer[Te]);const Ve=n.get(I[Te]).__webglTexture;t.bindFramebuffer(s.FRAMEBUFFER,ue.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+Te,s.TEXTURE_2D,Ve,0)}t.bindFramebuffer(s.DRAW_FRAMEBUFFER,ue.__webglMultisampledFramebuffer)}}function Be(B){return Math.min(i.maxSamples,B.samples)}function Ee(B){const I=n.get(B);return o&&B.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&I.__useRenderToTexture!==!1}function At(B){const I=a.render.frame;h.get(B)!==I&&(h.set(B,I),B.update())}function Ge(B,I){const V=B.colorSpace,ie=B.format,ee=B.type;return B.isCompressedTexture===!0||B.isVideoTexture===!0||B.format===yo||V!==Et&&V!==rn&&(rt.getTransfer(V)===bt?o===!1?e.has("EXT_sRGB")===!0&&ie===Lt?(B.format=yo,B.minFilter=Xt,B.generateMipmaps=!1):I=lu.sRGBToLinear(I):(ie!==Lt||ee!==Pt)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",V)),I}this.allocateTextureUnit=T,this.resetTextureUnits=O,this.setTexture2D=Q,this.setTexture2DArray=X,this.setTexture3D=k,this.setTextureCube=G,this.rebindTextures=Je,this.setupRenderTarget=z,this.updateRenderTargetMipmap=zt,this.updateMultisampleRenderTarget=Se,this.setupDepthRenderbuffer=De,this.setupFrameBufferTexture=pe,this.useMultisampledRTT=Ee}function D0(s,e,t){const n=t.isWebGL2;function i(r,a=rn){let o;const c=rt.getTransfer(a);if(r===Pt)return s.UNSIGNED_BYTE;if(r===$h)return s.UNSIGNED_SHORT_4_4_4_4;if(r===eu)return s.UNSIGNED_SHORT_5_5_5_1;if(r===$d)return s.BYTE;if(r===ef)return s.SHORT;if(r===Uo)return s.UNSIGNED_SHORT;if(r===Zh)return s.INT;if(r===ii)return s.UNSIGNED_INT;if(r===hn)return s.FLOAT;if(r===qn)return n?s.HALF_FLOAT:(o=e.get("OES_texture_half_float"),o!==null?o.HALF_FLOAT_OES:null);if(r===tf)return s.ALPHA;if(r===Lt)return s.RGBA;if(r===nf)return s.LUMINANCE;if(r===sf)return s.LUMINANCE_ALPHA;if(r===wi)return s.DEPTH_COMPONENT;if(r===ds)return s.DEPTH_STENCIL;if(r===yo)return o=e.get("EXT_sRGB"),o!==null?o.SRGB_ALPHA_EXT:null;if(r===es)return s.RED;if(r===tu)return s.RED_INTEGER;if(r===ts)return s.RG;if(r===nu)return s.RG_INTEGER;if(r===iu)return s.RGBA_INTEGER;if(r===Fr||r===aa||r===oa||r===Ur)if(c===bt)if(o=e.get("WEBGL_compressed_texture_s3tc_srgb"),o!==null){if(r===Fr)return o.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(r===aa)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(r===oa)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(r===Ur)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(o=e.get("WEBGL_compressed_texture_s3tc"),o!==null){if(r===Fr)return o.COMPRESSED_RGB_S3TC_DXT1_EXT;if(r===aa)return o.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(r===oa)return o.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(r===Ur)return o.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(r===po||r===Ec||r===go||r===_c)if(o=e.get("WEBGL_compressed_texture_pvrtc"),o!==null){if(r===po)return o.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(r===Ec)return o.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(r===go)return o.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(r===_c)return o.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(r===No)return o=e.get("WEBGL_compressed_texture_etc1"),o!==null?o.COMPRESSED_RGB_ETC1_WEBGL:null;if(r===mo||r===bo)if(o=e.get("WEBGL_compressed_texture_etc"),o!==null){if(r===mo)return c===bt?o.COMPRESSED_SRGB8_ETC2:o.COMPRESSED_RGB8_ETC2;if(r===bo)return c===bt?o.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:o.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(r===Eo||r===xc||r===yc||r===vc||r===zr||r===Cc||r===Ic||r===Sc||r===Mc||r===wc||r===Bc||r===Tc||r===Rc||r===Dc)if(o=e.get("WEBGL_compressed_texture_astc"),o!==null){if(r===Eo)return c===bt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:o.COMPRESSED_RGBA_ASTC_4x4_KHR;if(r===xc)return c===bt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:o.COMPRESSED_RGBA_ASTC_5x4_KHR;if(r===yc)return c===bt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:o.COMPRESSED_RGBA_ASTC_5x5_KHR;if(r===vc)return c===bt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:o.COMPRESSED_RGBA_ASTC_6x5_KHR;if(r===zr)return c===bt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:o.COMPRESSED_RGBA_ASTC_6x6_KHR;if(r===Cc)return c===bt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:o.COMPRESSED_RGBA_ASTC_8x5_KHR;if(r===Ic)return c===bt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:o.COMPRESSED_RGBA_ASTC_8x6_KHR;if(r===Sc)return c===bt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:o.COMPRESSED_RGBA_ASTC_8x8_KHR;if(r===Mc)return c===bt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:o.COMPRESSED_RGBA_ASTC_10x5_KHR;if(r===wc)return c===bt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:o.COMPRESSED_RGBA_ASTC_10x6_KHR;if(r===Bc)return c===bt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:o.COMPRESSED_RGBA_ASTC_10x8_KHR;if(r===Tc)return c===bt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:o.COMPRESSED_RGBA_ASTC_10x10_KHR;if(r===Rc)return c===bt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:o.COMPRESSED_RGBA_ASTC_12x10_KHR;if(r===Dc)return c===bt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:o.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(r===Nr||r===Lc||r===Pc)if(o=e.get("EXT_texture_compression_bptc"),o!==null){if(r===Nr)return c===bt?o.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:o.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(r===Lc)return o.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(r===Pc)return o.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(r===rf||r===Fc||r===Uc||r===Nc)if(o=e.get("EXT_texture_compression_rgtc"),o!==null){if(r===Nr)return o.COMPRESSED_RED_RGTC1_EXT;if(r===Fc)return o.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(r===Uc)return o.COMPRESSED_RED_GREEN_RGTC2_EXT;if(r===Nc)return o.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return r===Mi?n?s.UNSIGNED_INT_24_8:(o=e.get("WEBGL_depth_texture"),o!==null?o.UNSIGNED_INT_24_8_WEBGL:null):s[r]!==void 0?s[r]:null}return{convert:i}}class L0 extends Yt{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class gt extends Ze{constructor(){super(),this.isGroup=!0,this.type="Group"}}const P0={type:"move"};class Ra{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new gt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new gt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new y,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new y),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new gt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new y,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new y),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let i=null,r=null,a=null;const o=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){a=!0;for(const m of e.hand.values()){const g=t.getJointPose(m,n),A=this._getHandJoint(l,m);g!==null&&(A.matrix.fromArray(g.transform.matrix),A.matrix.decompose(A.position,A.rotation,A.scale),A.matrixWorldNeedsUpdate=!0,A.jointRadius=g.radius),A.visible=g!==null}const h=l.joints["index-finger-tip"],u=l.joints["thumb-tip"],d=h.position.distanceTo(u.position),f=.02,p=.005;l.inputState.pinching&&d>f+p?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&d<=f-p&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1));o!==null&&(i=t.getPose(e.targetRaySpace,n),i===null&&r!==null&&(i=r),i!==null&&(o.matrix.fromArray(i.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,i.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(i.linearVelocity)):o.hasLinearVelocity=!1,i.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(i.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(P0)))}return o!==null&&(o.visible=i!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new gt;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}class F0 extends Di{constructor(e,t){super();const n=this;let i=null,r=1,a=null,o="local-floor",c=1,l=null,h=null,u=null,d=null,f=null,p=null;const m=t.getContextAttributes();let g=null,A=null;const b=[],E=[],_=new oe;let M=null;const v=new Yt;v.layers.enable(1),v.viewport=new at;const S=new Yt;S.layers.enable(2),S.viewport=new at;const D=[v,S],x=new L0;x.layers.enable(1),x.layers.enable(2);let C=null,R=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(W){let Z=b[W];return Z===void 0&&(Z=new Ra,b[W]=Z),Z.getTargetRaySpace()},this.getControllerGrip=function(W){let Z=b[W];return Z===void 0&&(Z=new Ra,b[W]=Z),Z.getGripSpace()},this.getHand=function(W){let Z=b[W];return Z===void 0&&(Z=new Ra,b[W]=Z),Z.getHandSpace()};function U(W){const Z=E.indexOf(W.inputSource);if(Z===-1)return;const ce=b[Z];ce!==void 0&&(ce.update(W.inputSource,W.frame,l||a),ce.dispatchEvent({type:W.type,data:W.inputSource}))}function O(){i.removeEventListener("select",U),i.removeEventListener("selectstart",U),i.removeEventListener("selectend",U),i.removeEventListener("squeeze",U),i.removeEventListener("squeezestart",U),i.removeEventListener("squeezeend",U),i.removeEventListener("end",O),i.removeEventListener("inputsourceschange",T);for(let W=0;W<b.length;W++){const Z=E[W];Z!==null&&(E[W]=null,b[W].disconnect(Z))}C=null,R=null,e.setRenderTarget(g),f=null,d=null,u=null,i=null,A=null,ne.stop(),n.isPresenting=!1,e.setPixelRatio(M),e.setSize(_.width,_.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(W){r=W,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(W){o=W,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||a},this.setReferenceSpace=function(W){l=W},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return u},this.getFrame=function(){return p},this.getSession=function(){return i},this.setSession=async function(W){if(i=W,i!==null){if(g=e.getRenderTarget(),i.addEventListener("select",U),i.addEventListener("selectstart",U),i.addEventListener("selectend",U),i.addEventListener("squeeze",U),i.addEventListener("squeezestart",U),i.addEventListener("squeezeend",U),i.addEventListener("end",O),i.addEventListener("inputsourceschange",T),m.xrCompatible!==!0&&await t.makeXRCompatible(),M=e.getPixelRatio(),e.getSize(_),i.renderState.layers===void 0||e.capabilities.isWebGL2===!1){const Z={antialias:i.renderState.layers===void 0?m.antialias:!0,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(i,t,Z),i.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),A=new li(f.framebufferWidth,f.framebufferHeight,{format:Lt,type:Pt,colorSpace:e.outputColorSpace,stencilBuffer:m.stencil})}else{let Z=null,ce=null,ge=null;m.depth&&(ge=m.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,Z=m.stencil?ds:wi,ce=m.stencil?Mi:ii);const pe={colorFormat:t.RGBA8,depthFormat:ge,scaleFactor:r};u=new XRWebGLBinding(i,t),d=u.createProjectionLayer(pe),i.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),A=new li(d.textureWidth,d.textureHeight,{format:Lt,type:Pt,depthTexture:new _u(d.textureWidth,d.textureHeight,ce,void 0,void 0,void 0,void 0,void 0,void 0,Z),stencilBuffer:m.stencil,colorSpace:e.outputColorSpace,samples:m.antialias?4:0});const we=e.properties.get(A);we.__ignoreDepthValues=d.ignoreDepthValues}A.isXRRenderTarget=!0,this.setFoveation(c),l=null,a=await i.requestReferenceSpace(o),ne.setContext(i),ne.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode};function T(W){for(let Z=0;Z<W.removed.length;Z++){const ce=W.removed[Z],ge=E.indexOf(ce);ge>=0&&(E[ge]=null,b[ge].disconnect(ce))}for(let Z=0;Z<W.added.length;Z++){const ce=W.added[Z];let ge=E.indexOf(ce);if(ge===-1){for(let we=0;we<b.length;we++)if(we>=E.length){E.push(ce),ge=we;break}else if(E[we]===null){E[we]=ce,ge=we;break}if(ge===-1)break}const pe=b[ge];pe&&pe.connect(ce)}}const F=new y,Q=new y;function X(W,Z,ce){F.setFromMatrixPosition(Z.matrixWorld),Q.setFromMatrixPosition(ce.matrixWorld);const ge=F.distanceTo(Q),pe=Z.projectionMatrix.elements,we=ce.projectionMatrix.elements,Qe=pe[14]/(pe[10]-1),De=pe[14]/(pe[10]+1),Je=(pe[9]+1)/pe[5],z=(pe[9]-1)/pe[5],zt=(pe[8]-1)/pe[0],Se=(we[8]+1)/we[0],Be=Qe*zt,Ee=Qe*Se,At=ge/(-zt+Se),Ge=At*-zt;Z.matrixWorld.decompose(W.position,W.quaternion,W.scale),W.translateX(Ge),W.translateZ(At),W.matrixWorld.compose(W.position,W.quaternion,W.scale),W.matrixWorldInverse.copy(W.matrixWorld).invert();const B=Qe+At,I=De+At,V=Be-Ge,ie=Ee+(ge-Ge),ee=Je*De/I*B,se=z*De/I*B;W.projectionMatrix.makePerspective(V,ie,ee,se,B,I),W.projectionMatrixInverse.copy(W.projectionMatrix).invert()}function k(W,Z){Z===null?W.matrixWorld.copy(W.matrix):W.matrixWorld.multiplyMatrices(Z.matrixWorld,W.matrix),W.matrixWorldInverse.copy(W.matrixWorld).invert()}this.updateCamera=function(W){if(i===null)return;x.near=S.near=v.near=W.near,x.far=S.far=v.far=W.far,(C!==x.near||R!==x.far)&&(i.updateRenderState({depthNear:x.near,depthFar:x.far}),C=x.near,R=x.far);const Z=W.parent,ce=x.cameras;k(x,Z);for(let ge=0;ge<ce.length;ge++)k(ce[ge],Z);ce.length===2?X(x,v,S):x.projectionMatrix.copy(v.projectionMatrix),G(W,x,Z)};function G(W,Z,ce){ce===null?W.matrix.copy(Z.matrixWorld):(W.matrix.copy(ce.matrixWorld),W.matrix.invert(),W.matrix.multiply(Z.matrixWorld)),W.matrix.decompose(W.position,W.quaternion,W.scale),W.updateMatrixWorld(!0),W.projectionMatrix.copy(Z.projectionMatrix),W.projectionMatrixInverse.copy(Z.projectionMatrixInverse),W.isPerspectiveCamera&&(W.fov=As*2*Math.atan(1/W.projectionMatrix.elements[5]),W.zoom=1)}this.getCamera=function(){return x},this.getFoveation=function(){if(!(d===null&&f===null))return c},this.setFoveation=function(W){c=W,d!==null&&(d.fixedFoveation=W),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=W)};let j=null;function J(W,Z){if(h=Z.getViewerPose(l||a),p=Z,h!==null){const ce=h.views;f!==null&&(e.setRenderTargetFramebuffer(A,f.framebuffer),e.setRenderTarget(A));let ge=!1;ce.length!==x.cameras.length&&(x.cameras.length=0,ge=!0);for(let pe=0;pe<ce.length;pe++){const we=ce[pe];let Qe=null;if(f!==null)Qe=f.getViewport(we);else{const Je=u.getViewSubImage(d,we);Qe=Je.viewport,pe===0&&(e.setRenderTargetTextures(A,Je.colorTexture,d.ignoreDepthValues?void 0:Je.depthStencilTexture),e.setRenderTarget(A))}let De=D[pe];De===void 0&&(De=new Yt,De.layers.enable(pe),De.viewport=new at,D[pe]=De),De.matrix.fromArray(we.transform.matrix),De.matrix.decompose(De.position,De.quaternion,De.scale),De.projectionMatrix.fromArray(we.projectionMatrix),De.projectionMatrixInverse.copy(De.projectionMatrix).invert(),De.viewport.set(Qe.x,Qe.y,Qe.width,Qe.height),pe===0&&(x.matrix.copy(De.matrix),x.matrix.decompose(x.position,x.quaternion,x.scale)),ge===!0&&x.cameras.push(De)}}for(let ce=0;ce<b.length;ce++){const ge=E[ce],pe=b[ce];ge!==null&&pe!==void 0&&pe.update(ge,Z,l||a)}j&&j(W,Z),Z.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:Z}),p=null}const ne=new Eu;ne.setAnimationLoop(J),this.setAnimationLoop=function(W){j=W},this.dispose=function(){}}}function U0(s,e){function t(g,A){g.matrixAutoUpdate===!0&&g.updateMatrix(),A.value.copy(g.matrix)}function n(g,A){A.color.getRGB(g.fogColor.value,gu(s)),A.isFog?(g.fogNear.value=A.near,g.fogFar.value=A.far):A.isFogExp2&&(g.fogDensity.value=A.density)}function i(g,A,b,E,_){A.isMeshBasicMaterial||A.isMeshLambertMaterial?r(g,A):A.isMeshToonMaterial?(r(g,A),u(g,A)):A.isMeshPhongMaterial?(r(g,A),h(g,A)):A.isMeshStandardMaterial?(r(g,A),d(g,A),A.isMeshPhysicalMaterial&&f(g,A,_)):A.isMeshMatcapMaterial?(r(g,A),p(g,A)):A.isMeshDepthMaterial?r(g,A):A.isMeshDistanceMaterial?(r(g,A),m(g,A)):A.isMeshNormalMaterial?r(g,A):A.isLineBasicMaterial?(a(g,A),A.isLineDashedMaterial&&o(g,A)):A.isPointsMaterial?c(g,A,b,E):A.isSpriteMaterial?l(g,A):A.isShadowMaterial?(g.color.value.copy(A.color),g.opacity.value=A.opacity):A.isShaderMaterial&&(A.uniformsNeedUpdate=!1)}function r(g,A){g.opacity.value=A.opacity,A.color&&g.diffuse.value.copy(A.color),A.emissive&&g.emissive.value.copy(A.emissive).multiplyScalar(A.emissiveIntensity),A.map&&(g.map.value=A.map,t(A.map,g.mapTransform)),A.alphaMap&&(g.alphaMap.value=A.alphaMap,t(A.alphaMap,g.alphaMapTransform)),A.bumpMap&&(g.bumpMap.value=A.bumpMap,t(A.bumpMap,g.bumpMapTransform),g.bumpScale.value=A.bumpScale,A.side===$t&&(g.bumpScale.value*=-1)),A.normalMap&&(g.normalMap.value=A.normalMap,t(A.normalMap,g.normalMapTransform),g.normalScale.value.copy(A.normalScale),A.side===$t&&g.normalScale.value.negate()),A.displacementMap&&(g.displacementMap.value=A.displacementMap,t(A.displacementMap,g.displacementMapTransform),g.displacementScale.value=A.displacementScale,g.displacementBias.value=A.displacementBias),A.emissiveMap&&(g.emissiveMap.value=A.emissiveMap,t(A.emissiveMap,g.emissiveMapTransform)),A.specularMap&&(g.specularMap.value=A.specularMap,t(A.specularMap,g.specularMapTransform)),A.alphaTest>0&&(g.alphaTest.value=A.alphaTest);const b=e.get(A).envMap;if(b&&(g.envMap.value=b,g.flipEnvMap.value=b.isCubeTexture&&b.isRenderTargetTexture===!1?-1:1,g.reflectivity.value=A.reflectivity,g.ior.value=A.ior,g.refractionRatio.value=A.refractionRatio),A.lightMap){g.lightMap.value=A.lightMap;const E=s._useLegacyLights===!0?Math.PI:1;g.lightMapIntensity.value=A.lightMapIntensity*E,t(A.lightMap,g.lightMapTransform)}A.aoMap&&(g.aoMap.value=A.aoMap,g.aoMapIntensity.value=A.aoMapIntensity,t(A.aoMap,g.aoMapTransform))}function a(g,A){g.diffuse.value.copy(A.color),g.opacity.value=A.opacity,A.map&&(g.map.value=A.map,t(A.map,g.mapTransform))}function o(g,A){g.dashSize.value=A.dashSize,g.totalSize.value=A.dashSize+A.gapSize,g.scale.value=A.scale}function c(g,A,b,E){g.diffuse.value.copy(A.color),g.opacity.value=A.opacity,g.size.value=A.size*b,g.scale.value=E*.5,A.map&&(g.map.value=A.map,t(A.map,g.uvTransform)),A.alphaMap&&(g.alphaMap.value=A.alphaMap,t(A.alphaMap,g.alphaMapTransform)),A.alphaTest>0&&(g.alphaTest.value=A.alphaTest)}function l(g,A){g.diffuse.value.copy(A.color),g.opacity.value=A.opacity,g.rotation.value=A.rotation,A.map&&(g.map.value=A.map,t(A.map,g.mapTransform)),A.alphaMap&&(g.alphaMap.value=A.alphaMap,t(A.alphaMap,g.alphaMapTransform)),A.alphaTest>0&&(g.alphaTest.value=A.alphaTest)}function h(g,A){g.specular.value.copy(A.specular),g.shininess.value=Math.max(A.shininess,1e-4)}function u(g,A){A.gradientMap&&(g.gradientMap.value=A.gradientMap)}function d(g,A){g.metalness.value=A.metalness,A.metalnessMap&&(g.metalnessMap.value=A.metalnessMap,t(A.metalnessMap,g.metalnessMapTransform)),g.roughness.value=A.roughness,A.roughnessMap&&(g.roughnessMap.value=A.roughnessMap,t(A.roughnessMap,g.roughnessMapTransform)),e.get(A).envMap&&(g.envMapIntensity.value=A.envMapIntensity)}function f(g,A,b){g.ior.value=A.ior,A.sheen>0&&(g.sheenColor.value.copy(A.sheenColor).multiplyScalar(A.sheen),g.sheenRoughness.value=A.sheenRoughness,A.sheenColorMap&&(g.sheenColorMap.value=A.sheenColorMap,t(A.sheenColorMap,g.sheenColorMapTransform)),A.sheenRoughnessMap&&(g.sheenRoughnessMap.value=A.sheenRoughnessMap,t(A.sheenRoughnessMap,g.sheenRoughnessMapTransform))),A.clearcoat>0&&(g.clearcoat.value=A.clearcoat,g.clearcoatRoughness.value=A.clearcoatRoughness,A.clearcoatMap&&(g.clearcoatMap.value=A.clearcoatMap,t(A.clearcoatMap,g.clearcoatMapTransform)),A.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=A.clearcoatRoughnessMap,t(A.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),A.clearcoatNormalMap&&(g.clearcoatNormalMap.value=A.clearcoatNormalMap,t(A.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(A.clearcoatNormalScale),A.side===$t&&g.clearcoatNormalScale.value.negate())),A.iridescence>0&&(g.iridescence.value=A.iridescence,g.iridescenceIOR.value=A.iridescenceIOR,g.iridescenceThicknessMinimum.value=A.iridescenceThicknessRange[0],g.iridescenceThicknessMaximum.value=A.iridescenceThicknessRange[1],A.iridescenceMap&&(g.iridescenceMap.value=A.iridescenceMap,t(A.iridescenceMap,g.iridescenceMapTransform)),A.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=A.iridescenceThicknessMap,t(A.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),A.transmission>0&&(g.transmission.value=A.transmission,g.transmissionSamplerMap.value=b.texture,g.transmissionSamplerSize.value.set(b.width,b.height),A.transmissionMap&&(g.transmissionMap.value=A.transmissionMap,t(A.transmissionMap,g.transmissionMapTransform)),g.thickness.value=A.thickness,A.thicknessMap&&(g.thicknessMap.value=A.thicknessMap,t(A.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=A.attenuationDistance,g.attenuationColor.value.copy(A.attenuationColor)),A.anisotropy>0&&(g.anisotropyVector.value.set(A.anisotropy*Math.cos(A.anisotropyRotation),A.anisotropy*Math.sin(A.anisotropyRotation)),A.anisotropyMap&&(g.anisotropyMap.value=A.anisotropyMap,t(A.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=A.specularIntensity,g.specularColor.value.copy(A.specularColor),A.specularColorMap&&(g.specularColorMap.value=A.specularColorMap,t(A.specularColorMap,g.specularColorMapTransform)),A.specularIntensityMap&&(g.specularIntensityMap.value=A.specularIntensityMap,t(A.specularIntensityMap,g.specularIntensityMapTransform))}function p(g,A){A.matcap&&(g.matcap.value=A.matcap)}function m(g,A){const b=e.get(A).light;g.referencePosition.value.setFromMatrixPosition(b.matrixWorld),g.nearDistance.value=b.shadow.camera.near,g.farDistance.value=b.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function N0(s,e,t,n){let i={},r={},a=[];const o=t.isWebGL2?s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS):0;function c(b,E){const _=E.program;n.uniformBlockBinding(b,_)}function l(b,E){let _=i[b.id];_===void 0&&(p(b),_=h(b),i[b.id]=_,b.addEventListener("dispose",g));const M=E.program;n.updateUBOMapping(b,M);const v=e.render.frame;r[b.id]!==v&&(d(b),r[b.id]=v)}function h(b){const E=u();b.__bindingPointIndex=E;const _=s.createBuffer(),M=b.__size,v=b.usage;return s.bindBuffer(s.UNIFORM_BUFFER,_),s.bufferData(s.UNIFORM_BUFFER,M,v),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,E,_),_}function u(){for(let b=0;b<o;b++)if(a.indexOf(b)===-1)return a.push(b),b;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(b){const E=i[b.id],_=b.uniforms,M=b.__cache;s.bindBuffer(s.UNIFORM_BUFFER,E);for(let v=0,S=_.length;v<S;v++){const D=Array.isArray(_[v])?_[v]:[_[v]];for(let x=0,C=D.length;x<C;x++){const R=D[x];if(f(R,v,x,M)===!0){const U=R.__offset,O=Array.isArray(R.value)?R.value:[R.value];let T=0;for(let F=0;F<O.length;F++){const Q=O[F],X=m(Q);typeof Q=="number"||typeof Q=="boolean"?(R.__data[0]=Q,s.bufferSubData(s.UNIFORM_BUFFER,U+T,R.__data)):Q.isMatrix3?(R.__data[0]=Q.elements[0],R.__data[1]=Q.elements[1],R.__data[2]=Q.elements[2],R.__data[3]=0,R.__data[4]=Q.elements[3],R.__data[5]=Q.elements[4],R.__data[6]=Q.elements[5],R.__data[7]=0,R.__data[8]=Q.elements[6],R.__data[9]=Q.elements[7],R.__data[10]=Q.elements[8],R.__data[11]=0):(Q.toArray(R.__data,T),T+=X.storage/Float32Array.BYTES_PER_ELEMENT)}s.bufferSubData(s.UNIFORM_BUFFER,U,R.__data)}}}s.bindBuffer(s.UNIFORM_BUFFER,null)}function f(b,E,_,M){const v=b.value,S=E+"_"+_;if(M[S]===void 0)return typeof v=="number"||typeof v=="boolean"?M[S]=v:M[S]=v.clone(),!0;{const D=M[S];if(typeof v=="number"||typeof v=="boolean"){if(D!==v)return M[S]=v,!0}else if(D.equals(v)===!1)return D.copy(v),!0}return!1}function p(b){const E=b.uniforms;let _=0;const M=16;for(let S=0,D=E.length;S<D;S++){const x=Array.isArray(E[S])?E[S]:[E[S]];for(let C=0,R=x.length;C<R;C++){const U=x[C],O=Array.isArray(U.value)?U.value:[U.value];for(let T=0,F=O.length;T<F;T++){const Q=O[T],X=m(Q),k=_%M;k!==0&&M-k<X.boundary&&(_+=M-k),U.__data=new Float32Array(X.storage/Float32Array.BYTES_PER_ELEMENT),U.__offset=_,_+=X.storage}}}const v=_%M;return v>0&&(_+=M-v),b.__size=_,b.__cache={},this}function m(b){const E={boundary:0,storage:0};return typeof b=="number"||typeof b=="boolean"?(E.boundary=4,E.storage=4):b.isVector2?(E.boundary=8,E.storage=8):b.isVector3||b.isColor?(E.boundary=16,E.storage=12):b.isVector4?(E.boundary=16,E.storage=16):b.isMatrix3?(E.boundary=48,E.storage=48):b.isMatrix4?(E.boundary=64,E.storage=64):b.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",b),E}function g(b){const E=b.target;E.removeEventListener("dispose",g);const _=a.indexOf(E.__bindingPointIndex);a.splice(_,1),s.deleteBuffer(i[E.id]),delete i[E.id],delete r[E.id]}function A(){for(const b in i)s.deleteBuffer(i[b]);a=[],i={},r={}}return{bind:c,update:l,dispose:A}}class Su{constructor(e={}){const{canvas:t=Ff(),context:n=null,depth:i=!0,stencil:r=!0,alpha:a=!1,antialias:o=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1}=e;this.isWebGLRenderer=!0;let d;n!==null?d=n.getContextAttributes().alpha:d=a;const f=new Uint32Array(4),p=new Int32Array(4);let m=null,g=null;const A=[],b=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=dt,this._useLegacyLights=!1,this.toneMapping=ai,this.toneMappingExposure=1;const E=this;let _=!1,M=0,v=0,S=null,D=-1,x=null;const C=new at,R=new at;let U=null;const O=new Ae(0);let T=0,F=t.width,Q=t.height,X=1,k=null,G=null;const j=new at(0,0,F,Q),J=new at(0,0,F,Q);let ne=!1;const W=new Go;let Z=!1,ce=!1,ge=null;const pe=new Fe,we=new oe,Qe=new y,De={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};function Je(){return S===null?X:1}let z=n;function zt(w,N){for(let q=0;q<w.length;q++){const Y=w[q],H=t.getContext(Y,N);if(H!==null)return H}return null}try{const w={alpha:!0,depth:i,stencil:r,antialias:o,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Fo}`),t.addEventListener("webglcontextlost",ae,!1),t.addEventListener("webglcontextrestored",P,!1),t.addEventListener("webglcontextcreationerror",le,!1),z===null){const N=["webgl2","webgl","experimental-webgl"];if(E.isWebGL1Renderer===!0&&N.shift(),z=zt(N,w),z===null)throw zt(N)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}typeof WebGLRenderingContext<"u"&&z instanceof WebGLRenderingContext&&console.warn("THREE.WebGLRenderer: WebGL 1 support was deprecated in r153 and will be removed in r163."),z.getShaderPrecisionFormat===void 0&&(z.getShaderPrecisionFormat=function(){return{rangeMin:1,rangeMax:1,precision:1}})}catch(w){throw console.error("THREE.WebGLRenderer: "+w.message),w}let Se,Be,Ee,At,Ge,B,I,V,ie,ee,se,Ce,ue,me,Te,Ve,te,tt,We,Le,ye,be,Oe,nt;function _t(){Se=new Xg(z),Be=new Gg(z,Se,e),Se.init(Be),be=new D0(z,Se,Be),Ee=new T0(z,Se,Be),At=new jg(z),Ge=new g0,B=new R0(z,Se,Ee,Ge,Be,be,At),I=new zg(E),V=new qg(E),ie=new sA(z,Be),Oe=new Og(z,Se,ie,Be),ee=new Yg(z,ie,At,Oe),se=new em(z,ee,ie,At),We=new $g(z,Be,B),Ve=new Hg(Ge),Ce=new p0(E,I,V,Se,Be,Oe,Ve),ue=new U0(E,Ge),me=new b0,Te=new C0(Se,Be),tt=new Qg(E,I,V,Ee,se,d,c),te=new B0(E,se,Be),nt=new N0(z,At,Be,Ee),Le=new kg(z,Se,At,Be),ye=new Kg(z,Se,At,Be),At.programs=Ce.programs,E.capabilities=Be,E.extensions=Se,E.properties=Ge,E.renderLists=me,E.shadowMap=te,E.state=Ee,E.info=At}_t();const qe=new F0(E,z);this.xr=qe,this.getContext=function(){return z},this.getContextAttributes=function(){return z.getContextAttributes()},this.forceContextLoss=function(){const w=Se.get("WEBGL_lose_context");w&&w.loseContext()},this.forceContextRestore=function(){const w=Se.get("WEBGL_lose_context");w&&w.restoreContext()},this.getPixelRatio=function(){return X},this.setPixelRatio=function(w){w!==void 0&&(X=w,this.setSize(F,Q,!1))},this.getSize=function(w){return w.set(F,Q)},this.setSize=function(w,N,q=!0){if(qe.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}F=w,Q=N,t.width=Math.floor(w*X),t.height=Math.floor(N*X),q===!0&&(t.style.width=w+"px",t.style.height=N+"px"),this.setViewport(0,0,w,N)},this.getDrawingBufferSize=function(w){return w.set(F*X,Q*X).floor()},this.setDrawingBufferSize=function(w,N,q){F=w,Q=N,X=q,t.width=Math.floor(w*q),t.height=Math.floor(N*q),this.setViewport(0,0,w,N)},this.getCurrentViewport=function(w){return w.copy(C)},this.getViewport=function(w){return w.copy(j)},this.setViewport=function(w,N,q,Y){w.isVector4?j.set(w.x,w.y,w.z,w.w):j.set(w,N,q,Y),Ee.viewport(C.copy(j).multiplyScalar(X).floor())},this.getScissor=function(w){return w.copy(J)},this.setScissor=function(w,N,q,Y){w.isVector4?J.set(w.x,w.y,w.z,w.w):J.set(w,N,q,Y),Ee.scissor(R.copy(J).multiplyScalar(X).floor())},this.getScissorTest=function(){return ne},this.setScissorTest=function(w){Ee.setScissorTest(ne=w)},this.setOpaqueSort=function(w){k=w},this.setTransparentSort=function(w){G=w},this.getClearColor=function(w){return w.copy(tt.getClearColor())},this.setClearColor=function(){tt.setClearColor.apply(tt,arguments)},this.getClearAlpha=function(){return tt.getClearAlpha()},this.setClearAlpha=function(){tt.setClearAlpha.apply(tt,arguments)},this.clear=function(w=!0,N=!0,q=!0){let Y=0;if(w){let H=!1;if(S!==null){const fe=S.texture.format;H=fe===iu||fe===nu||fe===tu}if(H){const fe=S.texture.type,ve=fe===Pt||fe===ii||fe===Uo||fe===Mi||fe===$h||fe===eu,Me=tt.getClearColor(),Re=tt.getClearAlpha(),ze=Me.r,Pe=Me.g,Ne=Me.b;ve?(f[0]=ze,f[1]=Pe,f[2]=Ne,f[3]=Re,z.clearBufferuiv(z.COLOR,0,f)):(p[0]=ze,p[1]=Pe,p[2]=Ne,p[3]=Re,z.clearBufferiv(z.COLOR,0,p))}else Y|=z.COLOR_BUFFER_BIT}N&&(Y|=z.DEPTH_BUFFER_BIT),q&&(Y|=z.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),z.clear(Y)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",ae,!1),t.removeEventListener("webglcontextrestored",P,!1),t.removeEventListener("webglcontextcreationerror",le,!1),me.dispose(),Te.dispose(),Ge.dispose(),I.dispose(),V.dispose(),se.dispose(),Oe.dispose(),nt.dispose(),Ce.dispose(),qe.dispose(),qe.removeEventListener("sessionstart",xe),qe.removeEventListener("sessionend",He),ge&&(ge.dispose(),ge=null),$e.stop()};function ae(w){w.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),_=!0}function P(){console.log("THREE.WebGLRenderer: Context Restored."),_=!1;const w=At.autoReset,N=te.enabled,q=te.autoUpdate,Y=te.needsUpdate,H=te.type;_t(),At.autoReset=w,te.enabled=N,te.autoUpdate=q,te.needsUpdate=Y,te.type=H}function le(w){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",w.statusMessage)}function he(w){const N=w.target;N.removeEventListener("dispose",he),L(N)}function L(w){K(w),Ge.remove(w)}function K(w){const N=Ge.get(w).programs;N!==void 0&&(N.forEach(function(q){Ce.releaseProgram(q)}),w.isShaderMaterial&&Ce.releaseShaderCache(w))}this.renderBufferDirect=function(w,N,q,Y,H,fe){N===null&&(N=De);const ve=H.isMesh&&H.matrixWorld.determinant()<0,Me=ui(w,N,q,Y,H);Ee.setMaterial(Y,ve);let Re=q.index,ze=1;if(Y.wireframe===!0){if(Re=ee.getWireframeAttribute(q),Re===void 0)return;ze=2}const Pe=q.drawRange,Ne=q.attributes.position;let mt=Pe.start*ze,wt=(Pe.start+Pe.count)*ze;fe!==null&&(mt=Math.max(mt,fe.start*ze),wt=Math.min(wt,(fe.start+fe.count)*ze)),Re!==null?(mt=Math.max(mt,0),wt=Math.min(wt,Re.count)):Ne!=null&&(mt=Math.max(mt,0),wt=Math.min(wt,Ne.count));const pt=wt-mt;if(pt<0||pt===1/0)return;Oe.setup(H,Y,Me,q,Re);let tn,lt=Le;if(Re!==null&&(tn=ie.get(Re),lt=ye,lt.setIndex(tn)),H.isMesh)Y.wireframe===!0?(Ee.setLineWidth(Y.wireframeLinewidth*Je()),lt.setMode(z.LINES)):lt.setMode(z.TRIANGLES);else if(H.isLine){let Ue=Y.linewidth;Ue===void 0&&(Ue=1),Ee.setLineWidth(Ue*Je()),H.isLineSegments?lt.setMode(z.LINES):H.isLineLoop?lt.setMode(z.LINE_LOOP):lt.setMode(z.LINE_STRIP)}else H.isPoints?lt.setMode(z.POINTS):H.isSprite&&lt.setMode(z.TRIANGLES);if(H.isBatchedMesh)lt.renderMultiDraw(H._multiDrawStarts,H._multiDrawCounts,H._multiDrawCount);else if(H.isInstancedMesh)lt.renderInstances(mt,pt,H.count);else if(q.isInstancedBufferGeometry){const Ue=q._maxInstanceCount!==void 0?q._maxInstanceCount:1/0,ys=Math.min(q.instanceCount,Ue);lt.renderInstances(mt,pt,ys)}else lt.render(mt,pt)};function $(w,N,q){w.transparent===!0&&w.side===sn&&w.forceSinglePass===!1?(w.side=$t,w.needsUpdate=!0,xt(w,N,q),w.side=Rn,w.needsUpdate=!0,xt(w,N,q),w.side=sn):xt(w,N,q)}this.compile=function(w,N,q=null){q===null&&(q=w),g=Te.get(q),g.init(),b.push(g),q.traverseVisible(function(H){H.isLight&&H.layers.test(N.layers)&&(g.pushLight(H),H.castShadow&&g.pushShadow(H))}),w!==q&&w.traverseVisible(function(H){H.isLight&&H.layers.test(N.layers)&&(g.pushLight(H),H.castShadow&&g.pushShadow(H))}),g.setupLights(E._useLegacyLights);const Y=new Set;return w.traverse(function(H){const fe=H.material;if(fe)if(Array.isArray(fe))for(let ve=0;ve<fe.length;ve++){const Me=fe[ve];$(Me,q,H),Y.add(Me)}else $(fe,q,H),Y.add(fe)}),b.pop(),g=null,Y},this.compileAsync=function(w,N,q=null){const Y=this.compile(w,N,q);return new Promise(H=>{function fe(){if(Y.forEach(function(ve){Ge.get(ve).currentProgram.isReady()&&Y.delete(ve)}),Y.size===0){H(w);return}setTimeout(fe,10)}Se.get("KHR_parallel_shader_compile")!==null?fe():setTimeout(fe,10)})};let de=null;function ke(w){de&&de(w)}function xe(){$e.stop()}function He(){$e.start()}const $e=new Eu;$e.setAnimationLoop(ke),typeof self<"u"&&$e.setContext(self),this.setAnimationLoop=function(w){de=w,qe.setAnimationLoop(w),w===null?$e.stop():$e.start()},qe.addEventListener("sessionstart",xe),qe.addEventListener("sessionend",He),this.render=function(w,N){if(N!==void 0&&N.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(_===!0)return;w.matrixWorldAutoUpdate===!0&&w.updateMatrixWorld(),N.parent===null&&N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),qe.enabled===!0&&qe.isPresenting===!0&&(qe.cameraAutoUpdate===!0&&qe.updateCamera(N),N=qe.getCamera()),w.isScene===!0&&w.onBeforeRender(E,w,N,S),g=Te.get(w,b.length),g.init(),b.push(g),pe.multiplyMatrices(N.projectionMatrix,N.matrixWorldInverse),W.setFromProjectionMatrix(pe),ce=this.localClippingEnabled,Z=Ve.init(this.clippingPlanes,ce),m=me.get(w,A.length),m.init(),A.push(m),it(w,N,0,E.sortObjects),m.finish(),E.sortObjects===!0&&m.sort(k,G),this.info.render.frame++,Z===!0&&Ve.beginShadows();const q=g.state.shadowsArray;if(te.render(q,w,N),Z===!0&&Ve.endShadows(),this.info.autoReset===!0&&this.info.reset(),tt.render(m,w),g.setupLights(E._useLegacyLights),N.isArrayCamera){const Y=N.cameras;for(let H=0,fe=Y.length;H<fe;H++){const ve=Y[H];ot(m,w,ve,ve.viewport)}}else ot(m,w,N);S!==null&&(B.updateMultisampleRenderTarget(S),B.updateRenderTargetMipmap(S)),w.isScene===!0&&w.onAfterRender(E,w,N),Oe.resetDefaultState(),D=-1,x=null,b.pop(),b.length>0?g=b[b.length-1]:g=null,A.pop(),A.length>0?m=A[A.length-1]:m=null};function it(w,N,q,Y){if(w.visible===!1)return;if(w.layers.test(N.layers)){if(w.isGroup)q=w.renderOrder;else if(w.isLOD)w.autoUpdate===!0&&w.update(N);else if(w.isLight)g.pushLight(w),w.castShadow&&g.pushShadow(w);else if(w.isSprite){if(!w.frustumCulled||W.intersectsSprite(w)){Y&&Qe.setFromMatrixPosition(w.matrixWorld).applyMatrix4(pe);const ve=se.update(w),Me=w.material;Me.visible&&m.push(w,ve,Me,q,Qe.z,null)}}else if((w.isMesh||w.isLine||w.isPoints)&&(!w.frustumCulled||W.intersectsObject(w))){const ve=se.update(w),Me=w.material;if(Y&&(w.boundingSphere!==void 0?(w.boundingSphere===null&&w.computeBoundingSphere(),Qe.copy(w.boundingSphere.center)):(ve.boundingSphere===null&&ve.computeBoundingSphere(),Qe.copy(ve.boundingSphere.center)),Qe.applyMatrix4(w.matrixWorld).applyMatrix4(pe)),Array.isArray(Me)){const Re=ve.groups;for(let ze=0,Pe=Re.length;ze<Pe;ze++){const Ne=Re[ze],mt=Me[Ne.materialIndex];mt&&mt.visible&&m.push(w,ve,mt,q,Qe.z,Ne)}}else Me.visible&&m.push(w,ve,Me,q,Qe.z,null)}}const fe=w.children;for(let ve=0,Me=fe.length;ve<Me;ve++)it(fe[ve],N,q,Y)}function ot(w,N,q,Y){const H=w.opaque,fe=w.transmissive,ve=w.transparent;g.setupLightsView(q),Z===!0&&Ve.setGlobalState(E.clippingPlanes,q),fe.length>0&&Mt(H,fe,N,q),Y&&Ee.viewport(C.copy(Y)),H.length>0&&et(H,N,q),fe.length>0&&et(fe,N,q),ve.length>0&&et(ve,N,q),Ee.buffers.depth.setTest(!0),Ee.buffers.depth.setMask(!0),Ee.buffers.color.setMask(!0),Ee.setPolygonOffset(!1)}function Mt(w,N,q,Y){if((q.isScene===!0?q.overrideMaterial:null)!==null)return;const fe=Be.isWebGL2;ge===null&&(ge=new li(1,1,{generateMipmaps:!0,type:Se.has("EXT_color_buffer_half_float")?qn:Pt,minFilter:ci,samples:fe?4:0})),E.getDrawingBufferSize(we),fe?ge.setSize(we.x,we.y):ge.setSize(Kr(we.x),Kr(we.y));const ve=E.getRenderTarget();E.setRenderTarget(ge),E.getClearColor(O),T=E.getClearAlpha(),T<1&&E.setClearColor(16777215,.5),E.clear();const Me=E.toneMapping;E.toneMapping=ai,et(w,q,Y),B.updateMultisampleRenderTarget(ge),B.updateRenderTargetMipmap(ge);let Re=!1;for(let ze=0,Pe=N.length;ze<Pe;ze++){const Ne=N[ze],mt=Ne.object,wt=Ne.geometry,pt=Ne.material,tn=Ne.group;if(pt.side===sn&&mt.layers.test(Y.layers)){const lt=pt.side;pt.side=$t,pt.needsUpdate=!0,Ot(mt,q,Y,wt,pt,tn),pt.side=lt,pt.needsUpdate=!0,Re=!0}}Re===!0&&(B.updateMultisampleRenderTarget(ge),B.updateRenderTargetMipmap(ge)),E.setRenderTarget(ve),E.setClearColor(O,T),E.toneMapping=Me}function et(w,N,q){const Y=N.isScene===!0?N.overrideMaterial:null;for(let H=0,fe=w.length;H<fe;H++){const ve=w[H],Me=ve.object,Re=ve.geometry,ze=Y===null?ve.material:Y,Pe=ve.group;Me.layers.test(q.layers)&&Ot(Me,N,q,Re,ze,Pe)}}function Ot(w,N,q,Y,H,fe){w.onBeforeRender(E,N,q,Y,H,fe),w.modelViewMatrix.multiplyMatrices(q.matrixWorldInverse,w.matrixWorld),w.normalMatrix.getNormalMatrix(w.modelViewMatrix),H.onBeforeRender(E,N,q,Y,w,fe),H.transparent===!0&&H.side===sn&&H.forceSinglePass===!1?(H.side=$t,H.needsUpdate=!0,E.renderBufferDirect(q,N,Y,H,w,fe),H.side=Rn,H.needsUpdate=!0,E.renderBufferDirect(q,N,Y,H,w,fe),H.side=sn):E.renderBufferDirect(q,N,Y,H,w,fe),w.onAfterRender(E,N,q,Y,H,fe)}function xt(w,N,q){N.isScene!==!0&&(N=De);const Y=Ge.get(w),H=g.state.lights,fe=g.state.shadowsArray,ve=H.state.version,Me=Ce.getParameters(w,H.state,fe,N,q),Re=Ce.getProgramCacheKey(Me);let ze=Y.programs;Y.environment=w.isMeshStandardMaterial?N.environment:null,Y.fog=N.fog,Y.envMap=(w.isMeshStandardMaterial?V:I).get(w.envMap||Y.environment),ze===void 0&&(w.addEventListener("dispose",he),ze=new Map,Y.programs=ze);let Pe=ze.get(Re);if(Pe!==void 0){if(Y.currentProgram===Pe&&Y.lightsStateVersion===ve)return St(w,Me),Pe}else Me.uniforms=Ce.getUniforms(w),w.onBuild(q,Me,E),w.onBeforeCompile(Me,E),Pe=Ce.acquireProgram(Me,Re),ze.set(Re,Pe),Y.uniforms=Me.uniforms;const Ne=Y.uniforms;return(!w.isShaderMaterial&&!w.isRawShaderMaterial||w.clipping===!0)&&(Ne.clippingPlanes=Ve.uniform),St(w,Me),Y.needsLights=Ks(w),Y.lightsStateVersion=ve,Y.needsLights&&(Ne.ambientLightColor.value=H.state.ambient,Ne.lightProbe.value=H.state.probe,Ne.directionalLights.value=H.state.directional,Ne.directionalLightShadows.value=H.state.directionalShadow,Ne.spotLights.value=H.state.spot,Ne.spotLightShadows.value=H.state.spotShadow,Ne.rectAreaLights.value=H.state.rectArea,Ne.ltc_1.value=H.state.rectAreaLTC1,Ne.ltc_2.value=H.state.rectAreaLTC2,Ne.pointLights.value=H.state.point,Ne.pointLightShadows.value=H.state.pointShadow,Ne.hemisphereLights.value=H.state.hemi,Ne.directionalShadowMap.value=H.state.directionalShadowMap,Ne.directionalShadowMatrix.value=H.state.directionalShadowMatrix,Ne.spotShadowMap.value=H.state.spotShadowMap,Ne.spotLightMatrix.value=H.state.spotLightMatrix,Ne.spotLightMap.value=H.state.spotLightMap,Ne.pointShadowMap.value=H.state.pointShadowMap,Ne.pointShadowMatrix.value=H.state.pointShadowMatrix),Y.currentProgram=Pe,Y.uniformsList=null,Pe}function ct(w){if(w.uniformsList===null){const N=w.currentProgram.getUniforms();w.uniformsList=Qr.seqWithValue(N.seq,w.uniforms)}return w.uniformsList}function St(w,N){const q=Ge.get(w);q.outputColorSpace=N.outputColorSpace,q.batching=N.batching,q.instancing=N.instancing,q.instancingColor=N.instancingColor,q.skinning=N.skinning,q.morphTargets=N.morphTargets,q.morphNormals=N.morphNormals,q.morphColors=N.morphColors,q.morphTargetsCount=N.morphTargetsCount,q.numClippingPlanes=N.numClippingPlanes,q.numIntersection=N.numClipIntersection,q.vertexAlphas=N.vertexAlphas,q.vertexTangents=N.vertexTangents,q.toneMapping=N.toneMapping}function ui(w,N,q,Y,H){N.isScene!==!0&&(N=De),B.resetTextureUnits();const fe=N.fog,ve=Y.isMeshStandardMaterial?N.environment:null,Me=S===null?E.outputColorSpace:S.isXRRenderTarget===!0?S.texture.colorSpace:Et,Re=(Y.isMeshStandardMaterial?V:I).get(Y.envMap||ve),ze=Y.vertexColors===!0&&!!q.attributes.color&&q.attributes.color.itemSize===4,Pe=!!q.attributes.tangent&&(!!Y.normalMap||Y.anisotropy>0),Ne=!!q.morphAttributes.position,mt=!!q.morphAttributes.normal,wt=!!q.morphAttributes.color;let pt=ai;Y.toneMapped&&(S===null||S.isXRRenderTarget===!0)&&(pt=E.toneMapping);const tn=q.morphAttributes.position||q.morphAttributes.normal||q.morphAttributes.color,lt=tn!==void 0?tn.length:0,Ue=Ge.get(Y),ys=g.state.lights;if(Z===!0&&(ce===!0||w!==x)){const Kt=w===x&&Y.id===D;Ve.setState(Y,w,Kt)}let yt=!1;Y.version===Ue.__version?(Ue.needsLights&&Ue.lightsStateVersion!==ys.state.version||Ue.outputColorSpace!==Me||H.isBatchedMesh&&Ue.batching===!1||!H.isBatchedMesh&&Ue.batching===!0||H.isInstancedMesh&&Ue.instancing===!1||!H.isInstancedMesh&&Ue.instancing===!0||H.isSkinnedMesh&&Ue.skinning===!1||!H.isSkinnedMesh&&Ue.skinning===!0||H.isInstancedMesh&&Ue.instancingColor===!0&&H.instanceColor===null||H.isInstancedMesh&&Ue.instancingColor===!1&&H.instanceColor!==null||Ue.envMap!==Re||Y.fog===!0&&Ue.fog!==fe||Ue.numClippingPlanes!==void 0&&(Ue.numClippingPlanes!==Ve.numPlanes||Ue.numIntersection!==Ve.numIntersection)||Ue.vertexAlphas!==ze||Ue.vertexTangents!==Pe||Ue.morphTargets!==Ne||Ue.morphNormals!==mt||Ue.morphColors!==wt||Ue.toneMapping!==pt||Be.isWebGL2===!0&&Ue.morphTargetsCount!==lt)&&(yt=!0):(yt=!0,Ue.__version=Y.version);let vn=Ue.currentProgram;yt===!0&&(vn=xt(Y,N,H));let vs=!1,Bt=!1,un=!1;const vt=vn.getUniforms(),gn=Ue.uniforms;if(Ee.useProgram(vn.program)&&(vs=!0,Bt=!0,un=!0),Y.id!==D&&(D=Y.id,Bt=!0),vs||x!==w){vt.setValue(z,"projectionMatrix",w.projectionMatrix),vt.setValue(z,"viewMatrix",w.matrixWorldInverse);const Kt=vt.map.cameraPosition;Kt!==void 0&&Kt.setValue(z,Qe.setFromMatrixPosition(w.matrixWorld)),Be.logarithmicDepthBuffer&&vt.setValue(z,"logDepthBufFC",2/(Math.log(w.far+1)/Math.LN2)),(Y.isMeshPhongMaterial||Y.isMeshToonMaterial||Y.isMeshLambertMaterial||Y.isMeshBasicMaterial||Y.isMeshStandardMaterial||Y.isShaderMaterial)&&vt.setValue(z,"isOrthographic",w.isOrthographicCamera===!0),x!==w&&(x=w,Bt=!0,un=!0)}if(H.isSkinnedMesh){vt.setOptional(z,H,"bindMatrix"),vt.setOptional(z,H,"bindMatrixInverse");const Kt=H.skeleton;Kt&&(Be.floatVertexTextures?(Kt.boneTexture===null&&Kt.computeBoneTexture(),vt.setValue(z,"boneTexture",Kt.boneTexture,B)):console.warn("THREE.WebGLRenderer: SkinnedMesh can only be used with WebGL 2. With WebGL 1 OES_texture_float and vertex textures support is required."))}H.isBatchedMesh&&(vt.setOptional(z,H,"batchingTexture"),vt.setValue(z,"batchingTexture",H._matricesTexture,B));const di=q.morphAttributes;if((di.position!==void 0||di.normal!==void 0||di.color!==void 0&&Be.isWebGL2===!0)&&We.update(H,q,vn),(Bt||Ue.receiveShadow!==H.receiveShadow)&&(Ue.receiveShadow=H.receiveShadow,vt.setValue(z,"receiveShadow",H.receiveShadow)),Y.isMeshGouraudMaterial&&Y.envMap!==null&&(gn.envMap.value=Re,gn.flipEnvMap.value=Re.isCubeTexture&&Re.isRenderTargetTexture===!1?-1:1),Bt&&(vt.setValue(z,"toneMappingExposure",E.toneMappingExposure),Ue.needsLights&&Ct(gn,un),fe&&Y.fog===!0&&ue.refreshFogUniforms(gn,fe),ue.refreshMaterialUniforms(gn,Y,X,Q,ge),Qr.upload(z,ct(Ue),gn,B)),Y.isShaderMaterial&&Y.uniformsNeedUpdate===!0&&(Qr.upload(z,ct(Ue),gn,B),Y.uniformsNeedUpdate=!1),Y.isSpriteMaterial&&vt.setValue(z,"center",H.center),vt.setValue(z,"modelViewMatrix",H.modelViewMatrix),vt.setValue(z,"normalMatrix",H.normalMatrix),vt.setValue(z,"modelMatrix",H.matrixWorld),Y.isShaderMaterial||Y.isRawShaderMaterial){const Kt=Y.uniformsGroups;for(let Li=0,bd=Kt.length;Li<bd;Li++)if(Be.isWebGL2){const hc=Kt[Li];nt.update(hc,vn),nt.bind(hc,vn)}else console.warn("THREE.WebGLRenderer: Uniform Buffer Objects can only be used with WebGL 2.")}return vn}function Ct(w,N){w.ambientLightColor.needsUpdate=N,w.lightProbe.needsUpdate=N,w.directionalLights.needsUpdate=N,w.directionalLightShadows.needsUpdate=N,w.pointLights.needsUpdate=N,w.pointLightShadows.needsUpdate=N,w.spotLights.needsUpdate=N,w.spotLightShadows.needsUpdate=N,w.rectAreaLights.needsUpdate=N,w.hemisphereLights.needsUpdate=N}function Ks(w){return w.isMeshLambertMaterial||w.isMeshToonMaterial||w.isMeshPhongMaterial||w.isMeshStandardMaterial||w.isShadowMaterial||w.isShaderMaterial&&w.lights===!0}this.getActiveCubeFace=function(){return M},this.getActiveMipmapLevel=function(){return v},this.getRenderTarget=function(){return S},this.setRenderTargetTextures=function(w,N,q){Ge.get(w.texture).__webglTexture=N,Ge.get(w.depthTexture).__webglTexture=q;const Y=Ge.get(w);Y.__hasExternalTextures=!0,Y.__hasExternalTextures&&(Y.__autoAllocateDepthBuffer=q===void 0,Y.__autoAllocateDepthBuffer||Se.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),Y.__useRenderToTexture=!1))},this.setRenderTargetFramebuffer=function(w,N){const q=Ge.get(w);q.__webglFramebuffer=N,q.__useDefaultFramebuffer=N===void 0},this.setRenderTarget=function(w,N=0,q=0){S=w,M=N,v=q;let Y=!0,H=null,fe=!1,ve=!1;if(w){const Re=Ge.get(w);Re.__useDefaultFramebuffer!==void 0?(Ee.bindFramebuffer(z.FRAMEBUFFER,null),Y=!1):Re.__webglFramebuffer===void 0?B.setupRenderTarget(w):Re.__hasExternalTextures&&B.rebindTextures(w,Ge.get(w.texture).__webglTexture,Ge.get(w.depthTexture).__webglTexture);const ze=w.texture;(ze.isData3DTexture||ze.isDataArrayTexture||ze.isCompressedArrayTexture)&&(ve=!0);const Pe=Ge.get(w).__webglFramebuffer;w.isWebGLCubeRenderTarget?(Array.isArray(Pe[N])?H=Pe[N][q]:H=Pe[N],fe=!0):Be.isWebGL2&&w.samples>0&&B.useMultisampledRTT(w)===!1?H=Ge.get(w).__webglMultisampledFramebuffer:Array.isArray(Pe)?H=Pe[q]:H=Pe,C.copy(w.viewport),R.copy(w.scissor),U=w.scissorTest}else C.copy(j).multiplyScalar(X).floor(),R.copy(J).multiplyScalar(X).floor(),U=ne;if(Ee.bindFramebuffer(z.FRAMEBUFFER,H)&&Be.drawBuffers&&Y&&Ee.drawBuffers(w,H),Ee.viewport(C),Ee.scissor(R),Ee.setScissorTest(U),fe){const Re=Ge.get(w.texture);z.framebufferTexture2D(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_CUBE_MAP_POSITIVE_X+N,Re.__webglTexture,q)}else if(ve){const Re=Ge.get(w.texture),ze=N||0;z.framebufferTextureLayer(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,Re.__webglTexture,q||0,ze)}D=-1},this.readRenderTargetPixels=function(w,N,q,Y,H,fe,ve){if(!(w&&w.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Me=Ge.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&ve!==void 0&&(Me=Me[ve]),Me){Ee.bindFramebuffer(z.FRAMEBUFFER,Me);try{const Re=w.texture,ze=Re.format,Pe=Re.type;if(ze!==Lt&&be.convert(ze)!==z.getParameter(z.IMPLEMENTATION_COLOR_READ_FORMAT)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}const Ne=Pe===qn&&(Se.has("EXT_color_buffer_half_float")||Be.isWebGL2&&Se.has("EXT_color_buffer_float"));if(Pe!==Pt&&be.convert(Pe)!==z.getParameter(z.IMPLEMENTATION_COLOR_READ_TYPE)&&!(Pe===hn&&(Be.isWebGL2||Se.has("OES_texture_float")||Se.has("WEBGL_color_buffer_float")))&&!Ne){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}N>=0&&N<=w.width-Y&&q>=0&&q<=w.height-H&&z.readPixels(N,q,Y,H,be.convert(ze),be.convert(Pe),fe)}finally{const Re=S!==null?Ge.get(S).__webglFramebuffer:null;Ee.bindFramebuffer(z.FRAMEBUFFER,Re)}}},this.copyFramebufferToTexture=function(w,N,q=0){const Y=Math.pow(2,-q),H=Math.floor(N.image.width*Y),fe=Math.floor(N.image.height*Y);B.setTexture2D(N,0),z.copyTexSubImage2D(z.TEXTURE_2D,q,0,0,w.x,w.y,H,fe),Ee.unbindTexture()},this.copyTextureToTexture=function(w,N,q,Y=0){const H=N.image.width,fe=N.image.height,ve=be.convert(q.format),Me=be.convert(q.type);B.setTexture2D(q,0),z.pixelStorei(z.UNPACK_FLIP_Y_WEBGL,q.flipY),z.pixelStorei(z.UNPACK_PREMULTIPLY_ALPHA_WEBGL,q.premultiplyAlpha),z.pixelStorei(z.UNPACK_ALIGNMENT,q.unpackAlignment),N.isDataTexture?z.texSubImage2D(z.TEXTURE_2D,Y,w.x,w.y,H,fe,ve,Me,N.image.data):N.isCompressedTexture?z.compressedTexSubImage2D(z.TEXTURE_2D,Y,w.x,w.y,N.mipmaps[0].width,N.mipmaps[0].height,ve,N.mipmaps[0].data):z.texSubImage2D(z.TEXTURE_2D,Y,w.x,w.y,ve,Me,N.image),Y===0&&q.generateMipmaps&&z.generateMipmap(z.TEXTURE_2D),Ee.unbindTexture()},this.copyTextureToTexture3D=function(w,N,q,Y,H=0){if(E.isWebGL1Renderer){console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: can only be used with WebGL2.");return}const fe=w.max.x-w.min.x+1,ve=w.max.y-w.min.y+1,Me=w.max.z-w.min.z+1,Re=be.convert(Y.format),ze=be.convert(Y.type);let Pe;if(Y.isData3DTexture)B.setTexture3D(Y,0),Pe=z.TEXTURE_3D;else if(Y.isDataArrayTexture||Y.isCompressedArrayTexture)B.setTexture2DArray(Y,0),Pe=z.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}z.pixelStorei(z.UNPACK_FLIP_Y_WEBGL,Y.flipY),z.pixelStorei(z.UNPACK_PREMULTIPLY_ALPHA_WEBGL,Y.premultiplyAlpha),z.pixelStorei(z.UNPACK_ALIGNMENT,Y.unpackAlignment);const Ne=z.getParameter(z.UNPACK_ROW_LENGTH),mt=z.getParameter(z.UNPACK_IMAGE_HEIGHT),wt=z.getParameter(z.UNPACK_SKIP_PIXELS),pt=z.getParameter(z.UNPACK_SKIP_ROWS),tn=z.getParameter(z.UNPACK_SKIP_IMAGES),lt=q.isCompressedTexture?q.mipmaps[H]:q.image;z.pixelStorei(z.UNPACK_ROW_LENGTH,lt.width),z.pixelStorei(z.UNPACK_IMAGE_HEIGHT,lt.height),z.pixelStorei(z.UNPACK_SKIP_PIXELS,w.min.x),z.pixelStorei(z.UNPACK_SKIP_ROWS,w.min.y),z.pixelStorei(z.UNPACK_SKIP_IMAGES,w.min.z),q.isDataTexture||q.isData3DTexture?z.texSubImage3D(Pe,H,N.x,N.y,N.z,fe,ve,Me,Re,ze,lt.data):q.isCompressedArrayTexture?(console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: untested support for compressed srcTexture."),z.compressedTexSubImage3D(Pe,H,N.x,N.y,N.z,fe,ve,Me,Re,lt.data)):z.texSubImage3D(Pe,H,N.x,N.y,N.z,fe,ve,Me,Re,ze,lt),z.pixelStorei(z.UNPACK_ROW_LENGTH,Ne),z.pixelStorei(z.UNPACK_IMAGE_HEIGHT,mt),z.pixelStorei(z.UNPACK_SKIP_PIXELS,wt),z.pixelStorei(z.UNPACK_SKIP_ROWS,pt),z.pixelStorei(z.UNPACK_SKIP_IMAGES,tn),H===0&&Y.generateMipmaps&&z.generateMipmap(Pe),Ee.unbindTexture()},this.initTexture=function(w){w.isCubeTexture?B.setTextureCube(w,0):w.isData3DTexture?B.setTexture3D(w,0):w.isDataArrayTexture||w.isCompressedArrayTexture?B.setTexture2DArray(w,0):B.setTexture2D(w,0),Ee.unbindTexture()},this.resetState=function(){M=0,v=0,S=null,Ee.reset(),Oe.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Wn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=e===$r?"display-p3":"srgb",t.unpackColorSpace=rt.workingColorSpace===Ws?"display-p3":"srgb"}get outputEncoding(){return console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace===dt?Bi:ru}set outputEncoding(e){console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace=e===Bi?dt:Et}get useLegacyLights(){return console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights}set useLegacyLights(e){console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights=e}}class Q0 extends Su{}Q0.prototype.isWebGL1Renderer=!0;class Vo{constructor(e,t=1,n=1e3){this.isFog=!0,this.name="",this.color=new Ae(e),this.near=t,this.far=n}clone(){return new Vo(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class O0 extends Ze{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t}}class k0{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=xo,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.version=0,this.uuid=xn()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}get updateRange(){return console.warn("THREE.InterleavedBuffer: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let i=0,r=this.stride;i<r;i++)this.array[e+i]=t.array[n+i];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=xn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=xn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const jt=new y;class Wo{constructor(e,t,n,i=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=i}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)jt.fromBufferAttribute(this,t),jt.applyMatrix4(e),this.setXYZ(t,jt.x,jt.y,jt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)jt.fromBufferAttribute(this,t),jt.applyNormalMatrix(e),this.setXYZ(t,jt.x,jt.y,jt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)jt.fromBufferAttribute(this,t),jt.transformDirection(e),this.setXYZ(t,jt.x,jt.y,jt.z);return this}setX(e,t){return this.normalized&&(t=ht(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=ht(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=ht(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=ht(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=Sn(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=Sn(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=Sn(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=Sn(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=ht(t,this.array),n=ht(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=ht(t,this.array),n=ht(n,this.array),i=ht(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this}setXYZW(e,t,n,i,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=ht(t,this.array),n=ht(n,this.array),i=ht(i,this.array),r=ht(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this.data.array[e+3]=r,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[i+r])}return new Ut(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new Wo(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[i+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}const br=new y,Sl=new y;class G0 extends Ze{constructor(){super(),this._currentLevel=0,this.type="LOD",Object.defineProperties(this,{levels:{enumerable:!0,value:[]},isLOD:{value:!0}}),this.autoUpdate=!0}copy(e){super.copy(e,!1);const t=e.levels;for(let n=0,i=t.length;n<i;n++){const r=t[n];this.addLevel(r.object.clone(),r.distance,r.hysteresis)}return this.autoUpdate=e.autoUpdate,this}addLevel(e,t=0,n=0){t=Math.abs(t);const i=this.levels;let r;for(r=0;r<i.length&&!(t<i[r].distance);r++);return i.splice(r,0,{distance:t,hysteresis:n,object:e}),this.add(e),this}getCurrentLevel(){return this._currentLevel}getObjectForDistance(e){const t=this.levels;if(t.length>0){let n,i;for(n=1,i=t.length;n<i;n++){let r=t[n].distance;if(t[n].object.visible&&(r-=r*t[n].hysteresis),e<r)break}return t[n-1].object}return null}raycast(e,t){if(this.levels.length>0){br.setFromMatrixPosition(this.matrixWorld);const i=e.ray.origin.distanceTo(br);this.getObjectForDistance(i).raycast(e,t)}}update(e){const t=this.levels;if(t.length>1){br.setFromMatrixPosition(e.matrixWorld),Sl.setFromMatrixPosition(this.matrixWorld);const n=br.distanceTo(Sl)/e.zoom;t[0].object.visible=!0;let i,r;for(i=1,r=t.length;i<r;i++){let a=t[i].distance;if(t[i].object.visible&&(a-=a*t[i].hysteresis),n>=a)t[i-1].object.visible=!1,t[i].object.visible=!0;else break}for(this._currentLevel=i-1;i<r;i++)t[i].object.visible=!1}}toJSON(e){const t=super.toJSON(e);this.autoUpdate===!1&&(t.object.autoUpdate=!1),t.object.levels=[];const n=this.levels;for(let i=0,r=n.length;i<r;i++){const a=n[i];t.object.levels.push({object:a.object.uuid,distance:a.distance,hysteresis:a.hysteresis})}return t}}const Ml=new y,wl=new at,Bl=new at,H0=new y,Tl=new Fe,Er=new y,Da=new Ln,Rl=new Fe,La=new qs;class z0 extends _e{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=bc,this.bindMatrix=new Fe,this.bindMatrixInverse=new Fe,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){const e=this.geometry;this.boundingBox===null&&(this.boundingBox=new pn),this.boundingBox.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Er),this.boundingBox.expandByPoint(Er)}computeBoundingSphere(){const e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new Ln),this.boundingSphere.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Er),this.boundingSphere.expandByPoint(Er)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){const n=this.material,i=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Da.copy(this.boundingSphere),Da.applyMatrix4(i),e.ray.intersectsSphere(Da)!==!1&&(Rl.copy(i).invert(),La.copy(e.ray).applyMatrix4(Rl),!(this.boundingBox!==null&&La.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,La)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){const e=new at,t=this.geometry.attributes.skinWeight;for(let n=0,i=t.count;n<i;n++){e.fromBufferAttribute(t,n);const r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===bc?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===Zd?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){const n=this.skeleton,i=this.geometry;wl.fromBufferAttribute(i.attributes.skinIndex,e),Bl.fromBufferAttribute(i.attributes.skinWeight,e),Ml.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let r=0;r<4;r++){const a=Bl.getComponent(r);if(a!==0){const o=wl.getComponent(r);Tl.multiplyMatrices(n.bones[o].matrixWorld,n.boneInverses[o]),t.addScaledVector(H0.copy(Ml).applyMatrix4(Tl),a)}}return t.applyMatrix4(this.bindMatrixInverse)}boneTransform(e,t){return console.warn("THREE.SkinnedMesh: .boneTransform() was renamed to .applyBoneTransform() in r151."),this.applyBoneTransform(e,t)}}class Mu extends Ze{constructor(){super(),this.isBone=!0,this.type="Bone"}}class ta extends Ft{constructor(e=null,t=1,n=1,i,r,a,o,c,l=Ht,h=Ht,u,d){super(null,a,o,c,l,h,i,r,u,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const Dl=new Fe,V0=new Fe;class qo{constructor(e=[],t=[]){this.uuid=xn(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){const e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,i=this.bones.length;n<i;n++)this.boneInverses.push(new Fe)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){const n=new Fe;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){const e=this.bones,t=this.boneInverses,n=this.boneMatrices,i=this.boneTexture;for(let r=0,a=e.length;r<a;r++){const o=e[r]?e[r].matrixWorld:V0;Dl.multiplyMatrices(o,t[r]),Dl.toArray(n,r*16)}i!==null&&(i.needsUpdate=!0)}clone(){return new qo(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);const t=new Float32Array(e*e*4);t.set(this.boneMatrices);const n=new ta(t,e,e,Lt,hn);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){const i=this.bones[t];if(i.name===e)return i}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,i=e.bones.length;n<i;n++){const r=e.bones[n];let a=t[r];a===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",r),a=new Mu),this.bones.push(a),this.boneInverses.push(new Fe().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){const e={metadata:{version:4.6,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;const t=this.bones,n=this.boneInverses;for(let i=0,r=t.length;i<r;i++){const a=t[i];e.bones.push(a.uuid);const o=n[i];e.boneInverses.push(o.toArray())}return e}}class Io extends Ut{constructor(e,t,n,i=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const Ji=new Fe,Ll=new Fe,_r=[],Pl=new pn,W0=new Fe,ws=new _e,Bs=new Ln;class Jr extends _e{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Io(new Float32Array(n*16),16),this.instanceColor=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<n;i++)this.setMatrixAt(i,W0)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new pn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ji),Pl.copy(e.boundingBox).applyMatrix4(Ji),this.boundingBox.union(Pl)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Ln),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ji),Bs.copy(e.boundingSphere).applyMatrix4(Ji),this.boundingSphere.union(Bs)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}raycast(e,t){const n=this.matrixWorld,i=this.count;if(ws.geometry=this.geometry,ws.material=this.material,ws.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Bs.copy(this.boundingSphere),Bs.applyMatrix4(n),e.ray.intersectsSphere(Bs)!==!1))for(let r=0;r<i;r++){this.getMatrixAt(r,Ji),Ll.multiplyMatrices(n,Ji),ws.matrixWorld=Ll,ws.raycast(e,_r);for(let a=0,o=_r.length;a<o;a++){const c=_r[a];c.instanceId=r,c.object=this,t.push(c)}_r.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Io(new Float32Array(this.instanceMatrix.count*3),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"})}}class Xo extends wn{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ae(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const Fl=new y,Ul=new y,Nl=new Fe,Pa=new qs,xr=new Ln;class na extends Ze{constructor(e=new It,t=new Xo){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let i=1,r=t.count;i<r;i++)Fl.fromBufferAttribute(t,i-1),Ul.fromBufferAttribute(t,i),n[i]=n[i-1],n[i]+=Fl.distanceTo(Ul);e.setAttribute("lineDistance",new ft(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const n=this.geometry,i=this.matrixWorld,r=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),xr.copy(n.boundingSphere),xr.applyMatrix4(i),xr.radius+=r,e.ray.intersectsSphere(xr)===!1)return;Nl.copy(i).invert(),Pa.copy(e.ray).applyMatrix4(Nl);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,l=new y,h=new y,u=new y,d=new y,f=this.isLineSegments?2:1,p=n.index,g=n.attributes.position;if(p!==null){const A=Math.max(0,a.start),b=Math.min(p.count,a.start+a.count);for(let E=A,_=b-1;E<_;E+=f){const M=p.getX(E),v=p.getX(E+1);if(l.fromBufferAttribute(g,M),h.fromBufferAttribute(g,v),Pa.distanceSqToSegment(l,h,d,u)>c)continue;d.applyMatrix4(this.matrixWorld);const D=e.ray.origin.distanceTo(d);D<e.near||D>e.far||t.push({distance:D,point:u.clone().applyMatrix4(this.matrixWorld),index:E,face:null,faceIndex:null,object:this})}}else{const A=Math.max(0,a.start),b=Math.min(g.count,a.start+a.count);for(let E=A,_=b-1;E<_;E+=f){if(l.fromBufferAttribute(g,E),h.fromBufferAttribute(g,E+1),Pa.distanceSqToSegment(l,h,d,u)>c)continue;d.applyMatrix4(this.matrixWorld);const v=e.ray.origin.distanceTo(d);v<e.near||v>e.far||t.push({distance:v,point:u.clone().applyMatrix4(this.matrixWorld),index:E,face:null,faceIndex:null,object:this})}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=i.length;r<a;r++){const o=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}const Ql=new y,Ol=new y;class q0 extends na{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[];for(let i=0,r=t.count;i<r;i+=2)Ql.fromBufferAttribute(t,i),Ol.fromBufferAttribute(t,i+1),n[i]=i===0?0:n[i-1],n[i+1]=n[i]+Ql.distanceTo(Ol);e.setAttribute("lineDistance",new ft(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class X0 extends na{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}}class Yo extends wn{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Ae(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const kl=new Fe,So=new qs,yr=new Ln,vr=new y;class wu extends Ze{constructor(e=new It,t=new Yo){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const n=this.geometry,i=this.matrixWorld,r=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),yr.copy(n.boundingSphere),yr.applyMatrix4(i),yr.radius+=r,e.ray.intersectsSphere(yr)===!1)return;kl.copy(i).invert(),So.copy(e.ray).applyMatrix4(kl);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,l=n.index,u=n.attributes.position;if(l!==null){const d=Math.max(0,a.start),f=Math.min(l.count,a.start+a.count);for(let p=d,m=f;p<m;p++){const g=l.getX(p);vr.fromBufferAttribute(u,g),Gl(vr,g,c,i,e,t,this)}}else{const d=Math.max(0,a.start),f=Math.min(u.count,a.start+a.count);for(let p=d,m=f;p<m;p++)vr.fromBufferAttribute(u,p),Gl(vr,p,c,i,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=i.length;r<a;r++){const o=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function Gl(s,e,t,n,i,r,a){const o=So.distanceSqToPoint(s);if(o<t){const c=new y;So.closestPointToPoint(s,c),c.applyMatrix4(n);const l=i.ray.origin.distanceTo(c);if(l<i.near||l>i.far)return;r.push({distance:l,distanceToRay:Math.sqrt(o),point:c,index:e,face:null,object:a})}}class ia extends Ft{constructor(e,t,n,i,r,a,o,c,l,h,u,d){super(null,a,o,c,l,h,i,r,u,d),this.isCompressedTexture=!0,this.image={width:t,height:n},this.mipmaps=e,this.flipY=!1,this.generateMipmaps=!1}}class Y0 extends ia{constructor(e,t,n,i,r,a){super(e,t,n,r,a),this.isCompressedArrayTexture=!0,this.image.depth=i,this.wrapR=ln}}class K0 extends ia{constructor(e,t,n){super(void 0,e[0].width,e[0].height,t,n,Ti),this.isCompressedCubeTexture=!0,this.isCubeTexture=!0,this.image=e}}class j0 extends Ft{constructor(e,t,n,i,r,a,o,c,l){super(e,t,n,i,r,a,o,c,l),this.isCanvasTexture=!0,this.needsUpdate=!0}}class Pn{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){const n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){const e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const t=[];let n,i=this.getPoint(0),r=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),r+=n.distanceTo(i),t.push(r),i=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){const n=this.getLengths();let i=0;const r=n.length;let a;t?a=t:a=e*n[r-1];let o=0,c=r-1,l;for(;o<=c;)if(i=Math.floor(o+(c-o)/2),l=n[i]-a,l<0)o=i+1;else if(l>0)c=i-1;else{c=i;break}if(i=c,n[i]===a)return i/(r-1);const h=n[i],d=n[i+1]-h,f=(a-h)/d;return(i+f)/(r-1)}getTangent(e,t){let i=e-1e-4,r=e+1e-4;i<0&&(i=0),r>1&&(r=1);const a=this.getPoint(i),o=this.getPoint(r),c=t||(a.isVector2?new oe:new y);return c.copy(o).sub(a).normalize(),c}getTangentAt(e,t){const n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t){const n=new y,i=[],r=[],a=[],o=new y,c=new Fe;for(let f=0;f<=e;f++){const p=f/e;i[f]=this.getTangentAt(p,new y)}r[0]=new y,a[0]=new y;let l=Number.MAX_VALUE;const h=Math.abs(i[0].x),u=Math.abs(i[0].y),d=Math.abs(i[0].z);h<=l&&(l=h,n.set(1,0,0)),u<=l&&(l=u,n.set(0,1,0)),d<=l&&n.set(0,0,1),o.crossVectors(i[0],n).normalize(),r[0].crossVectors(i[0],o),a[0].crossVectors(i[0],r[0]);for(let f=1;f<=e;f++){if(r[f]=r[f-1].clone(),a[f]=a[f-1].clone(),o.crossVectors(i[f-1],i[f]),o.length()>Number.EPSILON){o.normalize();const p=Math.acos(Rt(i[f-1].dot(i[f]),-1,1));r[f].applyMatrix4(c.makeRotationAxis(o,p))}a[f].crossVectors(i[f],r[f])}if(t===!0){let f=Math.acos(Rt(r[0].dot(r[e]),-1,1));f/=e,i[0].dot(o.crossVectors(r[0],r[e]))>0&&(f=-f);for(let p=1;p<=e;p++)r[p].applyMatrix4(c.makeRotationAxis(i[p],f*p)),a[p].crossVectors(i[p],r[p])}return{tangents:i,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){const e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}}class Ko extends Pn{constructor(e=0,t=0,n=1,i=1,r=0,a=Math.PI*2,o=!1,c=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=i,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=c}getPoint(e,t){const n=t||new oe,i=Math.PI*2;let r=this.aEndAngle-this.aStartAngle;const a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=i;for(;r>i;)r-=i;r<Number.EPSILON&&(a?r=0:r=i),this.aClockwise===!0&&!a&&(r===i?r=-i:r=r-i);const o=this.aStartAngle+e*r;let c=this.aX+this.xRadius*Math.cos(o),l=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){const h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),d=c-this.aX,f=l-this.aY;c=d*h-f*u+this.aX,l=d*u+f*h+this.aY}return n.set(c,l)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){const e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}}class J0 extends Ko{constructor(e,t,n,i,r,a){super(e,t,n,n,i,r,a),this.isArcCurve=!0,this.type="ArcCurve"}}function jo(){let s=0,e=0,t=0,n=0;function i(r,a,o,c){s=r,e=o,t=-3*r+3*a-2*o-c,n=2*r-2*a+o+c}return{initCatmullRom:function(r,a,o,c,l){i(a,o,l*(o-r),l*(c-a))},initNonuniformCatmullRom:function(r,a,o,c,l,h,u){let d=(a-r)/l-(o-r)/(l+h)+(o-a)/h,f=(o-a)/h-(c-a)/(h+u)+(c-o)/u;d*=h,f*=h,i(a,o,d,f)},calc:function(r){const a=r*r,o=a*r;return s+e*r+t*a+n*o}}}const Cr=new y,Fa=new jo,Ua=new jo,Na=new jo;class Jo extends Pn{constructor(e=[],t=!1,n="centripetal",i=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=i}getPoint(e,t=new y){const n=t,i=this.points,r=i.length,a=(r-(this.closed?0:1))*e;let o=Math.floor(a),c=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:c===0&&o===r-1&&(o=r-2,c=1);let l,h;this.closed||o>0?l=i[(o-1)%r]:(Cr.subVectors(i[0],i[1]).add(i[0]),l=Cr);const u=i[o%r],d=i[(o+1)%r];if(this.closed||o+2<r?h=i[(o+2)%r]:(Cr.subVectors(i[r-1],i[r-2]).add(i[r-1]),h=Cr),this.curveType==="centripetal"||this.curveType==="chordal"){const f=this.curveType==="chordal"?.5:.25;let p=Math.pow(l.distanceToSquared(u),f),m=Math.pow(u.distanceToSquared(d),f),g=Math.pow(d.distanceToSquared(h),f);m<1e-4&&(m=1),p<1e-4&&(p=m),g<1e-4&&(g=m),Fa.initNonuniformCatmullRom(l.x,u.x,d.x,h.x,p,m,g),Ua.initNonuniformCatmullRom(l.y,u.y,d.y,h.y,p,m,g),Na.initNonuniformCatmullRom(l.z,u.z,d.z,h.z,p,m,g)}else this.curveType==="catmullrom"&&(Fa.initCatmullRom(l.x,u.x,d.x,h.x,this.tension),Ua.initCatmullRom(l.y,u.y,d.y,h.y,this.tension),Na.initCatmullRom(l.z,u.z,d.z,h.z,this.tension));return n.set(Fa.calc(c),Ua.calc(c),Na.calc(c)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const i=e.points[t];this.points.push(i.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const i=this.points[t];e.points.push(i.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const i=e.points[t];this.points.push(new y().fromArray(i))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}}function Hl(s,e,t,n,i){const r=(n-e)*.5,a=(i-t)*.5,o=s*s,c=s*o;return(2*t-2*n+r+a)*c+(-3*t+3*n-2*r-a)*o+r*s+t}function Z0(s,e){const t=1-s;return t*t*e}function $0(s,e){return 2*(1-s)*s*e}function eb(s,e){return s*s*e}function Qs(s,e,t,n){return Z0(s,e)+$0(s,t)+eb(s,n)}function tb(s,e){const t=1-s;return t*t*t*e}function nb(s,e){const t=1-s;return 3*t*t*s*e}function ib(s,e){return 3*(1-s)*s*s*e}function sb(s,e){return s*s*s*e}function Os(s,e,t,n,i){return tb(s,e)+nb(s,t)+ib(s,n)+sb(s,i)}class Bu extends Pn{constructor(e=new oe,t=new oe,n=new oe,i=new oe){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=i}getPoint(e,t=new oe){const n=t,i=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(Os(e,i.x,r.x,a.x,o.x),Os(e,i.y,r.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class rb extends Pn{constructor(e=new y,t=new y,n=new y,i=new y){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=i}getPoint(e,t=new y){const n=t,i=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(Os(e,i.x,r.x,a.x,o.x),Os(e,i.y,r.y,a.y,o.y),Os(e,i.z,r.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class Tu extends Pn{constructor(e=new oe,t=new oe){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new oe){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new oe){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class ab extends Pn{constructor(e=new y,t=new y){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new y){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new y){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Ru extends Pn{constructor(e=new oe,t=new oe,n=new oe){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new oe){const n=t,i=this.v0,r=this.v1,a=this.v2;return n.set(Qs(e,i.x,r.x,a.x),Qs(e,i.y,r.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class ob extends Pn{constructor(e=new y,t=new y,n=new y){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new y){const n=t,i=this.v0,r=this.v1,a=this.v2;return n.set(Qs(e,i.x,r.x,a.x),Qs(e,i.y,r.y,a.y),Qs(e,i.z,r.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Du extends Pn{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new oe){const n=t,i=this.points,r=(i.length-1)*e,a=Math.floor(r),o=r-a,c=i[a===0?a:a-1],l=i[a],h=i[a>i.length-2?i.length-1:a+1],u=i[a>i.length-3?i.length-1:a+2];return n.set(Hl(o,c.x,l.x,h.x,u.x),Hl(o,c.y,l.y,h.y,u.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const i=e.points[t];this.points.push(i.clone())}return this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const i=this.points[t];e.points.push(i.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const i=e.points[t];this.points.push(new oe().fromArray(i))}return this}}var zl=Object.freeze({__proto__:null,ArcCurve:J0,CatmullRomCurve3:Jo,CubicBezierCurve:Bu,CubicBezierCurve3:rb,EllipseCurve:Ko,LineCurve:Tu,LineCurve3:ab,QuadraticBezierCurve:Ru,QuadraticBezierCurve3:ob,SplineCurve:Du});class cb extends Pn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){const e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){const n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new zl[n](t,e))}return this}getPoint(e,t){const n=e*this.getLength(),i=this.getCurveLengths();let r=0;for(;r<i.length;){if(i[r]>=n){const a=i[r]-n,o=this.curves[r],c=o.getLength(),l=c===0?0:1-a/c;return o.getPointAt(l,t)}r++}return null}getLength(){const e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const e=[];let t=0;for(let n=0,i=this.curves.length;n<i;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){const t=[];let n;for(let i=0,r=this.curves;i<r.length;i++){const a=r[i],o=a.isEllipseCurve?e*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?e*a.points.length:e,c=a.getPoints(o);for(let l=0;l<c.length;l++){const h=c[l];n&&n.equals(h)||(t.push(h),n=h)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){const i=e.curves[t];this.curves.push(i.clone())}return this.autoClose=e.autoClose,this}toJSON(){const e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){const i=this.curves[t];e.curves.push(i.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){const i=e.curves[t];this.curves.push(new zl[i.type]().fromJSON(i))}return this}}class lb extends cb{constructor(e){super(),this.type="Path",this.currentPoint=new oe,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){const n=new Tu(this.currentPoint.clone(),new oe(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,i){const r=new Ru(this.currentPoint.clone(),new oe(e,t),new oe(n,i));return this.curves.push(r),this.currentPoint.set(n,i),this}bezierCurveTo(e,t,n,i,r,a){const o=new Bu(this.currentPoint.clone(),new oe(e,t),new oe(n,i),new oe(r,a));return this.curves.push(o),this.currentPoint.set(r,a),this}splineThru(e){const t=[this.currentPoint.clone()].concat(e),n=new Du(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,i,r,a){const o=this.currentPoint.x,c=this.currentPoint.y;return this.absarc(e+o,t+c,n,i,r,a),this}absarc(e,t,n,i,r,a){return this.absellipse(e,t,n,n,i,r,a),this}ellipse(e,t,n,i,r,a,o,c){const l=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(e+l,t+h,n,i,r,a,o,c),this}absellipse(e,t,n,i,r,a,o,c){const l=new Ko(e,t,n,i,r,a,o,c);if(this.curves.length>0){const u=l.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(l);const h=l.getPoint(1);return this.currentPoint.copy(h),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){const e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}}class Zo extends It{constructor(e=[new oe(0,-.5),new oe(.5,0),new oe(0,.5)],t=12,n=0,i=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:n,phiLength:i},t=Math.floor(t),i=Rt(i,0,Math.PI*2);const r=[],a=[],o=[],c=[],l=[],h=1/t,u=new y,d=new oe,f=new y,p=new y,m=new y;let g=0,A=0;for(let b=0;b<=e.length-1;b++)switch(b){case 0:g=e[b+1].x-e[b].x,A=e[b+1].y-e[b].y,f.x=A*1,f.y=-g,f.z=A*0,m.copy(f),f.normalize(),c.push(f.x,f.y,f.z);break;case e.length-1:c.push(m.x,m.y,m.z);break;default:g=e[b+1].x-e[b].x,A=e[b+1].y-e[b].y,f.x=A*1,f.y=-g,f.z=A*0,p.copy(f),f.x+=m.x,f.y+=m.y,f.z+=m.z,f.normalize(),c.push(f.x,f.y,f.z),m.copy(p)}for(let b=0;b<=t;b++){const E=n+b*h*i,_=Math.sin(E),M=Math.cos(E);for(let v=0;v<=e.length-1;v++){u.x=e[v].x*_,u.y=e[v].y,u.z=e[v].x*M,a.push(u.x,u.y,u.z),d.x=b/t,d.y=v/(e.length-1),o.push(d.x,d.y);const S=c[3*v+0]*_,D=c[3*v+1],x=c[3*v+0]*M;l.push(S,D,x)}}for(let b=0;b<t;b++)for(let E=0;E<e.length-1;E++){const _=E+b*e.length,M=_,v=_+e.length,S=_+e.length+1,D=_+1;r.push(M,v,D),r.push(S,D,v)}this.setIndex(r),this.setAttribute("position",new ft(a,3)),this.setAttribute("uv",new ft(o,2)),this.setAttribute("normal",new ft(l,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Zo(e.points,e.segments,e.phiStart,e.phiLength)}}class $o extends Zo{constructor(e=1,t=1,n=4,i=8){const r=new lb;r.absarc(0,-t/2,e,Math.PI*1.5,0),r.absarc(0,t/2,e,0,Math.PI*.5),super(r.getPoints(n),i),this.type="CapsuleGeometry",this.parameters={radius:e,length:t,capSegments:n,radialSegments:i}}static fromJSON(e){return new $o(e.radius,e.length,e.capSegments,e.radialSegments)}}class ec extends It{constructor(e=1,t=32,n=0,i=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:i},t=Math.max(3,t);const r=[],a=[],o=[],c=[],l=new y,h=new oe;a.push(0,0,0),o.push(0,0,1),c.push(.5,.5);for(let u=0,d=3;u<=t;u++,d+=3){const f=n+u/t*i;l.x=e*Math.cos(f),l.y=e*Math.sin(f),a.push(l.x,l.y,l.z),o.push(0,0,1),h.x=(a[d]/e+1)/2,h.y=(a[d+1]/e+1)/2,c.push(h.x,h.y)}for(let u=1;u<=t;u++)r.push(u,u+1,0);this.setIndex(r),this.setAttribute("position",new ft(a,3)),this.setAttribute("normal",new ft(o,3)),this.setAttribute("uv",new ft(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ec(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class Dt extends It{constructor(e=1,t=1,n=1,i=32,r=1,a=!1,o=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:i,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:c};const l=this;i=Math.floor(i),r=Math.floor(r);const h=[],u=[],d=[],f=[];let p=0;const m=[],g=n/2;let A=0;b(),a===!1&&(e>0&&E(!0),t>0&&E(!1)),this.setIndex(h),this.setAttribute("position",new ft(u,3)),this.setAttribute("normal",new ft(d,3)),this.setAttribute("uv",new ft(f,2));function b(){const _=new y,M=new y;let v=0;const S=(t-e)/n;for(let D=0;D<=r;D++){const x=[],C=D/r,R=C*(t-e)+e;for(let U=0;U<=i;U++){const O=U/i,T=O*c+o,F=Math.sin(T),Q=Math.cos(T);M.x=R*F,M.y=-C*n+g,M.z=R*Q,u.push(M.x,M.y,M.z),_.set(F,S,Q).normalize(),d.push(_.x,_.y,_.z),f.push(O,1-C),x.push(p++)}m.push(x)}for(let D=0;D<i;D++)for(let x=0;x<r;x++){const C=m[x][D],R=m[x+1][D],U=m[x+1][D+1],O=m[x][D+1];h.push(C,R,O),h.push(R,U,O),v+=6}l.addGroup(A,v,0),A+=v}function E(_){const M=p,v=new oe,S=new y;let D=0;const x=_===!0?e:t,C=_===!0?1:-1;for(let U=1;U<=i;U++)u.push(0,g*C,0),d.push(0,C,0),f.push(.5,.5),p++;const R=p;for(let U=0;U<=i;U++){const T=U/i*c+o,F=Math.cos(T),Q=Math.sin(T);S.x=x*Q,S.y=g*C,S.z=x*F,u.push(S.x,S.y,S.z),d.push(0,C,0),v.x=F*.5+.5,v.y=Q*.5*C+.5,f.push(v.x,v.y),p++}for(let U=0;U<i;U++){const O=M+U,T=R+U;_===!0?h.push(T,T+1,O):h.push(T+1,T,O),D+=3}l.addGroup(A,D,_===!0?1:2),A+=D}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Dt(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Es extends Dt{constructor(e=1,t=1,n=32,i=1,r=!1,a=0,o=Math.PI*2){super(0,e,t,n,i,r,a,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:i,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(e){return new Es(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class tc extends It{constructor(e=.5,t=1,n=32,i=1,r=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:i,thetaStart:r,thetaLength:a},n=Math.max(3,n),i=Math.max(1,i);const o=[],c=[],l=[],h=[];let u=e;const d=(t-e)/i,f=new y,p=new oe;for(let m=0;m<=i;m++){for(let g=0;g<=n;g++){const A=r+g/n*a;f.x=u*Math.cos(A),f.y=u*Math.sin(A),c.push(f.x,f.y,f.z),l.push(0,0,1),p.x=(f.x/t+1)/2,p.y=(f.y/t+1)/2,h.push(p.x,p.y)}u+=d}for(let m=0;m<i;m++){const g=m*(n+1);for(let A=0;A<n;A++){const b=A+g,E=b,_=b+n+1,M=b+n+2,v=b+1;o.push(E,_,v),o.push(_,M,v)}}this.setIndex(o),this.setAttribute("position",new ft(c,3)),this.setAttribute("normal",new ft(l,3)),this.setAttribute("uv",new ft(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new tc(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}class oi extends It{constructor(e=1,t=32,n=16,i=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:i,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));const c=Math.min(a+o,Math.PI);let l=0;const h=[],u=new y,d=new y,f=[],p=[],m=[],g=[];for(let A=0;A<=n;A++){const b=[],E=A/n;let _=0;A===0&&a===0?_=.5/t:A===n&&c===Math.PI&&(_=-.5/t);for(let M=0;M<=t;M++){const v=M/t;u.x=-e*Math.cos(i+v*r)*Math.sin(a+E*o),u.y=e*Math.cos(a+E*o),u.z=e*Math.sin(i+v*r)*Math.sin(a+E*o),p.push(u.x,u.y,u.z),d.copy(u).normalize(),m.push(d.x,d.y,d.z),g.push(v+_,1-E),b.push(l++)}h.push(b)}for(let A=0;A<n;A++)for(let b=0;b<t;b++){const E=h[A][b+1],_=h[A][b],M=h[A+1][b],v=h[A+1][b+1];(A!==0||a>0)&&f.push(E,_,v),(A!==n-1||c<Math.PI)&&f.push(_,M,v)}this.setIndex(f),this.setAttribute("position",new ft(p,3)),this.setAttribute("normal",new ft(m,3)),this.setAttribute("uv",new ft(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new oi(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class nc extends It{constructor(e=1,t=.4,n=12,i=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:i,arc:r},n=Math.floor(n),i=Math.floor(i);const a=[],o=[],c=[],l=[],h=new y,u=new y,d=new y;for(let f=0;f<=n;f++)for(let p=0;p<=i;p++){const m=p/i*r,g=f/n*Math.PI*2;u.x=(e+t*Math.cos(g))*Math.cos(m),u.y=(e+t*Math.cos(g))*Math.sin(m),u.z=t*Math.sin(g),o.push(u.x,u.y,u.z),h.x=e*Math.cos(m),h.y=e*Math.sin(m),d.subVectors(u,h).normalize(),c.push(d.x,d.y,d.z),l.push(p/i),l.push(f/n)}for(let f=1;f<=n;f++)for(let p=1;p<=i;p++){const m=(i+1)*f+p-1,g=(i+1)*(f-1)+p-1,A=(i+1)*(f-1)+p,b=(i+1)*f+p;a.push(m,g,b),a.push(g,A,b)}this.setIndex(a),this.setAttribute("position",new ft(o,3)),this.setAttribute("normal",new ft(c,3)),this.setAttribute("uv",new ft(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new nc(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}class Ke extends wn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new Ae(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ae(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=au,this.normalScale=new oe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Kn extends Ke{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new oe(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Rt(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Ae(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Ae(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Ae(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}function Ir(s,e,t){return!s||!t&&s.constructor===e?s:typeof e.BYTES_PER_ELEMENT=="number"?new e(s):Array.prototype.slice.call(s)}function hb(s){return ArrayBuffer.isView(s)&&!(s instanceof DataView)}function ub(s){function e(i,r){return s[i]-s[r]}const t=s.length,n=new Array(t);for(let i=0;i!==t;++i)n[i]=i;return n.sort(e),n}function Vl(s,e,t){const n=s.length,i=new s.constructor(n);for(let r=0,a=0;a!==n;++r){const o=t[r]*e;for(let c=0;c!==e;++c)i[a++]=s[o+c]}return i}function Lu(s,e,t,n){let i=1,r=s[0];for(;r!==void 0&&r[n]===void 0;)r=s[i++];if(r===void 0)return;let a=r[n];if(a!==void 0)if(Array.isArray(a))do a=r[n],a!==void 0&&(e.push(r.time),t.push.apply(t,a)),r=s[i++];while(r!==void 0);else if(a.toArray!==void 0)do a=r[n],a!==void 0&&(e.push(r.time),a.toArray(t,t.length)),r=s[i++];while(r!==void 0);else do a=r[n],a!==void 0&&(e.push(r.time),t.push(a)),r=s[i++];while(r!==void 0)}class Ys{constructor(e,t,n,i){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){const t=this.parameterPositions;let n=this._cachedIndex,i=t[n],r=t[n-1];e:{t:{let a;n:{i:if(!(e<i)){for(let o=n+2;;){if(i===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=i,i=t[++n],e<i)break t}a=t.length;break n}if(!(e>=r)){const o=t[1];e<o&&(n=2,r=o);for(let c=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===c)break;if(i=r,r=t[--n-1],e>=r)break t}a=n,n=0;break n}break e}for(;n<a;){const o=n+a>>>1;e<t[o]?a=o:n=o+1}if(i=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,i)}return this.interpolate_(n,r,e,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=e*i;for(let a=0;a!==i;++a)t[a]=n[r+a];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}}class db extends Ys{constructor(e,t,n,i){super(e,t,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:ns,endingEnd:ns}}intervalChanged_(e,t,n){const i=this.parameterPositions;let r=e-2,a=e+1,o=i[r],c=i[a];if(o===void 0)switch(this.getSettings_().endingStart){case is:r=e,o=2*t-n;break;case Vr:r=i.length-2,o=t+i[r]-i[r+1];break;default:r=e,o=n}if(c===void 0)switch(this.getSettings_().endingEnd){case is:a=e,c=2*n-t;break;case Vr:a=1,c=n+i[1]-i[0];break;default:a=e-1,c=t}const l=(n-t)*.5,h=this.valueSize;this._weightPrev=l/(t-o),this._weightNext=l/(c-n),this._offsetPrev=r*h,this._offsetNext=a*h}interpolate_(e,t,n,i){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,h=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(n-t)/(i-t),m=p*p,g=m*p,A=-d*g+2*d*m-d*p,b=(1+d)*g+(-1.5-2*d)*m+(-.5+d)*p+1,E=(-1-f)*g+(1.5+f)*m+.5*p,_=f*g-f*m;for(let M=0;M!==o;++M)r[M]=A*a[h+M]+b*a[l+M]+E*a[c+M]+_*a[u+M];return r}}class Pu extends Ys{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,h=(n-t)/(i-t),u=1-h;for(let d=0;d!==o;++d)r[d]=a[l+d]*u+a[c+d]*h;return r}}class fb extends Ys{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e){return this.copySampleValue_(e-1)}}class Fn{constructor(e,t,n,i){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Ir(t,this.TimeBufferType),this.values=Ir(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(e){const t=e.constructor;let n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Ir(e.times,Array),values:Ir(e.values,Array)};const i=e.getInterpolation();i!==e.DefaultInterpolation&&(n.interpolation=i)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new fb(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Pu(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new db(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case Hs:t=this.InterpolantFactoryMethodDiscrete;break;case fs:t=this.InterpolantFactoryMethodLinear;break;case ca:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){const n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Hs;case this.InterpolantFactoryMethodLinear:return fs;case this.InterpolantFactoryMethodSmooth:return ca}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){const t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]+=e}return this}scale(e){if(e!==1){const t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]*=e}return this}trim(e,t){const n=this.times,i=n.length;let r=0,a=i-1;for(;r!==i&&n[r]<e;)++r;for(;a!==-1&&n[a]>t;)--a;if(++a,r!==0||a!==i){r>=a&&(a=Math.max(a,1),r=a-1);const o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let e=!0;const t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);const n=this.times,i=this.values,r=n.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==r;o++){const c=n[o];if(typeof c=="number"&&isNaN(c)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,o,c),e=!1;break}if(a!==null&&a>c){console.error("THREE.KeyframeTrack: Out of order keys.",this,o,c,a),e=!1;break}a=c}if(i!==void 0&&hb(i))for(let o=0,c=i.length;o!==c;++o){const l=i[o];if(isNaN(l)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,o,l),e=!1;break}}return e}optimize(){const e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===ca,r=e.length-1;let a=1;for(let o=1;o<r;++o){let c=!1;const l=e[o],h=e[o+1];if(l!==h&&(o!==1||l!==e[0]))if(i)c=!0;else{const u=o*n,d=u-n,f=u+n;for(let p=0;p!==n;++p){const m=t[u+p];if(m!==t[d+p]||m!==t[f+p]){c=!0;break}}}if(c){if(o!==a){e[a]=e[o];const u=o*n,d=a*n;for(let f=0;f!==n;++f)t[d+f]=t[u+f]}++a}}if(r>0){e[a]=e[r];for(let o=r*n,c=a*n,l=0;l!==n;++l)t[c+l]=t[o+l];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){const e=this.times.slice(),t=this.values.slice(),n=this.constructor,i=new n(this.name,e,t);return i.createInterpolant=this.createInterpolant,i}}Fn.prototype.TimeBufferType=Float32Array;Fn.prototype.ValueBufferType=Float32Array;Fn.prototype.DefaultInterpolation=fs;class _s extends Fn{}_s.prototype.ValueTypeName="bool";_s.prototype.ValueBufferType=Array;_s.prototype.DefaultInterpolation=Hs;_s.prototype.InterpolantFactoryMethodLinear=void 0;_s.prototype.InterpolantFactoryMethodSmooth=void 0;class Fu extends Fn{}Fu.prototype.ValueTypeName="color";class gs extends Fn{}gs.prototype.ValueTypeName="number";class Ab extends Ys{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=(n-t)/(i-t);let l=e*o;for(let h=l+o;l!==h;l+=4)en.slerpFlat(r,0,a,l-o,a,l,c);return r}}class Ri extends Fn{InterpolantFactoryMethodLinear(e){return new Ab(this.times,this.values,this.getValueSize(),e)}}Ri.prototype.ValueTypeName="quaternion";Ri.prototype.DefaultInterpolation=fs;Ri.prototype.InterpolantFactoryMethodSmooth=void 0;class xs extends Fn{}xs.prototype.ValueTypeName="string";xs.prototype.ValueBufferType=Array;xs.prototype.DefaultInterpolation=Hs;xs.prototype.InterpolantFactoryMethodLinear=void 0;xs.prototype.InterpolantFactoryMethodSmooth=void 0;class ms extends Fn{}ms.prototype.ValueTypeName="vector";class Mo{constructor(e,t=-1,n,i=Qo){this.name=e,this.tracks=n,this.duration=t,this.blendMode=i,this.uuid=xn(),this.duration<0&&this.resetDuration()}static parse(e){const t=[],n=e.tracks,i=1/(e.fps||1);for(let a=0,o=n.length;a!==o;++a)t.push(gb(n[a]).scale(i));const r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r}static toJSON(e){const t=[],n=e.tracks,i={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode};for(let r=0,a=n.length;r!==a;++r)t.push(Fn.toJSON(n[r]));return i}static CreateFromMorphTargetSequence(e,t,n,i){const r=t.length,a=[];for(let o=0;o<r;o++){let c=[],l=[];c.push((o+r-1)%r,o,(o+1)%r),l.push(0,1,0);const h=ub(c);c=Vl(c,1,h),l=Vl(l,1,h),!i&&c[0]===0&&(c.push(r),l.push(l[0])),a.push(new gs(".morphTargetInfluences["+t[o].name+"]",c,l).scale(1/n))}return new this(e,-1,a)}static findByName(e,t){let n=e;if(!Array.isArray(e)){const i=e;n=i.geometry&&i.geometry.animations||i.animations}for(let i=0;i<n.length;i++)if(n[i].name===t)return n[i];return null}static CreateClipsFromMorphTargetSequences(e,t,n){const i={},r=/^([\w-]*?)([\d]+)$/;for(let o=0,c=e.length;o<c;o++){const l=e[o],h=l.name.match(r);if(h&&h.length>1){const u=h[1];let d=i[u];d||(i[u]=d=[]),d.push(l)}}const a=[];for(const o in i)a.push(this.CreateFromMorphTargetSequence(o,i[o],t,n));return a}static parseAnimation(e,t){if(!e)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;const n=function(u,d,f,p,m){if(f.length!==0){const g=[],A=[];Lu(f,g,A,p),g.length!==0&&m.push(new u(d,g,A))}},i=[],r=e.name||"default",a=e.fps||30,o=e.blendMode;let c=e.length||-1;const l=e.hierarchy||[];for(let u=0;u<l.length;u++){const d=l[u].keys;if(!(!d||d.length===0))if(d[0].morphTargets){const f={};let p;for(p=0;p<d.length;p++)if(d[p].morphTargets)for(let m=0;m<d[p].morphTargets.length;m++)f[d[p].morphTargets[m]]=-1;for(const m in f){const g=[],A=[];for(let b=0;b!==d[p].morphTargets.length;++b){const E=d[p];g.push(E.time),A.push(E.morphTarget===m?1:0)}i.push(new gs(".morphTargetInfluence["+m+"]",g,A))}c=f.length*a}else{const f=".bones["+t[u].name+"]";n(ms,f+".position",d,"pos",i),n(Ri,f+".quaternion",d,"rot",i),n(ms,f+".scale",d,"scl",i)}}return i.length===0?null:new this(r,c,i,o)}resetDuration(){const e=this.tracks;let t=0;for(let n=0,i=e.length;n!==i;++n){const r=this.tracks[n];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){const e=[];for(let t=0;t<this.tracks.length;t++)e.push(this.tracks[t].clone());return new this.constructor(this.name,this.duration,e,this.blendMode)}toJSON(){return this.constructor.toJSON(this)}}function pb(s){switch(s.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return gs;case"vector":case"vector2":case"vector3":case"vector4":return ms;case"color":return Fu;case"quaternion":return Ri;case"bool":case"boolean":return _s;case"string":return xs}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+s)}function gb(s){if(s.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");const e=pb(s.type);if(s.times===void 0){const t=[],n=[];Lu(s.keys,t,n,"value"),s.times=t,s.values=n}return e.parse!==void 0?e.parse(s):new e(s.name,s.times,s.values,s.interpolation)}const si={enabled:!1,files:{},add:function(s,e){this.enabled!==!1&&(this.files[s]=e)},get:function(s){if(this.enabled!==!1)return this.files[s]},remove:function(s){delete this.files[s]},clear:function(){this.files={}}};class mb{constructor(e,t,n){const i=this;let r=!1,a=0,o=0,c;const l=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.itemStart=function(h){o++,r===!1&&i.onStart!==void 0&&i.onStart(h,a,o),r=!0},this.itemEnd=function(h){a++,i.onProgress!==void 0&&i.onProgress(h,a,o),a===o&&(r=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(h){i.onError!==void 0&&i.onError(h)},this.resolveURL=function(h){return c?c(h):h},this.setURLModifier=function(h){return c=h,this},this.addHandler=function(h,u){return l.push(h,u),this},this.removeHandler=function(h){const u=l.indexOf(h);return u!==-1&&l.splice(u,2),this},this.getHandler=function(h){for(let u=0,d=l.length;u<d;u+=2){const f=l[u],p=l[u+1];if(f.global&&(f.lastIndex=0),f.test(h))return p}return null}}}const bb=new mb;class hi{constructor(e){this.manager=e!==void 0?e:bb,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){const n=this;return new Promise(function(i,r){n.load(e,i,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}}hi.DEFAULT_MATERIAL_NAME="__DEFAULT";const Gn={};class Eb extends Error{constructor(e,t){super(e),this.response=t}}class cs extends hi{constructor(e){super(e)}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=si.get(e);if(r!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0),r;if(Gn[e]!==void 0){Gn[e].push({onLoad:t,onProgress:n,onError:i});return}Gn[e]=[],Gn[e].push({onLoad:t,onProgress:n,onError:i});const a=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin"}),o=this.mimeType,c=this.responseType;fetch(a).then(l=>{if(l.status===200||l.status===0){if(l.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||l.body===void 0||l.body.getReader===void 0)return l;const h=Gn[e],u=l.body.getReader(),d=l.headers.get("Content-Length")||l.headers.get("X-File-Size"),f=d?parseInt(d):0,p=f!==0;let m=0;const g=new ReadableStream({start(A){b();function b(){u.read().then(({done:E,value:_})=>{if(E)A.close();else{m+=_.byteLength;const M=new ProgressEvent("progress",{lengthComputable:p,loaded:m,total:f});for(let v=0,S=h.length;v<S;v++){const D=h[v];D.onProgress&&D.onProgress(M)}A.enqueue(_),b()}})}}});return new Response(g)}else throw new Eb(`fetch for "${l.url}" responded with ${l.status}: ${l.statusText}`,l)}).then(l=>{switch(c){case"arraybuffer":return l.arrayBuffer();case"blob":return l.blob();case"document":return l.text().then(h=>new DOMParser().parseFromString(h,o));case"json":return l.json();default:if(o===void 0)return l.text();{const u=/charset="?([^;"\s]*)"?/i.exec(o),d=u&&u[1]?u[1].toLowerCase():void 0,f=new TextDecoder(d);return l.arrayBuffer().then(p=>f.decode(p))}}}).then(l=>{si.add(e,l);const h=Gn[e];delete Gn[e];for(let u=0,d=h.length;u<d;u++){const f=h[u];f.onLoad&&f.onLoad(l)}}).catch(l=>{const h=Gn[e];if(h===void 0)throw this.manager.itemError(e),l;delete Gn[e];for(let u=0,d=h.length;u<d;u++){const f=h[u];f.onError&&f.onError(l)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}}class _b extends hi{constructor(e){super(e)}load(e,t,n,i){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,a=si.get(e);if(a!==void 0)return r.manager.itemStart(e),setTimeout(function(){t&&t(a),r.manager.itemEnd(e)},0),a;const o=zs("img");function c(){h(),si.add(e,this),t&&t(this),r.manager.itemEnd(e)}function l(u){h(),i&&i(u),r.manager.itemError(e),r.manager.itemEnd(e)}function h(){o.removeEventListener("load",c,!1),o.removeEventListener("error",l,!1)}return o.addEventListener("load",c,!1),o.addEventListener("error",l,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),r.manager.itemStart(e),o.src=e,o}}class xb extends hi{constructor(e){super(e)}load(e,t,n,i){const r=new Ft,a=new _b(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(o){r.image=o,r.needsUpdate=!0,t!==void 0&&t(r)},n,i),r}}class sa extends Ze{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ae(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),t}}class yb extends sa{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Ze.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ae(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}}const Qa=new Fe,Wl=new y,ql=new y;class ic{constructor(e){this.camera=e,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new oe(512,512),this.map=null,this.mapPass=null,this.matrix=new Fe,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Go,this._frameExtents=new oe(1,1),this._viewportCount=1,this._viewports=[new at(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;Wl.setFromMatrixPosition(e.matrixWorld),t.position.copy(Wl),ql.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(ql),t.updateMatrixWorld(),Qa.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Qa),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Qa)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class vb extends ic{constructor(){super(new Yt(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1}updateMatrices(e){const t=this.camera,n=As*2*e.angle*this.focus,i=this.mapSize.width/this.mapSize.height,r=e.distance||t.far;(n!==t.fov||i!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=i,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class Uu extends sa{constructor(e,t,n=0,i=Math.PI/3,r=0,a=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(Ze.DEFAULT_UP),this.updateMatrix(),this.target=new Ze,this.distance=n,this.angle=i,this.penumbra=r,this.decay=a,this.map=null,this.shadow=new vb}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}const Xl=new Fe,Ts=new y,Oa=new y;class Cb extends ic{constructor(){super(new Yt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new oe(4,2),this._viewportCount=6,this._viewports=[new at(2,1,1,1),new at(0,1,1,1),new at(3,1,1,1),new at(1,1,1,1),new at(3,0,1,1),new at(1,0,1,1)],this._cubeDirections=[new y(1,0,0),new y(-1,0,0),new y(0,0,1),new y(0,0,-1),new y(0,1,0),new y(0,-1,0)],this._cubeUps=[new y(0,1,0),new y(0,1,0),new y(0,1,0),new y(0,1,0),new y(0,0,1),new y(0,0,-1)]}updateMatrices(e,t=0){const n=this.camera,i=this.matrix,r=e.distance||n.far;r!==n.far&&(n.far=r,n.updateProjectionMatrix()),Ts.setFromMatrixPosition(e.matrixWorld),n.position.copy(Ts),Oa.copy(n.position),Oa.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(Oa),n.updateMatrixWorld(),i.makeTranslation(-Ts.x,-Ts.y,-Ts.z),Xl.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Xl)}}class ls extends sa{constructor(e,t,n=0,i=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new Cb}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class Ib extends ic{constructor(){super(new Ho(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class sc extends sa{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Ze.DEFAULT_UP),this.updateMatrix(),this.target=new Ze,this.shadow=new Ib}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class ks{static decodeText(e){if(typeof TextDecoder<"u")return new TextDecoder().decode(e);let t="";for(let n=0,i=e.length;n<i;n++)t+=String.fromCharCode(e[n]);try{return decodeURIComponent(escape(t))}catch{return t}}static extractUrlBase(e){const t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}}class Sb extends hi{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&console.warn("THREE.ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"}}setOptions(e){return this.options=e,this}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,a=si.get(e);if(a!==void 0){if(r.manager.itemStart(e),a.then){a.then(l=>{t&&t(l),r.manager.itemEnd(e)}).catch(l=>{i&&i(l)});return}return setTimeout(function(){t&&t(a),r.manager.itemEnd(e)},0),a}const o={};o.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",o.headers=this.requestHeader;const c=fetch(e,o).then(function(l){return l.blob()}).then(function(l){return createImageBitmap(l,Object.assign(r.options,{colorSpaceConversion:"none"}))}).then(function(l){return si.add(e,l),t&&t(l),r.manager.itemEnd(e),l}).catch(function(l){i&&i(l),si.remove(e),r.manager.itemError(e),r.manager.itemEnd(e)});si.add(e,c),r.manager.itemStart(e)}}let Sr;class Nu{static getContext(){return Sr===void 0&&(Sr=new(window.AudioContext||window.webkitAudioContext)),Sr}static setContext(e){Sr=e}}class Mb extends hi{constructor(e){super(e)}load(e,t,n,i){const r=this,a=new cs(this.manager);a.setResponseType("arraybuffer"),a.setPath(this.path),a.setRequestHeader(this.requestHeader),a.setWithCredentials(this.withCredentials),a.load(e,function(c){try{const l=c.slice(0);Nu.getContext().decodeAudioData(l,function(u){t(u)}).catch(o)}catch(l){o(l)}},n,i);function o(c){i?i(c):console.error(c),r.manager.itemError(e)}}}class Qu{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=Yl(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const t=Yl();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}}function Yl(){return(typeof performance>"u"?Date:performance).now()}const mi=new y,Kl=new en,wb=new y,bi=new y;class Bb extends Ze{constructor(){super(),this.type="AudioListener",this.context=Nu.getContext(),this.gain=this.context.createGain(),this.gain.connect(this.context.destination),this.filter=null,this.timeDelta=0,this._clock=new Qu}getInput(){return this.gain}removeFilter(){return this.filter!==null&&(this.gain.disconnect(this.filter),this.filter.disconnect(this.context.destination),this.gain.connect(this.context.destination),this.filter=null),this}getFilter(){return this.filter}setFilter(e){return this.filter!==null?(this.gain.disconnect(this.filter),this.filter.disconnect(this.context.destination)):this.gain.disconnect(this.context.destination),this.filter=e,this.gain.connect(this.filter),this.filter.connect(this.context.destination),this}getMasterVolume(){return this.gain.gain.value}setMasterVolume(e){return this.gain.gain.setTargetAtTime(e,this.context.currentTime,.01),this}updateMatrixWorld(e){super.updateMatrixWorld(e);const t=this.context.listener,n=this.up;if(this.timeDelta=this._clock.getDelta(),this.matrixWorld.decompose(mi,Kl,wb),bi.set(0,0,-1).applyQuaternion(Kl),t.positionX){const i=this.context.currentTime+this.timeDelta;t.positionX.linearRampToValueAtTime(mi.x,i),t.positionY.linearRampToValueAtTime(mi.y,i),t.positionZ.linearRampToValueAtTime(mi.z,i),t.forwardX.linearRampToValueAtTime(bi.x,i),t.forwardY.linearRampToValueAtTime(bi.y,i),t.forwardZ.linearRampToValueAtTime(bi.z,i),t.upX.linearRampToValueAtTime(n.x,i),t.upY.linearRampToValueAtTime(n.y,i),t.upZ.linearRampToValueAtTime(n.z,i)}else t.setPosition(mi.x,mi.y,mi.z),t.setOrientation(bi.x,bi.y,bi.z,n.x,n.y,n.z)}}class Ou extends Ze{constructor(e){super(),this.type="Audio",this.listener=e,this.context=e.context,this.gain=this.context.createGain(),this.gain.connect(e.getInput()),this.autoplay=!1,this.buffer=null,this.detune=0,this.loop=!1,this.loopStart=0,this.loopEnd=0,this.offset=0,this.duration=void 0,this.playbackRate=1,this.isPlaying=!1,this.hasPlaybackControl=!0,this.source=null,this.sourceType="empty",this._startedAt=0,this._progress=0,this._connected=!1,this.filters=[]}getOutput(){return this.gain}setNodeSource(e){return this.hasPlaybackControl=!1,this.sourceType="audioNode",this.source=e,this.connect(),this}setMediaElementSource(e){return this.hasPlaybackControl=!1,this.sourceType="mediaNode",this.source=this.context.createMediaElementSource(e),this.connect(),this}setMediaStreamSource(e){return this.hasPlaybackControl=!1,this.sourceType="mediaStreamNode",this.source=this.context.createMediaStreamSource(e),this.connect(),this}setBuffer(e){return this.buffer=e,this.sourceType="buffer",this.autoplay&&this.play(),this}play(e=0){if(this.isPlaying===!0){console.warn("THREE.Audio: Audio is already playing.");return}if(this.hasPlaybackControl===!1){console.warn("THREE.Audio: this Audio has no playback control.");return}this._startedAt=this.context.currentTime+e;const t=this.context.createBufferSource();return t.buffer=this.buffer,t.loop=this.loop,t.loopStart=this.loopStart,t.loopEnd=this.loopEnd,t.onended=this.onEnded.bind(this),t.start(this._startedAt,this._progress+this.offset,this.duration),this.isPlaying=!0,this.source=t,this.setDetune(this.detune),this.setPlaybackRate(this.playbackRate),this.connect()}pause(){if(this.hasPlaybackControl===!1){console.warn("THREE.Audio: this Audio has no playback control.");return}return this.isPlaying===!0&&(this._progress+=Math.max(this.context.currentTime-this._startedAt,0)*this.playbackRate,this.loop===!0&&(this._progress=this._progress%(this.duration||this.buffer.duration)),this.source.stop(),this.source.onended=null,this.isPlaying=!1),this}stop(){if(this.hasPlaybackControl===!1){console.warn("THREE.Audio: this Audio has no playback control.");return}return this._progress=0,this.source!==null&&(this.source.stop(),this.source.onended=null),this.isPlaying=!1,this}connect(){if(this.filters.length>0){this.source.connect(this.filters[0]);for(let e=1,t=this.filters.length;e<t;e++)this.filters[e-1].connect(this.filters[e]);this.filters[this.filters.length-1].connect(this.getOutput())}else this.source.connect(this.getOutput());return this._connected=!0,this}disconnect(){if(this._connected!==!1){if(this.filters.length>0){this.source.disconnect(this.filters[0]);for(let e=1,t=this.filters.length;e<t;e++)this.filters[e-1].disconnect(this.filters[e]);this.filters[this.filters.length-1].disconnect(this.getOutput())}else this.source.disconnect(this.getOutput());return this._connected=!1,this}}getFilters(){return this.filters}setFilters(e){return e||(e=[]),this._connected===!0?(this.disconnect(),this.filters=e.slice(),this.connect()):this.filters=e.slice(),this}setDetune(e){if(this.detune=e,this.source.detune!==void 0)return this.isPlaying===!0&&this.source.detune.setTargetAtTime(this.detune,this.context.currentTime,.01),this}getDetune(){return this.detune}getFilter(){return this.getFilters()[0]}setFilter(e){return this.setFilters(e?[e]:[])}setPlaybackRate(e){if(this.hasPlaybackControl===!1){console.warn("THREE.Audio: this Audio has no playback control.");return}return this.playbackRate=e,this.isPlaying===!0&&this.source.playbackRate.setTargetAtTime(this.playbackRate,this.context.currentTime,.01),this}getPlaybackRate(){return this.playbackRate}onEnded(){this.isPlaying=!1}getLoop(){return this.hasPlaybackControl===!1?(console.warn("THREE.Audio: this Audio has no playback control."),!1):this.loop}setLoop(e){if(this.hasPlaybackControl===!1){console.warn("THREE.Audio: this Audio has no playback control.");return}return this.loop=e,this.isPlaying===!0&&(this.source.loop=this.loop),this}setLoopStart(e){return this.loopStart=e,this}setLoopEnd(e){return this.loopEnd=e,this}getVolume(){return this.gain.gain.value}setVolume(e){return this.gain.gain.setTargetAtTime(e,this.context.currentTime,.01),this}}const Ei=new y,jl=new en,Tb=new y,_i=new y;class Rb extends Ou{constructor(e){super(e),this.panner=this.context.createPanner(),this.panner.panningModel="HRTF",this.panner.connect(this.gain)}connect(){super.connect(),this.panner.connect(this.gain)}disconnect(){super.disconnect(),this.panner.disconnect(this.gain)}getOutput(){return this.panner}getRefDistance(){return this.panner.refDistance}setRefDistance(e){return this.panner.refDistance=e,this}getRolloffFactor(){return this.panner.rolloffFactor}setRolloffFactor(e){return this.panner.rolloffFactor=e,this}getDistanceModel(){return this.panner.distanceModel}setDistanceModel(e){return this.panner.distanceModel=e,this}getMaxDistance(){return this.panner.maxDistance}setMaxDistance(e){return this.panner.maxDistance=e,this}setDirectionalCone(e,t,n){return this.panner.coneInnerAngle=e,this.panner.coneOuterAngle=t,this.panner.coneOuterGain=n,this}updateMatrixWorld(e){if(super.updateMatrixWorld(e),this.hasPlaybackControl===!0&&this.isPlaying===!1)return;this.matrixWorld.decompose(Ei,jl,Tb),_i.set(0,0,1).applyQuaternion(jl);const t=this.panner;if(t.positionX){const n=this.context.currentTime+this.listener.timeDelta;t.positionX.linearRampToValueAtTime(Ei.x,n),t.positionY.linearRampToValueAtTime(Ei.y,n),t.positionZ.linearRampToValueAtTime(Ei.z,n),t.orientationX.linearRampToValueAtTime(_i.x,n),t.orientationY.linearRampToValueAtTime(_i.y,n),t.orientationZ.linearRampToValueAtTime(_i.z,n)}else t.setPosition(Ei.x,Ei.y,Ei.z),t.setOrientation(_i.x,_i.y,_i.z)}}class Db{constructor(e,t,n){this.binding=e,this.valueSize=n;let i,r,a;switch(t){case"quaternion":i=this._slerp,r=this._slerpAdditive,a=this._setAdditiveIdentityQuaternion,this.buffer=new Float64Array(n*6),this._workIndex=5;break;case"string":case"bool":i=this._select,r=this._select,a=this._setAdditiveIdentityOther,this.buffer=new Array(n*5);break;default:i=this._lerp,r=this._lerpAdditive,a=this._setAdditiveIdentityNumeric,this.buffer=new Float64Array(n*5)}this._mixBufferRegion=i,this._mixBufferRegionAdditive=r,this._setIdentity=a,this._origIndex=3,this._addIndex=4,this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,this.useCount=0,this.referenceCount=0}accumulate(e,t){const n=this.buffer,i=this.valueSize,r=e*i+i;let a=this.cumulativeWeight;if(a===0){for(let o=0;o!==i;++o)n[r+o]=n[o];a=t}else{a+=t;const o=t/a;this._mixBufferRegion(n,r,0,o,i)}this.cumulativeWeight=a}accumulateAdditive(e){const t=this.buffer,n=this.valueSize,i=n*this._addIndex;this.cumulativeWeightAdditive===0&&this._setIdentity(),this._mixBufferRegionAdditive(t,i,0,e,n),this.cumulativeWeightAdditive+=e}apply(e){const t=this.valueSize,n=this.buffer,i=e*t+t,r=this.cumulativeWeight,a=this.cumulativeWeightAdditive,o=this.binding;if(this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,r<1){const c=t*this._origIndex;this._mixBufferRegion(n,i,c,1-r,t)}a>0&&this._mixBufferRegionAdditive(n,i,this._addIndex*t,1,t);for(let c=t,l=t+t;c!==l;++c)if(n[c]!==n[c+t]){o.setValue(n,i);break}}saveOriginalState(){const e=this.binding,t=this.buffer,n=this.valueSize,i=n*this._origIndex;e.getValue(t,i);for(let r=n,a=i;r!==a;++r)t[r]=t[i+r%n];this._setIdentity(),this.cumulativeWeight=0,this.cumulativeWeightAdditive=0}restoreOriginalState(){const e=this.valueSize*3;this.binding.setValue(this.buffer,e)}_setAdditiveIdentityNumeric(){const e=this._addIndex*this.valueSize,t=e+this.valueSize;for(let n=e;n<t;n++)this.buffer[n]=0}_setAdditiveIdentityQuaternion(){this._setAdditiveIdentityNumeric(),this.buffer[this._addIndex*this.valueSize+3]=1}_setAdditiveIdentityOther(){const e=this._origIndex*this.valueSize,t=this._addIndex*this.valueSize;for(let n=0;n<this.valueSize;n++)this.buffer[t+n]=this.buffer[e+n]}_select(e,t,n,i,r){if(i>=.5)for(let a=0;a!==r;++a)e[t+a]=e[n+a]}_slerp(e,t,n,i){en.slerpFlat(e,t,e,t,e,n,i)}_slerpAdditive(e,t,n,i,r){const a=this._workIndex*r;en.multiplyQuaternionsFlat(e,a,e,t,e,n),en.slerpFlat(e,t,e,t,e,a,i)}_lerp(e,t,n,i,r){const a=1-i;for(let o=0;o!==r;++o){const c=t+o;e[c]=e[c]*a+e[n+o]*i}}_lerpAdditive(e,t,n,i,r){for(let a=0;a!==r;++a){const o=t+a;e[o]=e[o]+e[n+a]*i}}}const rc="\\[\\]\\.:\\/",Lb=new RegExp("["+rc+"]","g"),ac="[^"+rc+"]",Pb="[^"+rc.replace("\\.","")+"]",Fb=/((?:WC+[\/:])*)/.source.replace("WC",ac),Ub=/(WCOD+)?/.source.replace("WCOD",Pb),Nb=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",ac),Qb=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",ac),Ob=new RegExp("^"+Fb+Ub+Nb+Qb+"$"),kb=["material","materials","bones","map"];class Gb{constructor(e,t,n){const i=n||st.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,i)}getValue(e,t){this.bind();const n=this._targetGroup.nCachedObjects_,i=this._bindings[n];i!==void 0&&i.getValue(e,t)}setValue(e,t){const n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,r=n.length;i!==r;++i)n[i].setValue(e,t)}bind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}}class st{constructor(e,t,n){this.path=t,this.parsedPath=n||st.parseTrackName(t),this.node=st.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new st.Composite(e,t,n):new st(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(Lb,"")}static parseTrackName(e){const t=Ob.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);const n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){const r=n.nodeName.substring(i+1);kb.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,i),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){const n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){const n=function(r){for(let a=0;a<r.length;a++){const o=r[a];if(o.name===t||o.uuid===t)return o;const c=n(o.children);if(c)return c}return null},i=n(e.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)e[t++]=n[i]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++]}_setValue_array_setNeedsUpdate(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node;const t=this.parsedPath,n=t.objectName,i=t.propertyName;let r=t.propertyIndex;if(e||(e=st.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let l=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===l){l=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(l!==void 0){if(e[l]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[l]}}const a=e[i];if(a===void 0){const l=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+l+"."+i+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?o=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(r!==void 0){if(i==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}c=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(c=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}st.Composite=Gb;st.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};st.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};st.prototype.GetterByBindingType=[st.prototype._getValue_direct,st.prototype._getValue_array,st.prototype._getValue_arrayElement,st.prototype._getValue_toArray];st.prototype.SetterByBindingTypeAndVersioning=[[st.prototype._setValue_direct,st.prototype._setValue_direct_setNeedsUpdate,st.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[st.prototype._setValue_array,st.prototype._setValue_array_setNeedsUpdate,st.prototype._setValue_array_setMatrixWorldNeedsUpdate],[st.prototype._setValue_arrayElement,st.prototype._setValue_arrayElement_setNeedsUpdate,st.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[st.prototype._setValue_fromArray,st.prototype._setValue_fromArray_setNeedsUpdate,st.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];class Hb{constructor(e,t,n=null,i=t.blendMode){this._mixer=e,this._clip=t,this._localRoot=n,this.blendMode=i;const r=t.tracks,a=r.length,o=new Array(a),c={endingStart:ns,endingEnd:ns};for(let l=0;l!==a;++l){const h=r[l].createInterpolant(null);o[l]=h,h.settings=c}this._interpolantSettings=c,this._interpolants=o,this._propertyBindings=new Array(a),this._cacheIndex=null,this._byClipCacheIndex=null,this._timeScaleInterpolant=null,this._weightInterpolant=null,this.loop=of,this._loopCount=-1,this._startTime=null,this.time=0,this.timeScale=1,this._effectiveTimeScale=1,this.weight=1,this._effectiveWeight=1,this.repetitions=1/0,this.paused=!1,this.enabled=!0,this.clampWhenFinished=!1,this.zeroSlopeAtStart=!0,this.zeroSlopeAtEnd=!0}play(){return this._mixer._activateAction(this),this}stop(){return this._mixer._deactivateAction(this),this.reset()}reset(){return this.paused=!1,this.enabled=!0,this.time=0,this._loopCount=-1,this._startTime=null,this.stopFading().stopWarping()}isRunning(){return this.enabled&&!this.paused&&this.timeScale!==0&&this._startTime===null&&this._mixer._isActiveAction(this)}isScheduled(){return this._mixer._isActiveAction(this)}startAt(e){return this._startTime=e,this}setLoop(e,t){return this.loop=e,this.repetitions=t,this}setEffectiveWeight(e){return this.weight=e,this._effectiveWeight=this.enabled?e:0,this.stopFading()}getEffectiveWeight(){return this._effectiveWeight}fadeIn(e){return this._scheduleFading(e,0,1)}fadeOut(e){return this._scheduleFading(e,1,0)}crossFadeFrom(e,t,n){if(e.fadeOut(t),this.fadeIn(t),n){const i=this._clip.duration,r=e._clip.duration,a=r/i,o=i/r;e.warp(1,a,t),this.warp(o,1,t)}return this}crossFadeTo(e,t,n){return e.crossFadeFrom(this,t,n)}stopFading(){const e=this._weightInterpolant;return e!==null&&(this._weightInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}setEffectiveTimeScale(e){return this.timeScale=e,this._effectiveTimeScale=this.paused?0:e,this.stopWarping()}getEffectiveTimeScale(){return this._effectiveTimeScale}setDuration(e){return this.timeScale=this._clip.duration/e,this.stopWarping()}syncWith(e){return this.time=e.time,this.timeScale=e.timeScale,this.stopWarping()}halt(e){return this.warp(this._effectiveTimeScale,0,e)}warp(e,t,n){const i=this._mixer,r=i.time,a=this.timeScale;let o=this._timeScaleInterpolant;o===null&&(o=i._lendControlInterpolant(),this._timeScaleInterpolant=o);const c=o.parameterPositions,l=o.sampleValues;return c[0]=r,c[1]=r+n,l[0]=e/a,l[1]=t/a,this}stopWarping(){const e=this._timeScaleInterpolant;return e!==null&&(this._timeScaleInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}getMixer(){return this._mixer}getClip(){return this._clip}getRoot(){return this._localRoot||this._mixer._root}_update(e,t,n,i){if(!this.enabled){this._updateWeight(e);return}const r=this._startTime;if(r!==null){const c=(e-r)*n;c<0||n===0?t=0:(this._startTime=null,t=n*c)}t*=this._updateTimeScale(e);const a=this._updateTime(t),o=this._updateWeight(e);if(o>0){const c=this._interpolants,l=this._propertyBindings;switch(this.blendMode){case lf:for(let h=0,u=c.length;h!==u;++h)c[h].evaluate(a),l[h].accumulateAdditive(o);break;case Qo:default:for(let h=0,u=c.length;h!==u;++h)c[h].evaluate(a),l[h].accumulate(i,o)}}}_updateWeight(e){let t=0;if(this.enabled){t=this.weight;const n=this._weightInterpolant;if(n!==null){const i=n.evaluate(e)[0];t*=i,e>n.parameterPositions[1]&&(this.stopFading(),i===0&&(this.enabled=!1))}}return this._effectiveWeight=t,t}_updateTimeScale(e){let t=0;if(!this.paused){t=this.timeScale;const n=this._timeScaleInterpolant;if(n!==null){const i=n.evaluate(e)[0];t*=i,e>n.parameterPositions[1]&&(this.stopWarping(),t===0?this.paused=!0:this.timeScale=t)}}return this._effectiveTimeScale=t,t}_updateTime(e){const t=this._clip.duration,n=this.loop;let i=this.time+e,r=this._loopCount;const a=n===cf;if(e===0)return r===-1?i:a&&(r&1)===1?t-i:i;if(n===af){r===-1&&(this._loopCount=0,this._setEndings(!0,!0,!1));e:{if(i>=t)i=t;else if(i<0)i=0;else{this.time=i;break e}this.clampWhenFinished?this.paused=!0:this.enabled=!1,this.time=i,this._mixer.dispatchEvent({type:"finished",action:this,direction:e<0?-1:1})}}else{if(r===-1&&(e>=0?(r=0,this._setEndings(!0,this.repetitions===0,a)):this._setEndings(this.repetitions===0,!0,a)),i>=t||i<0){const o=Math.floor(i/t);i-=t*o,r+=Math.abs(o);const c=this.repetitions-r;if(c<=0)this.clampWhenFinished?this.paused=!0:this.enabled=!1,i=e>0?t:0,this.time=i,this._mixer.dispatchEvent({type:"finished",action:this,direction:e>0?1:-1});else{if(c===1){const l=e<0;this._setEndings(l,!l,a)}else this._setEndings(!1,!1,a);this._loopCount=r,this.time=i,this._mixer.dispatchEvent({type:"loop",action:this,loopDelta:o})}}else this.time=i;if(a&&(r&1)===1)return t-i}return i}_setEndings(e,t,n){const i=this._interpolantSettings;n?(i.endingStart=is,i.endingEnd=is):(e?i.endingStart=this.zeroSlopeAtStart?is:ns:i.endingStart=Vr,t?i.endingEnd=this.zeroSlopeAtEnd?is:ns:i.endingEnd=Vr)}_scheduleFading(e,t,n){const i=this._mixer,r=i.time;let a=this._weightInterpolant;a===null&&(a=i._lendControlInterpolant(),this._weightInterpolant=a);const o=a.parameterPositions,c=a.sampleValues;return o[0]=r,c[0]=t,o[1]=r+e,c[1]=n,this}}const zb=new Float32Array(1);class Vb extends Di{constructor(e){super(),this._root=e,this._initMemoryManager(),this._accuIndex=0,this.time=0,this.timeScale=1}_bindAction(e,t){const n=e._localRoot||this._root,i=e._clip.tracks,r=i.length,a=e._propertyBindings,o=e._interpolants,c=n.uuid,l=this._bindingsByRootAndName;let h=l[c];h===void 0&&(h={},l[c]=h);for(let u=0;u!==r;++u){const d=i[u],f=d.name;let p=h[f];if(p!==void 0)++p.referenceCount,a[u]=p;else{if(p=a[u],p!==void 0){p._cacheIndex===null&&(++p.referenceCount,this._addInactiveBinding(p,c,f));continue}const m=t&&t._propertyBindings[u].binding.parsedPath;p=new Db(st.create(n,f,m),d.ValueTypeName,d.getValueSize()),++p.referenceCount,this._addInactiveBinding(p,c,f),a[u]=p}o[u].resultBuffer=p.buffer}}_activateAction(e){if(!this._isActiveAction(e)){if(e._cacheIndex===null){const n=(e._localRoot||this._root).uuid,i=e._clip.uuid,r=this._actionsByClip[i];this._bindAction(e,r&&r.knownActions[0]),this._addInactiveAction(e,i,n)}const t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){const r=t[n];r.useCount++===0&&(this._lendBinding(r),r.saveOriginalState())}this._lendAction(e)}}_deactivateAction(e){if(this._isActiveAction(e)){const t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){const r=t[n];--r.useCount===0&&(r.restoreOriginalState(),this._takeBackBinding(r))}this._takeBackAction(e)}}_initMemoryManager(){this._actions=[],this._nActiveActions=0,this._actionsByClip={},this._bindings=[],this._nActiveBindings=0,this._bindingsByRootAndName={},this._controlInterpolants=[],this._nActiveControlInterpolants=0;const e=this;this.stats={actions:{get total(){return e._actions.length},get inUse(){return e._nActiveActions}},bindings:{get total(){return e._bindings.length},get inUse(){return e._nActiveBindings}},controlInterpolants:{get total(){return e._controlInterpolants.length},get inUse(){return e._nActiveControlInterpolants}}}}_isActiveAction(e){const t=e._cacheIndex;return t!==null&&t<this._nActiveActions}_addInactiveAction(e,t,n){const i=this._actions,r=this._actionsByClip;let a=r[t];if(a===void 0)a={knownActions:[e],actionByRoot:{}},e._byClipCacheIndex=0,r[t]=a;else{const o=a.knownActions;e._byClipCacheIndex=o.length,o.push(e)}e._cacheIndex=i.length,i.push(e),a.actionByRoot[n]=e}_removeInactiveAction(e){const t=this._actions,n=t[t.length-1],i=e._cacheIndex;n._cacheIndex=i,t[i]=n,t.pop(),e._cacheIndex=null;const r=e._clip.uuid,a=this._actionsByClip,o=a[r],c=o.knownActions,l=c[c.length-1],h=e._byClipCacheIndex;l._byClipCacheIndex=h,c[h]=l,c.pop(),e._byClipCacheIndex=null;const u=o.actionByRoot,d=(e._localRoot||this._root).uuid;delete u[d],c.length===0&&delete a[r],this._removeInactiveBindingsForAction(e)}_removeInactiveBindingsForAction(e){const t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){const r=t[n];--r.referenceCount===0&&this._removeInactiveBinding(r)}}_lendAction(e){const t=this._actions,n=e._cacheIndex,i=this._nActiveActions++,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_takeBackAction(e){const t=this._actions,n=e._cacheIndex,i=--this._nActiveActions,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_addInactiveBinding(e,t,n){const i=this._bindingsByRootAndName,r=this._bindings;let a=i[t];a===void 0&&(a={},i[t]=a),a[n]=e,e._cacheIndex=r.length,r.push(e)}_removeInactiveBinding(e){const t=this._bindings,n=e.binding,i=n.rootNode.uuid,r=n.path,a=this._bindingsByRootAndName,o=a[i],c=t[t.length-1],l=e._cacheIndex;c._cacheIndex=l,t[l]=c,t.pop(),delete o[r],Object.keys(o).length===0&&delete a[i]}_lendBinding(e){const t=this._bindings,n=e._cacheIndex,i=this._nActiveBindings++,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_takeBackBinding(e){const t=this._bindings,n=e._cacheIndex,i=--this._nActiveBindings,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_lendControlInterpolant(){const e=this._controlInterpolants,t=this._nActiveControlInterpolants++;let n=e[t];return n===void 0&&(n=new Pu(new Float32Array(2),new Float32Array(2),1,zb),n.__cacheIndex=t,e[t]=n),n}_takeBackControlInterpolant(e){const t=this._controlInterpolants,n=e.__cacheIndex,i=--this._nActiveControlInterpolants,r=t[i];e.__cacheIndex=i,t[i]=e,r.__cacheIndex=n,t[n]=r}clipAction(e,t,n){const i=t||this._root,r=i.uuid;let a=typeof e=="string"?Mo.findByName(i,e):e;const o=a!==null?a.uuid:e,c=this._actionsByClip[o];let l=null;if(n===void 0&&(a!==null?n=a.blendMode:n=Qo),c!==void 0){const u=c.actionByRoot[r];if(u!==void 0&&u.blendMode===n)return u;l=c.knownActions[0],a===null&&(a=l._clip)}if(a===null)return null;const h=new Hb(this,a,t,n);return this._bindAction(h,l),this._addInactiveAction(h,o,r),h}existingAction(e,t){const n=t||this._root,i=n.uuid,r=typeof e=="string"?Mo.findByName(n,e):e,a=r?r.uuid:e,o=this._actionsByClip[a];return o!==void 0&&o.actionByRoot[i]||null}stopAllAction(){const e=this._actions,t=this._nActiveActions;for(let n=t-1;n>=0;--n)e[n].stop();return this}update(e){e*=this.timeScale;const t=this._actions,n=this._nActiveActions,i=this.time+=e,r=Math.sign(e),a=this._accuIndex^=1;for(let l=0;l!==n;++l)t[l]._update(i,e,r,a);const o=this._bindings,c=this._nActiveBindings;for(let l=0;l!==c;++l)o[l].apply(a);return this}setTime(e){this.time=0;for(let t=0;t<this._actions.length;t++)this._actions[t].time=0;return this.update(e)}getRoot(){return this._root}uncacheClip(e){const t=this._actions,n=e.uuid,i=this._actionsByClip,r=i[n];if(r!==void 0){const a=r.knownActions;for(let o=0,c=a.length;o!==c;++o){const l=a[o];this._deactivateAction(l);const h=l._cacheIndex,u=t[t.length-1];l._cacheIndex=null,l._byClipCacheIndex=null,u._cacheIndex=h,t[h]=u,t.pop(),this._removeInactiveBindingsForAction(l)}delete i[n]}}uncacheRoot(e){const t=e.uuid,n=this._actionsByClip;for(const a in n){const o=n[a].actionByRoot,c=o[t];c!==void 0&&(this._deactivateAction(c),this._removeInactiveAction(c))}const i=this._bindingsByRootAndName,r=i[t];if(r!==void 0)for(const a in r){const o=r[a];o.restoreOriginalState(),this._removeInactiveBinding(o)}}uncacheAction(e,t){const n=this.existingAction(e,t);n!==null&&(this._deactivateAction(n),this._removeInactiveAction(n))}}class ku{constructor(e,t,n=0,i=1/0){this.ray=new qs(e,t),this.near=n,this.far=i,this.camera=null,this.layers=new ko,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}intersectObject(e,t=!0,n=[]){return wo(e,this,n,t),n.sort(Jl),n}intersectObjects(e,t=!0,n=[]){for(let i=0,r=e.length;i<r;i++)wo(e[i],this,n,t);return n.sort(Jl),n}}function Jl(s,e){return s.distance-e.distance}function wo(s,e,t,n){if(s.layers.test(e.layers)&&s.raycast(e,t),n===!0){const i=s.children;for(let r=0,a=i.length;r<a;r++)wo(i[r],e,t,!0)}}const Zl=new y,Mr=new y;class Wb{constructor(e=new y,t=new y){this.start=e,this.end=t}set(e,t){return this.start.copy(e),this.end.copy(t),this}copy(e){return this.start.copy(e.start),this.end.copy(e.end),this}getCenter(e){return e.addVectors(this.start,this.end).multiplyScalar(.5)}delta(e){return e.subVectors(this.end,this.start)}distanceSq(){return this.start.distanceToSquared(this.end)}distance(){return this.start.distanceTo(this.end)}at(e,t){return this.delta(t).multiplyScalar(e).add(this.start)}closestPointToPointParameter(e,t){Zl.subVectors(e,this.start),Mr.subVectors(this.end,this.start);const n=Mr.dot(Mr);let r=Mr.dot(Zl)/n;return t&&(r=Rt(r,0,1)),r}closestPointToPoint(e,t,n){const i=this.closestPointToPointParameter(e,t);return this.delta(n).multiplyScalar(i).add(this.start)}applyMatrix4(e){return this.start.applyMatrix4(e),this.end.applyMatrix4(e),this}equals(e){return e.start.equals(this.start)&&e.end.equals(this.end)}clone(){return new this.constructor().copy(this)}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Fo}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Fo);function Gu(){try{return import.meta}catch(s){console.debug("import.meta is not available in this environment",s);return}}function Or(s){return typeof s!="string"||s.length===0||s.endsWith("/")?s:`${s}/`}function qb(){const s=Gu();if(!s||typeof s.url!="string")return null;try{const e=new URL(s.url),{pathname:t}=e,n=t.lastIndexOf("/assets/");if(n>=0){const i=t.slice(0,n+1);return Or(i)}}catch(e){console.debug("Failed to derive bundled base URL from import.meta.url",e)}return null}function oc(){var n;const s=Gu(),e=s&&s.env?s.env.BASE_URL:void 0;if(typeof e=="string"&&e.length>0&&e!=="/")return Or(e);const t=qb();if(t)return t;if(typeof e=="string"&&e.length>0)return Or(e);if(typeof window<"u"&&typeof((n=window.location)==null?void 0:n.pathname)=="string"){const{pathname:i}=window.location;if(i&&i!==""){const r=i.lastIndexOf("/");if(r>=0)return Or(i.slice(0,r+1))}}return"/"}function Xb(){var e;const s=oc();if(typeof window>"u"||!((e=window.location)!=null&&e.origin))return new URL(s,"http://localhost");try{return new URL(s,window.location.origin)}catch{return new URL("/",window.location.origin)}}class Yb{constructor(e,t,n,i){this.scene=e,this.camera=t,this.lightingRef=n,this.anchors=i,this.listener=new Bb,this.camera.add(this.listener),this.loader=new Mb;const r=this.listener.context;this.masterGain=r.createGain(),this.masterGain.gain.value=.9,this.masterGain.connect(this.listener.getInput()),this.bus={ambience:r.createGain(),voices:r.createGain(),effects:r.createGain()},this.bus.ambience.gain.value=.9,this.bus.voices.gain.value=.7,this.bus.effects.gain.value=.7,this.bus.ambience.connect(this.masterGain),this.bus.voices.connect(this.masterGain),this.bus.effects.connect(this.masterGain),this.buffers=new Map,this.emitters=[],this.oneShotTimers=[],this.ready=!1,this.zones={harbor:{pos:i.harbor,radius:50},agora:{pos:i.agora,radius:40},acropolis:{pos:i.acropolis,radius:40}}}logMissing(e,t){console.info(`[audio] Optional asset missing: ${e} (${t}). Drop a file at public/${t} to enable.`)}async loadBuffer(e,t){if(!t)return null;const n=this.buffers.get(e);if(n)return n;try{const i=await new Promise((r,a)=>this.loader.load(t,r,void 0,a));return this.buffers.set(e,i),i}catch{return this.logMissing(e,t),null}}_makePositional(e,t,n="ambience",{loop:i=!0,volume:r=.6,refDistance:a=12,maxDistance:o=80,rolloff:c=1}={}){if(!e)return null;const l=new Rb(this.listener);l.setBuffer(e),l.setLoop(i),l.setRefDistance(a),l.setMaxDistance(o),l.setRolloffFactor(c),l.setVolume(r),l.userData.group=n;const h=l.getOutput?l.getOutput():l.source;if(h&&this.bus[n]){try{h.disconnect()}catch{}h.connect(this.bus[n])}const u=new Ze;return u.position.copy(t),u.add(l),this.scene.add(u),this.emitters.push({obj:u,src:l,group:n}),l}_makeGlobal(e,t="ambience",{loop:n=!0,volume:i=.3}={}){if(!e)return null;const r=new Ou(this.listener);r.setBuffer(e),r.setLoop(n),r.setVolume(i),r.userData.group=t;const a=r.getOutput?r.getOutput():r.source;if(a&&this.bus[t]){try{a.disconnect()}catch{}a.connect(this.bus[t])}return this.emitters.push({obj:this.camera,src:r,group:t}),r}async initFromManifest(e="audio/manifest.json"){var M,v,S,D,x,C;const t=Xb(),n=oc(),i=t,r=R=>{if(!R)return R;try{return new URL(R,i).toString()}catch{return console.warn(`[audio] Failed to resolve asset path: ${R}. Using as-is.`),R}};function a(R){return(R.headers.get("content-type")||"").includes("text/html")}async function o(R){try{const U=await fetch(R,{method:"GET"});return!U.ok||a(U)||!(U.headers.get("content-type")||"").includes("json")?null:await U.json()}catch{return null}}const c=[r(e),r(`${n}audio/manifest.json`)];let l=null;for(const R of c){console.log("[audio] manifest probe:",R);const U=await o(R);if(U){l=U;break}}l||(console.warn("[audio] manifest.json not found via candidates:",c),l={ambient:{},effects:{}});const h=l.ambient??{},u=l.effects??{},d=await this.loadBuffer("sea",r(h.sea)),f=await this.loadBuffer("gulls",r(h.gulls)),p=await this.loadBuffer("wind",r(h.wind)),m=await this.loadBuffer("market",r(h.market)),g=await this.loadBuffer("fountain",r(h.fountain)),A=await this.loadBuffer("lyre",r(h.lyre)),b=await this.loadBuffer("blacksmith",r(u.blacksmith)),E=await this.loadBuffer("goats",r(u.goats)),_=await this.loadBuffer("cart",r(u.cart));(M=this._makeGlobal(d,"ambience",{volume:.25}))==null||M.play(),(v=this._makeGlobal(p,"ambience",{volume:.05}))==null||v.play(),(S=this._makePositional(f,this.zones.harbor.pos,"ambience",{volume:.35,refDistance:16,maxDistance:120}))==null||S.play(),(D=this._makePositional(m,this.zones.agora.pos,"voices",{volume:.35,refDistance:10}))==null||D.play(),(x=this._makePositional(g,this.zones.agora.pos.clone().add(new y(6,0,-4)),"ambience",{volume:.25,refDistance:8}))==null||x.play(),(C=this._makePositional(A,this.zones.acropolis.pos,"ambience",{volume:.22,refDistance:10}))==null||C.play(),this.scheduleOneShots(b,this.zones.agora.pos.clone().add(new y(-8,0,6)),"effects",12,22),this.scheduleOneShots(E,this.zones.harbor.pos.clone().add(new y(18,0,10)),"effects",18,38),this.scheduleOneShots(_,this.zones.agora.pos.clone().add(new y(12,0,-12)),"effects",25,45),this.ready=!0}scheduleOneShots(e,t,n,i=12,r=24){if(!e)return;const a=()=>{const l=this._makePositional(e,t,n,{loop:!1,volume:.35,refDistance:8});l&&l.play();const h=(Math.random()*(r-i)+i)*1e3,u=setTimeout(a,h);this.oneShotTimers.push(u)},o=(Math.random()*(r-i)+i)*1e3,c=setTimeout(a,o);this.oneShotTimers.push(c)}update(e){var i,r;if(!this.ready)return;const t=((r=(i=this.lightingRef)==null?void 0:i.getNightFactor)==null?void 0:r.call(i))??0,n=(a,o,c)=>a+(o-a)*c;this.bus.voices.gain.value=n(.75,.35,t),this.bus.ambience.gain.value=n(.85,.95,t),this.masterGain.gain.value=n(.9,.8,t)}async ensureUserGestureResume(){const e=this.listener.context;if(e.state==="running")return;const t=async()=>{try{await e.resume()}catch{}window.removeEventListener("pointerdown",t),window.removeEventListener("keydown",t)};window.addEventListener("pointerdown",t),window.addEventListener("keydown",t)}dispose(){this.emitters.forEach(({obj:e,src:t})=>{try{t.stop()}catch{}e&&e!==this.camera&&this.scene.remove(e)}),this.oneShotTimers.forEach(e=>clearTimeout(e)),this.emitters=[],this.buffers.clear();try{this.camera.remove(this.listener)}catch{}}}function Kb(s,e={}){if(!s)return null;const t=e.key??"F10",n=document.createElement("div");Object.assign(n.style,{position:"fixed",top:"12px",right:"170px",padding:"10px 12px",background:"rgba(0,0,0,0.55)",backdropFilter:"blur(4px)",borderRadius:"10px",color:"#fff",font:"12px/1.2 ui-sans-serif, system-ui",zIndex:9999,userSelect:"none"});const i=(a,o,c=.8)=>{const l=document.createElement("div");l.style.display="flex",l.style.alignItems="center",l.style.margin="4px 0";const h=document.createElement("span");h.textContent=a,h.style.width="80px";const u=document.createElement("input");return u.type="range",u.min="0",u.max="1",u.step="0.01",u.value=String(c),u.style.width="140px",u.addEventListener("input",()=>{o.gain.value=Number(u.value)}),l.appendChild(h),l.appendChild(u),l};n.appendChild(i("Master",s.masterGain,.9)),n.appendChild(i("Ambience",s.bus.ambience,.9)),n.appendChild(i("Voices",s.bus.voices,.7)),n.appendChild(i("Effects",s.bus.effects,.7)),document.body.appendChild(n);const r=a=>{a.key===t&&(n.style.display=n.style.display!=="none"?"none":"block",a.preventDefault())};return window.addEventListener("keydown",r),{dispose(){window.removeEventListener("keydown",r),n.remove()}}}class ra extends _e{constructor(){const e=ra.SkyShader,t=new Xn({name:e.name,uniforms:jr.clone(e.uniforms),vertexShader:e.vertexShader,fragmentShader:e.fragmentShader,side:$t,depthWrite:!1});super(new Gt(1,1,1),t),this.isSky=!0}}ra.SkyShader={name:"SkyShader",uniforms:{turbidity:{value:2},rayleigh:{value:1},mieCoefficient:{value:.005},mieDirectionalG:{value:.8},sunPosition:{value:new y},up:{value:new y(0,1,0)}},vertexShader:`
		uniform vec3 sunPosition;
		uniform float rayleigh;
		uniform float turbidity;
		uniform float mieCoefficient;
		uniform vec3 up;

		varying vec3 vWorldPosition;
		varying vec3 vSunDirection;
		varying float vSunfade;
		varying vec3 vBetaR;
		varying vec3 vBetaM;
		varying float vSunE;

		// constants for atmospheric scattering
		const float e = 2.71828182845904523536028747135266249775724709369995957;
		const float pi = 3.141592653589793238462643383279502884197169;

		// wavelength of used primaries, according to preetham
		const vec3 lambda = vec3( 680E-9, 550E-9, 450E-9 );
		// this pre-calcuation replaces older TotalRayleigh(vec3 lambda) function:
		// (8.0 * pow(pi, 3.0) * pow(pow(n, 2.0) - 1.0, 2.0) * (6.0 + 3.0 * pn)) / (3.0 * N * pow(lambda, vec3(4.0)) * (6.0 - 7.0 * pn))
		const vec3 totalRayleigh = vec3( 5.804542996261093E-6, 1.3562911419845635E-5, 3.0265902468824876E-5 );

		// mie stuff
		// K coefficient for the primaries
		const float v = 4.0;
		const vec3 K = vec3( 0.686, 0.678, 0.666 );
		// MieConst = pi * pow( ( 2.0 * pi ) / lambda, vec3( v - 2.0 ) ) * K
		const vec3 MieConst = vec3( 1.8399918514433978E14, 2.7798023919660528E14, 4.0790479543861094E14 );

		// earth shadow hack
		// cutoffAngle = pi / 1.95;
		const float cutoffAngle = 1.6110731556870734;
		const float steepness = 1.5;
		const float EE = 1000.0;

		float sunIntensity( float zenithAngleCos ) {
			zenithAngleCos = clamp( zenithAngleCos, -1.0, 1.0 );
			return EE * max( 0.0, 1.0 - pow( e, -( ( cutoffAngle - acos( zenithAngleCos ) ) / steepness ) ) );
		}

		vec3 totalMie( float T ) {
			float c = ( 0.2 * T ) * 10E-18;
			return 0.434 * c * MieConst;
		}

		void main() {

			vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
			vWorldPosition = worldPosition.xyz;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			gl_Position.z = gl_Position.w; // set z to camera.far

			vSunDirection = normalize( sunPosition );

			vSunE = sunIntensity( dot( vSunDirection, up ) );

			vSunfade = 1.0 - clamp( 1.0 - exp( ( sunPosition.y / 450000.0 ) ), 0.0, 1.0 );

			float rayleighCoefficient = rayleigh - ( 1.0 * ( 1.0 - vSunfade ) );

			// extinction (absorbtion + out scattering)
			// rayleigh coefficients
			vBetaR = totalRayleigh * rayleighCoefficient;

			// mie coefficients
			vBetaM = totalMie( turbidity ) * mieCoefficient;

		}`,fragmentShader:`
		varying vec3 vWorldPosition;
		varying vec3 vSunDirection;
		varying float vSunfade;
		varying vec3 vBetaR;
		varying vec3 vBetaM;
		varying float vSunE;

		uniform float mieDirectionalG;
		uniform vec3 up;

		// constants for atmospheric scattering
		const float pi = 3.141592653589793238462643383279502884197169;

		const float n = 1.0003; // refractive index of air
		const float N = 2.545E25; // number of molecules per unit volume for air at 288.15K and 1013mb (sea level -45 celsius)

		// optical length at zenith for molecules
		const float rayleighZenithLength = 8.4E3;
		const float mieZenithLength = 1.25E3;
		// 66 arc seconds -> degrees, and the cosine of that
		const float sunAngularDiameterCos = 0.999956676946448443553574619906976478926848692873900859324;

		// 3.0 / ( 16.0 * pi )
		const float THREE_OVER_SIXTEENPI = 0.05968310365946075;
		// 1.0 / ( 4.0 * pi )
		const float ONE_OVER_FOURPI = 0.07957747154594767;

		float rayleighPhase( float cosTheta ) {
			return THREE_OVER_SIXTEENPI * ( 1.0 + pow( cosTheta, 2.0 ) );
		}

		float hgPhase( float cosTheta, float g ) {
			float g2 = pow( g, 2.0 );
			float inverse = 1.0 / pow( 1.0 - 2.0 * g * cosTheta + g2, 1.5 );
			return ONE_OVER_FOURPI * ( ( 1.0 - g2 ) * inverse );
		}

		void main() {

			vec3 direction = normalize( vWorldPosition - cameraPosition );

			// optical length
			// cutoff angle at 90 to avoid singularity in next formula.
			float zenithAngle = acos( max( 0.0, dot( up, direction ) ) );
			float inverse = 1.0 / ( cos( zenithAngle ) + 0.15 * pow( 93.885 - ( ( zenithAngle * 180.0 ) / pi ), -1.253 ) );
			float sR = rayleighZenithLength * inverse;
			float sM = mieZenithLength * inverse;

			// combined extinction factor
			vec3 Fex = exp( -( vBetaR * sR + vBetaM * sM ) );

			// in scattering
			float cosTheta = dot( direction, vSunDirection );

			float rPhase = rayleighPhase( cosTheta * 0.5 + 0.5 );
			vec3 betaRTheta = vBetaR * rPhase;

			float mPhase = hgPhase( cosTheta, mieDirectionalG );
			vec3 betaMTheta = vBetaM * mPhase;

			vec3 Lin = pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * ( 1.0 - Fex ), vec3( 1.5 ) );
			Lin *= mix( vec3( 1.0 ), pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * Fex, vec3( 1.0 / 2.0 ) ), clamp( pow( 1.0 - dot( up, vSunDirection ), 5.0 ), 0.0, 1.0 ) );

			// nightsky
			float theta = acos( direction.y ); // elevation --> y-axis, [-pi/2, pi/2]
			float phi = atan( direction.z, direction.x ); // azimuth --> x-axis [-pi/2, pi/2]
			vec2 uv = vec2( phi, theta ) / vec2( 2.0 * pi, pi ) + vec2( 0.5, 0.0 );
			vec3 L0 = vec3( 0.1 ) * Fex;

			// composition + solar disc
			float sundisk = smoothstep( sunAngularDiameterCos, sunAngularDiameterCos + 0.00002, cosTheta );
			L0 += ( vSunE * 19000.0 * Fex ) * sundisk;

			vec3 texColor = ( Lin + L0 ) * 0.04 + vec3( 0.0, 0.0003, 0.00075 );

			vec3 retColor = pow( texColor, vec3( 1.0 / ( 1.2 + ( 1.2 * vSunfade ) ) ) );

			gl_FragColor = vec4( retColor, 1.0 );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>

		}`};const jb=1e3;function Jb(s){const e=new ra;e.scale.setScalar(45e4),e.userData.noCollision=!0;const t=e.material.uniforms;return t.turbidity.value=10,t.rayleigh.value=2,t.mieCoefficient.value=.005,t.mieDirectionalG.value=.8,t.sunPosition.value.set(0,1,0),s.add(e),{sky:e}}const Hu=new y(0,1,0);function zu(s){return!Number.isFinite(s)||s<0?0:s>1?1:s}function ka(s,e){if(!s||typeof s!="object")return 0;const t=zu(e);return s.timeOfDayPhase=t,t}function Zb(s,e=Hu){const n=zu(s)*Math.PI*2;return e.set(Math.cos(n),Math.sin(n),0),e}function $l(s,e){const{sky:t}=s||{};if(!t||!t.material||!t.material.uniforms||!t.material.uniforms.sunPosition)return;const n=(e==null?void 0:e.timeOfDayPhase)??0,i=Zb(n,Hu);return t.material.uniforms.sunPosition.value.copy(i).normalize(),i}function $b(s,e){const t=Math.max(0,e),n=new It,i=new Float32Array(t*3);for(let o=0;o<t;o++){const c=new y(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1).normalize(),l=jb*(.8+Math.random()*.2),h=o*3;i[h]=c.x*l,i[h+1]=c.y*l,i[h+2]=c.z*l}n.setAttribute("position",new Ut(i,3));const r=new Yo({size:1.2,color:16777215,transparent:!0,opacity:0,depthWrite:!1,blending:co}),a=new wu(n,r);return a.matrixAutoUpdate=!1,a.updateMatrix(),s.add(a),a}function eh(s,e){if(!s)return;const t=s.material;if(!t)return;const n=Math.sin(e*Math.PI*2),a=1-Ie.smoothstep(n,-.2,.1);t.opacity=Ie.lerp(t.opacity,a,.05)}const eE=new Ae("#ffb37f"),tE=new Ae("#ffffff"),nE=new Ae("#ff9f76"),iE=new Ae("#0b1d51"),Vu=new Ae("#bde0fe"),sE=new Ae("#1f1f2e"),Wu=new Ae("#9d8189"),rE=new Ae,qu=new y;function Ga(s,e,t,n){return s.copy(e).lerp(t,n),s}function aE(s){const e=new sc(16777215,1);e.castShadow=!0,e.shadow.mapSize.set(1024,1024),e.shadow.bias=-5e-4;const t=e.shadow.camera;t.near=1,t.far=300,t.left=-120,t.right=120,t.top=120,t.bottom=-120,e.shadow.normalBias=.02,e.shadow.camera.updateProjectionMatrix(),s.add(e),s.add(e.target);const n=new yb(Vu,Wu,.6);return s.add(n),{sunLight:e,hemiLight:n,nightFactor:0}}function th(s,e){if(!s||!s.sunLight||!s.hemiLight)return;const{sunLight:t,hemiLight:n}=s,i=qu.copy(e).normalize(),r=i.y,a=Ie.clamp(Ie.smoothstep(r,-.15,.1),0,1),o=1-a;t.position.copy(i).multiplyScalar(100),t.target.position.set(0,0,0),t.target.updateMatrixWorld();const c=Ie.lerp(.05,1.4,a);t.intensity=Ie.lerp(t.intensity,c,.1);const h=Ga(rE,eE,tE,a).lerp(nE,o*.55);t.color.copy(h);const u=Ie.lerp(.12,.95,a);n.intensity=Ie.lerp(n.intensity,u,.1),Ga(n.color,iE,Vu,a),Ga(n.groundColor,sE,Wu,a),s.nightFactor=o}function oE(s){const e=new sc(12574719,.2);e.castShadow=!1;const t=new oi(5,16,16),n=new Mn({color:15661055,transparent:!0,opacity:.3}),i=new _e(t,n),r=new gt;return r.userData.noCollision=!0,r.add(e),r.add(i),s.add(r),s.add(e.target),{light:e,mesh:i,group:r}}function nh(s,e){if(!s||!e)return;const{light:t,mesh:n,group:i}=s,r=qu.copy(e).multiplyScalar(-1).normalize();i.position.copy(r.multiplyScalar(400)),t.position.set(0,0,0),t.target.position.set(0,0,0),t.target.updateMatrixWorld(),n&&n.position.set(0,0,0);const a=Ie.clamp(-e.y,0,1);t.intensity=Ie.lerp(.05,.25,a),n&&n.material&&(n.material.opacity=Ie.lerp(.3,1,a),n.material.transparent=!0)}function cE(s,e,t){const n=new ku,i=new oe,r=2236996,a=new Map;let o=null;function c(b){let E=b;for(;E;){if(E.userData&&E.userData.interactable)return E;E=E.parent}return null}function l(b){return!b||!b.material?[]:Array.isArray(b.material)?b.material:[b.material]}function h(b){var _;return b&&(((_=b.userData)==null?void 0:_.highlightTarget)||b)}function u(){if(!o)return;const b=h(o);for(const E of l(b)){if(!E||!a.has(E))continue;const _=a.get(E);E.emissive&&_.emissive&&E.emissive.copy(_.emissive),E.color&&_.color&&E.color.copy(_.color),a.delete(E)}o=null}function d(b){const E=h(b);for(const _ of l(E))_&&(a.has(_)||a.set(_,{emissive:_.emissive?_.emissive.clone():null,color:_.color?_.color.clone():null}),_.emissive?_.emissive.setHex(r):_.color&&_.color.offsetHSL(0,0,.2));o=b}function f(b,E){const _=s.domElement.clientWidth,M=s.domElement.clientHeight;if(_===0||M===0)return null;const v=b/_*2-1,S=-(E/M)*2+1;i.set(v,S),n.setFromCamera(i,e);const D=n.intersectObjects(t.children,!0);return D.length>0?D[0]:null}function p(){i.set(0,0),n.setFromCamera(i,e);const b=n.intersectObjects(t.children,!0);return b.length>0?b[0]:null}function m(){const b=p(),E=b?c(b.object):null;return E?(E===o||(u(),d(E)),o):(u(),null)}function g(){return o}function A(){if(!o){console.log("Nothing to interact with.");return}const b=o.userData&&o.userData.onUse;if(typeof b=="function")b(o);else{const E=o.name||o.type||"object";console.log(`Nothing to interact with on ${E}.`)}}return{raycaster:n,mouse:i,pickObject:f,pickCenter:p,updateHover:m,clearHover:u,getCurrentHover:g,useObject:A}}function lE(){if(document.querySelector(".crosshair-overlay"))return;hE();const s=document.createElement("div");s.className="crosshair-overlay",document.body.appendChild(s)}const ih="crosshair-overlay-style";function hE(){if(document.getElementById(ih))return;const s=document.createElement("style");s.id=ih,s.textContent=`
    .crosshair-overlay {
      position: fixed;
      top: 50%;
      left: 50%;
      width: 16px;
      height: 16px;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .crosshair-overlay::before {
      content: "";
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.9);
      box-shadow: 0 0 6px rgba(255, 255, 255, 0.6);
    }
  `,document.head.appendChild(s)}const sh=typeof globalThis<"u"&&typeof globalThis.SEA_LEVEL_Y<"u"?globalThis.SEA_LEVEL_Y:void 0,nn=typeof sh<"u"?sh:0,yn=new y(-120,nn,80),Bn=new y(-80,8,40),Vs=new y(-40,14,10),uE=110,dE=22,fE=18,AE=180,rh=2,pE=.35,gE=3.2,ah=new oe(-120,80),mE=nn;new y(-70,0,25);new oe(72,54);const oh=new oe(260,100),ch=new oe(0,-100),bE=4.5;yn.x-bE;const EE={west:-190,east:-117,north:-120,south:0},Ha=new y(yn.x+ch.x,nn,yn.z+ch.y);function _E(s,e){const t=Math.floor(s),n=Math.floor(e),i=s-t,r=e-n,a=new Array(4);for(let A=0;A<4;A++){const b=t+(A&1),E=n+(A>>1),_=Math.sin(b*374761393+E*668265263)*43758.5453,M=_-Math.floor(_);a[A]={x:Math.cos(M*Math.PI*2),z:Math.sin(M*Math.PI*2)}}const o=a[0].x*i+a[0].z*r,c=a[1].x*(i-1)+a[1].z*r,l=a[2].x*i+a[2].z*(r-1),h=a[3].x*(i-1)+a[3].z*(r-1),u=A=>A*A*A*(A*(A*6-15)+10),d=u(i),f=u(r),p=(A,b,E)=>A+(b-A)*E,m=p(o,c,d),g=p(l,h,d);return p(m,g,f)}function xE(s,e,t,n,i){let r=1,a=1,o=0,c=0;for(let l=0;l<t;l++)o+=_E(s*a,e*a)*r,c+=r,r*=n,a*=i;return o/c}const wr=new y,yE=18,lh=70;function vE(s){const n=new Yn(500,500,256,256),i=n.attributes.position,r=i.count,a=new Float32Array(r),o=new Float32Array(r*3),c=new Ut(o,3);n.setAttribute("color",c);const l=new Ae,h=25,u=.01;for(let m=0;m<r;m++){const g=i.getX(m),A=i.getY(m);let b=xE(g*u,A*u,5,.5,2.1)*h;const E=g-ah.x,_=A-ah.y,M=Math.hypot(E,_);if(M<lh){const S=1-Ie.smoothstep(M,yE,lh);S>0&&(b=Ie.lerp(b,mE,S))}i.setZ(m,b),a[m]=b;const v=Ie.clamp((b+h)/(h*2),0,1);v<.35?l.setRGB(.18,.28,.12):v<.65?l.setRGB(.36,.25,.14):l.setRGB(.6,.6,.6),c.setXYZ(m,l.r,l.g,l.b)}i.needsUpdate=!0,c.needsUpdate=!0,n.computeVertexNormals(),n.userData.baseHeights=a,n.userData.segmentCount=256,n.userData.size=500;const d=new Ke({color:5597999,vertexColors:!0}),f=new _e(n,d);f.rotation.x=-Math.PI/2,f.receiveShadow=!0,f.name="Terrain",s.add(f);const p=257;return f.userData.getHeightAt=(m,g)=>{wr.set(m,0,g),f.worldToLocal(wr);const A=500/2,b=wr.x+A,E=wr.z+A;if(b<0||b>500||E<0||E>500)return null;const _=b/500,M=E/500,v=_*256,S=M*256,D=Math.floor(v),x=Math.min(D+1,256),C=Math.floor(S),R=Math.min(C+1,256),U=v-D,O=S-C,T=C*p+D,F=C*p+x,Q=R*p+D,X=R*p+x,k=i.getZ(T),G=i.getZ(F),j=i.getZ(Q),J=i.getZ(X),ne=k+(G-k)*U,W=j+(J-j)*U;return ne+(W-ne)*O},f}function CE(s,e){if(!s)return;const t=s.geometry,n=t.attributes.position,i=t.userData.baseHeights;if(!i)return;const r=n.count,a=.75,o=.15;for(let c=0;c<r;c++){const l=i[c],h=n.getX(c),u=n.getY(c),d=Math.sin((h+u)*o+e*.5)*.3;n.setZ(c,l+d*a)}n.needsUpdate=!0,t.computeVertexNormals()}class IE extends _e{constructor(e,t={}){super(e),this.isWater=!0;const n=this,i=t.textureWidth!==void 0?t.textureWidth:512,r=t.textureHeight!==void 0?t.textureHeight:512,a=t.clipBias!==void 0?t.clipBias:0,o=t.alpha!==void 0?t.alpha:1,c=t.time!==void 0?t.time:0,l=t.waterNormals!==void 0?t.waterNormals:null,h=t.sunDirection!==void 0?t.sunDirection:new y(.70707,.70707,0),u=new Ae(t.sunColor!==void 0?t.sunColor:16777215),d=new Ae(t.waterColor!==void 0?t.waterColor:8355711),f=t.eye!==void 0?t.eye:new y(0,0,0),p=t.distortionScale!==void 0?t.distortionScale:20,m=t.side!==void 0?t.side:Rn,g=t.fog!==void 0?t.fog:!1,A=new cn,b=new y,E=new y,_=new y,M=new Fe,v=new y(0,0,-1),S=new at,D=new y,x=new y,C=new at,R=new Fe,U=new Yt,O=new li(i,r),T={name:"MirrorShader",uniforms:jr.merge([re.fog,re.lights,{normalSampler:{value:null},mirrorSampler:{value:null},alpha:{value:1},time:{value:0},size:{value:1},distortionScale:{value:20},textureMatrix:{value:new Fe},sunColor:{value:new Ae(8355711)},sunDirection:{value:new y(.70707,.70707,0)},eye:{value:new y},waterColor:{value:new Ae(5592405)}}]),vertexShader:`
				uniform mat4 textureMatrix;
				uniform float time;

				varying vec4 mirrorCoord;
				varying vec4 worldPosition;

				#include <common>
				#include <fog_pars_vertex>
				#include <shadowmap_pars_vertex>
				#include <logdepthbuf_pars_vertex>

				void main() {
					mirrorCoord = modelMatrix * vec4( position, 1.0 );
					worldPosition = mirrorCoord.xyzw;
					mirrorCoord = textureMatrix * mirrorCoord;
					vec4 mvPosition =  modelViewMatrix * vec4( position, 1.0 );
					gl_Position = projectionMatrix * mvPosition;

				#include <beginnormal_vertex>
				#include <defaultnormal_vertex>
				#include <logdepthbuf_vertex>
				#include <fog_vertex>
				#include <shadowmap_vertex>
			}`,fragmentShader:`
				uniform sampler2D mirrorSampler;
				uniform float alpha;
				uniform float time;
				uniform float size;
				uniform float distortionScale;
				uniform sampler2D normalSampler;
				uniform vec3 sunColor;
				uniform vec3 sunDirection;
				uniform vec3 eye;
				uniform vec3 waterColor;

				varying vec4 mirrorCoord;
				varying vec4 worldPosition;

				vec4 getNoise( vec2 uv ) {
					vec2 uv0 = ( uv / 103.0 ) + vec2(time / 17.0, time / 29.0);
					vec2 uv1 = uv / 107.0-vec2( time / -19.0, time / 31.0 );
					vec2 uv2 = uv / vec2( 8907.0, 9803.0 ) + vec2( time / 101.0, time / 97.0 );
					vec2 uv3 = uv / vec2( 1091.0, 1027.0 ) - vec2( time / 109.0, time / -113.0 );
					vec4 noise = texture2D( normalSampler, uv0 ) +
						texture2D( normalSampler, uv1 ) +
						texture2D( normalSampler, uv2 ) +
						texture2D( normalSampler, uv3 );
					return noise * 0.5 - 1.0;
				}

				void sunLight( const vec3 surfaceNormal, const vec3 eyeDirection, float shiny, float spec, float diffuse, inout vec3 diffuseColor, inout vec3 specularColor ) {
					vec3 reflection = normalize( reflect( -sunDirection, surfaceNormal ) );
					float direction = max( 0.0, dot( eyeDirection, reflection ) );
					specularColor += pow( direction, shiny ) * sunColor * spec;
					diffuseColor += max( dot( sunDirection, surfaceNormal ), 0.0 ) * sunColor * diffuse;
				}

				#include <common>
				#include <packing>
				#include <bsdfs>
				#include <fog_pars_fragment>
				#include <logdepthbuf_pars_fragment>
				#include <lights_pars_begin>
				#include <shadowmap_pars_fragment>
				#include <shadowmask_pars_fragment>

				void main() {

					#include <logdepthbuf_fragment>
					vec4 noise = getNoise( worldPosition.xz * size );
					vec3 surfaceNormal = normalize( noise.xzy * vec3( 1.5, 1.0, 1.5 ) );

					vec3 diffuseLight = vec3(0.0);
					vec3 specularLight = vec3(0.0);

					vec3 worldToEye = eye-worldPosition.xyz;
					vec3 eyeDirection = normalize( worldToEye );
					sunLight( surfaceNormal, eyeDirection, 100.0, 2.0, 0.5, diffuseLight, specularLight );

					float distance = length(worldToEye);

					vec2 distortion = surfaceNormal.xz * ( 0.001 + 1.0 / distance ) * distortionScale;
					vec3 reflectionSample = vec3( texture2D( mirrorSampler, mirrorCoord.xy / mirrorCoord.w + distortion ) );

					float theta = max( dot( eyeDirection, surfaceNormal ), 0.0 );
					float rf0 = 0.3;
					float reflectance = rf0 + ( 1.0 - rf0 ) * pow( ( 1.0 - theta ), 5.0 );
					vec3 scatter = max( 0.0, dot( surfaceNormal, eyeDirection ) ) * waterColor;
					vec3 albedo = mix( ( sunColor * diffuseLight * 0.3 + scatter ) * getShadowMask(), ( vec3( 0.1 ) + reflectionSample * 0.9 + reflectionSample * specularLight ), reflectance);
					vec3 outgoingLight = albedo;
					gl_FragColor = vec4( outgoingLight, alpha );

					#include <tonemapping_fragment>
					#include <colorspace_fragment>
					#include <fog_fragment>	
				}`},F=new Xn({name:T.name,uniforms:jr.clone(T.uniforms),vertexShader:T.vertexShader,fragmentShader:T.fragmentShader,lights:!0,side:m,fog:g});F.uniforms.mirrorSampler.value=O.texture,F.uniforms.textureMatrix.value=R,F.uniforms.alpha.value=o,F.uniforms.time.value=c,F.uniforms.normalSampler.value=l,F.uniforms.sunColor.value=u,F.uniforms.waterColor.value=d,F.uniforms.sunDirection.value=h,F.uniforms.distortionScale.value=p,F.uniforms.eye.value=f,n.material=F,n.onBeforeRender=function(Q,X,k){if(E.setFromMatrixPosition(n.matrixWorld),_.setFromMatrixPosition(k.matrixWorld),M.extractRotation(n.matrixWorld),b.set(0,0,1),b.applyMatrix4(M),D.subVectors(E,_),D.dot(b)>0)return;D.reflect(b).negate(),D.add(E),M.extractRotation(k.matrixWorld),v.set(0,0,-1),v.applyMatrix4(M),v.add(_),x.subVectors(E,v),x.reflect(b).negate(),x.add(E),U.position.copy(D),U.up.set(0,1,0),U.up.applyMatrix4(M),U.up.reflect(b),U.lookAt(x),U.far=k.far,U.updateMatrixWorld(),U.projectionMatrix.copy(k.projectionMatrix),R.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),R.multiply(U.projectionMatrix),R.multiply(U.matrixWorldInverse),A.setFromNormalAndCoplanarPoint(b,E),A.applyMatrix4(U.matrixWorldInverse),S.set(A.normal.x,A.normal.y,A.normal.z,A.constant);const G=U.projectionMatrix;C.x=(Math.sign(S.x)+G.elements[8])/G.elements[0],C.y=(Math.sign(S.y)+G.elements[9])/G.elements[5],C.z=-1,C.w=(1+G.elements[10])/G.elements[14],S.multiplyScalar(2/S.dot(C)),G.elements[2]=S.x,G.elements[6]=S.y,G.elements[10]=S.z+1-a,G.elements[14]=S.w,f.setFromMatrixPosition(k.matrixWorld);const j=Q.getRenderTarget(),J=Q.xr.enabled,ne=Q.shadowMap.autoUpdate;n.visible=!1,Q.xr.enabled=!1,Q.shadowMap.autoUpdate=!1,Q.setRenderTarget(O),Q.state.buffers.depth.setMask(!0),Q.autoClear===!1&&Q.clear(),Q.render(X,U),n.visible=!0,Q.xr.enabled=J,Q.shadowMap.autoUpdate=ne,Q.setRenderTarget(j);const W=k.viewport;W!==void 0&&Q.state.viewport(W)}}}function hh(s,e,t){const n=Math.pow(2,t),i=(s*n+e*n*1.3)*.12;return Math.sin(i*1.7+t*1.1)*.6}function SE(s=256){const e=new Uint8Array(s*s*4);for(let n=0;n<s;n++)for(let i=0;i<s;i++){let r=0,a=0;for(let l=0;l<4;l++){const h=1/Math.pow(2,l);r+=hh(i,n,l)*h,a+=hh(n,i,l)*h}const o=Math.sqrt(Math.max(0,1-r*r-a*a)),c=(n*s+i)*4;e[c]=Math.floor((r*.5+.5)*255),e[c+1]=Math.floor((a*.5+.5)*255),e[c+2]=Math.floor((o*.5+.5)*255),e[c+3]=255}const t=new ta(e,s,s,Lt);return t.wrapS=Dn,t.wrapT=Dn,t.anisotropy=4,t.needsUpdate=!0,t}const Xu=new Ae(1724032),ME=new Ae(597034),wE=new Ae,BE=-117;let za=null;function TE(s){return s&&Number.isFinite(s.devicePixelRatio)?s.devicePixelRatio:typeof window<"u"&&window.devicePixelRatio?window.devicePixelRatio:1}function RE(s){const e=(s==null?void 0:s.baseTextureSize)??512,t=Ie.clamp(TE(s),.75,3),n=Math.round(e*t);return Ie.clamp(n,256,2048)}async function DE(s,e={}){var v,S,D,x,C,R;za||(za=SE());const t=RE(e);s.traverse(U=>{var O,T;U&&(U.name==="AegeanOcean"||(O=U.userData)!=null&&O.isWater)&&((T=U.parent)==null||T.remove(U))});const n=Number.isFinite((v=e.position)==null?void 0:v.x)?e.position.x:Ha.x,i=Number.isFinite((S=e.position)==null?void 0:S.z)?e.position.z:Ha.z,r=Number.isFinite((D=e.size)==null?void 0:D.x)?e.size.x:oh.x,a=Number.isFinite((x=e.size)==null?void 0:x.y)?e.size.y:oh.y,o=(e==null?void 0:e.bounds)&&["west","east","north","south"].every(U=>Number.isFinite(e.bounds[U]));let c,l,h,u;if(o)({west:c,east:l,north:h,south:u}=e.bounds);else{const U=r*.5,O=a*.5,T=0,F=n,Q=i,X=Q-O,k=Q+T;c=F-U,l=F+U,h=X,u=k}c>l&&([c,l]=[l,c]),h>u&&([h,u]=[u,h]);const d=Math.max(.1,l-c),f=Math.max(.1,u-h),p=new Yn(d,f,1,1),m=new IE(p,{textureWidth:t,textureHeight:t,waterNormals:za,sunDirection:new y(.707,.5,.5).normalize(),sunColor:15923455,waterColor:Xu.clone(),distortionScale:3.2,fog:!!s.fog}),g=(c+l)*.5,A=(h+u)*.5;m.rotation.x=-Math.PI/2,m.position.set(g,Ha.y,A);const b=(l-c)*.5,E=Math.max(h,BE),_=Math.max(u,E),M=[new cn(new y(1,0,0),-(g-b)),new cn(new y(-1,0,0),g+b),new cn(new y(0,0,-1),_),new cn(new y(0,0,1),-E)];if(m.material&&(m.material.clippingPlanes=M,m.material.clipIntersection=!0,m.material.depthWrite=!0,m.material.transparent=!0,m.material.needsUpdate=!0,typeof window<"u"&&((R=(C=window.location)==null?void 0:C.search)!=null&&R.includes("waterdbg=1")))){const U=s.getObjectByName("WaterClipDebug");U&&s.remove(U),LE(s,c,l,E,_)}return m.receiveShadow=!0,m.name="AegeanOcean",m.userData.noCollision=!0,m.userData.isWater=!0,m.renderOrder=-1,s.add(m),{mesh:m,uniforms:m.material.uniforms}}function LE(s,e,t,n,i){const r=new It().setFromPoints([new y(e,0,n),new y(t,0,n),new y(t,0,i),new y(e,0,i),new y(e,0,n)]),a=new na(r,new Xo({transparent:!0,opacity:.8}));return a.position.y=nn+.02,a.name="WaterClipDebug",s.add(a),a}function uh(s,e=0,t,n=0){var a,o;if(!s)return;const i=s.uniforms??((o=(a=s.mesh)==null?void 0:a.material)==null?void 0:o.uniforms);if(!i)return;Number.isFinite(e)&&(i.time.value+=e),t&&i.sunDirection&&i.sunDirection.value.copy(t);const r=Ie.clamp(typeof n=="number"?n:0,0,1);i.distortionScale&&(i.distortionScale.value=Ie.lerp(3.2,1.2,r)),i.waterColor&&i.waterColor.value.copy(wE.copy(Xu).lerp(ME,r))}const dh=new Fe,fh=new y,PE=new y(1,1,1),FE=new en;function Hn(s){s.castShadow=!0,s.receiveShadow=!0}function Va(s){return new Ke({color:s,roughness:.75,metalness:.05})}function Wa(s,e){const{width:t,length:n,spacing:i,offsetX:r=0,offsetZ:a=0,deckHeight:o,postHeight:c,inset:l=.6}=e,h=t/2-l,u=n/2-l,d=o-c;for(let f=-u;f<=u+.001;f+=i)s.push({x:r-h,y:d,z:a+f}),s.push({x:r+h,y:d,z:a+f})}function Ah(s,e,{height:t,radiusTop:n,radiusBottom:i,material:r}){if(!e||e.length===0)return null;const a=new Dt(n,i,t,12);a.translate(0,t/2,0);const o=new Jr(a,r,e.length);o.name=s,o.castShadow=!0,o.receiveShadow=!0;for(let c=0;c<e.length;c++){const l=e[c];fh.set(l.x,l.y,l.z),dh.compose(fh,FE,PE),o.setMatrixAt(c,dh)}return o.instanceMatrix.needsUpdate=!0,o}function UE(s,e={}){const t=e.center?e.center.clone():yn.clone(),n=e.mainLength??70,i=e.mainWidth??9,r=e.deckHeight??1.4,a=e.approachLength??32,o=e.spurLength??24,c=e.postSpacing??6,l=Va(8084287),h=Va(4864551),u=new Ke({color:14274995,roughness:.4,metalness:.1}),d=new gt;d.name="Harbor",d.position.copy(t);const f=new _e(new Gt(i,.6,n),l);f.position.y=r,Hn(f),d.add(f);const p=[],m=r+3;Wa(p,{width:i,length:n,spacing:c,deckHeight:r,postHeight:m}),Wa(p,{width:i-4,length:o,spacing:c,deckHeight:r,postHeight:m,offsetX:-i/2+1.2,offsetZ:o/2+2}),Wa(p,{width:i-4,length:o,spacing:c,deckHeight:r,postHeight:m,offsetX:-i/2+1.2,offsetZ:-(o/2+2)});const g=Ah("HarborPierPosts",p,{height:m,radiusTop:.45,radiusBottom:.55,material:h});g&&d.add(g);const A=new _e(new Gt(a,.5,i-2),l);A.position.set(i/2+a/2,r,0),Hn(A),d.add(A);const b=r+3,E=(i-2)/2-.6,_=[],M=i/2+a/2,v=r-b;for(let pe=-a/2;pe<=a/2+.001;pe+=c)_.push({x:M+pe,y:v,z:-E}),_.push({x:M+pe,y:v,z:E});const S=Ah("HarborWalkwayPosts",_,{height:b,radiusTop:.4,radiusBottom:.5,material:h});S&&d.add(S);const D=new _e(new Gt(i-4,.45,o),l);D.position.set(-i/2+1.2,r,o/2+2),Hn(D),d.add(D);const x=D.clone();x.position.z=-(o/2+2),d.add(x);const C=new Gt(.2,1.1,n),R=new _e(C,u);R.position.set(-i/2+.6,r+.8,0),Hn(R),d.add(R);const U=R.clone();U.position.x=i/2-.6,d.add(U);const O=new Dt(.35,.35,.8,16),T=new Ke({color:2961461,roughness:.6,metalness:.4}),F=[new y(-i/2+1.3,r+.4,o+3),new y(-i/2+1.3,r+.4,-o-3),new y(i/2-1.3,r+.4,n/2-6),new y(i/2-1.3,r+.4,-n/2+6)];for(const pe of F){const we=new _e(O,T);we.position.copy(pe),Hn(we),d.add(we)}const Q=Va(9399109),X=new _e(new Gt(2.4,2.4,2.4),Q);X.position.set(i/2-2,r+1.2,-n/4),Hn(X),d.add(X);const k=new _e(new Gt(1.6,1.6,1.6),Q);k.position.set(i/2-3.4,r+.8,-n/4+3),Hn(k),d.add(k);const G=new _e(new Gt(1.8,1.8,1.8),Q);G.position.set(i/2-2.4,r+.9,-n/4-2.4),Hn(G),d.add(G);const j=new gt;j.name="HarborLamp",j.position.set(i/2+a-4,0,0);const J=new _e(new Dt(.12,.16,4,16),u);J.position.y=2,J.castShadow=!0,J.receiveShadow=!1,j.add(J);const ne=new _e(new Gt(.2,.2,1.6),u);ne.position.set(0,3.4,.6),Hn(ne),j.add(ne);const W=new Ke({color:16777215,emissive:new Ae(16773832),emissiveIntensity:0}),Z=new _e(new oi(.28,16,16),W);Z.position.set(0,3.2,1.2),Z.castShadow=!1,j.add(Z);const ce=new ls(16773832,0,18,2);ce.position.copy(Z.position),ce.castShadow=!0,j.add(ce);const ge={light:ce,material:W,baseIntensity:1.4,overrideState:null};return j.userData.interactable=!0,j.userData.highlightTarget=Z,j.userData.light=ce,j.userData.onUse=()=>{const pe=ge.overrideState;pe===null?ge.overrideState=!0:pe===!0?ge.overrideState=!1:ge.overrideState=null},d.userData.lamp=ge,d.add(j),d.userData.posts={pier:g,walkway:S},s.add(d),d}function ph(s,e=0){var r;if(!s)return;const t=(r=s.userData)==null?void 0:r.lamp;if(!t)return;const n=Ie.clamp(e,0,1);let i=Ie.lerp(0,t.baseIntensity,n);if(t.overrideState===!0?i=t.baseIntensity:t.overrideState===!1&&(i=0),t.light.intensity=i,t.material){const a=t.baseIntensity>0?i/t.baseIntensity:0;t.material.emissiveIntensity=a>0?1.6*a:0}}function NE(s,e){var p,m;const t=[yn.clone().add(new y(8,0,-10)),yn.clone().lerp(Bn,.4).add(new y(-10,2,6)),Bn.clone(),Bn.clone().lerp(Vs,.6).add(new y(6,2,-4)),Vs.clone()],n=new Jo(t,!1,"catmullrom",.1),i=180,r=gE,a=new Yn(r,1,1,i),o=a.attributes.position,c=new y,l=new y,h=(m=(p=e==null?void 0:e.userData)==null?void 0:p.getHeightAt)==null?void 0:m.bind(e==null?void 0:e.userData);for(let g=0;g<=i;g++){const A=g/i,b=n.getPoint(A),E=n.getPoint(Math.min(1,A+1/i));c.subVectors(E,b).normalize();const _=Math.atan2(c.x,c.z);for(let M=0;M<2;M++){const v=g*2+M,S=M===0?-.5:.5;l.set(Math.sin(_)*S*r,0,Math.cos(_)*S*r);const D=b.x+l.x,x=b.z+l.z;let C=h?h(D,x):b.y;Number.isFinite(C)||(C=b.y),C+=.08,o.setXYZ(v,D,C,x)}}o.needsUpdate=!0,a.computeVertexNormals();const u=new Ke({color:9079434,roughness:1,metalness:0,side:sn}),d=new _e(a,u);d.renderOrder=1,d.receiveShadow=!0,d.name="MainHillRoad";const f=new gt;return f.name="Roads",f.add(d),s.add(f),{group:f,curve:n,mesh:d}}function gh(s,e,t){const n=new ec(e,48),i=new Ke({color:t,roughness:.95,metalness:0,side:sn}),r=new _e(n,i);return r.rotation.x=-Math.PI/2,r.position.copy(s),r.position.y+=.05,r.renderOrder=1,r.receiveShadow=!0,r.name="Plaza",r}function QE(s){const e=new gt;return e.name="Plazas",e.add(gh(Bn,dE,15131350)),e.add(gh(Vs,fE,15591644)),s.add(e),e}new y;new y;new y;new y;new y;new y(0,1,0);function OE(s,e,t,n,i=2,r=12433580){const a=new Dt(i,i,.12,24),o=new Ke({color:r,roughness:.95,metalness:0});o.depthWrite=!0,o.transparent=!1;const c=new _e(a,o);return c.position.set(e,t+.06,n),c.receiveShadow=!0,c.renderOrder=2,c.name="FoundationPad",c.userData.noCollision=!0,s.add(c),c}const qa=.05;new Fe;new y;new y;new y;new y(0,1,0);new Ae;function mh(s,e=0){var r;if(!s)return;const t=(r=s.userData)==null?void 0:r.lighting;if(!t)return;const n=Ie.clamp(e,0,1),i=Ie.lerp(t.dayIntensity,t.nightIntensity,n);t.material.emissiveIntensity=i}function kE(s,e,t,n={}){var U,O;const{seed:i=20251007,buildingCount:r=140,spacing:a=5.5,harborBand:o=[nn+3,nn+5.5],agoraBand:c=[nn+3,nn+8],acroBand:l=[nn+7,nn+14],avoidHarborRadius:h=uE+18}=n,u=GE(i),d=[],f=(O=(U=e==null?void 0:e.userData)==null?void 0:U.getHeightAt)==null?void 0:O.bind(e==null?void 0:e.userData),p=(a||6)*.8,m=new Map,g=(T,F)=>`${Math.round(T/p)}_${Math.round(F/p)}`,A=new oe(Bn.x,Bn.z),b=[{band:o,tries:Math.floor(r*.35)},{band:c,tries:Math.floor(r*.45)},{band:l,tries:Math.floor(r*.2)}],E=new oe;let _=0;for(const{band:T,tries:F}of b){let Q=0;for(;Q++<F&&_<r;){const X=Math.sqrt(u())*AE,k=u()*Math.PI*2,G=A.x+Math.cos(k)*X,j=A.y+Math.sin(k)*X;if(E.set(G,j).distanceTo(new oe(yn.x,yn.z))<h)continue;const ne=f?f(G,j):void 0;if(!Number.isFinite(ne)||ne<T[0]||ne>T[1]||ne<nn+rh)continue;const W=g(G,j);if(m.has(W))continue;const Z=f?f(G+1.2,j):ne,ce=f?f(G,j+1.2):ne;!Number.isFinite(Z)||!Number.isFinite(ce)||Math.max(Math.abs(Z-ne),Math.abs(ce-ne))>pE||(m.set(W,!0),d.push(new y(G,ne,j)),_++)}}const{group:M,walls:v,roofs:S,dummy:D}=HE(s),x=new y,C=new y().subVectors(yn,Bn).normalize();let R=0;for(const T of d){let F=0;if(t){const J=zE(t,T,180),ne=t.getPoint(J),W=t.getPoint(Math.min(1,J+.01));x.subVectors(W,ne).normalize(),F=Math.atan2(x.x,x.z)}else F=Math.atan2(C.x,C.z);const Q=f?f(T.x,T.z):T.y,X=Number.isFinite(Q)?Q+qa:T.y+qa,k=Math.max(X,nn+rh+qa),G=.9+u()*.3,j=Math.max(2,1.8*G);OE(s,T.x,k,T.z,j),D.position.set(T.x,k+1,T.z),D.rotation.set(0,F,0),D.scale.setScalar(G),D.updateMatrix(),v.setMatrixAt(R,D.matrix),D.position.set(T.x,k+2,T.z),D.rotation.set(0,F,0),D.updateMatrix(),S.setMatrixAt(R,D.matrix),R++}return v.count=S.count=R,v.instanceMatrix.needsUpdate=!0,S.instanceMatrix.needsUpdate=!0,M}function GE(s=1337){let e=s>>>0||1;return()=>(e=e*1664525+1013904223>>>0)/4294967295}function HE(s,e=120){var n,i;const t=VE(s,e);return t&&!t.dummy&&(t.dummy=t._dummy??new Ze,t._dummy=t.dummy),(n=t==null?void 0:t.walls)!=null&&n.material&&(t.walls.material.depthWrite=!0,t.walls.material.transparent=!1),(i=t==null?void 0:t.roofs)!=null&&i.material&&(t.roofs.material.depthWrite=!0,t.roofs.material.transparent=!1),t!=null&&t.walls&&(t.walls.renderOrder=2),t!=null&&t.roofs&&(t.roofs.renderOrder=2),t}function zE(s,e,t){let n=0,i=1/0;for(let r=0;r<=t;r++){const a=r/t,o=s.getPoint(a),c=(o.x-e.x)*(o.x-e.x)+(o.z-e.z)*(o.z-e.z);c<i&&(i=c,n=a)}return n}const bh=240;let qt=null;function VE(s,e=bh){if(!s)throw new Error("Scene is required for hill city instancing");const t=Math.max(1,Math.min(1024,e|0||bh));if(qt&&qt.capacity>=t)return qt.group.parent!==s&&s.add(qt.group),qt.dummy||(qt.dummy=qt._dummy??new Ze,qt._dummy=qt.dummy),Eh(qt),qt;qt&&qt.group.parent&&qt.group.parent.remove(qt.group);const n=WE(),i=qE(),r=XE(),a=YE(),o=new Jr(n,r,t),c=new Jr(i,a,t);o.instanceMatrix.setUsage(Oc),c.instanceMatrix.setUsage(Oc),o.castShadow=!0,o.receiveShadow=!0,c.castShadow=!0,c.receiveShadow=!1;const l=new gt;l.name="HillCity",l.add(o),l.add(c);const h=new Ze,u={group:l,walls:o,roofs:c,dummy:h,_dummy:h,capacity:t};return o.userData.capacity=t,c.userData.capacity=t,qt=u,Eh(u),s.add(l),u}function Eh(s){s.walls.count=0,s.roofs.count=0,s.group.visible=!1,s.walls.instanceMatrix.needsUpdate=!0,s.roofs.instanceMatrix.needsUpdate=!0,s.walls.instanceColor&&(s.walls.instanceColor.needsUpdate=!0),s.roofs.instanceColor&&(s.roofs.instanceColor.needsUpdate=!0)}let Xa=null,Ya=null;function WE(){if(!Xa){const s=new Gt(1,1,1);s.translate(0,.5,0),Xa=s}return Xa}function qE(){if(!Ya){const s=new Dt(0,.5,1,4,1,!1);s.rotateY(Math.PI/4),s.translate(0,.5,0),Ya=s}return Ya}function XE(){return new Ke({color:16777215,vertexColors:!0,roughness:.6,metalness:.08,emissive:new Ae(16768929),emissiveIntensity:.08})}function YE(){return new Ke({color:16777215,vertexColors:!0,roughness:.85,metalness:.05})}function KE(s,e=!1){const t=s[0].index!==null,n=new Set(Object.keys(s[0].attributes)),i=new Set(Object.keys(s[0].morphAttributes)),r={},a={},o=s[0].morphTargetsRelative,c=new It;let l=0;for(let h=0;h<s.length;++h){const u=s[h];let d=0;if(t!==(u.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(const f in u.attributes){if(!n.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have compatible attributes; make sure "'+f+'" attribute exists among all geometries, or in none of them.'),null;r[f]===void 0&&(r[f]=[]),r[f].push(u.attributes[f]),d++}if(d!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of attributes."),null;if(o!==u.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(const f in u.morphAttributes){if(!i.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+".  .morphAttributes must be consistent throughout all geometries."),null;a[f]===void 0&&(a[f]=[]),a[f].push(u.morphAttributes[f])}if(e){let f;if(t)f=u.index.count;else if(u.attributes.position!==void 0)f=u.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". The geometry must have either an index or a position attribute"),null;c.addGroup(l,f,h),l+=f}}if(t){let h=0;const u=[];for(let d=0;d<s.length;++d){const f=s[d].index;for(let p=0;p<f.count;++p)u.push(f.getX(p)+h);h+=s[d].attributes.position.count}c.setIndex(u)}for(const h in r){const u=_h(r[h]);if(!u)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" attribute."),null;c.setAttribute(h,u)}for(const h in a){const u=a[h][0].length;if(u===0)break;c.morphAttributes=c.morphAttributes||{},c.morphAttributes[h]=[];for(let d=0;d<u;++d){const f=[];for(let m=0;m<a[h].length;++m)f.push(a[h][m][d]);const p=_h(f);if(!p)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" morphAttribute."),null;c.morphAttributes[h].push(p)}}return c}function _h(s){let e,t,n,i=-1,r=0;for(let l=0;l<s.length;++l){const h=s[l];if(h.isInterleavedBufferAttribute)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. InterleavedBufferAttributes are not supported."),null;if(e===void 0&&(e=h.array.constructor),e!==h.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=h.itemSize),t!==h.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=h.normalized),n!==h.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(i===-1&&(i=h.gpuType),i!==h.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=h.array.length}const a=new e(r);let o=0;for(let l=0;l<s.length;++l)a.set(s[l].array,o),o+=s[l].array.length;const c=new Ut(a,t,n);return i!==void 0&&(c.gpuType=i),c}function xh(s,e){if(e===hf)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),s;if(e===_o||e===su){let t=s.getIndex();if(t===null){const a=[],o=s.getAttribute("position");if(o!==void 0){for(let c=0;c<o.count;c++)a.push(c);s.setIndex(a),t=s.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),s}const n=t.count-2,i=[];if(e===_o)for(let a=1;a<=n;a++)i.push(t.getX(0)),i.push(t.getX(a)),i.push(t.getX(a+1));else for(let a=0;a<n;a++)a%2===0?(i.push(t.getX(a)),i.push(t.getX(a+1)),i.push(t.getX(a+2))):(i.push(t.getX(a+2)),i.push(t.getX(a+1)),i.push(t.getX(a)));i.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");const r=s.clone();return r.setIndex(i),r.clearGroups(),r}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),s}class cc extends hi{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new e_(t)}),this.register(function(t){return new l_(t)}),this.register(function(t){return new h_(t)}),this.register(function(t){return new u_(t)}),this.register(function(t){return new n_(t)}),this.register(function(t){return new i_(t)}),this.register(function(t){return new s_(t)}),this.register(function(t){return new r_(t)}),this.register(function(t){return new $E(t)}),this.register(function(t){return new a_(t)}),this.register(function(t){return new t_(t)}),this.register(function(t){return new c_(t)}),this.register(function(t){return new o_(t)}),this.register(function(t){return new JE(t)}),this.register(function(t){return new d_(t)}),this.register(function(t){return new f_(t)})}load(e,t,n,i){const r=this;let a;if(this.resourcePath!=="")a=this.resourcePath;else if(this.path!==""){const l=ks.extractUrlBase(e);a=ks.resolveURL(l,this.path)}else a=ks.extractUrlBase(e);this.manager.itemStart(e);const o=function(l){i?i(l):console.error(l),r.manager.itemError(e),r.manager.itemEnd(e)},c=new cs(this.manager);c.setPath(this.path),c.setResponseType("arraybuffer"),c.setRequestHeader(this.requestHeader),c.setWithCredentials(this.withCredentials),c.load(e,function(l){try{r.parse(l,a,function(h){t(h),r.manager.itemEnd(e)},o)}catch(h){o(h)}},n,o)}setDRACOLoader(e){return this.dracoLoader=e,this}setDDSLoader(){throw new Error('THREE.GLTFLoader: "MSFT_texture_dds" no longer supported. Please update to "KHR_texture_basisu".')}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,i){let r;const a={},o={},c=new TextDecoder;if(typeof e=="string")r=JSON.parse(e);else if(e instanceof ArrayBuffer)if(c.decode(new Uint8Array(e,0,4))===Yu){try{a[je.KHR_BINARY_GLTF]=new A_(e)}catch(u){i&&i(u);return}r=JSON.parse(a[je.KHR_BINARY_GLTF].content)}else r=JSON.parse(c.decode(e));else r=e;if(r.asset===void 0||r.asset.version[0]<2){i&&i(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}const l=new M_(r,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});l.fileLoader.setRequestHeader(this.requestHeader);for(let h=0;h<this.pluginCallbacks.length;h++){const u=this.pluginCallbacks[h](l);u.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),o[u.name]=u,a[u.name]=!0}if(r.extensionsUsed)for(let h=0;h<r.extensionsUsed.length;++h){const u=r.extensionsUsed[h],d=r.extensionsRequired||[];switch(u){case je.KHR_MATERIALS_UNLIT:a[u]=new ZE;break;case je.KHR_DRACO_MESH_COMPRESSION:a[u]=new p_(r,this.dracoLoader);break;case je.KHR_TEXTURE_TRANSFORM:a[u]=new g_;break;case je.KHR_MESH_QUANTIZATION:a[u]=new m_;break;default:d.indexOf(u)>=0&&o[u]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+u+'".')}}l.setExtensions(a),l.setPlugins(o),l.parse(n,i)}parseAsync(e,t){const n=this;return new Promise(function(i,r){n.parse(e,t,i,r)})}}function jE(){let s={};return{get:function(e){return s[e]},add:function(e,t){s[e]=t},remove:function(e){delete s[e]},removeAll:function(){s={}}}}const je={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"};class JE{constructor(e){this.parser=e,this.name=je.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){const e=this.parser,t=this.parser.json.nodes||[];for(let n=0,i=t.length;n<i;n++){const r=t[n];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(e){const t=this.parser,n="light:"+e;let i=t.cache.get(n);if(i)return i;const r=t.json,c=((r.extensions&&r.extensions[this.name]||{}).lights||[])[e];let l;const h=new Ae(16777215);c.color!==void 0&&h.setRGB(c.color[0],c.color[1],c.color[2],Et);const u=c.range!==void 0?c.range:0;switch(c.type){case"directional":l=new sc(h),l.target.position.set(0,0,-1),l.add(l.target);break;case"point":l=new ls(h),l.distance=u;break;case"spot":l=new Uu(h),l.distance=u,c.spot=c.spot||{},c.spot.innerConeAngle=c.spot.innerConeAngle!==void 0?c.spot.innerConeAngle:0,c.spot.outerConeAngle=c.spot.outerConeAngle!==void 0?c.spot.outerConeAngle:Math.PI/4,l.angle=c.spot.outerConeAngle,l.penumbra=1-c.spot.innerConeAngle/c.spot.outerConeAngle,l.target.position.set(0,0,-1),l.add(l.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+c.type)}return l.position.set(0,0,0),l.decay=2,ni(l,c),c.intensity!==void 0&&(l.intensity=c.intensity),l.name=t.createUniqueName(c.name||"light_"+e),i=Promise.resolve(l),t.cache.add(n,i),i}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){const t=this,n=this.parser,r=n.json.nodes[e],o=(r.extensions&&r.extensions[this.name]||{}).light;return o===void 0?null:this._loadLight(o).then(function(c){return n._getNodeRef(t.cache,o,c)})}}class ZE{constructor(){this.name=je.KHR_MATERIALS_UNLIT}getMaterialType(){return Mn}extendParams(e,t,n){const i=[];e.color=new Ae(1,1,1),e.opacity=1;const r=t.pbrMetallicRoughness;if(r){if(Array.isArray(r.baseColorFactor)){const a=r.baseColorFactor;e.color.setRGB(a[0],a[1],a[2],Et),e.opacity=a[3]}r.baseColorTexture!==void 0&&i.push(n.assignTexture(e,"map",r.baseColorTexture,dt))}return Promise.all(i)}}class $E{constructor(e){this.parser=e,this.name=je.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=i.extensions[this.name].emissiveStrength;return r!==void 0&&(t.emissiveIntensity=r),Promise.resolve()}}class e_{constructor(e){this.parser=e,this.name=je.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Kn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],a=i.extensions[this.name];if(a.clearcoatFactor!==void 0&&(t.clearcoat=a.clearcoatFactor),a.clearcoatTexture!==void 0&&r.push(n.assignTexture(t,"clearcoatMap",a.clearcoatTexture)),a.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=a.clearcoatRoughnessFactor),a.clearcoatRoughnessTexture!==void 0&&r.push(n.assignTexture(t,"clearcoatRoughnessMap",a.clearcoatRoughnessTexture)),a.clearcoatNormalTexture!==void 0&&(r.push(n.assignTexture(t,"clearcoatNormalMap",a.clearcoatNormalTexture)),a.clearcoatNormalTexture.scale!==void 0)){const o=a.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new oe(o,o)}return Promise.all(r)}}class t_{constructor(e){this.parser=e,this.name=je.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Kn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],a=i.extensions[this.name];return a.iridescenceFactor!==void 0&&(t.iridescence=a.iridescenceFactor),a.iridescenceTexture!==void 0&&r.push(n.assignTexture(t,"iridescenceMap",a.iridescenceTexture)),a.iridescenceIor!==void 0&&(t.iridescenceIOR=a.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),a.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=a.iridescenceThicknessMinimum),a.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=a.iridescenceThicknessMaximum),a.iridescenceThicknessTexture!==void 0&&r.push(n.assignTexture(t,"iridescenceThicknessMap",a.iridescenceThicknessTexture)),Promise.all(r)}}class n_{constructor(e){this.parser=e,this.name=je.KHR_MATERIALS_SHEEN}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Kn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[];t.sheenColor=new Ae(0,0,0),t.sheenRoughness=0,t.sheen=1;const a=i.extensions[this.name];if(a.sheenColorFactor!==void 0){const o=a.sheenColorFactor;t.sheenColor.setRGB(o[0],o[1],o[2],Et)}return a.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=a.sheenRoughnessFactor),a.sheenColorTexture!==void 0&&r.push(n.assignTexture(t,"sheenColorMap",a.sheenColorTexture,dt)),a.sheenRoughnessTexture!==void 0&&r.push(n.assignTexture(t,"sheenRoughnessMap",a.sheenRoughnessTexture)),Promise.all(r)}}class i_{constructor(e){this.parser=e,this.name=je.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Kn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],a=i.extensions[this.name];return a.transmissionFactor!==void 0&&(t.transmission=a.transmissionFactor),a.transmissionTexture!==void 0&&r.push(n.assignTexture(t,"transmissionMap",a.transmissionTexture)),Promise.all(r)}}class s_{constructor(e){this.parser=e,this.name=je.KHR_MATERIALS_VOLUME}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Kn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],a=i.extensions[this.name];t.thickness=a.thicknessFactor!==void 0?a.thicknessFactor:0,a.thicknessTexture!==void 0&&r.push(n.assignTexture(t,"thicknessMap",a.thicknessTexture)),t.attenuationDistance=a.attenuationDistance||1/0;const o=a.attenuationColor||[1,1,1];return t.attenuationColor=new Ae().setRGB(o[0],o[1],o[2],Et),Promise.all(r)}}class r_{constructor(e){this.parser=e,this.name=je.KHR_MATERIALS_IOR}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Kn}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=i.extensions[this.name];return t.ior=r.ior!==void 0?r.ior:1.5,Promise.resolve()}}class a_{constructor(e){this.parser=e,this.name=je.KHR_MATERIALS_SPECULAR}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Kn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],a=i.extensions[this.name];t.specularIntensity=a.specularFactor!==void 0?a.specularFactor:1,a.specularTexture!==void 0&&r.push(n.assignTexture(t,"specularIntensityMap",a.specularTexture));const o=a.specularColorFactor||[1,1,1];return t.specularColor=new Ae().setRGB(o[0],o[1],o[2],Et),a.specularColorTexture!==void 0&&r.push(n.assignTexture(t,"specularColorMap",a.specularColorTexture,dt)),Promise.all(r)}}class o_{constructor(e){this.parser=e,this.name=je.EXT_MATERIALS_BUMP}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Kn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],a=i.extensions[this.name];return t.bumpScale=a.bumpFactor!==void 0?a.bumpFactor:1,a.bumpTexture!==void 0&&r.push(n.assignTexture(t,"bumpMap",a.bumpTexture)),Promise.all(r)}}class c_{constructor(e){this.parser=e,this.name=je.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Kn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],a=i.extensions[this.name];return a.anisotropyStrength!==void 0&&(t.anisotropy=a.anisotropyStrength),a.anisotropyRotation!==void 0&&(t.anisotropyRotation=a.anisotropyRotation),a.anisotropyTexture!==void 0&&r.push(n.assignTexture(t,"anisotropyMap",a.anisotropyTexture)),Promise.all(r)}}class l_{constructor(e){this.parser=e,this.name=je.KHR_TEXTURE_BASISU}loadTexture(e){const t=this.parser,n=t.json,i=n.textures[e];if(!i.extensions||!i.extensions[this.name])return null;const r=i.extensions[this.name],a=t.options.ktx2Loader;if(!a){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,r.source,a)}}class h_{constructor(e){this.parser=e,this.name=je.EXT_TEXTURE_WEBP,this.isSupported=null}loadTexture(e){const t=this.name,n=this.parser,i=n.json,r=i.textures[e];if(!r.extensions||!r.extensions[t])return null;const a=r.extensions[t],o=i.images[a.source];let c=n.textureLoader;if(o.uri){const l=n.options.manager.getHandler(o.uri);l!==null&&(c=l)}return this.detectSupport().then(function(l){if(l)return n.loadTextureImage(e,a.source,c);if(i.extensionsRequired&&i.extensionsRequired.indexOf(t)>=0)throw new Error("THREE.GLTFLoader: WebP required by asset but unsupported.");return n.loadTexture(e)})}detectSupport(){return this.isSupported||(this.isSupported=new Promise(function(e){const t=new Image;t.src="data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",t.onload=t.onerror=function(){e(t.height===1)}})),this.isSupported}}class u_{constructor(e){this.parser=e,this.name=je.EXT_TEXTURE_AVIF,this.isSupported=null}loadTexture(e){const t=this.name,n=this.parser,i=n.json,r=i.textures[e];if(!r.extensions||!r.extensions[t])return null;const a=r.extensions[t],o=i.images[a.source];let c=n.textureLoader;if(o.uri){const l=n.options.manager.getHandler(o.uri);l!==null&&(c=l)}return this.detectSupport().then(function(l){if(l)return n.loadTextureImage(e,a.source,c);if(i.extensionsRequired&&i.extensionsRequired.indexOf(t)>=0)throw new Error("THREE.GLTFLoader: AVIF required by asset but unsupported.");return n.loadTexture(e)})}detectSupport(){return this.isSupported||(this.isSupported=new Promise(function(e){const t=new Image;t.src="data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=",t.onload=t.onerror=function(){e(t.height===1)}})),this.isSupported}}class d_{constructor(e){this.name=je.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){const t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){const i=n.extensions[this.name],r=this.parser.getDependency("buffer",i.buffer),a=this.parser.options.meshoptDecoder;if(!a||!a.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return r.then(function(o){const c=i.byteOffset||0,l=i.byteLength||0,h=i.count,u=i.byteStride,d=new Uint8Array(o,c,l);return a.decodeGltfBufferAsync?a.decodeGltfBufferAsync(h,u,d,i.mode,i.filter).then(function(f){return f.buffer}):a.ready.then(function(){const f=new ArrayBuffer(h*u);return a.decodeGltfBuffer(new Uint8Array(f),h,u,d,i.mode,i.filter),f})})}else return null}}class f_{constructor(e){this.name=je.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){const t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;const i=t.meshes[n.mesh];for(const l of i.primitives)if(l.mode!==fn.TRIANGLES&&l.mode!==fn.TRIANGLE_STRIP&&l.mode!==fn.TRIANGLE_FAN&&l.mode!==void 0)return null;const a=n.extensions[this.name].attributes,o=[],c={};for(const l in a)o.push(this.parser.getDependency("accessor",a[l]).then(h=>(c[l]=h,c[l])));return o.length<1?null:(o.push(this.parser.createNodeMesh(e)),Promise.all(o).then(l=>{const h=l.pop(),u=h.isGroup?h.children:[h],d=l[0].count,f=[];for(const p of u){const m=new Fe,g=new y,A=new en,b=new y(1,1,1),E=new Jr(p.geometry,p.material,d);for(let _=0;_<d;_++)c.TRANSLATION&&g.fromBufferAttribute(c.TRANSLATION,_),c.ROTATION&&A.fromBufferAttribute(c.ROTATION,_),c.SCALE&&b.fromBufferAttribute(c.SCALE,_),E.setMatrixAt(_,m.compose(g,A,b));for(const _ in c)if(_==="_COLOR_0"){const M=c[_];E.instanceColor=new Io(M.array,M.itemSize,M.normalized)}else _!=="TRANSLATION"&&_!=="ROTATION"&&_!=="SCALE"&&p.geometry.setAttribute(_,c[_]);Ze.prototype.copy.call(E,p),this.parser.assignFinalMaterial(E),f.push(E)}return h.isGroup?(h.clear(),h.add(...f),h):f[0]}))}}const Yu="glTF",Rs=12,yh={JSON:1313821514,BIN:5130562};class A_{constructor(e){this.name=je.KHR_BINARY_GLTF,this.content=null,this.body=null;const t=new DataView(e,0,Rs),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==Yu)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");const i=this.header.length-Rs,r=new DataView(e,Rs);let a=0;for(;a<i;){const o=r.getUint32(a,!0);a+=4;const c=r.getUint32(a,!0);if(a+=4,c===yh.JSON){const l=new Uint8Array(e,Rs+a,o);this.content=n.decode(l)}else if(c===yh.BIN){const l=Rs+a;this.body=e.slice(l,l+o)}a+=o}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}}class p_{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=je.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){const n=this.json,i=this.dracoLoader,r=e.extensions[this.name].bufferView,a=e.extensions[this.name].attributes,o={},c={},l={};for(const h in a){const u=Bo[h]||h.toLowerCase();o[u]=a[h]}for(const h in e.attributes){const u=Bo[h]||h.toLowerCase();if(a[h]!==void 0){const d=n.accessors[e.attributes[h]],f=hs[d.componentType];l[u]=f.name,c[u]=d.normalized===!0}}return t.getDependency("bufferView",r).then(function(h){return new Promise(function(u,d){i.decodeDracoFile(h,function(f){for(const p in f.attributes){const m=f.attributes[p],g=c[p];g!==void 0&&(m.normalized=g)}u(f)},o,l,Et,d)})})}}class g_{constructor(){this.name=je.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return(t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0||(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),e.needsUpdate=!0),e}}class m_{constructor(){this.name=je.KHR_MESH_QUANTIZATION}}class Ku extends Ys{constructor(e,t,n,i){super(e,t,n,i)}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=e*i*3+i;for(let a=0;a!==i;a++)t[a]=n[r+a];return t}interpolate_(e,t,n,i){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=o*2,l=o*3,h=i-t,u=(n-t)/h,d=u*u,f=d*u,p=e*l,m=p-l,g=-2*f+3*d,A=f-d,b=1-g,E=A-d+u;for(let _=0;_!==o;_++){const M=a[m+_+o],v=a[m+_+c]*h,S=a[p+_+o],D=a[p+_]*h;r[_]=b*M+E*v+g*S+A*D}return r}}const b_=new en;class E_ extends Ku{interpolate_(e,t,n,i){const r=super.interpolate_(e,t,n,i);return b_.fromArray(r).normalize().toArray(r),r}}const fn={POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6},hs={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},vh={9728:Ht,9729:Xt,9984:Ao,9985:Jh,9986:Pr,9987:ci},Ch={33071:ln,33648:Hr,10497:Dn},Ka={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},Bo={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},ti={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},__={CUBICSPLINE:void 0,LINEAR:fs,STEP:Hs},ja={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function x_(s){return s.DefaultMaterial===void 0&&(s.DefaultMaterial=new Ke({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:Rn})),s.DefaultMaterial}function xi(s,e,t){for(const n in t.extensions)s[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function ni(s,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(s.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function y_(s,e,t){let n=!1,i=!1,r=!1;for(let l=0,h=e.length;l<h;l++){const u=e[l];if(u.POSITION!==void 0&&(n=!0),u.NORMAL!==void 0&&(i=!0),u.COLOR_0!==void 0&&(r=!0),n&&i&&r)break}if(!n&&!i&&!r)return Promise.resolve(s);const a=[],o=[],c=[];for(let l=0,h=e.length;l<h;l++){const u=e[l];if(n){const d=u.POSITION!==void 0?t.getDependency("accessor",u.POSITION):s.attributes.position;a.push(d)}if(i){const d=u.NORMAL!==void 0?t.getDependency("accessor",u.NORMAL):s.attributes.normal;o.push(d)}if(r){const d=u.COLOR_0!==void 0?t.getDependency("accessor",u.COLOR_0):s.attributes.color;c.push(d)}}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(c)]).then(function(l){const h=l[0],u=l[1],d=l[2];return n&&(s.morphAttributes.position=h),i&&(s.morphAttributes.normal=u),r&&(s.morphAttributes.color=d),s.morphTargetsRelative=!0,s})}function v_(s,e){if(s.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)s.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){const t=e.extras.targetNames;if(s.morphTargetInfluences.length===t.length){s.morphTargetDictionary={};for(let n=0,i=t.length;n<i;n++)s.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function C_(s){let e;const t=s.extensions&&s.extensions[je.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+Ja(t.attributes):e=s.indices+":"+Ja(s.attributes)+":"+s.mode,s.targets!==void 0)for(let n=0,i=s.targets.length;n<i;n++)e+=":"+Ja(s.targets[n]);return e}function Ja(s){let e="";const t=Object.keys(s).sort();for(let n=0,i=t.length;n<i;n++)e+=t[n]+":"+s[t[n]]+";";return e}function To(s){switch(s){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function I_(s){return s.search(/\.jpe?g($|\?)/i)>0||s.search(/^data\:image\/jpeg/)===0?"image/jpeg":s.search(/\.webp($|\?)/i)>0||s.search(/^data\:image\/webp/)===0?"image/webp":"image/png"}const S_=new Fe;class M_{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new jE,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,i=!1,r=-1;typeof navigator<"u"&&(n=/^((?!chrome|android).)*safari/i.test(navigator.userAgent)===!0,i=navigator.userAgent.indexOf("Firefox")>-1,r=i?navigator.userAgent.match(/Firefox\/([0-9]+)\./)[1]:-1),typeof createImageBitmap>"u"||n||i&&r<98?this.textureLoader=new xb(this.options.manager):this.textureLoader=new Sb(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new cs(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){const n=this,i=this.json,r=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(a){return a._markDefs&&a._markDefs()}),Promise.all(this._invokeAll(function(a){return a.beforeRoot&&a.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(a){const o={scene:a[0][i.scene||0],scenes:a[0],animations:a[1],cameras:a[2],asset:i.asset,parser:n,userData:{}};return xi(r,o,i),ni(o,i),Promise.all(n._invokeAll(function(c){return c.afterRoot&&c.afterRoot(o)})).then(function(){e(o)})}).catch(t)}_markDefs(){const e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let i=0,r=t.length;i<r;i++){const a=t[i].joints;for(let o=0,c=a.length;o<c;o++)e[a[o]].isBone=!0}for(let i=0,r=e.length;i<r;i++){const a=e[i];a.mesh!==void 0&&(this._addNodeRef(this.meshCache,a.mesh),a.skin!==void 0&&(n[a.mesh].isSkinnedMesh=!0)),a.camera!==void 0&&this._addNodeRef(this.cameraCache,a.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;const i=n.clone(),r=(a,o)=>{const c=this.associations.get(a);c!=null&&this.associations.set(o,c);for(const[l,h]of a.children.entries())r(h,o.children[l])};return r(n,i),i.name+="_instance_"+e.uses[t]++,i}_invokeOne(e){const t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){const i=e(t[n]);if(i)return i}return null}_invokeAll(e){const t=Object.values(this.plugins);t.unshift(this);const n=[];for(let i=0;i<t.length;i++){const r=e(t[i]);r&&n.push(r)}return n}getDependency(e,t){const n=e+":"+t;let i=this.cache.get(n);if(!i){switch(e){case"scene":i=this.loadScene(t);break;case"node":i=this._invokeOne(function(r){return r.loadNode&&r.loadNode(t)});break;case"mesh":i=this._invokeOne(function(r){return r.loadMesh&&r.loadMesh(t)});break;case"accessor":i=this.loadAccessor(t);break;case"bufferView":i=this._invokeOne(function(r){return r.loadBufferView&&r.loadBufferView(t)});break;case"buffer":i=this.loadBuffer(t);break;case"material":i=this._invokeOne(function(r){return r.loadMaterial&&r.loadMaterial(t)});break;case"texture":i=this._invokeOne(function(r){return r.loadTexture&&r.loadTexture(t)});break;case"skin":i=this.loadSkin(t);break;case"animation":i=this._invokeOne(function(r){return r.loadAnimation&&r.loadAnimation(t)});break;case"camera":i=this.loadCamera(t);break;default:if(i=this._invokeOne(function(r){return r!=this&&r.getDependency&&r.getDependency(e,t)}),!i)throw new Error("Unknown type: "+e);break}this.cache.add(n,i)}return i}getDependencies(e){let t=this.cache.get(e);if(!t){const n=this,i=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(i.map(function(r,a){return n.getDependency(e,a)})),this.cache.add(e,t)}return t}loadBuffer(e){const t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[je.KHR_BINARY_GLTF].body);const i=this.options;return new Promise(function(r,a){n.load(ks.resolveURL(t.uri,i.path),r,void 0,function(){a(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){const t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){const i=t.byteLength||0,r=t.byteOffset||0;return n.slice(r,r+i)})}loadAccessor(e){const t=this,n=this.json,i=this.json.accessors[e];if(i.bufferView===void 0&&i.sparse===void 0){const a=Ka[i.type],o=hs[i.componentType],c=i.normalized===!0,l=new o(i.count*a);return Promise.resolve(new Ut(l,a,c))}const r=[];return i.bufferView!==void 0?r.push(this.getDependency("bufferView",i.bufferView)):r.push(null),i.sparse!==void 0&&(r.push(this.getDependency("bufferView",i.sparse.indices.bufferView)),r.push(this.getDependency("bufferView",i.sparse.values.bufferView))),Promise.all(r).then(function(a){const o=a[0],c=Ka[i.type],l=hs[i.componentType],h=l.BYTES_PER_ELEMENT,u=h*c,d=i.byteOffset||0,f=i.bufferView!==void 0?n.bufferViews[i.bufferView].byteStride:void 0,p=i.normalized===!0;let m,g;if(f&&f!==u){const A=Math.floor(d/f),b="InterleavedBuffer:"+i.bufferView+":"+i.componentType+":"+A+":"+i.count;let E=t.cache.get(b);E||(m=new l(o,A*f,i.count*f/h),E=new k0(m,f/h),t.cache.add(b,E)),g=new Wo(E,c,d%f/h,p)}else o===null?m=new l(i.count*c):m=new l(o,d,i.count*c),g=new Ut(m,c,p);if(i.sparse!==void 0){const A=Ka.SCALAR,b=hs[i.sparse.indices.componentType],E=i.sparse.indices.byteOffset||0,_=i.sparse.values.byteOffset||0,M=new b(a[1],E,i.sparse.count*A),v=new l(a[2],_,i.sparse.count*c);o!==null&&(g=new Ut(g.array.slice(),g.itemSize,g.normalized));for(let S=0,D=M.length;S<D;S++){const x=M[S];if(g.setX(x,v[S*c]),c>=2&&g.setY(x,v[S*c+1]),c>=3&&g.setZ(x,v[S*c+2]),c>=4&&g.setW(x,v[S*c+3]),c>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}}return g})}loadTexture(e){const t=this.json,n=this.options,r=t.textures[e].source,a=t.images[r];let o=this.textureLoader;if(a.uri){const c=n.manager.getHandler(a.uri);c!==null&&(o=c)}return this.loadTextureImage(e,r,o)}loadTextureImage(e,t,n){const i=this,r=this.json,a=r.textures[e],o=r.images[t],c=(o.uri||o.bufferView)+":"+a.sampler;if(this.textureCache[c])return this.textureCache[c];const l=this.loadImageSource(t,n).then(function(h){h.flipY=!1,h.name=a.name||o.name||"",h.name===""&&typeof o.uri=="string"&&o.uri.startsWith("data:image/")===!1&&(h.name=o.uri);const d=(r.samplers||{})[a.sampler]||{};return h.magFilter=vh[d.magFilter]||Xt,h.minFilter=vh[d.minFilter]||ci,h.wrapS=Ch[d.wrapS]||Dn,h.wrapT=Ch[d.wrapT]||Dn,i.associations.set(h,{textures:e}),h}).catch(function(){return null});return this.textureCache[c]=l,l}loadImageSource(e,t){const n=this,i=this.json,r=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(u=>u.clone());const a=i.images[e],o=self.URL||self.webkitURL;let c=a.uri||"",l=!1;if(a.bufferView!==void 0)c=n.getDependency("bufferView",a.bufferView).then(function(u){l=!0;const d=new Blob([u],{type:a.mimeType});return c=o.createObjectURL(d),c});else if(a.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");const h=Promise.resolve(c).then(function(u){return new Promise(function(d,f){let p=d;t.isImageBitmapLoader===!0&&(p=function(m){const g=new Ft(m);g.needsUpdate=!0,d(g)}),t.load(ks.resolveURL(u,r.path),p,void 0,f)})}).then(function(u){return l===!0&&o.revokeObjectURL(c),u.userData.mimeType=a.mimeType||I_(a.uri),u}).catch(function(u){throw console.error("THREE.GLTFLoader: Couldn't load texture",c),u});return this.sourceCache[e]=h,h}assignTexture(e,t,n,i){const r=this;return this.getDependency("texture",n.index).then(function(a){if(!a)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(a=a.clone(),a.channel=n.texCoord),r.extensions[je.KHR_TEXTURE_TRANSFORM]){const o=n.extensions!==void 0?n.extensions[je.KHR_TEXTURE_TRANSFORM]:void 0;if(o){const c=r.associations.get(a);a=r.extensions[je.KHR_TEXTURE_TRANSFORM].extendTexture(a,o),r.associations.set(a,c)}}return i!==void 0&&(a.colorSpace=i),e[t]=a,a})}assignFinalMaterial(e){const t=e.geometry;let n=e.material;const i=t.attributes.tangent===void 0,r=t.attributes.color!==void 0,a=t.attributes.normal===void 0;if(e.isPoints){const o="PointsMaterial:"+n.uuid;let c=this.cache.get(o);c||(c=new Yo,wn.prototype.copy.call(c,n),c.color.copy(n.color),c.map=n.map,c.sizeAttenuation=!1,this.cache.add(o,c)),n=c}else if(e.isLine){const o="LineBasicMaterial:"+n.uuid;let c=this.cache.get(o);c||(c=new Xo,wn.prototype.copy.call(c,n),c.color.copy(n.color),c.map=n.map,this.cache.add(o,c)),n=c}if(i||r||a){let o="ClonedMaterial:"+n.uuid+":";i&&(o+="derivative-tangents:"),r&&(o+="vertex-colors:"),a&&(o+="flat-shading:");let c=this.cache.get(o);c||(c=n.clone(),r&&(c.vertexColors=!0),a&&(c.flatShading=!0),i&&(c.normalScale&&(c.normalScale.y*=-1),c.clearcoatNormalScale&&(c.clearcoatNormalScale.y*=-1)),this.cache.add(o,c),this.associations.set(c,this.associations.get(n))),n=c}e.material=n}getMaterialType(){return Ke}loadMaterial(e){const t=this,n=this.json,i=this.extensions,r=n.materials[e];let a;const o={},c=r.extensions||{},l=[];if(c[je.KHR_MATERIALS_UNLIT]){const u=i[je.KHR_MATERIALS_UNLIT];a=u.getMaterialType(),l.push(u.extendParams(o,r,t))}else{const u=r.pbrMetallicRoughness||{};if(o.color=new Ae(1,1,1),o.opacity=1,Array.isArray(u.baseColorFactor)){const d=u.baseColorFactor;o.color.setRGB(d[0],d[1],d[2],Et),o.opacity=d[3]}u.baseColorTexture!==void 0&&l.push(t.assignTexture(o,"map",u.baseColorTexture,dt)),o.metalness=u.metallicFactor!==void 0?u.metallicFactor:1,o.roughness=u.roughnessFactor!==void 0?u.roughnessFactor:1,u.metallicRoughnessTexture!==void 0&&(l.push(t.assignTexture(o,"metalnessMap",u.metallicRoughnessTexture)),l.push(t.assignTexture(o,"roughnessMap",u.metallicRoughnessTexture))),a=this._invokeOne(function(d){return d.getMaterialType&&d.getMaterialType(e)}),l.push(Promise.all(this._invokeAll(function(d){return d.extendMaterialParams&&d.extendMaterialParams(e,o)})))}r.doubleSided===!0&&(o.side=sn);const h=r.alphaMode||ja.OPAQUE;if(h===ja.BLEND?(o.transparent=!0,o.depthWrite=!1):(o.transparent=!1,h===ja.MASK&&(o.alphaTest=r.alphaCutoff!==void 0?r.alphaCutoff:.5)),r.normalTexture!==void 0&&a!==Mn&&(l.push(t.assignTexture(o,"normalMap",r.normalTexture)),o.normalScale=new oe(1,1),r.normalTexture.scale!==void 0)){const u=r.normalTexture.scale;o.normalScale.set(u,u)}if(r.occlusionTexture!==void 0&&a!==Mn&&(l.push(t.assignTexture(o,"aoMap",r.occlusionTexture)),r.occlusionTexture.strength!==void 0&&(o.aoMapIntensity=r.occlusionTexture.strength)),r.emissiveFactor!==void 0&&a!==Mn){const u=r.emissiveFactor;o.emissive=new Ae().setRGB(u[0],u[1],u[2],Et)}return r.emissiveTexture!==void 0&&a!==Mn&&l.push(t.assignTexture(o,"emissiveMap",r.emissiveTexture,dt)),Promise.all(l).then(function(){const u=new a(o);return r.name&&(u.name=r.name),ni(u,r),t.associations.set(u,{materials:e}),r.extensions&&xi(i,u,r),u})}createUniqueName(e){const t=st.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){const t=this,n=this.extensions,i=this.primitiveCache;function r(o){return n[je.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(o,t).then(function(c){return Ih(c,o,t)})}const a=[];for(let o=0,c=e.length;o<c;o++){const l=e[o],h=C_(l),u=i[h];if(u)a.push(u.promise);else{let d;l.extensions&&l.extensions[je.KHR_DRACO_MESH_COMPRESSION]?d=r(l):d=Ih(new It,l,t),i[h]={primitive:l,promise:d},a.push(d)}}return Promise.all(a)}loadMesh(e){const t=this,n=this.json,i=this.extensions,r=n.meshes[e],a=r.primitives,o=[];for(let c=0,l=a.length;c<l;c++){const h=a[c].material===void 0?x_(this.cache):this.getDependency("material",a[c].material);o.push(h)}return o.push(t.loadGeometries(a)),Promise.all(o).then(function(c){const l=c.slice(0,c.length-1),h=c[c.length-1],u=[];for(let f=0,p=h.length;f<p;f++){const m=h[f],g=a[f];let A;const b=l[f];if(g.mode===fn.TRIANGLES||g.mode===fn.TRIANGLE_STRIP||g.mode===fn.TRIANGLE_FAN||g.mode===void 0)A=r.isSkinnedMesh===!0?new z0(m,b):new _e(m,b),A.isSkinnedMesh===!0&&A.normalizeSkinWeights(),g.mode===fn.TRIANGLE_STRIP?A.geometry=xh(A.geometry,su):g.mode===fn.TRIANGLE_FAN&&(A.geometry=xh(A.geometry,_o));else if(g.mode===fn.LINES)A=new q0(m,b);else if(g.mode===fn.LINE_STRIP)A=new na(m,b);else if(g.mode===fn.LINE_LOOP)A=new X0(m,b);else if(g.mode===fn.POINTS)A=new wu(m,b);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+g.mode);Object.keys(A.geometry.morphAttributes).length>0&&v_(A,r),A.name=t.createUniqueName(r.name||"mesh_"+e),ni(A,r),g.extensions&&xi(i,A,g),t.assignFinalMaterial(A),u.push(A)}for(let f=0,p=u.length;f<p;f++)t.associations.set(u[f],{meshes:e,primitives:f});if(u.length===1)return r.extensions&&xi(i,u[0],r),u[0];const d=new gt;r.extensions&&xi(i,d,r),t.associations.set(d,{meshes:e});for(let f=0,p=u.length;f<p;f++)d.add(u[f]);return d})}loadCamera(e){let t;const n=this.json.cameras[e],i=n[n.type];if(!i){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new Yt(Ie.radToDeg(i.yfov),i.aspectRatio||1,i.znear||1,i.zfar||2e6):n.type==="orthographic"&&(t=new Ho(-i.xmag,i.xmag,i.ymag,-i.ymag,i.znear,i.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),ni(t,n),Promise.resolve(t)}loadSkin(e){const t=this.json.skins[e],n=[];for(let i=0,r=t.joints.length;i<r;i++)n.push(this._loadNodeShallow(t.joints[i]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(i){const r=i.pop(),a=i,o=[],c=[];for(let l=0,h=a.length;l<h;l++){const u=a[l];if(u){o.push(u);const d=new Fe;r!==null&&d.fromArray(r.array,l*16),c.push(d)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[l])}return new qo(o,c)})}loadAnimation(e){const t=this.json,n=this,i=t.animations[e],r=i.name?i.name:"animation_"+e,a=[],o=[],c=[],l=[],h=[];for(let u=0,d=i.channels.length;u<d;u++){const f=i.channels[u],p=i.samplers[f.sampler],m=f.target,g=m.node,A=i.parameters!==void 0?i.parameters[p.input]:p.input,b=i.parameters!==void 0?i.parameters[p.output]:p.output;m.node!==void 0&&(a.push(this.getDependency("node",g)),o.push(this.getDependency("accessor",A)),c.push(this.getDependency("accessor",b)),l.push(p),h.push(m))}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(c),Promise.all(l),Promise.all(h)]).then(function(u){const d=u[0],f=u[1],p=u[2],m=u[3],g=u[4],A=[];for(let b=0,E=d.length;b<E;b++){const _=d[b],M=f[b],v=p[b],S=m[b],D=g[b];if(_===void 0)continue;_.updateMatrix&&_.updateMatrix();const x=n._createAnimationTracks(_,M,v,S,D);if(x)for(let C=0;C<x.length;C++)A.push(x[C])}return new Mo(r,void 0,A)})}createNodeMesh(e){const t=this.json,n=this,i=t.nodes[e];return i.mesh===void 0?null:n.getDependency("mesh",i.mesh).then(function(r){const a=n._getNodeRef(n.meshCache,i.mesh,r);return i.weights!==void 0&&a.traverse(function(o){if(o.isMesh)for(let c=0,l=i.weights.length;c<l;c++)o.morphTargetInfluences[c]=i.weights[c]}),a})}loadNode(e){const t=this.json,n=this,i=t.nodes[e],r=n._loadNodeShallow(e),a=[],o=i.children||[];for(let l=0,h=o.length;l<h;l++)a.push(n.getDependency("node",o[l]));const c=i.skin===void 0?Promise.resolve(null):n.getDependency("skin",i.skin);return Promise.all([r,Promise.all(a),c]).then(function(l){const h=l[0],u=l[1],d=l[2];d!==null&&h.traverse(function(f){f.isSkinnedMesh&&f.bind(d,S_)});for(let f=0,p=u.length;f<p;f++)h.add(u[f]);return h})}_loadNodeShallow(e){const t=this.json,n=this.extensions,i=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];const r=t.nodes[e],a=r.name?i.createUniqueName(r.name):"",o=[],c=i._invokeOne(function(l){return l.createNodeMesh&&l.createNodeMesh(e)});return c&&o.push(c),r.camera!==void 0&&o.push(i.getDependency("camera",r.camera).then(function(l){return i._getNodeRef(i.cameraCache,r.camera,l)})),i._invokeAll(function(l){return l.createNodeAttachment&&l.createNodeAttachment(e)}).forEach(function(l){o.push(l)}),this.nodeCache[e]=Promise.all(o).then(function(l){let h;if(r.isBone===!0?h=new Mu:l.length>1?h=new gt:l.length===1?h=l[0]:h=new Ze,h!==l[0])for(let u=0,d=l.length;u<d;u++)h.add(l[u]);if(r.name&&(h.userData.name=r.name,h.name=a),ni(h,r),r.extensions&&xi(n,h,r),r.matrix!==void 0){const u=new Fe;u.fromArray(r.matrix),h.applyMatrix4(u)}else r.translation!==void 0&&h.position.fromArray(r.translation),r.rotation!==void 0&&h.quaternion.fromArray(r.rotation),r.scale!==void 0&&h.scale.fromArray(r.scale);return i.associations.has(h)||i.associations.set(h,{}),i.associations.get(h).nodes=e,h}),this.nodeCache[e]}loadScene(e){const t=this.extensions,n=this.json.scenes[e],i=this,r=new gt;n.name&&(r.name=i.createUniqueName(n.name)),ni(r,n),n.extensions&&xi(t,r,n);const a=n.nodes||[],o=[];for(let c=0,l=a.length;c<l;c++)o.push(i.getDependency("node",a[c]));return Promise.all(o).then(function(c){for(let h=0,u=c.length;h<u;h++)r.add(c[h]);const l=h=>{const u=new Map;for(const[d,f]of i.associations)(d instanceof wn||d instanceof Ft)&&u.set(d,f);return h.traverse(d=>{const f=i.associations.get(d);f!=null&&u.set(d,f)}),u};return i.associations=l(r),r})}_createAnimationTracks(e,t,n,i,r){const a=[],o=e.name?e.name:e.uuid,c=[];ti[r.path]===ti.weights?e.traverse(function(d){d.morphTargetInfluences&&c.push(d.name?d.name:d.uuid)}):c.push(o);let l;switch(ti[r.path]){case ti.weights:l=gs;break;case ti.rotation:l=Ri;break;case ti.position:case ti.scale:l=ms;break;default:switch(n.itemSize){case 1:l=gs;break;case 2:case 3:default:l=ms;break}break}const h=i.interpolation!==void 0?__[i.interpolation]:fs,u=this._getArrayFromAccessor(n);for(let d=0,f=c.length;d<f;d++){const p=new l(c[d]+"."+ti[r.path],t.array,u,h);i.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(p),a.push(p)}return a}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){const n=To(t.constructor),i=new Float32Array(t.length);for(let r=0,a=t.length;r<a;r++)i[r]=t[r]*n;t=i}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){const i=this instanceof Ri?E_:Ku;return new i(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}}function w_(s,e,t){const n=e.attributes,i=new pn;if(n.POSITION!==void 0){const o=t.json.accessors[n.POSITION],c=o.min,l=o.max;if(c!==void 0&&l!==void 0){if(i.set(new y(c[0],c[1],c[2]),new y(l[0],l[1],l[2])),o.normalized){const h=To(hs[o.componentType]);i.min.multiplyScalar(h),i.max.multiplyScalar(h)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;const r=e.targets;if(r!==void 0){const o=new y,c=new y;for(let l=0,h=r.length;l<h;l++){const u=r[l];if(u.POSITION!==void 0){const d=t.json.accessors[u.POSITION],f=d.min,p=d.max;if(f!==void 0&&p!==void 0){if(c.setX(Math.max(Math.abs(f[0]),Math.abs(p[0]))),c.setY(Math.max(Math.abs(f[1]),Math.abs(p[1]))),c.setZ(Math.max(Math.abs(f[2]),Math.abs(p[2]))),d.normalized){const m=To(hs[d.componentType]);c.multiplyScalar(m)}o.max(c)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}i.expandByVector(o)}s.boundingBox=i;const a=new Ln;i.getCenter(a.center),a.radius=i.min.distanceTo(i.max)/2,s.boundingSphere=a}function Ih(s,e,t){const n=e.attributes,i=[];function r(a,o){return t.getDependency("accessor",a).then(function(c){s.setAttribute(o,c)})}for(const a in n){const o=Bo[a]||a.toLowerCase();o in s.attributes||i.push(r(n[a],o))}if(e.indices!==void 0&&!s.index){const a=t.getDependency("accessor",e.indices).then(function(o){s.setIndex(o)});i.push(a)}return rt.workingColorSpace!==Et&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${rt.workingColorSpace}" not supported.`),ni(s,e),w_(s,e,t),Promise.all(i).then(function(){return e.targets!==void 0?y_(s,e.targets,t):s})}class B_{constructor(e=4){this.pool=e,this.queue=[],this.workers=[],this.workersResolve=[],this.workerStatus=0}_initWorker(e){if(!this.workers[e]){const t=this.workerCreator();t.addEventListener("message",this._onMessage.bind(this,e)),this.workers[e]=t}}_getIdleWorker(){for(let e=0;e<this.pool;e++)if(!(this.workerStatus&1<<e))return e;return-1}_onMessage(e,t){const n=this.workersResolve[e];if(n&&n(t),this.queue.length){const{resolve:i,msg:r,transfer:a}=this.queue.shift();this.workersResolve[e]=i,this.workers[e].postMessage(r,a)}else this.workerStatus^=1<<e}setWorkerCreator(e){this.workerCreator=e}setWorkerLimit(e){this.pool=e}postMessage(e,t){return new Promise(n=>{const i=this._getIdleWorker();i!==-1?(this._initWorker(i),this.workerStatus|=1<<i,this.workersResolve[i]=n,this.workers[i].postMessage(e,t)):this.queue.push({resolve:n,msg:e,transfer:t})})}dispose(){this.workers.forEach(e=>e.terminate()),this.workersResolve.length=0,this.workers.length=0,this.queue.length=0,this.workerStatus=0}}const T_=0,Sh=2,R_=1,Mh=2,D_=0,L_=1,P_=10,F_=0,ju=9,Ju=15,Zu=16,$u=22,ed=37,td=43,nd=76,id=83,sd=97,rd=100,ad=103,od=109,cd=165,ld=166;class U_{constructor(){this.vkFormat=0,this.typeSize=1,this.pixelWidth=0,this.pixelHeight=0,this.pixelDepth=0,this.layerCount=0,this.faceCount=1,this.supercompressionScheme=0,this.levels=[],this.dataFormatDescriptor=[{vendorId:0,descriptorType:0,descriptorBlockSize:0,versionNumber:2,colorModel:0,colorPrimaries:1,transferFunction:2,flags:0,texelBlockDimension:[0,0,0,0],bytesPlane:[0,0,0,0,0,0,0,0],samples:[]}],this.keyValue={},this.globalData=null}}class Ds{constructor(e,t,n,i){this._dataView=new DataView(e.buffer,e.byteOffset+t,n),this._littleEndian=i,this._offset=0}_nextUint8(){const e=this._dataView.getUint8(this._offset);return this._offset+=1,e}_nextUint16(){const e=this._dataView.getUint16(this._offset,this._littleEndian);return this._offset+=2,e}_nextUint32(){const e=this._dataView.getUint32(this._offset,this._littleEndian);return this._offset+=4,e}_nextUint64(){const e=this._dataView.getUint32(this._offset,this._littleEndian)+4294967296*this._dataView.getUint32(this._offset+4,this._littleEndian);return this._offset+=8,e}_nextInt32(){const e=this._dataView.getInt32(this._offset,this._littleEndian);return this._offset+=4,e}_skip(e){return this._offset+=e,this}_scan(e,t=0){const n=this._offset;let i=0;for(;this._dataView.getUint8(this._offset)!==t&&i<e;)i++,this._offset++;return i<e&&this._offset++,new Uint8Array(this._dataView.buffer,this._dataView.byteOffset+n,i)}}const Jt=[171,75,84,88,32,50,48,187,13,10,26,10];function wh(s){return typeof TextDecoder<"u"?new TextDecoder().decode(s):Buffer.from(s).toString("utf8")}function N_(s){const e=new Uint8Array(s.buffer,s.byteOffset,Jt.length);if(e[0]!==Jt[0]||e[1]!==Jt[1]||e[2]!==Jt[2]||e[3]!==Jt[3]||e[4]!==Jt[4]||e[5]!==Jt[5]||e[6]!==Jt[6]||e[7]!==Jt[7]||e[8]!==Jt[8]||e[9]!==Jt[9]||e[10]!==Jt[10]||e[11]!==Jt[11])throw new Error("Missing KTX 2.0 identifier.");const t=new U_,n=17*Uint32Array.BYTES_PER_ELEMENT,i=new Ds(s,Jt.length,n,!0);t.vkFormat=i._nextUint32(),t.typeSize=i._nextUint32(),t.pixelWidth=i._nextUint32(),t.pixelHeight=i._nextUint32(),t.pixelDepth=i._nextUint32(),t.layerCount=i._nextUint32(),t.faceCount=i._nextUint32();const r=i._nextUint32();t.supercompressionScheme=i._nextUint32();const a=i._nextUint32(),o=i._nextUint32(),c=i._nextUint32(),l=i._nextUint32(),h=i._nextUint64(),u=i._nextUint64(),d=new Ds(s,Jt.length+n,3*r*8,!0);for(let X=0;X<r;X++)t.levels.push({levelData:new Uint8Array(s.buffer,s.byteOffset+d._nextUint64(),d._nextUint64()),uncompressedByteLength:d._nextUint64()});const f=new Ds(s,a,o,!0),p={vendorId:f._skip(4)._nextUint16(),descriptorType:f._nextUint16(),versionNumber:f._nextUint16(),descriptorBlockSize:f._nextUint16(),colorModel:f._nextUint8(),colorPrimaries:f._nextUint8(),transferFunction:f._nextUint8(),flags:f._nextUint8(),texelBlockDimension:[f._nextUint8(),f._nextUint8(),f._nextUint8(),f._nextUint8()],bytesPlane:[f._nextUint8(),f._nextUint8(),f._nextUint8(),f._nextUint8(),f._nextUint8(),f._nextUint8(),f._nextUint8(),f._nextUint8()],samples:[]},m=(p.descriptorBlockSize/4-6)/4;for(let X=0;X<m;X++){const k={bitOffset:f._nextUint16(),bitLength:f._nextUint8(),channelType:f._nextUint8(),samplePosition:[f._nextUint8(),f._nextUint8(),f._nextUint8(),f._nextUint8()],sampleLower:-1/0,sampleUpper:1/0};64&k.channelType?(k.sampleLower=f._nextInt32(),k.sampleUpper=f._nextInt32()):(k.sampleLower=f._nextUint32(),k.sampleUpper=f._nextUint32()),p.samples[X]=k}t.dataFormatDescriptor.length=0,t.dataFormatDescriptor.push(p);const g=new Ds(s,c,l,!0);for(;g._offset<l;){const X=g._nextUint32(),k=g._scan(X),G=wh(k),j=g._scan(X-k.byteLength);t.keyValue[G]=G.match(/^ktx/i)?wh(j):j,g._offset%4&&g._skip(4-g._offset%4)}if(u<=0)return t;const A=new Ds(s,h,u,!0),b=A._nextUint16(),E=A._nextUint16(),_=A._nextUint32(),M=A._nextUint32(),v=A._nextUint32(),S=A._nextUint32(),D=[];for(let X=0;X<r;X++)D.push({imageFlags:A._nextUint32(),rgbSliceByteOffset:A._nextUint32(),rgbSliceByteLength:A._nextUint32(),alphaSliceByteOffset:A._nextUint32(),alphaSliceByteLength:A._nextUint32()});const x=h+A._offset,C=x+_,R=C+M,U=R+v,O=new Uint8Array(s.buffer,s.byteOffset+x,_),T=new Uint8Array(s.buffer,s.byteOffset+C,M),F=new Uint8Array(s.buffer,s.byteOffset+R,v),Q=new Uint8Array(s.buffer,s.byteOffset+U,S);return t.globalData={endpointCount:b,selectorCount:E,imageDescs:D,endpointsData:O,selectorsData:T,tablesData:F,extendedData:Q},t}let Za,Vn,Ro;const $a={env:{emscripten_notify_memory_growth:function(s){Ro=new Uint8Array(Vn.exports.memory.buffer)}}};class Q_{init(){return Za||(Za=typeof fetch<"u"?fetch("data:application/wasm;base64,"+Bh).then(e=>e.arrayBuffer()).then(e=>WebAssembly.instantiate(e,$a)).then(this._init):WebAssembly.instantiate(Buffer.from(Bh,"base64"),$a).then(this._init),Za)}_init(e){Vn=e.instance,$a.env.emscripten_notify_memory_growth(0)}decode(e,t=0){if(!Vn)throw new Error("ZSTDDecoder: Await .init() before decoding.");const n=e.byteLength,i=Vn.exports.malloc(n);Ro.set(e,i),t=t||Number(Vn.exports.ZSTD_findDecompressedSize(i,n));const r=Vn.exports.malloc(t),a=Vn.exports.ZSTD_decompress(r,t,i,n),o=Ro.slice(r,r+a);return Vn.exports.free(i),Vn.exports.free(r),o}}const Bh="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IAMNACAEQQNxBEADQCACRQ0FIAAgAkF/aiICaiIDIAEgAmotAAA6AAAgA0EDcQ0ACwsgAkEDTQ0AA0AgACACQXxqIgJqIAEgAmooAgA2AgAgAkEDSw0ACwsgAkUNAgNAIAAgAkF/aiICaiABIAJqLQAAOgAAIAINAAsMAgsgAkEDTQ0AIAIhBANAIAMgASgCADYCACABQQRqIQEgA0EEaiEDIARBfGoiBEEDSw0ACyACQQNxIQILIAJFDQADQCADIAEtAAA6AAAgA0EBaiEDIAFBAWohASACQX9qIgINAAsLIAAL8wICAn8BfgJAIAJFDQAgACACaiIDQX9qIAE6AAAgACABOgAAIAJBA0kNACADQX5qIAE6AAAgACABOgABIANBfWogAToAACAAIAE6AAIgAkEHSQ0AIANBfGogAToAACAAIAE6AAMgAkEJSQ0AIABBACAAa0EDcSIEaiIDIAFB/wFxQYGChAhsIgE2AgAgAyACIARrQXxxIgRqIgJBfGogATYCACAEQQlJDQAgAyABNgIIIAMgATYCBCACQXhqIAE2AgAgAkF0aiABNgIAIARBGUkNACADIAE2AhggAyABNgIUIAMgATYCECADIAE2AgwgAkFwaiABNgIAIAJBbGogATYCACACQWhqIAE2AgAgAkFkaiABNgIAIAQgA0EEcUEYciIEayICQSBJDQAgAa0iBUIghiAFhCEFIAMgBGohAQNAIAEgBTcDGCABIAU3AxAgASAFNwMIIAEgBTcDACABQSBqIQEgAkFgaiICQR9LDQALCyAACy8BAn8gACgCBCAAKAIAQQJ0aiICLQACIQMgACACLwEAIAEgAi0AAxAIajYCACADCy8BAn8gACgCBCAAKAIAQQJ0aiICLQACIQMgACACLwEAIAEgAi0AAxAFajYCACADCx8AIAAgASACKAIEEAg2AgAgARAEGiAAIAJBCGo2AgQLCAAgAGdBH3MLugUBDX8jAEEQayIKJAACfyAEQQNNBEAgCkEANgIMIApBDGogAyAEEAsaIAAgASACIApBDGpBBBAVIgBBbCAAEAMbIAAgACAESxsMAQsgAEEAIAEoAgBBAXRBAmoQECENQVQgAygAACIGQQ9xIgBBCksNABogAiAAQQVqNgIAIAMgBGoiAkF8aiEMIAJBeWohDiACQXtqIRAgAEEGaiELQQQh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ASIDNgLE4AEgACgCvOABIQQgACABNgK84AEgACABIAJqNgK44AEgACABIAQgA2tqNgLA4AELpgEBAX8gACAAKALs4QEQFjYCyOABIABCADcD+OABIABCADcDuOABIABBwOABakIANwMAIABBqNAAaiIBQYyAgOAANgIAIABBADYCmOIBIABCADcDiOEBIABCAzcDgOEBIABBrNABakHgEikCADcCACAAQbTQAWpB6BIoAgA2AgAgACABNgIMIAAgAEGYIGo2AgggACAAQaAwajYCBCAAIABBEGo2AgALYQEBf0G4fyEDAkAgAUEDSQ0AIAIgABAhIgFBA3YiADYCCCACIAFBAXE2AgQgAiABQQF2QQNxIgM2AgACQCADQX9qIgFBAksNAAJAIAFBAWsOAgEAAgtBbA8LIAAhAwsgAwsMACAAIAEgAkEAEC4LiAQCA38CfiADEBYhBCAAQQBBKBAQIQAgBCACSwRAIAQPCyABRQRAQX8PCwJAAkAgA0EBRg0AIAEoAAAiBkGo6r5pRg0AQXYhAyAGQXBxQdDUtMIBRw0BQQghAyACQQhJDQEgAEEAQSgQECEAIAEoAAQhASAAQQE2AhQgACABrTcDAEEADwsgASACIAMQLyIDIAJLDQAgACADNgIYQXIhAyABIARqIgVBf2otAAAiAkEIcQ0AIAJBIHEiBkUEQEFwIQMgBS0AACIFQacBSw0BIAVBB3GtQgEgBUEDdkEKaq2GIgdCA4h+IAd8IQggBEEBaiEECyACQQZ2IQMgAkECdiEFAkAgAkEDcUF/aiICQQJLBEBBACECDAELAkACQAJAIAJBAWsOAgECAAsgASAEai0AACECIARBAWohBAwCCyABIARqLwAAIQIgBEECaiEEDAELIAEgBGooAAAhAiAEQQRqIQQLIAVBAXEhBQJ+AkACQAJAIANBf2oiA0ECTQRAIANBAWsOAgIDAQtCfyAGRQ0DGiABIARqMQAADAMLIAEgBGovAACtQoACfAwCCyABIARqKAAArQwBCyABIARqKQAACyEHIAAgBTYCICAAIAI2AhwgACAHNwMAQQAhAyAAQQA2AhQgACAHIAggBhsiBzcDCCAAIAdCgIAIIAdCgIAIVBs+AhALIAMLWwEBf0G4fyEDIAIQFiICIAFNBH8gACACakF/ai0AACIAQQNxQQJ0QaAeaigC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C0Egak8NAQsgByAHKQNoNwMQIAcgBykDYDcDCCAEIA0gB0EIaiAHQdwAaiAPIA4gESAQEB4hCwwBCyACIARqIQggBCAKEAcgAkERTwRAIARBEGohAgNAIAIgCkEQaiIKEAcgAkEQaiICIAhJDQALCyAIIAlrIQIgByATNgJcIAkgCCAOa0sEQCAJIAggEWtLBEBBbCELDAILIBAgAiAOayICaiIKIANqIBBNBEAgCCAKIAMQDxoMAgsgCCAKQQAgAmsQDyEIIAcgAiADaiIDNgJkIAggAmshCCAOIQILIAlBEE8EQCADIAhqIQMDQCAIIAIQByACQRBqIQIgCEEQaiIIIANJDQALDAELAkAgCUEHTQRAIAggAi0AADoAACAIIAItAAE6AAEgCCACLQACOgACIAggAi0AAzoAAyAIQQRqIAIgCUECdCIDQcAeaigCAGoiAhAXIAIgA0HgHmooAgBrIQIgBygCZCEDDAELIAggAhAMCyADQQlJDQAgAyAIaiEDIAhBCGoiCCACQQhqIgJrQQ9MBEADQCAIIAIQDCACQQhqIQIgCEEIaiIIIANJDQAMAgALAAsDQCAIIAIQByACQRBqIQIgCEEQaiIIIANJDQALCyAHQRhqEAQaIAsgDCALEAMiAhshDCAEIAQgC2ogAhshBCAFQX9qIgUNAAsgDBADDQFBbCEMIAdBGGoQBEECSQ0BQQAhCANAIAhBA0cEQCAAIAhBAnQiAmpBrNABaiACIAdqKAJENgIAIAhBAWohCAwBCwsgBygCXCEIC0G6fyEMIA8gCGsiACANIARrSw0AIAQEfyAEIAggABALIABqBUEACyABayEMCyAHQfAAaiQAIAwLkRcCFn8FfiMAQdABayIHJAAgByAAKALw4QEiCDYCvAEgASACaiESIAggACgCgOIBaiETAkACQCAFRQRAIAEhAwwBCyAAKALE4AEhESAAKALA4AEhFSAAKAK84AEhDyAAQQE2AozhAUEAIQgDQCAIQQNHBEAgByAIQQJ0IgJqIAAgAmpBrNABaigCADYCVCAIQQFqIQgMAQsLIAcgETYCZCAHIA82AmAgByABIA9rNgJoQWwhECAHQShqIAMgBBAGEAMNASAFQQQgBUEESBshFyAHQTxqIAdBKGogACgCABATIAdBxABqIAdBKGogACgCCBATIAdBzABqIAdB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IAdB0AFqJAAgEAslACAAQgA3AgAgAEEAOwEIIABBADoACyAAIAE2AgwgACACOgAKC7QFAQN/IwBBMGsiBCQAIABB/wFqIgVBfWohBgJAIAMvAQIEQCAEQRhqIAEgAhAGIgIQAw0BIARBEGogBEEYaiADEBwgBEEIaiAEQRhqIAMQHCAAIQMDQAJAIARBGGoQBCADIAZPckUEQCADIARBEGogBEEYahASOgAAIAMgBEEIaiAEQRhqEBI6AAEgBEEYahAERQ0BIANBAmohAwsgBUF+aiEFAn8DQEG6fyECIAMiASAFSw0FIAEgBEEQaiAEQRhqEBI6AAAgAUEBaiEDIARBGGoQBEEDRgRAQQIhAiAEQQhqDAILIAMgBUsNBSABIARBCGogBEEYahASOgABIAFBAmohA0EDIQIgBEEYahAEQQNHDQALIARBEGoLIQUgAyAFIARBGGoQEjoAACABIAJqIABrIQIMAwsgAyAEQRBqIARBGGoQEjoAAiADIARBCGogBEEYahASOgADIANBBGohAwwAAAsACyAEQRhqIAEgAhAGIgIQAw0AIARBEGogBEEYaiADEBwgBEEIaiAEQRhqIAMQHCAAIQMDQAJAIARBGGoQBCADIAZPckUEQCADIARBEGogBEEYahAROgAAIAMgBEEIaiAEQRhqEBE6AAEgBEEYahAERQ0BIANBAmohAwsgBUF+aiEFAn8DQEG6fyECIAMiASAFSw0EIAEgBEEQaiAEQRhqEBE6AAAgAUEBaiEDIARBGGoQBEEDRgRAQQIhAiAEQQhqDAILIAMgBUsNBCABIARBCGogBEEYahAROgABIAFBAmohA0EDIQIgBEEYahAEQQNHDQALIARBEGoLIQUgAyAFIARBGGoQEToAACABIAJqIABrIQIMAgsgAyAEQRBqIARBGGoQEToAAiADIARBCGogBEEYahAROgADIANBBGohAwwAAAsACyAEQTBqJAAgAgtpAQF/An8CQAJAIAJBB00NACABKAAAQbfIwuF+Rw0AIAAgASgABDYCmOIBQWIgAEEQaiABIAIQPiIDEAMNAhogAEKBgICAEDcDiOEBIAAgASADaiACIANrECoMAQsgACABIAIQKgtBAAsLrQMBBn8jAEGAAWsiAyQAQWIhCAJAIAJBCUkNACAAQZjQAGogAUEIaiIEIAJBeGogAEGY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wOABCwutAgIEfwF+IwBBQGoiBCQAAkACQCACQQhJDQAgASgAAEFwcUHQ1LTCAUcNACABIAIQIiEBIABCADcDCCAAQQA2AgQgACABNgIADAELIARBGGogASACEC0iAxADBEAgACADEBoMAQsgAwRAIABBuH8QGgwBCyACIAQoAjAiA2shAiABIANqIQMDQAJAIAAgAyACIARBCGoQLCIFEAMEfyAFBSACIAVBA2oiBU8NAUG4fwsQGgwCCyAGQQFqIQYgAiAFayECIAMgBWohAyAEKAIMRQ0ACyAEKAI4BEAgAkEDTQRAIABBuH8QGgwCCyADQQRqIQMLIAQoAighAiAEKQMYIQcgAEEANgIEIAAgAyABazYCACAAIAIgBmytIAcgB0J/URs3AwgLIARBQGskAAslAQF/IwBBEGsiAiQAIAIgACABEFEgAigCACEAIAJBEGokACAAC30BBH8jAEGQBGsiBCQAIARB/wE2AggCQCAEQRBqIARBCGogBEEMaiABIAIQFSIGEAMEQCAGIQUMAQtBVCEFIAQoAgwiB0EGSw0AIAMgBEEQaiAEKAIIIAcQQSIFEAMNACAAIAEgBmogAiAGayADEDwhBQsgBEGQBGokACAFC4cBAgJ/An5BABAWIQMCQANAIAEgA08EQAJAIAAoAABBcHFB0NS0wgFGBEAgACABECIiAhADRQ0BQn4PCyAAIAEQVSIEQn1WDQMgBCAFfCIFIARUIQJCfiEEIAINAyAAIAEQUiICEAMNAwsgASACayEBIAAgAmohAAwBCwtCfiAFIAEbIQQLIAQLPwIBfwF+IwBBMGsiAiQAAn5CfiACQQhqIAAgARAtDQAaQgAgAigCHEEBRg0AGiACKQMICyEDIAJBMGokACADC40BAQJ/IwBBMGsiASQAAkAgAEUNACAAKAKI4gENACABIABB/OEBaigCADYCKCABIAApAvThATcDICAAEDAgACgCqOIBIQIgASABKAIoNgIYIAEgASkDIDcDECACIAFBEGoQGyAAQQA2AqjiASABIAEoAig2AgggASABKQMgNwMAIAAgARAbCyABQTBqJAALKgECfyMAQRBrIgAkACAAQQA2AgggAEIANwMAIAAQWCEBIABBEGokACABC4cBAQN/IwBBEGsiAiQAAkAgACgCAEUgACgCBEVzDQAgAiAAKAIINgIIIAIgACkCADcDAAJ/IAIoAgAiAQRAIAIoAghBqOMJIAERBQAMAQtBqOMJECgLIgFFDQAgASAAKQIANwL04QEgAUH84QFqIAAoAgg2AgAgARBZIAEhAwsgAkEQaiQAIAMLywEBAn8jAEEgayIBJAAgAEGBgIDAADYCtOIBIABBADYCiOIBIABBADYC7OEBIABCADcDkOIBIABBADYCpOMJIABBADYC3OIBIABCADcCzOIBIABBADYCvOIBIABBADYCxOABIABCADcCnOIBIABBpOIBakIANwIAIABBrOIBakEANgIAIAFCADcCECABQgA3AhggASABKQMYNwMIIAEgASkDEDcDACABKAIIQQh2QQFxIQIgAEEANgLg4gEgACACNgKM4gEgAUEgaiQAC3YBA38jAEEwayIBJAAgAARAIAEgAEHE0AFqIgIoAgA2AiggASAAKQK80AE3AyAgACgCACEDIAEgAigCADYCGCABIAApArzQATcDECADIAFBEGoQGyABIAEoAig2AgggASABKQMgNwMAIAAgARAbCyABQTBqJAALzAEBAX8gACABKAK00AE2ApjiASAAIAEoAgQiAjYCwOABIAAgAjYCvOABIAAgAiABKAIIaiICNgK44AEgACACNgLE4AEgASgCuNABBEAgAEKBgICAEDcDiOEBIAAgAUGk0ABqNgIMIAAgAUGUIGo2AgggACABQZwwajYCBCAAIAFBDGo2AgAgAEGs0AFqIAFBqNABaigCADYCACAAQbDQAWogAUGs0AFqKAIANgIAIABBtNABaiABQbDQAWooAgA2AgAPCyAAQgA3A4jhAQs7ACACRQRAQbp/DwsgBEUEQEFsDwsgAiAEEGAEQCAAIAEgAiADIAQgBRBhDwsgACABIAIgAyAEIAUQZQtGAQF/IwBBEGsiBSQAIAVBCGogBBAOAn8gBS0ACQRAIAAgASACIAMgBBAyDAELIAAgASACIAMgBBA0CyEAIAVBEGokACAACzQAIAAgAyAEIAUQNiIFEAMEQCAFDwsgBSAESQR/IAEgAiADIAVqIAQgBWsgABA1BUG4fwsLRgEBfyMAQRBrIgUkACAFQQhqIAQQDgJ/IAUtAAkEQCAAIAEgAiADIAQQYgwBCyAAIAEgAiADIAQQNQshACAFQRBqJAAgAAtZAQF/QQ8hAiABIABJBEAgAUEE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",eo=new WeakMap;let to=0,no;class _n extends hi{constructor(e){super(e),this.transcoderPath="",this.transcoderBinary=null,this.transcoderPending=null,this.workerPool=new B_,this.workerSourceURL="",this.workerConfig=null,typeof MSC_TRANSCODER<"u"&&console.warn('THREE.KTX2Loader: Please update to latest "basis_transcoder". "msc_basis_transcoder" is no longer supported in three.js r125+.')}setTranscoderPath(e){return this.transcoderPath=e,this}setWorkerLimit(e){return this.workerPool.setWorkerLimit(e),this}detectSupport(e){return e.isWebGPURenderer===!0?this.workerConfig={astcSupported:e.hasFeature("texture-compression-astc"),etc1Supported:!1,etc2Supported:e.hasFeature("texture-compression-etc2"),dxtSupported:e.hasFeature("texture-compression-bc"),bptcSupported:!1,pvrtcSupported:!1}:(this.workerConfig={astcSupported:e.extensions.has("WEBGL_compressed_texture_astc"),etc1Supported:e.extensions.has("WEBGL_compressed_texture_etc1"),etc2Supported:e.extensions.has("WEBGL_compressed_texture_etc"),dxtSupported:e.extensions.has("WEBGL_compressed_texture_s3tc"),bptcSupported:e.extensions.has("EXT_texture_compression_bptc"),pvrtcSupported:e.extensions.has("WEBGL_compressed_texture_pvrtc")||e.extensions.has("WEBKIT_WEBGL_compressed_texture_pvrtc")},e.capabilities.isWebGL2&&(this.workerConfig.etc1Supported=!1)),this}init(){if(!this.transcoderPending){const e=new cs(this.manager);e.setPath(this.transcoderPath),e.setWithCredentials(this.withCredentials);const t=e.loadAsync("basis_transcoder.js"),n=new cs(this.manager);n.setPath(this.transcoderPath),n.setResponseType("arraybuffer"),n.setWithCredentials(this.withCredentials);const i=n.loadAsync("basis_transcoder.wasm");this.transcoderPending=Promise.all([t,i]).then(([r,a])=>{const o=_n.BasisWorker.toString(),c=["/* constants */","let _EngineFormat = "+JSON.stringify(_n.EngineFormat),"let _TranscoderFormat = "+JSON.stringify(_n.TranscoderFormat),"let _BasisFormat = "+JSON.stringify(_n.BasisFormat),"/* basis_transcoder.js */",r,"/* worker */",o.substring(o.indexOf("{")+1,o.lastIndexOf("}"))].join(`
`);this.workerSourceURL=URL.createObjectURL(new Blob([c])),this.transcoderBinary=a,this.workerPool.setWorkerCreator(()=>{const l=new Worker(this.workerSourceURL),h=this.transcoderBinary.slice(0);return l.postMessage({type:"init",config:this.workerConfig,transcoderBinary:h},[h]),l})}),to>0&&console.warn("THREE.KTX2Loader: Multiple active KTX2 loaders may cause performance issues. Use a single KTX2Loader instance, or call .dispose() on old instances."),to++}return this.transcoderPending}load(e,t,n,i){if(this.workerConfig===null)throw new Error("THREE.KTX2Loader: Missing initialization with `.detectSupport( renderer )`.");const r=new cs(this.manager);r.setResponseType("arraybuffer"),r.setWithCredentials(this.withCredentials),r.load(e,a=>{if(eo.has(a))return eo.get(a).promise.then(t).catch(i);this._createTexture(a).then(o=>t?t(o):null).catch(i)},n,i)}_createTextureFrom(e,t){const{faces:n,width:i,height:r,format:a,type:o,error:c,dfdFlags:l}=e;if(o==="error")return Promise.reject(c);let h;if(t.faceCount===6)h=new K0(n,a,Pt);else{const u=n[0].mipmaps;h=t.layerCount>1?new Y0(u,i,r,t.layerCount,a,Pt):new ia(u,i,r,a,Pt)}return h.minFilter=n[0].mipmaps.length===1?Xt:ci,h.magFilter=Xt,h.generateMipmaps=!1,h.needsUpdate=!0,h.colorSpace=hd(t),h.premultiplyAlpha=!!(l&R_),h}async _createTexture(e,t={}){const n=N_(new Uint8Array(e));if(n.vkFormat!==F_)return k_(n);const i=t,r=this.init().then(()=>this.workerPool.postMessage({type:"transcode",buffer:e,taskConfig:i},[e])).then(a=>this._createTextureFrom(a.data,n));return eo.set(e,{promise:r}),r}dispose(){return this.workerPool.dispose(),this.workerSourceURL&&URL.revokeObjectURL(this.workerSourceURL),to--,this}}_n.BasisFormat={ETC1S:0,UASTC_4x4:1};_n.TranscoderFormat={ETC1:0,ETC2:1,BC1:2,BC3:3,BC4:4,BC5:5,BC7_M6_OPAQUE_ONLY:6,BC7_M5:7,PVRTC1_4_RGB:8,PVRTC1_4_RGBA:9,ASTC_4x4:10,ATC_RGB:11,ATC_RGBA_INTERPOLATED_ALPHA:12,RGBA32:13,RGB565:14,BGR565:15,RGBA4444:16};_n.EngineFormat={RGBAFormat:Lt,RGBA_ASTC_4x4_Format:Eo,RGBA_BPTC_Format:Nr,RGBA_ETC2_EAC_Format:bo,RGBA_PVRTC_4BPPV1_Format:go,RGBA_S3TC_DXT5_Format:Ur,RGB_ETC1_Format:No,RGB_ETC2_Format:mo,RGB_PVRTC_4BPPV1_Format:po,RGB_S3TC_DXT1_Format:Fr};_n.BasisWorker=function(){let s,e,t;const n=_EngineFormat,i=_TranscoderFormat,r=_BasisFormat;self.addEventListener("message",function(p){const m=p.data;switch(m.type){case"init":s=m.config,a(m.transcoderBinary);break;case"transcode":e.then(()=>{try{const{faces:g,buffers:A,width:b,height:E,hasAlpha:_,format:M,dfdFlags:v}=o(m.buffer);self.postMessage({type:"transcode",id:m.id,faces:g,width:b,height:E,hasAlpha:_,format:M,dfdFlags:v},A)}catch(g){console.error(g),self.postMessage({type:"error",id:m.id,error:g.message})}});break}});function a(p){e=new Promise(m=>{t={wasmBinary:p,onRuntimeInitialized:m},BASIS(t)}).then(()=>{t.initializeBasis(),t.KTX2File===void 0&&console.warn("THREE.KTX2Loader: Please update Basis Universal transcoder.")})}function o(p){const m=new t.KTX2File(new Uint8Array(p));function g(){m.close(),m.delete()}if(!m.isValid())throw g(),new Error("THREE.KTX2Loader:	Invalid or unsupported .ktx2 file");const A=m.isUASTC()?r.UASTC_4x4:r.ETC1S,b=m.getWidth(),E=m.getHeight(),_=m.getLayers()||1,M=m.getLevels(),v=m.getFaces(),S=m.getHasAlpha(),D=m.getDFDFlags(),{transcoderFormat:x,engineFormat:C}=u(A,b,E,S);if(!b||!E||!M)throw g(),new Error("THREE.KTX2Loader:	Invalid texture");if(!m.startTranscoding())throw g(),new Error("THREE.KTX2Loader: .startTranscoding failed");const R=[],U=[];for(let O=0;O<v;O++){const T=[];for(let F=0;F<M;F++){const Q=[];let X,k;for(let j=0;j<_;j++){const J=m.getImageLevelInfo(F,j,O);O===0&&F===0&&j===0&&(J.origWidth%4!==0||J.origHeight%4!==0)&&console.warn("THREE.KTX2Loader: ETC1S and UASTC textures should use multiple-of-four dimensions."),M>1?(X=J.origWidth,k=J.origHeight):(X=J.width,k=J.height);const ne=new Uint8Array(m.getImageTranscodedSizeInBytes(F,j,0,x));if(!m.transcodeImage(ne,F,j,O,x,0,-1,-1))throw g(),new Error("THREE.KTX2Loader: .transcodeImage failed.");Q.push(ne)}const G=f(Q);T.push({data:G,width:X,height:k}),U.push(G.buffer)}R.push({mipmaps:T,width:b,height:E,format:C})}return g(),{faces:R,buffers:U,width:b,height:E,hasAlpha:S,format:C,dfdFlags:D}}const c=[{if:"astcSupported",basisFormat:[r.UASTC_4x4],transcoderFormat:[i.ASTC_4x4,i.ASTC_4x4],engineFormat:[n.RGBA_ASTC_4x4_Format,n.RGBA_ASTC_4x4_Format],priorityETC1S:1/0,priorityUASTC:1,needsPowerOfTwo:!1},{if:"bptcSupported",basisFormat:[r.ETC1S,r.UASTC_4x4],transcoderFormat:[i.BC7_M5,i.BC7_M5],engineFormat:[n.RGBA_BPTC_Format,n.RGBA_BPTC_Format],priorityETC1S:3,priorityUASTC:2,needsPowerOfTwo:!1},{if:"dxtSupported",basisFormat:[r.ETC1S,r.UASTC_4x4],transcoderFormat:[i.BC1,i.BC3],engineFormat:[n.RGB_S3TC_DXT1_Format,n.RGBA_S3TC_DXT5_Format],priorityETC1S:4,priorityUASTC:5,needsPowerOfTwo:!1},{if:"etc2Supported",basisFormat:[r.ETC1S,r.UASTC_4x4],transcoderFormat:[i.ETC1,i.ETC2],engineFormat:[n.RGB_ETC2_Format,n.RGBA_ETC2_EAC_Format],priorityETC1S:1,priorityUASTC:3,needsPowerOfTwo:!1},{if:"etc1Supported",basisFormat:[r.ETC1S,r.UASTC_4x4],transcoderFormat:[i.ETC1],engineFormat:[n.RGB_ETC1_Format],priorityETC1S:2,priorityUASTC:4,needsPowerOfTwo:!1},{if:"pvrtcSupported",basisFormat:[r.ETC1S,r.UASTC_4x4],transcoderFormat:[i.PVRTC1_4_RGB,i.PVRTC1_4_RGBA],engineFormat:[n.RGB_PVRTC_4BPPV1_Format,n.RGBA_PVRTC_4BPPV1_Format],priorityETC1S:5,priorityUASTC:6,needsPowerOfTwo:!0}],l=c.sort(function(p,m){return p.priorityETC1S-m.priorityETC1S}),h=c.sort(function(p,m){return p.priorityUASTC-m.priorityUASTC});function u(p,m,g,A){let b,E;const _=p===r.ETC1S?l:h;for(let M=0;M<_.length;M++){const v=_[M];if(s[v.if]&&v.basisFormat.includes(p)&&!(A&&v.transcoderFormat.length<2)&&!(v.needsPowerOfTwo&&!(d(m)&&d(g))))return b=v.transcoderFormat[A?1:0],E=v.engineFormat[A?1:0],{transcoderFormat:b,engineFormat:E}}return console.warn("THREE.KTX2Loader: No suitable compressed texture format found. Decoding to RGBA32."),b=i.RGBA32,E=n.RGBAFormat,{transcoderFormat:b,engineFormat:E}}function d(p){return p<=2?!0:(p&p-1)===0&&p!==0}function f(p){if(p.length===1)return p[0];let m=0;for(let b=0;b<p.length;b++){const E=p[b];m+=E.byteLength}const g=new Uint8Array(m);let A=0;for(let b=0;b<p.length;b++){const E=p[b];g.set(E,A),A+=E.byteLength}return g}};const O_=new Set([Lt,ts,es]),io={[od]:Lt,[sd]:Lt,[ed]:Lt,[td]:Lt,[ad]:ts,[id]:ts,[Zu]:ts,[$u]:ts,[rd]:es,[nd]:es,[Ju]:es,[ju]:es,[ld]:zr,[cd]:zr},so={[od]:hn,[sd]:qn,[ed]:Pt,[td]:Pt,[ad]:hn,[id]:qn,[Zu]:Pt,[$u]:Pt,[rd]:hn,[nd]:qn,[Ju]:Pt,[ju]:Pt,[ld]:Pt,[cd]:Pt};async function k_(s){const{vkFormat:e}=s;if(io[e]===void 0)throw new Error("THREE.KTX2Loader: Unsupported vkFormat.");let t;s.supercompressionScheme===Sh&&(no||(no=new Promise(async r=>{const a=new Q_;await a.init(),r(a)})),t=await no);const n=[];for(let r=0;r<s.levels.length;r++){const a=Math.max(1,s.pixelWidth>>r),o=Math.max(1,s.pixelHeight>>r),c=s.pixelDepth?Math.max(1,s.pixelDepth>>r):0,l=s.levels[r];let h;if(s.supercompressionScheme===T_)h=l.levelData;else if(s.supercompressionScheme===Sh)h=t.decode(l.levelData,l.uncompressedByteLength);else throw new Error("THREE.KTX2Loader: Unsupported supercompressionScheme.");let u;so[e]===hn?u=new Float32Array(h.buffer,h.byteOffset,h.byteLength/Float32Array.BYTES_PER_ELEMENT):so[e]===qn?u=new Uint16Array(h.buffer,h.byteOffset,h.byteLength/Uint16Array.BYTES_PER_ELEMENT):u=h,n.push({data:u,width:a,height:o,depth:c})}let i;if(O_.has(io[e]))i=s.pixelDepth===0?new ta(n[0].data,s.pixelWidth,s.pixelHeight):new du(n[0].data,s.pixelWidth,s.pixelHeight,s.pixelDepth);else{if(s.pixelDepth>0)throw new Error("THREE.KTX2Loader: Unsupported pixelDepth.");i=new ia(n,s.pixelWidth,s.pixelHeight)}return i.mipmaps=n,i.type=so[e],i.format=io[e],i.colorSpace=hd(s),i.needsUpdate=!0,Promise.resolve(i)}function hd(s){const e=s.dataFormatDescriptor[0];return e.colorPrimaries===L_?e.transferFunction===Mh?dt:Et:e.colorPrimaries===P_?e.transferFunction===Mh?$r:Ws:(e.colorPrimaries===D_||console.warn(`THREE.KTX2Loader: Unsupported color primaries, "${e.colorPrimaries}"`),rn)}var ud=function(){var s="b9H79Tebbbe8Fv9Gbb9Gvuuuuueu9Giuuub9Geueu9Giuuueuikqbeeedddillviebeoweuec:q;iekr;leDo9TW9T9VV95dbH9F9F939H79T9F9J9H229F9Jt9VV7bb8A9TW79O9V9Wt9F9KW9J9V9KW9wWVtW949c919M9MWVbeY9TW79O9V9Wt9F9KW9J9V9KW69U9KW949c919M9MWVbdE9TW79O9V9Wt9F9KW9J9V9KW69U9KW949tWG91W9U9JWbiL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9p9JtblK9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9r919HtbvL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWVT949Wbol79IV9Rbrq:P8Yqdbk;3sezu8Jjjjjbcj;eb9Rgv8Kjjjjbc9:hodnadcefal0mbcuhoaiRbbc:Ge9hmbavaialfgrad9Radz1jjjbhwcj;abad9UhoaicefhldnadTmbaoc;WFbGgocjdaocjd6EhDcbhqinaqae9pmeaDaeaq9RaqaDfae6Egkcsfgocl4cifcd4hxdndndndnaoc9WGgmTmbcbhPcehsawcjdfhzalhHinaraH9Rax6midnaraHaxfgl9RcK6mbczhoinawcj;cbfaogifgoc9WfhOdndndndndnaHaic9WfgAco4fRbbaAci4coG4ciGPlbedibkaO9cb83ibaOcwf9cb83ibxikaOalRblalRbbgAco4gCaCciSgCE86bbaocGfalclfaCfgORbbaAcl4ciGgCaCciSgCE86bbaocVfaOaCfgORbbaAcd4ciGgCaCciSgCE86bbaoc7faOaCfgORbbaAciGgAaAciSgAE86bbaoctfaOaAfgARbbalRbegOco4gCaCciSgCE86bbaoc91faAaCfgARbbaOcl4ciGgCaCciSgCE86bbaoc4faAaCfgARbbaOcd4ciGgCaCciSgCE86bbaoc93faAaCfgARbbaOciGgOaOciSgOE86bbaoc94faAaOfgARbbalRbdgOco4gCaCciSgCE86bbaoc95faAaCfgARbbaOcl4ciGgCaCciSgCE86bbaoc96faAaCfgARbbaOcd4ciGgCaCciSgCE86bbaoc97faAaCfgARbbaOciGgOaOciSgOE86bbaoc98faAaOfgORbbalRbiglco4gAaAciSgAE86bbaoc99faOaAfgORbbalcl4ciGgAaAciSgAE86bbaoc9:faOaAfgORbbalcd4ciGgAaAciSgAE86bbaocufaOaAfgoRbbalciGglalciSglE86bbaoalfhlxdkaOalRbwalRbbgAcl4gCaCcsSgCE86bbaocGfalcwfaCfgORbbaAcsGgAaAcsSgAE86bbaocVfaOaAfgORbbalRbegAcl4gCaCcsSgCE86bbaoc7faOaCfgORbbaAcsGgAaAcsSgAE86bbaoctfaOaAfgORbbalRbdgAcl4gCaCcsSgCE86bbaoc91faOaCfgORbbaAcsGgAaAcsSgAE86bbaoc4faOaAfgORbbalRbigAcl4gCaCcsSgCE86bbaoc93faOaCfgORbbaAcsGgAaAcsSgAE86bbaoc94faOaAfgORbbalRblgAcl4gCaCcsSgCE86bbaoc95faOaCfgORbbaAcsGgAaAcsSgAE86bbaoc96faOaAfgORbbalRbvgAcl4gCaCcsSgCE86bbaoc97faOaCfgORbbaAcsGgAaAcsSgAE86bbaoc98faOaAfgORbbalRbogAcl4gCaCcsSgCE86bbaoc99faOaCfgORbbaAcsGgAaAcsSgAE86bbaoc9:faOaAfgORbbalRbrglcl4gAaAcsSgAE86bbaocufaOaAfgoRbbalcsGglalcsSglE86bbaoalfhlxekaOal8Pbb83bbaOcwfalcwf8Pbb83bbalczfhlkdnaiam9pmbaiczfhoaral9RcL0mekkaiam6mialTmidnakTmbawaPfRbbhOcbhoazhiinaiawcj;cbfaofRbbgAce4cbaAceG9R7aOfgO86bbaiadfhiaocefgoak9hmbkkazcefhzaPcefgPad6hsalhHaPad9hmexvkkcbhlasceGmdxikalaxad2fhCdnakTmbcbhHcehsawcjdfhminaral9Rax6mialTmdalaxfhlawaHfRbbhOcbhoamhiinaiawcj;cbfaofRbbgAce4cbaAceG9R7aOfgO86bbaiadfhiaocefgoak9hmbkamcefhmaHcefgHad6hsaHad9hmbkaChlxikcbhocehsinaral9Rax6mdalTmealaxfhlaocefgoad6hsadao9hmbkaChlxdkcbhlasceGTmekc9:hoxikabaqad2fawcjdfakad2z1jjjb8Aawawcjdfakcufad2fadz1jjjb8Aakaqfhqalmbkc9:hoxekcbc99aral9Radcaadca0ESEhokavcj;ebf8Kjjjjbaok;yzeHu8Jjjjjbc;ae9Rgv8Kjjjjbc9:hodnaeci9UgrcHfal0mbcuhoaiRbbgwc;WeGc;Ge9hmbawcsGgDce0mbavc;abfcFecjez:jjjjb8AavcUf9cu83ibavc8Wf9cu83ibavcyf9cu83ibavcaf9cu83ibavcKf9cu83ibavczf9cu83ibav9cu83iwav9cu83ibaialfc9WfhqaicefgwarfhodnaeTmbcmcsaDceSEhkcbhxcbhmcbhDcbhicbhlindnaoaq9nmbc9:hoxikdndnawRbbgrc;Ve0mbavc;abfalarcl4cu7fcsGcitfgPydlhsaPydbhzdnarcsGgPak9pmbavaiarcu7fcsGcdtfydbaxaPEhraPThPdndnadcd9hmbabaDcetfgHaz87ebaHcdfas87ebaHclfar87ebxekabaDcdtfgHazBdbaHclfasBdbaHcwfarBdbkaxaPfhxavc;abfalcitfgHarBdbaHasBdlavaicdtfarBdbavc;abfalcefcsGglcitfgHazBdbaHarBdlaiaPfhialcefhlxdkdndnaPcsSmbamaPfaPc987fcefhmxekaocefhrao8SbbgPcFeGhHdndnaPcu9mmbarhoxekaocvfhoaHcFbGhHcrhPdninar8SbbgOcFbGaPtaHVhHaOcu9kmearcefhraPcrfgPc8J9hmbxdkkarcefhokaHce4cbaHceG9R7amfhmkdndnadcd9hmbabaDcetfgraz87ebarcdfas87ebarclfam87ebxekabaDcdtfgrazBdbarclfasBdbarcwfamBdbkavc;abfalcitfgramBdbarasBdlavaicdtfamBdbavc;abfalcefcsGglcitfgrazBdbaramBdlaicefhialcefhlxekdnarcpe0mbaxcefgOavaiaqarcsGfRbbgPcl49RcsGcdtfydbaPcz6gHEhravaiaP9RcsGcdtfydbaOaHfgsaPcsGgOEhPaOThOdndnadcd9hmbabaDcetfgzax87ebazcdfar87ebazclfaP87ebxekabaDcdtfgzaxBdbazclfarBdbazcwfaPBdbkavaicdtfaxBdbavc;abfalcitfgzarBdbazaxBdlavaicefgicsGcdtfarBdbavc;abfalcefcsGcitfgzaPBdbazarBdlavaiaHfcsGgicdtfaPBdbavc;abfalcdfcsGglcitfgraxBdbaraPBdlalcefhlaiaOfhiasaOfhxxekaxcbaoRbbgzEgAarc;:eSgrfhsazcsGhCazcl4hXdndnazcs0mbascefhOxekashOavaiaX9RcsGcdtfydbhskdndnaCmbaOcefhxxekaOhxavaiaz9RcsGcdtfydbhOkdndnarTmbaocefhrxekaocdfhrao8SbegHcFeGhPdnaHcu9kmbaocofhAaPcFbGhPcrhodninar8SbbgHcFbGaotaPVhPaHcu9kmearcefhraocrfgoc8J9hmbkaAhrxekarcefhrkaPce4cbaPceG9R7amfgmhAkdndnaXcsSmbarhPxekarcefhPar8SbbgocFeGhHdnaocu9kmbarcvfhsaHcFbGhHcrhodninaP8SbbgrcFbGaotaHVhHarcu9kmeaPcefhPaocrfgoc8J9hmbkashPxekaPcefhPkaHce4cbaHceG9R7amfgmhskdndnaCcsSmbaPhoxekaPcefhoaP8SbbgrcFeGhHdnarcu9kmbaPcvfhOaHcFbGhHcrhrdninao8SbbgPcFbGartaHVhHaPcu9kmeaocefhoarcrfgrc8J9hmbkaOhoxekaocefhokaHce4cbaHceG9R7amfgmhOkdndnadcd9hmbabaDcetfgraA87ebarcdfas87ebarclfaO87ebxekabaDcdtfgraABdbarclfasBdbarcwfaOBdbkavc;abfalcitfgrasBdbaraABdlavaicdtfaABdbavc;abfalcefcsGcitfgraOBdbarasBdlavaicefgicsGcdtfasBdbavc;abfalcdfcsGcitfgraABdbaraOBdlavaiazcz6aXcsSVfgicsGcdtfaOBdbaiaCTaCcsSVfhialcifhlkawcefhwalcsGhlaicsGhiaDcifgDae6mbkkcbc99aoaqSEhokavc;aef8Kjjjjbaok:llevu8Jjjjjbcz9Rhvc9:hodnaecvfal0mbcuhoaiRbbc;:eGc;qe9hmbav9cb83iwaicefhraialfc98fhwdnaeTmbdnadcdSmbcbhDindnaraw6mbc9:skarcefhoar8SbbglcFeGhidndnalcu9mmbaohrxekarcvfhraicFbGhicrhldninao8SbbgdcFbGaltaiVhiadcu9kmeaocefhoalcrfglc8J9hmbxdkkaocefhrkabaDcdtfaicd4cbaice4ceG9R7avcwfaiceGcdtVgoydbfglBdbaoalBdbaDcefgDae9hmbxdkkcbhDindnaraw6mbc9:skarcefhoar8SbbglcFeGhidndnalcu9mmbaohrxekarcvfhraicFbGhicrhldninao8SbbgdcFbGaltaiVhiadcu9kmeaocefhoalcrfglc8J9hmbxdkkaocefhrkabaDcetfaicd4cbaice4ceG9R7avcwfaiceGcdtVgoydbfgl87ebaoalBdbaDcefgDae9hmbkkcbc99arawSEhokaok:Lvoeue99dud99eud99dndnadcl9hmbaeTmeindndnabcdfgd8Sbb:Yab8Sbbgi:Ygl:l:tabcefgv8Sbbgo:Ygr:l:tgwJbb;:9cawawNJbbbbawawJbbbb9GgDEgq:mgkaqaicb9iEalMgwawNakaqaocb9iEarMgqaqNMM:r:vglNJbbbZJbbb:;aDEMgr:lJbbb9p9DTmbar:Ohixekcjjjj94hikadai86bbdndnaqalNJbbbZJbbb:;aqJbbbb9GEMgq:lJbbb9p9DTmbaq:Ohdxekcjjjj94hdkavad86bbdndnawalNJbbbZJbbb:;awJbbbb9GEMgw:lJbbb9p9DTmbaw:Ohdxekcjjjj94hdkabad86bbabclfhbaecufgembxdkkaeTmbindndnabclfgd8Ueb:Yab8Uebgi:Ygl:l:tabcdfgv8Uebgo:Ygr:l:tgwJb;:FSawawNJbbbbawawJbbbb9GgDEgq:mgkaqaicb9iEalMgwawNakaqaocb9iEarMgqaqNMM:r:vglNJbbbZJbbb:;aDEMgr:lJbbb9p9DTmbar:Ohixekcjjjj94hikadai87ebdndnaqalNJbbbZJbbb:;aqJbbbb9GEMgq:lJbbb9p9DTmbaq:Ohdxekcjjjj94hdkavad87ebdndnawalNJbbbZJbbb:;awJbbbb9GEMgw:lJbbb9p9DTmbaw:Ohdxekcjjjj94hdkabad87ebabcwfhbaecufgembkkk;siliui99iue99dnaeTmbcbhiabhlindndnJ;Zl81Zalcof8UebgvciV:Y:vgoal8Ueb:YNgrJb;:FSNJbbbZJbbb:;arJbbbb9GEMgw:lJbbb9p9DTmbaw:OhDxekcjjjj94hDkalclf8Uebhqalcdf8UebhkabavcefciGaiVcetfaD87ebdndnaoak:YNgwJb;:FSNJbbbZJbbb:;awJbbbb9GEMgx:lJbbb9p9DTmbax:Ohkxekcjjjj94hkkabavcdfciGaiVcetfak87ebdndnaoaq:YNgoJb;:FSNJbbbZJbbb:;aoJbbbb9GEMgx:lJbbb9p9DTmbax:Ohqxekcjjjj94hqkabavcufciGaiVcetfaq87ebdndnJbbjZararN:tawawN:taoaoN:tgrJbbbbarJbbbb9GE:rJb;:FSNJbbbZMgr:lJbbb9p9DTmbar:Ohqxekcjjjj94hqkabavciGaiVcetfaq87ebalcwfhlaiclfhiaecufgembkkk9mbdnadcd4ae2geTmbinababydbgdcwtcw91:Yadce91cjjj;8ifcjjj98G::NUdbabclfhbaecufgembkkk9teiucbcbydj1jjbgeabcifc98GfgbBdj1jjbdndnabZbcztgd9nmbcuhiabad9RcFFifcz4nbcuSmekaehikaik;LeeeudndnaeabVciGTmbabhixekdndnadcz9pmbabhixekabhiinaiaeydbBdbaiclfaeclfydbBdbaicwfaecwfydbBdbaicxfaecxfydbBdbaiczfhiaeczfheadc9Wfgdcs0mbkkadcl6mbinaiaeydbBdbaeclfheaiclfhiadc98fgdci0mbkkdnadTmbinaiaeRbb86bbaicefhiaecefheadcufgdmbkkabk;aeedudndnabciGTmbabhixekaecFeGc:b:c:ew2hldndnadcz9pmbabhixekabhiinaialBdbaicxfalBdbaicwfalBdbaiclfalBdbaiczfhiadc9Wfgdcs0mbkkadcl6mbinaialBdbaiclfhiadc98fgdci0mbkkdnadTmbinaiae86bbaicefhiadcufgdmbkkabkkkebcjwklz9Kbb",e="b9H79TebbbeKl9Gbb9Gvuuuuueu9Giuuub9Geueuikqbbebeedddilve9Weeeviebeoweuec:q;Aekr;leDo9TW9T9VV95dbH9F9F939H79T9F9J9H229F9Jt9VV7bb8A9TW79O9V9Wt9F9KW9J9V9KW9wWVtW949c919M9MWVbdY9TW79O9V9Wt9F9KW9J9V9KW69U9KW949c919M9MWVblE9TW79O9V9Wt9F9KW9J9V9KW69U9KW949tWG91W9U9JWbvL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9p9JtboK9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9r919HtbrL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWVT949Wbwl79IV9RbDq;t9tqlbzik9:evu8Jjjjjbcz9Rhbcbheincbhdcbhiinabcwfadfaicjuaead4ceGglE86bbaialfhiadcefgdcw9hmbkaec:q:yjjbfai86bbaecitc:q1jjbfab8Piw83ibaecefgecjd9hmbkk;h8JlHud97euo978Jjjjjbcj;kb9Rgv8Kjjjjbc9:hodnadcefal0mbcuhoaiRbbc:Ge9hmbavaialfgrad9Rad;8qbbcj;abad9UhoaicefhldnadTmbaoc;WFbGgocjdaocjd6EhwcbhDinaDae9pmeawaeaD9RaDawfae6Egqcsfgoc9WGgkci2hxakcethmaocl4cifcd4hPabaDad2fhscbhzdnincehHalhOcbhAdninaraO9RaP6miavcj;cbfaAak2fhCaOaPfhlcbhidnakc;ab6mbaral9Rc;Gb6mbcbhoinaCaofhidndndndndnaOaoco4fRbbgXciGPlbedibkaipxbbbbbbbbbbbbbbbbpklbxikaialpbblalpbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklbalclfaYpQbfaKc:q:yjjbfRbbfhlxdkaialpbbwalpbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklbalcwfaYpQbfaKc:q:yjjbfRbbfhlxekaialpbbbpklbalczfhlkdndndndndnaXcd4ciGPlbedibkaipxbbbbbbbbbbbbbbbbpklzxikaialpbblalpbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklzalclfaYpQbfaKc:q:yjjbfRbbfhlxdkaialpbbwalpbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklzalcwfaYpQbfaKc:q:yjjbfRbbfhlxekaialpbbbpklzalczfhlkdndndndndnaXcl4ciGPlbedibkaipxbbbbbbbbbbbbbbbbpklaxikaialpbblalpbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklaalclfaYpQbfaKc:q:yjjbfRbbfhlxdkaialpbbwalpbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklaalcwfaYpQbfaKc:q:yjjbfRbbfhlxekaialpbbbpklaalczfhlkdndndndndnaXco4Plbedibkaipxbbbbbbbbbbbbbbbbpkl8WxikaialpbblalpbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgXcitc:q1jjbfpbibaXc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgXcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spkl8WalclfaYpQbfaXc:q:yjjbfRbbfhlxdkaialpbbwalpbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgXcitc:q1jjbfpbibaXc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgXcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spkl8WalcwfaYpQbfaXc:q:yjjbfRbbfhlxekaialpbbbpkl8Walczfhlkaoc;abfhiaocjefak0meaihoaral9Rc;Fb0mbkkdndnaiak9pmbaici4hoinaral9RcK6mdaCaifhXdndndndndnaOaico4fRbbaocoG4ciGPlbedibkaXpxbbbbbbbbbbbbbbbbpklbxikaXalpbblalpbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklbalclfaYpQbfaKc:q:yjjbfRbbfhlxdkaXalpbbwalpbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklbalcwfaYpQbfaKc:q:yjjbfRbbfhlxekaXalpbbbpklbalczfhlkaocdfhoaiczfgiak6mbkkalTmbaAci6hHalhOaAcefgohAaoclSmdxekkcbhlaHceGmdkdnakTmbavcjdfazfhiavazfpbdbhYcbhXinaiavcj;cbfaXfgopblbgLcep9TaLpxeeeeeeeeeeeeeeeegQp9op9Hp9rgLaoakfpblbg8Acep9Ta8AaQp9op9Hp9rg8ApmbzeHdOiAlCvXoQrLgEaoamfpblbg3cep9Ta3aQp9op9Hp9rg3aoaxfpblbg5cep9Ta5aQp9op9Hp9rg5pmbzeHdOiAlCvXoQrLg8EpmbezHdiOAlvCXorQLgQaQpmbedibedibedibediaYp9UgYp9AdbbaiadfgoaYaQaQpmlvorlvorlvorlvorp9UgYp9AdbbaoadfgoaYaQaQpmwDqkwDqkwDqkwDqkp9UgYp9AdbbaoadfgoaYaQaQpmxmPsxmPsxmPsxmPsp9UgYp9AdbbaoadfgoaYaEa8EpmwDKYqk8AExm35Ps8E8FgQaQpmbedibedibedibedip9UgYp9AdbbaoadfgoaYaQaQpmlvorlvorlvorlvorp9UgYp9AdbbaoadfgoaYaQaQpmwDqkwDqkwDqkwDqkp9UgYp9AdbbaoadfgoaYaQaQpmxmPsxmPsxmPsxmPsp9UgYp9AdbbaoadfgoaYaLa8ApmwKDYq8AkEx3m5P8Es8FgLa3a5pmwKDYq8AkEx3m5P8Es8Fg8ApmbezHdiOAlvCXorQLgQaQpmbedibedibedibedip9UgYp9AdbbaoadfgoaYaQaQpmlvorlvorlvorlvorp9UgYp9AdbbaoadfgoaYaQaQpmwDqkwDqkwDqkwDqkp9UgYp9AdbbaoadfgoaYaQaQpmxmPsxmPsxmPsxmPsp9UgYp9AdbbaoadfgoaYaLa8ApmwDKYqk8AExm35Ps8E8FgQaQpmbedibedibedibedip9UgYp9AdbbaoadfgoaYaQaQpmlvorlvorlvorlvorp9UgYp9AdbbaoadfgoaYaQaQpmwDqkwDqkwDqkwDqkp9UgYp9AdbbaoadfgoaYaQaQpmxmPsxmPsxmPsxmPsp9UgYp9AdbbaoadfhiaXczfgXak6mbkkazclfgzad6mbkasavcjdfaqad2;8qbbavavcjdfaqcufad2fad;8qbbaqaDfhDc9:hoalmexikkc9:hoxekcbc99aral9Radcaadca0ESEhokavcj;kbf8Kjjjjbaokwbz:bjjjbk;uzeHu8Jjjjjbc;ae9Rgv8Kjjjjbc9:hodnaeci9UgrcHfal0mbcuhoaiRbbgwc;WeGc;Ge9hmbawcsGgDce0mbavc;abfcFecje;8kbavcUf9cu83ibavc8Wf9cu83ibavcyf9cu83ibavcaf9cu83ibavcKf9cu83ibavczf9cu83ibav9cu83iwav9cu83ibaialfc9WfhqaicefgwarfhodnaeTmbcmcsaDceSEhkcbhxcbhmcbhDcbhicbhlindnaoaq9nmbc9:hoxikdndnawRbbgrc;Ve0mbavc;abfalarcl4cu7fcsGcitfgPydlhsaPydbhzdnarcsGgPak9pmbavaiarcu7fcsGcdtfydbaxaPEhraPThPdndnadcd9hmbabaDcetfgHaz87ebaHcdfas87ebaHclfar87ebxekabaDcdtfgHazBdbaHclfasBdbaHcwfarBdbkaxaPfhxavc;abfalcitfgHarBdbaHasBdlavaicdtfarBdbavc;abfalcefcsGglcitfgHazBdbaHarBdlaiaPfhialcefhlxdkdndnaPcsSmbamaPfaPc987fcefhmxekaocefhrao8SbbgPcFeGhHdndnaPcu9mmbarhoxekaocvfhoaHcFbGhHcrhPdninar8SbbgOcFbGaPtaHVhHaOcu9kmearcefhraPcrfgPc8J9hmbxdkkarcefhokaHce4cbaHceG9R7amfhmkdndnadcd9hmbabaDcetfgraz87ebarcdfas87ebarclfam87ebxekabaDcdtfgrazBdbarclfasBdbarcwfamBdbkavc;abfalcitfgramBdbarasBdlavaicdtfamBdbavc;abfalcefcsGglcitfgrazBdbaramBdlaicefhialcefhlxekdnarcpe0mbaxcefgOavaiaqarcsGfRbbgPcl49RcsGcdtfydbaPcz6gHEhravaiaP9RcsGcdtfydbaOaHfgsaPcsGgOEhPaOThOdndnadcd9hmbabaDcetfgzax87ebazcdfar87ebazclfaP87ebxekabaDcdtfgzaxBdbazclfarBdbazcwfaPBdbkavaicdtfaxBdbavc;abfalcitfgzarBdbazaxBdlavaicefgicsGcdtfarBdbavc;abfalcefcsGcitfgzaPBdbazarBdlavaiaHfcsGgicdtfaPBdbavc;abfalcdfcsGglcitfgraxBdbaraPBdlalcefhlaiaOfhiasaOfhxxekaxcbaoRbbgzEgAarc;:eSgrfhsazcsGhCazcl4hXdndnazcs0mbascefhOxekashOavaiaX9RcsGcdtfydbhskdndnaCmbaOcefhxxekaOhxavaiaz9RcsGcdtfydbhOkdndnarTmbaocefhrxekaocdfhrao8SbegHcFeGhPdnaHcu9kmbaocofhAaPcFbGhPcrhodninar8SbbgHcFbGaotaPVhPaHcu9kmearcefhraocrfgoc8J9hmbkaAhrxekarcefhrkaPce4cbaPceG9R7amfgmhAkdndnaXcsSmbarhPxekarcefhPar8SbbgocFeGhHdnaocu9kmbarcvfhsaHcFbGhHcrhodninaP8SbbgrcFbGaotaHVhHarcu9kmeaPcefhPaocrfgoc8J9hmbkashPxekaPcefhPkaHce4cbaHceG9R7amfgmhskdndnaCcsSmbaPhoxekaPcefhoaP8SbbgrcFeGhHdnarcu9kmbaPcvfhOaHcFbGhHcrhrdninao8SbbgPcFbGartaHVhHaPcu9kmeaocefhoarcrfgrc8J9hmbkaOhoxekaocefhokaHce4cbaHceG9R7amfgmhOkdndnadcd9hmbabaDcetfgraA87ebarcdfas87ebarclfaO87ebxekabaDcdtfgraABdbarclfasBdbarcwfaOBdbkavc;abfalcitfgrasBdbaraABdlavaicdtfaABdbavc;abfalcefcsGcitfgraOBdbarasBdlavaicefgicsGcdtfasBdbavc;abfalcdfcsGcitfgraABdbaraOBdlavaiazcz6aXcsSVfgicsGcdtfaOBdbaiaCTaCcsSVfhialcifhlkawcefhwalcsGhlaicsGhiaDcifgDae6mbkkcbc99aoaqSEhokavc;aef8Kjjjjbaok:llevu8Jjjjjbcz9Rhvc9:hodnaecvfal0mbcuhoaiRbbc;:eGc;qe9hmbav9cb83iwaicefhraialfc98fhwdnaeTmbdnadcdSmbcbhDindnaraw6mbc9:skarcefhoar8SbbglcFeGhidndnalcu9mmbaohrxekarcvfhraicFbGhicrhldninao8SbbgdcFbGaltaiVhiadcu9kmeaocefhoalcrfglc8J9hmbxdkkaocefhrkabaDcdtfaicd4cbaice4ceG9R7avcwfaiceGcdtVgoydbfglBdbaoalBdbaDcefgDae9hmbxdkkcbhDindnaraw6mbc9:skarcefhoar8SbbglcFeGhidndnalcu9mmbaohrxekarcvfhraicFbGhicrhldninao8SbbgdcFbGaltaiVhiadcu9kmeaocefhoalcrfglc8J9hmbxdkkaocefhrkabaDcetfaicd4cbaice4ceG9R7avcwfaiceGcdtVgoydbfgl87ebaoalBdbaDcefgDae9hmbkkcbc99arawSEhokaok:EPliuo97eue978Jjjjjbca9Rhidndnadcl9hmbdnaec98GglTmbcbhvabhdinadadpbbbgocKp:RecKp:Sep;6egraocwp:RecKp:Sep;6earp;Geaoczp:RecKp:Sep;6egwp;Gep;Kep;LegDpxbbbbbbbbbbbbbbbbp:2egqarpxbbbjbbbjbbbjbbbjgkp9op9rp;Kegrpxbb;:9cbb;:9cbb;:9cbb;:9cararp;MeaDaDp;Meawaqawakp9op9rp;Kegrarp;Mep;Kep;Kep;Jep;Negwp;Mepxbbn0bbn0bbn0bbn0gqp;KepxFbbbFbbbFbbbFbbbp9oaopxbbbFbbbFbbbFbbbFp9op9qarawp;Meaqp;Kecwp:RepxbFbbbFbbbFbbbFbbp9op9qaDawp;Meaqp;Keczp:RepxbbFbbbFbbbFbbbFbp9op9qpkbbadczfhdavclfgval6mbkkalae9pmeaiaeciGgvcdtgdVcbczad9R;8kbaiabalcdtfglad;8qbbdnavTmbaiaipblbgocKp:RecKp:Sep;6egraocwp:RecKp:Sep;6earp;Geaoczp:RecKp:Sep;6egwp;Gep;Kep;LegDpxbbbbbbbbbbbbbbbbp:2egqarpxbbbjbbbjbbbjbbbjgkp9op9rp;Kegrpxbb;:9cbb;:9cbb;:9cbb;:9cararp;MeaDaDp;Meawaqawakp9op9rp;Kegrarp;Mep;Kep;Kep;Jep;Negwp;Mepxbbn0bbn0bbn0bbn0gqp;KepxFbbbFbbbFbbbFbbbp9oaopxbbbFbbbFbbbFbbbFp9op9qarawp;Meaqp;Kecwp:RepxbFbbbFbbbFbbbFbbp9op9qaDawp;Meaqp;Keczp:RepxbbFbbbFbbbFbbbFbp9op9qpklbkalaiad;8qbbskdnaec98GgxTmbcbhvabhdinadczfglalpbbbgopxbbbbbbFFbbbbbbFFgkp9oadpbbbgDaopmlvorxmPsCXQL358E8FpxFubbFubbFubbFubbp9op;6eaDaopmbediwDqkzHOAKY8AEgoczp:Sep;6egrp;Geaoczp:Reczp:Sep;6egwp;Gep;Kep;Legopxb;:FSb;:FSb;:FSb;:FSawaopxbbbbbbbbbbbbbbbbp:2egqawpxbbbjbbbjbbbjbbbjgmp9op9rp;Kegwawp;Meaoaop;Mearaqaramp9op9rp;Kegoaop;Mep;Kep;Kep;Jep;Negrp;Mepxbbn0bbn0bbn0bbn0gqp;Keczp:Reawarp;Meaqp;KepxFFbbFFbbFFbbFFbbp9op9qgwaoarp;Meaqp;KepxFFbbFFbbFFbbFFbbp9ogopmwDKYqk8AExm35Ps8E8Fp9qpkbbadaDakp9oawaopmbezHdiOAlvCXorQLp9qpkbbadcafhdavclfgvax6mbkkaxae9pmbaiaeciGgvcitgdfcbcaad9R;8kbaiabaxcitfglad;8qbbdnavTmbaiaipblzgopxbbbbbbFFbbbbbbFFgkp9oaipblbgDaopmlvorxmPsCXQL358E8FpxFubbFubbFubbFubbp9op;6eaDaopmbediwDqkzHOAKY8AEgoczp:Sep;6egrp;Geaoczp:Reczp:Sep;6egwp;Gep;Kep;Legopxb;:FSb;:FSb;:FSb;:FSawaopxbbbbbbbbbbbbbbbbp:2egqawpxbbbjbbbjbbbjbbbjgmp9op9rp;Kegwawp;Meaoaop;Mearaqaramp9op9rp;Kegoaop;Mep;Kep;Kep;Jep;Negrp;Mepxbbn0bbn0bbn0bbn0gqp;Keczp:Reawarp;Meaqp;KepxFFbbFFbbFFbbFFbbp9op9qgwaoarp;Meaqp;KepxFFbbFFbbFFbbFFbbp9ogopmwDKYqk8AExm35Ps8E8Fp9qpklzaiaDakp9oawaopmbezHdiOAlvCXorQLp9qpklbkalaiad;8qbbkk;4wllue97euv978Jjjjjbc8W9Rhidnaec98GglTmbcbhvabhoinaiaopbbbgraoczfgwpbbbgDpmlvorxmPsCXQL358E8Fgqczp:Segkclp:RepklbaopxbbjZbbjZbbjZbbjZpx;Zl81Z;Zl81Z;Zl81Z;Zl81Zakpxibbbibbbibbbibbbp9qp;6ep;NegkaraDpmbediwDqkzHOAKY8AEgrczp:Reczp:Sep;6ep;MegDaDp;Meakarczp:Sep;6ep;Megxaxp;Meakaqczp:Reczp:Sep;6ep;Megqaqp;Mep;Kep;Kep;Lepxbbbbbbbbbbbbbbbbp:4ep;Jepxb;:FSb;:FSb;:FSb;:FSgkp;Mepxbbn0bbn0bbn0bbn0grp;KepxFFbbFFbbFFbbFFbbgmp9oaxakp;Mearp;Keczp:Rep9qgxaqakp;Mearp;Keczp:ReaDakp;Mearp;Keamp9op9qgkpmbezHdiOAlvCXorQLgrp5baipblbpEb:T:j83ibaocwfarp5eaipblbpEe:T:j83ibawaxakpmwDKYqk8AExm35Ps8E8Fgkp5baipblbpEd:T:j83ibaocKfakp5eaipblbpEi:T:j83ibaocafhoavclfgval6mbkkdnalae9pmbaiaeciGgvcitgofcbcaao9R;8kbaiabalcitfgwao;8qbbdnavTmbaiaipblbgraipblzgDpmlvorxmPsCXQL358E8Fgqczp:Segkclp:RepklaaipxbbjZbbjZbbjZbbjZpx;Zl81Z;Zl81Z;Zl81Z;Zl81Zakpxibbbibbbibbbibbbp9qp;6ep;NegkaraDpmbediwDqkzHOAKY8AEgrczp:Reczp:Sep;6ep;MegDaDp;Meakarczp:Sep;6ep;Megxaxp;Meakaqczp:Reczp:Sep;6ep;Megqaqp;Mep;Kep;Kep;Lepxbbbbbbbbbbbbbbbbp:4ep;Jepxb;:FSb;:FSb;:FSb;:FSgkp;Mepxbbn0bbn0bbn0bbn0grp;KepxFFbbFFbbFFbbFFbbgmp9oaxakp;Mearp;Keczp:Rep9qgxaqakp;Mearp;Keczp:ReaDakp;Mearp;Keamp9op9qgkpmbezHdiOAlvCXorQLgrp5baipblapEb:T:j83ibaiarp5eaipblapEe:T:j83iwaiaxakpmwDKYqk8AExm35Ps8E8Fgkp5baipblapEd:T:j83izaiakp5eaipblapEi:T:j83iKkawaiao;8qbbkk:Pddiue978Jjjjjbc;ab9Rhidnadcd4ae2glc98GgvTmbcbhdabheinaeaepbbbgocwp:Recwp:Sep;6eaocep:SepxbbjZbbjZbbjZbbjZp:UepxbbjFbbjFbbjFbbjFp9op;Mepkbbaeczfheadclfgdav6mbkkdnaval9pmbaialciGgdcdtgeVcbc;abae9R;8kbaiabavcdtfgvae;8qbbdnadTmbaiaipblbgocwp:Recwp:Sep;6eaocep:SepxbbjZbbjZbbjZbbjZp:UepxbbjFbbjFbbjFbbjFp9op;Mepklbkavaiae;8qbbkk9teiucbcbydj1jjbgeabcifc98GfgbBdj1jjbdndnabZbcztgd9nmbcuhiabad9RcFFifcz4nbcuSmekaehikaikkkebcjwklz9Tbb",t=new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,3,2,0,0,5,3,1,0,1,12,1,0,10,22,2,12,0,65,0,65,0,65,0,252,10,0,0,11,7,0,65,0,253,15,26,11]),n=new Uint8Array([32,0,65,2,1,106,34,33,3,128,11,4,13,64,6,253,10,7,15,116,127,5,8,12,40,16,19,54,20,9,27,255,113,17,42,67,24,23,146,148,18,14,22,45,70,69,56,114,101,21,25,63,75,136,108,28,118,29,73,115]);if(typeof WebAssembly!="object")return{supported:!1};var i=WebAssembly.validate(t)?e:s,r,a=WebAssembly.instantiate(o(i),{}).then(function(A){r=A.instance,r.exports.__wasm_call_ctors()});function o(A){for(var b=new Uint8Array(A.length),E=0;E<A.length;++E){var _=A.charCodeAt(E);b[E]=_>96?_-97:_>64?_-39:_+4}for(var M=0,E=0;E<A.length;++E)b[M++]=b[E]<60?n[b[E]]:(b[E]-60)*64+b[++E];return b.buffer.slice(0,M)}function c(A,b,E,_,M,v){var S=r.exports.sbrk,D=E+3&-4,x=S(D*_),C=S(M.length),R=new Uint8Array(r.exports.memory.buffer);R.set(M,C);var U=A(x,E,_,C,M.length);if(U==0&&v&&v(x,D,_),b.set(R.subarray(x,x+E*_)),S(x-S(0)),U!=0)throw new Error("Malformed buffer data: "+U)}var l={NONE:"",OCTAHEDRAL:"meshopt_decodeFilterOct",QUATERNION:"meshopt_decodeFilterQuat",EXPONENTIAL:"meshopt_decodeFilterExp"},h={ATTRIBUTES:"meshopt_decodeVertexBuffer",TRIANGLES:"meshopt_decodeIndexBuffer",INDICES:"meshopt_decodeIndexSequence"},u=[],d=0;function f(A){var b={object:new Worker(A),pending:0,requests:{}};return b.object.onmessage=function(E){var _=E.data;b.pending-=_.count,b.requests[_.id][_.action](_.value),delete b.requests[_.id]},b}function p(A){for(var b="var instance; var ready = WebAssembly.instantiate(new Uint8Array(["+new Uint8Array(o(i))+"]), {}).then(function(result) { instance = result.instance; instance.exports.__wasm_call_ctors(); });self.onmessage = workerProcess;"+c.toString()+g.toString(),E=new Blob([b],{type:"text/javascript"}),_=URL.createObjectURL(E),M=0;M<A;++M)u[M]=f(_);URL.revokeObjectURL(_)}function m(A,b,E,_,M){for(var v=u[0],S=1;S<u.length;++S)u[S].pending<v.pending&&(v=u[S]);return new Promise(function(D,x){var C=new Uint8Array(E),R=d++;v.pending+=A,v.requests[R]={resolve:D,reject:x},v.object.postMessage({id:R,count:A,size:b,source:C,mode:_,filter:M},[C.buffer])})}function g(A){a.then(function(){var b=A.data;try{var E=new Uint8Array(b.count*b.size);c(r.exports[b.mode],E,b.count,b.size,b.source,r.exports[b.filter]),self.postMessage({id:b.id,count:b.count,action:"resolve",value:E},[E.buffer])}catch(_){self.postMessage({id:b.id,count:b.count,action:"reject",value:_})}})}return{ready:a,supported:!0,useWorkers:function(A){p(A)},decodeVertexBuffer:function(A,b,E,_,M){c(r.exports.meshopt_decodeVertexBuffer,A,b,E,_,r.exports[l[M]])},decodeIndexBuffer:function(A,b,E,_){c(r.exports.meshopt_decodeIndexBuffer,A,b,E,_)},decodeIndexSequence:function(A,b,E,_){c(r.exports.meshopt_decodeIndexSequence,A,b,E,_)},decodeGltfBuffer:function(A,b,E,_,M,v){c(r.exports[h[M]],A,b,E,_,r.exports[l[v]])},decodeGltfBufferAsync:function(A,b,E,_,M){return u.length>0?m(A,b,E,h[_],l[M]):a.then(function(){var v=new Uint8Array(A*b);return c(r.exports[h[_]],v,A,b,E,r.exports[l[M]]),v})}}}();const Do="https://unpkg.com/three@0.160.0/examples/jsm/libs/basis/",G_="basis/",H_=/^[a-z]+:\/\//i,z_=/^\/\//;function Si(s){return typeof s!="string"||s.length===0||s.endsWith("/")?s:`${s}/`}function V_(){if(typeof document>"u"||!document.baseURI)return"/";try{const s=new URL(document.baseURI);let{pathname:e}=s;if(!e)return"/";if(!e.endsWith("/")){const t=e.lastIndexOf("/");e=t>=0?e.slice(0,t+1):"/"}return e||"/"}catch(s){return console.warn("Unable to parse document.baseURI for BASE_URL fallback",s),"/"}}function W_(){const s=typeof import.meta<"u"?import.meta:null,e=s&&s.env?s.env:null,t=e&&typeof e.BASE_URL=="string"?e.BASE_URL:null;return t&&t.length>0?Si(t):Si(V_())}function q_(){var s;return typeof window<"u"&&((s=window.location)!=null&&s.protocol)?window.location.protocol:"https:"}function X_(s,e){if(typeof s!="string")return null;const t=s.trim();if(t.length===0)return null;if(z_.test(t)){const i=q_();return Si(`${i}${t}`)}const n=`https://example.com${e}`;try{const i=new URL(t,n);return H_.test(t)||i.origin!=="https://example.com"?Si(i.href):Si(i.pathname)}catch{return Si(t)}}function dd(){const s=W_(),e=[],t=typeof import.meta<"u"?import.meta:null,n=t&&t.env?t.env:null;n&&typeof n.VITE_BASIS_TRANSCODER_PATH=="string"&&e.push(n.VITE_BASIS_TRANSCODER_PATH),typeof window<"u"&&typeof window.__BASIS_TRANSCODER_PATH__=="string"&&e.push(window.__BASIS_TRANSCODER_PATH__),e.push(G_),e.push(Do);for(const i of e){const r=X_(i,s);if(r)return r}return Do}function Y_(s){const e=new _n,t=dd();if(e.setTranscoderPath(t),s)try{e.detectSupport(s)}catch(n){console.warn("KTX2Loader.detectSupport failed; continuing without GPU compression",n)}return e}const Ps=new cc;let Zi=null,ro=!1,Br=!1,Th=null,Rh=!1;function K_(s){if(!s||typeof s.getContext!="function")return;const e=dd();Zi||(Zi=new _n),e&&e!==Th&&(Zi.setTranscoderPath(e),Th=e,!Rh&&e===Do&&(console.info("KTX2 transcoder path not configured; falling back to the three.js CDN. Add public/basis/ or set VITE_BASIS_TRANSCODER_PATH to avoid extra requests."),Rh=!0));try{Zi.detectSupport(s);const t=Zi.workerConfig||{};ro=Object.values(t).some(Boolean),ro?(Ps.setKTX2Loader(Zi),Br=!1):(Br||(console.warn("KTX2 is not supported on this GPU/driver combo. Falling back to standard textures."),Br=!0),Ps.setKTX2Loader(null)),Ps.setMeshoptDecoder(ud)}catch(t){ro=!1,Br=!0,console.warn("KTX2 not supported in this browser. Falling back to standard textures.",t),Ps.setKTX2Loader(null)}}const Gs=new Set;function Dh(s,e){const{position:t,rotation:n,scale:i}=e;if(t&&s.position.set(t.x??t[0]??0,t.y??t[1]??0,t.z??t[2]??0),n&&s.rotation.set(n.x??n[0]??0,n.y??n[1]??0,n.z??n[2]??0),i!==void 0)if(typeof i=="number")s.scale.set(i,i,i);else{const r=i.x??i[0]??1,a=i.y??i[1]??r,o=i.z??i[2]??r;s.scale.set(r,a,o)}}function Lh(s,e,t=.05){var d;if(!s||!e)return null;const n=[],i=s.userData||{};n.push(i.getHeightAt,i.terrainHeightSampler,i.heightSampler,i.terrainSampler);const r=i.terrain;(d=r==null?void 0:r.userData)!=null&&d.getHeightAt&&n.push(r.userData.getHeightAt);let a=null;for(const f of n)if(typeof f=="function"){a=f;break}if(!a||!e.position)return null;const{x:o,z:c}=e.position;if(!Number.isFinite(o)||!Number.isFinite(c))return null;const l=a(o,c);if(!Number.isFinite(l))return null;const h=Number.isFinite(e.position.y)?e.position.y:0,u=Math.max(h,l+t);return Number.isFinite(u)?(e.position.y=u,u):null}function fd(s,e){var t;s&&(e&&e.remove(s),(t=s.traverse)==null||t.call(s,n=>{var i,r,a,o,c;if(n.isMesh)if((r=(i=n.geometry)==null?void 0:i.dispose)==null||r.call(i),Array.isArray(n.material))for(const l of n.material)(a=l==null?void 0:l.dispose)==null||a.call(l);else(c=(o=n.material)==null?void 0:o.dispose)==null||c.call(o)}))}function Lo(s){var n,i,r,a;const{placeholder:e,scene:t}=s;e&&(t&&t.remove(e),(i=(n=e.geometry)==null?void 0:n.dispose)==null||i.call(n),(a=(r=e.material)==null?void 0:r.dispose)==null||a.call(r),s.placeholder=null)}async function j_(s,e,t={}){var c,l,h,u;const n=`loadLandmark:${e}`;typeof(console==null?void 0:console.time)=="function"&&console.time(n);const i=new Gt(.8,.8,.8),r=new Ke({color:4473924,emissive:new Ae(6711039),transparent:!0,opacity:.6}),a=new _e(i,r);a.name="LandmarkPlaceholder",Dh(a,{position:t.position}),Lh(s,a,.05),s.add(a);const o={scene:s,url:e,placeholder:a,object:null};Gs.add(o);try{const d=await Ps.loadAsync(e);let f=d.scene||((c=d.scenes)==null?void 0:c[0]);if(!f)throw new Error(`GLB at ${e} did not contain a scene`);let p=f;if((l=f.children)!=null&&l.length){const A=f.children.filter(b=>{var E;return(E=b==null?void 0:b.name)==null?void 0:E.startsWith("LOD")}).map(b=>({object3D:b,level:parseInt(b.name.slice(3))||0}));if(A.length){const b=new G0,E=f.name||"Landmark";b.name=`${E}_LOD`,b.position.copy(f.position),b.rotation.copy(f.rotation),b.scale.copy(f.scale),A.sort((_,M)=>_.level-M.level).forEach(({object3D:_,level:M})=>{b.addLevel(_,M*50)}),b.userData={...f.userData||{}},p=b}}if(Dh(p,t),Lo(o),o.disposed)return fd(p),Gs.delete(o),null;const m=Number.isFinite((h=p==null?void 0:p.position)==null?void 0:h.y)?p.position.y:0,g=Lh(s,p,.05);return Number.isFinite(g)&&(p.position.y=Math.max(m,g)),s.add(p),o.object=p,p.userData=p.userData||{},p.userData.interactable=!0,p.userData.onUse=()=>{const A=p.name||"a landmark";console.log(`You interacted with ${A}`)},(u=p.traverse)==null||u.call(p,A=>{!(A!=null&&A.isMesh)||typeof A.name!="string"||!(A.name==="Door"||A.name.startsWith("INT_"))||(A.userData=A.userData||{},A.userData.interactable=!0,A.userData.onUse=()=>{A.userData.isOpen=!A.userData.isOpen;const E=A.name==="Door";A.rotation.y=A.userData.isOpen?Math.PI/2:0,console.log(E?A.userData.isOpen?"Door opened!":"Door closed!":`You interacted with ${A.name}`)})}),p}catch(d){throw Lo(o),Gs.delete(o),d}finally{typeof(console==null?void 0:console.timeEnd)=="function"&&console.timeEnd(n)}}function J_(){for(const s of Gs)s.disposed=!0,fd(s.object,s.scene),Lo(s);Gs.clear()}function Ph(s,e,t){const n=new Yn(s,e);n.rotateX(-Math.PI/2);const i=new Ke({color:t,roughness:.85,metalness:.05}),r=new _e(n,i);return r.receiveShadow=!0,r.userData.noCollision=!0,r}function Z_(s,e,t){const n=new Yn(s,e);n.rotateX(-Math.PI/2);const i=new Ke({color:t,roughness:1,metalness:0}),r=new _e(n,i);return r.receiveShadow=!0,r.userData.noCollision=!0,r}function $_(s){const{footprint:e=new oe(10,14),height:t=6,color:n=15194049,accentColor:i=14205861,roofColor:r=12098431}=s??{},a=new gt;a.name="CivicBuilding";const o=new _e(new Gt(e.x,t*.6,e.y),new Ke({color:n,roughness:.7,metalness:.05}));o.castShadow=!0,o.receiveShadow=!0,o.position.y=t*.3,o.userData.noCollision=!1,a.add(o);const c=new Ke({color:i,roughness:.6,metalness:.05}),l=new Dt(.35,.35,t*.6,16),h=e.x*.5-.8,u=e.y*.5-.8,d=4;for(let m=0;m<d;m++){const g=m/(d-1),A=new _e(l,c);A.position.set(Ie.lerp(-h,h,g),t*.3,u),A.castShadow=!0,A.userData.noCollision=!1,a.add(A);const b=A.clone();b.position.z=-u,a.add(b)}const f=new _e(new Es(e.x*.6,t*.4,4),new Ke({color:r,roughness:.55}));f.rotation.y=Math.PI*.25,f.position.y=t*.8,f.castShadow=!0,f.userData.noCollision=!1,a.add(f);const p=new _e(new Dt(e.x*.55,e.x*.55,t*.25,6),new Ke({color:r,roughness:.6}));return p.rotation.x=Math.PI/2,p.position.y=t*.95,p.castShadow=!0,p.userData.noCollision=!1,a.add(p),a}function ex(){const s=new gt;s.name="CityFountain";const e=new _e(new Dt(5,5.6,.8,40),new Ke({color:13621468,roughness:.5}));e.receiveShadow=!0,e.castShadow=!0,e.position.y=.4,e.userData.noCollision=!1,s.add(e);const t=new _e(new Dt(4.2,4.2,.2,32),new Ke({color:5227511,transparent:!0,opacity:.75,roughness:.1,metalness:.2}));t.position.y=.6,t.receiveShadow=!0,t.userData.noCollision=!0,s.add(t);const n=new _e(new Es(1.1,5.2,4),new Ke({color:14737632,roughness:.45}));return n.castShadow=!0,n.position.y=3.6,n.userData.noCollision=!1,s.add(n),s}function Fh(){const s=new gt;s.name="CityLampPost";const e=new _e(new Dt(.12,.12,3.4,12),new Ke({color:3815994,roughness:.7}));e.position.y=1.7,e.userData.noCollision=!1,e.castShadow=!0,s.add(e);const t=new _e(new Es(.45,.9,12),new Ke({color:16498733,emissive:new Ae(16088855),emissiveIntensity:.6}));t.position.y=3.5,t.userData.noCollision=!1,t.castShadow=!0,s.add(t);const n=new ls(16774581,.8,16,2);return n.position.y=3.5,s.add(n),s}function tx(s,e={}){var D,x;const t=new gt;t.name="CivicDistrict",s.add(t);const n=e.plazaLength??80,i=e.promenadeWidth??14,r=e.greensWidth??10,a=e.center??Bn,o=e.heightSampler??e.terrainSampler??((x=(D=e.terrain)==null?void 0:D.userData)==null?void 0:x.getHeightAt),c=e.surfaceOffset??.05,l=a instanceof y?a.clone():new y((a==null?void 0:a.x)??0,(a==null?void 0:a.y)??0,(a==null?void 0:a.z)??0);let h=Number.isFinite(l.y)?l.y:0;if(typeof o=="function"){const C=o(l.x,l.z);Number.isFinite(C)&&(h=C)}t.position.set(l.x,h,l.z);const u=(C=0,R=0,U=0)=>{if(typeof o=="function"){const O=l.x+C,T=l.z+R,F=o(O,T);if(Number.isFinite(F))return F-h+c}return U+c},d=Ph(i,n,12829371);d.receiveShadow=!0,d.position.y=u(0,0,d.position.y??0),t.add(d);const f=Z_(r,n,7047791);f.position.x=-(i+r)/2,f.position.y=u(f.position.x,0,f.position.y??0),t.add(f);const p=f.clone();p.position.x=(i+r)/2,p.position.y=u(p.position.x,0,0),t.add(p);const m=Ph(i+r*2,18,12433580);m.position.z=n/2+9,m.position.y=u(0,m.position.z,m.position.y??0),t.add(m);const g=m.clone();g.position.z=-(n/2+9),g.position.y=u(0,g.position.z,0),t.add(g);const A=ex();A.position.set(0,u(0,0,A.position.y??0),0),t.add(A);const b=[{position:new y(-18,0,-24),rotation:Math.PI/2},{position:new y(-18,0,-8),rotation:Math.PI/2},{position:new y(-18,0,8),rotation:Math.PI/2},{position:new y(-18,0,24),rotation:Math.PI/2},{position:new y(18,0,-24),rotation:-Math.PI/2},{position:new y(18,0,-8),rotation:-Math.PI/2},{position:new y(18,0,8),rotation:-Math.PI/2},{position:new y(18,0,24),rotation:-Math.PI/2}],E=[{color:15260871,accent:14140325,roof:12098431},{color:14931402,accent:13810592,roof:11107408},{color:15130576,accent:14468259,roof:11899501}];for(let C=0;C<b.length;C++){const R=b[C],U=E[C%E.length],O=$_({footprint:new oe(10,14),height:6.5,color:U.color,accentColor:U.accent,roofColor:U.roof}),T=u(R.position.x,R.position.z,R.position.y??0);O.position.set(R.position.x,T,R.position.z),O.rotation.y=R.rotation,t.add(O)}const _=12,M=Math.floor(n/_);for(let C=0;C<=M;C++){const R=-n/2+C*_,U=Fh(),O=-i/2+1.2;U.position.set(O,u(O,R,U.position.y??0),R),t.add(U);const T=Fh(),F=i/2-1.2,Q=R+_/2;T.position.set(F,u(F,Q,T.position.y??0),Q),t.add(T)}const v=[new y(-i*.35,u(-i*.35,-n/2-6,0),-n/2-6),new y(-i*.35,u(-i*.35,n/2+6,0),n/2+6),new y(i*.35,u(i*.35,n/2+6,0),n/2+6),new y(i*.35,u(i*.35,-n/2-6,0),-n/2-6)],S=new Jo(v,!0,"catmullrom",.1);return{group:t,walkingLoop:S,plazaLength:n,promenadeWidth:i}}const Uh=new Set(["KeyW","KeyA","KeyS","KeyD","ArrowUp","ArrowDown","ArrowLeft","ArrowRight","ShiftLeft","ShiftRight","Space","ControlLeft","ControlRight","KeyF"]);class nx{constructor(e=null){this.keys=new Set,this.canvas=e,this.flyToggleQueued=!1,this.keyDownHandler=t=>{this.keys.add(t.code),t.code==="KeyF"&&!t.repeat&&(this.flyToggleQueued=!0),Uh.has(t.code)&&t.preventDefault()},this.keyUpHandler=t=>{this.keys.delete(t.code),Uh.has(t.code)&&t.preventDefault()},this.blurHandler=()=>{this.resetKeys(),this.flyToggleQueued=!1},window.addEventListener("keydown",this.keyDownHandler),window.addEventListener("keyup",this.keyUpHandler),window.addEventListener("blur",this.blurHandler),window.addEventListener("focus",this.blurHandler)}dispose(){window.removeEventListener("keydown",this.keyDownHandler),window.removeEventListener("keyup",this.keyUpHandler),window.removeEventListener("blur",this.blurHandler),window.removeEventListener("focus",this.blurHandler)}consumeLookDelta(e=0){const t=(this.lookRight?1:0)-(this.lookLeft?1:0),n=(this.lookDown?1:0)-(this.lookUp?1:0),i=1.8;return{yaw:t*i*e,pitch:n*i*e}}isDown(e){return this.keys.has(e)}get forward(){return this.isDown("KeyW")}get back(){return this.isDown("KeyS")}get left(){return this.isDown("KeyA")}get right(){return this.isDown("KeyD")}get sprint(){return this.isDown("ShiftLeft")||this.isDown("ShiftRight")}get jump(){return this.isDown("Space")}get flyUp(){return this.isDown("Space")}get flyDown(){return this.isDown("ControlLeft")||this.isDown("ControlRight")}get lookLeft(){return this.isDown("ArrowLeft")}get lookRight(){return this.isDown("ArrowRight")}get lookUp(){return this.isDown("ArrowUp")}get lookDown(){return this.isDown("ArrowDown")}consumeFlyToggle(){return this.flyToggleQueued?(this.flyToggleQueued=!1,!0):!1}resetKeys(){this.keys.clear()}}const Ls=1e-6,Nh=new Fe,Qh=new Fe;class ix{constructor(){const e=new Mn({visible:!1,wireframe:!0,transparent:!0,opacity:.15,color:65433});this.mesh=new _e(new It,e),this.mesh.name="EnvironmentCollider",this.mesh.frustumCulled=!1,this.mesh.matrixAutoUpdate=!1,this.mesh.userData.noCollision=!0,this.lastRoot=null,this.positionAttr=null,this.indexAttr=null,this.capsuleBox=new pn,this.triangleBox=new pn,this.triangle=new An,this.plane=new cn,this.capsuleSegment=new Wb,this.tmpVec0=new y,this.tmpVec1=new y,this.tmpVec2=new y,this.tmpVec3=new y,this.tmpVec4=new y,this.tmpVec5=new y,this.tmpVec6=new y,this.tmpVec7=new y,this.tmpVec8=new y,this.tmpVec9=new y,this.tmpNormal=new y,this.segPoint=new y,this.triPoint=new y}fromStaticScene(e,t={}){const n=e??this.lastRoot??(this.mesh?this.mesh.parent:null);if(!n||typeof n.traverse!="function")return;const i=[];n.updateWorldMatrix(!0,!0);const r=this.mesh.material;r.visible=!!t.debug,this.lastRoot=n;const a=h=>{var d;let u=h;for(;u;){if(((d=u.userData)==null?void 0:d.noCollision)===!0)return!1;u=u.parent}return!0},o=(h,u)=>{const d=h.clone();Object.keys(d.attributes).forEach(f=>{f!=="position"&&d.deleteAttribute(f)}),d.applyMatrix4(u),i.push(d)};n.traverse(h=>{if(!h.isMesh||h===this.mesh)return;const u=h;if(!a(u))return;const d=u.geometry;if(!(!d||!d.attributes.position)&&u.visible){if(u.isInstancedMesh){const f=u.count??0;if(f===0)return;for(let p=0;p<f;p++)u.getMatrixAt(p,Nh),Qh.multiplyMatrices(u.matrixWorld,Nh),o(d,Qh);return}o(d,u.matrixWorld)}});let c;i.length>0?c=KE(i,!1)??new It:c=new It,i.forEach(h=>h.dispose());const l=this.mesh.geometry;l&&l.dispose(),this.mesh.geometry=c,c.computeBoundingBox(),c.computeBoundingSphere(),this.positionAttr=c.getAttribute("position"),this.indexAttr=c.getIndex()}refresh(e={}){this.fromStaticScene(void 0,e)}capsuleIntersect(e){const t=this.mesh.geometry,n=this.positionAttr;if(!t||!n||n.count===0)return null;const i=t.boundingBox;if(!i||(this.capsuleSegment.set(e.start,e.end),this.capsuleBox.makeEmpty(),this.capsuleBox.expandByPoint(e.start),this.capsuleBox.expandByPoint(e.end),this.capsuleBox.min.addScalar(-e.radius),this.capsuleBox.max.addScalar(e.radius),!i.intersectsBox(this.capsuleBox)))return null;let r=0,a=null;const o=this.indexAttr,c=(l,h,u)=>{if(this.tmpVec0.fromBufferAttribute(n,l),this.tmpVec1.fromBufferAttribute(n,h),this.tmpVec2.fromBufferAttribute(n,u),this.triangleBox.makeEmpty(),this.triangleBox.expandByPoint(this.tmpVec0),this.triangleBox.expandByPoint(this.tmpVec1),this.triangleBox.expandByPoint(this.tmpVec2),this.triangleBox.min.addScalar(-e.radius),this.triangleBox.max.addScalar(e.radius),!this.triangleBox.intersectsBox(this.capsuleBox))return;this.triangle.set(this.tmpVec0,this.tmpVec1,this.tmpVec2);const d=this.closestPointsSegmentTriangle(this.capsuleSegment,this.triangle,this.segPoint,this.triPoint);if(d!==null&&d<e.radius-Ls){const f=e.radius-d;f>r&&(r=f,this.tmpNormal.subVectors(this.segPoint,this.triPoint),this.tmpNormal.lengthSq()<Ls?this.triangle.getNormal(this.tmpNormal):this.tmpNormal.normalize(),a=this.tmpVec3.copy(this.tmpNormal))}};if(o)for(let l=0;l<o.count;l+=3)c(o.getX(l),o.getX(l+1),o.getX(l+2));else for(let l=0;l<n.count;l+=3)c(l,l+1,l+2);return a?{normal:a.clone(),depth:r}:null}closestPointsSegmentTriangle(e,t,n,i){const r=t.a,a=t.b,o=t.c;if(this.tmpVec4.subVectors(a,r),this.tmpVec5.subVectors(o,r),this.tmpVec6.copy(this.tmpVec4).cross(this.tmpVec5).lengthSq()<Ls)return null;this.plane.setFromCoplanarPoints(r,a,o);const l=this.plane.distanceToPoint(e.start),h=this.plane.distanceToPoint(e.end),u=this.tmpVec7.subVectors(e.end,e.start);if(Math.abs(l-h)>Ls){const p=l/(l-h);if(p>=0&&p<=1&&(n.copy(u).multiplyScalar(p).add(e.start),t.containsPoint(n)))return i.copy(n),0}let d=1/0;t.closestPointToPoint(e.start,this.tmpVec8);let f=this.tmpVec8.distanceTo(e.start);return f<d&&(d=f,n.copy(e.start),i.copy(this.tmpVec8)),t.closestPointToPoint(e.end,this.tmpVec8),f=this.tmpVec8.distanceTo(e.end),f<d&&(d=f,n.copy(e.end),i.copy(this.tmpVec8)),d=this.testEdgeDistance(e,r,a,d,n,i),d=this.testEdgeDistance(e,a,o,d,n,i),d=this.testEdgeDistance(e,o,r,d,n,i),d}testEdgeDistance(e,t,n,i,r,a){const o=this.closestPointsSegmentSegment(e.start,e.end,t,n,this.tmpVec8,this.tmpVec9);return o<i&&(i=o,r.copy(this.tmpVec8),a.copy(this.tmpVec9)),i}closestPointsSegmentSegment(e,t,n,i,r,a){const o=this.tmpVec4.subVectors(t,e),c=this.tmpVec5.subVectors(i,n),l=this.tmpVec6.subVectors(e,n),h=o.dot(o),u=c.dot(c),d=c.dot(l),f=Ls;let p=0,m=0;if(h<=f&&u<=f)return r.copy(e),a.copy(n),r.distanceTo(a);if(h<=f)p=0,m=Ie.clamp(d/u,0,1);else{const g=o.dot(l);if(u<=f)m=0,p=Ie.clamp(-g/h,0,1);else{const A=o.dot(c),b=h*u-A*A;b!==0?p=Ie.clamp((A*d-g*u)/b,0,1):p=0,m=(A*p+d)/u,m<0?(m=0,p=Ie.clamp(-g/h,0,1)):m>1&&(m=1,p=Ie.clamp((A-g)/h,0,1))}}return r.copy(o).multiplyScalar(p).add(e),a.copy(c).multiplyScalar(m).add(n),r.distanceTo(a)}}const Tr="BuildingsRoot";function Ad(s){if(s){if(Array.isArray(s)){for(const e of s)Ad(e);return}typeof s.dispose=="function"&&s.dispose()}}function sx(s){var e;s&&((e=s.traverse)==null||e.call(s,t=>{var n,i;t.isMesh&&((i=(n=t.geometry)==null?void 0:n.dispose)==null||i.call(n),Ad(t.material))}))}var Tn,kr,pd,gd;class rx{constructor(e){dc(this,Tn);this.envCollider=e,this.loader=new cc,this.rootGroup=null}async loadBuilding(e,t){var c,l;const i=(await this.loader.loadAsync(e)).scene,r=t??{};r.scale!==void 0&&i.scale.setScalar(r.scale),r.rotateY!==void 0&&(i.rotation.y=r.rotateY),r.position&&i.position.copy(r.position);const a=Pi(this,Tn,gd).call(this,r);if(r.position){const{x:h,z:u}=i.position;let d=i.position.y;if(typeof a=="function"){const f=a(h,u);Number.isFinite(f)?d=Number.isFinite(r.position.y)?Math.max(r.position.y,f+.05):f+.05:Number.isFinite(r.position.y)?d=r.position.y:Number.isFinite(d)||(d=.05)}else Number.isFinite(r.position.y)?d=r.position.y:Number.isFinite(d)||(d=.05);i.position.set(h,d??.05,u)}const o=Pi(this,Tn,pd).call(this,r);if(o)o.add(i);else{const h=(l=(c=this.envCollider)==null?void 0:c.mesh)==null?void 0:l.parent;h?h.add(i):console.warn("EnvironmentCollider mesh has no parent; building was loaded without being attached to the scene graph.")}return r!=null&&r.collision?(i.traverse(h=>{h.isMesh&&(h.userData.noCollision=!1)}),this.envCollider.refresh()):i.traverse(h=>{h.isMesh&&(h.userData.noCollision=!0)}),i}clearBuildings(){var n,i;const e=Pi(this,Tn,kr).call(this),t=this.rootGroup??(e==null?void 0:e.getObjectByName(Tr));t&&(sx(t),(n=t.parent)==null||n.remove(t),this.rootGroup=null,typeof((i=this.envCollider)==null?void 0:i.refresh)=="function"&&this.envCollider.refresh())}}Tn=new WeakSet,kr=function(){var e,t;return((t=(e=this.envCollider)==null?void 0:e.mesh)==null?void 0:t.parent)??null},pd=function(e){if(e!=null&&e.parent)return this.rootGroup=e.parent,this.rootGroup.name||(this.rootGroup.name=Tr),e.parent;if(this.rootGroup&&this.rootGroup.parent)return this.rootGroup;const t=Pi(this,Tn,kr).call(this);if(!t)return null;let n=t.getObjectByName(Tr);return n||(n=new gt,n.name=Tr,t.add(n)),this.rootGroup=n,n},gd=function(e){var i,r,a;const t=[e==null?void 0:e.heightSampler,e==null?void 0:e.terrainSampler,(r=(i=e==null?void 0:e.terrain)==null?void 0:i.userData)==null?void 0:r.getHeightAt],n=Pi(this,Tn,kr).call(this);if(n!=null&&n.userData){const{userData:o}=n;t.push(o.heightSampler,o.terrainSampler,o.terrainHeightSampler,o.getHeightAt);const c=o.terrain;(a=c==null?void 0:c.userData)!=null&&a.getHeightAt&&t.push(c.userData.getHeightAt)}for(const o of t)if(typeof o=="function")return o;return null};class lc{constructor(e=new y(0,0,0),t=new y(0,1,0),n=1){this.start=e,this.end=t,this.radius=n}clone(){return new lc(this.start.clone(),this.end.clone(),this.radius)}set(e,t,n){this.start.copy(e),this.end.copy(t),this.radius=n}copy(e){this.start.copy(e.start),this.end.copy(e.end),this.radius=e.radius}getCenter(e){return e.copy(this.end).add(this.start).multiplyScalar(.5)}translate(e){this.start.add(e),this.end.add(e)}checkAABBAxis(e,t,n,i,r,a,o,c,l){return(r-e<l||r-n<l)&&(e-a<l||n-a<l)&&(o-t<l||o-i<l)&&(t-c<l||i-c<l)}intersectsBox(e){return this.checkAABBAxis(this.start.x,this.start.y,this.end.x,this.end.y,e.min.x,e.max.x,e.min.y,e.max.y,this.radius)&&this.checkAABBAxis(this.start.x,this.start.z,this.end.x,this.end.z,e.min.x,e.max.x,e.min.z,e.max.z,this.radius)&&this.checkAABBAxis(this.start.y,this.start.z,this.end.y,this.end.z,e.min.y,e.max.y,e.min.z,e.max.z,this.radius)}}const Rr=new y(0,1,0);class ax{constructor(e,t,n={}){this.object=new Ze,this.object.userData.noCollision=!0,this.moveSpeed=4,this.sprintMult=1.8,this.gravity=12,this.jumpSpeed=5,this.slopeLimit=50,this.input=e,this.env=t,this.camera=n.camera,this.height=n.height??1.8,this.radius=n.radius??.35,this.cameraYaw=0,this.cameraPitch=Ie.degToRad(-15),this.cameraMinPitch=Ie.degToRad(-80),this.cameraMaxPitch=Ie.degToRad(60),this.cameraDistance=6,this.cameraTargetHeight=this.height*.6,this.cameraDamping=10,this.cameraTarget=new y,this.cameraDesired=new y,this.cameraEuler=new Xs(0,0,0,"YXZ"),this.cameraOffset=new y;const i=this.height-this.radius;this.capsule=new lc(new y(0,this.radius,0),new y(0,i,0),this.radius),this.object.position.set(0,this.height*.5,0),this.syncCapsuleToObject(),this.velocity=new y,this.groundNormal=new y(0,1,0),this.grounded=!1,this.jumpLocked=!1,this.flying=!1,this.flySpeed=8,this.flyIdleDecay=.9,this.character=void 0,this.desired=new y,this.tmpVec=new y,this.tmpVec2=new y,this.tmpVec3=new y,this.tmpVec4=new y,this.tmpQuat=new en,this.groundDamping=16,this.airDamping=6}get position(){return this.object.position}attachCharacter(e){this.character=e,this.object.add(e),e.position.set(0,0,0)}update(e){if(!Number.isFinite(e)||e<=0)return;(typeof this.input.consumeFlyToggle=="function"?this.input.consumeFlyToggle():!1)&&(this.flying=!this.flying,this.grounded=!1,this.velocity.y=0,this.flying||(this.jumpLocked=!0));const n=this.input.consumeLookDelta(e);this.camera&&(this.cameraYaw-=n.yaw,this.cameraPitch-=n.pitch,this.cameraPitch=Ie.clamp(this.cameraPitch,this.cameraMinPitch,this.cameraMaxPitch),Number.isFinite(this.cameraYaw)||(this.cameraYaw=0),this.cameraYaw=Ie.euclideanModulo(this.cameraYaw+Math.PI,Math.PI*2)-Math.PI);const i=this.input.sprint,a=(this.flying?this.flySpeed:this.moveSpeed)*(i?this.sprintMult:1);this.computeDesiredVelocity(a,this.flying);const o=this.flying||!this.grounded?this.airDamping:this.groundDamping;if(this.velocity.x=Ie.damp(this.velocity.x,this.desired.x,o,e),this.velocity.z=Ie.damp(this.velocity.z,this.desired.z,o,e),this.flying&&(this.velocity.y=Ie.damp(this.velocity.y,this.desired.y,this.airDamping,e)),this.desired.lengthSq()===0)if(this.flying){const h=Math.pow(this.flyIdleDecay,e);this.velocity.multiplyScalar(h)}else{const h=this.grounded?.85:.95,u=Math.pow(h,e);this.velocity.x*=u,this.velocity.z*=u}this.flying?this.input.flyUp||(this.jumpLocked=!1):(this.grounded&&this.input.jump&&!this.jumpLocked&&(this.velocity.y=this.jumpSpeed,this.grounded=!1,this.jumpLocked=!0),this.input.jump||(this.jumpLocked=!1),this.grounded||(this.velocity.y-=this.gravity*e));const c=this.tmpVec.copy(this.velocity).multiplyScalar(e);this.capsule.translate(c),this.resolveCollisions(e);const l=this.getCapsuleCenter(this.tmpVec);if(this.object.position.copy(l),this.updateCamera(e),this.character){const h=Math.hypot(this.velocity.x,this.velocity.z),u=.05,d=Math.atan2(this.velocity.x,this.velocity.z);h>u&&(this.character.rotation.y=d);const f=this.moveSpeed*1.5,p=this.moveSpeed*.8;this.flying?this.character.play("Jump",.1):this.grounded?h>f?this.character.play("Run",.1):h>p?this.character.play("Swagger",.1):h>.1?this.character.play("Walk",.15):this.character.play("Idle",.2):this.character.play("Jump",.1),this.character.update(e)}}computeDesiredVelocity(e,t=!1){this.desired.set(0,0,0);const n=(this.input.right?1:0)-(this.input.left?1:0),i=(this.input.forward?1:0)-(this.input.back?1:0),r=t?(this.input.flyUp?1:0)-(this.input.flyDown?1:0):0;if(n!==0||i!==0)if(this.tmpVec2.set(n,0,i).normalize(),this.camera){this.tmpQuat.setFromEuler(this.cameraEuler.set(this.cameraPitch,this.cameraYaw,0,"YXZ"));const a=this.tmpVec3.set(0,0,-1).applyQuaternion(this.tmpQuat);a.y=0,a.lengthSq()<1e-6?a.set(0,0,-1):a.normalize();const o=this.tmpVec.copy(a).cross(Rr);o.lengthSq()<1e-6?o.set(1,0,0):o.normalize(),this.desired.copy(a).multiplyScalar(this.tmpVec2.z).addScaledVector(o,this.tmpVec2.x)}else this.desired.copy(this.tmpVec2);t&&r!==0&&(this.desired.y=r),this.desired.lengthSq()!==0&&this.desired.normalize().multiplyScalar(e)}updateCamera(e){if(this.camera){if(this.cameraTarget.copy(this.object.position),this.cameraTarget.y+=this.cameraTargetHeight,this.tmpQuat.setFromEuler(this.cameraEuler.set(this.cameraPitch,this.cameraYaw,0,"YXZ")),this.cameraOffset.set(0,0,this.cameraDistance).applyQuaternion(this.tmpQuat),this.cameraDesired.copy(this.cameraTarget).add(this.cameraOffset),!Number.isFinite(e)||e<=0)this.camera.position.copy(this.cameraDesired);else{const t=1-Math.exp(-this.cameraDamping*e);this.camera.position.lerp(this.cameraDesired,t)}this.camera.lookAt(this.cameraTarget)}}resolveCollisions(e){const t=this.env,n=!this.flying;this.grounded=!1;let i=null;if(t!=null&&t.capsuleIntersect)for(let r=0;r<3;r++){const a=t.capsuleIntersect(this.capsule);if(!a)break;this.tmpVec.copy(a.normal).multiplyScalar(a.depth),this.capsule.translate(this.tmpVec);const o=this.tmpVec2.copy(a.normal).normalize(),c=o.dot(this.velocity);c<0&&this.velocity.addScaledVector(o,-c);const l=Ie.clamp(o.dot(Rr),-1,1),h=Ie.radToDeg(Math.acos(l));o.y>0&&(i===null&&(i=this.tmpVec4),i.copy(o),n&&h<=this.slopeLimit?(this.grounded=!0,this.groundNormal.copy(o)):n||this.groundNormal.copy(o))}else{const r=this.getCapsuleCenter(this.tmpVec3),a=this.height*.5;r.y<a&&(this.tmpVec.set(0,a-r.y,0),this.capsule.translate(this.tmpVec),this.velocity.y<0&&(this.velocity.y=0),n&&(this.grounded=!0),this.groundNormal.set(0,1,0))}if(n&&this.grounded){this.velocity.y<0&&(this.velocity.y=0);const r=Ie.clamp(this.groundNormal.dot(Rr),-1,1);Ie.radToDeg(Math.acos(r))>this.slopeLimit&&(this.grounded=!1)}if(n&&!this.grounded&&i){const r=this.tmpVec.copy(i).projectOnPlane(Rr);r.lengthSq()>1e-6&&(r.normalize(),this.velocity.addScaledVector(r,this.gravity*e)),this.groundNormal.copy(i)}if(n&&!this.grounded&&this.velocity.y>0&&i){const r=i,a=r.dot(this.velocity);a<0&&this.velocity.addScaledVector(r,-a)}!this.grounded&&!i&&this.groundNormal.set(0,1,0)}syncCapsuleToObject(){const e=this.object.position,t=this.height*.5;this.capsule.start.set(e.x,e.y-t+this.radius,e.z),this.capsule.end.set(e.x,e.y+t-this.radius,e.z)}getCapsuleCenter(e){return e.copy(this.capsule.start).add(this.capsule.end).multiplyScalar(.5)}}function ox(s){return!s||s.byteLength<16?!0:new Uint8Array(s.slice(0,16))[0]===60}function cx(s){const e=new cc;if(s)try{const t=Y_(s);t&&e.setKTX2Loader(t)}catch(t){console.warn("[GLB Loader] Unable to configure KTX2 loader",t)}return e.setMeshoptDecoder(ud),e}async function Po({renderer:s,urls:e,targetHeight:t=null,onLoaded:n=null}){if(!Array.isArray(e)||e.length===0)throw new Error("loadGLBWithFallbacks requires at least one URL");const i=cx(s);let r=null;for(const a of e){if(typeof a!="string"||a.trim().length===0)continue;const o=a.trim();try{const c=await fetch(o,{cache:"no-cache"});if(!c.ok)throw new Error(`${c.status} ${c.statusText} at ${o}`);const l=await c.arrayBuffer();if(ox(l))throw new Error(`Downloaded HTML instead of GLB: ${o}`);const h=await i.loadAsync(o),u=h.scene||(Array.isArray(h.scenes)?h.scenes[0]:null);if(!u)throw new Error(`No scene in GLB: ${o}`);if(t&&t>0){u.updateMatrixWorld(!0);const d=new pn().setFromObject(u),f=new y;d.getSize(f);const p=f.y||1,m=p!==0?t/p:1;Number.isFinite(m)&&m>0&&u.scale.multiplyScalar(m)}if(typeof n=="function")try{n({url:o,gltf:h,root:u})}catch(d){console.warn("[GLB Fallback] onLoaded hook failed",d)}return{url:o,gltf:h,root:u}}catch(c){r=c instanceof Error?c:new Error(String(c)),console.warn(`[GLB Fallback] Failed ${o}:`,r.message||r)}}throw r||new Error("All GLB fallbacks failed.")}class lx extends Ze{constructor(){super(),this.model=void 0,this.mixer=void 0,this.actions=new Map,this.current=void 0}async load(e,t,{targetHeight:n=1.8}={}){const i=Array.isArray(e)?e:[e],{gltf:r,root:a}=await Po({renderer:t,urls:i,targetHeight:n});this.initializeFromGLTF(a,r.animations)}initializeFromGLTF(e,t=[]){if(!e)throw new Error("Character.initializeFromGLTF requires a root object");this.model&&this.remove(this.model),this.model=e,this.model.traverse(a=>{a.isMesh&&(a.castShadow=!0,a.receiveShadow=!0,a.frustumCulled=!1)}),this.model.rotation.y=Math.PI,this.add(this.model),this.mixer=new Vb(this.model);const n=Array.isArray(t)?t:[],i=new Map;for(const a of n)a!=null&&a.name&&i.set(a.name,a);const r=a=>{const o=a.toLowerCase();return o.includes("idle")?"Idle":o.includes("walk")&&!o.includes("swagger")?"Walk":o.includes("run")?"Run":o.includes("swagger")||o.includes("swag")?"Swagger":o.includes("jump")?"Jump":null};this.actions=new Map;for(const[a,o]of i){const c=r(a);if(!c)continue;const l=this.mixer.clipAction(o);l.clampWhenFinished=!0,l.enable=!0,this.actions.set(c,l)}!this.actions.get("Swagger")&&this.actions.get("Walk")&&this.actions.set("Swagger",this.actions.get("Walk")),!this.actions.get("Run")&&this.actions.get("Walk")&&this.actions.set("Run",this.actions.get("Walk")),!this.actions.get("Idle")&&this.actions.get("Walk")&&this.actions.set("Idle",this.actions.get("Walk")),this.play("Idle",0)}update(e){var t;(t=this.mixer)==null||t.update(e)}play(e,t=.2){const n=this.actions.get(e);!n||this.current===n||(n.reset().play(),this.current&&this.current.crossFadeTo(n,t,!1),this.current=n)}}function hx(s,e){const t=new gt;t.name="CitizenNPC";const n=new Ke({color:s,roughness:.6,metalness:.1}),i=new _e(new $o(.4,1.1,8,16),n);i.position.y=1.1,i.castShadow=!0,i.receiveShadow=!0,i.userData.noCollision=!0,t.add(i);const r=new Ke({color:e,roughness:.4}),a=new _e(new oi(.32,16,16),r);a.position.y=2,a.castShadow=!0,a.userData.noCollision=!0,t.add(a);const o=new _e(new nc(.45,.08,8,18,Math.PI*1.25),new Ke({color:16117990,roughness:.5}));return o.rotation.set(Math.PI/2,Math.PI/3,0),o.position.y=1.3,o.castShadow=!0,o.userData.noCollision=!0,t.add(o),{group:t,body:i}}function ux(s){const t=s.getLengths(100),n=t[t.length-1];return{divisions:100,lengths:t,totalLength:n}}function dx(s,e,t={}){var d,f;if(!e)return{citizens:[],updaters:[]};const n=t.count??6,i=t.minSpeed??.6,r=t.maxSpeed??1.2,a=t.terrain??null,o=t.palette??[{primary:5148407,secondary:16119285},{primary:15753874,secondary:16772275},{primary:8505220,secondary:15267305},{primary:16758605,secondary:16774112},{primary:9795021,secondary:15984117}],{totalLength:c}=ux(e),l=(f=(d=a==null?void 0:a.userData)==null?void 0:d.getHeightAt)==null?void 0:f.bind(a==null?void 0:a.userData),h=[],u=[];for(let p=0;p<n;p++){const m=o[p%o.length],{group:g,body:A}=hx(m.primary,m.secondary);g.userData.noCollision=!0,s.add(g),h.push(g);const b=Ie.lerp(i,r,Math.random());let E=(p/n+Math.random()*.1)%1,_=Math.random()*Math.PI*2;const M=v=>{if(!Number.isFinite(v))return;const D=b*v/c;E=(E+D)%1;const x=e.getPointAt(E),C=e.getTangentAt(E);g.position.copy(x);const R=l?l(g.position.x,g.position.z):x.y;g.position.y=Number.isFinite(R)?R+.05:x.y+.05;const U=Math.atan2(C.x,C.z);g.rotation.set(0,U,0),_+=v*b*6,A.position.y=1.1+Math.sin(_)*.07,A.rotation.z=Math.sin(_)*.2};u.push(M)}return{citizens:h,updaters:u}}function fx(s,e={}){const t=e.min??.2,n=e.max??2,i=e.step??.01,r=e.key??"F9",a=e.storageKey??"toneMappingExposure",o=document.createElement("div");o.id="tmx-wrap",Object.assign(o.style,{position:"fixed",top:"12px",right:"12px",padding:"10px 12px",background:"rgba(0,0,0,0.55)",backdropFilter:"blur(4px)",borderRadius:"10px",font:"12px/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",color:"#fff",zIndex:9999,userSelect:"none"});const c=document.createElement("div");c.textContent="Exposure",c.style.marginBottom="6px";const l=document.createElement("div");l.style.display="flex",l.style.alignItems="center";const h=document.createElement("input");h.type="range",h.min=String(t),h.max=String(n),h.step=String(i),h.style.width="140px";const u=document.createElement("span");u.style.marginLeft="8px",u.style.opacity="0.8";const d=Number(localStorage.getItem(a)),f=Number.isFinite(d)?d:s.toneMappingExposure??1,p=A=>Math.min(n,Math.max(t,A)),m=A=>{const b=p(Number(A));s.toneMappingExposure=b,h.value=String(b),u.textContent=b.toFixed(2)};m(f),h.addEventListener("input",A=>m(A.target.value)),h.addEventListener("change",()=>localStorage.setItem(a,h.value)),l.appendChild(h),l.appendChild(u),o.appendChild(c),o.appendChild(l),document.body.appendChild(o);const g=A=>{A.key===r&&(o.style.display=o.style.display!=="none"?"none":"block",A.preventDefault())};return window.addEventListener("keydown",g),{element:o,input:h,get value(){return Number(h.value)},set value(A){m(A)},dispose(){window.removeEventListener("keydown",g),o.remove()}}}const Oh="hotkey-overlay-style",ut="hotkey-overlay",Cn="hotkey-overlay--hidden",md="hotkeyOverlayOpen";function Ax(){try{return localStorage.getItem(md)==="1"}catch{return!1}}function px(s){try{localStorage.setItem(md,s?"1":"0")}catch{}}const gx=[{keys:["W","A","S","D"],description:"Move"},{keys:["Shift"],description:"Sprint"},{keys:["Space"],description:"Jump / fly up"},{keys:["Ctrl"],description:"Fly down"},{keys:["F"],description:"Toggle flight mode"},{keys:["E"],description:"Interact with highlighted objects"},{keys:["Arrow Keys"],description:"Look around"},{keys:["F9"],description:"Toggle exposure slider"}];function mx(s={}){if(document.querySelector(`.${ut}`))return;bx();const e=Array.isArray(s.hotkeys)&&s.hotkeys.length>0?s.hotkeys:gx,t=typeof s.toggleKey=="string"&&s.toggleKey.trim().length>0?s.toggleKey:"KeyH",n=s.showButton!==!1,i=document.createElement("div");i.className=ut,i.setAttribute("role","dialog"),i.setAttribute("aria-live","polite");const r=document.createElement("button");r.type="button",r.className=`${ut}__toggle`,r.innerHTML=`
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor"
        d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-6l-3.5 3.5a1 1 0 0 1-1.7-.7V17H6a3 3 0 0 1-3-3V6zm4 2a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2H7zm5 0a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2h-2zm5 0a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2h-2z"/>
    </svg>
    <span class="${ut}__sr">Hotkeys (press ${ao(t)})</span>
  `,r.setAttribute("title",`Hotkeys (${ao(t)})`),r.setAttribute("aria-expanded","false"),r.setAttribute("aria-controls",`${ut}-panel`);const a=document.createElement("div");a.className=`${ut}__panel`,a.id=`${ut}-panel`,a.setAttribute("role","document"),a.setAttribute("aria-hidden","true");const o=document.createElement("h2");o.textContent="Controls",o.className=`${ut}__title`,a.appendChild(o);const c=document.createElement("dl");c.className=`${ut}__list`;for(const f of e){if(!f||!Array.isArray(f.keys)||f.keys.length===0)continue;const p=f.keys.map(b=>String(b).trim()).filter(Boolean),m=typeof f.description=="string"?f.description:"";if(p.length===0||!m)continue;const g=document.createElement("dt");g.className=`${ut}__keys`,g.textContent=p.join(" / ");const A=document.createElement("dd");A.className=`${ut}__description`,A.textContent=m,c.appendChild(g),c.appendChild(A)}a.appendChild(c);const l=document.createElement("p");l.className=`${ut}__hint`,l.textContent=`Press ${ao(t)} to toggle`,a.appendChild(l);const h=Ax();h?i.classList.remove(Cn):i.classList.add(Cn),n&&i.appendChild(r),i.appendChild(a),document.body.appendChild(i);const u=f=>{var m;f?i.classList.remove(Cn):i.classList.add(Cn);const p=!i.classList.contains(Cn);(m=r==null?void 0:r.setAttribute)==null||m.call(r,"aria-expanded",String(p)),a.setAttribute("aria-hidden",String(!p)),px(p)};u(h);const d=f=>{if(f===!0){u(i.classList.contains(Cn));return}if(f===!1){u(!1);return}u(!i.classList.contains(Cn))};n&&r.addEventListener("click",()=>{d(!0)}),window.addEventListener("keydown",f=>{f.code===t&&!f.repeat&&d(!0),f.code==="Escape"&&!i.classList.contains(Cn)&&d(!1)})}function bx(){if(document.getElementById(Oh))return;const s=document.createElement("style");s.id=Oh,s.textContent=`
    .${ut} {
      position: fixed;
      right: 16px;
      top: 16px;
      z-index: 1200;
      display: flex;
      flex-direction: column;
      gap: 10px;
      color: #fff;
      font-family: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
    }

    .${ut}__sr {
      position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
      overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
    }

    .${ut}__toggle {
      background: rgba(0,0,0,0.5);
      border: 1px solid rgba(255,255,255,0.18);
      border-radius: 999px;
      color: inherit;
      width: 28px; height: 28px;
      display: grid; place-items: center;
      padding: 0;
      cursor: pointer;
      transition: background .2s ease, border-color .2s ease, opacity .2s ease, transform .12s ease;
      opacity: .85;
    }
    .${ut}__toggle:hover,
    .${ut}__toggle:focus-visible {
      background: rgba(0,0,0,0.72);
      border-color: rgba(255,255,255,0.36);
      outline: none;
      opacity: 1;
      transform: scale(1.04);
    }

    .${ut}__panel {
      background: rgba(10,12,18,0.9);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 10px;
      padding: 14px;
      min-width: 220px;
      backdrop-filter: blur(6px);
      box-shadow: 0 12px 30px rgba(0,0,0,0.35);
      transition: opacity .18s ease, transform .18s ease;
    }

    .${ut}__title {
      margin: 0 0 12px;
      font-size: 16px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .${ut}__list {
      display: grid;
      grid-template-columns: max-content 1fr;
      gap: 6px 12px;
      margin: 0;
      padding: 0;
    }

    .${ut}__keys {
      margin: 0;
      font-weight: 600;
      letter-spacing: 0.05em;
    }

    .${ut}__description {
      margin: 0;
      opacity: 0.85;
    }

    .${ut}__hint {
      margin: 12px 0 0;
      font-size: 12px;
      letter-spacing: 0.04em;
      opacity: 0.65;
      text-transform: uppercase;
    }

    .${ut}.${Cn} .${ut}__panel {
      opacity: 0;
      pointer-events: none;
      transform: translateY(-6px);
    }

    /* Hide the icon while the panel is open (less clutter) */
    .${ut}:not(.${Cn}) .${ut}__toggle {
      opacity: 0;
      pointer-events: none;
    }
  `,document.head.appendChild(s)}function ao(s){switch(s){case"KeyH":return"H";case"F9":case"F10":case"F11":case"F12":return s;case"ControlLeft":case"ControlRight":return"Ctrl";default:return s.startsWith("Key")&&s.length===4?s.slice(3):s}}function Ex({getPosition:s,getDirection:e,onPin:t,onSetLightingPreset:n,lightingPresets:i}={}){if(!(typeof window<"u"&&window.SHOW_HUD===!0))return null;const a=document.createElement("div");Object.assign(a.style,{position:"fixed",top:"12px",right:"12px",zIndex:999999,color:"#fff",font:"12px/1.35 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto",textShadow:"0 1px 2px rgba(0,0,0,0.45)",userSelect:"none",pointerEvents:"none"});const o=document.createElement("div");Object.assign(o.style,{width:"88px",height:"88px",borderRadius:"50%",border:"2px solid rgba(255,255,255,0.75)",position:"relative",marginBottom:"8px"});const c=document.createElement("div");Object.assign(c.style,{position:"absolute",left:"50%",top:"50%",width:"2px",height:"40px",background:"rgba(255,0,0,0.9)",transformOrigin:"50% 100%",borderRadius:"2px",transform:"translate(-1px, -40px) rotate(0deg)"}),o.appendChild(c),Object.entries({N:0,E:90,S:180,W:270}).forEach(([M,v])=>{const S=document.createElement("div");S.textContent=M,Object.assign(S.style,{position:"absolute",left:"50%",top:"50%",transform:`translate(-50%,-50%) rotate(${v}deg) translate(0,-38px) rotate(${-v}deg)`,fontWeight:700,letterSpacing:"0.5px"}),o.appendChild(S)});const h=document.createElement("div");h.style.pointerEvents="auto",h.style.background="rgba(0,0,0,0.55)",h.style.backdropFilter="blur(3px)",h.style.padding="8px 10px",h.style.borderRadius="8px",h.style.minWidth="220px",h.innerHTML=['<div><b>Pos</b> <span id="hud-pos">(x,y,z)</span></div>','<div><b>Bear</b> <span id="hud-bear">0° N</span></div>','<div style="opacity:.8">Press <b>P</b> to drop a pin</div>'].join("");const d=[{name:"dawn",label:"Dawn"},{name:"noon",label:"High Noon"},{name:"dusk",label:"Dusk"},{name:"night",label:"Night"}].filter(({name:M})=>i?i[M]!=null:!0);if(d.length&&!h.querySelector(".hud-lighting-presets")){const M=document.createElement("div");M.className="hud-lighting-presets",Object.assign(M.style,{marginTop:"8px",paddingTop:"6px",borderTop:"1px solid rgba(255,255,255,0.15)",pointerEvents:"auto"});const v=document.createElement("div");v.textContent="Lighting Presets",Object.assign(v.style,{fontWeight:600,letterSpacing:"0.08em",fontSize:"11px",opacity:"0.85",textTransform:"uppercase"}),M.appendChild(v);const S=document.createElement("div");Object.assign(S.style,{display:"flex",flexWrap:"wrap",gap:"6px",marginTop:"6px"});const D=[{name:"dawn",codes:["Digit1","Numpad1"],keys:["1"]},{name:"noon",codes:["Digit2","Numpad2"],keys:["2"]},{name:"dusk",codes:["Digit3","Numpad3"],keys:["3"]},{name:"night",codes:["Digit4","Numpad4"],keys:["4"]}],x=new Set(d.map(R=>R.name)),C=new Map;for(const R of d){const U=(i==null?void 0:i[R.name])||{},O=document.createElement("button");O.type="button";const T=U.label||R.label;O.textContent=T,Object.assign(O.style,{padding:"4px 8px",borderRadius:"4px",border:"1px solid rgba(255,255,255,0.35)",background:"rgba(0,0,0,0.35)",color:"inherit",font:"inherit",cursor:"pointer",pointerEvents:"auto",transition:"background 0.2s ease, border-color 0.2s ease"}),O.addEventListener("mouseenter",()=>{O.style.background="rgba(255,255,255,0.18)",O.style.borderColor="rgba(255,255,255,0.55)"}),O.addEventListener("mouseleave",()=>{O.style.background="rgba(0,0,0,0.35)",O.style.borderColor="rgba(255,255,255,0.35)"});const F=U.hotkey||"";F?O.title=`Set ${T} lighting (Hotkey ${F})`:O.title=`Set ${T} lighting`,O.addEventListener("click",Q=>{Q.preventDefault(),typeof n=="function"&&n(R.name)}),S.appendChild(O)}D.filter(R=>x.has(R.name)).forEach(R=>{for(const U of R.codes)C.set(U,R.name);for(const U of R.keys)C.set(U,R.name)}),M.appendChild(S),h.appendChild(M),h._presetKeyBindings=C}a.appendChild(o),a.appendChild(h),document.body.appendChild(a);const f=h.querySelector("#hud-pos"),p=h.querySelector("#hud-bear"),m=M=>{const S=(Math.atan2(M.x,M.z)*180/Math.PI+360)%360,D=["N","NE","E","SE","S","SW","W","NW","N"],x=Math.round(S/45);return{deg:Math.round(S),label:D[x]}};let g=0,A=!0;const b=()=>{if(A){try{const M=s==null?void 0:s(),v=e==null?void 0:e();if(M&&(f.textContent=`(${M.x.toFixed(1)}, ${M.y.toFixed(1)}, ${M.z.toFixed(1)})`),v){const S=m(v);p.textContent=`${S.deg}° ${S.label}`,c.style.transform=`translate(-1px, -40px) rotate(${S.deg}deg)`}}catch{}g=requestAnimationFrame(b)}};b();const E=()=>(h==null?void 0:h._presetKeyBindings)instanceof Map?h._presetKeyBindings:null,_=M=>{var D;if(((D=M.key)==null?void 0:D.toLowerCase())==="p"){const x=s==null?void 0:s();x&&(t==null||t(x),console.log(`[PIN] @ (${x.x.toFixed(2)}, ${x.y.toFixed(2)}, ${x.z.toFixed(2)})`))}const v=E();if(!v||typeof n!="function"||M.repeat)return;const S=v.get(M.code)||v.get(M.key);S&&(M.preventDefault(),n(S))};return window.addEventListener("keydown",_),{dispose(){A=!1,cancelAnimationFrame(g),window.removeEventListener("keydown",_),a.remove()}}}function _x(s,e,t=16724838){const n=new gt;n.name="Pin";const i=new _e(new Dt(.05,.05,1.2,8),new Ke({color:16777215,roughness:.8}));i.position.y=.6;const r=new _e(new Yn(.5,.3),new Ke({color:t,side:sn,roughness:.6}));return r.position.set(.3,1,0),r.rotation.y=Math.PI/2,n.add(i,r),n.position.copy(e),n.renderOrder=2,n.userData.noCollision=!0,s.add(n),n}function xx(s){var o;if(!s)return;const e=(o=s==null?void 0:s.userData)==null?void 0:o.getHeightAt;if(typeof e=="function"){const c=e(0,0);if(Number.isFinite(c))return}const t=new ku;t.firstHitOnly=!0;const n=[s],i=200,r=-400;function a(c,l){t.set(new y(c,i,l),new y(0,-1,0));const h=t.intersectObjects(n,!0)[0];if(h)return h.point.y;t.set(new y(c,r,l),new y(0,1,0));const u=t.intersectObjects(n,!0)[0];return u?u.point.y:0}s.userData=s.userData||{},s.userData.getHeightAt=a}function yx(s,e,t,n,i=6,r=120){var E,_;const a=(_=(E=e==null?void 0:e.userData)==null?void 0:E.getHeightAt)==null?void 0:_.bind(e==null?void 0:e.userData);if(!a)return console.warn("[occluder] terrain.getHeightAt missing"),null;const o=new y(t.x,0,t.y),c=new y(n.x,0,n.y),l=new oe(c.x-o.x,c.z-o.z);l.lengthSq()===0?l.set(1,0):l.normalize();const h=new oe(-l.y,l.x),u=i*.5,d=new Float32Array((r+1)*2*3),f=new Ut(d,3),p=new It;p.setAttribute("position",f);const m=[];for(let M=0;M<r;M++){const v=M*2;m.push(v,v+1,v+2,v+1,v+3,v+2)}p.setIndex(m);const g=.05;for(let M=0;M<=r;M++){const v=M/r,S=Ie.lerp(o.x,c.x,v),D=Ie.lerp(o.z,c.z,v),x=(a(S,D)??0)+g,C=S-h.x*u,R=D-h.y*u,U=S+h.x*u,O=D+h.y*u,T=M*2*3,F=(M*2+1)*3;d[T+0]=C,d[T+1]=x,d[T+2]=R,d[F+0]=U,d[F+1]=x,d[F+2]=O}f.needsUpdate=!0,p.computeVertexNormals();const A=new Ke({color:0,transparent:!1,depthWrite:!0,depthTest:!0,colorWrite:!1}),b=new _e(p,A);return b.name="WaterDepthOccluderRibbon",b.renderOrder=-2,b.receiveShadow=!1,b.castShadow=!1,b.userData.noCollision=!0,s.add(b),b}const vx=.05;function Cx(s,e,t,n=0,{clampToSea:i=!1,seaLevel:r=0,minAboveSea:a=0}={}){var l,h;const o=(h=(l=s==null?void 0:s.userData)==null?void 0:l.getHeightAt)==null?void 0:h.call(l,e,t);let c=Number.isFinite(o)?o:n;return i&&(c=Math.max(c,r+a)),c}function kh(s,e,t,n,i=vx,r={}){var o;const a=Cx(e,t,n,((o=s.position)==null?void 0:o.y)??0,r);return s.position.y=a+i,s.position.y}const Ix={},Gh="WorldRoot",Hh={dawn:{phase:.25,exposure:.9,label:"Dawn",hotkey:"1"},noon:{phase:.5,exposure:1.5,label:"High Noon",hotkey:"2"},dusk:{phase:.75,exposure:.95,label:"Dusk",hotkey:"3"},night:{phase:0,exposure:.6,label:"Night",hotkey:"4"}};function zh(s){return(s.headers.get("content-type")||"").includes("text/html")}async function Sx(s){try{const e=await fetch(s,{method:"HEAD"});if(e.ok&&!zh(e))return!0;if(e.status===405||e.status===501){const t=await fetch(s,{method:"GET"});return t.ok&&!zh(t)}return!1}catch(e){return console.debug(`Asset probe failed for "${s}"`,e),!1}}async function Mx(s){for(const e of s)if(await Sx(e))return e;return null}window.addEventListener("unhandledrejection",s=>{console.error("Unhandled promise rejection:",s.reason)});const yi=oc();function wx(s){s&&(s.shadowMap.enabled=!0,s.shadowMap.type=Xh,s.shadowMap&&(s.shadowMap.autoUpdate=!0,s.shadowMap.needsUpdate=!0))}function Dr(s,e,t=0){const n=Math.sin(s*127.1+e*311.7+t*74.7)*43758.5453;return n-Math.floor(n)}function Bx(s,e,t=0){const n=Math.floor(s),i=Math.floor(e),r=s-n,a=e-i,o=Dr(n,i,t),c=Dr(n+1,i,t),l=Dr(n,i+1,t),h=Dr(n+1,i+1,t),u=r*r*(3-2*r),d=a*a*(3-2*a),f=Ie.lerp(o,c,u),p=Ie.lerp(l,h,u);return Ie.lerp(f,p,d)}function oo(s,e,{seed:t=0,octaves:n=5,persistence:i=.5,lacunarity:r=2}={}){let a=0,o=1,c=1;for(let l=0;l<n;l+=1)a+=o*Bx(s*c,e*c,t+l*19.19),o*=i,c*=r;return a}let $i=null;function Lr(s,{colorSpace:e=dt}={}){const t=new Uint8Array(4);t[0]=s>>16&255,t[1]=s>>8&255,t[2]=s&255,t[3]=255;const n=new ta(t,1,1,Lt);return n.colorSpace=e,n.wrapS=n.wrapT=Dn,n.repeat.set(3,3),n.needsUpdate=!0,n}function Tx(){if($i)return $i;if(typeof document>"u"||!document.createElement)return $i={map:Lr(15723754,{colorSpace:dt}),normalMap:Lr(8421631,{colorSpace:Et}),roughnessMap:Lr(11776947,{colorSpace:Et}),aoMap:Lr(14737632,{colorSpace:Et})},$i;const s=512,e=document.createElement("canvas");e.width=s,e.height=s;const t=e.getContext("2d"),n=t.createImageData(s,s),i=t.createImageData(s,s),r=t.createImageData(s,s),a=t.createImageData(s,s),o=new Float32Array(s*s),c=6;for(let d=0;d<s;d+=1)for(let f=0;f<s;f+=1){const p=(d*s+f)*4,m=f/s*c,g=d/s*c,A=oo(m*.85,g*.9,{seed:11,octaves:4}),b=oo(m*2.3,g*2.4,{seed:37,octaves:5,persistence:.55,lacunarity:2.15}),E=m*1.12+g*1.27+b*4.2,_=Math.sin(E+A*2.6),M=oo(m*5.2,g*5.4,{seed:73,octaves:3,persistence:.6,lacunarity:2.8}),v=.5+.5*_*.8+M*.2,S=Math.pow(Math.abs(Math.sin(E*.6+M*3.4)),1.4);o[d*s+f]=v;const D=.04+A*.03,x=Ie.clamp(.78+v*.18+A*.05,0,1);let C=x+D,R=x+D*.6,U=x+D*.2;C=Ie.clamp(C-S*.09,0,1),R=Ie.clamp(R-S*.07,0,1),U=Ie.clamp(U-S*.05,0,1),n.data[p+0]=Math.round(C*255),n.data[p+1]=Math.round(R*255),n.data[p+2]=Math.round(U*255),n.data[p+3]=255;const O=Ie.clamp(.42+S*.32+M*.12,.18,.88),T=Math.round(O*255);i.data[p+0]=T,i.data[p+1]=T,i.data[p+2]=T,i.data[p+3]=255;const F=Ie.clamp(.93-S*.35-M*.18,.45,1),Q=Math.round(F*255);r.data[p+0]=Q,r.data[p+1]=Q,r.data[p+2]=Q,r.data[p+3]=255}const l=(d,f)=>{const p=(d+s)%s,m=(f+s)%s;return o[m*s+p]},h=2.1;for(let d=0;d<s;d+=1)for(let f=0;f<s;f+=1){const p=(d*s+f)*4,m=l(f-1,d),g=l(f+1,d),A=l(f,d-1),b=l(f,d+1),E=(g-m)*h,_=(b-A)*h,M=1,v=Math.sqrt(E*E+_*_+M*M)||1,S=E/v,D=_/v,x=M/v;a.data[p+0]=Math.round((S*.5+.5)*255),a.data[p+1]=Math.round((D*.5+.5)*255),a.data[p+2]=Math.round((x*.5+.5)*255),a.data[p+3]=255}const u=(d,{colorSpace:f})=>{const p=document.createElement("canvas");p.width=s,p.height=s,p.getContext("2d").putImageData(d,0,0);const g=new j0(p);return g.wrapS=g.wrapT=Dn,g.repeat.set(3,3),g.anisotropy=4,g.colorSpace=f,g.needsUpdate=!0,g};return $i={map:u(n,{colorSpace:dt}),normalMap:u(a,{colorSpace:Et}),roughnessMap:u(i,{colorSpace:Et}),aoMap:u(r,{colorSpace:Et})},$i}const Rx=new Set(["","1","true","on","yes","y"]),Dx=new Set(["0","false","off","no","n"]);function Vh(s,e=!0){if(s==null)return e;const t=String(s).trim().toLowerCase();return Rx.has(t)?!0:Dx.has(t)?!1:e}function Wh({queryKey:s,windowFlagKey:e,defaultValue:t=!0,devDefault:n=!0}={}){if(typeof window>"u")return t;if(s){const i=new URLSearchParams(window.location.search);if(i.has(s))return Vh(i.get(s),t)}if(e&&typeof window[e]<"u"){const i=window[e];return typeof i=="boolean"?i:Vh(i,t)}return t}function Lx(s={}){const e=s.minutesPerDay??20,n=(Number.isFinite(e)?Math.max(0,e):0)*60;return{secondsPerDay:n,phaseAt(i=0){return!Number.isFinite(i)||n<=0?0:(i%n+n)%n/n}}}async function Px(){var P,le,he;console.log("🔧 Athens mainApp start");const s=new Su({antialias:!0});s.outputColorSpace=dt,s.toneMapping=Kh,s.toneMappingExposure=1,s.localClippingEnabled=!0,wx(s),s.setSize(window.innerWidth,window.innerHeight),document.body.appendChild(s.domElement),!(typeof import.meta<"u"&&Ix)&&fx(s,{min:.2,max:2,step:.01,key:"F9"}),K_(s),lE(),mx({toggleKey:"KeyH"});const t=document.createElement("div");t.textContent="Press E to interact",Object.assign(t.style,{position:"fixed",left:"50%",bottom:"20%",transform:"translateX(-50%)",padding:"8px 12px",borderRadius:"6px",background:"rgba(0, 0, 0, 0.6)",color:"#fff",fontFamily:"sans-serif",fontSize:"14px",letterSpacing:"0.05em",opacity:"0",transition:"opacity 0.2s ease",pointerEvents:"none"}),document.body.appendChild(t);const n=document.createElement("div");Object.assign(n.style,{position:"fixed",right:"16px",bottom:"16px",padding:"6px 10px",borderRadius:"6px",background:"rgba(0, 0, 0, 0.6)",color:"#fff",fontFamily:"sans-serif",fontSize:"14px",letterSpacing:"0.05em",pointerEvents:"none",textTransform:"uppercase"}),document.body.appendChild(n);function i(L=0){const K=Math.max(0,Math.min(1,L))*24*60,$=Math.floor(K/60)%24,de=Math.floor(K%60);return`${$.toString().padStart(2,"0")}:${de.toString().padStart(2,"0")}`}let r="";const a=new O0;a.userData=a.userData||{};const o=L=>{if(!L)return;const K=Array.isArray(L)?L:[L];for(const $ of K)if($){for(const de of Object.values($))de&&de.isTexture&&typeof de.dispose=="function"&&de.dispose();typeof $.dispose=="function"&&$.dispose()}},c=L=>{L&&L.traverse(K=>{K.isMesh&&(K.geometry&&typeof K.geometry.dispose=="function"&&K.geometry.dispose(),o(K.material))})},l=L=>{if(!L)return;const K=[...L.children];for(const $ of K)c($),L.remove($)},h=()=>{var $,de;const L=(($=a.userData)==null?void 0:$.worldRoot)??a.getObjectByName(Gh);L&&(l(L),(de=L.parent)==null||de.remove(L));const K=new gt;return K.name=Gh,a.add(K),a.userData.worldRoot=K,K};a.fog=new Vo(10526880,50,400);const u=new Yt(75,window.innerWidth/window.innerHeight,.1,2e3);u.position.set(0,5,10);const d=Jb(a),f=aE(a),p=new Yb(a,u,{getNightFactor:()=>f.nightFactor},{harbor:yn,agora:Bn,acropolis:Vs});await p.initFromManifest("audio/manifest.json"),await p.ensureUserGestureResume(),Wh({queryKey:"audio",windowFlagKey:"SHOW_AUDIO_MIXER"})&&Kb(p);const g=$b(a,1e3),A=oE(a),b=vE(a);xx(b),a.userData.terrain=b,a.userData.getHeightAt=(P=b==null?void 0:b.userData)==null?void 0:P.getHeightAt,typeof((le=b==null?void 0:b.userData)==null?void 0:le.getHeightAt)=="function"&&(a.userData.terrainHeightSampler=b.userData.getHeightAt);const E=new oe(-.4,-.3),_=new oe(-95.7,-3.1);yx(a,b,E,_,6,140);const M=await DE(a,{bounds:EE}),v=UE(a,{center:yn}),S=new ix;a.add(S.mesh);const D=h(),{curve:x}=NE(D,b);QE(D);const C=kE(D,b,x,{seed:42,buildingCount:140});S.fromStaticScene(a);const R=tx(D,{plazaLength:90,promenadeWidth:16,greensWidth:9,center:Bn,terrain:b}),U=new nx(s.domElement),O=new ax(U,S,{camera:u});D.add(O.object),O.object.position.set(0,0,10);const T=new gt;T.name="DemoDoor",T.position.set(-2,0,-12);const F=new Gt(1.2,2.4,.12),Q=new Ke({color:5911312}),X=new _e(F,Q);X.position.set(.6,1.2,0),X.castShadow=!0,X.receiveShadow=!0,T.add(X),T.userData.interactable=!0,T.userData.highlightTarget=X,T.userData.open=!1,T.userData.onUse=L=>{const K=!L.userData.open;L.userData.open=K,X.rotation.y=K?-Math.PI/2:0,console.log(`Door ${K?"opened":"closed"}`)},D.add(T);const k=new gt;k.name="DemoLamp",k.position.set(2,0,-12);const G=new Dt(.1,.1,3,12),j=new Ke({color:3158064}),J=new _e(G,j);J.position.y=1.5,J.castShadow=!1,k.add(J);const ne=new Ke({color:2236962,emissive:new Ae(16774581),emissiveIntensity:1.5}),W=new _e(new oi(.25,16,16),ne);W.position.y=3,W.castShadow=!1,k.add(W);const Z=new ls(16774581,1.5,12,2);Z.position.y=3,Z.castShadow=!0,k.add(Z),k.userData.interactable=!0,k.userData.highlightTarget=W,k.userData.light=Z,k.userData.onUse=L=>{const K=L.userData.light;if(!K)return;const $=K.intensity>.1;K.intensity=$?0:1.5,ne.emissiveIntensity=$?0:1.5,console.log(`Lamp ${$?"turned off":"turned on"}`)},D.add(k);const ce=()=>{const L=new gt;L.name="FallbackAvatar";const K=new Ke({color:5148407,metalness:.2,roughness:.6}),$=new _e(new Dt(.35,.35,1.2,16),K);$.castShadow=!0,$.receiveShadow=!0,$.position.y=.6,L.add($);const de=new _e(new oi(.32,16,16),new Ke({color:16054271,roughness:.4}));return de.castShadow=!0,de.position.y=1.32,L.add(de),L},ge=()=>{O.character&&(c(O.character),O.object.remove(O.character),O.character=void 0);const L=O.object.children.find(K=>K.name==="FallbackAvatar");L&&(c(L),O.object.remove(L))},pe=new lx,we=`${yi}models/character/hero.glb`,Qe="/models/character/hero.glb",De=`${yi}models/character/${encodeURIComponent("Hooded Adventurer.glb")}`,Je=`/models/character/${encodeURIComponent("Hooded Adventurer.glb")}`,z=()=>{ge();const L=ce();O.object.add(L),L.position.set(0,0,0)},zt=[we,Qe,De,Je].filter((L,K,$)=>L&&$.indexOf(L)===K);try{const{url:L,gltf:K,root:$}=await Po({renderer:s,urls:zt,targetHeight:1.8});ge(),pe.initializeFromGLTF($,K.animations),O.attachCharacter(pe),L!==we&&L!==Qe&&console.info(`Hero GLB not found at ${we}; using fallback avatar from ${L}.`),console.log("[Hero] Loaded:",L)}catch(L){console.error("[Hero] All candidates failed, using fallback avatar:",(L==null?void 0:L.message)||L),console.info(`Add your own hero model at ${we}.`),z()}const Se=new rx(S),Be=(he=b==null?void 0:b.userData)==null?void 0:he.getHeightAt;a.userData=a.userData||{},a.userData.terrain||(a.userData.terrain=b),typeof Be=="function"&&(a.userData.terrainHeightSampler=Be,typeof a.userData.getHeightAt!="function"&&(a.userData.getHeightAt=Be)),Se.clearBuildings(),J_();const Ee=new gt;Ee.name="BuildingsRoot",D.add(Ee);const At=[];if(R.walkingLoop){const L=dx(D,R.walkingLoop,{count:8,minSpeed:.7,maxSpeed:1.4,terrain:b});At.push(...L.updaters)}const Ge=(L={})=>{var vn,vs;const{baseRadius:K=2.6,columnHeight:$=4.8,capHeight:de=.9,textures:ke={}}=L,xe=new gt;xe.name="PlaceholderMonument";const He=!!L.collision;xe.userData.noCollision=!He;const $e=(Bt,{collidable:un=He}={})=>{Bt.castShadow=!0,Bt.receiveShadow=!0,Bt.userData.noCollision=!un},it=Tx(),ot={map:ke.map??it.map,normalMap:ke.normalMap??it.normalMap,roughnessMap:ke.roughnessMap??it.roughnessMap,aoMap:ke.aoMap??it.aoMap},Mt=L.baseMaterial??new Ke({map:ot.map,normalMap:ot.normalMap,roughnessMap:ot.roughnessMap,aoMap:ot.aoMap,aoMapIntensity:1,metalness:0,roughness:.68,color:new Ae(.95,.95,.95)}),et=typeof Mt.roughness=="number"?Mt.roughness:.45,Ot=typeof Mt.metalness=="number"?Mt.metalness:.05,xt=L.accentMaterial??(()=>{if(typeof Mt.clone=="function"){const Bt=Mt.clone();return Bt.color=new Ae(L.accentColor??13350814),Bt.roughness=L.accentRoughness??Math.max(0,et-.05),Bt}return new Ke({color:L.accentColor??13350814,roughness:L.accentRoughness??Math.max(0,et-.05),metalness:Ot,map:ot.map,normalMap:ot.normalMap,aoMap:ot.aoMap,roughnessMap:ot.roughnessMap})})(),ct=[],St=[.28,.24,.2],ui=[1.35,1.22,1.1];let Ct=0;St.forEach((Bt,un)=>{var Li;const vt=ui[un]??1,gn=new Dt(K*vt,K*(vt+.08),Bt,48);ct.push(gn);const di=new _e(gn,Mt);$e(di);const Kt=((Li=gn.parameters)==null?void 0:Li.height)??Bt;Ct+=Kt/2,di.position.y=Ct,Ct+=Kt/2,xe.add(di)});const Ks=.5,w=new Dt(K*1.02,K*1.08,Ks,48);ct.push(w);const N=new _e(w,xt);$e(N);const q=((vn=w.parameters)==null?void 0:vn.height)??Ks;Ct+=q/2,N.position.y=Ct,Ct+=q/2,xe.add(N);const Y=new Dt(K*.85,K*.9,$,64,1);ct.push(Y);const H=new _e(Y,Mt);$e(H),H.position.y=Ct+$/2,Ct+=$,xe.add(H);const fe=new Dt(K*1,K*1.2,de*.55,48);ct.push(fe);const ve=new _e(fe,xt);$e(ve);const Me=((vs=fe.parameters)==null?void 0:vs.height)??de*.55;ve.position.y=Ct+Me/2,Ct+=Me,xe.add(ve);const Re=de*.75,ze=new Es(K*1.05,Re,48,1,!1);ct.push(ze);const Pe=new _e(ze,Mt);$e(Pe),Pe.position.y=Ct+Re/2,Ct+=Re,xe.add(Pe);const Ne=new oi(K*.22,24,16);ct.push(Ne);const mt=new _e(Ne,xt);$e(mt,{collidable:!1}),mt.position.y=Ct+K*.22,Ct+=K*.22*2,xe.add(mt),ct.forEach(Bt=>{var vt;const un=(vt=Bt.attributes)==null?void 0:vt.uv;un&&Bt.setAttribute("uv2",un.clone())});const wt=new _e(new tc(K*1.1,K*1.75,64),new Mn({color:0,transparent:!0,opacity:.12,side:sn,depthWrite:!1}));wt.rotation.x=-Math.PI/2,wt.position.y=.015,wt.renderOrder=1,wt.castShadow=!1,wt.receiveShadow=!1,wt.userData.noCollision=!0,xe.add(wt);const pt=new Uu(16773336,1.15,42,Math.PI/5,.35,1.2);pt.position.set(6,Ct*.5+5,6),pt.castShadow=!0,pt.shadow.mapSize.set(1024,1024),pt.shadow.bias=-5e-4,pt.userData.noCollision=!0,xe.add(pt);const tn=new Ze;tn.position.set(0,Ct*.5,0),tn.userData.noCollision=!0,xe.add(tn),pt.target=tn;const lt=new ls(13162239,.36,20,1.6);lt.position.set(-4,Ct*.4+3.5,-3),lt.castShadow=!1,lt.userData.noCollision=!0,xe.add(lt);const Ue=new ls(16775132,.58,18,1.4);if(Ue.position.set(0,Ct*.6+2.4,0),Ue.castShadow=!0,Ue.shadow.mapSize.set(512,512),Ue.shadow.bias=-6e-4,Ue.userData.noCollision=!0,xe.add(Ue),L.position instanceof y)xe.position.copy(L.position);else if(L.position&&typeof L.position=="object"){const{x:Bt=0,y:un=0,z:vt=0}=L.position;xe.position.set(Bt,un,vt)}typeof L.rotateY=="number"&&(xe.rotation.y=L.rotateY),L.scale instanceof y?xe.scale.copy(L.scale):typeof L.scale=="number"&&xe.scale.setScalar(L.scale);const ys=xe.position.x,yt=xe.position.z;return kh(xe,b,ys,yt,.05,{clampToSea:!0,seaLevel:nn,minAboveSea:.02}),D.add(xe),He&&S.refresh(),xe},B=`${yi}models/buildings/`,I=L=>{if(!L)return null;if(L.isVector3)return L.clone();if(Array.isArray(L))return new y(L[0]??0,L[1]??0,L[2]??0);if(typeof L=="object"){const{x:K=0,y:$=0,z:de=0}=L;return new y(K,$,de)}return new y(0,0,0)},V=(L={},K={})=>{var de,ke;const $={...L};if(L.position){const xe=I(L.position);if(xe){const He=(de=b==null?void 0:b.userData)==null?void 0:de.getHeightAt,$e=K.surfaceOffset??.05;if(K.alignToTerrain!==!1&&typeof He=="function"){const ot=He(xe.x,xe.z);Number.isFinite(ot)?xe.y=ot+$e:Number.isFinite(xe.y)||(xe.y=$e)}else Number.isFinite(xe.y)||(xe.y=$e)}$.position=xe}return!$.parent&&Ee&&($.parent=Ee),$.heightSampler||($.heightSampler=L.heightSampler??L.terrainSampler??Be??((ke=b==null?void 0:b.userData)==null?void 0:ke.getHeightAt)),$},ie=(L,K,$=.05)=>{let de=$;if(typeof Be=="function"){const ke=Be(L,K);Number.isFinite(ke)&&(de=ke+$)}return new y(L,de,K)},ee=[{url:`${B}poseidon_temple_at_sounion_greece.glb`,position:ie(-34,-12),rotateY:-Math.PI*.12,scale:.32,collision:!0,name:"SamplePoseidonTemple"},{url:`${B}Akropol.glb`,position:ie(6,-42),rotateY:Math.PI*.08,scale:.24,collision:!1,name:"SampleAkropol"}];(await Promise.allSettled(ee.map(L=>Se.loadBuilding(L.url,{position:L.position,rotateY:L.rotateY,scale:L.scale,collision:L.collision,parent:Ee,heightSampler:Be}).then(K=>(K&&L.name&&(K.name=L.name),K))))).forEach((L,K)=>{L.status==="rejected"&&console.error(`Sample building failed to load: ${ee[K].url}`,L.reason)});async function Ce(L,K,$,de){if(!L)return null;const{getHeightAt:ke}=L.userData||{},xe=typeof ke=="function"?ke($,de):null,He=Number.isFinite(xe)?xe+.05:0,$e=[`${yi}models/landmarks/aristotle_tomb.glb`,"/models/landmarks/aristotle_tomb.glb",`${yi}models/buildings/aristotle-tomb.glb`,"/models/buildings/aristotle-tomb.glb",`${yi}models/buildings/Akropol.glb`,"/models/buildings/Akropol.glb"];try{const{url:it,root:ot}=await Po({renderer:K,urls:$e,targetHeight:4});ot.position.set($,He,de);const Mt=!0;return ot.userData=ot.userData||{},ot.userData.noCollision=!Mt,ot.traverse(et=>{et!=null&&et.isMesh&&(et.castShadow=!0,et.receiveShadow=!0,et.userData=et.userData||{},et.userData.noCollision=!Mt)}),ot.name="AristotleTomb",L.add(ot),Mt&&typeof(S==null?void 0:S.refresh)=="function"&&S.refresh(),!it.includes("aristotle_tomb.glb")&&!it.includes("aristotle-tomb.glb")?console.info(`Aristotle's Tomb loaded from fallback candidate ${it}.`):console.log("[Landmark] Aristotle's Tomb loaded from",it),ot}catch(it){const ot=(it==null?void 0:it.message)||it;return console.error("[Landmark] Failed to load Aristotle's Tomb model:",ot),Ge({position:new y($,He,de),rotateY:Math.PI*.15,scale:1.2,collision:!0}),null}}await Ce(a,s,6,-28);const ue=(L=[])=>L.map(K=>K?/^https?:/i.test(K)||K.startsWith(yi)||K.startsWith("/")?K:`${B}${K}`:null).filter(Boolean),me=async L=>{const K=L.displayName??L.name??"Building",$=V(L.options??{},L),de=V({...L.options??{},...L.placeholderOptions??{}},L),ke=ue(L.files??[]),xe=ue(L.fallbackFiles??[]),He=et=>{if(!et||L.snapToGround===!1||!($!=null&&$.position))return;const{x:Ot,z:xt}=$.position,ct=L.surfaceOffset??.05,St={clampToSea:!0,seaLevel:nn,minAboveSea:L.minAboveSea??.02,...L.snapOptions??{}};kh(et,b,Ot,xt,ct,St)},$e=()=>{const et={};if($.position&&(et.position=$.position),$.scale!==void 0&&(et.scale=$.scale),$.rotation){const{x:Ot,y:xt,z:ct}=$.rotation;[Ot,xt,ct].some(St=>Number.isFinite(St))&&(et.rotation={x:Ot,y:xt,z:ct})}else{const Ot={};let xt=!1;const ct=[["rotateX","x"],["rotateY","y"],["rotateZ","z"]];for(const[St,ui]of ct){const Ct=$[St];Number.isFinite(Ct)&&(Ot[ui]=Ct,xt=!0)}xt&&(et.rotation=Ot)}return et},it=et=>{var xt;if(!et)return;const Ot=!!($!=null&&$.collision);(xt=et.traverse)==null||xt.call(et,ct=>{ct!=null&&ct.isMesh&&(ct.userData=ct.userData||{},ct.userData.noCollision=!Ot)}),Ot&&typeof(S==null?void 0:S.refresh)=="function"&&S.refresh()},ot=async(et,Ot)=>{if(!et.length)return null;const xt=await Mx(et);if(!xt)return null;try{const ct=$e(),St=await j_(D,xt,ct);if(!St)return null;if(L.name&&(!St.name||St.name==="")&&(St.name=L.name),He(St),it(St),typeof L.onLoaded=="function")try{L.onLoaded(St,{url:xt,label:Ot})}catch(ui){console.warn(`loadBuildingPlacement onLoaded hook failed for ${K}`,ui)}return St}catch(ct){const St=Ot==="fallback"?"Fallback":"";return console.error(`${St?`${St} `:""}${K} failed to load from ${xt}`,ct),null}};let Mt=await ot(ke,"primary");return!Mt&&xe.length&&(L.missingPrimaryMessage&&console.info(L.missingPrimaryMessage),Mt=await ot(xe,"fallback"),Mt?L.fallbackMessage&&console.info(L.fallbackMessage):L.fallbackFailureMessage&&console.error(L.fallbackFailureMessage)),Mt||(!xe.length&&L.missingPrimaryMessage&&console.info(L.missingPrimaryMessage),L.allMissingMessage&&console.info(L.allMissingMessage),L.spawnPlaceholder!==!1&&Ge({...de,collision:L.placeholderCollision??de.collision??$.collision})),Mt},Te=`${B}Akropol.glb`,Ve=`${B}poseidon_temple_at_sounion_greece.glb`,te=[{name:"acropolis",displayName:"Acropolis",files:["Akropol.glb"],options:{position:Vs.clone(),rotateY:Math.PI*.22,scale:.45,collision:!0},surfaceOffset:.18,snapOptions:{minAboveSea:.5},missingPrimaryMessage:`Akropol asset missing at ${Te}; add it under public/models/buildings/ to replace the placeholder.`},{name:"poseidon-temple",displayName:"Temple of Poseidon",files:["poseidon_temple_at_sounion_greece.glb"],options:{position:new y(-150,0,42),rotateY:-Math.PI*.35,scale:.38,collision:!0},surfaceOffset:.08,snapOptions:{minAboveSea:.05},missingPrimaryMessage:`Poseidon temple model missing at ${Ve}; add it under public/models/buildings/ to replace the placeholder.`}];for(const L of te)await me(L);const tt=cE(s,u,a),We=new Qu,Le=Lx(),ye={timeOfDayPhase:0};ka(ye,0);const be=L=>{const K=Hh[L];if(!K)return;const $=ka(ye,K.phase);s.toneMappingExposure=K.exposure,console.log(`[HUD] preset: ${L}`);const de=$l(d,ye);th(f,de),ph(v,f.nightFactor),mh(C,f.nightFactor),eh(g,$),nh(A,de),uh(M,0,de,f.nightFactor);const ke=i($);ke!==r&&(n.textContent=`Time: ${ke}`,r=ke),s.render(a,u)};function Oe(){requestAnimationFrame(Oe);const L=We.getDelta(),K=We.elapsedTime;if(Le.secondsPerDay>0){const He=L/Le.secondsPerDay,$e=(ye.timeOfDayPhase??0)+He,it=$e-Math.floor($e);ka(ye,it)}const $=ye.timeOfDayPhase??0,de=$l(d,ye);th(f,de),ph(v,f.nightFactor),mh(C,f.nightFactor),eh(g,$),nh(A,de),CE(b,K),uh(M,L,de,f.nightFactor),p.update(O==null?void 0:O.position),O.update(L);for(const He of At)He(L);const ke=tt.updateHover();t.style.opacity=ke?"1":"0";const xe=i($);xe!==r&&(n.textContent=`Time: ${xe}`,r=xe),s.render(a,u)}Oe();const nt=()=>{try{if(O&&O.position&&Number.isFinite(O.position.x))return O.position}catch{}return(u==null?void 0:u.position)??{x:0,y:0,z:0}},_t=()=>{try{const L=new y(0,0,-1);return L.applyQuaternion(u.quaternion),L.y=0,L.normalize(),L}catch{return{x:0,y:0,z:1}}},qe=L=>{var de,ke;const K=_x(D,L),$=(ke=(de=b==null?void 0:b.userData)==null?void 0:de.getHeightAt)==null?void 0:ke.call(de,L.x,L.z);Number.isFinite($)&&(K.position.y=$)};Wh({queryKey:"hud",windowFlagKey:"SHOW_HUD"})&&(console.log("[HUD] mounting…"),Ex({getPosition:nt,getDirection:_t,onPin:qe,lightingPresets:Hh,onSetLightingPreset:be})),s.domElement.addEventListener("pointerdown",L=>{L.button===0&&tt.useObject()}),window.addEventListener("keydown",L=>{L.code==="KeyE"&&tt.useObject()}),window.addEventListener("resize",()=>{u.aspect=window.innerWidth/window.innerHeight,u.updateProjectionMatrix(),s.setSize(window.innerWidth,window.innerHeight)})}(async()=>{try{await Px(),console.log("✅ mainApp loaded successfully")}catch(s){console.error("❌ Error in mainApp:",s)}})();
