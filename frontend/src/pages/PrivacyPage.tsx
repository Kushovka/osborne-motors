import { SectionHeading } from '../components/SectionHeading'
import { Seo } from '../components/Seo'
import { business } from '../data/business'

const sections = [
  ['Information we collect', 'We may collect contact details, vehicle interests, messages you send, and basic website analytics such as pages visited, browser type, device data, and referral source.'],
  ['How we use information', 'We use this information to respond to inquiries, discuss vehicle availability, improve the website, and measure advertising performance.'],
  ['Sharing', 'We may share information with service providers, advertising and analytics platforms, or legal and operational partners when needed to respond to your request or operate the business. We do not sell personal information as a standalone customer list.'],
  ['Cookies and tracking', 'The website may use cookies, Meta Pixel, server-side conversion tracking, and similar tools to understand site usage and advertising results. You can decline optional cookies in the site banner or adjust browser settings.'],
  ['Your choices', 'You can ask us to update, correct, or delete contact information where legally possible. You can also opt out of marketing follow-up by contacting the dealership.'],
  ['Data security', 'We use reasonable safeguards, but no website or transmission method is completely secure. Please avoid sending sensitive personal information through open message fields.'],
]

export const PrivacyPage = () => (
  <>
    <Seo title="Privacy Policy" description="Read Osborne Motors privacy policy for website leads, cookies, analytics, and dealership communication." />
    <section className="section soft-band">
      <SectionHeading eyebrow="Privacy" title="Privacy Policy" text="How Osborne Motors handles website inquiries, cookies, and customer communication." />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="surface-card rounded-md p-6">
          <p className="eyebrow">Last updated: October 25, 2026</p>
          <div className="mt-6 grid gap-6">
            {sections.map(([title, text]) => (
              <div key={title} className="border-t border-[var(--color-border)] pt-5 first:border-t-0 first:pt-0">
                <h2 className="text-xl font-normal text-[var(--color-text)]">{title}</h2>
                <p className="mt-2 text-base font-normal leading-8 text-[var(--color-muted)]">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-md bg-[var(--color-section)] p-4 text-sm font-normal leading-7 text-[var(--color-muted)]">
            Questions about this policy can be sent through{' '}
            <a className="font-normal text-[var(--color-link)]" href={business.contactHref} target="_blank" rel="noreferrer">{business.name} on Google Maps</a>.
          </div>
        </div>
      </div>
    </section>
  </>
)
