import styled from "styled-components"

import { pixelButtonCss } from "@/styles/pixelButton"

const StyledButton = styled.button`
  ${pixelButtonCss}
  font-size: 1rem;
  padding: 1.25rem 2.5rem;
`

interface PlayButtonProps {
  onClick?: () => void
}

function PlayButton({ onClick }: PlayButtonProps) {
  return <StyledButton onClick={onClick}>Play</StyledButton>
}

export default PlayButton
