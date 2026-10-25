import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useSearchParams } from 'react-router'
import { FaChevronDown, FaChevronLeft, FaChevronRight, FaSearch, FaSlidersH, FaTimes } from 'react-icons/fa'
import { getVehicleFilters, listVehicles } from '../api/vehicles'
import { Seo } from '../components/Seo'
import { InventoryVehicleCard } from '../components/InventoryVehicleCard'
import type { Vehicle } from '../types/vehicle'

type SortKey = 'price-low' | 'price-high' | 'year' | 'mileage'
const PAGE_SIZE = 6
const queryNumber = (value: string | null) => {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined
}

const priceRanges = [
  { value: 'under', label: 'Under $20,000', min: undefined, max: 19999 },
  { value: '20-40', label: '$20,000 – $40,000', min: 20000, max: 40000 },
  { value: '40-60', label: '$40,000 – $60,000', min: 40001, max: 60000 },
  { value: 'over', label: 'Over $60,000', min: 60001, max: undefined },
]

const InventoryCardSkeleton = () => <div className="inventory-vehicle-card inventory-vehicle-card--skeleton" aria-hidden="true">
  <div className="inventory-vehicle-card__photo" />
  <div className="inventory-vehicle-card__body">
    <span className="inventory-skeleton-line inventory-skeleton-line--title" />
    <span className="inventory-skeleton-line inventory-skeleton-line--price" />
    <span className="inventory-skeleton-line inventory-skeleton-line--specs" />
    <span className="inventory-skeleton-line inventory-skeleton-line--details" />
  </div>
</div>

