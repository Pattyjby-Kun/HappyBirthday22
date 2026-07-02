import { useEffect, useState } from "react"

export interface SafeAreaInsets {
  top: number
  right: number
  bottom: number
  left: number
}

const ZERO_INSETS: SafeAreaInsets = { top: 0, right: 0, bottom: 0, left: 0 }

/**
 * Reads the CSS `env(safe-area-inset-*)` values (iPhone notch / Android cutouts)
 * by measuring an invisible probe element, and keeps them updated on resize and
 * orientation changes. Requires `viewport-fit=cover` in the viewport meta tag.
 */
export function useSafeArea(): SafeAreaInsets {
  const [insets, setInsets] = useState<SafeAreaInsets>(ZERO_INSETS)

  useEffect(() => {
    const probe = document.createElement("div")
    probe.style.cssText = [
      "position:fixed",
      "top:0",
      "left:0",
      "visibility:hidden",
      "pointer-events:none",
      "padding-top:env(safe-area-inset-top)",
      "padding-right:env(safe-area-inset-right)",
      "padding-bottom:env(safe-area-inset-bottom)",
      "padding-left:env(safe-area-inset-left)",
    ].join(";")
    document.body.appendChild(probe)

    const measure = (): void => {
      const styles = getComputedStyle(probe)
      setInsets({
        top: parseFloat(styles.paddingTop) || 0,
        right: parseFloat(styles.paddingRight) || 0,
        bottom: parseFloat(styles.paddingBottom) || 0,
        left: parseFloat(styles.paddingLeft) || 0,
      })
    }

    measure()
    window.addEventListener("resize", measure)
    window.addEventListener("orientationchange", measure)

    return () => {
      window.removeEventListener("resize", measure)
      window.removeEventListener("orientationchange", measure)
      probe.remove()
    }
  }, [])

  return insets
}
