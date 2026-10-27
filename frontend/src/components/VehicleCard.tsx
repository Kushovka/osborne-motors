import { useState } from 'react'
import { Link } from 'react-router'
import { FaCogs, FaPalette, FaTachometerAlt } from 'react-icons/fa'
import { VehicleQuoteDialog } from './VehicleQuoteDialog'
import { trackContactCta } from '../utils/ctaTracking'
import type { Vehicle } from '../types/vehicle'
import { formatNumber, formatVehiclePrice, formatVehicleTitle } from '../utils/format'

export const VehicleCard = ({ vehicle }: { vehicle: Vehicle }) => {
  const [quoteOpen, setQuoteOpen] = useState(false)
  const title = formatVehicleTitle(vehicle)
  const specs = [
    { Icon: FaTachometerAlt, value: vehicle.mileage > 0 ? `${formatNumber(vehicle.mileage)} miles` : 'Mileage not listed' },
    { Icon: FaCogs, value: vehicle.engine },
    { Icon: FaCogs, value: vehicle.transmission },
    { Icon: FaPalette, value: vehicle.exteriorColor },
  ].filter(({ value }) => value.trim() && !/^not listed$/i.test(value.trim()))

  return <>
    <article className="featured-stock-card">
      <Link to={`/inventory/${vehicle.slug}`} className="featured-stock-card__photo" aria-label={`View ${title}`}>
        <img src={vehicle.images[0]} alt={title} loading="lazy" />
      </Link>
      <div className="featured-stock-card__content">
        <div className="featured-stock-card__eyebrow">
          <span className="featured-stock-card__badge">{vehicle.status === 'Placeholder' ? 'Placeholder' : 'Used'}</span>
          {vehicle.stockNumber ? <span className="featured-stock-card__stock">{vehicle.stockNumber}</span> : null}
        </div>
        <h3>{title}</h3>
        <ul className="featured-stock-card__specs">
          {specs.map(({ Icon, value }, index) => <li key={`${index}-${value}`}><Icon aria-hidden="true" /><span>{value}</span></li>)}
        </ul>
        <div className="featured-stock-card__price">
          <strong>{formatVehiclePrice(vehicle)}</strong>
        </div>
        <div className="featured-stock-card__actions">
          <Link to={`/inventory/${vehicle.slug}`}>View Details</Link>
          <button type="button" onClick={() => { trackContactCta('contact_form_click', 'Inventory Vehicle Card Get Quote'); setQuoteOpen(true) }}>Get Quote</button>
        </div>
      </div>
    </article>
    {quoteOpen ? <VehicleQuoteDialog open={quoteOpen} onClose={() => setQuoteOpen(false)} vehicleId={vehicle.id} vehicleContentId={vehicle.stockNumber || vehicle.id} vehicleName={title} vehicleValue={vehicle.price} /> : null}
  </>
}
