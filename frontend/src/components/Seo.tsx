import { useEffect } from 'react'
import { business } from '../data/business'

type SeoProps = {
  title: string
  description: string
  schema?: Record<string, unknown>
  noIndex?: boolean
}

export const Seo = ({ title, description, schema, noIndex = false }: SeoProps) => {
  useEffect(() => {
    document.title = `${title} | ${business.name}`

    const siteUrl = business.website || window.location.origin
    const canonicalUrl = new URL(window.location.pathname, `${siteUrl}/`).href

    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    meta.content = description

    const setMeta = (selector: string, attributes: Record<string, string>, content: string) => {
      let element = document.querySelector<HTMLMetaElement>(selector)
      if (!element) {
        element = document.createElement('meta')
        Object.entries(attributes).forEach(([key, value]) => element?.setAttribute(key, value))
        document.head.appendChild(element)
      }
      element.content = content
    }

    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
    if (!robots) {
      robots = document.createElement('meta')
      robots.name = 'robots'
      document.head.appendChild(robots)
    }
    robots.content = noIndex ? 'noindex, follow' : 'index, follow'
    setMeta('meta[property="og:title"]', { property: 'og:title' }, document.title)
    setMeta('meta[property="og:description"]', { property: 'og:description' }, description)
    setMeta('meta[property="og:url"]', { property: 'og:url' }, canonicalUrl)
    setMeta('meta[property="og:type"]', { property: 'og:type' }, 'website')
    setMeta('meta[property="og:image"]', { property: 'og:image' }, `${siteUrl}/images/vehicle-photo-coming-soon.webp`)
    setMeta('meta[name="twitter:card"]', { name: 'twitter:card' }, 'summary_large_image')

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = canonicalUrl

    const existing = document.querySelector('#schema-json')
    existing?.remove()

    if (schema) {
      const script = document.createElement('script')
      script.id = 'schema-json'
      script.type = 'application/ld+json'
      script.textContent = JSON.stringify(schema)
      document.head.appendChild(script)
    }

    return () => {
      if (noIndex && robots?.content === 'noindex, follow') robots.content = 'index, follow'
    }
  }, [description, noIndex, schema, title])

  return null
}
