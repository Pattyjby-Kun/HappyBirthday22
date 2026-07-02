import { audioManager } from "../audio"
import { SoundKeys } from "../audio/sounds"
import { getCharacterRole, type CharacterId } from "./characters"

/** Characters that should NOT trigger a speech blip. */
const SKIP_CHARS = /[\s.,!?…“”"'`~()[\]{}<>:;\-—_/\\|]/

/**
 * Plays soft, pitch-randomised speech "blips" as the dialogue types out — the
 * retro visual-novel / Animal-Crossing effect. Instances are pooled by the
 * AudioManager and throttled here so blips never overlap excessively.
 */
export class DialogueAudio {
  private lastPlayAt = 0
  /** Base minimum gap between blips (randomised per call). */
  private readonly baseIntervalMs = 55

  /** Call for each typed character. Skips spaces/punctuation. */
  onCharacter(speaker: CharacterId, char: string): void {
    if (SKIP_CHARS.test(char)) {
      return
    }

    // Random spacing so rapid typing doesn't sound robotic / machine-gun.
    const now = performance.now()
    const gate = this.baseIntervalMs + Math.random() * 30
    if (now - this.lastPlayAt < gate) {
      return
    }
    this.lastPlayAt = now

    const role = getCharacterRole(speaker)
    const key = role === "boy" ? SoundKeys.BoyTalk : SoundKeys.GirlTalk
    const volume = 0.2 + Math.random() * 0.05 // 0.20–0.25
    const rate = 0.96 + Math.random() * 0.08 // 0.96–1.04

    audioManager.playVoiceBlip(key, { volume, rate })
  }

  reset(): void {
    this.lastPlayAt = 0
  }
}
