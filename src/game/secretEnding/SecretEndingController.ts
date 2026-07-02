import Phaser from "phaser"

import { audioManager } from "../audio"
import {
  FONT_FAMILY,
  GirlAnimKeys,
  SECRET_ENDING,
  SceneKeys,
  THAI_FONT_FAMILY,
} from "../constants"
import { HAPPY_ENDING, type DialogueSceneData } from "../dialogue"
import { BoyNPC } from "./BoyNPC"
import { HeartEffect } from "./HeartEffect"
import { InteractionPrompt } from "./InteractionPrompt"
import { markSecretEndingUnlocked } from "./save"

/** Broadcast to React so touch devices can show/hide the TALK button. */
export const SECRET_HUG_PROMPT_EVENT = "secret-hug-prompt"

/** Fired when dialogue mode begins, so React hides the HUD / touch controls. */
export const SECRET_VN_START_EVENT = "secret-vn-start"

/** Fired at the very end, so React returns to the main menu (unmounts Phaser). */
export const SECRET_VN_END_EVENT = "secret-vn-end"

type Phase = "watching" | "dialogue" | "ending" | "done"

/**
 * Owns the entire optional secret ending, kept completely separate from the
 * normal level logic:
 *
 *  - Spawns a stationary Boy NPC at the level start once the door has opened.
 *  - If the player walks back to him, he stops worrying and stands up.
 *  - Standing very close shows a retro "PRESS E TO TALK" box.
 *  - Triggering it enters a dedicated Phaser visual-novel dialogue scene.
 *  - After the conversation it fades back in, hugs both characters, pops a
 *    heart, slowly zooms, then fades to a "Happy Ending" card and returns to
 *    the main menu.
 *
 * It never touches the door, the win flag or physics tuning, so entering the
 * door still ends the game exactly as before.
 */
export class SecretEndingController {
  private readonly scene: Phaser.Scene
  private readonly player: Phaser.Physics.Arcade.Sprite
  private readonly npc: BoyNPC
  private readonly prompt: InteractionPrompt
  private readonly promptMessage: string
  private readonly eKey?: Phaser.Input.Keyboard.Key

  private phase: Phase = "watching"
  private promptVisible = false

