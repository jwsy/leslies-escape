import {describe,it,expect} from 'vitest';
import {level1} from '../src/game/levels/level1';
import {level2} from '../src/game/levels/level2';
import {level3} from '../src/game/levels/level3';
import {cameraFollowOffset,chargedJumpMultiplier,chooseSwimTarget,CRUMBLE_DELAY_MS,jumpCanReach,powerJumpUnlocked,recoveryLandingX,recoveryPlayerY,riseTide,SPIKE_PLATFORM_CLEARANCE,swimStep,visibleWaterY,POWER_JUMP_HOLD_DELAY_MS,POWER_JUMP_CHARGE_MS,PLAYER_BODY_RADIUS,PLAYER_FEET_OFFSET} from '../src/game/systems/GameplayRules';
const tuning={runSpeed:175,jumpVelocity:-455,gravity:950};
type JumpResult='miss'|'hazard'|string;
function simulateArcLanding(level:typeof level2|typeof level3,source:typeof level2.platforms[number],target:typeof level2.platforms[number],startX:number):JumpResult{
 const dt=1/120,steps=240;let x=startX,y=source.y-PLAYER_FEET_OFFSET,vy=tuning.jumpVelocity;
 for(let i=0;i<steps;i++){
  const previousBottom=y+PLAYER_FEET_OFFSET;vy+=tuning.gravity*dt;y+=vy*dt;x+=tuning.runSpeed*dt;
  const cx=x,cy=y+3;
  for(const spike of level.hazards){const dx=Math.max(Math.abs(cx-spike.x)-spike.width/2,0),dy=Math.max(Math.abs(cy-spike.y)-8.5,0);if(dx*dx+dy*dy<=PLAYER_BODY_RADIUS**2)return'hazard';}
  if(vy>0){for(const platform of level.platforms){const overlapsX=x+PLAYER_BODY_RADIUS>=platform.x&&x-PLAYER_BODY_RADIUS<=platform.x+platform.width;if(overlapsX&&previousBottom<=platform.y&&y+PLAYER_FEET_OFFSET>=platform.y)return platform.id;}}
 }
 return'miss';
}
describe('Level 1 gameplay rules',()=>{
 it('has a longer, steadily rising route with varied platform lengths and balanced reachable gaps',()=>{const route=level1.platforms.filter(p=>/^p\d+$/.test(p.id)).sort((a,b)=>a.x-b.x);expect(route.length).toBeGreaterThanOrEqual(10);expect(new Set(route.map(p=>p.width)).size).toBeGreaterThanOrEqual(5);for(let i=0;i<route.length-1;i++){const gap=route[i+1]!.x-(route[i]!.x+route[i]!.width);expect(route[i]!.y).toBeGreaterThan(route[i+1]!.y);expect(gap).toBeGreaterThanOrEqual(50);expect(gap).toBeLessThanOrEqual(60);expect(jumpCanReach(route[i]!,route[i+1]!,tuning),`${route[i]!.id} → ${route[i+1]!.id}`).toBe(true)}});
 it('keeps spikes out of the first round',()=>expect(level1.hazards).toHaveLength(0));
 it('rises steadily and slows while Tide Calm is active',()=>{expect(riseTide(700,1000,5)).toBe(695);expect(riseTide(700,1000,5,true)).toBe(697.75)});
 it('swims back to the previous dry platform and finds another dry ledge when both the prior ledge and checkpoint are submerged',()=>{expect(chooseSwimTarget(level1.platforms,'p7','p4',1820,900)?.id).toBe('p7');expect(chooseSwimTarget(level1.platforms,'p8','p4',2000,340)?.id).toBe('p9');});
 it('moves through the water toward a ledge without teleporting or overshooting',()=>{const halfway=swimStep(600,400,220,500);expect(halfway).toBe(490);expect(swimStep(halfway,400,220,600)).toBe(400);});
 it('climbs out near the left edge to leave room for another jump',()=>{const ledge=level1.platforms.find(p=>p.id==='p4')!;expect(recoveryLandingX(ledge)).toBe(ledge.x+24);});
});
describe('Chapter route safety',()=>{
 const levels=[level2,level3];
 it.each(levels)('$title has a fully reachable ascending route',level=>{const route=level.platforms.slice().sort((a,b)=>a.x-b.x);for(let i=0;i<route.length-1;i++){const from=route[i]!,to=route[i+1]!;expect(to.y,`${from.id} → ${to.id} rises`).toBeLessThan(from.y);expect(to.x,`${from.id} → ${to.id} does not overlap`).toBeGreaterThanOrEqual(from.x+from.width);expect(jumpCanReach(from,to,tuning),`${from.id} → ${to.id} jump reach`).toBe(true);}});
 it.each(levels)('$title gives every spike at least double clearance on a stable long platform',level=>{expect(level.hazards.length).toBeGreaterThan(0);for(const spike of level.hazards){const platform=level.platforms.find(p=>Math.abs(p.y-(spike.y+19))<2);expect(platform,`spike at x=${spike.x} is on a platform`).toBeDefined();const ledge=platform!;const half=spike.width/2;expect(ledge.kind,`${ledge.id} must remain solid while jumping`).not.toBe('crumble');expect(ledge.width,`${ledge.id} spike platform minimum length`).toBeGreaterThanOrEqual(440);expect(spike.x-half-ledge.x,`${ledge.id} approach clearance`).toBeGreaterThanOrEqual(SPIKE_PLATFORM_CLEARANCE);expect(ledge.x+ledge.width-(spike.x+half),`${ledge.id} landing clearance`).toBeGreaterThanOrEqual(SPIKE_PLATFORM_CLEARANCE);}});
 it.each(levels)('$title has a generous per-frame safe landing window for every jump',level=>{const route=level.platforms.slice().sort((a,b)=>a.x-b.x);for(let i=0;i<route.length-1;i++){const source=route[i]!,target=route[i+1]!;let safeLaunches=0;for(let startX=source.x-12;startX<=source.x+source.width+34;startX+=2){if(simulateArcLanding(level,source,target,startX)===target.id)safeLaunches++;}expect(safeLaunches,`${source.id} → ${target.id} safe launch window`).toBeGreaterThanOrEqual(8);}});
 it.each(levels)('$title leaves time to begin charging safely after swimming onto a spike ledge',level=>{for(const spike of level.hazards){const ledge=level.platforms.find(p=>Math.abs(p.y-(spike.y+19))<2)!;const safeRunway=spike.x-spike.width/2-recoveryLandingX(ledge)-tuning.runSpeed*POWER_JUMP_HOLD_DELAY_MS/1000;expect(safeRunway,`${ledge.id} recovery runway after charge delay`).toBeGreaterThanOrEqual(14);}});
 it('never selects a submerged or crumbling ledge for swim recovery',()=>{const ledge=chooseSwimTarget(level2.platforms,'p5','p3',1500,700);expect(ledge?.kind).not.toBe('crumble');expect(ledge?.x).toBeLessThanOrEqual(1524);expect(chooseSwimTarget([{id:'safe',x:100,y:400,width:120},{id:'crumble',x:250,y:450,width:440,kind:'crumble'}],'crumble','safe',300,800)?.id).toBe('safe');});
 it('places recovered bunny feet on the platform top and leaves enough time to charge before a crumble collapses',()=>{const p=level2.platforms[0]!;expect(recoveryPlayerY(p.y)+PLAYER_FEET_OFFSET).toBe(p.y);expect(CRUMBLE_DELAY_MS).toBeGreaterThan(POWER_JUMP_HOLD_DELAY_MS+POWER_JUMP_CHARGE_MS);});
});
describe('Charged jump and visible tide',()=>{
 it('unlocks a slower, longer charge after five rescues and caps the hold bonus',()=>{expect(powerJumpUnlocked(4)).toBe(false);expect(powerJumpUnlocked(5)).toBe(true);expect(chargedJumpMultiplier(0)).toBe(1);expect(chargedJumpMultiplier(299)).toBe(1);expect(chargedJumpMultiplier(300)).toBe(1);expect(chargedJumpMultiplier(1000)).toBeCloseTo(1.24);expect(chargedJumpMultiplier(1700)).toBeCloseTo(1.48);});
 it('lets the sea horizon rise on screen while camera tracks Leslie',()=>{expect(visibleWaterY(1120,600,540)).toBe(1044);expect(visibleWaterY(1000,600,540,96,120)).toBe(924);expect(visibleWaterY(800,600,540)).toBe(800);});
 it('frames Leslie low-left so the next ascending platform remains above her and in view',()=>{const offset=cameraFollowOffset(960,540);const playerX=480+offset.x,playerY=270+offset.y;expect(playerX).toBeCloseTo(403.2);expect(playerY).toBeCloseTo(367.2);expect(playerY-75).toBeGreaterThan(80);expect(playerY-75).toBeLessThan(540);});
});
