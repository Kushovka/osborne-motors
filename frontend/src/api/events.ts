import { apiClient } from './client'

export type ContactActionPayload = {
  actionType: string
  contentName?: string | null
  sourcePage?: string
  metaEventId?: string
  fbp?: string | null
  fbc?: string | null
  userAgent?: string
  eventSourceUrl?: string
}

export const sendContactAction = (payload: ContactActionPayload) =>
  apiClient.post('/events/contact-action', {
    action_type: payload.actionType,
    content_name: payload.contentName,
    source_page: payload.sourcePage,
    meta_event_id: payload.metaEventId,
    fbp: payload.fbp,
    fbc: payload.fbc,
    user_agent: payload.userAgent,
    event_source_url: payload.eventSourceUrl,
  })
