import { FaArrowRight, FaCheck, FaClock, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa'
import { LeadForm } from '../components/LeadForm'
import { Seo } from '../components/Seo'
import { business } from '../data/business'
import { trackContactCta } from '../utils/ctaTracking'

const phoneHref = business.phoneHref || business.contactHref
const reasons = [
  'Ask about current vehicles',
  'Ask about automotive services',
  'Confirm business hours or directions',
  'Send a general question to Osborne Motors',
]
const questions = [
  ['Where are you located?', 'Osborne Motors is at 516 E Norfolk Ave, Norfolk, NE 68701.'],
  ['How can I reach you?', 'Call us at +1 402-379-0445 or use the message form on this page.'],
  ['What are your hours?', 'Monday through Friday, 9:00 AM–6:00 PM; Saturday, 9:00 AM–4:00 PM; Sunday closed.'],
]

export const ContactPage = () => (
  <main className="contact-page contact-reference">
    <Seo title="Contact" description="Call, visit, or send a message to Osborne Motors in Norfolk, NE." />

    <section className="cr-intro">
      <div className="cr-container">
        <div className="cr-intro-grid">
          <div className="cr-intro-copy">
            <h1>Get in Touch With<br />Osborne Motors</h1>
            <p>Call Osborne Motors with questions about current vehicles, services, or visiting our Norfolk location.</p>
            <p>Reach us at 516 E Norfolk Ave, Norfolk, NE 68701, or send a message using the form on this page.</p>
          </div>
          <aside className="cr-card cr-reach-card">
            <h2>Best Ways to Reach Us</h2>
            <div className="cr-reach-item"><FaPhoneAlt /><div><a href={phoneHref} onClick={() => trackContactCta('phone_click', 'Contact Page Reach Us')}>{business.phoneDisplay}</a><small>Give us a call – we’re happy to help.</small></div></div>
            <a className="cr-reach-item" href={business.mapsUrl} target="_blank" rel="noreferrer" onClick={() => trackContactCta('directions_click', 'Contact Page Address')}><FaMapMarkerAlt /><div><strong>{business.address}<br />{business.cityState} {business.postalCode}</strong><small>Serving Norfolk and nearby communities.</small></div></a>
            <div className="cr-reach-item"><FaClock /><div><strong>Hours</strong><small>Mon–Fri: 9:00 AM – 6:00 PM<br />Sat: 9:00 AM – 4:00 PM<br />Sun: Closed</small></div></div>
            <div className="cr-reach-actions"><a className="cr-button cr-button-red" href={phoneHref} onClick={() => trackContactCta('phone_click', 'Contact Page Call Us')}><FaPhoneAlt />Call Us</a><a className="cr-button cr-button-outline" href={business.mapsUrl} target="_blank" rel="noreferrer" onClick={() => trackContactCta('directions_click', 'Contact Page Directions')}><FaMapMarkerAlt />Get Directions</a></div>
          </aside>
        </div>
      </div>
    </section>

    <section className="cr-main-section" aria-label="Contact our team">
      <div className="cr-container cr-main-grid">
        <div className="cr-when">
          <img src="/images/vehicle-photo-coming-soon.webp" sizes="(max-width: 760px) 100vw, 50vw" width="1440" height="810" alt="Automotive service" loading="lazy" decoding="async" />
          <div className="cr-when-copy">
            <h2>When to Reach Out</h2>
            <p>We’re happy to help with all kinds of questions. Here are a few common reasons people get in touch with us:</p>
            <ul>{reasons.map((reason) => <li key={reason}><FaCheck />{reason}</li>)}</ul>
          </div>
        </div>
        <div className="cr-card cr-form-card">
          <h2>Send Us a Message</h2>
          <p className="cr-form-intro">Fill out the form below and we’ll get back to you as soon as possible, usually within one business day.</p>
          <LeadForm title="Send Message" variant="contact" phonePlaceholder="(402) 379-0445" messagePlaceholder="How can we help you?" showVehicleInterest inquiryLabel="Preferred Contact Method" inquiryOptions={['Phone', 'Text', 'Email']} />
        </div>
      </div>
    </section>

    <section className="cr-visit-section">
      <div className="cr-container cr-visit-grid">
        <div className="cr-visit-copy">
          <h2>Visit or Call: Whatever Works Best</h2>
          <p>You’ll find Osborne Motors at 516 E Norfolk Ave in Norfolk, Nebraska. Call us during business hours if you have questions before visiting.</p>
          <div className="cr-visit-details">
            <div className="cr-visit-facts">
              <div><FaMapMarkerAlt /><p><strong>{business.address}<br />{business.cityState} {business.postalCode}</strong><small>Serving Norfolk and nearby communities.</small></p></div>
              <div><FaPhoneAlt /><p><a href={phoneHref} onClick={() => trackContactCta('phone_click', 'Contact Page Visit Phone')}><strong>{business.phoneDisplay}</strong></a></p></div>
              <div><FaClock /><p><strong>Hours</strong><small>Mon–Fri: 9:00 AM – 6:00 PM<br />Sat: 9:00 AM – 4:00 PM<br />Sun: Closed</small></p></div>
            </div>
            <div className="cr-before"><strong>Before You Visit</strong><ul><li><FaCheck />Feel free to call ahead to confirm vehicle availability.</li><li><FaCheck />Call with any questions about a vehicle or service.</li><li><FaCheck />Call ahead to confirm current vehicle availability.</li></ul><a className="cr-button cr-button-red" href={business.mapsUrl} target="_blank" rel="noreferrer" onClick={() => trackContactCta('directions_click', 'Contact Page Visit Directions')}>View Directions <FaArrowRight /></a></div>
          </div>
        </div>
        <iframe title="Map to Osborne Motors" className="cr-map" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={business.mapEmbedUrl} />
      </div>
    </section>

    <section id="faq" className="cr-faq-section">
      <div className="cr-container cr-faq-grid">
        <div><h2>Frequently Asked<br />Questions</h2><p>Quick answers to common questions about visiting us, our inventory, and how we can help.</p><p>Still have a question? Give us a call at <a href={phoneHref}>{business.phoneDisplay}</a>. We’re happy to help.</p></div>
        <div className="cr-faq-list">{questions.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
      </div>
    </section>
  </main>
)
