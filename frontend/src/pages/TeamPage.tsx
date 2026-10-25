import { FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa'
import { Seo } from '../components/Seo'
import { business } from '../data/business'
import { trackContactCta } from '../utils/ctaTracking'

export const TeamPage = () => (
  <main className="team-page">
    <Seo title="Contact Osborne Motors" description="Contact Osborne Motors in Norfolk, Nebraska." />
    <section className="team-section" aria-labelledby="team-title">
      <div className="team-intro">
        <div className="team-intro-copy">
          <h1 id="team-title">Osborne Motors</h1>
          <p className="team-intro-description">Call or visit us in Norfolk. Our team can answer questions about our current vehicles and services.</p>
        </div>
        <aside className="team-visit-panel" aria-label="Visit or call Osborne Motors">
          <FaMapMarkerAlt className="team-visit-icon" aria-hidden="true" />
          <div className="team-visit-copy"><span>Visit Us</span><address>{business.address}<br />{business.cityState} {business.postalCode}</address></div>
          <a href={business.phoneHref} className="team-visit-phone" onClick={() => trackContactCta('phone_click', 'Contact Visit Us')}>
            <FaPhoneAlt aria-hidden="true" /> {business.phoneDisplay}<span aria-hidden="true">›</span>
          </a>
          <p>Monday–Friday, 9:00 AM–6:00 PM<br />Saturday, 9:00 AM–4:00 PM<br />Sunday: Closed</p>
        </aside>
      </div>
    </section>
  </main>
)
