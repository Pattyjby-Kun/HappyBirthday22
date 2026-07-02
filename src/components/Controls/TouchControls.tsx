import { useEffect, useRef } from "react"

import { resetTouchInputState, type TouchInputState } from "@/game/touchInput"

import TouchButton, { type TouchButtonHandle } from "./TouchButton"

interface TouchControlsProps {
  touchInput: TouchInputState
}

/**
 * On-screen movement controls for touch devices. Buttons mutate the shared
 * `touchInput` object which the Phaser scene reads each frame. LEFT and RIGHT
 * are mutually exclusive; JUMP is independent and can combine with either.
 */
function TouchControls({ touchInput }: TouchControlsProps) {
  const leftButtonRef = useRef<TouchButtonHandle>(null)
  const rightButtonRef = useRef<TouchButtonHandle>(null)

  useEffect(() => {
    return () => {
      resetTouchInputState(touchInput)
    }
  }, [touchInput])

  const pressLeft = (): void => {
    touchInput.right = false
    rightButtonRef.current?.forceRelease()
    touchInput.left = true
  }

  const releaseLeft = (): void => {
    touchInput.left = false
  }

  const pressRight = (): void => {
    touchInput.left = false
    leftButtonRef.current?.forceRelease()
    touchInput.right = true
  }

  const releaseRight = (): void => {
    touchInput.right = false
  }

  return (
    <>
      {/* Bottom-left: LEFT / RIGHT (no UP button, per design). */}
      <div
        className="pointer-events-none fixed bottom-0 left-0 z-30 flex touch-none gap-4"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom) + 1.5rem)",
          paddingLeft: "calc(env(safe-area-inset-left) + 1.5rem)",
        }}
      >
        <TouchButton
          ref={leftButtonRef}
          ariaLabel="Move left"
          onPress={pressLeft}
          onRelease={releaseLeft}
        >
          {"\u2190"}
        </TouchButton>
        <TouchButton
          ref={rightButtonRef}
          ariaLabel="Move right"
          onPress={pressRight}
          onRelease={releaseRight}
        >
          {"\u2192"}
        </TouchButton>
      </div>

      {/* Bottom-right: JUMP (one press = one jump; scene consumes the flag). */}
      <div
        className="pointer-events-none fixed right-0 bottom-0 z-30 flex touch-none"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom) + 1.5rem)",
          paddingRight: "calc(env(safe-area-inset-right) + 1.5rem)",
        }}
      >
        <TouchButton
          ariaLabel="Jump"
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
