import { SectionHeading } from '../components/SectionHeading'
import { Seo } from '../components/Seo'
import { business } from '../data/business'
import { trackContactCta } from '../utils/ctaTracking'

const terms = [
  ['Website information', 'Website content is provided for general information and may change. Contact Osborne Motors to confirm current details.'],
  ['Messages and inquiries', 'Submitting an online inquiry does not create an appointment, reservation, purchase, or service agreement. Osborne Motors will respond using the contact information provided.'],
  ['Website use', 'Do not misuse the website, submit false information, interfere with service operation, or attempt unauthorized access to any systems.'],
]

export const TermsPage = () => (
  <>
    <Seo title="Terms" description="Review the terms for using the Osborne Motors website." />
    <section className="section soft-band">
      <SectionHeading eyebrow="Terms" title="Website Terms" text="Important conditions for using the site and reviewing dealership information." />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="surface-card rounded-md p-6">
          <p className="eyebrow">Last updated: October 25, 2026</p>
          <div className="mt-6 grid gap-6">
            {terms.map(([title, text]) => (
              <div key={title} className="border-t border-[var(--color-border)] pt-5 first:border-t-0 first:pt-0">
                <h2 className="text-xl font-normal text-[var(--color-text)]">{title}</h2>
                <p className="mt-2 text-base font-normal leading-8 text-[var(--color-muted)]">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-md bg-[var(--color-section)] p-4 text-sm font-normal leading-7 text-[var(--color-muted)]">
            For current vehicle details or terms, contact {business.name} at{' '}
            <a className="font-normal text-[var(--color-link)]" href={business.phoneHref || business.contactHref} onClick={() => trackContactCta('phone_click', 'Terms Page Phone CTA')}>{business.phoneDisplay}</a>.
          </div>
        </div>
      </div>
    </section>
  </>
)
