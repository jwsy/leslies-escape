import {describe,it,expect} from 'vitest';
import {level1} from '../src/game/levels/level1';
import {chooseSwimTarget,jumpCanReach,recoveryLandingX,riseTide,swimStep} from '../src/game/systems/GameplayRules';
const tuning={runSpeed:175,jumpVelocity:-455,gravity:950};
describe('Level 1 gameplay rules',()=>{
 it('has a longer, steadily rising route with varied platform lengths and balanced reachable gaps',()=>{const route=level1.platforms.filter(p=>/^p\d+$/.test(p.id)).sort((a,b)=>a.x-b.x);expect(route.length).toBeGreaterThanOrEqual(10);expect(new Set(route.map(p=>p.width)).size).toBeGreaterThanOrEqual(5);for(let i=0;i<route.length-1;i++){const gap=route[i+1]!.x-(route[i]!.x+route[i]!.width);expect(route[i]!.y).toBeGreaterThan(route[i+1]!.y);expect(gap).toBeGreaterThanOrEqual(50);expect(gap).toBeLessThanOrEqual(60);expect(jumpCanReach(route[i]!,route[i+1]!,tuning),`${route[i]!.id} → ${route[i+1]!.id}`).toBe(true)}});
 it('keeps spikes out of the first round',()=>expect(level1.hazards).toHaveLength(0));
 it('rises steadily and slows while Tide Calm is active',()=>{expect(riseTide(700,1000,5)).toBe(695);expect(riseTide(700,1000,5,true)).toBe(697.75)});
 it('swims back to the previous dry platform and finds another dry ledge when both the prior ledge and checkpoint are submerged',()=>{expect(chooseSwimTarget(level1.platforms,'p7','p4',1820,900)?.id).toBe('p7');expect(chooseSwimTarget(level1.platforms,'p8','p4',2000,340)?.id).toBe('p9');});
 it('moves through the water toward a ledge without teleporting or overshooting',()=>{const halfway=swimStep(600,400,220,500);expect(halfway).toBe(490);expect(swimStep(halfway,400,220,600)).toBe(400);});
 it('climbs out near the left edge to leave room for another jump',()=>{const ledge=level1.platforms.find(p=>p.id==='p4')!;expect(recoveryLandingX(ledge)).toBe(ledge.x+24);});
});
