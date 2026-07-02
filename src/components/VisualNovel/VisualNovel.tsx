import { useEffect } from "react"

import DialogueBox from "./DialogueBox"
import HappyEnding from "./HappyEnding"
import Portrait from "./Portrait"
import { getCharacterRole, SECRET_ENDING_DIALOGUE } from "./script"
import { useVNScene } from "./VNScene"
import "./VisualNovel.css"

interface VisualNovelProps {
  /** Called when the ending is fully finished (returns to the main menu). */
  onComplete: () => void
}

/**
 * Full-screen retro visual novel shown after the secret hug. Owns none of the
 * story logic itself — it renders whatever `useVNScene` reports and forwards
 * player input (space/enter/click/tap) as "advance".
 */
function VisualNovel({ onComplete }: VisualNovelProps) {
  const vn = useVNScene(SECRET_ENDING_DIALOGUE)

  // Desktop: Space / Enter advance the dialogue.
  useEffect(() => {
    if (vn.phase !== "dialogue") {
      return
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault()
        vn.advance()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [vn])

  const speaker = vn.line?.speaker
  const inHug = vn.phase === "finalHug"

  return (
    <div
      className="vn-root"
      // Mobile / mouse: tap anywhere advances during dialogue.
      onClick={vn.phase === "dialogue" ? vn.advance : undefined}
    >
      {vn.phase !== "happyEnding" && (
        <div className={`vn-stage ${inHug ? "vn-stage--hug" : ""}`}>
          <Portrait variant="boy" active={inHug || (speaker != null && getCharacterRole(speaker) === "boy")} />
          {inHug && <div className="vn-stage__heart">❤️</div>}
          <Portrait variant="girl" active={inHug || (speaker != null && getCharacterRole(speaker) === "girl")} />
        </div>
      )}

      {vn.phase === "dialogue" && vn.line && (
        // Keyed by line index so each page fades in (page transition).
        <div key={vn.index} className="vn-page">
          <DialogueBox speaker={vn.line.speaker} text={vn.text} showContinue={vn.showContinue} />
        </div>
      )}

      {/* Fade-to-black that covers the final hug just before the happy ending. */}
      {inHug && <div className="vn-fadeblack" />}

      {vn.phase === "happyEnding" && <HappyEnding onDone={onComplete} />}
    </div>
  )
}

export default VisualNovel
