import type { CharacterRole } from "@/game/dialogue/characters"

/**
 * Tiny 8-bit face portraits drawn as crisp SVG pixels so they match the game's
 * pixel-art look without needing image assets. Each string row is one pixel row;
 * every character maps to a palette colour ("." = transparent).
 */

const BOY_ART = [
  "....HHHHHH....",
  "..HHHHHHHHHH..",
  ".HHHHHHHHHHHH.",
  ".HHSSSSSSSSHH.",
  ".HSSSSSSSSSSH.",
  ".SSEESSSSEESS.",
  ".SSSSSSSSSSSS.",
  ".SBSSSSSSSSBS.",
  ".SSSSMMMMSSSS.",
  ".SSSSSSSSSSSS.",
  "..SSSSSSSSSS..",
  "...CCCCCCCC...",
  "..CCCCCCCCCC..",
  ".CCCCCCCCCCCC.",
]

const GIRL_ART = [
  "....HHHHHH....",
  "..HHHHHHHHHH..",
  ".HHHHHHHHHHHH.",
  "HHHSSSSSSSSHHH",
  "HHSSSSSSSSSSHH",
  "HHSSEESSEESSHH",
  "HHSSSSSSSSSSHH",
  "HHSBSSSSSSBSHH",
  ".HSSSMMMMSSSH.",
  ".HSSSSSSSSSSH.",
  "..HSSSSSSSSH..",
  "...WCCCCCCW...",
  "..CCCCCCCCCC..",
  ".CCCCCCCCCCCC.",
]

const BOY_PALETTE: Record<string, string> = {
  H: "#5b4636",
  S: "#ffcdd2",
  E: "#1b1b2a",
  M: "#c2185b",
  B: "#ff8a9a",
  C: "#673ab7",
}

const GIRL_PALETTE: Record<string, string> = {
  H: "#8a5a3b",
  S: "#ffcdd2",
  E: "#1b1b2a",
  M: "#c2185b",
  B: "#ff8a9a",
  C: "#e75a7c",
  W: "#ff8fab",
}

interface PortraitProps {
  variant: CharacterRole
  /** Speaking character is highlighted; the other is dimmed. */
  active: boolean
}

function Portrait({ variant, active }: PortraitProps) {
  const rows = variant === "boy" ? BOY_ART : GIRL_ART
  const palette = variant === "boy" ? BOY_PALETTE : GIRL_PALETTE
  const cols = rows[0].length

  const pixels: React.ReactNode[] = []
  rows.forEach((row, y) => {
    Array.from(row).forEach((char, x) => {
      const color = palette[char]
      if (color) {
        pixels.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={color} />)
      }
    })
  })

  return (
    <div className={`vn-portrait ${active ? "vn-portrait--active" : "vn-portrait--dim"}`}>
      <svg
        className="vn-portrait__svg"
        viewBox={`0 0 ${cols} ${rows.length}`}
        shapeRendering="crispEdges"
        aria-hidden="true"
      >
        {pixels}
      </svg>
      <span className="vn-portrait__name">{variant}</span>
    </div>
  )
}

export default Portrait
