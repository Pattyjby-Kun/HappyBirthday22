import type { TouchInputState } from "@/game/touchInput"

import TouchButton from "./TouchButton"

interface TouchControlsProps {
  touchInput: TouchInputState
}

/**
 * On-screen movement controls for touch devices. Buttons mutate the shared
 * `touchInput` object which the Phaser scene reads each frame. Containers are
 * offset by the safe-area insets so they clear rounded corners / home bars.
 */
function TouchControls({ touchInput }: TouchControlsProps) {
  return (
    <>
      {/* Bottom-left: LEFT / RIGHT (no UP button, per design). */}
      <div
        className="pointer-events-none fixed bottom-0 left-0 z-30 flex gap-4"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom) + 1.5rem)",
          paddingLeft: "calc(env(safe-area-inset-left) + 1.5rem)",
        }}
      >
        <TouchButton
          ariaLabel="Move left"
          className="pointer-events-auto"
          onPress={() => {
            touchInput.left = true
          }}
          onRelease={() => {
            touchInput.left = false
          }}
        >
          {"\u2190"}
        </TouchButton>
        <TouchButton
          ariaLabel="Move right"
          className="pointer-events-auto"
          onPress={() => {
            touchInput.right = true
          }}
          onRelease={() => {
            touchInput.right = false
          }}
        >
          {"\u2192"}
        </TouchButton>
      </div>

      {/* Bottom-right: JUMP (one press = one jump; scene consumes the flag). */}
      <div
        className="pointer-events-none fixed right-0 bottom-0 z-30 flex"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom) + 1.5rem)",
          paddingRight: "calc(env(safe-area-inset-right) + 1.5rem)",
        }}
      >
        <TouchButton
          ariaLabel="Jump"
          className="pointer-events-auto"
          onPress={() => {
            touchInput.jumpQueued = true
          }}
        >
          <span className="text-[0.65rem]">Jump</span>
        </TouchButton>
      </div>
    </>
  )
}

export default TouchControls
