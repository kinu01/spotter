import type { Flight } from '@/shared/types/api.types'
import type { FilterState, FilterOptions, SortOption, QuickFilter } from '../filter.types'

export function filterFlights(flights: Flight[], filters: FilterState): Flight[] {
  let result = flights.filter((flight) => {
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

  // Apply quick filter
  result = applyQuickFilter(result, filters.quickFilter)

  // Apply sorting
  result = sortFlights(result, filters.sortBy)

  return result
}

function applyQuickFilter(flights: Flight[], quickFilter: QuickFilter): Flight[] {
  if (quickFilter === 'all' || flights.length === 0) {
    return flights
  }

  if (quickFilter === 'cheapest') {
    // Return flights within 10% of the cheapest price
    const minPrice = Math.min(...flights.map((f) => f.price))
    const threshold = minPrice * 1.1
    return flights.filter((f) => f.price <= threshold)
  }

  if (quickFilter === 'fastest') {
    // Return flights within 30 minutes of the fastest
    const minDuration = Math.min(...flights.map((f) => f.durationMinutes))
    const threshold = minDuration + 30
    return flights.filter((f) => f.durationMinutes <= threshold)
  }

  if (quickFilter === 'best') {
    // Best = balance of price and duration (score-based)
    const minPrice = Math.min(...flights.map((f) => f.price))
    const maxPrice = Math.max(...flights.map((f) => f.price))
    const minDuration = Math.min(...flights.map((f) => f.durationMinutes))
    const maxDuration = Math.max(...flights.map((f) => f.durationMinutes))

    const priceRange = maxPrice - minPrice || 1
    const durationRange = maxDuration - minDuration || 1

    const scored = flights.map((f) => ({
      flight: f,
      score:
        ((f.price - minPrice) / priceRange) * 0.6 +
        ((f.durationMinutes - minDuration) / durationRange) * 0.4,
    }))

    scored.sort((a, b) => a.score - b.score)

    // Return top 30% or at least 5 flights
    const count = Math.max(5, Math.ceil(flights.length * 0.3))
    return scored.slice(0, count).map((s) => s.flight)
  }

  return flights
}

function sortFlights(flights: Flight[], sortBy: SortOption): Flight[] {
  const sorted = [...flights]

  switch (sortBy) {
    case 'price':
      sorted.sort((a, b) => a.price - b.price)
      break
    case 'duration':
      sorted.sort((a, b) => a.durationMinutes - b.durationMinutes)
      break
    case 'departure':
      sorted.sort((a, b) => a.departure.time.localeCompare(b.departure.time))
      break
    case 'arrival':
      sorted.sort((a, b) => a.arrival.time.localeCompare(b.arrival.time))
      break
  }

  return sorted
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
