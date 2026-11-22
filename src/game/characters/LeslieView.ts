import Phaser from 'phaser';

const TEXTURE = 'leslie';
const CELL_SIZE = 144;
const ART_SCALE = 0.5;
const MOTION_QUERY = '(prefers-reduced-motion: reduce)';

// The order matches the cells in scripts/draw-leslie.mjs.
enum Frame {
  Glow, Tail, FarEar, NearEar, Torso, Head, HindPaw, ForePaw,
  Curious, Happy, Joyful, Surprised, Calm, Blink, Delighted, Ripple, Sparkle, Speck,
}

type State = 'idle' | 'run' | 'takeoff' | 'ascent' | 'apex' | 'fall' | 'land' | 'swim' | 'celebrate';

interface Motion {
  x: number;
  y: number;
  vx: number;
  vy: number;
  grounded: boolean;
  swimming: boolean;
  waterY: number;
}

const neutralPose = {
  lift: 0, width: 1, height: 1, lean: 0, headTilt: 0, headY: -9,
  farEar: -49, nearEar: -25, earLength: 1, tail: -12,
  farFore: 3, nearFore: -5, farHind: 8, nearHind: -4, foreLift: 0, hindLift: 0,
};

type Pose = typeof neutralPose;
const poseKeys = Object.keys(neutralPose) as (keyof Pose)[];

const stillPoses = {
  idle: {},
  run: { lean: 4, farFore: -20, nearHind: 20 },
  takeoff: { lift: -1, lean: -6, farEar: -72, nearEar: -57, nearFore: -24 },
  ascent: { lift: -1, lean: -8, farEar: -75, nearEar: -63, farFore: -28, nearFore: -38, foreLift: 3, nearHind: 22 },
  apex: { lean: -5, farEar: -61, nearEar: -40, nearFore: -27, foreLift: 4, hindLift: 2 },
  fall: { lean: 7, headTilt: 4, farEar: -24, nearEar: 9, nearFore: 22, farHind: -17 },
  land: { lift: 1, width: 1.07, height: 0.94, farEar: -60, nearEar: -45 },
  swim: { lift: 5, lean: 6, headY: -7, headTilt: 3, farEar: -147, nearEar: -126, nearFore: -27, foreLift: 2 },
  celebrate: { lift: -2, lean: -9, headTilt: -9, farEar: -41, nearEar: 1, farFore: -65, nearFore: -79, foreLift: 7 },
} satisfies Record<State, Partial<Pose>>;

const expressions: Record<State, Frame> = {
  idle: Frame.Curious,
  run: Frame.Happy,
  takeoff: Frame.Joyful,
  ascent: Frame.Joyful,
  apex: Frame.Joyful,
  fall: Frame.Surprised,
  land: Frame.Happy,
  swim: Frame.Calm,
  celebrate: Frame.Delighted,
};

function animatedPose(state: State, age: number, time: number, vx: number): Partial<Pose> {
  switch (state) {
    case 'idle': {
      const breath = Math.sin(time * 0.003);
      return { lift: -0.45 * breath, height: 1 + 0.028 * breath, headTilt: -3 + 2 * breath,
        farEar: -49 + 5 * Math.sin(time * 0.004), nearEar: -25 + 4 * Math.sin(time * 0.004 - 0.85) };
    }
    case 'run': {
      const stride = age * (0.014 + 0.000022 * Math.abs(vx));
      const swing = Math.sin(stride);
      const push = Math.cos(stride * 2);
      return { lift: -1.7 - 2.1 * push, width: 1 - 0.047 * push, height: 1 + 0.08 * push,
        lean: 5 + 3 * swing, headTilt: -1 - 3 * swing, tail: -15 + 11 * swing,
        farEar: -55 + 14 * Math.sin(stride - 0.95), nearEar: -33 + 19 * Math.sin(stride - 1.7),
        farFore: 41 * swing, nearFore: -38 * swing, farHind: 34 * swing, nearHind: -30 * swing,
        foreLift: 1.3 + 2 * Math.max(0, push), hindLift: 1.1 + 2 * Math.max(0, push) };
    }
    case 'takeoff': {
      const stretch = Phaser.Math.SmoothStep(age, 26, 86);
      return { lift: 2 - 6 * stretch, width: 1.15 - 0.24 * stretch, height: 0.84 + 0.28 * stretch,
        lean: 6 - 15 * stretch, farEar: -48 - 31 * stretch, nearEar: -29 - 36 * stretch,
        foreLift: 4 * stretch, farFore: -12 - 26 * stretch, nearFore: -15 - 30 * stretch,
        nearHind: 25, farHind: 14 };
    }
    case 'ascent':
      return { ...stillPoses.ascent, lift: -3, width: 0.94, height: 1.1, headTilt: -6,
        farEar: -74 + 8 * Math.sin(age * 0.017), nearEar: -62 + 9 * Math.sin(age * 0.014 - 0.7) };
    case 'apex': {
      const drift = Math.sin(age * 0.017);
      return { ...stillPoses.apex, lift: -1.5 - drift, width: 1.035, height: 0.98,
        tail: -21, farEar: -65 + 13 * drift, nearEar: -44 + 10 * Math.sin(age * 0.016 - 0.6) };
    }
    case 'fall':
      return { ...stillPoses.fall, width: 0.96, height: 1.04, foreLift: 1, hindLift: 1,
        farEar: -24 + 10 * Math.sin(age * 0.018), nearEar: 12 + 11 * Math.sin(age * 0.016 - 0.7) };
    case 'land': {
      const bounce = Math.sin(Math.PI * Math.min(age / 155, 1));
      const earBounce = Math.sin(age * 0.029) * Math.exp(-age / 118);
      return { lift: 2 * bounce, width: 1 + 0.16 * bounce, height: 1 - 0.20 * bounce,
        lean: 10 * bounce, farEar: -48 - 36 * earBounce, nearEar: -25 - 45 * earBounce,
        nearFore: -15 * bounce, nearHind: -12 * bounce };
    }
    case 'swim': {
      const stroke = age * 0.010;
      return { ...stillPoses.swim, lift: 5 + 1.4 * Math.sin(stroke * 2), height: 0.97,
        farEar: stillPoses.swim.farEar + 8 * Math.sin(stroke - 0.7),
        nearEar: stillPoses.swim.nearEar + 9 * Math.sin(stroke - 1.2),
        earLength: 0.94, tail: -5 + 11 * Math.sin(stroke), nearFore: -27 + 39 * Math.sin(stroke),
        farFore: -22 - 36 * Math.sin(stroke), nearHind: -18 - 15 * Math.sin(stroke), farHind: 16 * Math.sin(stroke) };
    }
    case 'celebrate': {
      const hop = Math.sin(Math.PI * Phaser.Math.Clamp((age - 40) / 400, 0, 1));
      return { ...stillPoses.celebrate, lift: -2 - 8 * hop, width: 1 - 0.09 * hop, height: 1 + 0.13 * hop,
        farEar: -46 + 16 * Math.sin(age * 0.012), nearEar: -8 + 23 * Math.sin(age * 0.012 - 0.55),
        farFore: -60 - 19 * hop, nearFore: -74 - 17 * hop };
    }
  }
}

