import type { Flight } from '@/shared/types/api.types'
import { FlightCard } from './FlightCard'
import { FlightListSkeleton, NoFlightsFound, SearchPrompt, ErrorState } from '@/shared'

interface FlightListProps {
  flights: Flight[]
  isLoading: boolean
  error: string | null
  hasSearched: boolean
  onRetry?: () => void
}

export function FlightList({
  flights,
  isLoading,
  error,
  hasSearched,
  onRetry,
}: FlightListProps) {
  if (isLoading) {
    return <FlightListSkeleton count={5} />
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />
  }

  if (!hasSearched) {
    return <SearchPrompt />
  }

  if (flights.length === 0) {
    return <NoFlightsFound />
  }

  return (
    <div className="space-y-4">
      {flights.map((flight) => (
        <FlightCard key={flight.id} flight={flight} />
      ))}
    </div>
  )
}
