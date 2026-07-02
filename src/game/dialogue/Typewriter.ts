/**
 * Delta-driven typewriter. The owning scene calls `update(delta)` each frame;
 * every `speedMs` a new glyph is revealed and `onChar` fires (used for speech
 * blips). Iterates by Unicode code point so Thai/emoji aren't split.
 *
 * Framework-agnostic: no Phaser dependency, so it is trivially reusable/testable.
 */
export class Typewriter {
  private glyphs: string[] = []
  private visible = 0
  private accumulator = 0
  private speedMs = 35
  private onChar?: (char: string) => void

  /** Begin typing `text`; resets any previous state. */
  start(text: string, speedMs: number, onChar?: (char: string) => void): void {
    this.glyphs = Array.from(text)
    this.visible = 0
    this.accumulator = 0
    this.speedMs = speedMs
    this.onChar = onChar
  }

  /** Advance the reveal by the elapsed frame time (ms). */
  update(deltaMs: number): void {
    if (this.isDone) {
      return
    }
    this.accumulator += deltaMs
    while (this.accumulator >= this.speedMs && this.visible < this.glyphs.length) {
      this.accumulator -= this.speedMs
      const char = this.glyphs[this.visible]
      this.visible += 1
      this.onChar?.(char)
    }
  }

  /** Instantly reveal the full line (no per-char callbacks fired). */
  skip(): void {
    this.visible = this.glyphs.length
    this.accumulator = 0
  }

  get text(): string {
    return this.glyphs.slice(0, this.visible).join("")
  }

  get isDone(): boolean {
    return this.visible >= this.glyphs.length
  }
}
