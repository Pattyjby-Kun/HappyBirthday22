export const SceneKeys = {
  Boot: "BootScene",
  Menu: "MenuScene",
  Level1: "Level1Scene",
  /** Secret-ending visual-novel dialogue (launched over Level1). */
  Dialogue: "DialogueScene",
} as const

export const TextureKeys = {
  Player: "player",
  Coin: "coin",
  Platform: "platform",
  Ground: "ground",
  Door: "door",
} as const

export const GAME_WIDTH = 960
export const GAME_HEIGHT = 540

export const LEVEL_WIDTH = 2400

export const TOTAL_COINS = 20

export const PLAYER_SPEED = 220
export const JUMP_VELOCITY = -560
export const GRAVITY_Y = 900

// Physics body kept identical to the original placeholder sprite so collisions,
// gravity and jump behaviour are byte-for-byte unchanged after the art swap.
export const PLAYER_BODY_WIDTH = 24
export const PLAYER_BODY_HEIGHT = 32

// Visual up-scale for the player. Arcade auto-scales the body with the game
// object, so the collision footprint keeps the same shape (just 1.75x larger)
// to match the enlarged sprite. Speed/jump/gravity are velocity-based and stay
// completely unchanged.
export const PLAYER_SCALE = 1.75

// Frame-texture key prefixes (each animation frame is its own generated texture).
export const PlayerFramePrefix = {
  Idle: "player-idle",
  Run: "player-run",
  Jump: "player-jump",
} as const

// Global animation keys registered once in BootScene.
export const PlayerAnimKeys = {
  Idle: "player-anim-idle",
  Run: "player-anim-run",
  Jump: "player-anim-jump",
} as const

// ---------------------------------------------------------------------------
// Secret ending (hidden Boy NPC + hug) — additive, does not touch normal play.
// ---------------------------------------------------------------------------

// Boy NPC / dialogue frame-texture prefixes (each pose baked from a .txt export).
export const BoyFramePrefix = {
  Standing: "boy-standing",
  Worrying: "boy-worrying",
  Hug: "boy-hug",
  /** Optional; provide boy-talking.txt to enable. Falls back to Standing. */
  Talking: "boy-talking",
} as const

// Boy animation keys (registered once in BootScene when the art exists).
export const BoyAnimKeys = {
  Standing: "boy-anim-standing",
  Worrying: "boy-anim-worrying",
  Hug: "boy-anim-hug",
  Talking: "boy-anim-talking",
} as const

// Girl (player) dialogue/hug poses. Girl "idle" reuses the player idle anim.
export const GirlFramePrefix = {
  Hug: "girl-hug",
  Angry: "girl-angry",
  /** Optional; provide girl-talking.txt to enable. Falls back to player Idle. */
  Talking: "girl-talking",
} as const

export const GirlAnimKeys = {
  Hug: "girl-anim-hug",
  Angry: "girl-anim-angry",
  Talking: "girl-anim-talking",
} as const

// Heart burst played once above the couple.
export const HeartFramePrefix = "heart"
export const HeartAnimKey = "heart-anim"

/** Tuning for the optional secret ending. Pure presentation — no physics impact. */
export const SECRET_ENDING = {
  /** NPC spawns here (the level's original start x). */
  npcStartX: 80,
  /** Within this horizontal distance the NPC switches Worrying → Standing. */
  approachDistance: 190,
  /** Within this distance the hug interaction becomes available. */
  interactionDistance: 70,
  /** Gap between the two sprites once aligned for the hug. */
  hugGap: 30,
  /** Sprites reuse the player's visual scale for a consistent look. */
  spriteScale: PLAYER_SCALE,
  heartScale: 1.4,
  cameraZoom: 1.15,
  cameraDurationMs: 600,
  /** Slow camera zoom during the final hug. */
  slowZoomMs: 1800,
  /** Hold on the final hug (~2s) before fading to the happy ending. */
  hugHoldMs: 2000,
  /** Fade-to-black duration. */
  fadeMs: 800,
} as const

export const FONT_FAMILY = '"Press Start 2P", monospace'

/**
 * Press Start 2P has no Thai glyphs, so Thai dialogue/body text uses a
 * Thai-capable system stack while UI labels stay in the pixel font.
 */
export const THAI_FONT_FAMILY =
  '"Noto Sans Thai", "Leelawadee UI", "Sarabun", "Tahoma", sans-serif'

export const Colors = {
  background: "#0b0b12",
  player: 0x8be9fd,
  playerDetail: 0x1b1b2a,
  coin: 0xffd447,
  coinHighlight: 0xfff2b0,
  platform: 0x4a3f6b,
  platformBorder: 0x8a7bb0,
  ground: 0x2f2740,
  groundBorder: 0x5a4d7a,
  door: 0x9b5de5,
  doorHandle: 0xf1c40f,
} as const
