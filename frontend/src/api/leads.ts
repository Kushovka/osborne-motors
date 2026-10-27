import { apiClient } from './client'

export type LeadPayload = {
  vehicleId?: string
  leadType: 'contact' | 'quote'
  customerName: string
  phone: string
  email?: string
  zipCode?: string
  message?: string
  sourcePage?: string
  metaEventId?: string
  testEventCode?: string | null
  fbp?: string | null
  fbc?: string | null
  userAgent?: string
  eventSourceUrl?: string
  formStartedAt?: number
  website?: string
  contentIds?: string[]
  contentName?: string
  contentType?: string
  currency?: string
  value?: number
}

export type CreatedLead = { id: string; capi_ticket?: string | null }

export const createLead = async (payload: LeadPayload) => {
  const response = await apiClient.post<CreatedLead>('/leads', {
    vehicle_id: payload.vehicleId,
    lead_type: payload.leadType,
    customer_name: payload.customerName,
    phone: payload.phone,
    email: payload.email || undefined,
    zip_code: payload.zipCode || undefined,
    message: payload.message || undefined,
    source_page: payload.sourcePage || window.location.pathname,
    meta_event_id: payload.metaEventId,
    test_event_code: payload.testEventCode || undefined,
    fbp: payload.fbp || undefined,
    fbc: payload.fbc ?? '',
    user_agent: payload.userAgent || navigator.userAgent,
    event_source_url: payload.eventSourceUrl || window.location.href,
    form_started_at: payload.formStartedAt,
    website: payload.website || undefined,
    content_ids: payload.contentIds,
    content_name: payload.contentName,
    content_type: payload.contentType || 'vehicle',
    currency: payload.currency || 'USD',
    value: payload.value,
    consent_to_contact: true,
  })

  return response.data
}


export const sendMetaCapiLead = async (payload: {
  leadId: string; eventId: string; capiTicket: string; email?: string; phone: string;
  firstName?: string | null; lastName?: string | null; contentId: string; contentType: string;
  currency: string; price: number; zip?: string; fbp?: string | null; fbc?: string | null;
  eventSourceUrl: string; testEventCode?: string | null
}) => apiClient.post('/events/capi', {
  lead_id: payload.leadId, meta_event_id: payload.eventId, capi_ticket: payload.capiTicket,
  email: payload.email || undefined, phone: payload.phone, first_name: payload.firstName,
  last_name: payload.lastName, content_id: payload.contentId, content_type: payload.contentType,
  currency: payload.currency, price: payload.price, zip: payload.zip || undefined,
  fbp: payload.fbp || undefined, fbc: payload.fbc ?? "", event_source_url: payload.eventSourceUrl,
  test_event_code: payload.testEventCode || undefined,
})
