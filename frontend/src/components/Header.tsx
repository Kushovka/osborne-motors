import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router'
import { FaArrowRight, FaBars, FaCar, FaChevronDown, FaMapMarkerAlt, FaPhoneAlt, FaRegCommentDots, FaSearch, FaShieldAlt, FaTimes, FaTruck } from 'react-icons/fa'
import { FiChevronRight } from 'react-icons/fi'
import { createPortal } from 'react-dom'
import { listVehicles } from '../api/vehicles'
import { business } from '../data/business'
import type { Vehicle } from '../types/vehicle'
import { trackContactCta } from '../utils/ctaTracking'
import { formatVehiclePrice, formatVehicleTitle } from '../utils/format'
import { HeaderMessageDialog } from './HeaderMessageDialog'

const desktopNavItems = [
  { label: 'Home', href: '/' },
  { label: 'Inventory', href: '/inventory' },
  { label: 'Delivery', href: '/delivery' },
  { label: 'Warranty', href: '/warranty' },
  { label: 'About', href: '/about', children: [{ label: 'About Osborne Motors', href: '/about' }, { label: 'Our Team', href: '/team' }] },
  { label: 'Contact', href: '/contact' },
]

const mobileNavItems = [
  { label: 'Home', href: '/' },
  { label: 'Inventory', href: '/inventory' },
  { label: 'Delivery', href: '/delivery' },
  { label: 'Warranty', href: '/warranty' },
  { label: 'About', href: '/about' },
  { label: 'Our Team', href: '/team' },
  { label: 'Contact', href: '/contact' },
]

const compactNavItems = [
  { label: 'Home', href: '/', children: undefined },
  { label: 'Inventory', href: '/inventory', children: [
    { label: 'View All Vehicles', href: '/inventory' },
    { label: 'Cars', href: '/inventory?bodyType=Sedan' },
    { label: 'Trucks', href: '/inventory?bodyType=Truck' },
    { label: 'SUVs', href: '/inventory?bodyType=SUV' },
  ] },
  { label: 'Services', href: '/delivery', children: [
    { label: 'Vehicle Delivery', href: '/delivery' },
    { label: 'Warranty', href: '/warranty' },
  ] },
  { label: 'About', href: '/about', children: [
    { label: 'About Osborne Motors', href: '/about' },
    { label: 'Our Team', href: '/team' },
  ] },
  { label: 'Contact', href: '/contact', children: undefined },
]