/** Renders Leslie independently of the invisible Arcade sprite and its circular body. */
export class LeslieView {
  static preload(scene: Phaser.Scene) {
    scene.load.spritesheet(TEXTURE, `${import.meta.env.BASE_URL}sprites/leslie.png`, {
      frameWidth: CELL_SIZE, frameHeight: CELL_SIZE,
    });
  }

  private readonly systemMotion = window.matchMedia(MOTION_QUERY);
  private readonly root: Phaser.GameObjects.Container;
  private readonly core: Phaser.GameObjects.Container;
  private readonly headRig: Phaser.GameObjects.Container;
  private readonly glow: Phaser.GameObjects.Image;
  private readonly tail: Phaser.GameObjects.Image;
  private readonly farEar: Phaser.GameObjects.Image;
  private readonly nearEar: Phaser.GameObjects.Image;
  private readonly farFore: Phaser.GameObjects.Image;
  private readonly nearFore: Phaser.GameObjects.Image;
  private readonly farHind: Phaser.GameObjects.Image;
  private readonly nearHind: Phaser.GameObjects.Image;
  private readonly face: Phaser.GameObjects.Image;
  private readonly ripple: Phaser.GameObjects.Image;
  private readonly sparkles: Phaser.GameObjects.Image[];
  private readonly pose = { ...neutralPose };
  private state: State = 'idle';
  private time = 0;
  private stateAt = 0;
  private jumpAt = -Infinity;
  private rescueAt = -Infinity;
  private celebrating = false;

  constructor(scene: Phaser.Scene) {
    const part = (frame: Frame, x = 0, y = 0) =>
      scene.make.image({ x, y, key: TEXTURE, frame }, false).setScale(ART_SCALE);

    this.root = scene.add.container().setName('Leslie artwork').setDepth(7);
    this.core = scene.make.container({}, false);
    this.glow = part(Frame.Glow, -1, -7).setAlpha(0.47);
    this.tail = part(Frame.Tail, -19, 5);
    this.farHind = part(Frame.HindPaw, -7, 12).setTint(0xe2cde1);
    this.farFore = part(Frame.ForePaw, 8, 9).setTint(0xe2cde1);
    this.nearHind = part(Frame.HindPaw, -10, 13);
    this.nearFore = part(Frame.ForePaw, 11, 11);
    this.farEar = part(Frame.FarEar, -8, -9);
    this.nearEar = part(Frame.NearEar, -2, -11);
    this.face = part(Frame.Curious);
    this.headRig = scene.make.container({ x: 9, y: -9 }, false);
    this.headRig.add([this.farEar, this.nearEar, part(Frame.Head), this.face]);
    this.core.add([this.tail, this.farHind, this.farFore, part(Frame.Torso, -3, 1), this.nearHind, this.headRig, this.nearFore]);
    this.ripple = part(Frame.Ripple).setVisible(false);
    this.sparkles = [part(Frame.Sparkle), part(Frame.Speck), part(Frame.Sparkle)].map(sprite => sprite.setVisible(false));
    this.root.add([this.glow, this.core, this.ripple, ...this.sparkles]);
  }

