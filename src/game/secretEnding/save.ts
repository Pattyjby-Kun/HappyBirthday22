/**
 * Minimal persistent save. The game does not require save data to run, so every
 * access is wrapped defensively (private mode / SSR / disabled storage all
 * fail silently without affecting gameplay).
 */

const SAVE_KEY = "hbdtogf.save"

interface SaveData {
  secretEndingUnlocked?: boolean
  [key: string]: unknown
}

function readSave(): SaveData {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY)
    return raw ? (JSON.parse(raw) as SaveData) : {}
  } catch {
    return {}
  }
}

function writeSave(data: SaveData): void {
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(data))
  } catch {
    // Storage unavailable — ignore, the ending still plays.
  }
}

/** Persist that the player discovered the secret ending. */
export function markSecretEndingUnlocked(): void {
  const data = readSave()
  data.secretEndingUnlocked = true
  writeSave(data)
}

export function isSecretEndingUnlocked(): boolean {
  return readSave().secretEndingUnlocked === true
}
