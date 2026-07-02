import { useCallback, useEffect, useMemo, useState } from "react"

export interface TypewriterState {
  /** The portion of the text revealed so far. */
  displayed: string
  /** True once the whole text is shown. */
  done: boolean
  /** Instantly reveal the full text (used when the player taps mid-type). */
  skip: () => void
}

/**
 * Reveals `text` one character at a time. Automatically restarts whenever the
 * text changes (i.e. on each new dialogue line). Iterates by Unicode code point
 * so Thai/emoji don't get sliced mid-character.
 */
export function useTypewriter(text: string, speedMs = 42, enabled = true): TypewriterState {
  const glyphs = useMemo(() => Array.from(text), [text])
  const [count, setCount] = useState(enabled ? 0 : glyphs.length)

  // Reset the reveal when the line (or enabled) changes.
  useEffect(() => {
    setCount(enabled ? 0 : glyphs.length)
  }, [glyphs, enabled])

  // Tick one glyph at a time until the line is fully shown.
  useEffect(() => {
    if (!enabled || count >= glyphs.length) {
      return
    }
    const id = window.setTimeout(() => setCount((c) => c + 1), speedMs)
    return () => window.clearTimeout(id)
  }, [count, enabled, glyphs, speedMs])

  const skip = useCallback(() => setCount(glyphs.length), [glyphs.length])

  return {
    displayed: glyphs.slice(0, count).join(""),
    done: count >= glyphs.length,
    skip,
  }
}
