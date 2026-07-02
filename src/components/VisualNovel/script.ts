/**
 * Re-export the canonical dialogue data from the Phaser visual-novel module so
 * both runtimes stay in sync.
 */

export {
  HAPPY_ENDING,
  SECRET_ENDING_DIALOGUE,
  type DialogueLine,
} from "@/game/dialogue/script"

export {
  CharacterIds,
  getCharacter,
  getCharacterRole,
  type CharacterId,
} from "@/game/dialogue/characters"
