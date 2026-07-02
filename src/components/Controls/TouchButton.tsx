import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type TouchEvent as ReactTouchEvent,
} from "react"
import styled from "styled-components"

import { pixelButtonCss } from "@/styles/pixelButton"

// Must follow pixelButtonCss: all: unset inherits pointer-events:none from the HUD wrapper.
const Button = styled.button`
  ${pixelButtonCss}
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 5.25rem;
  height: 5.25rem;
  font-size: 1.75rem;
  /* Prevent the browser from hijacking the press with scroll/zoom gestures. */
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
`

export interface TouchButtonHandle {
  /** Clears this button's input without affecting other buttons (multi-touch safe). */
  forceRelease: () => void
}

interface TouchButtonProps {
  children: ReactNode
  ariaLabel: string
  onPress: () => void
  onRelease?: () => void
  className?: string
}

/**
 * A large pixel-art button with independent pointer/touch tracking so multiple
 * buttons can be active at once (e.g. hold LEFT + tap JUMP). Each instance
 * tracks its own pointerId / touch identifier and only releases on that input.
 */
const TouchButton = forwardRef<TouchButtonHandle, TouchButtonProps>(function TouchButton(
  { children, ariaLabel, onPress, onRelease, className },
  ref,
) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const isPressedRef = useRef(false)
  const activePointerIdRef = useRef<number | null>(null)
  const activeTouchIdRef = useRef<number | null>(null)

  const releasePointerCapture = (pointerId: number): void => {
    const button = buttonRef.current
    if (!button || activePointerIdRef.current !== pointerId) {
      return
    }

    try {
      if (button.hasPointerCapture(pointerId)) {
        button.releasePointerCapture(pointerId)
      }
    } catch {
      // Capture may already be released by the browser (cancel / lost capture).
    }
    activePointerIdRef.current = null
  }

  const clearPress = (): void => {
    if (!isPressedRef.current) {
      return
    }
    isPressedRef.current = false
    onRelease?.()
  }

  const resetTracking = (): void => {
    const pointerId = activePointerIdRef.current
    if (pointerId !== null) {
      releasePointerCapture(pointerId)
    }
    activeTouchIdRef.current = null
    clearPress()
  }

  useImperativeHandle(ref, () => ({
    forceRelease: resetTracking,
  }))

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>): void => {
    event.preventDefault()

    if (isPressedRef.current) {
      return
    }

    // When pointer events are active, skip parallel touch tracking for this press.
    activeTouchIdRef.current = null

    try {
      event.currentTarget.setPointerCapture(event.pointerId)
      activePointerIdRef.current = event.pointerId
    } catch {
      activePointerIdRef.current = event.pointerId
    }

    isPressedRef.current = true
    onPress()
  }

  const handlePointerUp = (event: ReactPointerEvent<HTMLButtonElement>): void => {
    event.preventDefault()
    if (activePointerIdRef.current !== event.pointerId) {
      return
    }
    releasePointerCapture(event.pointerId)
    clearPress()
  }

  const handlePointerCancel = (event: ReactPointerEvent<HTMLButtonElement>): void => {
    event.preventDefault()
    if (activePointerIdRef.current !== event.pointerId) {
      return
    }
    releasePointerCapture(event.pointerId)
    clearPress()
  }

  const handleLostPointerCapture = (event: ReactPointerEvent<HTMLButtonElement>): void => {
    if (activePointerIdRef.current !== event.pointerId) {
      return
    }
    activePointerIdRef.current = null
    clearPress()
  }

  const handleTouchStart = (event: ReactTouchEvent<HTMLButtonElement>): void => {
    event.preventDefault()

    // Pointer path owns this press when a captured pointer is already active.
    if (activePointerIdRef.current !== null) {
      return
    }
    if (isPressedRef.current) {
      return
    }

    const touch = event.changedTouches[0]
    if (!touch) {
      return
    }

    activeTouchIdRef.current = touch.identifier
    isPressedRef.current = true
    onPress()
  }

  const endTouch = (event: ReactTouchEvent<HTMLButtonElement>): void => {
    event.preventDefault()
    if (activeTouchIdRef.current === null) {
      return
    }

    for (let index = 0; index < event.changedTouches.length; index += 1) {
      const touch = event.changedTouches[index]
      if (touch.identifier === activeTouchIdRef.current) {
        activeTouchIdRef.current = null
        clearPress()
        return
      }
    }
  }

  return (
    <Button
      ref={buttonRef}
      type="button"
      aria-label={ariaLabel}
      className={className}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onLostPointerCapture={handleLostPointerCapture}
      onTouchStart={handleTouchStart}
      onTouchEnd={endTouch}
      onTouchCancel={endTouch}
    >
      {children}
    </Button>
  )
})

export default TouchButton
