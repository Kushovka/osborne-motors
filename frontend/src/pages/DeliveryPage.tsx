import { FaPhoneAlt } from 'react-icons/fa'
import { Link } from 'react-router'
import { Seo } from '../components/Seo'
import { business } from '../data/business'

export const DeliveryPage = () => <main className="delivery-page">
  <Seo title="Contact Osborne Motors" description="Call Osborne Motors in Norfolk, Nebraska for current information." />
  <section className="delivery-hero">
    <div className="delivery-hero-copy"><h1>How Can We Help?</h1><h2>Contact Osborne Motors</h2><p className="delivery-hero-description">Call us during business hours or stop by our Norfolk location for current information.</p></div>
    <img className="delivery-hero-image" src="/images/vehicle-photo-coming-soon.webp" alt="Automotive service" />
    <aside className="delivery-contact-card"><h3>Call or Visit</h3><p>{business.address}<br />{business.cityState} {business.postalCode}</p><a className="delivery-phone" href={business.phoneHref}><FaPhoneAlt aria-hidden="true" />{business.phoneDisplay}</a><p className="delivery-hours">Mon–Fri: 9:00 AM–6:00 PM<br />Sat: 9:00 AM–4:00 PM<br />Sun: Closed</p><Link className="delivery-button delivery-button--red" to="/contact">Contact Us</Link></aside>
  </section>
</main>
