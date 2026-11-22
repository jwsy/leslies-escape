import Phaser from 'phaser';
import atlas from './leslieFrames.json';
import { LeslieAnimation, type Movement } from './LeslieAnimation';

const TEXTURE = 'leslie';
const SCALE = 0.5;

interface Motion extends Movement {
  x: number;
  y: number;
  waterY: number;
}

/** Poses are registered to the hidden Arcade sprite. Only artwork moves here. */
export class LeslieView {
  static preload(scene: Phaser.Scene) {
    scene.load.spritesheet(TEXTURE, `${import.meta.env.BASE_URL}sprites/leslie.png`, {
      frameWidth: atlas.cell, frameHeight: atlas.cell,
    });
  }

  private readonly systemMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  private readonly animation = new LeslieAnimation();
  private readonly root: Phaser.GameObjects.Container;
  private readonly bunny: Phaser.GameObjects.Container;
  private readonly body: Phaser.GameObjects.Image;
  private readonly head: Phaser.GameObjects.Image;
  private readonly glow: Phaser.GameObjects.Image;
  private readonly wake: Phaser.GameObjects.Image;
  private readonly sparkles: Phaser.GameObjects.Image[];

  constructor(scene: Phaser.Scene) {
    const part = (frame: number) => scene.make.image({key: TEXTURE, frame}, false)
      .setOrigin(0.5, atlas.pivotY).setScale(SCALE);
    this.glow = part(atlas.effects.glow).setPosition(0, -7);
    this.body = part(atlas.poses.idle[0].frame);
    this.head = part(atlas.heads.curious);
    this.bunny = scene.make.container({x: 0, y: 0}, false);
    this.bunny.add([this.body, this.head]);
    this.wake = part(atlas.effects.wake).setVisible(false);
    this.sparkles = [atlas.effects.star, atlas.effects.speck, atlas.effects.star].map(frame => part(frame).setVisible(false));
    this.root = scene.add.container(0, 0, [this.glow, this.bunny, this.wake, ...this.sparkles])
      .setName('Leslie artwork').setDepth(7);
  }

  get reducedMotion() {
    return this.systemMotion.matches || document.documentElement.classList.contains('reduced-motion');
  }

  jump() { this.animation.jump(); }
  rescue() { this.animation.rescue(); }
  celebrate() { this.animation.celebrate(); }
  reset() { this.animation.reset(); }

  update(dt: number, motion: Motion) {
    const reduced = this.reducedMotion;
    const {pose, face} = this.animation.step(dt, motion, reduced);
    const {state, age, rescueAge, jumpAge} = this.animation;
    const y = motion.swimming ? Math.min(motion.y, motion.waterY - 15) : motion.y;
    this.root.setPosition(motion.x, y);
    if (Number(this.body.frame.name) !== pose.frame) this.body.setFrame(pose.frame);
    if (Number(this.head.frame.name) !== face) this.head.setFrame(face);
    this.head.setPosition(pose.x, pose.y).setAngle(pose.angle);

    // Breathe around the soles so a resting bunny keeps her weight on the ledge.
    const breath = !reduced && state === 'idle' ? .018 * Math.sin(age * .0035) : 0;
    this.bunny.setScale(1 - breath * .35, 1 + breath).setY(-17 * breath);

    const waterLine = motion.waterY - y;
    this.wake.setVisible(state === 'swim' && waterLine < 24).setY(waterLine);
    const joyAge = state === 'celebrate' ? age : rescueAge;
    const pulse = !reduced && joyAge < 620 ? Math.sin(Math.PI * joyAge / 620) : 0;
    this.glow.setAlpha(0.45 + 0.49 * pulse).setScale(SCALE * (1 + 0.22 * pulse));

    const airborne = state === 'takeoff' || state === 'ascent' || state === 'apex';
    const effectAge = state === 'celebrate' ? age : airborne ? jumpAge : Infinity;
    for (let i = 0; i < this.sparkles.length; i++) {
      const t = (effectAge - 55 - i * 75) / 310;
      const visible = !reduced && t > 0 && t < 1;
      const star = this.sparkles[i].setVisible(visible);
      if (visible) {
        const light = Math.sin(Math.PI * t);
        star.setAlpha(light * .92).setScale(SCALE * (.4 + .68 * light))
          .setPosition(-24 + 8 * i - t * 15, 8 - 11 * i + t * 6);
      }
    }
  }
}
