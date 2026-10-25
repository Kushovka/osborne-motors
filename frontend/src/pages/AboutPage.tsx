import { FaArrowRight, FaClock, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa'
import { Seo } from '../components/Seo'
import { business } from '../data/business'

export const AboutPage = () => (
  <main className="about-page about-reference">
    <Seo title="About Osborne Motors" description="Find Osborne Motors at 516 E Norfolk Ave in Norfolk, Nebraska. View current hours and contact details." />
    <section className="ar-hero ar-frame">
      <div className="ar-hero-copy">
        <h1>Osborne Motors</h1>
        <h2>Automotive service in Norfolk, Nebraska.</h2>
        <p>Visit us at 516 E Norfolk Ave or call with questions about our current vehicles and services.</p>
        <p className="ar-tagline">Osborne Motors · Norfolk, Nebraska</p>
      </div>
      <img className="ar-hero-photo" src="/images/vehicle-photo-coming-soon.webp" alt="Automotive service" fetchPriority="high" decoding="async" />
      <aside className="ar-visit-card">
        <h3>Visit Osborne Motors</h3>
        <p><FaMapMarkerAlt /><span><strong>{business.address}<br />{business.cityState} {business.postalCode}</strong></span></p>
        <p><FaClock /><span><strong>Hours</strong><small>Mon–Fri: 9:00 AM–6:00 PM<br />Sat: 9:00 AM–4:00 PM<br />Sun: Closed</small></span></p>
        <a className="ar-button ar-button--red" href={business.phoneHref}><FaPhoneAlt /> Call {business.phoneDisplay}</a>
        <a className="ar-button ar-button--outline" href={business.mapsUrl} target="_blank" rel="noreferrer"><FaMapMarkerAlt /> Get Directions <FaArrowRight /></a>
      </aside>
    </section>
    <section className="ar-local ar-frame">
      <div className="ar-local-copy"><h2>Find Us in Norfolk</h2><i /><p>Osborne Motors is located at 516 E Norfolk Ave, Norfolk, NE 68701. Call us during business hours for current information.</p></div>
      <div className="ar-contact-card">
        <p><FaMapMarkerAlt /><span><strong>{business.address}<br />{business.cityState} {business.postalCode}</strong></span></p>
        <a href={business.phoneHref}><FaPhoneAlt /><strong>{business.phoneDisplay}</strong></a>
        <p><FaClock /><span><strong>Hours</strong><small>Mon–Fri: 9:00 AM–6:00 PM<br />Sat: 9:00 AM–4:00 PM<br />Sun: Closed</small></span></p>
      </div>
      <a className="ar-map" href={business.mapsUrl} target="_blank" rel="noreferrer" aria-label="Open directions to Osborne Motors"><iframe title={`Map to ${business.name}`} src={business.mapEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></a>
    </section>
    <section className="ar-faq ar-band"><div className="ar-faq-copy"><h2>Questions?</h2><i /><p>Call Osborne Motors for current information.</p></div><div className="ar-faq-list"><article><h3><a href={business.phoneHref}>{business.phoneDisplay}</a></h3><p>{business.address}, {business.cityState} {business.postalCode}</p></article></div></section>
  </main>
)
