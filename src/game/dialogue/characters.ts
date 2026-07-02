/**
 * Character registry for the secret-ending visual novel. Dialogue references
 * stable character IDs; display names and animation roles live here so future
 * stories can add cast members without touching the animation controllers.
 */

export const CharacterIds = {
  Press: "press",
  Tulip: "tulip",
} as const

export type CharacterId = (typeof CharacterIds)[keyof typeof CharacterIds]

/** Maps to the existing Boy / Girl animation controllers (asset keys unchanged). */
export type CharacterRole = "boy" | "girl"

export interface CharacterConfig {
  id: CharacterId
  displayName: string
  role: CharacterRole
  nameColor: string
}

export const CHARACTERS: Record<CharacterId, CharacterConfig> = {
  [CharacterIds.Press]: {
    id: CharacterIds.Press,
    displayName: "เพรส",
    role: "boy",
    nameColor: "#b39ddb",
  },
  [CharacterIds.Tulip]: {
    id: CharacterIds.Tulip,
    displayName: "ทิวลิป",
    role: "girl",
    nameColor: "#ff9ec4",
  },
}

export function getCharacter(id: CharacterId): CharacterConfig {
  return CHARACTERS[id]
}

export function getCharacterRole(id: CharacterId): CharacterRole {
  return CHARACTERS[id].role
}

export function getOtherCharacter(id: CharacterId): CharacterId {
  return id === CharacterIds.Press ? CharacterIds.Tulip : CharacterIds.Press
}

export function isBoyRole(id: CharacterId): boolean {
  return getCharacterRole(id) === "boy"
}
