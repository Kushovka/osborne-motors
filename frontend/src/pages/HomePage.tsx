import { Seo } from '../components/Seo'
import { autoRepairSchema } from '../utils/schema'
import { Link } from 'react-router'
import { useEffect, useState } from 'react'
import { FaArrowRight, FaChevronLeft, FaChevronRight, FaClock, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { listVehicles } from '../api/vehicles'
import type { Vehicle } from '../types/vehicle'
import { InventoryVehicleCard } from '../components/InventoryVehicleCard'
import { business } from '../data/business'
import { trackContactCta } from '../utils/ctaTracking'
import { formatNumber, formatPrice } from '../utils/format'

export const HomePage = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    void listVehicles({ page: 1, pageSize: 6, sort: 'year_desc' })
      .then(({ items }) => {
        if (active) setVehicles(items)
      })
      .catch(() => {
        if (active) setVehicles([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  return (
  <>
    <Seo
      title="Osborne Motors in Norfolk, Nebraska"
      description="Visit Osborne Motors at 516 E Norfolk Ave in Norfolk, Nebraska."
      schema={autoRepairSchema}
    />
    <HomeHero vehicles={vehicles.slice(3, 6)} />
    <section className="home-featured-contact" aria-label="Popular vehicles and dealership contact information">
      <FeaturedVehicles vehicles={vehicles.slice(0, 3)} loading={loading} />
      <HomeContactPanel />
    </section>
    <AboutVisitSection />
    <HomeReviewsSection />
    <HomeVisitSection />
  </>
  )
}

const HomeHero = ({ vehicles }: { vehicles: Vehicle[] }) => {
  const [activeSlide, setActiveSlide] = useState(0)
  const [slideDirection, setSlideDirection] = useState(1)
  const [isPaused, setIsPaused] = useState(false)
  const reduceMotion = useReducedMotion()
  const slides = vehicles.filter((item) => item.images.length > 0)
  const slideCount = slides.length
  const vehicle = slides[activeSlide]
  const photo = vehicle?.images[0]
  const changeSlide = (direction: number) => {
    setSlideDirection(direction)
    setActiveSlide((current) => (current + direction + slideCount) % slideCount)
  }

  useEffect(() => {
    if (slideCount < 2 || isPaused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => {
      setSlideDirection(1)
      setActiveSlide((current) => (current + 1) % slideCount)
    }, 5000)
    return () => window.clearInterval(timer)
  }, [slideCount, isPaused])

  return (
    <section className="reference-home-hero" aria-labelledby="home-title">
      <div className="reference-home-hero__copy">
        <p className="reference-home-hero__eyebrow">Quality Pre-Owned Vehicles</p>
        <h1 id="home-title">Reliable Vehicles.<br />Local People.</h1>
        <p className="reference-home-hero__description">At Osborne Motors, we offer a hand-picked selection of quality used cars, trucks, and SUVs. Our team is here to help you find the right vehicle, without the pressure.</p>
        <Link className="reference-home-hero__primary" to="/inventory">Browse Inventory <FaArrowRight aria-hidden="true" /></Link>
      </div>
      <div className="reference-home-hero__media" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)} onFocus={() => setIsPaused(true)} onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsPaused(false)
      }}>
        {vehicle && photo ? <Link className="reference-home-hero__vehicle-link" to={`/inventory/${vehicle.slug}`} aria-label={`View ${vehicle.year} ${vehicle.make} ${vehicle.model}`}>
          <span className="reference-home-hero__image-stage">
            <AnimatePresence initial={false} custom={slideDirection} mode="sync">
              <motion.img
                key={vehicle.id}
                custom={slideDirection}
                src={photo}
                sizes="(max-width: 900px) 100vw, 65vw"
                width="1440"
                height="810"
                alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                fetchPriority="high"
                decoding="async"
                initial={{ x: reduceMotion ? '0%' : `${slideDirection * 100}%` }}
                animate={{ x: '0%' }}
                exit={{ x: reduceMotion ? '0%' : `${slideDirection * -100}%` }}
                transition={{ duration: reduceMotion ? 0 : 0.72, ease: [0.22, 1, 0.36, 1] }}
              />
            </AnimatePresence>
          </span>
          <span className="reference-home-hero__vehicle-panel">
            <span className="reference-home-hero__vehicle-kicker">Featured Vehicle</span>
            <span className="reference-home-hero__vehicle-title">{vehicle.year} {vehicle.make} {vehicle.model}</span>
            <span className="reference-home-hero__vehicle-price">{formatPrice(vehicle.price)}</span>
            <span className="reference-home-hero__vehicle-specs">
              <span>{vehicle.mileage > 0 ? `${formatNumber(vehicle.mileage)} miles` : 'Mileage not listed'}</span>
              <span>{vehicle.bodyType}</span>
              <span>{vehicle.drivetrain}</span>
              <span>{vehicle.transmission}</span>
            </span>
            <span className="reference-home-hero__vehicle-cta">View Vehicle <FaArrowRight aria-hidden="true" /></span>
          </span>
        </Link> : <img src="/images/vehicle-photo-coming-soon.webp" sizes="(max-width: 900px) 100vw, 65vw" width="1440" height="810" alt="Vehicle photo coming soon" fetchPriority="high" decoding="async" />}
        {slideCount > 1 && <div className="reference-home-hero__controls" aria-label="Featured vehicle photos">
          <div className="reference-home-hero__indicators" aria-hidden="true">{slides.map((item, index) => <i key={item.id} className={index === activeSlide ? 'is-active' : undefined} />)}</div>
          <button type="button" aria-label="Previous vehicle" onClick={() => changeSlide(-1)}><FaChevronLeft aria-hidden="true" /></button>
          <button type="button" aria-label="Next vehicle" onClick={() => changeSlide(1)}><FaChevronRight aria-hidden="true" /></button>
        </div>}
      </div>
    </section>
  )
}

