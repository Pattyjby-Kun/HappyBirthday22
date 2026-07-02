import Phaser from "phaser"

import { BoyFramePrefix, PlayerFramePrefix } from "../constants"
import { AnimationController } from "./AnimationController"
import {
  CharacterIds,
  getCharacterRole,
  getOtherCharacter,
  isBoyRole,
  type CharacterId,
} from "./characters"
import type { DialogueLine } from "./script"

/** Alpha for the speaking vs. the listening character. */
const ACTIVE_ALPHA = 1
const DIM_ALPHA = 0.4
const HIGHLIGHT_FADE_MS = 220
const VN_SPRITE_SCALE = 3

/**
 * Owns the two animated dialogue sprites (Press left, Tulip right), their
 * highlight cross-fade, and metadata-driven pose changes.
 */
export class SpeakerController {
  private readonly scene: Phaser.Scene
  private readonly anim: AnimationController
  private readonly boy: Phaser.GameObjects.Sprite
  private readonly girl: Phaser.GameObjects.Sprite

  /** Holds the special pose (worrying/angry) for the active line until the next page. */
  private lockedAnimation?: DialogueLine["animation"]

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.anim = new AnimationController(scene)

    const { width, height } = scene.scale
    const baseY = height * 0.66

    this.boy = scene.add
      .sprite(width * 0.26, baseY, `${BoyFramePrefix.Standing}-0`)
      .setOrigin(0.5, 1)
      .setScale(VN_SPRITE_SCALE)
      .setFlipX(false)
      .setDepth(10)

    this.girl = scene.add
      .sprite(width * 0.74, baseY, `${PlayerFramePrefix.Idle}-0`)
      .setOrigin(0.5, 1)
      .setScale(VN_SPRITE_SCALE)
      .setFlipX(true)
      .setDepth(10)

    this.anim.playNeutral(this.boy, CharacterIds.Press)
    this.anim.playNeutral(this.girl, CharacterIds.Tulip)
    this.boy.setAlpha(DIM_ALPHA)
    this.girl.setAlpha(DIM_ALPHA)
  }

  /** Highlight the current speaker (alpha 1) and dim the other (alpha 0.4). */
  setSpeaker(speaker: CharacterId): void {
    const speakingBoy = isBoyRole(speaker)
    this.fadeTo(this.boy, speakingBoy ? ACTIVE_ALPHA : DIM_ALPHA)
    this.fadeTo(this.girl, speakingBoy ? DIM_ALPHA : ACTIVE_ALPHA)
  }

  /**
   * Apply a new dialogue page: speaker highlight + metadata animation on the
   * speaker, neutral idle on the listener.
   */
  beginLine(line: DialogueLine): void {
    this.lockedAnimation = line.animation

    console.log("[DialogueScene] currentDialogue.animation", line.animation)

    this.setSpeaker(line.speaker)

    const speakerSprite = this.spriteFor(line.speaker)
    const speakerKey = this.anim.playForLine(speakerSprite, line)
    console.log("[DialogueScene] speaker anim key", speakerKey, speakerSprite.anims.currentAnim?.key)

    const listener = getOtherCharacter(line.speaker)
    const listenerSprite = this.spriteFor(listener)
    const listenerKey = this.anim.playNeutral(listenerSprite, listener)
    console.log("[DialogueScene] listener anim key", listenerKey, listenerSprite.anims.currentAnim?.key)
  }

  /**
   * After typing finishes: return to neutral only when no special animation
   * was locked for this line (metadata animation stays until the next page).
   */
  onLineTypingComplete(speaker: CharacterId): void {
    if (this.lockedAnimation) {
      return
    }
    this.anim.playNeutral(this.spriteFor(speaker), speaker)
  }

  private spriteFor(speaker: CharacterId): Phaser.GameObjects.Sprite {
    return getCharacterRole(speaker) === "boy" ? this.boy : this.girl
  }

  private fadeTo(sprite: Phaser.GameObjects.Sprite, alpha: number): void {
    this.scene.tweens.add({
      targets: sprite,
      alpha,
      duration: HIGHLIGHT_FADE_MS,
      ease: "Sine.easeInOut",
    })
  }
}
