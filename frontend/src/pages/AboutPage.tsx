import { useState } from 'react'
import { FaArrowRight, FaPhoneAlt } from 'react-icons/fa'
import { Link } from 'react-router'
import { Seo } from '../components/Seo'
import { HeaderMessageDialog } from '../components/HeaderMessageDialog'
import { business } from '../data/business'
import { trackContactCta } from '../utils/ctaTracking'

const aboutValues = [
  {
    title: 'Quality Vehicles',
    description: 'We carefully inspect our vehicles to make sure they’re ready for the road. You’ll find a variety of cars, trucks, and SUVs to fit your needs.',
  },
  {
    title: 'Local and Reliable',
    description: 'We’re proud to be part of the Norfolk community and work hard to build long-term relationships with our customers.',
  },
  {
    title: 'Here to Help',
    description: 'Our team is always ready to answer your questions, provide vehicle information, and help you find the right option for your budget and lifestyle.',
  },
]

export const AboutPage = () => {
  const [inquiryOpen, setInquiryOpen] = useState(false)

  return <>
  <main className="about-page about-ref">
  <Seo title="About Osborne Motors" description="Learn about Osborne Motors in Norfolk, Nebraska, and our approach to helping customers find a vehicle." />

  <header className="about-ref__titlebar">
    <div className="about-ref__titlebar-inner">
      <h1>About Osborne Motors</h1>
    </div>
  </header>

  <div className="about-ref__content">
    <section className="about-ref__intro" aria-labelledby="about-intro-title">
      <div>
        <h2 id="about-intro-title">A Local Dealership You Can Count On</h2>
        <p>At Osborne Motors, we’re committed to providing quality vehicles and honest, straightforward service to our customers in Norfolk, NE and the surrounding communities.</p>
      </div>
      <img src="/images/osborne-dealership-exterior.webp" alt="Vehicles parked outside the Osborne Motors dealership" fetchPriority="high" />
    </section>

    <section className="about-ref__story" aria-labelledby="about-story-title">
      <div>
        <h2 id="about-story-title">Serving Our Community</h2>
        <p>Osborne Motors is a locally owned and operated dealership in Norfolk, Nebraska. We take pride in offering a selection of reliable used vehicles and a no-pressure buying experience. Our goal is simple: help you find the right vehicle at a fair price and provide service you can trust.</p>
      </div>
      <Link to="/inventory">View Our Inventory <FaArrowRight aria-hidden="true" /></Link>
    </section>

    <section className="about-ref__approach" aria-labelledby="about-approach-title">
      <h2 id="about-approach-title">Honest, Straightforward, Customer-Focused</h2>
      <p>We believe in keeping things simple. No high-pressure sales tactics or hidden fees. Just honest information and quality vehicles. Whether you’re buying your first truck, upgrading your family vehicle, or adding to your business fleet, we’re here to help you through the process.</p>
    </section>

    <section className="about-ref__values" aria-label="What you can expect at Osborne Motors">
      {aboutValues.map((value) => <article key={value.title}>
        <h2>{value.title}</h2>
        <p>{value.description}</p>
      </article>)}
    </section>

    <section className="about-ref__contact" aria-labelledby="about-contact-title">
      <h2 id="about-contact-title">Get in Touch</h2>
      <div>
        <p>We’re always happy to talk. Give us a call, stop by our dealership in Norfolk, or send us a message. We look forward to helping you.</p>
        <button type="button" onClick={() => { trackContactCta('message_click', 'About Page Phone CTA Form Button'); setInquiryOpen(true) }}><FaPhoneAlt aria-hidden="true" />{business.phoneDisplay}</button>
        <button type="button" onClick={() => { trackContactCta('message_click', 'About Page Message CTA'); setInquiryOpen(true) }}>Contact Us <FaArrowRight aria-hidden="true" /></button>
      </div>
    </section>
  </div>
</main>
  <HeaderMessageDialog open={inquiryOpen} onClose={() => setInquiryOpen(false)} titleId="about-inquiry-dialog-title" />
  </>
}
