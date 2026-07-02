import { useCallback, useEffect, useReducer, useRef, useState } from "react"

import { DialogueManager } from "./DialogueManager"
import type { DialogueLine } from "./script"
import { useTypewriter } from "./Typewriter"

/** High-level phases of the visual novel. */
export type VNPhase = "dialogue" | "finalHug" | "happyEnding"

export interface VNSceneState {
  phase: VNPhase
  /** Index of the current dialogue line (used to key page transitions). */
  index: number
  line: DialogueLine | undefined
  /** Text revealed so far by the typewriter. */
  text: string
  isTyping: boolean
  /** True when the "continue" indicator should show. */
  showContinue: boolean
  /** Advance the story: skip typing, go to next line, or start the final hug. */
  advance: () => void
}

/** Zoom-in (≈1.6s) + ~2s hold + fade before the happy-ending screen. */
const FINAL_HUG_MS = 2600

/**
 * Drives the whole visual novel: dialogue progression (via DialogueManager +
 * typewriter), then the final hug beat, then the happy ending. Pure logic — the
 * components just render whatever this returns.
 */
export function useVNScene(lines: readonly DialogueLine[]): VNSceneState {
  const managerRef = useRef<DialogueManager | null>(null)
  if (!managerRef.current) {
    managerRef.current = new DialogueManager(lines)
  }
  const manager = managerRef.current

  const [, forceRender] = useReducer((n: number) => n + 1, 0)
  const [phase, setPhase] = useState<VNPhase>("dialogue")

  const line = manager.current
  const typing = useTypewriter(line?.text ?? "", 42, phase === "dialogue")

  const advance = useCallback(() => {
    if (phase !== "dialogue") {
      return
    }
    // First tap finishes the typewriter; second advances.
    if (!typing.done) {
      typing.skip()
      return
    }
    if (manager.isLast()) {
      setPhase("finalHug")
    } else {
      manager.next()
      forceRender()
    }
  }, [manager, phase, typing])

  // After the last line: play the final hug beat, then reveal the happy ending.
  useEffect(() => {
    if (phase !== "finalHug") {
      return
    }
    const id = window.setTimeout(() => setPhase("happyEnding"), FINAL_HUG_MS)
    return () => window.clearTimeout(id)
  }, [phase])

  return {
    phase,
    index: manager.currentIndex,
    line,
    text: typing.displayed,
    isTyping: !typing.done,
    showContinue: phase === "dialogue" && typing.done,
    advance,
  }
}
