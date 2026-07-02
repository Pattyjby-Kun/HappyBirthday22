import Phaser from "phaser"

import { Colors, GAME_HEIGHT, GAME_WIDTH, GRAVITY_Y } from "./constants"
import { audioManager } from "./audio"
import { DialogueScene } from "./dialogue"
import { BootScene } from "./scenes/BootScene"
import { Level1Scene } from "./scenes/Level1Scene"
import { MenuScene } from "./scenes/MenuScene"

/**
 * Builds a fresh Phaser.Game instance mounted into the given DOM element.
 * The caller owns the lifecycle and must call `game.destroy(true)` on unmount.
 */
export function createGame(parent: HTMLElement): Phaser.Game {
  // Fire-and-forget preload; missing files are skipped with a console TODO.
  void audioManager.preload()

  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: Colors.background,
    pixelArt: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: GRAVITY_Y },
        debug: false,
      },
    },
    scene: [BootScene, MenuScene, Level1Scene, DialogueScene],
  })
}
