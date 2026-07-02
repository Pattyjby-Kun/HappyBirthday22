import { useEffect, useRef } from "react"
import type Phaser from "phaser"

import { createGame } from "@/game/createGame"
import type { TouchInputState } from "@/game/touchInput"

interface PhaserGameProps {
  /** Called when the game requests a return to the React shell (e.g. ESC). */
  onExit: () => void
  /** Called once all 20 coins are collected (mail becomes available). */
  onMailUnlocked?: () => void
  /** Called when the secret-ending talk prompt should show/hide (touch TALK button). */
  onHugPrompt?: (visible: boolean) => void
  /** Called when dialogue mode begins — React hides the HUD / touch controls. */
  onVnStart?: () => void
  /** Called at the very end of the secret ending — React returns to the menu. */
  onVnEnd?: () => void
  /** Shared touch-input state written by the on-screen controls. */
  touchInput?: TouchInputState
}

function PhaserGame({
  onExit,
  onMailUnlocked,
  onHugPrompt,
  onVnStart,
  onVnEnd,
  touchInput,
}: PhaserGameProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const gameRef = useRef<Phaser.Game | null>(null)

  useEffect(() => {
    if (!containerRef.current || gameRef.current) {
      return
    }

    const game = createGame(containerRef.current)
    gameRef.current = game

    return () => {
      game.destroy(true)
      gameRef.current = null
    }
  }, [])

  // Keep the exit callback and touch-input state available to the scenes.
  useEffect(() => {
    gameRef.current?.registry.set("onExit", onExit)
  }, [onExit])

  useEffect(() => {
    if (touchInput) {
      gameRef.current?.registry.set("touchInput", touchInput)
    }
  }, [touchInput])

  // Forward the in-game "mail unlocked" event to React.
  useEffect(() => {
    const game = gameRef.current
    if (!game || !onMailUnlocked) {
      return
    }

    game.events.on("mail-unlocked", onMailUnlocked)
    return () => {
      game.events.off("mail-unlocked", onMailUnlocked)
    }
  }, [onMailUnlocked])

  // Forward the secret-ending hug prompt toggle to React (for the touch button).
  useEffect(() => {
    const game = gameRef.current
    if (!game || !onHugPrompt) {
      return
    }

    game.events.on("secret-hug-prompt", onHugPrompt)
    return () => {
      game.events.off("secret-hug-prompt", onHugPrompt)
    }
  }, [onHugPrompt])

  // Forward "dialogue mode started" so React can hide the HUD.
  useEffect(() => {
    const game = gameRef.current
    if (!game || !onVnStart) {
      return
    }

    game.events.on("secret-vn-start", onVnStart)
    return () => {
      game.events.off("secret-vn-start", onVnStart)
    }
  }, [onVnStart])

  // Forward "secret ending finished" so React returns to the menu.
  useEffect(() => {
    const game = gameRef.current
    if (!game || !onVnEnd) {
      return
    }

    game.events.on("secret-vn-end", onVnEnd)
    return () => {
      game.events.off("secret-vn-end", onVnEnd)
    }
  }, [onVnEnd])

  return <div ref={containerRef} className="absolute inset-0" />
}

export default PhaserGame
