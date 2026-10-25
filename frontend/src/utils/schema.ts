import { business } from '../data/business'

export const autoRepairSchema = {
  '@context': 'https://schema.org',
  '@type': 'AutoRepair',
  name: business.name,
  telephone: business.phone,
  address: {
    '@type': 'PostalAddress',
    streetAddress: business.address,
    addressLocality: 'Norfolk',
    addressRegion: 'NE',
    postalCode: business.postalCode,
    addressCountry: 'US',
  },
  url: business.website || business.mapsUrl,
  image: '/images/vehicle-photo-coming-soon.webp',
  openingHours: ['Mo-Fr 09:00-18:00', 'Sa 09:00-16:00'],
}
