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
