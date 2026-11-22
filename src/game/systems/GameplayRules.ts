import type { PlatformDef } from '../levels/types';
export interface JumpTuning{runSpeed:number;jumpVelocity:number;gravity:number;}
/** Descending time at which a fixed jump arc reaches a platform above takeoff. */
export function landingTimeForRise(rise:number,t:JumpTuning){const a=t.gravity/2,b=t.jumpVelocity,c=rise;const disc=b*b-4*a*c;if(disc<0)return null;const descending=(-b+Math.sqrt(disc))/(2*a);return descending>0?descending:null;}
export function jumpCanReach(source:PlatformDef,target:PlatformDef,t:JumpTuning){const rise=source.y-target.y,flight=landingTimeForRise(rise,t);if(flight===null||rise<0)return false;const gap=Math.max(0,target.x-(source.x+source.width));return gap<=t.runSpeed*flight+14;}
export function riseTide(y:number,dtMs:number,speed:number,calm=false){return y-speed*dtMs/1000*(calm?.45:1);}
/** Hold the waterline below Leslie's current ledge while she is safely running. */
export function keepTideBelowPlatform(waterY:number,platformY:number,clearance=48){return Math.max(waterY,platformY+clearance);}
export function chooseSafeRecovery(platforms:PlatformDef[],preferredId:string,checkpointId:string,waterY:number,margin=24){const safe=(p:PlatformDef|undefined)=>p&&p.y<waterY-margin?p:undefined;return safe(platforms.find(p=>p.id===preferredId))??safe(platforms.find(p=>p.id===checkpointId))??platforms.filter(p=>p.y<waterY-margin).sort((a,b)=>b.y-a.y)[0]??null;}
/** Selects a dry ledge behind Leslie so recovery swims back through the current section. */
export function chooseSwimTarget(platforms:PlatformDef[],lastPlatform:string,checkpointId:string,playerX:number,waterY:number,margin=24){const safe=(p:PlatformDef|undefined)=>p&&p.kind!=='crumble'&&p.y<waterY-margin?p:undefined;const checkpoint=safe(platforms.find(p=>p.id===checkpointId));const last=safe(platforms.find(p=>p.id===lastPlatform));if(last&&last.x<=playerX+24)return last;const checkpointX=platforms.find(p=>p.id===checkpointId)?.x??0;const prior=platforms.filter(p=>p.x>=checkpointX&&p.x<=playerX+24&&safe(p)).sort((a,b)=>b.x-a.x)[0];const anyPrior=platforms.filter(p=>p.x<=playerX+24&&safe(p)).sort((a,b)=>b.x-a.x)[0];const nearestSafe=platforms.filter(p=>safe(p)).sort((a,b)=>Math.abs(a.x-playerX)-Math.abs(b.x-playerX))[0];return prior??(checkpoint&&checkpoint.x<=playerX+24?checkpoint:undefined)??anyPrior??nearestSafe??null;}
export function swimStep(x:number,targetX:number,speed:number,dtMs:number){return x+Math.sign(targetX-x)*Math.min(Math.abs(targetX-x),speed*dtMs/1000);}
export function recoveryLandingX(platform:PlatformDef,inset=24){return platform.x+Math.min(inset,platform.width/3);}
/** Keep the real tide horizon visible at the bottom only while its world surface is outside the camera. */
export function visibleWaterY(waterY:number,cameraY:number,viewHeight:number,bottomMargin=96){return Math.min(waterY,cameraY+viewHeight-bottomMargin);}
/** Offset Phaser's follow target so Leslie sits low-left with room to see the next ledge. */
export function cameraFollowOffset(width:number,height:number,focusX=.42,focusY=.68){return{x:width*focusX-width/2,y:height*focusY-height/2};}
/** Five rescues unlock a charged jump; a short hold is still a normal hop. */
export function powerJumpUnlocked(rescuedCount:number){return rescuedCount>=5;}
export const POWER_JUMP_HOLD_DELAY_MS=300;
export const POWER_JUMP_CHARGE_MS=1400;
export const SPIKE_PLATFORM_CLEARANCE=96;
export const PLAYER_BODY_RADIUS=14;
export const PLAYER_BODY_OFFSET_Y=5;
// The hidden Phaser sprite uses the 32×32 missing texture with center origin.
export const PLAYER_FEET_OFFSET=PLAYER_BODY_OFFSET_Y+PLAYER_BODY_RADIUS*2-16;
export const CRUMBLE_DELAY_MS=2200;
export function recoveryPlayerY(platformY:number){return platformY-PLAYER_FEET_OFFSET;}
export function chargedJumpMultiplier(heldMs:number,maxHoldMs=POWER_JUMP_CHARGE_MS,maxMultiplier=1.48,holdDelayMs=POWER_JUMP_HOLD_DELAY_MS){return 1+(maxMultiplier-1)*Math.max(0,Math.min(1,(heldMs-holdDelayMs)/maxHoldMs));}