const FeaturedVehicles = ({ vehicles, loading }: { vehicles: Vehicle[]; loading: boolean }) => {
  return (
    <div className="featured-stock" aria-labelledby="featured-stock-title">
      <div className="featured-stock__inner">
        <div className="featured-stock__top">
          <div className="featured-stock__heading">
            <p className="featured-stock__eyebrow"><i aria-hidden="true" />Featured Inventory</p>
            <h2 id="featured-stock-title">Popular Vehicles</h2>
          </div>
          <Link to="/inventory" className="featured-stock__all-link">View All Inventory <FaArrowRight aria-hidden="true" /></Link>
        </div>
        <div className="featured-stock__grid inventory-vehicle-grid" role="region" aria-label="Popular vehicles" aria-live="polite">
          {loading ? <p className="featured-stock__empty">Loading vehicles…</p>
            : vehicles.length ? vehicles.map((vehicle) => <InventoryVehicleCard key={vehicle.id} vehicle={vehicle} />)
              : <p className="featured-stock__empty">Vehicle listings are coming soon. Call Osborne Motors for current vehicle information.</p>}
        </div>
      </div>
    </div>
  )
}

const HomeContactPanel = () => (
  <aside className="home-contact-panel" aria-labelledby="home-contact-title">
    <p className="home-contact-panel__eyebrow">Get in Touch</p>
    <h2 id="home-contact-title">We’re Here to Help</h2>
    <div className="home-contact-panel__details">
      <a href={business.phoneHref} onClick={() => trackContactCta('phone_click', 'Homepage Contact Panel')}><FaPhoneAlt aria-hidden="true" /><span>{business.phoneDisplay}</span></a>
      <a href={business.mapsUrl} target="_blank" rel="noreferrer"><FaMapMarkerAlt aria-hidden="true" /><span>{business.address}, {business.cityState} {business.postalCode}</span></a>
      <div><FaClock aria-hidden="true" /><span>Mon – Fri: 9:00 AM – 6:00 PM<br />Sat: 9:00 AM – 4:00 PM</span></div>
    </div>
    <Link className="home-contact-panel__button" to="/contact">Contact Us <FaArrowRight aria-hidden="true" /></Link>
  </aside>
)

