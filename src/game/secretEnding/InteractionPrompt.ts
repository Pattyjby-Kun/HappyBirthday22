import Phaser from "phaser"

import { FONT_FAMILY } from "../constants"

/**
 * Retro RPG interaction box shown above the Boy NPC:
 *
 *   ┌──────────────────────┐
 *   │   PRESS E TO TALK    │
 *   └──────────────────────┘
 *
 * Black panel, white pixel border, pixel font, a gentle floating bob, and a
 * fade in/out. Built as a Phaser container so it can be positioned in world
 * space above the NPC.
 */
export class InteractionPrompt {
  private readonly scene: Phaser.Scene
  private readonly container: Phaser.GameObjects.Container
  private floatTween?: Phaser.Tweens.Tween
  private fadeTween?: Phaser.Tweens.Tween

  constructor(scene: Phaser.Scene, message: string) {
    this.scene = scene

    const label = scene.add
      .text(0, 0, message, {
        fontFamily: FONT_FAMILY,
        fontSize: "12px",
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5)

    const padX = 16
    const padY = 12
    const w = Math.ceil(label.width) + padX * 2
    const h = Math.ceil(label.height) + padY * 2

    // White border with an inner black panel (classic RPG window).
    const box = scene.add.graphics()
    box.fillStyle(0xffffff, 1)
    box.fillRect(-w / 2, -h / 2, w, h)
    box.fillStyle(0x0b0b12, 0.95)
    box.fillRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6)

    this.container = scene.add
      .container(0, 0, [box, label])
      .setDepth(60)
      .setAlpha(0)
      .setVisible(false)
  }

  /** Show the box centered above (x, y in world space). */
  showAbove(x: number, y: number): void {
    this.container.setPosition(x, y)
    this.container.setVisible(true)

    this.fadeTween?.stop()
    this.fadeTween = this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 200,
      ease: "Sine.easeOut",
    })

    if (!this.floatTween) {
      this.floatTween = this.scene.tweens.add({
        targets: this.container,
        y: y - 6,
        duration: 700,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      })
    }
  }

  hide(): void {
    this.fadeTween?.stop()
    this.fadeTween = this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 160,
      ease: "Sine.easeIn",
      onComplete: () => this.container.setVisible(false),
    })
  }

  destroy(): void {
    this.floatTween?.stop()
    this.fadeTween?.stop()
    this.container.destroy()
  }
}