export const InventoryPage = () => {
  const [searchParams] = useSearchParams()
  const resultsRef = useRef<HTMLDivElement | null>(null)
  const [make, setMake] = useState(() => searchParams.get('make') ?? '')
  const [model, setModel] = useState(() => searchParams.get('model') ?? '')
  const [yearFrom, setYearFrom] = useState<number | undefined>(() => queryNumber(searchParams.get('yearFrom')))
  const [priceMin, setPriceMin] = useState<number | undefined>(() => queryNumber(searchParams.get('priceMin')))
  const [priceMax, setPriceMax] = useState<number | undefined>(() => queryNumber(searchParams.get('priceMax')))
  const [mileageMin, setMileageMin] = useState<number | undefined>()
  const [mileageMax, setMileageMax] = useState<number | undefined>()
  const [bodyType, setBodyType] = useState(() => searchParams.get('bodyType') ?? '')
  const [color, setColor] = useState('')
  const [transmission, setTransmission] = useState('')
  const [drivetrain, setDrivetrain] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('year')
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<Vehicle[]>([])
  const [total, setTotal] = useState(0)
  const [filterCounts, setFilterCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [inventoryError, setInventoryError] = useState(false)
  const [makes, setMakes] = useState<string[]>([])
  const [models, setModels] = useState<string[]>([])
  const [years, setYears] = useState<number[]>([])
  const [bodyTypes, setBodyTypes] = useState<string[]>([])
  const [transmissions, setTransmissions] = useState<string[]>([])
  const [drivetrains, setDrivetrains] = useState<string[]>([])
  const [colors, setColors] = useState<string[]>([])
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    setSearch(searchParams.get('q') ?? '')
    setBodyType(searchParams.get('bodyType') ?? '')
    setPage(1)
  }, [searchParams])

  useEffect(() => {
    let cancelled = false
    getVehicleFilters().then((filters) => {
      if (!cancelled) {
        setMakes(filters.makes)
        setModels(filters.models)
        setYears(filters.years)
        setBodyTypes(filters.bodyTypes)
        setTransmissions(filters.transmissions)
        setDrivetrains(filters.drivetrains)
        setColors(filters.colors)
      }
    }).catch(() => undefined)
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    const loadCounts = async () => {
      const response = await listVehicles({ page: 1, pageSize: 50 })
      if (cancelled) return
      const counts: Record<string, number> = {}
      const add = (key: string, matches: boolean) => { if (matches) counts[key] = (counts[key] ?? 0) + 1 }
      const ranges = [
        { key: 'price:under', matches: (value: number) => value > 0 && value < 20000 },
        { key: 'price:20-40', matches: (value: number) => value >= 20000 && value <= 40000 },
        { key: 'price:40-60', matches: (value: number) => value > 40000 && value <= 60000 },
        { key: 'price:over', matches: (value: number) => value > 60000 },
        { key: 'miles:under', matches: (value: number) => value > 0 && value < 25000 },
        { key: 'miles:25-50', matches: (value: number) => value >= 25000 && value <= 50000 },
        { key: 'miles:50-100', matches: (value: number) => value > 50000 && value <= 100000 },
        { key: 'miles:over', matches: (value: number) => value > 100000 },
      ]
      response.items.forEach((vehicle) => {
        add(`body:${vehicle.bodyType}`, true)
        add(`make:${vehicle.make}`, true)
        add(`year:${vehicle.year}`, true)
        add(`drive:${vehicle.drivetrain}`, true)
        add(`transmission:${vehicle.transmission}`, true)
        add('color:White', /white/i.test(vehicle.exteriorColor))
        add('color:Black', /black/i.test(vehicle.exteriorColor))
        add('color:Silver', /silver/i.test(vehicle.exteriorColor))
        add('color:Gray', /gr[ae]y/i.test(vehicle.exteriorColor))
        add('color:Blue', /blue/i.test(vehicle.exteriorColor))
        add('color:Red', /red/i.test(vehicle.exteriorColor))
        ranges.forEach(({ key, matches }) => add(key, matches(key.startsWith('price:') ? vehicle.price : vehicle.mileage)))
      })
      setFilterCounts(counts)
    }
    loadCounts().catch(() => undefined)
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    getVehicleFilters(make).then((filters) => { if (!cancelled) setModels(filters.models) }).catch(() => { if (!cancelled) setModels([]) })
    return () => { cancelled = true }
  }, [make])

  useEffect(() => {
    let cancelled = false
    Promise.resolve().then(() => { if (!cancelled) setLoading(true) })
    listVehicles({ make, model, q: search, yearFrom, bodyType, transmission, drivetrain, color, priceMin, priceMax, mileageMin, mileageMax, page, pageSize: PAGE_SIZE, sort: sort === 'price-low' ? 'price_asc' : sort === 'price-high' ? 'price_desc' : sort === 'mileage' ? 'mileage_asc' : 'year_desc' })
      .then((response) => { if (!cancelled) { setItems(response.items); setTotal(response.total); setInventoryError(false) } })
      .catch(() => { if (!cancelled) { setItems([]); setTotal(0); setInventoryError(true) } })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [bodyType, color, drivetrain, make, mileageMax, mileageMin, model, page, priceMax, priceMin, search, sort, transmission, yearFrom])

  const resetFilters = () => {
    setPage(1)
    setMake('')
    setModel('')
    setSearch('')
    setYearFrom(undefined)
    setPriceMin(undefined)
    setPriceMax(undefined)
    setMileageMin(undefined)
    setMileageMax(undefined)
    setBodyType('')
    setColor('')
    setTransmission('')
    setDrivetrain('')
  }
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)
  const goToPage = (nextPage: number) => {
    setPage(Math.min(totalPages, Math.max(1, nextPage)))
    window.setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
  }
  const filterChange = <T,>(setter: (value: T) => void, value: T) => { setPage(1); setter(value) }
  const selectedPriceRange = priceRanges.find(({ min, max }) => min === priceMin && max === priceMax)?.value ?? ''
  const activeAdvancedFilterCount = [yearFrom !== undefined, mileageMin !== undefined || mileageMax !== undefined, Boolean(drivetrain), Boolean(transmission), Boolean(color)].filter(Boolean).length
  const orderedBodyTypes = [...bodyTypes].sort((a, b) => {
    const order = ['truck', 'suv', 'sedan', 'coupe', 'convertible']
    return order.indexOf(a.toLowerCase()) - order.indexOf(b.toLowerCase())
  })

  const filterSection = (title: string, content: ReactNode) => <details key={title} className="inventory-filter-group">
    <summary><span>{title}</span><FaChevronDown aria-hidden="true" /></summary>
    <div className="inventory-filter-group__options">{content}</div>
  </details>
  const checkOption = (label: string, checked: boolean, onChange: () => void, count?: number, colorDot?: string) => <label key={label} className="inventory-filter-option">
    <input type="checkbox" checked={checked} onChange={onChange} />
    {colorDot ? <span aria-hidden="true" className="inventory-filter-option__color" style={{ backgroundColor: colorDot }} /> : null}
    <span className="inventory-filter-option__label">{label}</span>
    {count !== undefined ? <span className="inventory-filter-option__count">({count})</span> : null}
  </label>

  const advancedFilters = <div id="inventory-filters" className="inventory-advanced-filters">
    <div className="inventory-advanced-filters__heading">
      <h2>More ways to narrow your search</h2>
      <button id="inventory-clear-filters" type="button" onClick={resetFilters}>Clear all filters</button>
    </div>
    <div className="inventory-advanced-filters__grid">
      {make ? <label className="inventory-model-filter">Model
        <select value={model} onChange={(event) => filterChange(setModel, event.target.value)}>
          <option value="">All models</option>{models.map((item) => <option key={item}>{item}</option>)}
        </select><FaChevronDown aria-hidden="true" />
      </label> : null}
      {filterSection('Mileage', <div className="inventory-filter-option-list">{[
        { label: 'Under 25,000', min: undefined, max: 24999, key: 'miles:under' },
        { label: '25,000 – 50,000', min: 25000, max: 50000, key: 'miles:25-50' },
        { label: '50,000 – 100,000', min: 50001, max: 100000, key: 'miles:50-100' },
        { label: 'Over 100,000', min: 100001, max: undefined, key: 'miles:over' },
      ].map(({ label, min, max, key }) => checkOption(label, mileageMin === min && mileageMax === max, () => {
        const selected = mileageMin === min && mileageMax === max
        filterChange(setMileageMin, selected ? undefined : min)
        filterChange(setMileageMax, selected ? undefined : max)
      }, filterCounts[key] ?? 0))}</div>)}
      {filterSection('Year', <div className="inventory-filter-option-list">{years.map((item) => checkOption(String(item), yearFrom === item, () => filterChange(setYearFrom, yearFrom === item ? undefined : item), filterCounts[`year:${item}`] ?? 0))}</div>)}
      {filterSection('Drivetrain', <div className="inventory-filter-option-list">{drivetrains.map((item) => checkOption(item, drivetrain === item, () => filterChange(setDrivetrain, drivetrain === item ? '' : item), filterCounts[`drive:${item}`] ?? 0))}</div>)}
      {filterSection('Transmission', <div className="inventory-filter-option-list">{transmissions.map((item) => checkOption(item, transmission === item, () => filterChange(setTransmission, transmission === item ? '' : item), filterCounts[`transmission:${item}`] ?? 0))}</div>)}
      {filterSection('Exterior Color', <div className="inventory-filter-option-list">{['White', 'Black', 'Silver', 'Gray', 'Blue', 'Red', 'Other'].map((item) => {
        const colorMap: Record<string, string> = { White: '#fff', Black: '#252A2E', Silver: '#b8b8b8', Gray: '#858585', Blue: '#1455a5', Red: '#d71920' }
        const needle = item === 'Gray' ? 'grey' : item.toLowerCase()
        const vehicleColor = colors.find((available) => available.toLowerCase().includes(needle)) ?? item
        return checkOption(item, color === vehicleColor, () => filterChange(setColor, color === vehicleColor ? '' : vehicleColor), filterCounts[`color:${item}`] ?? 0, colorMap[item])
      })}</div>)}
    </div>
  </div>

  return <>
    <Seo title="Used Cars in Norfolk, NE" description="Browse used cars, SUVs, trucks, and crossovers at Osborne Motors in Norfolk, NE." />
    <section className="inventory-page">
      <div className="inventory-page__inner">
        <header className="inventory-intro">
          <h1><span>Quality Used Vehicles</span><span>in Norfolk</span></h1>
          <p className="inventory-intro__copy">Take a look at our current inventory. We offer a great selection of quality used cars, trucks, and SUVs at fair prices. Can’t find what you’re looking for? Give us a call; we may have additional vehicles arriving soon.</p>
        </header>

        <div className="inventory-filter-bar" aria-label="Search and filter inventory">
          <label className="inventory-filter-field inventory-filter-field--search">
            <span>Keyword</span>
            <span className="inventory-filter-field__control inventory-filter-field__control--search">
              <input value={search} onChange={(event) => filterChange(setSearch, event.target.value)} placeholder="Search by make, model, or keyword..." aria-label="Search by make, model, or keyword" />
              {search ? <button type="button" aria-label="Clear search" onClick={() => filterChange(setSearch, '')}><FaTimes aria-hidden="true" /></button> : <FaSearch aria-hidden="true" />}
            </span>
          </label>
          <label className="inventory-filter-field">
            <span>Make</span>
            <span className="inventory-filter-field__control"><select value={make} onChange={(event) => { filterChange(setMake, event.target.value); setModel('') }}><option value="">All Makes</option>{makes.map((item) => <option key={item}>{item}</option>)}</select><FaChevronDown aria-hidden="true" /></span>
          </label>
          <label className="inventory-filter-field">
            <span>Body Style</span>
            <span className="inventory-filter-field__control"><select value={bodyType} onChange={(event) => filterChange(setBodyType, event.target.value)}><option value="">All Body Styles</option>{bodyTypes.map((item) => <option key={item}>{item}</option>)}</select><FaChevronDown aria-hidden="true" /></span>
          </label>
          <label className="inventory-filter-field">
            <span>Price Range</span>
            <span className="inventory-filter-field__control"><select value={selectedPriceRange} onChange={(event) => {
              const range = priceRanges.find(({ value }) => value === event.target.value)
              filterChange(setPriceMin, range?.min)
              filterChange(setPriceMax, range?.max)
            }}><option value="">Any Price</option>{priceRanges.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}</select><FaChevronDown aria-hidden="true" /></span>
          </label>
          <button type="button" className="inventory-more-filters" aria-expanded={filtersOpen} aria-controls="inventory-filters" onClick={() => setFiltersOpen((open) => !open)}>
            <FaSlidersH aria-hidden="true" /><span>More Filters</span>{activeAdvancedFilterCount ? <b>{activeAdvancedFilterCount}</b> : null}
          </button>
        </div>
        {filtersOpen ? advancedFilters : null}

        <div ref={resultsRef} className="inventory-results" id="inventory-results">
          <div className="inventory-results__toolbar">
            <nav className="inventory-category-tabs" aria-label="Vehicle categories" role="tablist">
              <button type="button" role="tab" aria-selected={!bodyType} className={!bodyType ? 'is-active' : ''} onClick={() => filterChange(setBodyType, '')}>All Vehicles <span>({total})</span></button>
              {orderedBodyTypes.map((item) => <button key={item} type="button" role="tab" aria-selected={bodyType === item} className={bodyType === item ? 'is-active' : ''} onClick={() => filterChange(setBodyType, bodyType === item ? '' : item)}>{item}s <span>({filterCounts[`body:${item}`] ?? 0})</span></button>)}
            </nav>
            <label className="inventory-sort">
              <span>Sort By</span>
              <span className="inventory-sort__control"><select value={sort} onChange={(event) => filterChange(setSort, event.target.value as SortKey)}><option value="year">Newest First</option><option value="price-low">Price Low–High</option><option value="price-high">Price High–Low</option><option value="mileage">Lowest Mileage</option></select><FaChevronDown aria-hidden="true" /></span>
            </label>
          </div>

          <div className="inventory-vehicle-grid">
            {loading ? Array.from({ length: PAGE_SIZE }, (_, index) => <InventoryCardSkeleton key={index} />)
              : inventoryError ? <p className="inventory-state inventory-state--error">Inventory is temporarily unavailable. Please try again later or call us for current vehicles.</p>
                : items.length ? items.map((vehicle) => <InventoryVehicleCard key={vehicle.id} vehicle={vehicle} />)
                  : <p className="inventory-state">Vehicle listings are coming soon. Call Osborne Motors for current vehicle information.</p>}
          </div>

          {!loading && totalPages > 1 ? <nav className="inventory-pagination" aria-label="Inventory pages">
            <div className="inventory-pagination__pages">
              <button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => goToPage(page - 1)}><FaChevronLeft aria-hidden="true" /></button>
              {pageNumbers.map((pageNumber) => <button key={pageNumber} type="button" aria-label={`Page ${pageNumber}`} aria-current={pageNumber === page ? 'page' : undefined} className={pageNumber === page ? 'is-active' : ''} onClick={() => goToPage(pageNumber)}>{pageNumber}</button>)}
              <button type="button" aria-label="Next page" disabled={page === totalPages} onClick={() => goToPage(page + 1)}><FaChevronRight aria-hidden="true" /></button>
            </div>
            <p>Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, total)} of {total} vehicles</p>
          </nav> : null}
        </div>
      </div>
    </section>
  </>
}
