import Phaser from "phaser"

import { audioManager } from "./audio"
import {
  JUMP_VELOCITY,
  PLAYER_BODY_HEIGHT,
  PLAYER_BODY_WIDTH,
  PLAYER_SCALE,
  PLAYER_SPEED,
  PlayerAnimKeys,
  PlayerFramePrefix,
} from "./constants"

/** Movement intent for a single frame, gathered by the scene (keyboard/touch). */
export interface PlayerInput {
  left: boolean
  right: boolean
  jump: boolean
}

/**
 * Animation states, ordered by priority: Jump (highest) > Run > Idle (lowest).
 * New states (attack, hurt, celebrate, sit, wave, sleep, ...) can be added here
 * and to STATE_TO_ANIM without touching the movement code below.
 */
export type PlayerAnimState = "idle" | "run" | "jump"

const STATE_TO_ANIM: Record<PlayerAnimState, string> = {
  idle: PlayerAnimKeys.Idle,
  run: PlayerAnimKeys.Run,
  jump: PlayerAnimKeys.Jump,
}

/**
 * Wraps the arcade sprite and owns movement, sprite flipping and the animation
 * state machine. The physics body is forced to the original dimensions so the
 * art swap does not affect collisions, gravity or jump height.
 */
export class Player {
  public readonly sprite: Phaser.Physics.Arcade.Sprite

  private currentState: PlayerAnimState = "idle"
  /** Tracks ground contact so jump SFX fires once when leaving the ground upward. */
  private wasOnGround = true

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add.sprite(x, y, `${PlayerFramePrefix.Idle}-0`)

    // Enlarge the visual using Phaser scaling only (no stretching). Arcade keeps
    // the body in sync with the game object's scale, so the body below stays the
    // same shape, just 1.75x larger to match the sprite.
    this.sprite.setScale(PLAYER_SCALE)

    this.sprite.setCollideWorldBounds(true)
    this.sprite.setBounce(0)
    // center=true keeps the body centered on the frame; the offset is scaled with
    // the sprite, so the sprite stays centered on its physics body after scaling.
    this.sprite.body?.setSize(PLAYER_BODY_WIDTH, PLAYER_BODY_HEIGHT, true)

    this.sprite.play(STATE_TO_ANIM.idle)
  }

  /**
   * Applies movement + flipping (identical to the original scene logic) and then
   * resolves the animation state. Never modifies gravity, speed or jump values.
   */
  update(input: PlayerInput): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    const onGround = body.blocked.down || body.touching.down

    if (input.left && !input.right) {
      this.sprite.setVelocityX(-PLAYER_SPEED)
      this.sprite.setFlipX(true)
    } else if (input.right && !input.left) {
      this.sprite.setVelocityX(PLAYER_SPEED)
      this.sprite.setFlipX(false)
    } else {
      this.sprite.setVelocityX(0)
    }

    if (input.jump && onGround) {
      this.sprite.setVelocityY(JUMP_VELOCITY)
    }

    // Jump SFX: once when airborne with upward velocity (not on button hold).
    if (this.wasOnGround && !onGround && body.velocity.y < 0) {
      audioManager.playJump()
    }
    this.wasOnGround = onGround

    const isWalking = onGround && Math.abs(body.velocity.x) > 1
    audioManager.setWalking(isWalking)

    this.updateAnimation(onGround)
  }

  /**
   * Chooses the animation from velocity + ground contact, honouring priority so
   * idle can never interrupt a jump. Landing naturally falls through to Run (if
   * still moving horizontally) or Idle.
   */
  private updateAnimation(onGround: boolean): void {
    const velocityX = (this.sprite.body as Phaser.Physics.Arcade.Body).velocity.x

    let nextState: PlayerAnimState
    if (!onGround) {
      nextState = "jump"
    } else if (Math.abs(velocityX) > 1) {
      nextState = "run"
    } else {
      nextState = "idle"
    }

    if (nextState !== this.currentState) {
      this.currentState = nextState
      // ignoreIfPlaying=true prevents restarting the clip every frame.
      this.sprite.play(STATE_TO_ANIM[nextState], true)
    }
  }
}
