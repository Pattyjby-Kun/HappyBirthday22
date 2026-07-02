import type Phaser from "phaser"

import { HeartAnimKey, HeartFramePrefix, SECRET_ENDING } from "../constants"

/**
 * One-shot heart that pops above the couple, plays its animation once, then
 * floats upward while fading out and cleans itself up. Self-contained so it can
 * be reused for any future celebratory moment.
 */
export class HeartEffect {
  private readonly sprite: Phaser.GameObjects.Sprite

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.add.sprite(x, y, `${HeartFramePrefix}-0`)
    this.sprite.setOrigin(0.5, 0.5)
    this.sprite.setScale(SECRET_ENDING.heartScale)
    this.sprite.setDepth(80)
    this.sprite.play(HeartAnimKey)

    // Gentle float up + fade. Runs independently of the anim so it reads well
    // whether the heart is a single frame or a short loop.
    scene.tweens.add({
      targets: this.sprite,
      y: y - 70,
      alpha: 0,
      duration: 1600,
      ease: "Sine.easeOut",
      delay: 250,
      onComplete: () => this.sprite.destroy(),
    })
  }

  destroy(): void {
    this.sprite.destroy()
  }
}
