import { useEffect, useState } from "react"

/**
 * Detects touch-capable devices (phones, Android/iPad tablets, iPad Pro) at
 * runtime. Runs after mount so SSR/hydration is never assumed and desktop
 * keyboard behaviour is left untouched.
 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    const detect = (): boolean =>
      window.matchMedia("(pointer: coarse)").matches ||
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0

    setIsTouch(detect())

    // Hybrid devices (e.g. Surface, iPad + trackpad) can switch pointer types.
    const media = window.matchMedia("(pointer: coarse)")
    const onChange = () => setIsTouch(detect())
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [])

  return isTouch
}
