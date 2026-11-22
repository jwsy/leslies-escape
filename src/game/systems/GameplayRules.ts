import type { PlatformDef } from '../levels/types';
export interface JumpTuning{runSpeed:number;jumpVelocity:number;gravity:number;}
/** Descending time at which a fixed jump arc reaches a platform above takeoff. */
export function landingTimeForRise(rise:number,t:JumpTuning){const a=t.gravity/2,b=t.jumpVelocity,c=rise;const disc=b*b-4*a*c;if(disc<0)return null;const descending=(-b+Math.sqrt(disc))/(2*a);return descending>0?descending:null;}
export function jumpCanReach(source:PlatformDef,target:PlatformDef,t:JumpTuning){const rise=source.y-target.y,flight=landingTimeForRise(rise,t);if(flight===null||rise<0)return false;const gap=Math.max(0,target.x-(source.x+source.width));return gap<=t.runSpeed*flight+14;}
export function riseTide(y:number,dtMs:number,speed:number,calm=false){return y-speed*dtMs/1000*(calm?.45:1);}
export function chooseSafeRecovery(platforms:PlatformDef[],preferredId:string,checkpointId:string,waterY:number,margin=24){const safe=(p:PlatformDef|undefined)=>p&&p.y<waterY-margin?p:undefined;return safe(platforms.find(p=>p.id===preferredId))??safe(platforms.find(p=>p.id===checkpointId))??platforms.filter(p=>p.y<waterY-margin).sort((a,b)=>b.y-a.y)[0]??null;}
