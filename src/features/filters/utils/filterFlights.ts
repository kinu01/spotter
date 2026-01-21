import type { Flight } from '@/shared/types/api.types'
import type { FilterState, FilterOptions } from '../filter.types'

export function filterFlights(flights: Flight[], filters: FilterState): Flight[] {
  return flights.filter((flight) => {
    // Filter by stops
    if (filters.stops.length > 0 && !filters.stops.includes(flight.stops)) {
      return false
    }

    // Filter by price range
    if (filters.priceRange) {
      const [min, max] = filters.priceRange
      if (flight.price < min || flight.price > max) {
        return false
      }
    }

    // Filter by airlines
    if (filters.airlines.length > 0 && !filters.airlines.includes(flight.airlineCode)) {
      return false
    }

    return true
  })
}

export function deriveFilterOptions(
  flights: Flight[],
  carriers: Record<string, string>
): FilterOptions {
  // Derive stops options
  const stopsCounts = new Map<number, number>()
  let minPrice = Infinity
  let maxPrice = -Infinity
  const airlineCounts = new Map<string, number>()

  for (const flight of flights) {
    // Count stops
    const currentStopsCount = stopsCounts.get(flight.stops) || 0
    stopsCounts.set(flight.stops, currentStopsCount + 1)

    // Track price range
    if (flight.price < minPrice) minPrice = flight.price
    if (flight.price > maxPrice) maxPrice = flight.price

    // Count airlines
    const currentAirlineCount = airlineCounts.get(flight.airlineCode) || 0
    airlineCounts.set(flight.airlineCode, currentAirlineCount + 1)
  }

  // Build stops options
  const stopsOptions = Array.from(stopsCounts.entries())
    .sort(([a], [b]) => a - b)
    .map(([value, count]) => ({
      value,
      label: value === 0 ? 'Nonstop' : value === 1 ? '1 stop' : `${value} stops`,
      count,
    }))

  // Build airlines options
  const airlines = Array.from(airlineCounts.entries())
    .map(([code, count]) => ({
      code,
      name: carriers[code] || code,
      count,
    }))
    .sort((a, b) => b.count - a.count)

  return {
    stopsOptions,
    priceRange: {
      min: minPrice === Infinity ? 0 : Math.floor(minPrice),
      max: maxPrice === -Infinity ? 1000 : Math.ceil(maxPrice),
    },
    airlines,
  }
}
