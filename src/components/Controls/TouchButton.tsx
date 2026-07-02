import type { PointerEvent as ReactPointerEvent, ReactNode, TouchEvent as ReactTouchEvent } from "react"
import styled from "styled-components"

import { pixelButtonCss } from "@/styles/pixelButton"

const Button = styled.button`
  ${pixelButtonCss}
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

interface TouchButtonProps {
  children: ReactNode
  ariaLabel: string
  onPress: () => void
  onRelease?: () => void
  className?: string
}

/**
 * A large pixel-art button that reports press/release via both Pointer and
 * Touch events. Pointer events give reliable release handling (leave/cancel)
 * while touch events satisfy explicit touchstart/touchend support.
 */
function TouchButton({ children, ariaLabel, onPress, onRelease, className }: TouchButtonProps) {
  const handlePress = (event: ReactPointerEvent | ReactTouchEvent): void => {
    event.preventDefault()
    onPress()
  }

  const handleRelease = (event: ReactPointerEvent | ReactTouchEvent): void => {
    event.preventDefault()
    onRelease?.()
  }

  return (
    <Button
      type="button"
      aria-label={ariaLabel}
      className={className}
      onPointerDown={handlePress}
      onPointerUp={handleRelease}
      onPointerLeave={handleRelease}
      onPointerCancel={handleRelease}
      onTouchStart={handlePress}
      onTouchEnd={handleRelease}
    >
      {children}
    </Button>
  )
}

export default TouchButton
