/**
 * Central registry of music tracks, sound-effect keys, and asset paths.
 *
 * Files live under Vite's public folder:
 * - public/assets/audio/music/
 * - public/assets/audio/sfx/
 *
 * To add a new sound later:
 * 1. Drop the file into the appropriate folder above.
 * 2. Add the key and URL here.
 * 3. Add a typed helper on AudioManager — no rewrite of existing logic required.
 */

const AUDIO_ROOT = "/assets/audio"
const MUSIC_ROOT = `${AUDIO_ROOT}/music`
const SFX_ROOT = `${AUDIO_ROOT}/sfx`

// ---------------------------------------------------------------------------
// Music
// ---------------------------------------------------------------------------

export const MusicKeys = {
  Menu: "menu",
  Gameplay: "gameplay",
  /** Calm, emotional track for the secret-ending visual novel. */
  Vn: "vn",
} as const

export type MusicKey = (typeof MusicKeys)[keyof typeof MusicKeys]

/** Default music master volume (0–1). */
export const DEFAULT_MUSIC_VOLUME = 0.45

/** VN music is intentionally very soft: master volume is scaled by this factor. */
export const VN_MUSIC_VOLUME_SCALE = 0.55

/** Menu → gameplay hand-off: fade out menu music over this duration. */
export const MENU_FADE_OUT_MS = 1000

/** Gameplay music fade-in duration after menu fades out. */
export const GAMEPLAY_FADE_IN_MS = 1500

export const MUSIC_URLS: Record<MusicKey, string> = {
  [MusicKeys.Menu]: `${MUSIC_ROOT}/gamestart.mp3`,
  /** On-disk filename includes a space — URL-encoded for browser fetch. */
  [MusicKeys.Gameplay]: `${MUSIC_ROOT}/background%20sound.mp3`,
  /** Optional; drop emotional.mp3 in music/ for the VN. Missing = silent VN. */
  [MusicKeys.Vn]: `${MUSIC_ROOT}/emotional.mp3`,
}

// ---------------------------------------------------------------------------
// Sound effects
// ---------------------------------------------------------------------------

export const SoundKeys = {
  Coin: "coin",
  Jump: "jump",
  Walking: "walking",
  Click: "click",
  Mail: "mail",
  Victory: "victory",
  /** Per-character speech blips for the dialogue (Animal-Crossing style). */
  BoyTalk: "boytalk",
  GirlTalk: "girltalk",
} as const

export type SoundKey = (typeof SoundKeys)[keyof typeof SoundKeys]

/**
 * Reserved for future SFX — add URLs and helpers when files are ready:
 * Door, Paper, Letter, Hover, Error
 */
export type FutureSoundKey = "door" | "paper" | "letter" | "hover" | "error"

/** Default SFX master volume (0–1). */
export const DEFAULT_SFX_VOLUME = 0.65

/** Minimum gap between coin plays to avoid harsh overlap on rapid collection. */
export const COIN_MIN_INTERVAL_MS = 90

/** Pool size for one-shot SFX — allows a few overlapping instances (e.g. coins). */
export const SOUND_POOL_SIZE = 4

export const SOUND_URLS: Record<SoundKey, string> = {
  [SoundKeys.Coin]: `${SFX_ROOT}/getcoin.wav`,
  [SoundKeys.Jump]: `${SFX_ROOT}/jumpsound.wav`,
  [SoundKeys.Walking]: `${SFX_ROOT}/walking.mp3`,
  [SoundKeys.Click]: `${SFX_ROOT}/click.mp3`,
  [SoundKeys.Mail]: `${SFX_ROOT}/mailalert.wav`,
  [SoundKeys.Victory]: `${SFX_ROOT}/vicotroy.mp3`,
  [SoundKeys.BoyTalk]: `${SFX_ROOT}/boytalk.wav`,
  [SoundKeys.GirlTalk]: `${SFX_ROOT}/girltalk.wav`,
}

/** Looping SFX keys managed as a single reused instance (never pooled). */
export const LOOPING_SFX_KEYS: ReadonlySet<SoundKey> = new Set([SoundKeys.Walking])

/** Every registered audio URL — useful for preload verification. */
export const ALL_AUDIO_URLS: readonly string[] = [
  ...Object.values(MUSIC_URLS),
  ...Object.values(SOUND_URLS),
]
