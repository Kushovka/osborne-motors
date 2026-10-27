import { useMemo, useState, type ReactNode } from 'react'
import { FaArrowRight, FaInfoCircle } from 'react-icons/fa'
import { createLead, sendMetaCapiLead } from '../api/leads'
import { trackingConfig } from '../config/tracking'
import { createMetaEventId, getCookieValue, splitName, trackLead } from '../utils/metaPixel'
import { getTestEventCode } from '../utils/metaAttribution'

type LeadFormProps = {
  title: string
  vehicleId?: string
  vehicleContentId?: string
  vehicleName?: string
  vehicleValue?: number
  messagePlaceholder?: string
  namePlaceholder?: string
  emailPlaceholder?: string
  className?: string
  phonePlaceholder?: string
  actionAside?: ReactNode
  notice?: string
  noticeLabel?: string
}

const COUNTRY_CODE_PREFIX = '+1 '

const getPhoneDigits = (value: string) => {
  const digits = value.replace(/\D/g, '')
  const hasCountryCode = value.trim().startsWith('+1') || digits.length > 10
  const localDigits = hasCountryCode && digits.startsWith('1') ? digits.slice(1) : digits

  return localDigits.slice(0, 10)
}

const formatUsPhone = (value: string) => {
  const digits = getPhoneDigits(value)

  if (!digits) return ''
  if (digits.length <= 3) return `${COUNTRY_CODE_PREFIX}(${digits}`
  if (digits.length <= 6) return `${COUNTRY_CODE_PREFIX}(${digits.slice(0, 3)}) ${digits.slice(3)}`

  return `${COUNTRY_CODE_PREFIX}(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

export const LeadForm = ({ title, vehicleId, vehicleContentId, vehicleName, vehicleValue, messagePlaceholder = 'Message', namePlaceholder = 'John Smith', emailPlaceholder, className = '', phonePlaceholder = '(704) 555-0100', actionAside, notice = 'No finance available.', noticeLabel = 'Important information' }: LeadFormProps) => {
  const formStartedAt = useMemo(() => Date.now(), [])
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [phoneValue, setPhoneValue] = useState('')
  const [submitting, setSubmitting] = useState(false)

  return (
    <form
      className={`surface-card p-5 sm:p-6 vehicle-inline-form ${className}`}
      action="/api/leads"
      method="post"
      onSubmit={async (event) => {
        event.preventDefault()
        const formElement = event.currentTarget
        setError('')
        setSent(false)
        setSubmitting(true)

        const form = new FormData(formElement)
        const customerName = String(form.get('firstName') ?? '').trim()
        const phone = getPhoneDigits(phoneValue)
        const email = String(form.get('email') ?? '').trim()
        const website = String(form.get('website') ?? '').trim()
        const message = String(form.get('message') ?? '').trim()
        const leadMessage = message
        const leadType = vehicleId ? 'quote' : 'contact'
        const metaEventId = createMetaEventId('lead')
        const fbp = getCookieValue('_fbp')
        const fbc = getCookieValue('_fbc')
        const { firstName: metaFirstName, lastName: metaLastName } = splitName(customerName)
        const contentIds = [vehicleContentId?.trim() || vehicleId || `${trackingConfig.meta.defaultLeadContentPrefix}-${leadType}`]
        const contentType = vehicleId ? trackingConfig.meta.productContentType : trackingConfig.meta.serviceContentType
        const contentName = vehicleName ?? `${leadType} request`
        const currency = trackingConfig.meta.currency
        const eventValue = vehicleValue ?? trackingConfig.meta.defaultLeadValue
        const testEventCode = getTestEventCode()

        if (phone.length !== 10) {
          setSubmitting(false)
          setError('Please enter a valid 10-digit US phone number.')
          return
        }

        try {
          const savedLead = await createLead({
            vehicleId,
            leadType,
            customerName,
            phone,
            email,
            message: leadMessage,
            metaEventId,
            testEventCode,
            fbp,
            fbc,
            userAgent: navigator.userAgent,
            eventSourceUrl: window.location.href,
            formStartedAt,
            website,
            contentIds,
            contentName,
            contentType,
            currency,
            value: eventValue ?? undefined,
          })
          try {
            trackLead({
              eventId: metaEventId,
              leadType,
              contentIds,
              contentName,
              contentType,
              currency,
              value: eventValue,
              advancedMatching: {
                email,
                phone,
                firstName: metaFirstName,
                lastName: metaLastName,
                externalId: email || phone,
                fbp,
                fbc,
              },
            })
          } catch {
            // Browser tracking can be blocked; the lead itself was already submitted.
          }
          if (savedLead.capi_ticket) {
            try {
              await sendMetaCapiLead({
                leadId: savedLead.id, eventId: metaEventId, capiTicket: savedLead.capi_ticket,
                email, phone, firstName: metaFirstName, lastName: metaLastName, contentId: contentIds[0],
                contentType, currency, price: eventValue ?? 0,
                zip: String(form.get('zipCode') ?? '').trim() || undefined, fbp, fbc,
                eventSourceUrl: window.location.href, testEventCode,
              })
            } catch {
              // The lead is saved even if Meta does not accept its CAPI event.
            }
          }
          setError('')
          setSent(true)
          setPhoneValue('')
          formElement.reset()
        } catch {
          setSent(false)
          setError('We could not send the request right now. Please call us or try again.')
        } finally {
          setSubmitting(false)
        }
      }}
    >
      {notice ? <aside className="form-notice" aria-label="Important information">
        <span className="form-notice__icon"><FaInfoCircle aria-hidden="true" /></span>
        <div className="form-notice__content">
          <span className="form-notice__label">{noticeLabel}</span>
          <p>{notice}</p>
        </div>
      </aside> : null}
      <div className="grid min-w-0 gap-2.5 vehicle-inline-form__fields">
        <div className="hidden" aria-hidden="true">
          <label>
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <label className="lead-form-name">
          <span>Full Name <b>*</b></span>
          <input required aria-label="Full name" className="input" name="firstName" placeholder={namePlaceholder} autoComplete="name" />
        </label>
        <label className="lead-form-field">
          <span>Phone Number <b>*</b></span>
          <input
          required
          aria-label="Phone"
          className="input"
          name="phone"
          placeholder={phonePlaceholder}
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          maxLength={17}
          pattern="\+1 \([0-9]{3}\) [0-9]{3}-[0-9]{4}"
          title="Enter a 10-digit US phone number"
          value={phoneValue}
          onChange={(event) => setPhoneValue(formatUsPhone(event.target.value))}
          onFocus={() => {
            if (!phoneValue) {
              setPhoneValue(COUNTRY_CODE_PREFIX)
            }
          }}
          />
        </label>
        <label className="lead-form-field lead-form-field-email">
          <span>Email Address <b>*</b></span>
          <input required aria-label="Email" className="input" name="email" placeholder={emailPlaceholder ?? 'john@example.com'} type="email" autoComplete="email" />
        </label>
        <label className="lead-form-field lead-form-field-message">
          <span>Message <b>*</b></span>
          <textarea required aria-label="Message" className="input" name="message" placeholder={messagePlaceholder} />
        </label>
      </div>
      <div className={`mt-5${actionAside ? ' form-actions-with-aside' : ''}`}>
        <button className="inline-flex min-h-11 w-full items-center justify-center gap-3 rounded-[3px] bg-[var(--color-primary)] px-5 py-3 text-sm font-bold text-white shadow-none transition hover:bg-[var(--color-primary-dark)] active:translate-y-px disabled:cursor-wait disabled:bg-[var(--color-disabled)] sm:w-auto" disabled={submitting} type="submit">
          {submitting ? 'Sending...' : <>{title} <FaArrowRight aria-hidden="true" /></>}
        </button>
        {actionAside}
      </div>
      {sent ? <p className="mt-4 rounded-md bg-[var(--color-hover)] px-4 py-3 text-sm font-normal text-[var(--color-link)]">Thanks. We received your request and will follow up shortly.</p> : null}
      {error ? <p className="mt-4 rounded-md bg-[var(--color-hover)] px-4 py-3 text-sm font-normal text-[var(--color-accent)]">{error}</p> : null}
    </form>
  )
}
