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
  <section className="section soft-band">
    <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
      <div className="grid gap-3">
        <SkeletonBlock className="aspect-[4/3] w-full rounded-md" />
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-20 rounded-md" />
          ))}
        </div>
      </div>
      <div>
        <SkeletonBlock className="h-4 w-32" />
        <SkeletonBlock className="mt-4 h-10 w-4/5" />
        <SkeletonBlock className="mt-4 h-10 w-36" />
        <div className="mt-6 grid grid-cols-2 gap-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="surface-card rounded-md p-4">
              <SkeletonBlock className="h-3 w-20" />
              <SkeletonBlock className="mt-3 h-5 w-28" />
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <SkeletonBlock className="h-12 w-full sm:w-32" />
          <SkeletonBlock className="h-12 w-full sm:w-36" />
        </div>
        <SkeletonBlock className="mt-6 h-24 w-full" />
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
