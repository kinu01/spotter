import { useState, useMemo, useCallback } from 'react'
import type { Flight } from '@/shared/types/api.types'
import type { FilterState, FilterOptions } from '../filter.types'
import { DEFAULT_FILTERS } from '../filter.types'
import { filterFlights, deriveFilterOptions } from '../utils/filterFlights'

interface UseFlightFiltersResult {
  filteredFlights: Flight[]
  filters: FilterState
  options: FilterOptions
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void
  resetFilters: () => void
  hasActiveFilters: boolean
}

export function useFlightFilters(
  flights: Flight[],
  carriers: Record<string, string>
): UseFlightFiltersResult {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)

  // Derive available filter options from the raw flights
  const options = useMemo(
    () => deriveFilterOptions(flights, carriers),
    [flights, carriers]
  )

  // Apply filters to get filtered results
  const filteredFlights = useMemo(
    () => filterFlights(flights, filters),
    [flights, filters]
  )

  // Update a single filter
  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
  }, [])

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.stops.length > 0 ||
      filters.priceRange !== null ||
      filters.airlines.length > 0
    )
  }, [filters])

  return {
    filteredFlights,
    filters,
    options,
    updateFilter,
    resetFilters,
    hasActiveFilters,
  }
}
