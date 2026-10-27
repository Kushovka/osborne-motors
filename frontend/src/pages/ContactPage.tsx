import { FaArrowRight, FaClock, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa'
import { LeadForm } from '../components/LeadForm'
import { Seo } from '../components/Seo'
import { business } from '../data/business'
import { trackContactCta } from '../utils/ctaTracking'

const phoneHref = business.phoneHref || business.contactHref
const contactHours = [
  ['Monday – Friday', business.hoursList[0][1]],
  ['Saturday', business.hoursList[5][1]],
  ['Sunday', business.hoursList[6][1]],
]

export const ContactPage = () => <main className="contact-page contact-v2">
  <Seo title="Contact Osborne Motors" description="Call, visit, or send a message to Osborne Motors in Norfolk, Nebraska." />

  <header className="contact-v2__titlebar">
    <div className="contact-v2__titlebar-inner">
      <h1 id="contact-title">Contact Us</h1>
    </div>
  </header>

  <div className="contact-v2__content">
    <section className="contact-v2__intro" aria-labelledby="contact-intro-title">
      <div>
        <h2 id="contact-intro-title">We’re Here to Help</h2>
        <p>Give us a call, send us a message, or stop by our dealership in Norfolk, Nebraska. Our team is happy to answer your questions and help you find the right vehicle.</p>
      </div>
      <img src="/images/osborne-dealership-reference.webp" alt="Osborne Motors dealership and vehicle lot" fetchPriority="high" />
    </section>

    <section className="contact-v2__details" aria-label="Contact details">
      <article>
        <span className="contact-v2__icon"><FaPhoneAlt aria-hidden="true" /></span>
        <div><h2>Phone</h2><a className="contact-v2__phone" href={phoneHref} onClick={() => trackContactCta('phone_click', 'Contact Page Phone Card')}>{business.phoneDisplay}</a><p>Give us a call during business hours. We’re always happy to help.</p></div>
      </article>
      <article>
        <span className="contact-v2__icon"><FaMapMarkerAlt aria-hidden="true" /></span>
        <div><h2>Address</h2><a className="contact-v2__address" href={business.mapsUrl} target="_blank" rel="noreferrer" onClick={() => trackContactCta('directions_click', 'Contact Page Address Card')}>{business.address}<br />{business.cityState} {business.postalCode}</a><p>Visit our dealership and see our inventory in person.</p></div>
      </article>
      <article className="contact-v2__hours-card">
        <span className="contact-v2__icon"><FaClock aria-hidden="true" /></span>
        <div><h2>Hours</h2><dl>{contactHours.map(([day, hours]) => <div key={day}><dt>{day}</dt><dd>{hours}</dd></div>)}</dl></div>
      </article>
    </section>

    <section className="contact-v2__message" aria-labelledby="contact-message-title">
      <div className="contact-v2__form-column">
        <h2 id="contact-message-title">Send Us a Message</h2>
        <p>Have a question about a vehicle or delivery, or just want to get in touch? Fill out the form below and our team will get back to you.</p>
        <LeadForm
          title="Send Message"
          className="vehicle-inquiry-form"
          namePlaceholder="Enter your full name"
          phonePlaceholder="Enter your phone number"
          emailPlaceholder="Enter your email address"
          messagePlaceholder="Tell us how we can help..."
          notice="No financing available."
          noticeLabel="Financing"
          actionAside={<p className="vehicle-inquiry__consent">By submitting this form, you agree to be contacted by Osborne Motors.</p>}
        />
      </div>
      <div className="contact-v2__media-column">
        <img className="contact-v2__lot-photo" src="/images/osborne-visit-dealership.webp" alt="Vehicles at Osborne Motors" loading="lazy" />
        <iframe title="Map to Osborne Motors" className="contact-v2__map" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={business.mapEmbedUrl} />
      </div>
    </section>
    <section className="contact-v2__visit" aria-labelledby="contact-visit-title">
      <div>
        <h2 id="contact-visit-title">Stop By and See Us</h2>
        <p>We’re conveniently located on E. Norfolk Ave. in Norfolk, Nebraska. Come check out our inventory, meet our team, and let us help you find the right vehicle.</p>
      </div>
      <a href={business.mapsUrl} target="_blank" rel="noreferrer" onClick={() => trackContactCta('directions_click', 'Contact Page Visit CTA')}>Get Directions <FaArrowRight aria-hidden="true" /></a>
    </section>
  </div>
</main>