export const HeaderSearch = ({ variant = 'header' }: { variant?: 'header' | 'hero' }) => {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [matches, setMatches] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const term = query.trim()
    if (term.length < 2) return

    let cancelled = false
    listVehicles({ q: term, pageSize: 3 })
      .then((response) => { if (!cancelled) setMatches(response.items) })
      .catch(() => { if (!cancelled) setMatches([]) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [query])

  const viewSearch = () => {
    const term = query.trim()
    if (term) navigate(`/inventory?q=${encodeURIComponent(term)}`)
  }

  const searchTerm = query.trim()
  const visibleMatches = searchTerm.length >= 2 ? matches : []
  const isSearching = searchTerm.length >= 2 && loading

  return <div id={variant === 'hero' ? 'hero-search' : undefined} className={`relative w-full ${variant === 'hero' ? 'max-w-none scroll-mt-6' : '2xl:max-w-[560px]'}`}>
    <div className={`header-search-control flex items-center gap-0 overflow-hidden transition-colors ${variant === 'hero' ? 'h-[50px] rounded-[7px] border border-[#782C32] bg-white shadow-sm focus-within:border-[#782C32]' : 'h-[49px] rounded-[8px] border border-[#A9ADB0] bg-[#FFFFFF] focus-within:border-[#782C32]'}`}>
    <label className="relative flex h-full min-w-0 flex-1 items-center gap-3 pl-3 2xl:gap-4 2xl:pl-4">
      <span className="sr-only">Search inventory</span>
      <FaSearch aria-hidden="true" className={`shrink-0 text-[16px] ${variant === 'hero' ? 'text-[#782C32]' : 'text-[var(--color-button)] 2xl:text-[19px]'}`} />
      <input
        className={`h-9 min-w-0 w-full bg-transparent py-0 pr-1 text-[#252A2E] outline-none placeholder:text-[#782C32] ${variant === 'hero' ? 'text-[15px]' : 'text-[13px] 2xl:text-[14px]'}`}
        type="text"
        inputMode="search"
        value={query}
        onChange={(event) => {
          const nextQuery = event.target.value
          setQuery(nextQuery)
          setLoading(nextQuery.trim().length >= 2)
        }}
        onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); viewSearch() } if (event.key === 'Escape') setQuery('') }}
        placeholder={variant === 'hero' ? 'Search by make, model, or body style' : 'Search make, model, or keyword...'}
      />
      {query ? <button type="button" aria-label="Clear inventory search" onClick={() => setQuery('')} className="grid h-9 w-9 shrink-0 place-items-center text-base text-[#782C32] transition hover:text-[#252A2E]"><FaTimes aria-hidden="true" /></button> : null}
    </label>
    {variant === 'header' ? <button type="button" onClick={viewSearch} className="header-search-submit inline-flex h-full shrink-0 items-center justify-center gap-2 whitespace-nowrap bg-[var(--color-button)] px-4 text-[12px] font-bold text-white transition hover:bg-[var(--color-button-hover)] sm:px-5 2xl:px-6 2xl:text-[13px]">Search <FaArrowRight aria-hidden="true" className="text-[12px]" /></button> : null}
    </div>
    {searchTerm.length >= 2 ? <div role="region" aria-label="Vehicle search results" className="absolute left-0 right-0 top-[calc(100%+0.6rem)] z-50 max-h-[min(360px,calc(100dvh-7rem))] w-full overflow-y-auto rounded-xl border border-[#A9ADB0] bg-white text-[#252A2E] shadow-[0_18px_44px_rgba(37,42,46,0.24)]">
      <div className="flex min-h-11 items-center justify-between border-b border-[#A9ADB0] bg-[#FFFFFF] px-4 sm:px-5"><span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#782C32]">{isSearching ? 'Searching inventory' : `${visibleMatches.length} ${visibleMatches.length === 1 ? 'matching vehicle' : 'matching vehicles'}`}</span><span className="h-2 w-2 rounded-full bg-[#782C32]" aria-hidden="true" /></div>
      {isSearching ? <p className="px-5 py-6 text-sm text-[#782C32]">Looking through current inventory…</p> : visibleMatches.length ? <><div className="divide-y divide-[#A9ADB0]">{visibleMatches.map((vehicle) => {
        const photo = vehicle.images[0]
        const hasPhoto = Boolean(photo && !photo.includes('vehicle-photo-coming-soon'))
        return <Link key={vehicle.id} to={`/inventory/${vehicle.slug}`} onClick={() => setQuery('')} className="group grid min-h-[88px] grid-cols-[72px_minmax(0,1fr)] items-center gap-3 px-3 py-2.5 transition-colors hover:bg-[#FFFFFF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#782C32] sm:grid-cols-[104px_minmax(0,1fr)_auto] sm:gap-4 sm:px-5 sm:py-3">
          <img src={hasPhoto ? photo : '/images/vehicle-photo-coming-soon-card.webp'} alt="" className="h-[54px] w-[72px] rounded-md border border-[#A9ADB0] bg-[#FFFFFF] object-cover sm:h-[68px] sm:w-[104px]" />
          <span className="min-w-0 text-left"><strong className="line-clamp-2 text-[14px] font-bold leading-tight text-[#252A2E] sm:line-clamp-1 sm:text-[16px]">{formatVehicleTitle(vehicle)}</strong><span className="mt-1 block truncate text-[12px] text-[#782C32] sm:text-[13px]">{vehicle.status === 'Placeholder' ? 'Vehicle details coming soon' : vehicle.trim || vehicle.bodyType || 'Available now'}</span><span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#782C32] sm:hidden">{formatVehiclePrice(vehicle)}</span></span>
          <span className="hidden items-center gap-3 pl-2 text-right sm:flex"><span className="whitespace-nowrap text-[16px] font-bold tabular-nums text-[#782C32]">{formatVehiclePrice(vehicle)}</span><FaArrowRight aria-hidden="true" className="text-[12px] text-[#782C32] transition-transform group-hover:translate-x-1" /></span>
        </Link>
      })}</div><button type="button" onClick={viewSearch} className="header-search-browse-all flex min-h-11 w-full items-center justify-between border-t border-[#A9ADB0] px-4 text-[11px] font-bold uppercase tracking-[0.08em] text-[#782C32] transition-colors hover:bg-[#782C32] hover:text-white sm:px-5"><span>Browse all matching vehicles</span><FaArrowRight aria-hidden="true" /></button></> : <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-5"><div className="min-w-0 text-left"><strong className="block text-[14px] font-bold text-[#252A2E] sm:text-[15px]">No vehicles found for “{query.trim()}”</strong><span className="mt-1 block text-[12px] leading-5 text-[#782C32] sm:text-[13px]">Try another search or browse the full inventory.</span></div><Link to="/inventory" onClick={() => setQuery('')} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-[#782C32] px-4 text-[11px] font-bold uppercase tracking-[0.06em] text-white transition-colors hover:bg-[#782C32] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#782C32]"><span>View all inventory</span><FaArrowRight aria-hidden="true" /></Link></div>}
    </div> : null}
  </div>
}

export const Header = () => {
  const [open, setOpen] = useState(false)
  const [messageOpen, setMessageOpen] = useState(false)
  const [showCompactHeader, setShowCompactHeader] = useState(false)
  const [dismissedDropdown, setDismissedDropdown] = useState<string | null>(null)
  const reduceMotion = useReducedMotion()
  const showPromoBar = false
  const phoneHref = business.phoneHref || business.contactHref
  const displayPhone = business.phoneDisplay

  useEffect(() => {
    const desktopCompactHeader = window.matchMedia('(min-width: 761px)')
    const onScroll = () => setShowCompactHeader(desktopCompactHeader.matches && window.scrollY > 90)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    desktopCompactHeader.addEventListener('change', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      desktopCompactHeader.removeEventListener('change', onScroll)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])


  return (
    <>
    <motion.header
      id="site-header"
      className="reference-home-header relative z-40"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: 'easeOut' }}
    >
      <div className="reference-brand-row">
        <a className="reference-brand-location" href={business.mapsUrl} target="_blank" rel="noreferrer" onClick={() => trackContactCta('directions_click', 'Header Location')}>
          Norfolk, Nebraska
        </a>
        <span className="reference-brand-divider" aria-hidden="true" />
        <Link to="/" className="reference-brand-logo" aria-label="Osborne Motors home" onClick={() => setOpen(false)}>
          <img className="reference-dealer-logo" src="/images/osborne-motors-logo.webp" alt={business.name} />
        </Link>
        <span className="reference-brand-divider" aria-hidden="true" />
        <div className="reference-brand-contact">
          <a className="reference-brand-phone" href={phoneHref} onClick={() => trackContactCta('phone_click', 'Site Header Call')}>
            <span>Call Us</span>
            <strong>{displayPhone}</strong>
          </a>
          <div className="reference-brand-mobile-actions">
            <button
              aria-label="Open message form"
              className="grid h-10 w-10 place-items-center border border-[#252A2E] text-[#252A2E] transition hover:text-[#782C32]"
              onClick={() => { setMessageOpen(true); trackContactCta('message_click', 'Mobile Header Message') }}
              type="button"
            >
              <FaRegCommentDots aria-hidden="true" className="text-[19px]" />
            </button>
            <button
              aria-label="Open menu"
              className="grid h-10 w-10 place-items-center border border-[#252A2E] text-[#252A2E]"
              onClick={() => setOpen((value) => !value)}
              type="button"
            >
              {open ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>

      <nav aria-label="Main navigation" className="reference-site-nav">
        <div className="reference-site-nav__links">
          {desktopNavItems.map((item) => item.children ? (
            <div key={item.label} className={`reference-site-nav__group${dismissedDropdown === item.label ? ' is-dismissed' : ''}`} onMouseLeave={() => setDismissedDropdown(null)}>
              <NavLink to={item.href} end={item.href === '/'} onClick={() => setDismissedDropdown(item.label)} className={({ isActive }) => `reference-site-nav__link${isActive ? ' is-active' : ''}`}>
                {item.label}<FaChevronDown aria-hidden="true" className="reference-site-nav__chevron" />
              </NavLink>
              <div className="reference-site-nav__dropdown">
                {item.children.map((child) => <NavLink key={child.href} to={child.href} end onClick={(event) => { event.currentTarget.blur(); setDismissedDropdown(item.label) }} className={({ isActive }) => `reference-site-nav__dropdown-link${isActive ? ' is-active' : ''}`}>{child.label}</NavLink>)}
              </div>
            </div>
          ) : <NavLink key={item.label} to={item.href} end={item.href === '/'} className={({ isActive }) => `reference-site-nav__link${isActive ? ' is-active' : ''}`}>{item.label}</NavLink>)}
        </div>
      </nav>

      {showPromoBar ? <div className="home-promo-bar"><span>Check Out Our Latest Selection of Quality Pre-Owned Vehicles!</span><Link to="/inventory">View Inventory</Link></div> : null}

      {createPortal(<AnimatePresence>
        {open ? (
          <motion.div
            className="mobile-menu-backdrop fixed inset-0 z-[100] flex items-stretch justify-end p-0 xl:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(event) => { if (event.target === event.currentTarget) setOpen(false) }}
          >
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              className="mobile-menu-panel flex h-[100dvh] flex-col overflow-y-auto bg-[#FFFFFF] text-[#252A2E]"
            initial={{ x: reduceMotion ? 0 : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: reduceMotion ? 0 : '100%' }}
              transition={reduceMotion ? { duration: 0.01 } : { type: 'spring', stiffness: 220, damping: 30, mass: 1, restSpeed: 0.01, restDelta: 0.01 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mobile-menu-head shrink-0">
                <Link to="/" className="flex min-w-0 items-center" onClick={() => setOpen(false)}>
                  <img className="reference-dealer-logo" src="/images/osborne-motors-logo.webp" alt={business.name} />
                </Link>
                <button
                  aria-label="Close menu"
                  className="mobile-menu-close grid shrink-0 place-items-center text-[32px] text-[#252A2E] transition hover:text-[#782C32] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#782C32]"
                  onClick={() => setOpen(false)}
                  type="button"
                >
                  <FaTimes />
                </button>
              </div>

              <nav aria-label="Main navigation" className="mobile-menu-nav shrink-0">
                {mobileNavItems.map(({ label, href }) => (
                  <NavLink
                    key={href}
                    to={href}
                    onClick={() => setOpen(false)}
                    className="mobile-menu-item group flex min-h-[62px] items-center justify-between border-b text-left transition"
                  >
                    <span>{label}</span>
                    <FiChevronRight aria-hidden="true" className="mobile-menu-arrow h-7 w-7 shrink-0 transition-transform group-hover:translate-x-1" />
                  </NavLink>
                ))}
              </nav>

              <div className="mobile-menu-footer mt-auto shrink-0">
                <a href={business.mapsUrl} target="_blank" rel="noreferrer" className="mobile-menu-location" onClick={() => { setOpen(false); trackContactCta('directions_click', 'Mobile Menu Directions') }}>
                  <FaMapMarkerAlt aria-hidden="true" />
                  <span>NORFOLK, NEBRASKA</span>
                </a>
                <a href={phoneHref} className="mobile-menu-phone" onClick={() => { setOpen(false); trackContactCta('phone_click', 'Mobile Menu Contact') }}>
                  <FaPhoneAlt aria-hidden="true" />
                  <span>{displayPhone}</span>
                </a>
                <div className="mobile-menu-actions">
                  <Link to="/inventory" onClick={() => setOpen(false)} className="mobile-menu-inventory">View Inventory <FaChevronDown aria-hidden="true" className="-rotate-90 shrink-0" /></Link>
                </div>
              </div>

            </motion.section>
          </motion.div>
        ) : null}
      </AnimatePresence>, document.body)}
    </motion.header>
    <nav className="mobile-bottom-nav" aria-label="Mobile quick navigation">
      <NavLink to="/inventory" className={({ isActive }) => `mobile-bottom-nav__item${isActive ? ' is-active' : ''}`}>
        <FaCar aria-hidden="true" />
        <span>Inventory</span>
      </NavLink>
      <NavLink to="/delivery" className={({ isActive }) => `mobile-bottom-nav__item${isActive ? ' is-active' : ''}`}>
        <FaTruck aria-hidden="true" />
        <span>Delivery</span>
      </NavLink>
      <NavLink to="/warranty" className={({ isActive }) => `mobile-bottom-nav__item${isActive ? ' is-active' : ''}`}>
        <FaShieldAlt aria-hidden="true" />
        <span>Warranty</span>
      </NavLink>
      <button className="mobile-bottom-nav__item" type="button" aria-label="Open contact form" aria-haspopup="dialog" onClick={() => {
        setMessageOpen(true)
        trackContactCta('message_click', 'Mobile Bottom Contact')
      }}>
        <FaRegCommentDots aria-hidden="true" />
        <span>Contact</span>
      </button>
      <button className="mobile-bottom-nav__item" type="button" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        {open ? <FaTimes aria-hidden="true" /> : <FaBars aria-hidden="true" />}
        <span>Menu</span>
      </button>
    </nav>
    <AnimatePresence initial={false}>
      {showCompactHeader ? <motion.div
        key="compact-header"
        className="compact-header fixed inset-x-0 top-0 z-[60] border-b border-[#A9ADB0] bg-[#FFFFFF] shadow-[0_3px_10px_rgba(37,42,46,0.03)]"
        initial={{ y: reduceMotion ? 0 : -96, opacity: reduceMotion ? 1 : 0.98 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: reduceMotion ? 0 : -76, opacity: reduceMotion ? 1 : 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="compact-header__inner">
          <nav aria-label="Compact navigation" className="compact-header__nav">
            {compactNavItems.map((item) => item.children ? (
              <div key={item.label} className={`compact-header__nav-group${dismissedDropdown === item.label ? ' is-dismissed' : ''}`} onMouseLeave={() => setDismissedDropdown(null)}>
                <NavLink to={item.href} end={item.href === '/'} className={({ isActive }) => `compact-header__nav-link${isActive ? ' is-active' : ''}`}>{item.label}<FaChevronDown aria-hidden="true" /></NavLink>
                <div className="compact-header__dropdown">{item.children.map((child) => <NavLink key={child.href} to={child.href} end onClick={(event) => { event.currentTarget.blur(); setDismissedDropdown(item.label) }} className={({ isActive }) => `compact-header__dropdown-link${isActive ? ' is-active' : ''}`}>{child.label}</NavLink>)}</div>
              </div>
            ) : <NavLink key={item.label} to={item.href} end={item.href === '/'} className={({ isActive }) => `compact-header__nav-link${isActive ? ' is-active' : ''}`}>{item.label}</NavLink>)}
          </nav>
          <Link to="/" aria-label="Osborne Motors home" className="compact-header__brand" onClick={() => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })}>
            <img src="/images/osborne-motors-logo.webp" alt="" className="compact-header__logo" />
          </Link>
          <div className="compact-header__contact">
            <a href={phoneHref} onClick={() => trackContactCta('phone_click', 'Compact Header Phone')}><FaPhoneAlt aria-hidden="true" />{displayPhone}</a>
          </div>
        </div>
      </motion.div> : null}
    </AnimatePresence>
    <HeaderMessageDialog open={messageOpen} onClose={() => setMessageOpen(false)} />
    </>
  )
}