  get reducedMotion() {
    return this.systemMotion.matches || document.documentElement.classList.contains('reduced-motion');
  }

  jump() { this.jumpAt = this.time; }
  rescue() { this.rescueAt = this.time; }
  celebrate() { this.celebrating = true; }

  reset() {
    this.state = 'idle';
    this.stateAt = this.time;
    this.jumpAt = this.rescueAt = -Infinity;
    Object.assign(this.pose, neutralPose);
  }

  update(dt: number, motion: Motion) {
    this.time += dt;
    const state = this.nextState(motion);
    if (state !== this.state) {
      this.state = state;
      this.stateAt = this.time;
    }
    const age = this.time - this.stateAt;
    const reduced = this.reducedMotion;
    const offsets: Partial<Pose> = reduced ? stillPoses[state] : animatedPose(state, age, this.time, motion.vx);
    const blend = reduced || dt === 0 ? 1 : 1 - Math.exp(-dt / 21);
    for (const key of poseKeys) {
      const goal = offsets[key] ?? neutralPose[key];
      this.pose[key] = Phaser.Math.Linear(this.pose[key], goal, blend);
    }

    const rescueAge = this.time - this.rescueAt;
    const justRescued = rescueAge < 660;
    const blink = !reduced && (state === 'idle' || state === 'swim') && this.time % 3700 > 3560;
    const rescueFace = reduced || rescueAge < 160 ? Frame.Joyful : Frame.Delighted;
    const face = justRescued && state !== 'celebrate' ? rescueFace : blink ? Frame.Blink : expressions[state];
    if (Number(this.face.frame.name) !== face) this.face.setFrame(face);

    this.root.setPosition(motion.x, motion.y);
    this.applyPose(this.pose);
    const waterLine = motion.waterY - motion.y;
    this.ripple.setPosition(0, waterLine).setVisible(state === 'swim' && waterLine >= 3 && waterLine < 24);
    this.updateEffects(reduced, age, rescueAge);
  }

  private nextState({ vx, vy, grounded, swimming }: Motion): State {
    if (this.celebrating) return 'celebrate';
    if (swimming) return 'swim';
    if (!grounded || vy < -25) {
      const jumpAge = this.time - this.jumpAt;
      if (jumpAge < 91) return 'takeoff';
      if (vy < -57) return 'ascent';
      if (vy < 57 && (this.state === 'ascent' || this.state === 'apex')) return 'apex';
      return 'fall';
    }
    if (this.state === 'fall' || this.state === 'apex' || this.state === 'ascent' ||
        this.state === 'takeoff' || this.state === 'swim' ||
        (this.state === 'land' && this.time - this.stateAt < 170)) return 'land';
    return Math.abs(vx) > 10 ? 'run' : 'idle';
  }

  private applyPose(pose: Pose) {
    this.core.setY(pose.lift).setScale(pose.width, pose.height).setAngle(pose.lean);
    this.headRig.setY(pose.headY).setAngle(pose.headTilt);
    this.tail.setAngle(pose.tail);
    this.farEar.setAngle(pose.farEar).setScale(ART_SCALE, ART_SCALE * pose.earLength);
    this.nearEar.setAngle(pose.nearEar).setScale(ART_SCALE, ART_SCALE * pose.earLength);
    this.farHind.setY(12 - pose.hindLift).setAngle(pose.farHind);
    this.nearHind.setY(13 - pose.hindLift).setAngle(pose.nearHind);
    this.farFore.setY(9 - pose.foreLift).setAngle(pose.farFore);
    this.nearFore.setY(11 - pose.foreLift).setAngle(pose.nearFore);
  }

  private updateEffects(reduced: boolean, stateAge: number, rescueAge: number) {
    const joy = this.state === 'celebrate' ? stateAge : rescueAge;
    const pulse = joy < 660 ? Math.sin(Math.PI * joy / 660) : 0;
    this.glow.setAlpha(reduced ? 0.47 : 0.47 + 0.40 * pulse);
    this.glow.setScale(ART_SCALE * (reduced ? 1 : 1 + 0.15 * pulse));

    const jumpAge = this.time - this.jumpAt;
    const jumping = this.state === 'takeoff' || this.state === 'ascent' || this.state === 'apex';
    const effectAge = jumping ? jumpAge : this.state === 'celebrate' ? stateAge : Infinity;
    for (let i = 0; i < this.sparkles.length; i++) {
      const progress = (effectAge - 68 - i * 48) / 310;
      const visible = !reduced && progress > 0 && progress < 1;
      const sprite = this.sparkles[i].setVisible(visible);
      if (visible) {
        const spread = Math.sin(Math.PI * progress);
        sprite.setAlpha(0.88 * spread)
          .setScale(ART_SCALE * (0.55 + 0.42 * spread))
          .setPosition(i === 2 ? 23 + 4 * progress : -24 - 8 * progress + i * 7, -25 + i * 5 - 9 * progress);
      }
    }
  }
}
