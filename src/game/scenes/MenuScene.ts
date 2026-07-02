import Phaser from "phaser"

import { FONT_FAMILY, SceneKeys, TOTAL_COINS } from "../constants"

/**
 * In-game main menu. Starts Level 1 on click / SPACE and returns to the React
 * shell on ESC via the `onExit` callback stored in the game registry.
 */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Menu)
  }

  create(): void {
    const { width, height } = this.scale

    this.add
      .text(width / 2, height * 0.3, "LETTER", {
        fontFamily: FONT_FAMILY,
        fontSize: "48px",
        color: "#ffffff",
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, height * 0.48, `COLLECT ALL ${TOTAL_COINS} COINS`, {
        fontFamily: FONT_FAMILY,
        fontSize: "16px",
        color: "#ffd447",
      })
      .setOrigin(0.5)

    const prompt = this.add
      .text(width / 2, height * 0.64, "PRESS SPACE / CLICK TO START", {
        fontFamily: FONT_FAMILY,
        fontSize: "16px",
        color: "#8be9fd",
      })
      .setOrigin(0.5)

    this.tweens.add({
      targets: prompt,
      alpha: 0.2,
      duration: 700,
      yoyo: true,
      repeat: -1,
    })

    this.add
      .text(
        width / 2,
        height * 0.84,
        "MOVE: A / D  •  JUMP: SPACE / W  •  EXIT: ESC",
        {
          fontFamily: FONT_FAMILY,
          fontSize: "10px",
          color: "#9b8fc0",
          align: "center",
        }
      )
      .setOrigin(0.5)

    this.input.keyboard?.once("keydown-SPACE", this.startLevel)
    this.input.once("pointerdown", this.startLevel)
    this.input.keyboard?.on("keydown-ESC", this.exitToShell)
  }

  private startLevel = (): void => {
    this.scene.start(SceneKeys.Level1)
  }

  private exitToShell = (): void => {
    const onExit = this.game.registry.get("onExit") as (() => void) | undefined
    onExit?.()
  }
}
