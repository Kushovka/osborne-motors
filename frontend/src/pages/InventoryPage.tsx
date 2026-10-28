import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useSearchParams } from 'react-router'
import { FaChevronDown, FaChevronLeft, FaChevronRight, FaSearch, FaSlidersH, FaTimes } from 'react-icons/fa'
import { getVehicleFilters, listVehicles } from '../api/vehicles'
import { Seo } from '../components/Seo'
import { InventoryVehicleCard } from '../components/InventoryVehicleCard'
import type { Vehicle } from '../types/vehicle'

type SortKey = 'price-low' | 'price-high' | 'year' | 'mileage'
const DEFAULT_PAGE_SIZE = 9
const queryNumber = (value: string | null) => {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined
}

const priceSteps = [10000, 15000, 20000, 25000, 30000, 40000, 50000, 60000, 80000, 100000]

const InventoryCardSkeleton = () => <div className="inventory-vehicle-card inventory-vehicle-card--reference inventory-vehicle-card--skeleton" aria-hidden="true">
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
  const searchParamsKey = searchParams.toString()
  const resultsRef = useRef<HTMLDivElement | null>(null)
  const [appliedSearchParamsKey, setAppliedSearchParamsKey] = useState(searchParamsKey)
  const [make, setMake] = useState(() => searchParams.get('make') ?? '')
  const [model, setModel] = useState(() => searchParams.get('model') ?? '')
  const [yearFrom, setYearFrom] = useState<number | undefined>(() => queryNumber(searchParams.get('yearFrom')))
  const [yearTo, setYearTo] = useState<number | undefined>(() => queryNumber(searchParams.get('yearTo')))
  const [priceMin, setPriceMin] = useState<number | undefined>(() => queryNumber(searchParams.get('priceMin')))
  const [priceMax, setPriceMax] = useState<number | undefined>(() => queryNumber(searchParams.get('priceMax')))
  const [mileageMin, setMileageMin] = useState<number | undefined>()
  const [mileageMax, setMileageMax] = useState<number | undefined>()
  const [bodyType, setBodyType] = useState(() => searchParams.get('bodyType') ?? '')
  const [color, setColor] = useState('')
  const [transmission, setTransmission] = useState('')
  const [drivetrain, setDrivetrain] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('price-high')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
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

  if (appliedSearchParamsKey !== searchParamsKey) {
    setAppliedSearchParamsKey(searchParamsKey)
    setSearch(searchParams.get('q') ?? '')
    setBodyType(searchParams.get('bodyType') ?? '')
    setYearFrom(queryNumber(searchParams.get('yearFrom')))
    setYearTo(queryNumber(searchParams.get('yearTo')))
    setPage(1)
  }

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
    listVehicles({ make, model, q: search, yearFrom, yearTo, bodyType, transmission, drivetrain, color, priceMin, priceMax, mileageMin, mileageMax, page, pageSize, sort: sort === 'price-low' ? 'price_asc' : sort === 'price-high' ? 'price_desc' : sort === 'mileage' ? 'mileage_asc' : 'year_desc' })
      .then((response) => { if (!cancelled) { setItems(response.items); setTotal(response.total); setInventoryError(false) } })
      .catch(() => { if (!cancelled) { setItems([]); setTotal(0); setInventoryError(true) } })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [bodyType, color, drivetrain, make, mileageMax, mileageMin, model, page, pageSize, priceMax, priceMin, search, sort, transmission, yearFrom, yearTo])

  const resetFilters = () => {
    setPage(1)
    setMake('')
    setModel('')
    setSearch('')
    setYearFrom(undefined)
    setYearTo(undefined)
    setPriceMin(undefined)
    setPriceMax(undefined)
    setMileageMin(undefined)
    setMileageMax(undefined)
    setBodyType('')
    setColor('')
    setTransmission('')
    setDrivetrain('')
  }
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)
  const goToPage = (nextPage: number) => {
    setPage(Math.min(totalPages, Math.max(1, nextPage)))
    window.setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
  }
  const filterChange = <T,>(setter: (value: T) => void, value: T) => { setPage(1); setter(value) }
  const quickBodyTypes = [...bodyTypes].sort((a, b) => {
    const rank = (value: string) => /truck/i.test(value) ? 0 : /suv/i.test(value) ? 1 : 2
    return rank(a) - rank(b) || a.localeCompare(b)
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

  const advancedFilters = <div id="inventory-filters" className="inventory-sidebar-extra">
    <div className="inventory-advanced-filters__heading">
      <h3>Additional filters</h3>
      <button id="inventory-clear-filters" type="button" onClick={resetFilters}>Clear all filters</button>
    </div>
    <div className="inventory-sidebar-extra__grid">
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
    <div className="inventory-titlebar">
      <h1>Inventory</h1>
    </div>
    <section className="inventory-page inventory-page--reference">
      <div className="inventory-page__inner">
        <button type="button" className="inventory-mobile-filters" aria-expanded={filtersOpen} aria-controls="inventory-sidebar" onClick={() => setFiltersOpen((open) => !open)}>
          <FaSlidersH aria-hidden="true" /> Refine Results <FaChevronDown aria-hidden="true" />
        </button>
        <div className="inventory-layout">
          <aside id="inventory-sidebar" className={`inventory-sidebar${filtersOpen ? ' is-open' : ''}`} aria-label="Inventory filters">
            <div className="inventory-sidebar__heading"><h2>Refine Results</h2><button type="button" onClick={resetFilters}>Clear</button></div>
            <div className="inventory-sidebar__content">
              <label className="inventory-sidebar__field">Body Style
                <span className="inventory-sidebar__select"><select value={bodyType} onChange={(event) => filterChange(setBodyType, event.target.value)}><option value="">All Body Styles</option>{bodyTypes.map((item) => <option key={item} value={item}>{item}</option>)}</select><FaChevronDown aria-hidden="true" /></span>
              </label>
              <label className="inventory-sidebar__field">Make
                <span className="inventory-sidebar__select"><select value={make} onChange={(event) => { filterChange(setMake, event.target.value); setModel('') }}><option value="">All Makes</option>{makes.map((item) => <option key={item}>{item}</option>)}</select><FaChevronDown aria-hidden="true" /></span>
              </label>
              <label className="inventory-sidebar__field">Model
                <span className="inventory-sidebar__select"><select value={model} onChange={(event) => filterChange(setModel, event.target.value)}><option value="">All Models</option>{models.map((item) => <option key={item}>{item}</option>)}</select><FaChevronDown aria-hidden="true" /></span>
              </label>
              <label className="inventory-sidebar__field inventory-sidebar__search">
                <span>Search</span>
                <span className="inventory-sidebar__input"><input value={search} onChange={(event) => filterChange(setSearch, event.target.value)} placeholder="Make, model, or keyword" aria-label="Search inventory" />{search ? <button type="button" aria-label="Clear search" onClick={() => filterChange(setSearch, '')}><FaTimes aria-hidden="true" /></button> : <FaSearch aria-hidden="true" />}</span>
              </label>
              <fieldset className="inventory-sidebar__range">
                <legend>Year</legend>
                <label><span className="sr-only">Year from</span><select value={yearFrom ?? ''} onChange={(event) => filterChange(setYearFrom, event.target.value ? Number(event.target.value) : undefined)}><option value="">Any</option>{years.map((item) => <option key={item} value={item}>{item}</option>)}</select><FaChevronDown aria-hidden="true" /></label>
                <span>to</span>
                <label><span className="sr-only">Year to</span><select value={yearTo ?? ''} onChange={(event) => filterChange(setYearTo, event.target.value ? Number(event.target.value) : undefined)}><option value="">Any</option>{years.map((item) => <option key={item} value={item}>{item}</option>)}</select><FaChevronDown aria-hidden="true" /></label>
              </fieldset>
              <fieldset className="inventory-sidebar__range">
                <legend>Price</legend>
                <label><span className="sr-only">Minimum price</span><select value={priceMin ?? ''} onChange={(event) => filterChange(setPriceMin, event.target.value ? Number(event.target.value) : undefined)}><option value="">Any</option>{priceSteps.map((value) => <option key={value} value={value}>${value.toLocaleString()}</option>)}</select><FaChevronDown aria-hidden="true" /></label>
                <span>to</span>
                <label><span className="sr-only">Maximum price</span><select value={priceMax ?? ''} onChange={(event) => filterChange(setPriceMax, event.target.value ? Number(event.target.value) : undefined)}><option value="">Any</option>{priceSteps.map((value) => <option key={value} value={value}>${value.toLocaleString()}</option>)}</select><FaChevronDown aria-hidden="true" /></label>
              </fieldset>
              <label className="inventory-sidebar__field">Drivetrain
                <span className="inventory-sidebar__select"><select value={drivetrain} onChange={(event) => filterChange(setDrivetrain, event.target.value)}><option value="">All Drivetrains</option>{drivetrains.map((item) => <option key={item}>{item}</option>)}</select><FaChevronDown aria-hidden="true" /></span>
              </label>
              {advancedFilters}
              <button type="button" className="inventory-sidebar__apply" onClick={() => { setPage(1); setFiltersOpen(false); resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}>Apply Filters</button>
              <div className="inventory-sidebar__quick-links">
                <h3>Quick Links</h3>
                <button type="button" onClick={resetFilters}>View All Inventory</button>
                {quickBodyTypes.map((item) => <button key={item} type="button" onClick={() => filterChange(setBodyType, item)}>{/truck/i.test(item) ? 'Trucks' : /suv/i.test(item) ? 'SUVs' : `${item}s`}</button>)}
                <button type="button" onClick={() => { filterChange(setPriceMin, undefined); filterChange(setPriceMax, 19999) }}>Under $20,000</button>
                <button type="button" onClick={() => { filterChange(setPriceMin, undefined); filterChange(setPriceMax, 29999) }}>Under $30,000</button>
              </div>
            </div>
          </aside>

          <main className="inventory-results-column" ref={resultsRef} id="inventory-results">
            <div className="inventory-results__toolbar">
              <p className="inventory-results__count"><strong>{total}</strong> Vehicles Found</p>
              <div className="inventory-results__controls">
                <label className="inventory-sort"><span>Sort By:</span><span className="inventory-sort__control"><select value={sort} onChange={(event) => filterChange(setSort, event.target.value as SortKey)}><option value="price-high">Price: High to Low</option><option value="price-low">Price: Low to High</option><option value="year">Year: Newest First</option><option value="mileage">Mileage: Low to High</option></select><FaChevronDown aria-hidden="true" /></span></label>
                <label className="inventory-show-count"><span>Show:</span><span className="inventory-sort__control"><select value={pageSize} onChange={(event) => filterChange(setPageSize, Number(event.target.value))}><option value={9}>9 per page</option><option value={18}>18 per page</option><option value={27}>27 per page</option></select><FaChevronDown aria-hidden="true" /></span></label>
              </div>
            </div>
            <div className="inventory-vehicle-grid">
              {loading ? Array.from({ length: pageSize }, (_, index) => <InventoryCardSkeleton key={index} />)
                : inventoryError ? <p className="inventory-state inventory-state--error">Inventory is temporarily unavailable. Please try again later or call us for current vehicles.</p>
                  : items.length ? items.map((vehicle) => <InventoryVehicleCard key={vehicle.id} vehicle={vehicle} variant="inventory" />)
                    : <div className="inventory-state"><strong>No vehicles match these filters.</strong><button type="button" onClick={resetFilters}>Clear filters and view all inventory</button></div>}
            </div>
            {!loading && total > 0 ? <div className="inventory-pagination-row">
              <p>Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, total)} of {total} vehicles</p>
              {totalPages > 1 ? <nav className="inventory-pagination" aria-label="Inventory pages"><div className="inventory-pagination__pages">
                <button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => goToPage(page - 1)}><FaChevronLeft aria-hidden="true" /></button>
                {pageNumbers.map((pageNumber) => <button key={pageNumber} type="button" aria-label={`Page ${pageNumber}`} aria-current={pageNumber === page ? 'page' : undefined} className={pageNumber === page ? 'is-active' : ''} onClick={() => goToPage(pageNumber)}>{pageNumber}</button>)}
                <button type="button" aria-label="Next page" disabled={page === totalPages} onClick={() => goToPage(page + 1)}>Next <FaChevronRight aria-hidden="true" /></button>
              </div></nav> : null}
            </div> : null}
          </main>
        </div>
      </div>
    </section>
  </>
}
