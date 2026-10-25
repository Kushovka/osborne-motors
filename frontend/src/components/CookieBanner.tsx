import { useState } from 'react'
import { Link } from 'react-router'

const storageKey = 'osborne-motors-cookie-consent'

export const CookieBanner = () => {
  const [visible, setVisible] = useState(() => !window.localStorage.getItem(storageKey))

  const choose = (value: 'accepted' | 'declined') => {
    window.localStorage.setItem(storageKey, value)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60]">
      <section
        aria-label="Cookie preferences"
        className="cookie-preferences-banner pointer-events-auto flex w-full flex-col gap-4 border-t-[2px] border-t-[#782C32] bg-[var(--color-background)] px-5 py-4 shadow-[0_-2px_8px_rgba(37,42,46,0.12)] sm:px-7 sm:py-5 md:flex-row md:items-center md:justify-between md:gap-8 md:px-[3.5vw] md:py-6"
      >
        <div className="min-w-0 [font-family:var(--font-heading)] text-[var(--color-text)]">
          <p className="m-0 text-base leading-snug sm:text-lg md:text-[clamp(18px,1.25vw,25px)]">
            We use cookies to understand site traffic and improve your experience.
          </p>
          <Link to="/privacy-policy" className="mt-0.5 inline-block text-sm leading-snug text-[var(--color-muted)] underline underline-offset-2 transition-colors hover:text-[var(--color-link-hover)] sm:text-base md:text-[clamp(16px,1.1vw,22px)]">
            Privacy Policy
          </Link>
        </div>
        <div className="flex shrink-0 items-center justify-end gap-5 sm:gap-8 md:gap-12">
            <button
              type="button"
              className="min-h-10 border-0 bg-transparent px-1 py-2 [font-family:var(--font-heading)] text-sm font-normal normal-case tracking-normal text-[var(--color-text)] underline underline-offset-2 transition-colors hover:text-[var(--color-link-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] sm:text-base md:text-[clamp(16px,1.1vw,22px)]"
              style={{ textTransform: 'none', fontWeight: 400, letterSpacing: 'normal' }}
              onClick={() => choose('declined')}
            >
              Decline
            </button>
            <button
              type="button"
              className="min-h-[46px] min-w-[120px] rounded-[3px] bg-[var(--color-button)] px-5 py-3 [font-family:var(--font-heading)] text-sm font-normal normal-case tracking-normal text-white transition-colors hover:bg-[var(--color-button-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] sm:min-h-[54px] sm:min-w-[150px] sm:text-base md:min-h-[clamp(52px,3.2vw,66px)] md:min-w-[clamp(140px,9vw,190px)] md:text-[clamp(16px,1.1vw,22px)]"
              style={{ textTransform: 'none', fontWeight: 400, letterSpacing: 'normal' }}
              onClick={() => choose('accepted')}
            >
              Accept
            </button>
        </div>
      </section>
    </div>
  )
}
