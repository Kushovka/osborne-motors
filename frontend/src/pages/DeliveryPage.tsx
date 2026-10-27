import { useState } from 'react'
import { FaPhoneAlt, FaArrowRight } from 'react-icons/fa'
import { Seo } from '../components/Seo'
import { HeaderMessageDialog } from '../components/HeaderMessageDialog'
import { business } from '../data/business'
import { trackContactCta } from '../utils/ctaTracking'

const deliveryOptions = [
  {
    title: 'Open Transport',
    description: 'A common, cost-effective choice for most vehicles. Your vehicle travels on an open carrier alongside other vehicles.',
    details: ['Widely available for local and long-distance trips', 'A practical option for everyday vehicles'],
    image: '/images/delivery-hero-transport.webp',
    alt: 'Pickup secured on an open vehicle transport carrier',
  },
  {
    title: 'Enclosed Transport',
    description: 'Enclosed transport adds protection from weather and road conditions during the trip.',
    details: ['Often chosen for specialty or high-value vehicles', 'Availability and pricing depend on the route'],
    image: '/images/delivery-enclosed-transport.webp',
    alt: 'Vehicle loaded inside an enclosed transport trailer',
  },
  {
    title: 'Long-Distance Delivery',
    description: 'We can help coordinate delivery across the U.S. based on your destination and timing.',
    details: ['Share your ZIP code for a tailored estimate', 'We’ll confirm an expected timeframe with your quote'],
    image: '/images/delivery-long-distance.webp',
    alt: 'Pickup being transported on a flatbed through the Great Plains',
  },
]

const deliverySteps = [
  {
    title: 'Tell Us What You Need',
    description: 'Share the vehicle you’re interested in, your delivery ZIP code, and any timing preferences.',
  },
  {
    title: 'Review Your Options',
    description: 'Our team will check the route and available transport options, then provide a quote and estimated timeframe.',
  },
  {
    title: 'Coordinate Delivery',
    description: 'Once you choose an option, we’ll work with you on the next steps and delivery arrangements.',
  },
]

export const DeliveryPage = () => {
  const [inquiryOpen, setInquiryOpen] = useState(false)

  const openDeliveryInquiry = (source: string) => {
    trackContactCta('contact_form_click', source)
    setInquiryOpen(true)
  }

  return <>
    <main className="delivery-page delivery-reference">
      <Seo title="Vehicle Delivery" description="Explore open, enclosed, and long-distance vehicle delivery options from Osborne Motors in Norfolk, Nebraska." />

      <header className="delivery-ref__titlebar">
        <div className="delivery-ref__titlebar-inner">
          <h1>Vehicle Delivery</h1>
        </div>
      </header>

      <div className="delivery-ref__content">
        <section className="delivery-ref__intro" aria-labelledby="delivery-title">
          <div>
            <h2 id="delivery-title">Simple and Reliable Delivery Options</h2>
            <p>We can help arrange delivery for your vehicle, whether you’re local or out of state. Our team will work with you to find the best option based on your location, timeline and the vehicle you’re interested in.</p>
            <button type="button" onClick={() => openDeliveryInquiry('Delivery Quote CTA')}>Get a Delivery Quote <FaArrowRight aria-hidden="true" /></button>
          </div>
          <img src="/images/osborne-visit-dealership.webp" alt="Vehicles outside the Osborne Motors dealership" />
        </section>
      </div>

      <section className="delivery-choice" aria-labelledby="delivery-choice-title">
        <div className="delivery-ref-wrap">
          <div className="delivery-choice-heading">
            <p className="delivery-ref-kicker">Choose the right route</p>
            <h2 id="delivery-choice-title">A delivery option for every kind of trip.</h2>
            <p>We’ll help you compare transport types and find an arrangement that fits the vehicle, destination, and your schedule.</p>
          </div>
          <div className="delivery-choice-list">
            {deliveryOptions.map((option, index) => <article className="delivery-choice-item" key={option.title}>
              <div className="delivery-choice-image"><img src={option.image} alt={option.alt} loading="lazy" /><span>0{index + 1}</span></div>
              <div className="delivery-choice-copy">
                <h3>{option.title}</h3>
                <p>{option.description}</p>
                <ul>{option.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
              </div>
            </article>)}
          </div>
        </div>
      </section>

      <section className="delivery-route" aria-labelledby="delivery-route-title">
        <div className="delivery-ref-wrap">
          <p className="delivery-ref-kicker">Clear from the start</p>
          <h2 id="delivery-route-title">Here’s how we get it there.</h2>
          <div className="delivery-route-steps">
            {deliverySteps.map((step, index) => <article key={step.title}>
              <span>0{index + 1}</span>
              <div><h3>{step.title}</h3><p>{step.description}</p></div>
            </article>)}
          </div>
        </div>
      </section>

      <section className="delivery-contact" aria-labelledby="delivery-contact-title">
        <div className="delivery-ref-wrap delivery-contact-inner">
          <div>
            <p className="delivery-ref-kicker">Let’s plan your delivery</p>
            <h2 id="delivery-contact-title">Have a vehicle in mind?</h2>
            <p>Send us the vehicle and destination ZIP code. We’ll follow up with available options, a quote, and an estimated timeframe.</p>
          </div>
          <div className="delivery-contact-actions">
            <a href={business.phoneHref} onClick={() => trackContactCta('phone_click', 'Delivery Page Phone CTA')}><FaPhoneAlt aria-hidden="true" />{business.phoneDisplay}</a>
            <button type="button" onClick={() => openDeliveryInquiry('Delivery Quote CTA')}>Get a Delivery Quote <FaArrowRight aria-hidden="true" /></button>
          </div>
        </div>
      </section>
    </main>
    <HeaderMessageDialog
      open={inquiryOpen}
      onClose={() => setInquiryOpen(false)}
      titleId="delivery-inquiry-dialog-title"
    />
  </>
}
