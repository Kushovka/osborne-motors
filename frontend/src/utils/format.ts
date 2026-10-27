export const formatPrice = (price: number) => {
  if (!price || price <= 0) {
    return 'Call for Price'
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
}

export const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US').format(value)

export const formatVehicleTitle = (vehicle: { year: number; make: string; model: string; trim: string; status?: string }) =>
  vehicle.status === 'Placeholder'
    ? `${vehicle.make} ${vehicle.model}`
    : `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''}`

export const formatVehiclePrice = (vehicle: { price: number; status?: string }) =>
  vehicle.status === 'Placeholder' ? 'Price coming soon' : formatPrice(vehicle.price)
