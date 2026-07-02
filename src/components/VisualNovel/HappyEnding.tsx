import { useEffect, useState } from "react"

import { HAPPY_ENDING } from "./script"

interface HappyEndingProps {
  /** Called when the player taps to leave the ending (returns to the menu). */
  onDone: () => void
}

/**
 * Final centered pixel card. Becomes tappable after a short beat so the player
 * can read it before accidentally dismissing it.
 */
function HappyEnding({ onDone }: HappyEndingProps) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), 1400)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <div
      className="vn-happy"
      role="button"
      tabIndex={0}
      onClick={ready ? onDone : undefined}
    >
      <h1 className="vn-happy__header">{HAPPY_ENDING.header}</h1>
      <p className="vn-happy__body">{HAPPY_ENDING.body}</p>
      <div className="vn-happy__heart">{HAPPY_ENDING.heart}</div>
      <p className="vn-happy__footer">{HAPPY_ENDING.footer}</p>
      <div className={`vn-happy__hint ${ready ? "is-visible" : ""}`}>Tap to return</div>
    </div>
  )
}

export default HappyEnding
