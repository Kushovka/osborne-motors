import { FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa'
import { Seo } from '../components/Seo'
import { business } from '../data/business'

export const GuaranteePage = () => <main className="guarantee-page">
  <Seo title="Policies and Terms" description="Contact Osborne Motors for current policies and terms." />
  <section className="guarantee-hero" aria-labelledby="guarantee-title">
    <div className="guarantee-hero-copy"><h1 id="guarantee-title">Policies and Terms</h1><p>For current purchase, service, or vehicle-specific terms, please contact Osborne Motors directly.</p><div className="guarantee-actions"><a className="guarantee-button guarantee-button--red" href={business.phoneHref}><FaPhoneAlt /> Call {business.phoneDisplay}</a></div></div>
    <img src="/images/vehicle-photo-coming-soon.webp" alt="Automotive service" />
  </section>
  <section className="guarantee-commitment"><div className="guarantee-commitment-inner"><div><h2>Questions? Get in Touch</h2><p>We can provide the details that apply to your vehicle or service.</p><p><FaMapMarkerAlt /> {business.address}, {business.cityState} {business.postalCode}</p></div></div></section>
</main>
