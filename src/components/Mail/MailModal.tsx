import { useEffect, useState } from "react"

import MailContent from "./MailContent"
import MailEmpty from "./MailEmpty"
import MailList from "./MailList"
import type { Mail } from "./mailData"
import { PIXEL_FONT } from "./mailData"

interface MailModalProps {
  isOpen: boolean
  onClose: () => void
  mails: ReadonlyArray<Mail>
}

function MailModal({ isOpen, onClose, mails }: MailModalProps) {
  const [selectedId, setSelectedId] = useState<string>("")

  // Keep a valid selection whenever the mail list changes (e.g. after unlock).
  useEffect(() => {
    if (mails.length > 0 && !mails.some((mail) => mail.id === selectedId)) {
      setSelectedId(mails[0].id)
    }
  }, [mails, selectedId])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    // Capture-phase listener so ESC closes the modal without also reaching
    // the Phaser keyboard handler (which would exit the game).
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown, { capture: true })
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true })
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  const hasMail = mails.length > 0
  const selectedMail = mails.find((mail) => mail.id === selectedId) ?? mails[0]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 sm:p-4"
      onClick={onClose}
      style={{
        paddingTop: "max(0.5rem, env(safe-area-inset-top))",
        paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
        paddingLeft: "max(0.5rem, env(safe-area-inset-left))",
        paddingRight: "max(0.5rem, env(safe-area-inset-right))",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Mail"
        onClick={(event) => event.stopPropagation()}
        className="flex h-[90%] max-h-full w-[95%] max-w-full flex-col border-2 border-white bg-[#0f1030] shadow-[10px_10px_0_0_rgba(0,0,0,0.6)] md:h-[80%] md:w-[85%] lg:h-[75%] lg:w-[75%]"
      >
        <header
          className="flex items-center justify-between border-b-2 border-white/30 px-3 py-2 sm:px-4 sm:py-3"
          style={{ fontFamily: PIXEL_FONT }}
        >
          <span className="text-xs tracking-widest text-white uppercase sm:text-sm">Mail</span>
        </header>

        {/* Vertical stack on phones, side-by-side from md up. */}
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          {hasMail && selectedMail ? (
            <>
              <div className="max-h-[30%] w-full shrink-0 overflow-hidden border-b-2 border-white/30 bg-[#14153a] md:max-h-none md:w-[30%] md:min-w-[150px] md:border-r-2 md:border-b-0">
                <MailList mails={mails} selectedId={selectedMail.id} onSelect={setSelectedId} />
              </div>
              <div className="min-h-0 min-w-0 flex-1 p-3 sm:p-5">
                <MailContent mail={selectedMail} />
              </div>
            </>
          ) : (
            <MailEmpty />
          )}
        </div>

        <footer className="flex shrink-0 justify-end border-t-2 border-white/30 p-2 sm:p-3">
          <button
            type="button"
            onClick={onClose}
            className="border-2 border-white/70 bg-black/50 px-3 py-2 text-[10px] tracking-widest text-white uppercase transition-colors hover:bg-white hover:text-black sm:px-4 sm:text-xs"
            style={{ fontFamily: PIXEL_FONT }}
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  )
}

export default MailModal
