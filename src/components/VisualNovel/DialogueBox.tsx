import { getCharacter, type CharacterId } from "./script"

interface DialogueBoxProps {
  speaker: CharacterId
  /** Text revealed so far (typewriter output). */
  text: string
  /** Show the "continue" hint once the line has fully typed out. */
  showContinue: boolean
}

/**
 * Large retro dialogue box pinned to the bottom of the screen: speaker label,
 * typewriter text, and a blinking continue indicator.
 */
function DialogueBox({ speaker, text, showContinue }: DialogueBoxProps) {
  const character = getCharacter(speaker)

  return (
    <div className="vn-dialogue">
      <div
        className={`vn-dialogue__speaker vn-dialogue__speaker--${character.role}`}
        style={{ color: character.nameColor }}
      >
        {character.displayName}
      </div>

      <p className="vn-dialogue__text">
        {text}
        <span className="vn-caret" aria-hidden="true" />
      </p>

      <div className={`vn-dialogue__continue ${showContinue ? "is-visible" : ""}`}>
        Press Space / Tap to Continue ▸
      </div>
    </div>
  )
}

export default DialogueBox
