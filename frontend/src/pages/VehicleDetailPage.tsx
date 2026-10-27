import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { FaArrowRight, FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa'
import { getVehicle, listVehicles } from '../api/vehicles'
import { InventoryVehicleCard } from '../components/InventoryVehicleCard'
import { LeadForm } from '../components/LeadForm'
import { Seo } from '../components/Seo'
import { VehicleDetailSkeleton } from '../components/Skeletons'
import { VehicleGallery } from '../components/VehicleGallery'
import { VehicleQuoteDialog } from '../components/VehicleQuoteDialog'
import { business } from '../data/business'
import type { Vehicle } from '../types/vehicle'
import { trackContactCta } from '../utils/ctaTracking'
import { formatNumber, formatVehiclePrice, formatVehicleTitle } from '../utils/format'
import { trackViewContent } from '../utils/metaPixel'

const phoneHref = business.phoneHref || business.contactHref
const hasListingValue = (value: string | number) => String(value).trim() !== '' && !/^not listed$/i.test(String(value).trim())
const plainDescription = (value: string) => {
  if (/^\s*<(?:!doctype|html)\b/i.test(value)) return ''
  const text = new DOMParser().parseFromString(value, 'text/html').body.textContent ?? ''
  return text.replace(/\r/g, '').split(/\n\s*\n/).flatMap((paragraph) => {
    const normalized = paragraph.replace(/\s*\n\s*/g, ' ').replace(/\s+/g, ' ').trim()
    const engineSection = normalized.match(/^Engine\s+(.+)$/i)
    return engineSection ? ['Engine', engineSection[1]] : [normalized]
  }).filter(Boolean).join('\n\n')
}

const DetailHeading = ({ children, id }: { children: string; id?: string }) => <h2 id={id} className="vehicle-detail-heading">{children}</h2>

const colorSwatch = (value: string) => {
  const color = (part: string) => {
    const name = part.toLowerCase()
    if (/white|ivory/.test(name)) return '#F5F4EF'
    if (/black|onyx/.test(name)) return '#252A2E'
    if (/gray|grey|silver/.test(name)) return '#85898B'
    if (/red|burgundy/.test(name)) return '#8B2431'
    if (/blue/.test(name)) return '#31577A'
    if (/green/.test(name)) return '#526A53'
    if (/brown|cognac/.test(name)) return '#79553E'
    if (/tan|beige/.test(name)) return '#BFA581'
    if (/gold/.test(name)) return '#AA8C4E'
    return '#A9ADB0'
  }
  const colors = value.split('/').map(color)
  return colors.length > 1
    ? `linear-gradient(90deg, ${colors[0]} 0 50%, ${colors[1]} 50% 100%)`
    : colors[0]
}

const PricePanel = ({ vehicle, title, onRequest }: { vehicle: Vehicle; title: string; onRequest: (source: string) => void }) => {
  const rows: [string, string][] = [
    ['Mileage', vehicle.mileage > 0 ? `${formatNumber(vehicle.mileage)} miles` : 'Mileage not listed'],
    ['Engine', vehicle.engine], ['Transmission', vehicle.transmission], ['Drivetrain', vehicle.drivetrain],
    ['Exterior Color', vehicle.exteriorColor], ['Interior Color', vehicle.interiorColor], ['VIN', vehicle.vin],
    ['Fuel Type', vehicle.specs?.fuel_type ?? ''], ['City MPG', vehicle.specs?.city_mpg ?? ''], ['Highway MPG', vehicle.specs?.highway_mpg ?? ''],
    ...(vehicle.details?.info ?? []).filter(({ label }) => !/^(year|make|model|body style|listing|vehicle history|lot(?:\s+number)?)$/i.test(label.replace(/\s+/g, ' ').trim())).map(({ label, value }) => [label, value] as [string, string]),
  ]
  const seenRows = new Set<string>()
  const visibleRows = rows.filter(([label, value]) => {
    const key = label.toLowerCase().trim()
    if (!hasListingValue(value) || seenRows.has(key)) return false
    seenRows.add(key)
    return true
  })

  return <aside className="vehicle-price-panel" aria-label="Vehicle price and details">
    <h2 id="vehicle-title" className="vehicle-price-panel__title">{title}</h2>
    <div className="vehicle-price-panel__price-line"><p id="vehicle-price-value" className="vehicle-price-panel__price">{formatVehiclePrice(vehicle)}</p>{hasListingValue(vehicle.stockNumber) ? <span className="vehicle-price-panel__stock">Stock #: {vehicle.stockNumber}</span> : null}</div>
    <dl className="vehicle-price-panel__facts">{visibleRows.map(([label, value]) => <div key={label}><dt>{label}:</dt><dd title={value}>{/^(exterior|interior) color$/i.test(label) ? <span className="vehicle-price-panel__swatch" style={{ background: colorSwatch(value) }} aria-hidden="true" /> : null}{value}</dd></div>)}</dl>
    <div className="vehicle-price-panel__actions">
      <a href={phoneHref} className="vehicle-price-panel__action vehicle-price-panel__action--primary" onClick={() => trackContactCta('phone_click', 'Vehicle Price Card Phone')}><FaPhoneAlt aria-hidden="true" />Call Now {business.phoneDisplay}</a>
      <button type="button" className="vehicle-price-panel__action" onClick={() => onRequest('Vehicle Price Card Request Availability')}><FaEnvelope aria-hidden="true" />Check Availability</button>
    </div>
  </aside>
}

const SimilarVehicles = ({ vehicles }: { vehicles: Vehicle[] }) => {
  const cards = vehicles.slice(0, 3)
  const gridRef = useRef<HTMLDivElement>(null)
  const [activeCard, setActiveCard] = useState(0)
  if (!cards.length) return null
  const scrollToCard = (index: number) => {
    const grid = gridRef.current
    const card = grid?.children[index] as HTMLElement | undefined
    if (!grid || !card) return
    const gap = Number.parseFloat(getComputedStyle(grid).columnGap) || 0
    grid.scrollBy({ left: (grid.clientWidth + gap) * (index - activeCard), behavior: 'smooth' })
  }
  return <section className="vehicle-similar-section" aria-labelledby="similar-vehicles-title">
    <div className="vehicle-similar-section__heading"><DetailHeading id="similar-vehicles-title">Similar Vehicles You Might Like</DetailHeading><Link to="/inventory">View All Inventory <FaArrowRight aria-hidden="true" /></Link></div>
    <div className="vehicle-similar-grid" ref={gridRef} onScroll={(event) => {
      const grid = event.currentTarget
      const gap = Number.parseFloat(getComputedStyle(grid).columnGap) || 0
      setActiveCard(Math.min(cards.length - 1, Math.max(0, Math.round(grid.scrollLeft / (grid.clientWidth + gap)))))
    }}>{cards.map((vehicle) => <InventoryVehicleCard key={vehicle.id} vehicle={vehicle} variant="inventory" />)}</div>
    {cards.length > 1 ? <div className="vehicle-similar-controls" aria-label="Similar vehicles carousel">
      <button type="button" aria-label="Previous vehicle" disabled={activeCard === 0} onClick={() => scrollToCard(activeCard - 1)}><FaArrowRight aria-hidden="true" /></button>
      <span aria-live="polite"><strong>{activeCard + 1}</strong><i />{cards.length}</span>
      <button type="button" aria-label="Next vehicle" disabled={activeCard === cards.length - 1} onClick={() => scrollToCard(activeCard + 1)}><FaArrowRight aria-hidden="true" /></button>
    </div> : null}
  </section>
}

export const VehicleDetailPage = () => {
  const { slug } = useParams()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [recommendations, setRecommendations] = useState<Vehicle[]>([])
  const [loadState, setLoadState] = useState<{ slug: string | null; status: 'loaded' | 'error' }>({ slug: null, status: 'loaded' })
  const [quoteOpen, setQuoteOpen] = useState(false)
  const [detailView] = useState<'overview' | 'photos'>(() => window.location.hash === '#photos' ? 'photos' : 'overview')
  useEffect(() => {
    let cancelled = false
    getVehicle(slug ?? '')
      .then((item) => {
        if (!cancelled) {
          const description = [item.description, item.details?.rawDescription ?? '', item.shortDescription ?? ''].map(plainDescription).find(Boolean)
          setVehicle({ ...item, description: description || `${item.year} ${item.make} ${item.model} ${item.trim} is listed with a ${item.engine}, ${item.transmission}, and ${item.drivetrain}.` })
          trackViewContent(item.stockNumber || item.id, `${item.year} ${item.make} ${item.model} ${item.trim}`, item.price)
          setLoadState({ slug: slug ?? '', status: 'loaded' })
        }
      })
      .catch(() => { if (!cancelled) { setVehicle(null); setLoadState({ slug: slug ?? '', status: 'error' }) } })
    return () => { cancelled = true }
  }, [slug])

  useEffect(() => {
    if (!vehicle || vehicle.slug !== slug) return
    let cancelled = false
    listVehicles({ pageSize: 16, sort: 'year_desc' })
      .then(({ items }) => {
        const candidates = items.filter((item) => item.id !== vehicle.id && item.slug !== vehicle.slug)
        const score = (item: Vehicle) => (item.bodyType.toLowerCase() === vehicle.bodyType.toLowerCase() ? 3 : 0) + (item.make.toLowerCase() === vehicle.make.toLowerCase() ? 2 : 0) + (vehicle.price > 0 && Math.abs(item.price - vehicle.price) / vehicle.price < 0.3 ? 1 : 0)
        candidates.sort((a, b) => score(b) - score(a))
        if (!cancelled) setRecommendations(candidates.slice(0, 4))
      })
      .catch(() => { if (!cancelled) setRecommendations([]) })
    return () => { cancelled = true }
  }, [slug, vehicle])

  const title = useMemo(() => vehicle ? formatVehicleTitle(vehicle) : '', [vehicle])
  const currentLoadStatus = loadState.slug === (slug ?? '') ? loadState.status : 'loading'
  if (!vehicle && currentLoadStatus === 'error') return <section className="section soft-band"><div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8"><div className="surface-card p-8"><h1 className="text-3xl text-[var(--color-text)]">Vehicle details are temporarily unavailable</h1><p className="mt-3 text-[var(--color-muted)]">Please try again later or call us for current vehicle information.</p><div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row"><Link to="/inventory" className="vehicle-price-panel__action">Back to Inventory</Link><a href={phoneHref} className="vehicle-price-panel__action vehicle-price-panel__action--primary" onClick={() => trackContactCta('phone_click', 'Vehicle Detail Error Phone CTA')}><FaPhoneAlt />Contact</a></div></div></div></section>
  if (!vehicle || vehicle.slug !== slug) return <VehicleDetailSkeleton />

  return <>
    <Seo title={title} description={vehicle.status === 'Placeholder' ? 'Placeholder inventory listing. Vehicle details coming soon.' : `${title} for sale at Osborne Motors in Norfolk, NE. Call or request info today.`} noIndex={vehicle.status === 'Placeholder'} schema={vehicle.status === 'Placeholder' ? undefined : { '@context': 'https://schema.org', '@type': 'Vehicle', name: title, url: `${window.location.origin}/inventory/${vehicle.slug}`, image: vehicle.images[0] ? `${new URL(vehicle.images[0], window.location.origin).href}` : undefined, brand: vehicle.make, model: vehicle.model, vehicleModelDate: vehicle.year, ...(vehicle.mileage > 0 ? { mileageFromOdometer: `${vehicle.mileage} MI` } : {}), ...(vehicle.price > 0 ? { offers: { '@type': 'Offer', url: `${window.location.origin}/inventory/${vehicle.slug}`, price: vehicle.price, priceCurrency: 'USD' } } : {}) }} />
    <div className="vehicle-detail-titlebar"><div className="vehicle-detail-titlebar__inner"><div className="vehicle-detail-titlebar__titleline"><h1>{title}</h1><Link to="/inventory">← Back to Inventory</Link></div></div></div>
    <main className="vehicle-detail-page">
      <div className="vehicle-detail-container">
        <section className="vehicle-detail-hero" aria-labelledby="vehicle-title">
          <div className="vehicle-detail-hero__main"><div id="vehicle-gallery"><VehicleGallery images={vehicle.images} imagesTotal={vehicle.imagesTotal} slug={vehicle.slug} title={title} showAllPhotos={detailView === 'photos'} /></div></div>
          <PricePanel vehicle={vehicle} title={title} onRequest={(source) => { trackContactCta('contact_form_click', source); setQuoteOpen(true) }} />
        </section>

        {detailView === 'photos' ? <section id="photos" className="vehicle-all-photos" aria-label="All vehicle photos"><DetailHeading>Photos</DetailHeading><div id="vehicle-photos-grid" /></section> : null}

        <section className="vehicle-detail-information" aria-label="Vehicle information">
          <article className="vehicle-detail-information__about"><DetailHeading id="about-this-vehicle">Vehicle Overview</DetailHeading><p>{vehicle.description}</p></article>
          <section className="vehicle-detail-information__features" aria-labelledby="features-title"><DetailHeading id="features-title">Features</DetailHeading><div className="vehicle-detail-information__feature-columns">{[vehicle.features.slice(0, Math.ceil(vehicle.features.length / 2)), vehicle.features.slice(Math.ceil(vehicle.features.length / 2))].map((column, columnIndex) => <ul key={columnIndex}>{column.map((feature) => <li key={feature}><span>{feature}</span></li>)}</ul>)}</div></section>
          <section className="vehicle-detail-information__dealer" aria-labelledby="dealer-title"><DetailHeading id="dealer-title">Dealer Information</DetailHeading><div className="vehicle-detail-information__dealer-body"><div className="vehicle-detail-information__dealer-address"><strong>{business.name}</strong><span>{business.address}</span><span>{business.cityState} {business.postalCode}</span></div><div className="vehicle-detail-information__dealer-actions"><a href={phoneHref} onClick={() => trackContactCta('phone_click', 'Vehicle Detail Dealer Information Phone')}><FaPhoneAlt aria-hidden="true" />{business.phoneDisplay}</a><a href={business.mapsUrl}><FaMapMarkerAlt aria-hidden="true" />Get Directions</a></div></div></section>
        </section>

        <section className="vehicle-inquiry" aria-labelledby="vehicle-inquiry-title">
          <div className="vehicle-inquiry__eyebrow"><span>Vehicle Inquiry</span></div>
          <div className="vehicle-inquiry__copy">
            <h2 id="vehicle-inquiry-title">Have Questions About This Vehicle?</h2>
            <p className="vehicle-inquiry__vehicle">{title}</p>
            <p className="vehicle-inquiry__description">We’re here to help. Send us a message and our team will get back to you shortly.</p>
          </div>
          <LeadForm
            title="Send Message"
            vehicleId={vehicle.id}
            vehicleContentId={vehicle.stockNumber || vehicle.id}
            vehicleName={title}
            vehicleValue={vehicle.price}
            className="vehicle-inquiry-form"
            namePlaceholder="Enter your full name"
            phonePlaceholder="Enter your phone number"
            emailPlaceholder="Enter your email address"
            messagePlaceholder="Let us know if you have any questions about this vehicle..."
            notice="No financing available."
            noticeLabel="Financing"
            actionAside={<p className="vehicle-inquiry__consent">By submitting this form, you agree to be contacted by Osborne Motors.</p>}
          />
        </section>

        <SimilarVehicles vehicles={recommendations} />
      </div>
    </main>

    {quoteOpen ? <VehicleQuoteDialog open={quoteOpen} onClose={() => setQuoteOpen(false)} vehicleId={vehicle.id} vehicleContentId={vehicle.stockNumber || vehicle.id} vehicleName={title} vehicleValue={vehicle.price} /> : null}
  </>
}
