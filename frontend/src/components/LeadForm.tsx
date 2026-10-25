import { useMemo, useState, type ReactNode } from 'react'
import { FaArrowRight, FaInfoCircle } from 'react-icons/fa'
import { createLead } from '../api/leads'
import { trackingConfig } from '../config/tracking'
import { createMetaEventId, getCookieValue, splitName, trackLead } from '../utils/metaPixel'

type LeadFormProps = {
  title: string
  vehicleId?: string
  vehicleName?: string
  vehicleValue?: number
  messagePlaceholder?: string
  className?: string
  variant?: 'contact' | 'default' | 'vehicle' | 'vehicle-inline'
  showVehicleInterest?: boolean
  phonePlaceholder?: string
  actionAside?: ReactNode
  inquiryOptions?: string[]
  inquiryLabel?: string
  notice?: string
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

export const LeadForm = ({ title, vehicleId, vehicleName, vehicleValue, messagePlaceholder = 'Message (optional)', className = '', variant = 'default', showVehicleInterest = false, phonePlaceholder = '(704) 555-0100', actionAside, inquiryOptions, inquiryLabel, notice = 'No finance available.' }: LeadFormProps) => {
  const formStartedAt = useMemo(() => Date.now(), [])
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [phoneValue, setPhoneValue] = useState('')
  const [submitting, setSubmitting] = useState(false)

  return (
    <form
      id={variant === 'contact' ? 'contact-form' : undefined}
      className={`surface-card p-5 sm:p-6 ${variant === 'contact' ? 'contact-form' : variant === 'vehicle' ? 'lg:p-7' : variant === 'vehicle-inline' ? 'vehicle-inline-form' : 'rounded-md'} ${className}`}
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
        const inquiryType = String(form.get('inquiryType') ?? '').trim()
        const vehicleInterest = String(form.get('vehicleInterest') ?? '').trim()
        const leadMessage = [inquiryType ? `Inquiry type: ${inquiryType}` : '', message, vehicleInterest ? `Vehicle or Stock: ${vehicleInterest}` : ''].filter(Boolean).join('\n')
        const leadType = vehicleId ? 'quote' : 'contact'
        const metaEventId = createMetaEventId('lead')
        const fbp = getCookieValue('_fbp')
        const fbc = getCookieValue('_fbc')
        const { firstName: metaFirstName, lastName: metaLastName } = splitName(customerName)
        const contentIds = [vehicleId ?? `${trackingConfig.meta.defaultLeadContentPrefix}-${leadType}`]
        const contentType = vehicleId ? trackingConfig.meta.productContentType : trackingConfig.meta.serviceContentType
        const contentName = vehicleName ?? `${leadType} request`
        const currency = trackingConfig.meta.currency
        const eventValue = vehicleValue ?? trackingConfig.meta.defaultLeadValue

        if (phone.length !== 10) {
          setSubmitting(false)
          setError('Please enter a valid 10-digit US phone number.')
          return
        }

        try {
          await createLead({
            vehicleId,
            leadType,
            customerName,
            phone,
            email,
            message: leadMessage,
            metaEventId,
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
      {variant === 'default' ? <><p className="eyebrow">Quick request</p><h3 className="mt-2 text-2xl font-normal text-[var(--color-text)]">{title}</h3>{vehicleName ? <p className="mt-1 text-sm font-normal text-[var(--color-muted)]">{vehicleName}</p> : null}</> : null}
      {notice ? <aside className="form-notice" aria-label="Important information">
        <FaInfoCircle aria-hidden="true" />
        <p><strong>Please note:</strong> {notice}</p>
      </aside> : null}
      <div className={`${variant === 'vehicle' || variant === 'vehicle-inline' ? '' : 'mt-5'} grid min-w-0 gap-2.5 ${variant === 'vehicle-inline' ? 'vehicle-inline-form__fields' : 'sm:grid-cols-2'}`}>
        <div className="hidden" aria-hidden="true">
          <label>
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <label className={`lead-form-name${variant === 'vehicle-inline' ? '' : ' sm:col-span-2'}${variant === 'contact' ? ' contact-field' : ' grid min-w-0 gap-1.5 text-sm font-semibold text-[var(--color-text)]'}`}>
          <span>Full Name <b>*</b></span>
          <input required aria-label="Full name" className="input" name="firstName" placeholder="John Smith" autoComplete="name" />
        </label>
        <label className={`lead-form-field${variant === 'contact' ? ' contact-field' : ''}`}>
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
        <label className={`lead-form-field lead-form-field-email${variant === 'contact' ? ' contact-field' : ''}`}>
          <span>Email Address {variant === 'contact' || variant === 'vehicle-inline' ? <b>*</b> : <small>(Optional)</small>}</span>
          <input required={variant === 'contact' || variant === 'vehicle-inline'} aria-label="Email" className="input" name="email" placeholder={variant === 'contact' || variant === 'vehicle-inline' ? 'john@example.com' : 'Email'} type="email" autoComplete="email" />
        </label>
        {inquiryOptions ? inquiryLabel ? <label className={`lead-form-field${variant === 'contact' ? ' contact-field' : ' sm:col-span-2'}`}><span>{inquiryLabel} <b>*</b></span><select required aria-label={inquiryLabel} className="input" name="inquiryType" defaultValue=""><option value="" disabled>Select a contact method</option>{inquiryOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label> : <select aria-label="What can we help you with?" className="input sm:col-span-2" name="inquiryType" defaultValue=""><option value="" disabled>What can we help you with?</option>{inquiryOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select> : null}
        {showVehicleInterest ? <label className={`lead-form-field${variant === 'contact' ? ' contact-field' : ' sm:col-span-2'}`}>
          <span>Vehicle of Interest <small>(Optional)</small></span>
          <input aria-label="Vehicle or Stock Number (optional)" className="input" name="vehicleInterest" placeholder={variant === 'contact' ? 'Select a Vehicle (Optional)' : 'Vehicle or Stock (optional)'} />
        </label> : null}
        <label className={`lead-form-field lead-form-field-message${variant === 'contact' ? ' contact-field contact-field-message' : variant === 'vehicle-inline' ? '' : ' sm:col-span-2'}`}>
          <span>Message {variant === 'contact' ? <b>*</b> : <small>(Optional)</small>}</span>
          <textarea required={variant === 'contact'} aria-label="Message" className={`input${variant === 'contact' ? '' : ' min-h-28'}`} name="message" placeholder={messagePlaceholder} />
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
