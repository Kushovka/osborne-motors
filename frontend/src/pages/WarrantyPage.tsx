import { useState } from 'react'
import { FaArrowRight } from 'react-icons/fa'
import { Seo } from '../components/Seo'
import { HeaderMessageDialog } from '../components/HeaderMessageDialog'
import { trackContactCta } from '../utils/ctaTracking'

const coveragePrograms = [
  {
    title: '72 Hours / 250 Miles Guarantee',
    description: 'Our 72 Hours / 250 Miles Guarantee gives you short-term peace of mind after your purchase. If you experience a covered issue within the first 72 hours or 250 miles (whichever comes first), bring the vehicle back to us and we’ll work with you to make it right.',
    details: [
      'Valid for 72 hours or 250 miles from the time of purchase (whichever comes first)',
      'Applies to eligible vehicles',
      'Designed to address qualifying issues that arise shortly after purchase',
      'Coverage details are explained at the time of sale',
      'Ask our team for full terms and covered components',
    ],
  },
  {
    title: '90-Day / 3,000-Mile Limited Warranty',
    description: 'Our 90-Day / 3,000-Mile Limited Warranty provides additional protection beyond your initial purchase. This limited warranty covers eligible vehicles for 90 days or 3,000 miles (whichever comes first), helping you drive with confidence.',
    details: [
      'Valid for 90 days or 3,000 miles from the time of purchase (whichever comes first)',
      'Applies to eligible vehicles',
      'Provides coverage for qualifying issues during the warranty period',
      'Coverage details are explained at the time of sale',
      'Ask our team for full terms and covered components',
    ],
  },
]

const coverageSteps = [
  {
    title: 'Review Your Paperwork',
    description: 'At the time of purchase, we’ll review the details of your guarantee and warranty coverage and provide the written information.',
  },
  {
    title: 'Contact Us if You Have a Concern',
    description: 'If you experience an issue, contact us as soon as possible so we can discuss your situation and determine next steps.',
  },
  {
    title: 'Work With Our Team',
    description: 'We’ll work with you to review the vehicle, confirm coverage eligibility, and take the appropriate next steps based on your agreement.',
  },
]

export const WarrantyPage = () => {
  const [inquiryOpen, setInquiryOpen] = useState(false)

  return <>
  <main className="warranty-page warranty-ref">
  <Seo title="Warranty & Guarantee" description="Review Osborne Motors’ 72-hour / 250-mile guarantee and 90-day / 3,000-mile limited warranty for eligible vehicles." />

  <header className="warranty-ref__titlebar">
    <div className="warranty-ref__titlebar-inner">
      <h1>Warranty &amp; Guarantee</h1>
    </div>
  </header>

  <div className="warranty-ref__content">
    <section className="warranty-ref__intro" aria-labelledby="warranty-intro-title">
      <div>
        <h2 id="warranty-intro-title">Two Protections. One Commitment.</h2>
        <p>At Osborne Motors, we want you to feel confident in your purchase long after you drive it home. That’s why we offer both a 72 Hours / 250 Miles Guarantee and a 90-Day / 3,000-Mile Limited Warranty on eligible vehicles. These programs are designed to give you added peace of mind and support after your purchase.</p>
      </div>
      <img src="/images/osborne-dealership-exterior.webp" alt="Vehicles parked outside the Osborne Motors dealership" />
    </section>

    <section className="warranty-ref__programs" aria-label="Coverage programs">
      {coveragePrograms.map((program) => <article className="warranty-ref__program" key={program.title}>
        <h2>{program.title}</h2>
        <p>{program.description}</p>
        <ul>
          {program.details.map((detail) => <li key={detail}>{detail}</li>)}
        </ul>
      </article>)}
    </section>

    <section className="warranty-ref__steps" aria-labelledby="coverage-steps-title">
      <h2 id="coverage-steps-title">How Coverage Works</h2>
      <p className="warranty-ref__lead">Our goal is to make the process simple and straightforward. Here’s how it works:</p>
      <ol>
        {coverageSteps.map((step, index) => <li key={step.title}>
          <span aria-hidden="true">{index + 1}</span>
          <div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        </li>)}
      </ol>
    </section>

    <section className="warranty-ref__contact" aria-labelledby="warranty-contact-title">
      <h2 id="warranty-contact-title">Have Questions About Warranty or Guarantee Coverage?</h2>
      <div>
        <p>Send us a message and our team will be happy to help with warranty or guarantee details.</p>
        <button type="button" onClick={() => { trackContactCta('message_click', 'Warranty Page Message CTA'); setInquiryOpen(true) }}>Ask About Coverage <FaArrowRight aria-hidden="true" /></button>
      </div>
    </section>
  </div>
</main>
  <HeaderMessageDialog open={inquiryOpen} onClose={() => setInquiryOpen(false)} titleId="warranty-inquiry-dialog-title" />
  </>
}
