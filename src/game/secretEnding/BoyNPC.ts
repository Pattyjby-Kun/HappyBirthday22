import Phaser from "phaser"

import { BoyAnimKeys, BoyFramePrefix, SECRET_ENDING } from "../constants"

/**
 * Animation states in priority order (lowest → highest):
 *   worrying (waiting)  <  standing (approached)  <  hug (interaction, terminal)
 * Once hugging, the NPC never returns to an earlier state.
 */
export type BoyState = "worrying" | "standing" | "hug"

const STATE_TO_ANIM: Record<BoyState, string> = {
  worrying: BoyAnimKeys.Worrying,
  standing: BoyAnimKeys.Standing,
  hug: BoyAnimKeys.Hug,
}

const STATE_PRIORITY: Record<BoyState, number> = {
  worrying: 0,
  standing: 1,
  hug: 2,
}

/**
 * A stationary NPC placed at the level's start. Purely visual: it has no physics
 * body and never moves, so it cannot affect the player's collisions or the
 * normal ending. It only swaps between the provided boy poses.
 */
export class BoyNPC {
  public readonly sprite: Phaser.GameObjects.Sprite

  private state: BoyState = "worrying"

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.add.sprite(x, y, `${BoyFramePrefix.Worrying}-0`)
    // Anchor at the feet so the NPC rests on the ground surface.
    this.sprite.setOrigin(0.5, 1)
    this.sprite.setScale(SECRET_ENDING.spriteScale)
    this.sprite.setDepth(5)
    // Faces right, toward the incoming player.
    this.sprite.setFlipX(false)
    this.sprite.play(BoyAnimKeys.Worrying)
  }

  get x(): number {
    return this.sprite.x
  }

  get y(): number {
    return this.sprite.y
  }

  /** Switch state, honouring priority so hug can never be interrupted. */
  setState(next: BoyState): void {
    if (next === this.state) {
      return
    }
    // Hug is terminal; nothing may downgrade it.
    if (this.state === "hug") {
      return
    }
    this.state = next
    this.sprite.play(STATE_TO_ANIM[next], true)
  }

  /** Convenience helpers used by the controller. */
  setWorryingOrStanding(playerClose: boolean): void {
    this.setState(playerClose ? "standing" : "worrying")
  }

  playHug(): void {
    this.state = "hug"
    this.sprite.play(STATE_TO_ANIM.hug, true)
  }

  isPriorityAtLeast(state: BoyState): boolean {
    return STATE_PRIORITY[this.state] >= STATE_PRIORITY[state]
  }

  destroy(): void {
    this.sprite.destroy()
  }
}
