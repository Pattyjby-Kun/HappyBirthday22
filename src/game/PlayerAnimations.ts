import Phaser from "phaser"

import jumpingArt from "./art/jumping.txt?raw"
import movingArt from "./art/moving.txt?raw"
import standingArt from "./art/standing.txt?raw"
import { PlayerAnimKeys, PlayerFramePrefix } from "./constants"

/**
 * These `.txt` files are "pixelart-to-css" exports: every animation keyframe is
 * a single `box-shadow` list where each shadow paints one 5px block at an
 * (x, y) offset. We parse those blocks back into pixels and bake one texture
 * per frame, then register Phaser animations from them — all done ONCE at boot.
 */

const GRID_STEP = 5

interface Pixel {
  x: number
  y: number
  color: string
}

// Matches a single block: "35px 15px 0 0 rgba(0, 0, 0, 1)".
const SHADOW_RE =
  /(-?\d+)px\s+(-?\d+)px\s+0\s+0\s+rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/g

// Matches each keyframe's box-shadow payload up to the "height" declaration.
// Some exports use standard CSS (`box-shadow:` / `height:`), others omit colons.
const BLOCK_RE = /box-shadow:?\s*([\s\S]*?);\s*height:?\s*/g

export function parseFrames(css: string): Pixel[][] {
  const frames: Pixel[][] = []
  let block: RegExpExecArray | null

  BLOCK_RE.lastIndex = 0
  while ((block = BLOCK_RE.exec(css)) !== null) {
    const payload = block[1]
    const pixels: Pixel[] = []

    SHADOW_RE.lastIndex = 0
    let shadow: RegExpExecArray | null
    while ((shadow = SHADOW_RE.exec(payload)) !== null) {
      pixels.push({
        x: parseInt(shadow[1], 10),
        y: parseInt(shadow[2], 10),
        color: `rgb(${shadow[3]}, ${shadow[4]}, ${shadow[5]})`,
      })
    }

    if (pixels.length > 0) {
      frames.push(pixels)
    }
  }

  return frames
}

/** One animation to bake: its texture-key prefix, Phaser anim key and timing. */
export interface AnimationSpec {
  /** Frame texture keys become `${prefix}-${index}`. */
  prefix: string
  /** Global Phaser animation key. */
  animKey: string
  frameRate: number
  /** Raw "pixelart-to-css" export text. */
  css: string
  /** Repeat count (-1 = loop forever, 0 = play once). Defaults to -1. */
  repeat?: number
}

/**
 * Bakes a texture per frame for every spec, using ONE shared bounding box across
 * the whole set so related poses stay pixel-aligned (feet/head don't jump around
 * when switching states). Registers a Phaser animation per spec. Runs once at
 * boot; re-baking after a game restart transparently replaces old textures/anims.
 *
 * This powers both the player (idle/run/jump) and the secret-ending sprites
 * (boy poses, girl hug, heart) without duplicating the parser.
 */
export function bakeAnimationSet(scene: Phaser.Scene, specs: AnimationSpec[]): void {
  const parsed = specs.map((spec) => ({ spec, frames: parseFrames(spec.css) }))

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const { frames } of parsed) {
    for (const frame of frames) {
      for (const pixel of frame) {
        minX = Math.min(minX, pixel.x)
        minY = Math.min(minY, pixel.y)
        maxX = Math.max(maxX, pixel.x)
        maxY = Math.max(maxY, pixel.y)
      }
    }
  }

  if (!Number.isFinite(minX)) {
    return
  }

  const cols = (maxX - minX) / GRID_STEP + 1
  const rows = (maxY - minY) / GRID_STEP + 1

  for (const { spec, frames } of parsed) {
    const frameKeys: Phaser.Types.Animations.AnimationFrame[] = []

    frames.forEach((pixels, index) => {
      const key = `${spec.prefix}-${index}`

      // Rebuild cleanly if the game was destroyed and recreated (exit/replay).
      if (scene.textures.exists(key)) {
        scene.textures.remove(key)
      }

      const canvas = scene.textures.createCanvas(key, cols, rows)
      if (!canvas) {
        return
      }

      const ctx = canvas.getContext()
      for (const pixel of pixels) {
        ctx.fillStyle = pixel.color
        ctx.fillRect((pixel.x - minX) / GRID_STEP, (pixel.y - minY) / GRID_STEP, 1, 1)
      }
      canvas.refresh()

      frameKeys.push({ key })
    })

    if (frameKeys.length === 0) {
      console.warn(
        `[PlayerAnimations] No frames parsed for "${spec.animKey}" — check the .txt export format.`,
      )
      continue
    }

    if (scene.anims.exists(spec.animKey)) {
      scene.anims.remove(spec.animKey)
    }
    scene.anims.create({
      key: spec.animKey,
      frames: frameKeys,
      frameRate: spec.frameRate,
      repeat: spec.repeat ?? -1,
    })
  }
}

/**
 * Bakes the idle/run/jump player animations from a shared bounding box.
 * Returns the first idle frame key so the sprite has a valid initial texture.
 */
export function createPlayerAnimations(scene: Phaser.Scene): string {
  bakeAnimationSet(scene, [
    { prefix: PlayerFramePrefix.Idle, animKey: PlayerAnimKeys.Idle, frameRate: 6, css: standingArt },
    { prefix: PlayerFramePrefix.Run, animKey: PlayerAnimKeys.Run, frameRate: 8, css: movingArt },
    { prefix: PlayerFramePrefix.Jump, animKey: PlayerAnimKeys.Jump, frameRate: 8, css: jumpingArt },
  ])

  return `${PlayerFramePrefix.Idle}-0`
}
