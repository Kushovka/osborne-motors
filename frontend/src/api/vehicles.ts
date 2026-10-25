import { apiClient } from './client'
import type { Vehicle, VehicleDetails } from '../types/vehicle'

type ApiVehicle = {
  id: string
  slug: string
  title: string
  make: string
  model: string
  trim: string | null
  year: number
  status: string
  stock_number: string | null
  vin: string | null
  price: number
  mileage: number
  body_type: string
  transmission: string | null
  drivetrain: string | null
  engine: string | null
  exterior_color: string | null
  interior_color: string | null
  short_description: string
  description?: string
  images: string[]
  images_total: number
  features: string[]
  specs: Record<string, string>
  details?: {
    info?: { label: string; value: string }[]
    sections?: { title: string; content: string }[]
    raw_description?: string
  }
  featured: boolean
}

export type VehicleListParams = {
  page?: number
  pageSize?: number
  make?: string
  model?: string
  q?: string
  yearFrom?: number
  yearTo?: number
  bodyType?: string
  transmission?: string
  drivetrain?: string
  color?: string
  featured?: boolean
  priceMin?: number
  priceMax?: number
  mileageMin?: number
  mileageMax?: number
  sort?: 'year_desc' | 'price_asc' | 'price_desc' | 'mileage_asc'
}

export type VehicleFilters = {
  makes: string[]
  models: string[]
  years: number[]
  bodyTypes: string[]
  transmissions: string[]
  drivetrains: string[]
  colors: string[]
  statuses: string[]
  prices: number[]
  priceMin: number | null
  priceMax: number | null
  mileageMin: number | null
  mileageMax: number | null
}

type ApiVehicleListResponse = {
  items: ApiVehicle[]
  total: number
  page: number
  page_size: number
}

type ApiVehicleFilters = {
  makes: string[]
  models: string[]
  years: number[]
  body_types: string[]
  transmissions: string[]
  drivetrains: string[]
  colors: string[]
  statuses: string[]
  prices: number[]
  price_min: number | null
  price_max: number | null
  mileage_min: number | null
  mileage_max: number | null
}

type ApiVehicleImagesResponse = {
  items: string[]
  total: number
  offset: number
  limit: number
  has_more: boolean
}

const apiOrigin = (() => {
  try {
    return new URL(apiClient.defaults.baseURL ?? '', window.location.origin).origin
  } catch {
    return window.location.origin
  }
})()

const placeholderVehicleImage = '/images/vehicle-photo-coming-soon-card.webp'
const placeholderGalleryImages = Array.from({ length: 5 }, () => placeholderVehicleImage)

const resolveImageUrl = (image: string) => {
  if (image.startsWith('/media/')) {
    return `${apiOrigin}${image}`
  }

  return image
}

const toVehicleDetails = (details?: ApiVehicle['details']): VehicleDetails => ({
  info: details?.info ?? [],
  sections: details?.sections ?? [],
  rawDescription: details?.raw_description,
})

const toVehicle = (vehicle: ApiVehicle): Vehicle => {
  const sourceImages = vehicle.images.length > 0 ? vehicle.images : placeholderGalleryImages
  const images = sourceImages.map(resolveImageUrl)

  return {
    id: vehicle.id,
    slug: vehicle.slug,
    year: vehicle.year,
    make: vehicle.make,
    model: vehicle.model,
    trim: vehicle.trim ?? '',
    price: vehicle.price,
    mileage: vehicle.mileage,
    bodyType: vehicle.body_type,
    transmission: vehicle.transmission ?? 'Automatic',
    drivetrain: vehicle.drivetrain ?? 'FWD',
    engine: vehicle.engine ?? 'Gasoline',
    exteriorColor: vehicle.exterior_color ?? 'Not listed',
    interiorColor: vehicle.interior_color ?? 'Not listed',
    vin: vehicle.vin ?? 'Not listed',
    stockNumber: vehicle.stock_number ?? '',
    status: vehicle.status,
    shortDescription: vehicle.short_description,
    description: vehicle.description ?? vehicle.short_description,
    features: vehicle.features,
    specs: vehicle.specs ?? {},
    images,
    imagesTotal: vehicle.images_total || images.length,
    details: toVehicleDetails(vehicle.details),
    featured: vehicle.featured,
  }
}

const toListParams = (params: VehicleListParams) => ({
  page: params.page,
  page_size: params.pageSize,
  make: params.make || undefined,
  model: params.model || undefined,
  q: params.q?.trim().length && params.q.trim().length >= 2 ? params.q.trim() : undefined,
  year_from: params.yearFrom,
  year_to: params.yearTo,
  body_type: params.bodyType || undefined,
  transmission: params.transmission || undefined,
  drivetrain: params.drivetrain || undefined,
  color: params.color || undefined,
  featured: params.featured,
  price_min: params.priceMin,
  price_max: params.priceMax,
  mileage_min: params.mileageMin,
  mileage_max: params.mileageMax,
  sort: params.sort,
})

export const listVehicles = async (params: VehicleListParams = {}) => {
  const response = await apiClient.get<ApiVehicleListResponse>('/vehicles', {
    params: toListParams(params),
  })

  return {
    items: response.data.items.map(toVehicle),
    total: response.data.total,
    page: response.data.page,
    pageSize: response.data.page_size,
  }
}

export const getVehicle = async (slug: string) => {
  const response = await apiClient.get<ApiVehicle>(`/vehicles/${slug}`, {
    params: { image_limit: 70 },
  })
  return toVehicle(response.data)
}

export const listVehicleImages = async (slug: string, offset = 0, limit = 8) => {
  const response = await apiClient.get<ApiVehicleImagesResponse>(`/vehicles/${slug}/images`, {
    params: { offset, limit },
  })

  return {
    items: response.data.items.map(resolveImageUrl),
    total: response.data.total,
    offset: response.data.offset,
    limit: response.data.limit,
    hasMore: response.data.has_more,
  }
}

export const getVehicleFilters = async (make?: string): Promise<VehicleFilters> => {
  const response = await apiClient.get<ApiVehicleFilters>('/vehicles/filters', {
    params: { make: make || undefined },
  })

  return {
    makes: response.data.makes,
    models: response.data.models,
    years: response.data.years,
    bodyTypes: response.data.body_types,
    transmissions: response.data.transmissions.filter(Boolean),
    drivetrains: response.data.drivetrains.filter(Boolean),
    colors: response.data.colors.filter(Boolean),
    statuses: response.data.statuses,
    prices: response.data.prices ?? [],
    priceMin: response.data.price_min,
    priceMax: response.data.price_max,
    mileageMin: response.data.mileage_min,
    mileageMax: response.data.mileage_max,
  }
}
