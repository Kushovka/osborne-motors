import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { FaArrowRight, FaCheck, FaEnvelope, FaPhoneAlt } from 'react-icons/fa'
import { getVehicle, listVehicles } from '../api/vehicles'
import { LeadForm } from '../components/LeadForm'
import { Seo } from '../components/Seo'
import { VehicleDetailSkeleton } from '../components/Skeletons'
import { VehicleGallery } from '../components/VehicleGallery'
import { VehicleQuoteDialog } from '../components/VehicleQuoteDialog'
import { business } from '../data/business'
import type { Vehicle } from '../types/vehicle'
import { trackContactCta } from '../utils/ctaTracking'
import { formatNumber, formatPrice } from '../utils/format'
import { trackViewContent } from '../utils/metaPixel'

const phoneHref = business.phoneHref || business.contactHref
const hasListingValue = (value: string | number) => String(value).trim() !== '' && !/^not listed$/i.test(String(value).trim())
const plainDescription = (value: string) => {
  if (/^\s*<(?:!doctype|html)\b/i.test(value)) return ''
  return new DOMParser().parseFromString(value, 'text/html').body.textContent?.replace(/\s+/g, ' ').trim() ?? ''
}

const DetailHeading = ({ children, id }: { children: string; id?: string }) => <h2 id={id} className="vehicle-detail-heading">{children}</h2>

const DetailSpecs = ({ specs }: { specs: [string, string][] }) => <dl className="vehicle-overview-specs">{specs.map(([label, value]) => <div key={label}><dt>{label}</dt><dd title={value}>{value}</dd></div>)}</dl>

const PricePanel = ({ vehicle, onRequest }: { vehicle: Vehicle; onRequest: (source: string) => void }) => {
  const rows: [string, string][] = ([
    ['Year', String(vehicle.year)], ['Make', vehicle.make], ['Model', `${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''}`],
    ['Body Style', vehicle.bodyType], ['Mileage', vehicle.mileage > 0 ? `${formatNumber(vehicle.mileage)} miles` : 'Mileage not listed'], ['Engine', vehicle.engine],
    ['Drivetrain', vehicle.drivetrain], ['Exterior Color', vehicle.exteriorColor], ['Interior Color', vehicle.interiorColor],
    ['Transmission', vehicle.transmission], ['Fuel Type', vehicle.specs?.fuel_type ?? ''], ['VIN', vehicle.vin],
  ] as [string, string][]).filter(([, value]) => hasListingValue(value))

  return <aside className="vehicle-price-panel" aria-label="Vehicle price and details">
    <div className="vehicle-price-panel__heading"><div className="vehicle-price-panel__label">Our Price</div>{hasListingValue(vehicle.stockNumber) ? <div className="vehicle-price-panel__stock"><span>Stock #</span><strong>{vehicle.stockNumber}</strong></div> : null}</div>
    <p id="vehicle-price-value" className="vehicle-price-panel__price">{formatPrice(vehicle.price)}</p>
    <dl className="vehicle-price-panel__facts">{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd title={value}>{value}</dd></div>)}</dl>
    <a href={phoneHref} className="vehicle-price-panel__action vehicle-price-panel__action--primary" onClick={() => trackContactCta('phone_click', 'Vehicle Price Card Phone')}><FaPhoneAlt aria-hidden="true" />Call {business.phoneDisplay}</a>
    <button type="button" className="vehicle-price-panel__action" onClick={() => onRequest('Vehicle Price Card Request Availability')}><FaEnvelope aria-hidden="true" />Check Availability</button>
  </aside>
}

