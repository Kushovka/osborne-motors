import { FaArrowRight, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa'
import { Link } from 'react-router'
import { Seo } from '../components/Seo'
import { business } from '../data/business'

export const WarrantyPage = () => <main className="warranty-page warranty-reference">
  <Seo title="Vehicle and Service Information" description="Contact Osborne Motors for current vehicle or service information." />
  <div className="warranty-reference__wrap">
    <section className="wr-intro" aria-labelledby="warranty-title">
      <div className="wr-intro__copy"><h1 id="warranty-title">Vehicle &amp; Service Information</h1><p>For details about a specific vehicle, service, or applicable terms, call Osborne Motors. We can confirm current information directly with you.</p><span className="wr-rule" /><em>Osborne Motors · Norfolk, Nebraska</em></div>
      <aside className="wr-contact-card"><h2>Contact Us</h2><p>Call or visit during our posted business hours.</p><a className="wr-phone" href={business.phoneHref}><FaPhoneAlt aria-hidden="true" /> {business.phoneDisplay}</a><Link className="wr-button wr-button--red" to="/contact">Contact Details <FaArrowRight aria-hidden="true" /></Link></aside>
    </section>
    <section className="wr-process" aria-labelledby="wr-process-title"><div className="wr-process__copy"><h2 id="wr-process-title">Ask About Your Vehicle</h2><p className="wr-section-lead">Coverage and service terms depend on the specific vehicle or service. Please request the applicable written details from Osborne Motors.</p></div><aside className="wr-help"><img src="/images/vehicle-photo-coming-soon-card.webp" alt="Vehicle photo coming soon" /><div className="wr-help__body"><h3>Visit Us</h3><p className="wr-address"><FaMapMarkerAlt aria-hidden="true" /> <span>{business.address}<br />{business.cityState} {business.postalCode}</span></p><a className="wr-phone" href={business.phoneHref}><FaPhoneAlt aria-hidden="true" /> {business.phoneDisplay}</a></div></aside></section>
  </div>
</main>
