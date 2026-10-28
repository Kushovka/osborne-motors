const SkeletonBlock = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse rounded-md bg-[var(--color-border)] ${className}`} />
)

export const VehicleCardSkeleton = () => (
  <div className="flex h-full min-h-[486px] flex-col overflow-hidden rounded-md border border-[rgba(255,255,255,0.08)] bg-[#252A2E]">
    <SkeletonBlock className="h-64 w-full rounded-none" />
    <div className="flex flex-1 flex-col p-5">
      <SkeletonBlock className="h-4 w-28" />
      <SkeletonBlock className="mt-4 h-7 w-56" />
      <SkeletonBlock className="mt-3 h-4 w-24" />
      <SkeletonBlock className="mt-5 h-9 w-32" />
      <SkeletonBlock className="mt-5 h-4 w-52" />
      <div className="mt-auto grid gap-3 pt-6 sm:grid-cols-[1fr_auto]">
        <SkeletonBlock className="h-11" />
        <SkeletonBlock className="h-11 sm:w-28" />
      </div>
    </div>
  </div>
)

export const VehicleGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      <VehicleCardSkeleton key={index} />
    ))}
  </>
)

export const VehicleDetailSkeleton = () => (
  <section className="vehicle-detail-loading" aria-label="Loading vehicle details" aria-busy="true">
    <div className="vehicle-detail-loading__titlebar">
      <div className="vehicle-detail-loading__titlebar-inner vehicle-detail-container" aria-hidden="true">
        <SkeletonBlock className="vehicle-detail-loading__block vehicle-detail-loading__page-title" />
        <SkeletonBlock className="vehicle-detail-loading__block vehicle-detail-loading__back-link" />
      </div>
    </div>
    <div className="vehicle-detail-container vehicle-detail-loading__container" aria-hidden="true">
      <div className="vehicle-detail-loading__hero">
        <div className="vehicle-detail-loading__gallery">
          <div className="vehicle-detail-loading__thumbnails">
            {Array.from({ length: 6 }).map((_, index) => <SkeletonBlock key={index} className="vehicle-detail-loading__block" />)}
          </div>
          <SkeletonBlock className="vehicle-detail-loading__block vehicle-detail-loading__main-photo" />
        </div>
        <div className="vehicle-detail-loading__price-panel">
          <SkeletonBlock className="vehicle-detail-loading__block vehicle-detail-loading__vehicle-title" />
          <SkeletonBlock className="vehicle-detail-loading__block vehicle-detail-loading__price" />
          <div className="vehicle-detail-loading__facts">
            {Array.from({ length: 6 }).map((_, index) => (
              <div className="vehicle-detail-loading__fact" key={index}>
                <SkeletonBlock className="vehicle-detail-loading__block vehicle-detail-loading__fact-label" />
                <SkeletonBlock className="vehicle-detail-loading__block vehicle-detail-loading__fact-value" />
              </div>
            ))}
          </div>
          <div className="vehicle-detail-loading__actions">
            <SkeletonBlock className="vehicle-detail-loading__block" />
            <SkeletonBlock className="vehicle-detail-loading__block" />
          </div>
        </div>
      </div>
      <div className="vehicle-detail-loading__information">
        <div className="vehicle-detail-loading__info-panel">
          <SkeletonBlock className="vehicle-detail-loading__block vehicle-detail-loading__info-heading" />
          <SkeletonBlock className="vehicle-detail-loading__block vehicle-detail-loading__text-line" />
          <SkeletonBlock className="vehicle-detail-loading__block vehicle-detail-loading__text-line vehicle-detail-loading__text-line--short" />
        </div>
        <div className="vehicle-detail-loading__info-panel">
          <SkeletonBlock className="vehicle-detail-loading__block vehicle-detail-loading__info-heading" />
          <SkeletonBlock className="vehicle-detail-loading__block vehicle-detail-loading__text-line" />
          <SkeletonBlock className="vehicle-detail-loading__block vehicle-detail-loading__text-line vehicle-detail-loading__text-line--short" />
        </div>
        <div className="vehicle-detail-loading__info-panel">
          <SkeletonBlock className="vehicle-detail-loading__block vehicle-detail-loading__info-heading" />
          <SkeletonBlock className="vehicle-detail-loading__block vehicle-detail-loading__text-line" />
          <SkeletonBlock className="vehicle-detail-loading__block vehicle-detail-loading__text-line vehicle-detail-loading__text-line--short" />
          <SkeletonBlock className="vehicle-detail-loading__block vehicle-detail-loading__text-line" />
        </div>
      </div>
    </div>
  </section>
)

export const InventoryToolbarSkeleton = () => (
  <div className="mb-8 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#252A2E] p-4">
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
      <SkeletonBlock className="h-10" />
      <SkeletonBlock className="h-10" />
      <SkeletonBlock className="h-10 md:col-span-2" />
      <SkeletonBlock className="h-10" />
      <SkeletonBlock className="h-10" />
      <SkeletonBlock className="h-10 md:col-span-2 lg:col-span-2" />
    </div>
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <SkeletonBlock className="h-10 w-full sm:w-40" />
      <SkeletonBlock className="h-10 w-full sm:w-28" />
    </div>
  </div>
)
