import {describe,it,expect} from 'vitest';
import {level1} from '../src/game/levels/level1';
import {chooseSafeRecovery,jumpCanReach,riseTide} from '../src/game/systems/GameplayRules';
const tuning={runSpeed:175,jumpVelocity:-455,gravity:950};
describe('Level 1 gameplay rules',()=>{
 it('keeps each major Shore jump within one automatic run arc',()=>{const route=level1.platforms.filter(p=>/^p\d$/.test(p.id)).sort((a,b)=>a.x-b.x);for(let i=0;i<route.length-1;i++)expect(jumpCanReach(route[i]!,route[i+1]!,tuning),`${route[i]!.id} → ${route[i+1]!.id}`).toBe(true)});
 it('rises steadily and slows while Tide Calm is active',()=>{expect(riseTide(700,1000,5)).toBe(695);expect(riseTide(700,1000,5,true)).toBe(697.75)});
 it('chooses a dry recovery ledge and falls back from a submerged checkpoint',()=>{const preferred=level1.platforms.find(p=>p.id==='p0')!;const result=chooseSafeRecovery(level1.platforms,'p0','p3',600);expect(result?.id).not.toBe(preferred.id);expect(result!.y).toBeLessThan(576);});
});
