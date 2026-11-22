import atlas from './leslieFrames.json';

type State = keyof typeof atlas.poses;
export interface Movement {
  vx: number;
  vy: number;
  grounded: boolean;
  swimming: boolean;
}

// Milliseconds per drawing. Non-looping actions hold their final drawing until
// the physics or scene event advances them. The run cycle covers one full bound.
const timing: Record<State, { exposure: number; loop?: boolean; still: number; face: keyof typeof atlas.heads }> = {
  idle:      { exposure: 520, loop: true, still: 0, face: 'curious' },
  run:       { exposure: 52,  loop: true, still: 3, face: 'happy' },
  takeoff:   { exposure: 32,  still: 0, face: 'joy' },
  ascent:    { exposure: 130, still: 0, face: 'joy' },
  apex:      { exposure: 75,  still: 0, face: 'joy' },
  fall:      { exposure: 130, still: 0, face: 'wonder' },
  land:      { exposure: 44,  still: 0, face: 'happy' },
  swim:      { exposure: 95,  loop: true, still: 0, face: 'calm' },
  celebrate: { exposure: 90,  still: 4, face: 'cheer' },
};

export class LeslieAnimation {
  state: State = 'idle';
  age = 0;
  jumpAge = Infinity;
  rescueAge = Infinity;
  private celebrating = false;
  private drawingTime = 0;
  private clock = 0;

  jump() { this.jumpAge = 0; }
  rescue() { this.rescueAge = 0; }
  celebrate() { this.celebrating = true; }

  reset() {
    this.state = 'idle';
    this.age = this.drawingTime = this.clock = 0;
    this.jumpAge = this.rescueAge = Infinity;
    this.celebrating = false;
  }

  private nextState({vx, vy, grounded, swimming}: Movement): State {
    if (this.celebrating) return 'celebrate';
    if (swimming) return 'swim';
    if (!grounded || vy < -25) {
      if (this.jumpAge < 96 && vy < 0) return 'takeoff';
      if (vy < -65) return 'ascent';
      if (vy <= 65 && (this.state === 'ascent' || this.state === 'apex')) return 'apex';
      return 'fall';
    }
    if (this.state === 'fall' || this.state === 'apex' || this.state === 'ascent' ||
        this.state === 'takeoff' || this.state === 'swim' || (this.state === 'land' && this.age < 176)) return 'land';
    return Math.abs(vx) > 10 ? 'run' : 'idle';
  }

  step(dt: number, motion: Movement, reduced: boolean) {
    this.clock += dt;
    this.jumpAge += dt;
    this.rescueAge += dt;
    const state = this.nextState(motion);
    if (state !== this.state) {
      this.state = state;
      this.age = this.drawingTime = 0;
    } else {
      this.age += dt;
      this.drawingTime += dt * (state === 'run' ? Math.abs(motion.vx) / 175 : 1);
    }

    const clip = timing[state];
    const drawings = atlas.poses[state];
    const step = Math.floor(this.drawingTime / clip.exposure);
    const index = reduced ? clip.still : clip.loop ? step % drawings.length : Math.min(step, drawings.length - 1);
    const blink = (state === 'idle' || state === 'swim') && this.clock % 3660 > 3530;
    let face = clip.face;
    if (state !== 'celebrate' && this.rescueAge < 600) face = 'delight';
    else if (blink && !reduced) face = 'blink';
    return { pose: drawings[index], face: atlas.heads[face] };
  }
}
