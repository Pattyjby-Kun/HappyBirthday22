import Phaser from "phaser"

import { Colors, SceneKeys, TextureKeys } from "../constants"
import { createPlayerAnimations } from "../PlayerAnimations"
import { createSecretEndingAnimations } from "../secretEnding"

/**
 * Generates all placeholder pixel textures at runtime so the game ships with
 * zero image assets, then hands off to the menu.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Boot)
  }

  create(): void {
    this.createGroundTexture()
    this.createPlatformTexture()
    this.createCoinTexture()
    this.createDoorTexture()

    // Bake the custom pixel-art player frames + animations once.
    createPlayerAnimations(this)

    // Bake the hidden secret-ending sprites (boy poses, girl hug, heart) once.
    createSecretEndingAnimations(this)

    this.scene.start(SceneKeys.Menu)
  }

  private createGroundTexture(): void {
    const g = this.add.graphics()
    g.fillStyle(Colors.ground, 1)
    g.fillRect(0, 0, 64, 32)
    g.lineStyle(2, Colors.groundBorder, 1)
    g.strokeRect(1, 1, 62, 30)
    g.generateTexture(TextureKeys.Ground, 64, 32)
    g.destroy()
  }

  private createPlatformTexture(): void {
    const g = this.add.graphics()
    g.fillStyle(Colors.platform, 1)
    g.fillRect(0, 0, 96, 20)
    g.lineStyle(2, Colors.platformBorder, 1)
    g.strokeRect(1, 1, 94, 18)
    g.generateTexture(TextureKeys.Platform, 96, 20)
    g.destroy()
  }

  private createCoinTexture(): void {
    const g = this.add.graphics()
    g.fillStyle(Colors.coin, 1)
    g.fillCircle(8, 8, 8)
    g.fillStyle(Colors.coinHighlight, 1)
    g.fillCircle(8, 8, 4)
    g.generateTexture(TextureKeys.Coin, 16, 16)
    g.destroy()
  }

  private createDoorTexture(): void {
    const g = this.add.graphics()
    g.fillStyle(Colors.door, 1)
    g.fillRect(0, 0, 40, 64)
    g.lineStyle(3, 0xffffff, 1)
    g.strokeRect(2, 2, 36, 60)
    g.fillStyle(Colors.doorHandle, 1)
    g.fillCircle(32, 34, 3)
    g.generateTexture(TextureKeys.Door, 40, 64)
    g.destroy()
  }
}
