import { PIXEL_FONT } from "./mailData"

/** Shown inside the modal when no mail exists yet (before 20 coins). */
function MailEmpty() {
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-4 p-6 text-center"
      style={{ fontFamily: PIXEL_FONT }}
    >
      <span className="text-6xl opacity-20 select-none sm:text-7xl" aria-hidden="true">
        {"\u{1F4ED}"}
      </span>
      <p className="text-sm text-white/40 sm:text-base">No Mail</p>
      <p className="max-w-xs text-[9px] leading-relaxed text-white/25 sm:text-[11px]">
        There are no messages right now.
      </p>
    </div>
  )
}

export default MailEmpty
