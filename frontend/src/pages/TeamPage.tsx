import { FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa'
import { Seo } from '../components/Seo'
import { business } from '../data/business'
import { trackContactCta } from '../utils/ctaTracking'

const teamMembers = [
  { image: '/images/osborne-team-member-7-harmonized.webp', name: 'Mark Ellison', role: 'General Manager', alt: 'Osborne Motors team member in a dark blazer and white shirt' },
  { image: '/images/osborne-team-member-8-harmonized.webp', name: 'Ashley Turner', role: 'Customer Experience Manager', alt: 'Osborne Motors team member in a light gray work jacket' },
  { image: '/images/osborne-team-member-6-harmonized.webp', name: 'Jason Kline', role: 'Account Manager', alt: 'Osborne Motors team member in a navy polo shirt' },
  { image: '/images/osborne-team-member-1-harmonized.webp', name: 'Robert Hayes', role: 'Vehicle Inventory & Logistics Manager', alt: 'Osborne Motors team member in the service department' },
  { image: '/images/osborne-team-member-4-harmonized.webp', name: 'Dylan Mason', role: 'Sales Representative', alt: 'Osborne Motors team member in a plain gray work shirt and cap' },
  { image: '/images/osborne-team-member-5-harmonized.webp', name: 'Daniel Brooks', role: 'Vehicle Delivery Coordinator', alt: 'Osborne Motors team member in a plain gray work shirt' },
  { image: '/images/osborne-team-member-2-harmonized.webp', name: 'Kevin Cole', role: 'Vehicle Specialist', alt: 'Osborne Motors team member in an unbranded gray work shirt' },
  { image: '/images/osborne-team-member-3-harmonized.webp', name: 'Brandon Reed', role: 'Vehicle Specialist', alt: 'Osborne Motors team member in an unbranded gray work shirt' },
]

export const TeamPage = () => (
  <main className="team-page">
    <Seo title="Our Team" description="Meet the people at Osborne Motors in Norfolk, Nebraska." />
    <header className="team-page__titlebar">
      <div className="team-page__titlebar-inner">
        <h1>Our Team</h1>
      </div>
    </header>
    <section className="team-section" aria-labelledby="team-title">
      <div className="team-intro">
        <div className="team-intro-copy">
          <h2 id="team-title">Here to Help in Norfolk</h2>
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
      <section className="team-gallery" aria-labelledby="team-gallery-title">
        <h2 id="team-gallery-title" className="team-gallery__title">Meet Our Team</h2>
        <div className="team-gallery__grid">
          {teamMembers.map((member) => (
            <article className="team-card" key={member.name}>
              <figure className="team-portrait">
                <img src={member.image} alt={member.alt} loading="lazy" decoding="async" />
              </figure>
              <div className="team-card__caption">
                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  </main>
)
