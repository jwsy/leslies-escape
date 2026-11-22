import type { PlatformDef } from '../levels/types';
export interface JumpTuning{runSpeed:number;jumpVelocity:number;gravity:number;}
/** Descending time at which a fixed jump arc reaches a platform above takeoff. */
export function landingTimeForRise(rise:number,t:JumpTuning){const a=t.gravity/2,b=t.jumpVelocity,c=rise;const disc=b*b-4*a*c;if(disc<0)return null;const descending=(-b+Math.sqrt(disc))/(2*a);return descending>0?descending:null;}
export function jumpCanReach(source:PlatformDef,target:PlatformDef,t:JumpTuning){const rise=source.y-target.y,flight=landingTimeForRise(rise,t);if(flight===null||rise<0)return false;const gap=Math.max(0,target.x-(source.x+source.width));return gap<=t.runSpeed*flight+14;}
export function riseTide(y:number,dtMs:number,speed:number,calm=false){return y-speed*dtMs/1000*(calm?.45:1);}
export function chooseSafeRecovery(platforms:PlatformDef[],preferredId:string,checkpointId:string,waterY:number,margin=24){const safe=(p:PlatformDef|undefined)=>p&&p.y<waterY-margin?p:undefined;return safe(platforms.find(p=>p.id===preferredId))??safe(platforms.find(p=>p.id===checkpointId))??platforms.filter(p=>p.y<waterY-margin).sort((a,b)=>b.y-a.y)[0]??null;}
/** Selects a dry ledge behind Leslie so recovery swims back through the current section. */
export function chooseSwimTarget(platforms:PlatformDef[],lastPlatform:string,checkpointId:string,playerX:number,waterY:number,margin=24){const safe=(p:PlatformDef|undefined)=>p&&p.y<waterY-margin?p:undefined;const checkpoint=safe(platforms.find(p=>p.id===checkpointId));const last=safe(platforms.find(p=>p.id===lastPlatform));if(last&&last.x<=playerX+24)return last;const checkpointX=platforms.find(p=>p.id===checkpointId)?.x??0;const prior=platforms.filter(p=>p.x>=checkpointX&&p.x<=playerX+24&&safe(p)).sort((a,b)=>b.x-a.x)[0];const anyPrior=platforms.filter(p=>p.x<=playerX+24&&safe(p)).sort((a,b)=>b.x-a.x)[0];const nearestSafe=platforms.filter(p=>safe(p)).sort((a,b)=>Math.abs(a.x-playerX)-Math.abs(b.x-playerX))[0];return prior??(checkpoint&&checkpoint.x<=playerX+24?checkpoint:undefined)??anyPrior??nearestSafe??null;}
export function swimStep(x:number,targetX:number,speed:number,dtMs:number){return x+Math.sign(targetX-x)*Math.min(Math.abs(targetX-x),speed*dtMs/1000);}
export function recoveryLandingX(platform:PlatformDef,inset=24){return platform.x+Math.min(inset,platform.width/3);}
/** Keep a calm, visible sea horizon just inside the lower edge of the camera. */
export function visibleWaterY(waterY:number,cameraY:number,viewHeight:number,bottomMargin=96){return Math.min(waterY,cameraY+viewHeight-bottomMargin);}
/** Five rescues unlock a charged jump; a short hold is still a normal hop. */
export function powerJumpUnlocked(rescuedCount:number){return rescuedCount>=5;}
export function chargedJumpMultiplier(heldMs:number,maxHoldMs=850,maxMultiplier=1.48){return 1+(maxMultiplier-1)*Math.max(0,Math.min(1,heldMs/maxHoldMs));}
