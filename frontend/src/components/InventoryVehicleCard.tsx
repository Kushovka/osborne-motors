import { useState } from 'react'
import { Link } from 'react-router'
import { FaArrowRight } from 'react-icons/fa'
import type { Vehicle } from '../types/vehicle'
import { formatNumber, formatPrice } from '../utils/format'

const simpleDrivetrain = (value: string) => {
  if (/4wd|four[-\s]?wheel/i.test(value)) return '4WD'
  if (/awd|all[-\s]?wheel/i.test(value)) return 'AWD'
  if (/rwd|rear[-\s]?wheel/i.test(value)) return 'RWD'
  if (/fwd|front[-\s]?wheel/i.test(value)) return 'FWD'
  return value
}

const simpleTransmission = (value: string) => /dual[-\s]?clutch|\bdct\b/i.test(value) ? 'DCT' : value
export const InventoryVehicleCard = ({ vehicle }: { vehicle: Vehicle }) => {
  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''}`
  const drivetrain = simpleDrivetrain(vehicle.drivetrain)
  const transmission = simpleTransmission(vehicle.transmission)
  const [photoAspectRatio, setPhotoAspectRatio] = useState(1.5)
  const photoUrl = vehicle.images[0] || '/images/vehicle-photo-coming-soon-card.webp'
  const photoObjectPosition = photoAspectRatio < 0.9 ? 'center 55%' : photoAspectRatio < 1.1 ? 'center 40%' : 'center 72%'

  return <article className="inventory-vehicle-card">
    <div className="inventory-vehicle-card__photo">
      <Link to={`/inventory/${vehicle.slug}`} className="inventory-vehicle-card__photo-link" aria-label={`View ${title}`}>
        <img className="inventory-vehicle-card__photo-backdrop" src={photoUrl} alt="" aria-hidden="true" loading="lazy" />
        <img className="inventory-vehicle-card__photo-main" src={photoUrl} alt={title} loading="lazy" style={{ objectPosition: photoObjectPosition }} onLoad={(event) => {
          const { naturalWidth, naturalHeight } = event.currentTarget
          if (naturalWidth && naturalHeight) setPhotoAspectRatio(naturalWidth / naturalHeight)
        }} />
      </Link>
      {vehicle.stockNumber.trim() ? <span className="inventory-vehicle-card__stock" aria-label={`Stock number ${vehicle.stockNumber}`}>{vehicle.stockNumber}</span> : null}
    </div>
    <div className="inventory-vehicle-card__body">
      <h3><Link to={`/inventory/${vehicle.slug}`}>{title}</Link></h3>
      <p className="inventory-vehicle-card__price">{formatPrice(vehicle.price)}</p>
      <p className="inventory-vehicle-card__specs">
        <span>{vehicle.mileage > 0 ? `${formatNumber(vehicle.mileage)} miles` : 'Mileage not listed'}</span>
        {drivetrain ? <span>{drivetrain}</span> : null}
        {transmission ? <span className="inventory-vehicle-card__specs-transmission">{transmission}</span> : null}
      </p>
      <Link className="inventory-vehicle-card__details" to={`/inventory/${vehicle.slug}`}>
        <span>View Vehicle Details</span><FaArrowRight aria-hidden="true" />
      </Link>
    </div>
  </article>
}
