import { describe, it, expect } from 'vitest'
import { filterFlights, deriveFilterOptions } from '../filterFlights'
import type { Flight } from '@/shared/types/api.types'
import type { FilterState } from '../../filter.types'

// Mock flight data
const mockFlights: Flight[] = [
  {
    id: '1',
    price: 200,
    currency: 'USD',
    airline: 'Delta',
    airlineCode: 'DL',
    departure: { airport: 'JFK', time: '08:00', date: '2024-01-20' },
    arrival: { airport: 'LAX', time: '11:00', date: '2024-01-20' },
    duration: '5h 00m',
    durationMinutes: 300,
    stops: 0,
    stopLocations: [],
    segments: [],
    cabin: 'ECONOMY',
    seatsAvailable: 5,
  },
  {
    id: '2',
    price: 150,
    currency: 'USD',
    airline: 'United',
    airlineCode: 'UA',
    departure: { airport: 'JFK', time: '10:00', date: '2024-01-20' },
    arrival: { airport: 'LAX', time: '14:30', date: '2024-01-20' },
    duration: '6h 30m',
    durationMinutes: 390,
    stops: 1,
    stopLocations: ['DEN'],
    segments: [],
    cabin: 'ECONOMY',
    seatsAvailable: 3,
  },
  {
    id: '3',
    price: 350,
    currency: 'USD',
    airline: 'American',
    airlineCode: 'AA',
    departure: { airport: 'JFK', time: '06:00', date: '2024-01-20' },
    arrival: { airport: 'LAX', time: '09:00', date: '2024-01-20' },
    duration: '5h 00m',
    durationMinutes: 300,
    stops: 0,
    stopLocations: [],
    segments: [],
    cabin: 'ECONOMY',
    seatsAvailable: 8,
  },
]

const defaultFilters: FilterState = {
  stops: [],
  priceRange: null,
  airlines: [],
  sortBy: 'price',
  quickFilter: 'all',
}

describe('filterFlights', () => {
  describe('stops filter', () => {
    it('returns all flights when no stops filter', () => {
      const result = filterFlights(mockFlights, defaultFilters)
      expect(result).toHaveLength(3)
    })

    it('filters by nonstop only', () => {
      const result = filterFlights(mockFlights, { ...defaultFilters, stops: [0] })
      expect(result).toHaveLength(2)
      expect(result.every((f) => f.stops === 0)).toBe(true)
    })

    it('filters by 1 stop only', () => {
      const result = filterFlights(mockFlights, { ...defaultFilters, stops: [1] })
      expect(result).toHaveLength(1)
      expect(result[0].airlineCode).toBe('UA')
    })
  })

  describe('price filter', () => {
    it('filters by price range', () => {
      const result = filterFlights(mockFlights, {
        ...defaultFilters,
        priceRange: [100, 250],
      })
      expect(result).toHaveLength(2)
      expect(result.every((f) => f.price >= 100 && f.price <= 250)).toBe(true)
    })
  })

  describe('airline filter', () => {
    it('filters by airline', () => {
      const result = filterFlights(mockFlights, {
        ...defaultFilters,
        airlines: ['DL'],
      })
      expect(result).toHaveLength(1)
      expect(result[0].airline).toBe('Delta')
    })

    it('filters by multiple airlines', () => {
      const result = filterFlights(mockFlights, {
        ...defaultFilters,
        airlines: ['DL', 'UA'],
      })
      expect(result).toHaveLength(2)
    })
  })

  describe('sorting', () => {
    it('sorts by price (default)', () => {
      const result = filterFlights(mockFlights, defaultFilters)
      expect(result[0].price).toBe(150)
      expect(result[1].price).toBe(200)
      expect(result[2].price).toBe(350)
    })

    it('sorts by duration', () => {
      const result = filterFlights(mockFlights, { ...defaultFilters, sortBy: 'duration' })
      expect(result[0].durationMinutes).toBe(300)
      expect(result[2].durationMinutes).toBe(390)
    })

    it('sorts by departure time', () => {
      const result = filterFlights(mockFlights, { ...defaultFilters, sortBy: 'departure' })
      expect(result[0].departure.time).toBe('06:00')
      expect(result[1].departure.time).toBe('08:00')
      expect(result[2].departure.time).toBe('10:00')
    })
  })

  describe('quick filters', () => {
    it('cheapest returns flights within 10% of min price', () => {
      const result = filterFlights(mockFlights, { ...defaultFilters, quickFilter: 'cheapest' })
      // Min price is 150, 10% = 165, so only UA ($150) qualifies
      expect(result).toHaveLength(1)
      expect(result[0].price).toBe(150)
    })

    it('fastest returns flights within 30 min of fastest', () => {
      const result = filterFlights(mockFlights, { ...defaultFilters, quickFilter: 'fastest' })
      // Min duration is 300, threshold is 330, so DL and AA qualify
      expect(result).toHaveLength(2)
      expect(result.every((f) => f.durationMinutes <= 330)).toBe(true)
    })
  })
})

describe('deriveFilterOptions', () => {
  const carriers = { DL: 'Delta', UA: 'United', AA: 'American' }

  it('derives stops options', () => {
    const options = deriveFilterOptions(mockFlights, carriers)
    expect(options.stopsOptions).toHaveLength(2)
    expect(options.stopsOptions[0]).toEqual({ value: 0, label: 'Nonstop', count: 2 })
    expect(options.stopsOptions[1]).toEqual({ value: 1, label: '1 stop', count: 1 })
  })

  it('derives price range', () => {
    const options = deriveFilterOptions(mockFlights, carriers)
    expect(options.priceRange.min).toBe(150)
    expect(options.priceRange.max).toBe(350)
  })

  it('derives airline options sorted by count', () => {
    const options = deriveFilterOptions(mockFlights, carriers)
    expect(options.airlines).toHaveLength(3)
    expect(options.airlines.every((a) => a.count === 1)).toBe(true)
  })

  it('handles empty flights array', () => {
    const options = deriveFilterOptions([], carriers)
    expect(options.stopsOptions).toHaveLength(0)
    expect(options.priceRange).toEqual({ min: 0, max: 1000 })
    expect(options.airlines).toHaveLength(0)
  })
})
