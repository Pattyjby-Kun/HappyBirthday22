import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react"

import LightRays from "@/components/LightRays"
import PlayButton from "@/components/PlayButton"
import Shuffle from "@/components/Shuffle"
import TouchControls from "@/components/Controls/TouchControls"
import MailModal from "@/components/Mail/MailModal"
import MailNotification from "@/components/Mail/MailNotification"
import { MAILS } from "@/components/Mail/mailData"
import { createTouchInputState, resetTouchInputState } from "@/game/touchInput"
import { audioManager } from "@/game/audio"
import { useIsTouchDevice } from "@/hooks/useIsTouchDevice"
import { useSafeArea } from "@/hooks/useSafeArea"
import { useTouchInputSafetyReset } from "@/hooks/useTouchInputSafetyReset"

const PhaserGame = lazy(() => import("@/components/PhaserGame"))

const NEW_MAIL_TOAST_MS = 3000

export function App() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [mailOpen, setMailOpen] = useState(false)
  const [mailRead, setMailRead] = useState(false)
  const [hasMail, setHasMail] = useState(false)
  const [showNewMailToast, setShowNewMailToast] = useState(false)
  const [showHugButton, setShowHugButton] = useState(false)
  const [vnActive, setVnActive] = useState(false)

  const isTouch = useIsTouchDevice()
  const safeArea = useSafeArea()

  // Stable shared object read by the Phaser scene and mutated by TouchControls.
  const touchInputRef = useRef(createTouchInputState())

  useTouchInputSafetyReset(touchInputRef.current, isPlaying)

  useEffect(() => {
    void audioManager.preload()
  }, [])

  const handlePlay = useCallback(() => {
    audioManager.unlock()
    audioManager.playClick()
    audioManager.transitionToGameplayMusic()
    setIsPlaying(true)
  }, [])

  const handleExit = useCallback(() => {
    audioManager.unlock()
    audioManager.playClick()
    audioManager.transitionToMenuMusic()
    setShowHugButton(false)
    resetTouchInputState(touchInputRef.current)
    setIsPlaying(false)
  }, [])

  const handleOpenMail = useCallback(() => {
    audioManager.unlock()
    audioManager.playClick()
    setMailOpen(true)
    // Only mark as read (and clear the badge) once a real mail exists.
    setHasMail((currentHasMail) => {
      if (currentHasMail) {
        setMailRead(true)
      }
      return currentHasMail
    })
  }, [])

  const handleCloseMail = useCallback(() => {
    audioManager.playClick()
    setMailOpen(false)
  }, [])

  const handleMailUnlocked = useCallback(() => {
    setHasMail(true)
    setShowNewMailToast(true)
  }, [])

  const handleHugPrompt = useCallback((visible: boolean) => {
    setShowHugButton(visible)
  }, [])

  const handleTalk = useCallback(() => {
    audioManager.unlock()
    // The Phaser secret-ending controller consumes this flag next frame.
    touchInputRef.current.hugQueued = true
  }, [])

  // Dialogue mode started in Phaser → hide the HUD / touch controls.
  // (Music is handled inside Phaser.)
  const handleVnStart = useCallback(() => {
    setShowHugButton(false)
    resetTouchInputState(touchInputRef.current)
    setVnActive(true)
  }, [])

  // Secret ending finished in Phaser → return to the main menu.
  const handleVnEnd = useCallback(() => {
    setVnActive(false)
    setIsPlaying(false)
  }, [])

  // Auto-dismiss the "NEW MAIL RECEIVED" toast after ~3 seconds.
  useEffect(() => {
    if (!showNewMailToast) {
      return
    }
    const timer = window.setTimeout(() => setShowNewMailToast(false), NEW_MAIL_TOAST_MS)
    return () => window.clearTimeout(timer)
  }, [showNewMailToast])

  const availableMails = hasMail ? MAILS : []

  if (isPlaying) {
    return (
      <div className="relative h-screen w-screen overflow-hidden bg-black">
        <Suspense
          fallback={
            <div className="absolute inset-0 flex items-center justify-center font-mono text-xs tracking-widest text-white uppercase">
              Loading…
            </div>
          }
        >
          <PhaserGame
            onExit={handleExit}
            onMailUnlocked={handleMailUnlocked}
            onHugPrompt={handleHugPrompt}
            onVnStart={handleVnStart}
            onVnEnd={handleVnEnd}
            touchInput={touchInputRef.current}
          />
        </Suspense>

        {/* Top HUD (Exit + Mail) — hidden during the secret-ending visual novel. */}
        {!vnActive && (
          <div
            className="absolute z-20 flex items-center gap-2"
            style={{ top: safeArea.top + 16, right: safeArea.right + 16 }}
          >
            <MailNotification showBadge={hasMail && !mailRead} onClick={handleOpenMail} />
            <button
              type="button"
              onClick={handleExit}
              className="border-2 border-white/70 bg-black/50 px-3 py-2 text-xs tracking-widest text-white uppercase transition-colors hover:bg-white hover:text-black"
            >
              Exit
            </button>
          </div>
        )}

        {/* NEW MAIL notification, shown briefly on unlock. */}
        {!vnActive && showNewMailToast && (
          <div
            className="absolute left-1/2 z-30 -translate-x-1/2 border-2 border-white bg-black/80 px-4 py-2 text-[10px] tracking-widest text-white uppercase shadow-[4px_4px_0_0_rgba(255,255,255,0.6)]"
            style={{
              top: safeArea.top + 72,
              fontFamily: '"Press Start 2P", monospace',
            }}
          >
            New Mail Received
          </div>
        )}

        {isTouch && !vnActive && <TouchControls touchInput={touchInputRef.current} />}

        {/* Secret-ending TALK button (touch only), shown when the NPC is in range. */}
        {isTouch && !vnActive && showHugButton && (
          <div
            className="pointer-events-none fixed bottom-0 left-1/2 z-40 flex -translate-x-1/2"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 6.5rem)" }}
          >
            <button
              type="button"
              onClick={handleTalk}
              aria-label="Talk"
              className="pointer-events-auto border-2 border-white bg-pink-600/80 px-6 py-3 text-xs tracking-widest text-white uppercase shadow-[4px_4px_0_0_rgba(0,0,0,0.5)] transition-colors hover:bg-pink-500"
              style={{ fontFamily: '"Press Start 2P", monospace' }}
            >
              Talk
            </button>
          </div>
        )}

        {!vnActive && (
          <MailModal isOpen={mailOpen} onClose={handleCloseMail} mails={availableMails} />
        )}
      </div>
    )
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <LightRays
        raysOrigin="top-center"
        raysColor="#ffffff"
        raysSpeed={1}
        lightSpread={0.5}
        rayLength={3}
        followMouse={true}
        mouseInfluence={0.1}
        noiseAmount={0}
        distortion={0}
        className="custom-rays"
        pulsating={false}
        fadeDistance={1}
        saturation={1}
      />
      <div className="pointer-events-none absolute inset-x-0 top-[9%] z-10 flex justify-center px-6">
        <Shuffle
          text="Letter"
          shuffleDirection="right"
          duration={0.35}
          animationMode="evenodd"
          shuffleTimes={1}
          ease="power3.out"
          stagger={0.03}
          threshold={0.1}
          triggerOnce={true}
          triggerOnHover={true}
          respectReducedMotion={true}
          className="pointer-events-auto text-[3rem] text-white"
        />
      </div>
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <PlayButton onClick={handlePlay} />
      </div>
    </div>
  )
}

export default App
