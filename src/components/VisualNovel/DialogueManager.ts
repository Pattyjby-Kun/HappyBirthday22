import type { DialogueLine } from "./script"

/**
 * Framework-agnostic cursor over a list of dialogue lines. Holds no React state
 * so it can be unit-tested or reused for any future scripted sequence.
 */
export class DialogueManager {
  private index = 0
  private readonly lines: readonly DialogueLine[]

  constructor(lines: readonly DialogueLine[]) {
    this.lines = lines
  }

  get length(): number {
    return this.lines.length
  }

  get currentIndex(): number {
    return this.index
  }

  get current(): DialogueLine | undefined {
    return this.lines[this.index]
  }

  isLast(): boolean {
    return this.index >= this.lines.length - 1
  }

  /** Advance to the next line. Returns false if already on the last line. */
  next(): boolean {
    if (this.isLast()) {
      return false
    }
    this.index += 1
    return true
  }

  reset(): void {
    this.index = 0
  }
}
