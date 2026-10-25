import { sendContactAction } from '../api/events'
import { createMetaEventId, getCookieValue, trackContactAction, trackLead } from './metaPixel'

export const trackContactCta = (actionType: string, contentName?: string | null) => {
  if (typeof window === 'undefined') {
    return
  }

  const eventId = createMetaEventId(actionType)

  if (actionType === 'phone_click') {
    trackLead({
      eventId,
      leadType: 'phone_call',
      contentName: contentName ?? 'Phone CTA',
      contentType: 'service',
    })
  } else {
    trackContactAction({
      eventId,
      actionType,
      contentName,
    })
  }

  void sendContactAction({
    actionType,
    contentName,
    sourcePage: window.location.pathname,
    metaEventId: eventId,
    fbp: getCookieValue('_fbp'),
    fbc: getCookieValue('_fbc'),
    userAgent: window.navigator.userAgent,
    eventSourceUrl: window.location.href,
  }).catch(() => undefined)
}

export const getContactActionFromHref = (href: string) => {
  if (href.startsWith('tel:')) {
    return {
      actionType: 'phone_click',
      contentName: 'Phone CTA',
    }
  }

  if (href.includes('google.com/maps') || href.includes('place_id:')) {
    return {
      actionType: 'directions_click',
      contentName: 'Directions CTA',
    }
  }

  return null
}
