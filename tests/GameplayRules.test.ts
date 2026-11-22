import {describe,it,expect} from 'vitest';
import {level1} from '../src/game/levels/level1';
import {level2} from '../src/game/levels/level2';
import {level3} from '../src/game/levels/level3';
import {chargedJumpMultiplier,chooseSwimTarget,jumpCanReach,powerJumpUnlocked,recoveryLandingX,riseTide,SPIKE_PLATFORM_CLEARANCE,swimStep,visibleWaterY,POWER_JUMP_HOLD_DELAY_MS} from '../src/game/systems/GameplayRules';
const tuning={runSpeed:175,jumpVelocity:-455,gravity:950};
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
 it.each(levels)('$title gives every spike at least double clearance on a longer platform',level=>{expect(level.hazards.length).toBeGreaterThan(0);for(const spike of level.hazards){const platform=level.platforms.find(p=>Math.abs(p.y-(spike.y+19))<2);expect(platform,`spike at x=${spike.x} is on a platform`).toBeDefined();const ledge=platform!;const half=spike.width/2;expect(ledge.width,`${ledge.id} spike platform minimum length`).toBeGreaterThanOrEqual(440);expect(spike.x-half-ledge.x,`${ledge.id} approach clearance`).toBeGreaterThanOrEqual(SPIKE_PLATFORM_CLEARANCE);expect(ledge.x+ledge.width-(spike.x+half),`${ledge.id} landing clearance`).toBeGreaterThanOrEqual(SPIKE_PLATFORM_CLEARANCE);}});
 it.each(levels)('$title leaves time to begin charging safely after swimming onto a spike ledge',level=>{for(const spike of level.hazards){const ledge=level.platforms.find(p=>Math.abs(p.y-(spike.y+19))<2)!;const safeRunway=spike.x-spike.width/2-recoveryLandingX(ledge)-tuning.runSpeed*POWER_JUMP_HOLD_DELAY_MS/1000;expect(safeRunway,`${ledge.id} recovery runway after charge delay`).toBeGreaterThanOrEqual(14);}});
 it('never selects a submerged previous ledge and swims toward a reachable ledge behind Leslie when possible',()=>{const ledge=chooseSwimTarget(level2.platforms,'p8','p3',1920,510);expect(ledge?.id).toBe('p6');expect(ledge?.x).toBeLessThanOrEqual(1944);expect(ledge?.y).toBeLessThan(486);});
});
describe('Charged jump and visible tide',()=>{
 it('unlocks a slower, longer charge after five rescues and caps the hold bonus',()=>{expect(powerJumpUnlocked(4)).toBe(false);expect(powerJumpUnlocked(5)).toBe(true);expect(chargedJumpMultiplier(0)).toBe(1);expect(chargedJumpMultiplier(299)).toBe(1);expect(chargedJumpMultiplier(300)).toBe(1);expect(chargedJumpMultiplier(1000)).toBeCloseTo(1.24);expect(chargedJumpMultiplier(1700)).toBeCloseTo(1.48);});
 it('keeps the sea horizon inside the lower camera view until the actual tide rises higher',()=>{expect(visibleWaterY(1120,600,540)).toBe(1044);expect(visibleWaterY(800,600,540)).toBe(800);});
});
