import { useState, useCallback } from 'react'
import { searchFlights, type FlightSearchResult } from '../services/flightService'
import type { FlightSearchParams, Flight } from '@/shared/types/api.types'

interface UseFlightSearchResult {
  flights: Flight[]
  carriers: Record<string, string>
  isLoading: boolean
  error: string | null
  hasSearched: boolean
  search: (params: FlightSearchParams) => Promise<void>
  reset: () => void
}

export function useFlightSearch(): UseFlightSearchResult {
  const [flights, setFlights] = useState<Flight[]>([])
  const [carriers, setCarriers] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const search = useCallback(async (params: FlightSearchParams) => {
    setIsLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      const result: FlightSearchResult = await searchFlights(params)
      setFlights(result.flights)
      setCarriers(result.carriers)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to search flights'
      setError(message)
      setFlights([])
      setCarriers({})
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setFlights([])
    setCarriers({})
    setError(null)
    setHasSearched(false)
  }, [])

  return {
    flights,
    carriers,
    isLoading,
    error,
    hasSearched,
    search,
    reset,
  }
}
