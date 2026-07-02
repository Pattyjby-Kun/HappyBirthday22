import type Phaser from "phaser"

import { BoyAnimKeys, GirlAnimKeys, PlayerAnimKeys } from "../constants"
import { getCharacterRole, type CharacterId } from "./characters"
import type { DialogueAnimation, DialogueLine } from "./script"

/** Dialogue animation states per character role. */
export type BoyState = "standing" | "talking" | "worrying" | "hug"
export type GirlState = "idle" | "talking" | "angry" | "hug"
export type DialogueState = BoyState | GirlState

const BOY_ANIM: Record<BoyState, string> = {
  standing: BoyAnimKeys.Standing,
  talking: BoyAnimKeys.Talking,
  worrying: BoyAnimKeys.Worrying,
  hug: BoyAnimKeys.Hug,
}

const GIRL_ANIM: Record<GirlState, string> = {
  idle: PlayerAnimKeys.Idle,
  talking: GirlAnimKeys.Talking,
  angry: GirlAnimKeys.Angry,
  hug: GirlAnimKeys.Hug,
}

const BOY_NEUTRAL: BoyState = "standing"
const GIRL_NEUTRAL: GirlState = "idle"

/**
 * Resolves which pose to play from dialogue metadata.
 *
 * Priority: dialogue.animation → talking → idle/standing (neutral fallback).
 */
export function resolveDialogueState(
  _speaker: CharacterId,
  animation?: DialogueAnimation,
): DialogueState {
  if (animation) {
    return animation
  }
  return "talking"
}

export function resolveNeutralState(speaker: CharacterId): DialogueState {
  return getCharacterRole(speaker) === "boy" ? BOY_NEUTRAL : GIRL_NEUTRAL
}

/**
 * Maps (character, state) to a baked Phaser animation key via the internal
 * boy/girl role, stops the current clip, and plays the requested pose.
 */
export class AnimationController {
  private readonly scene: Phaser.Scene

  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  /** Play the pose dictated by a full dialogue line (metadata-driven). */
  playForLine(sprite: Phaser.GameObjects.Sprite, line: DialogueLine): string {
    const state = resolveDialogueState(line.speaker, line.animation)
    return this.play(sprite, line.speaker, state)
  }

  playNeutral(sprite: Phaser.GameObjects.Sprite, speaker: CharacterId): string {
    return this.play(sprite, speaker, resolveNeutralState(speaker))
  }

  play(sprite: Phaser.GameObjects.Sprite, speaker: CharacterId, state: DialogueState): string {
    const key = this.resolveAnimKey(speaker, state)
    if (!this.scene.anims.exists(key)) {
      console.warn(
        `[AnimationController] Missing animation "${key}" for ${speaker}/${state}`,
      )
      return key
    }

    sprite.anims.stop()
    sprite.play(key, true)

    return key
  }

  /**
   * Resolve anim key with priority fallbacks:
   * requested state → talking → neutral (standing/idle).
   */
  private resolveAnimKey(speaker: CharacterId, state: DialogueState): string {
    const role = getCharacterRole(speaker)
    const table = role === "boy" ? BOY_ANIM : GIRL_ANIM
    const neutral = role === "boy" ? BoyAnimKeys.Standing : PlayerAnimKeys.Idle
    const talking = role === "boy" ? BoyAnimKeys.Talking : GirlAnimKeys.Talking

    const candidates = [
      (table as Record<string, string>)[state],
      talking,
      neutral,
    ].filter(Boolean)

    for (const key of candidates) {
      if (this.scene.anims.exists(key)) {
        return key
      }
    }

    return neutral
  }
}
