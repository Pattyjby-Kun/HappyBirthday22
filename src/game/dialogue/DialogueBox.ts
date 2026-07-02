import Phaser from "phaser"

import { THAI_FONT_FAMILY } from "../constants"
import { getCharacter, type CharacterId } from "./characters"

/**
 * Retro pixel dialogue window pinned to the bottom of the screen: black panel,
 * white pixel border, speaker label, typewriter body text, and a blinking ▼
 * "continue" indicator in the lower-right.
 */
export class DialogueBox {
  private readonly scene: Phaser.Scene
  private readonly nameText: Phaser.GameObjects.Text
  private readonly bodyText: Phaser.GameObjects.Text
  private readonly indicator: Phaser.GameObjects.Text
  private indicatorTween?: Phaser.Tweens.Tween

  constructor(scene: Phaser.Scene) {
    this.scene = scene

    const { width, height } = scene.scale
    const margin = 24
    const boxW = width - margin * 2
    const boxH = 168
    const boxX = margin
    const boxY = height - boxH - margin

    const g = scene.add.graphics().setDepth(100)
    // Outer white border, inner black panel — classic RPG window.
    g.fillStyle(0xffffff, 1)
    g.fillRect(boxX, boxY, boxW, boxH)
    g.fillStyle(0x0b0b12, 0.96)
    g.fillRect(boxX + 4, boxY + 4, boxW - 8, boxH - 8)
    g.lineStyle(2, 0x8a7bb0, 1)
    g.strokeRect(boxX + 10, boxY + 10, boxW - 20, boxH - 20)

    this.nameText = scene.add
      .text(boxX + 26, boxY + 22, "", {
        fontFamily: THAI_FONT_FAMILY,
        fontSize: "22px",
        color: "#ffffff",
      })
      .setDepth(101)

    this.bodyText = scene.add
      .text(boxX + 26, boxY + 58, "", {
        fontFamily: THAI_FONT_FAMILY,
        fontSize: "24px",
        color: "#f4f4ff",
        lineSpacing: 8,
        wordWrap: { width: boxW - 52 },
      })
      .setDepth(101)

    this.indicator = scene.add
      .text(boxX + boxW - 30, boxY + boxH - 30, "▼", {
        fontFamily: THAI_FONT_FAMILY,
        fontSize: "16px",
        color: "#ffd447",
      })
      .setOrigin(0.5)
      .setDepth(101)
      .setVisible(false)
  }

  setSpeaker(speaker: CharacterId): void {
    const character = getCharacter(speaker)
    this.nameText.setText(character.displayName)
    this.nameText.setColor(character.nameColor)
  }

  setText(text: string): void {
    this.bodyText.setText(text)
  }

  showIndicator(): void {
    if (this.indicator.visible) {
      return
    }
    this.indicator.setVisible(true).setAlpha(1)
    this.indicatorTween = this.scene.tweens.add({
      targets: this.indicator,
      alpha: 0.15,
      duration: 450,
      yoyo: true,
      repeat: -1,
    })
  }

  hideIndicator(): void {
    this.indicatorTween?.stop()
    this.indicatorTween = undefined
    this.indicator.setVisible(false)
  }
}
