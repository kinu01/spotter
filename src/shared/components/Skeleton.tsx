interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      aria-hidden="true"
    />
  )
}

export function FlightCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-center space-y-1">
            <Skeleton className="h-6 w-14 mx-auto" />
            <Skeleton className="h-4 w-10 mx-auto" />
          </div>
          <div className="flex-1 flex flex-col items-center">
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-0.5 w-24" />
            <Skeleton className="h-3 w-12 mt-1" />
          </div>
          <div className="text-center space-y-1">
            <Skeleton className="h-6 w-14 mx-auto" />
            <Skeleton className="h-4 w-10 mx-auto" />
          </div>
        </div>
        <div className="text-right">
          <Skeleton className="h-7 w-20 ml-auto" />
          <Skeleton className="h-4 w-16 ml-auto mt-1" />
        </div>
      </div>
    </div>
  )
}

export function FlightListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <FlightCardSkeleton key={i} />
      ))}
    </div>
  )
}