const AboutVisitSection = () => (
  <section className="about-visit" aria-labelledby="about-visit-title">
    <div className="about-visit__inner">
      <img className="about-visit__photo" src="/images/osborne-dealership-reference.webp" sizes="(max-width: 900px) 100vw, 48vw" width="1672" height="941" alt="Osborne Motors dealership in Norfolk, Nebraska" loading="lazy" decoding="async" />
      <div className="about-visit__copy">
        <p className="about-visit__eyebrow"><span aria-hidden="true" />About Osborne Motors</p>
        <h2 id="about-visit-title">A Local Dealership<br />You Can Count On</h2>
        <p>Osborne Motors is a used car dealership located in Norfolk, Nebraska. We offer a selection of quality pre-owned cars, trucks, and SUVs at fair prices. Our goal is to make the buying process simple and straightforward, with honest information and helpful service.</p>
        <Link to="/about" className="about-visit__learn">Learn More About Us <FaArrowRight aria-hidden="true" /></Link>
      </div>
      <aside className="about-visit__location" aria-label="Visit Osborne Motors">
        <div className="about-visit__location-heading">
          <FaMapMarkerAlt aria-hidden="true" />
          <div><p>Visit Us</p><h3>{business.address}<br />Norfolk, Nebraska</h3></div>
        </div>
        <div className="about-visit__map"><iframe title="Satellite map showing Osborne Motors" src={business.mapEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div>
        <a className="about-visit__directions" href={business.mapsUrl} target="_blank" rel="noreferrer" onClick={() => trackContactCta('directions_click', 'Homepage Visit Us Directions')}>Get Directions <FaArrowRight aria-hidden="true" /></a>
      </aside>
    </div>
  </section>
)

const homeCustomerReviews = [
  {
    author: 'Michel Rallo',
    date: '10 months ago',
    quote: 'Had a great experience at Osborne Motors browsing their classic collection. The hospitality here is amazing—they make you feel welcome from the moment you walk in. Super knowledgeable team and a zero-pressure environment. You can tell they truly love what they do. Highly recommend stopping by!',
  },
  {
    author: 'Oliver Jefferson',
    date: '10 months ago',
    quote: 'Recently purchased a vehicle from this dealership and had a great experience from start to finish. The sales staff was professional, friendly, and never pushy. They took the time to answer all my questions, explained everything clearly, and made the whole process smooth and stress free.',
  },
  {
    author: 'Christina Carstens',
    date: 'Updated 2 years ago',
    quote: 'This is the best place to bring your car! Super honest excellent mechanic who will get the job done right every time! You cannot go wrong with Mr Osborne he is honest dependable and reliable best mechanic in northeast Nebraska!!',
  },
]

const HomeReviewsSection = () => (
  <section className="home-reviews" aria-labelledby="home-reviews-title">
    <div className="home-reviews__inner">
      <div className="home-reviews__topbar">
        <p className="home-reviews__topbar-label">Customer Reviews</p>
        <a href={business.mapsUrl} target="_blank" rel="noreferrer">View All Reviews <FaArrowRight aria-hidden="true" /></a>
      </div>
      <div className="home-reviews__content">
        <div className="home-reviews__intro">
          <h2 id="home-reviews-title">Customers Trust<br />Osborne Motors</h2>
          <span aria-hidden="true" />
          <p>We’re grateful for the feedback customers share about their experiences with Osborne Motors. Here are a few recent reviews.</p>
        </div>
        <div className="home-reviews__grid">
          {homeCustomerReviews.map((review) => (
            <article className="home-review-card" key={review.author}>
              <div className="home-review-card__meta">
                <span className="home-review-card__stars" aria-label="5 out of 5 stars">★★★★★</span>
                <time>{review.date}</time>
              </div>
              <p className="home-review-card__quote">“{review.quote}”</p>
              <h3>{review.author}</h3>
            </article>
          ))}
        </div>
      </div>
    </div>
  </section>
)

const HomeVisitSection = () => (
  <section className="home-visit" aria-labelledby="home-visit-title">
    <div className="home-visit__inner">
      <img
        className="home-visit__photo"
        src="/images/osborne-visit-dealership.webp"
        width="1672"
        height="941"
        alt="Osborne Motors dealership on East Norfolk Avenue"
        loading="lazy"
        decoding="async"
      />
      <div className="home-visit__content">
        <p className="home-visit__eyebrow"><span aria-hidden="true" />Visit Osborne Motors</p>
        <h2 id="home-visit-title">Stop By and See Us in Norfolk</h2>
        <p className="home-visit__description">We’re easy to find and always happy to have you stop by. Browse our selection in person, take a test drive, or talk with our team about your next vehicle. We’re here to help and look forward to seeing you at Osborne Motors.</p>
        <div className="home-visit__details">
          <div className="home-visit__contacts">
            <a href={business.mapsUrl} target="_blank" rel="noreferrer" onClick={() => trackContactCta('directions_click', 'Homepage Visit Osborne Motors Address')}>
              <FaMapMarkerAlt aria-hidden="true" />
              <span>{business.address}<br />{business.cityState} {business.postalCode}</span>
            </a>
            <a href={business.phoneHref} onClick={() => trackContactCta('phone_click', 'Homepage Visit Osborne Motors Phone')}>
              <FaPhoneAlt aria-hidden="true" />
              <span>{business.phoneDisplay}</span>
            </a>
          </div>
          <div className="home-visit__map">
            <iframe title="Map showing Osborne Motors in Norfolk" src={business.mapEmbedUrl.replace('t=k', 't=m')} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        </div>
        <div className="home-visit__actions">
          <a className="home-visit__directions" href={business.mapsUrl} target="_blank" rel="noreferrer" onClick={() => trackContactCta('directions_click', 'Homepage Visit Osborne Motors Directions')}>Get Directions <FaArrowRight aria-hidden="true" /></a>
          <Link className="home-visit__contact" to="/contact">Contact Us <FaArrowRight aria-hidden="true" /></Link>
        </div>
      </div>
    </div>
  </section>
)
