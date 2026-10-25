export type VehicleDetailInfo = {
  label: string
  value: string
}

export type VehicleDetailSection = {
  title: string
  content: string
}

export type VehicleDetails = {
  info?: VehicleDetailInfo[]
  sections?: VehicleDetailSection[]
  rawDescription?: string
}

export type Vehicle = {
  id: string
  slug: string
  year: number
  make: string
  model: string
  trim: string
  price: number
  mileage: number
  bodyType: string
  transmission: string
  drivetrain: string
  engine: string
  exteriorColor: string
  interiorColor: string
  vin: string
  stockNumber: string
  status?: string
  shortDescription?: string
  description: string
  features: string[]
  specs?: Record<string, string>
  images: string[]
  imagesTotal?: number
  details?: VehicleDetails
  featured?: boolean
}
