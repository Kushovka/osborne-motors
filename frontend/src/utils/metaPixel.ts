import { trackingConfig } from '../config/tracking'

const metaConfig = trackingConfig.meta
const pixelId = metaConfig.pixelId

type MetaPixelFunction = {
  (...args: unknown[]): void
  callMethod?: (...args: unknown[]) => void
  loaded?: boolean
  push?: (...args: unknown[]) => void
  queue?: unknown[]
  version?: string
}

declare global {
  interface Window {
    fbq?: MetaPixelFunction
    _fbq?: unknown
  }
}

let initialized = false

export type MetaAdvancedMatching = {
  email?: string | null
  phone?: string | null
  firstName?: string | null
  lastName?: string | null
  externalId?: string | null
  fbp?: string | null
  fbc?: string | null
}

export type MetaLeadEventData = {
  eventId: string
  leadType?: string
  contentIds?: string[]
  contentName?: string | null
  contentType?: string
  currency?: string
  value?: number | null
  advancedMatching?: MetaAdvancedMatching
}

export type MetaContactActionData = {
  eventId: string
  actionType: string
  contentName?: string | null
}

const cleanObject = <T extends Record<string, unknown>>(data: T) =>
  Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined && value !== null && value !== ''))

const normalizePhone = (value?: string | null) => value?.replace(/\D/g, '') ?? null

export const splitName = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  return {
    firstName: parts[0] ?? null,
    lastName: parts.length > 1 ? parts[parts.length - 1] : null,
  }
}

export const initMetaPixel = () => {
  if (!pixelId || initialized || typeof window === 'undefined') {
    return
  }

  const fbq: MetaPixelFunction = (...args: unknown[]) => {
    if (window.fbq?.callMethod) {
      window.fbq.callMethod(...args)
      return
    }

    window.fbq?.queue?.push(args)
  }

  if (!window.fbq) {
    Object.assign(fbq, {
      push: fbq,
      loaded: true,
      version: '2.0',
      queue: [],
    })

    window.fbq = fbq
    window._fbq = fbq

    const script = document.createElement('script')
    script.async = true
    script.src = 'https://connect.facebook.net/en_US/fbevents.js'
    document.head.appendChild(script)
  }

  window.fbq('init', pixelId)
  initialized = true
}

export const updateMetaAdvancedMatching = (matching: MetaAdvancedMatching) => {
  if (!pixelId || !window.fbq) {
    return
  }

  const data = cleanObject({
    em: matching.email?.trim().toLowerCase(),
    ph: normalizePhone(matching.phone),
    fn: matching.firstName?.trim().toLowerCase(),
    ln: matching.lastName?.trim().toLowerCase(),
    external_id: matching.externalId,
    fbp: matching.fbp,
    fbc: matching.fbc,
  })

  if (Object.keys(data).length > 0) {
    window.fbq('init', pixelId, data)
  }
}

export const trackPageView = () => {
  if (!pixelId || !window.fbq) {
    return
  }

  window.fbq('track', metaConfig.pageViewEventName)
}

export const trackViewContent = (contentId: string, contentName: string, value?: number | null) => {
  if (!pixelId || !window.fbq) {
    return
  }

  window.fbq('track', metaConfig.viewContentEventName, cleanObject({
    content_ids: [contentId],
    content_name: contentName,
    content_type: metaConfig.productContentType,
    currency: metaConfig.currency,
    value,
  }))
}

export const trackLead = ({
  eventId,
  leadType,
  contentIds,
  contentName,
  contentType = metaConfig.productContentType,
  currency = metaConfig.currency,
  value,
  advancedMatching,
}: MetaLeadEventData) => {
  if (!pixelId || !window.fbq) {
    return
  }

  if (advancedMatching) {
    updateMetaAdvancedMatching(advancedMatching)
  }

  window.fbq('track', metaConfig.leadEventName, cleanObject({
    content_ids: contentIds,
    content_name: contentName,
    content_type: contentType,
    currency,
    value,
    lead_type: leadType ?? 'quote',
  }), { eventID: eventId })
}

export const trackContactAction = ({
  eventId,
  actionType,
  contentName,
}: MetaContactActionData) => {
  if (!pixelId || !window.fbq) {
    return
  }

  window.fbq('track', 'Contact', cleanObject({
    action_type: actionType,
    content_name: contentName,
  }), { eventID: eventId })
}

export const getCookieValue = (name: string) => {
  if (typeof document === 'undefined') {
    return null
  }

  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1] ?? null
}

export const createMetaEventId = (prefix: string) => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}.${crypto.randomUUID()}`
  }

  return `${prefix}.${Date.now()}.${Math.random().toString(16).slice(2)}`
}
