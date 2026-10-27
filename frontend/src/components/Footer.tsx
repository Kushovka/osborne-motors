import { Link } from 'react-router'
import { FaArrowRight } from 'react-icons/fa'

import { business } from '../data/business'
import { trackContactCta } from '../utils/ctaTracking'

const inventoryLinks = [
  ['View All Vehicles', '/inventory'],
  ['Cars', '/inventory?bodyType=Sedan'],
  ['Trucks', '/inventory?bodyType=Truck'],
  ['SUVs', '/inventory?bodyType=SUV'],
] as const

const serviceLinks = [
  ['Vehicle Delivery', '/delivery'],
  ['Warranty', '/warranty'],
] as const

const aboutLinks = [
  ['About Us', '/about'],
  ['Our Team', '/team'],
  ['Customer Reviews', '/#home-reviews-title'],
  ['Directions', business.mapsUrl],
  ['Contact Us', '/contact'],
] as const

export const Footer = () => {
  return <footer className="dealer-footer">
    <div className="dealer-footer__main">
      <section className="dealer-footer__brand" aria-label="Osborne Motors">
        <Link to="/" className="dealer-footer__logo" aria-label="Osborne Motors home">
          <img src="/images/osborne-motors-logo.webp" alt="Osborne Motors" />
        </Link>
        <p>{business.address}<br />{business.cityState} {business.postalCode}</p>
      </section>

      <nav className="dealer-footer__navigation" aria-label="Footer navigation">
        <section className="dealer-footer__column" aria-labelledby="footer-inventory-title">
          <h2 id="footer-inventory-title">Inventory</h2>
          <i aria-hidden="true" />
          {inventoryLinks.map(([label, href]) => <Link to={href} key={label}>{label}</Link>)}
        </section>
        <section className="dealer-footer__column" aria-labelledby="footer-services-title">
          <h2 id="footer-services-title">Our Services</h2>
          <i aria-hidden="true" />
          {serviceLinks.map(([label, href]) => <Link to={href} key={href}>{label}</Link>)}
        </section>
        <section className="dealer-footer__column" aria-labelledby="footer-about-title">
          <h2 id="footer-about-title">About</h2>
          <i aria-hidden="true" />
          {aboutLinks.map(([label, href]) => href.startsWith('http')
            ? <a href={href} key={href} target="_blank" rel="noreferrer" onClick={() => trackContactCta('directions_click', 'Footer Directions')}>{label}</a>
            : <Link to={href} key={href}>{label}</Link>)}
        </section>
      </nav>

      <section className="dealer-footer__actions" aria-label="Call or visit Osborne Motors">
        <p>Give Us a Call</p>
        <a className="dealer-footer__phone" href={business.phoneHref} onClick={() => trackContactCta('phone_click', 'Footer Call')}>{business.phoneDisplay}</a>
        <Link to="/inventory" className="dealer-footer__button dealer-footer__button--primary" onClick={() => trackContactCta('inventory_click', 'Footer View Inventory')}>
          View Inventory <FaArrowRight aria-hidden="true" />
        </Link>
        <a href={business.mapsUrl} target="_blank" rel="noreferrer" className="dealer-footer__button dealer-footer__button--outline" onClick={() => trackContactCta('directions_click', 'Footer Get Directions')}>
          Get Directions <FaArrowRight aria-hidden="true" />
        </a>
      </section>
    </div>

    <div className="dealer-footer__bottom">
      <span>© {new Date().getFullYear()} Osborne Motors. All Rights Reserved.</span>
      <nav aria-label="Legal links">
        <Link to="/privacy-policy">Privacy Policy</Link>
        <Link to="/terms">Terms of Use</Link>
        <a href="/sitemap.xml">Sitemap</a>
      </nav>
    </div>
  </footer>
}
