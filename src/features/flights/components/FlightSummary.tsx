import type { Flight } from '@/shared/types/api.types'
import { formatPrice } from '@/shared/utils/format'

interface FlightSummaryProps {
  flights: Flight[]
  totalCount: number
}

export function FlightSummary({ flights, totalCount }: FlightSummaryProps) {
  if (flights.length === 0) return null

  const minPrice = Math.min(...flights.map((f) => f.price))
  const currency = flights[0].currency

  const nonStopCount = flights.filter((f) => f.stops === 0).length
  const oneStopCount = flights.filter((f) => f.stops === 1).length
  const multiStopCount = flights.filter((f) => f.stops > 1).length

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 mb-4">
      <span className="font-medium text-gray-900">
        {flights.length === totalCount
          ? `${flights.length} flights`
          : `${flights.length} of ${totalCount} flights`}
      </span>

      <span>
        From <span className="font-medium text-gray-900">{formatPrice(minPrice, currency)}</span>
      </span>

      <div className="flex items-center gap-4">
        {nonStopCount > 0 && (
          <span className="text-green-600">{nonStopCount} nonstop</span>
        )}
        {oneStopCount > 0 && <span>{oneStopCount} with 1 stop</span>}
        {multiStopCount > 0 && <span>{multiStopCount} with 2+ stops</span>}
      </div>
    </div>
  )
}
