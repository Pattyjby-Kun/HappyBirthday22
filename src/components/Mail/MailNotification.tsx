import { PIXEL_FONT } from "./mailData"

interface MailNotificationProps {
  showBadge: boolean
  onClick: () => void
}

function MailNotification({ showBadge, onClick }: MailNotificationProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open mail"
      className="relative flex h-10 w-10 items-center justify-center border-2 border-white/70 bg-black/50 transition-colors hover:border-white hover:bg-black/70"
    >
      <svg
        width={20}
        height={20}
        viewBox="0 0 16 16"
        shapeRendering="crispEdges"
        fill="none"
        aria-hidden="true"
      >
        <rect x="1" y="3" width="14" height="10" fill="#0b0b12" stroke="#ffffff" strokeWidth="1" />
        <path d="M1 3 L8 9 L15 3" stroke="#ffffff" strokeWidth="1" fill="none" />
      </svg>

      {showBadge && (
        <span
          className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full border-2 border-black bg-red-600 text-[9px] font-bold text-white"
          style={{ fontFamily: PIXEL_FONT }}
        >
          1
        </span>
      )}
    </button>
  )
}

export default MailNotification
