import { css } from "styled-components"

/**
 * Shared retro pixel-art button styling used by the PLAY button and the mobile
 * touch controls so they are visually identical: same border, pixel shadow,
 * colors, hover state, pressed animation and font.
 */
export const pixelButtonCss = css`
  all: unset;
  box-sizing: border-box;
  font-family: "Press Start 2P", sans-serif;
  color: #ffffff;
  background: transparent;
  border: 4px solid #ffffff;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: 6px 6px 0 0 #ffffff;
  transition:
    transform 0.1s ease,
    box-shadow 0.1s ease,
    background 0.15s ease,
    color 0.15s ease;

  &:hover {
    background: #ffffff;
    color: #000000;
  }

  &:active {
    transform: translate(6px, 6px);
    box-shadow: none;
  }
`
