/**
 * Shared mutable input state bridging the React touch controls and the Phaser
 * scene. The React buttons write to it; `Level1Scene.update()` reads it and ORs
 * it with the keyboard input, so keyboard behaviour is completely unchanged.
 */
export interface TouchInputState {
  /** True while the LEFT button is held (mirrors holding the Left Arrow key). */
  left: boolean
  /** True while the RIGHT button is held (mirrors holding the Right Arrow key). */
  right: boolean
  /** Set true on a JUMP press; the scene consumes (resets) it so jump fires once per press. */
  jumpQueued: boolean
  /** Set true on a HUG press (secret ending); the controller consumes it once. */
  hugQueued: boolean
}

export function createTouchInputState(): TouchInputState {
  return { left: false, right: false, jumpQueued: false, hugQueued: false }
}
