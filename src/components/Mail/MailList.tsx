import type { Mail } from "./mailData"
import { PIXEL_FONT } from "./mailData"

interface MailListProps {
  mails: ReadonlyArray<Mail>
  selectedId: string
  onSelect: (id: string) => void
}

function MailList({ mails, selectedId, onSelect }: MailListProps) {
  return (
    <ul
      className="flex h-full flex-col gap-2 overflow-y-auto p-2 sm:p-3"
      style={{ fontFamily: PIXEL_FONT }}
    >
      {mails.map((mail) => {
        const isSelected = mail.id === selectedId
        return (
          <li key={mail.id}>
            <button
              type="button"
              onClick={() => onSelect(mail.id)}
              className={`w-full border-2 p-2 text-left transition-colors sm:p-3 ${
                isSelected
                  ? "border-white bg-[#2a2a5a]"
                  : "border-white/30 bg-transparent hover:border-white/60 hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-2">
                <svg
                  width={14}
                  height={14}
                  viewBox="0 0 16 16"
                  shapeRendering="crispEdges"
                  fill="none"
                  aria-hidden="true"
                  className="shrink-0"
                >
                  <rect x="1" y="3" width="14" height="10" fill="#0b0b12" stroke="#ffffff" strokeWidth="1" />
                  <path d="M1 3 L8 9 L15 3" stroke="#ffffff" strokeWidth="1" fill="none" />
                </svg>
                <span className="truncate text-[9px] text-white sm:text-[11px]">{mail.title}</span>
              </div>
              <div className="mt-2 text-[8px] leading-relaxed text-white/60 sm:text-[9px]">
                {mail.sender}
              </div>
              <div className="mt-1 text-[8px] leading-relaxed text-white/60 sm:text-[9px]">
                {mail.date}
              </div>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export default MailList