  constructor(scene: Phaser.Scene, player: Phaser.Physics.Arcade.Sprite, groundTopY: number) {
    this.scene = scene
    this.player = player

    this.npc = new BoyNPC(scene, SECRET_ENDING.npcStartX, groundTopY)

    const isTouch = scene.sys.game.device.input.touch
    this.promptMessage = isTouch ? "TAP TO TALK" : "PRESS E TO TALK"
    this.prompt = new InteractionPrompt(scene, this.promptMessage)

    this.eKey = scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.E)
  }

  /** True while dialogue/ending is playing, so the scene should freeze input. */
  isPlayerLocked(): boolean {
    return this.phase !== "watching"
  }

  update(): void {
    if (this.phase !== "watching") {
      return
    }

    const distance = Math.abs(this.player.x - this.npc.x)

    // Worrying while far away, standing once the player approaches.
    this.npc.setWorryingOrStanding(distance <= SECRET_ENDING.approachDistance)

    const canTalk = distance <= SECRET_ENDING.interactionDistance
    this.setPrompt(canTalk)

    if (!canTalk) {
      return
    }

    const keyPressed = this.eKey ? Phaser.Input.Keyboard.JustDown(this.eKey) : false
    const touchPressed = this.consumeTouchTalk()

    if (keyPressed || touchPressed) {
      this.startDialogue()
    }
  }

  destroy(): void {
    this.setPrompt(false)
    this.prompt.destroy()
    this.npc.destroy()
    if (this.eKey) {
      this.scene.input.keyboard?.removeKey(this.eKey)
    }
  }

  // ---------------------------------------------------------------------------
  // Internal
  // ---------------------------------------------------------------------------

  /** Reads and clears the shared touch flag written by the React TALK button. */
  private consumeTouchTalk(): boolean {
    const touch = this.scene.game.registry.get("touchInput") as
      | { hugQueued?: boolean }
      | undefined
    if (touch?.hugQueued === true) {
      touch.hugQueued = false
      return true
    }
    return false
  }

  private setPrompt(visible: boolean): void {
    if (visible === this.promptVisible) {
      return
    }
    this.promptVisible = visible

    if (visible) {
      const top = this.npc.y - this.npc.sprite.displayHeight - 8
      this.prompt.showAbove(this.npc.x, top)
    } else {
      this.prompt.hide()
    }

    // Let React toggle the on-screen TALK button for touch devices.
    this.scene.game.events.emit(SECRET_HUG_PROMPT_EVENT, visible)
  }

  /**
   * Enters dialogue mode: freezes the player, hides the HUD (via React), fades
   * out the gameplay music, swaps in the emotional track and launches the
   * dedicated visual-novel scene on top of the level.
   */
  private startDialogue(): void {
    this.phase = "dialogue"
    this.setPrompt(false)

    // Freeze the player where they stand; the dialogue scene covers the level.
    this.player.setVelocity(0, 0)
    ;(this.player.body as Phaser.Physics.Arcade.Body | null)?.stop()
    this.player.setFlipX(true)

    // React hides the HUD + touch controls while dialogue is active.
    this.scene.game.events.emit(SECRET_VN_START_EVENT)
    audioManager.transitionToVnMusic()

    const data: DialogueSceneData = { onComplete: () => this.playHugEnding() }
    this.scene.scene.launch(SceneKeys.Dialogue, data)
  }

  /**
   * Called when the conversation finishes. Fades back into gameplay, plays both
   * hug animations, pops a heart, slowly zooms, holds, then fades to the happy
   * ending card.
   */
  private playHugEnding(): void {
    if (this.phase !== "dialogue") {
      return
    }
    this.phase = "ending"

    const camera = this.scene.cameras.main
    camera.fadeIn(SECRET_ENDING.fadeMs / 2, 0, 0, 0)

    // Align the two sprites naturally and play both hug poses.
    this.player.setVelocity(0, 0)
    ;(this.player.body as Phaser.Physics.Arcade.Body | null)?.stop()
    this.player.setX(this.npc.x + SECRET_ENDING.hugGap)
    this.player.setFlipX(true)
    this.player.play(GirlAnimKeys.Hug, true)
    this.npc.playHug()

    // Heart above the midpoint of the couple.
    const midX = (this.player.x + this.npc.x) / 2
    const heartY = this.npc.y - this.npc.sprite.displayHeight - 6
    new HeartEffect(this.scene, midX, heartY)

    // Smooth centre + slow zoom on both characters.
    camera.stopFollow()
    const midY = this.npc.y - this.npc.sprite.displayHeight / 2
    camera.pan(midX, midY, SECRET_ENDING.cameraDurationMs, "Sine.easeInOut")
    camera.zoomTo(SECRET_ENDING.cameraZoom, SECRET_ENDING.slowZoomMs)

    audioManager.playClick()

    this.scene.time.delayedCall(SECRET_ENDING.hugHoldMs, () => this.showHappyEnding())
  }

  /** Fades to black and shows the final "Happy Ending" card. */
  private showHappyEnding(): void {
    if (this.phase !== "ending") {
      return
    }
    this.phase = "done"
    markSecretEndingUnlocked()

    const { width, height } = this.scene.scale

    // Oversized so it still covers everything under the zoom.
    const overlay = this.scene.add
      .rectangle(width / 2, height / 2, width * 2, height * 2, 0x000000, 0)
      .setScrollFactor(0)
      .setDepth(200)

    this.scene.tweens.add({
      targets: overlay,
      alpha: 1,
      duration: SECRET_ENDING.fadeMs,
      onComplete: () => this.buildHappyEndingCard(),
    })
  }

  private buildHappyEndingCard(): void {
    const { width, height } = this.scene.scale
    const cx = width / 2

    const layer = this.scene.add.container(0, 0).setScrollFactor(0).setDepth(201).setAlpha(0)

    const header = this.scene.add
      .text(cx, height * 0.26, HAPPY_ENDING.header, {
        fontFamily: FONT_FAMILY,
        fontSize: "34px",
        color: "#ffd447",
        align: "center",
      })
      .setOrigin(0.5)

    const body = this.scene.add
      .text(cx, height * 0.46, HAPPY_ENDING.body, {
        fontFamily: THAI_FONT_FAMILY,
        fontSize: "26px",
        color: "#ffffff",
        align: "center",
        lineSpacing: 10,
      })
      .setOrigin(0.5)

    const heart = this.scene.add
      .text(cx, height * 0.64, HAPPY_ENDING.heart, {
        fontFamily: THAI_FONT_FAMILY,
        fontSize: "44px",
        align: "center",
      })
      .setOrigin(0.5)

    const footer = this.scene.add
      .text(cx, height * 0.78, HAPPY_ENDING.footer, {
        fontFamily: FONT_FAMILY,
        fontSize: "16px",
        color: "#b9b3d6",
        align: "center",
      })
      .setOrigin(0.5)

    layer.add([header, body, heart, footer])

    // Gentle heartbeat on the emoji.
    this.scene.tweens.add({
      targets: heart,
      scale: 1.18,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    })

    this.scene.tweens.add({
      targets: layer,
      alpha: 1,
      duration: 500,
      onComplete: () => {
        // Allow a beat, then let a tap / space return to the menu.
        this.scene.time.delayedCall(1200, () => this.armReturnToMenu())
      },
    })
  }

  private armReturnToMenu(): void {
    const back = () => this.returnToMenu()
    this.scene.input.keyboard?.once("keydown-SPACE", back)
    this.scene.input.keyboard?.once("keydown-ENTER", back)
    this.scene.input.once("pointerdown", back)
    // Fallback auto-return so the card never gets stuck.
    this.scene.time.delayedCall(9000, back)
  }

  private returned = false

  private returnToMenu(): void {
    if (this.returned) {
      return
    }
    this.returned = true
    audioManager.transitionToMenuMusic()
    this.scene.game.events.emit(SECRET_VN_END_EVENT)
  }
}
