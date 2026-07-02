import type { FC } from "react"

export interface LightRaysProps {
  raysOrigin?:
    | "top-center"
    | "top-left"
    | "top-right"
    | "left"
    | "right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right"
  raysColor?: string
  raysSpeed?: number
  lightSpread?: number
  rayLength?: number
  pulsating?: boolean
  fadeDistance?: number
  saturation?: number
  followMouse?: boolean
  mouseInfluence?: number
  noiseAmount?: number
  distortion?: number
  className?: string
}

declare const LightRays: FC<LightRaysProps>

export default LightRays
