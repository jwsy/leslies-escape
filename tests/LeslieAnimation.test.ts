import { describe, expect, it } from 'vitest';
import { LeslieAnimation } from '../src/game/characters/LeslieAnimation';
import atlas from '../src/game/characters/leslieFrames.json';

const run = { vx: 175, vy: 0, grounded: true, swimming: false };
const air = (vy: number) => ({ ...run, grounded: false, vy });

describe('Leslie’s pose timing', () => {
  it('reads takeoff even with a stale floor flag, holds the apex, and catches the landing', () => {
    const animation = new LeslieAnimation();
    animation.step(0, run, false);
    animation.jump();
    expect(animation.step(16, { ...run, vy: -455 }, false).pose).toBe(atlas.poses.takeoff[0]);
    expect(animation.step(112, air(-280), false).face).toBe(atlas.heads.joy);
    expect(animation.state).toBe('ascent');
    expect(animation.step(16, air(-30), false).pose).toBe(atlas.poses.apex[0]);
    animation.step(16, air(40), false);
    expect(animation.state).toBe('apex');
    expect(animation.step(40, air(90), false).face).toBe(atlas.heads.wonder);
    expect(animation.step(16, run, false).pose).toBe(atlas.poses.land[0]);
    animation.step(176, run, false);
    expect(animation.step(16, run, false).pose).toBe(atlas.poses.run[0]);
  });

  it('lets a rescue change the face without restarting a stride or replacing flight', () => {
    const animation = new LeslieAnimation();
    animation.step(0, run, false);
    animation.rescue();
    expect(animation.step(53, run, false)).toEqual({face: atlas.heads.delight, pose: atlas.poses.run[1]});
    animation.jump();
    expect(animation.step(16, air(-400), false)).toEqual({face: atlas.heads.delight, pose: atlas.poses.takeoff[0]});
    expect(animation.step(550, air(120), false).face).toBe(atlas.heads.wonder);
  });

  it('paddles during recovery, gives celebration priority, and resets transient events', () => {
    const animation = new LeslieAnimation();
    const swim = { ...air(0), swimming: true };
    animation.step(0, swim, false);
    expect(animation.step(190, swim, false).pose).toBe(atlas.poses.swim[2]);
    animation.rescue();
    animation.celebrate();
    expect(animation.step(16, swim, false).face).toBe(atlas.heads.cheer);
    expect(animation.step(500, swim, false).pose).toBe(atlas.poses.celebrate.at(-1));
    animation.reset();
    expect(animation.step(0, run, false)).toEqual({face: atlas.heads.happy, pose: atlas.poses.run[0]});
  });

  it('blinks at rest and holds steady drawings under reduced motion', () => {
    const animation = new LeslieAnimation();
    const idle = {...run, vx: 0};
    expect(animation.step(3550, idle, false).face).toBe(atlas.heads.blink);
    expect(animation.step(0, idle, true)).toEqual({face: atlas.heads.curious, pose: atlas.poses.idle[0]});
    const held = animation.step(16, run, true);
    expect(animation.step(260, run, true)).toEqual(held);
    animation.jump();
    expect(animation.step(16, air(-455), true).face).toBe(atlas.heads.joy);
  });
});
