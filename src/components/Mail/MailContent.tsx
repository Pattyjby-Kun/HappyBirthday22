import type { Mail } from "./mailData"
import { PIXEL_FONT } from "./mailData"

interface MailContentProps {
  mail: Mail
}

/** Split on blank lines or intentional double-spaces for readable paragraph gaps. */
function splitMailBody(body: string): string[] {
  const paragraphs = body
    .split(/\n\s*\n|\s{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)

  return paragraphs.length > 0 ? paragraphs : [body]
}

function MailContent({ mail }: MailContentProps) {
  const bodyParagraphs = splitMailBody(mail.body)

  return (
    <div className="flex h-full flex-col" style={{ fontFamily: PIXEL_FONT }}>
      <h2 className="text-sm break-words text-white sm:text-base md:text-lg">{mail.title}</h2>

      <div className="mt-3 border-t-2 border-white/20 pt-3 sm:mt-4 sm:pt-4">
        <p className="text-[8px] tracking-widest text-white/50 uppercase sm:text-[9px]">From</p>
        <p className="mt-2 text-[10px] break-words text-white sm:text-xs">{mail.sender}</p>
      </div>

      <div className="mt-3 border-t-2 border-white/20 pt-3 sm:mt-4 sm:pt-4">
        <p className="text-[8px] tracking-widest text-white/50 uppercase sm:text-[9px]">Date</p>
        <p className="mt-2 text-[10px] break-words text-white sm:text-xs">{mail.date}</p>
      </div>

      {/* Body fills the remaining space and scrolls independently. */}
      <div className="mt-3 flex min-h-0 flex-1 flex-col border-t-2 border-white/20 pt-3 sm:mt-4 sm:pt-4">
        <p className="text-[8px] tracking-widest text-white/50 uppercase sm:text-[9px]">Body</p>
        <div className="mt-2 min-h-0 flex-1 overflow-y-auto px-3 py-3 pr-4 sm:px-4 sm:py-4 sm:pr-5">
          <div className="space-y-5 sm:space-y-6" lang="th">
            {bodyParagraphs.map((paragraph, index) => (
              <p
                key={index}
                className="text-[13px] leading-[1.9] break-words text-white/90 sm:text-[14px] sm:leading-[2]"
                style={{ fontFamily: "monospace" }}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MailContent
