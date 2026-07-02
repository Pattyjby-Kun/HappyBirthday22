import { useEffect } from "react"

import { resetTouchInputState, type TouchInputState } from "@/game/touchInput"

/**
 * Clears touch movement flags when the page loses focus so a held direction
 * cannot stay stuck after app-switch, tab hide, or system overlay.
 */
export function useTouchInputSafetyReset(state: TouchInputState, enabled: boolean): void {
  useEffect(() => {
    if (!enabled) {
      return
    }

    const reset = (): void => {
      resetTouchInputState(state)
    }

    const onVisibilityChange = (): void => {
      if (document.visibilityState === "hidden") {
        reset()
      }
    }

    window.addEventListener("blur", reset)
    document.addEventListener("visibilitychange", onVisibilityChange)

    return () => {
      window.removeEventListener("blur", reset)
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [state, enabled])
}