const SimilarVehicles = ({ vehicles }: { vehicles: Vehicle[] }) => {
  const cards = vehicles.slice(0, 4)
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
    }}>{cards.map((vehicle) => {
        const name = `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''}`
        return <article className="vehicle-similar-card" key={vehicle.id}>
          <Link to={`/inventory/${vehicle.slug}`} className="vehicle-similar-card__photo" aria-label={`View ${name}`}><img src={vehicle.images[0]} alt={name} loading="lazy" /></Link>
          <div className="vehicle-similar-card__body"><p>{vehicle.year}</p><Link to={`/inventory/${vehicle.slug}`} className="vehicle-similar-card__title">{vehicle.make} {vehicle.model}{vehicle.trim ? ` ${vehicle.trim}` : ''}</Link><strong>{formatPrice(vehicle.price)}</strong><span>{vehicle.mileage > 0 ? `${formatNumber(vehicle.mileage)} miles` : 'Mileage not listed'} <i /> {vehicle.transmission} <i /> {vehicle.drivetrain}</span></div>
        </article>
      })}</div>
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
  const [loaded, setLoaded] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [quoteOpen, setQuoteOpen] = useState(false)
  const [showStickyBar, setShowStickyBar] = useState(false)
  const [detailView, setDetailView] = useState<'overview' | 'photos'>(() => window.location.hash === '#photos' ? 'photos' : 'overview')

  const showPhotos = () => {
    setDetailView('photos')
    window.history.replaceState(null, '', '#photos')
    window.setTimeout(() => document.getElementById('photos')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
  }

  useEffect(() => {
    let cancelled = false
    setLoaded(false)
    getVehicle(slug ?? '')
      .then((item) => {
        if (!cancelled) {
          const description = [item.shortDescription ?? '', item.description].map(plainDescription).find(Boolean)
          setVehicle({ ...item, description: description || `${item.year} ${item.make} ${item.model} ${item.trim} is listed with a ${item.engine}, ${item.transmission}, and ${item.drivetrain}.` })
          setLoadError(false)
          trackViewContent(item.id, `${item.year} ${item.make} ${item.model} ${item.trim}`, item.price)
        }
      })
      .catch(() => { if (!cancelled) { setVehicle(null); setLoadError(true) } })
      .finally(() => { if (!cancelled) setLoaded(true) })
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

  useEffect(() => {
    const priceValue = document.getElementById('vehicle-price-value')
    if (!priceValue) return
    const updateStickyBar = () => {
      const headerBottom = document.getElementById('site-header')?.getBoundingClientRect().bottom ?? 0
      const shouldShow = window.scrollY > 250 && priceValue.getBoundingClientRect().bottom < headerBottom
      setShowStickyBar((current) => current === shouldShow ? current : shouldShow)
    }
    updateStickyBar()
    window.addEventListener('scroll', updateStickyBar, { passive: true })
    window.addEventListener('resize', updateStickyBar)
    return () => { window.removeEventListener('scroll', updateStickyBar); window.removeEventListener('resize', updateStickyBar) }
  }, [vehicle])

  const title = useMemo(() => vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}`.trim() : '', [vehicle])
  if (!vehicle && loaded && loadError) return <section className="section soft-band"><div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8"><div className="surface-card p-8"><h1 className="text-3xl text-[var(--color-text)]">Vehicle details are temporarily unavailable</h1><p className="mt-3 text-[var(--color-muted)]">Please try again later or call us for current vehicle information.</p><div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row"><Link to="/inventory" className="vehicle-price-panel__action">Back to Inventory</Link><a href={phoneHref} className="vehicle-price-panel__action vehicle-price-panel__action--primary"><FaPhoneAlt />Contact</a></div></div></div></section>
  if (!vehicle) return <VehicleDetailSkeleton />

  const baseSpecs: [string, string][] = [
    ['Year', String(vehicle.year)], ['Make', vehicle.make], ['Model', `${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''}`], ['Body Style', vehicle.bodyType],
    ['Mileage', vehicle.mileage > 0 ? `${formatNumber(vehicle.mileage)} miles` : 'Mileage not listed'], ['Engine', vehicle.engine], ['Transmission', vehicle.transmission], ['Drivetrain', vehicle.drivetrain],
    ['Fuel Type', vehicle.specs?.fuel_type ?? ''], ['Exterior Color', vehicle.exteriorColor], ['Interior Color', vehicle.interiorColor], ['VIN', vehicle.vin],
    ['City MPG', vehicle.specs?.city_mpg ?? ''], ['Highway MPG', vehicle.specs?.highway_mpg ?? ''],
  ]
  const extraSpecs: [string, string][] = (vehicle.details?.info ?? []).filter(({ label }) => !/^(listing|vehicle history|lot(?:\s+number)?)$/i.test(label.replace(/\s+/g, ' ').trim())).map(({ label, value }) => [label, value])
  const specMap = new Map<string, [string, string]>()
  for (const [label, value] of [...baseSpecs, ...extraSpecs]) if (hasListingValue(value)) specMap.set(label.toLowerCase(), [label, String(value)])
  const specs = [...specMap.values()]
  const subtitle = [vehicle.bodyType, vehicle.engine, vehicle.drivetrain, vehicle.mileage > 0 ? `${formatNumber(vehicle.mileage)} miles` : ''].filter(Boolean)

  return <>
    <Seo title={title} description={`${title} for sale at Osborne Motors in Norfolk, NE. Call or request info today.`} schema={{ '@context': 'https://schema.org', '@type': 'Vehicle', name: title, url: `${window.location.origin}/inventory/${vehicle.slug}`, image: vehicle.images[0] ? `${new URL(vehicle.images[0], window.location.origin).href}` : undefined, brand: vehicle.make, model: vehicle.model, vehicleModelDate: vehicle.year, ...(vehicle.mileage > 0 ? { mileageFromOdometer: `${vehicle.mileage} MI` } : {}), ...(vehicle.price > 0 ? { offers: { '@type': 'Offer', url: `${window.location.origin}/inventory/${vehicle.slug}`, price: vehicle.price, priceCurrency: 'USD' } } : {}) }} />
    <main className="vehicle-detail-page">
      <div className="vehicle-detail-container">
        <nav className="vehicle-detail-breadcrumb" aria-label="Vehicle navigation"><Link to="/inventory" className="vehicle-detail-back"><FaArrowRight aria-hidden="true" /> Back to Inventory</Link></nav>

        <section className="vehicle-detail-hero" aria-labelledby="vehicle-title">
          <div className="vehicle-detail-hero__main"><h1 id="vehicle-title">{title}</h1><p className="vehicle-detail-subtitle">{subtitle.map((fact, index) => <span key={`${index}-${fact}`}>{fact}</span>)}</p><div id="vehicle-gallery"><VehicleGallery images={vehicle.images} imagesTotal={vehicle.imagesTotal} slug={vehicle.slug} title={title} onShowPhotos={showPhotos} showAllPhotos={detailView === 'photos'} /></div></div>
          <PricePanel vehicle={vehicle} onRequest={(source) => { trackContactCta('contact_form_click', source); setQuoteOpen(true) }} />
        </section>

        {detailView === 'photos' ? <section id="photos" className="vehicle-all-photos" aria-label="All vehicle photos"><DetailHeading>Photos</DetailHeading><div id="vehicle-photos-grid" /></section> : null}

        <section className="vehicle-detail-information" aria-label="Vehicle information">
          <article className="vehicle-detail-information__specs"><DetailHeading id="overview">Vehicle Overview</DetailHeading><DetailSpecs specs={specs} /></article>
          <article className="vehicle-detail-information__about"><DetailHeading id="about-this-vehicle">About This Vehicle</DetailHeading><p>{vehicle.description}</p><p>Contact our team to ask about this vehicle, confirm availability, or arrange a visit.</p><p className="vehicle-detail-signoff">Good Vehicles. Good People. A Stronger Community.</p></article>
          <section className="vehicle-detail-information__features" aria-labelledby="features-title"><DetailHeading id="features-title">Key Features</DetailHeading><ul>{vehicle.features.map((feature) => <li key={feature}><FaCheck aria-hidden="true" />{feature}</li>)}</ul></section>
        </section>

        <section className="vehicle-inquiry" aria-labelledby="vehicle-inquiry-title"><div className="vehicle-inquiry__copy"><h2 id="vehicle-inquiry-title">Have Questions About This Vehicle?</h2><p>We’re here to help. Get in touch and we’ll be happy to answer any questions you have.</p></div><LeadForm title="Send Message" vehicleId={vehicle.id} vehicleName={title} vehicleValue={vehicle.price} variant="vehicle-inline" className="vehicle-inquiry-form" phonePlaceholder="(402) 379-0445" messagePlaceholder="Ask about this vehicle..." /></section>

        <SimilarVehicles vehicles={recommendations} />
      </div>
    </main>

    <div aria-hidden={!showStickyBar} className={`vehicle-sticky-bar fixed inset-x-0 bottom-0 z-50 px-2 pb-2 transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none md:hidden ${showStickyBar ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0'}`}><div className="vehicle-sticky-bar__content mx-auto flex max-w-[1600px] items-center justify-between gap-3 rounded-xl border border-[#A9ADB0] bg-white px-4 py-3 shadow-[0_-3px_18px_rgba(37,42,46,.12)] sm:px-6"><div className="min-w-0"><p className="text-sm text-[#782C32]">Vehicle Price</p><p className="mt-1 text-2xl font-semibold leading-none text-[#782C32]">{formatPrice(vehicle.price)}</p></div><button type="button" className="site-button inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 bg-[#782C32] px-4 text-sm font-semibold text-white" onClick={() => { trackContactCta('contact_form_click', 'Vehicle Sticky Get Quote'); setQuoteOpen(true) }}>Get Quote <FaArrowRight aria-hidden="true" /></button></div></div>
    {quoteOpen ? <VehicleQuoteDialog open={quoteOpen} onClose={() => setQuoteOpen(false)} vehicleId={vehicle.id} vehicleName={title} vehicleValue={vehicle.price} /> : null}
  </>
}
